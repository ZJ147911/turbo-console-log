import type { TextDocument } from 'vscode';

import { Message, ExtensionProperties, BracketType } from '@/entities';
import { closingContextLine } from '@/utilities';

import { spacesBeforeLogMsg } from '../msg/spacesBeforeLogMsg';

/**
 * 转义字符串中的正则表达式特殊字符，使其可以安全地用于 RegExp
 * @param str 需要转义的字符串
 * @returns 转义后的字符串
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 使用纯正则表达式在源代码上进行快速检测，无需打开文档或解析 AST
 * 如果找到任何日志函数调用（包括 Turbo 和普通日志），则返回 true
 * 这是第 1 阶段 - 用于在昂贵操作之前进行快速过滤
 * @internal
 * @param sourceCode 源代码字符串
 * @param customLogFunction 自定义日志函数
 * @returns 是否找到日志函数调用
 */
function hasLogs(
  sourceCode: string,
  customLogFunction: ExtensionProperties['logFunction'],
): boolean {
  const knownLogFunctions = [
    'console.log',
    'console.info',
    'console.debug',
    'console.warn',
    'console.error',
    'console.table',
    customLogFunction,
  ];

  // Build regex pattern to match any log function call (active or commented)
  const logFunctionPattern = knownLogFunctions
    .map((fn) => escapeRegex(fn))
    .join('|');

  // Match both active and commented logs: console.log(...) or // console.log(...)
  const logPattern = new RegExp(
    `(?://\\s*)?(${logFunctionPattern})\\s*\\(`,
    'g',
  );

  return logPattern.test(sourceCode);
}

/**
 * 检测文件中的所有日志消息（包括 Turbo 插入的和普通的日志）
 * 使用两阶段优化：
 * 1. 在原始文件内容上进行快速正则表达式预过滤（fs.readFile - 廉价）
 * 2. 仅当找到日志时才打开 VS Code 文档（昂贵操作）
 * 为每条日志消息标记 isTurboConsoleLog 标志，以区分 Turbo 日志和普通日志
 * @param fs 文件系统模块
 * @param vscode VS Code 模块
 * @param filePath 文件路径
 * @param customLogFunction 自定义日志函数
 * @param logMessagePrefix 日志消息前缀
 * @param delimiterInsideMessage 消息内部的分隔符
 * @returns 检测到的消息数组
 */
export async function detectAll(
  fs: typeof import('fs'),
  vscode: typeof import('vscode'),
  filePath: string,
  customLogFunction: ExtensionProperties['logFunction'],
  logMessagePrefix: ExtensionProperties['logMessagePrefix'],
  delimiterInsideMessage: ExtensionProperties['delimiterInsideMessage'],
): Promise<Message[]> {
  try {
    // Stage 1: Fast prefilter - read raw file content with fs (cheap)
    const sourceCode = await fs.promises.readFile(filePath, 'utf8');

    if (!hasLogs(sourceCode, customLogFunction)) {
      return []; // No logs found - avoid expensive openTextDocument call!
    }

    // Stage 2: Logs found! Now open VS Code document for detailed detection (expensive)
    const uri = vscode.Uri.file(filePath);
    const document = await vscode.workspace.openTextDocument(uri);

    const knownLogFunctions = [
      'console.log',
      'console.info',
      'console.debug',
      'console.warn',
      'console.error',
      'console.table',
      customLogFunction,
    ];

    // Detect all log messages (both active and commented) using unified detection
    const messages = detectLogMessages(
      document,
      knownLogFunctions,
      logMessagePrefix,
      delimiterInsideMessage,
    );

    // Sort by line number
    messages.sort((a, b) => a.lines[0].start.line - b.lines[0].start.line);

    return messages;
  } catch (error) {
    console.error(
      `Failed to detect logs in file "${filePath}":`,
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

/**
 * 使用正则表达式模式匹配检测所有日志消息（活动和已注释，Turbo 和普通）
 * 对于此用例，这比 AST 解析快得多
 * 为每条消息标记 isTurboConsoleLog 标志，以区分 Turbo 日志和普通日志
 * @param document 文本文档
 * @param knownLogFunctions 已知的日志函数数组
 * @param logMessagePrefix 日志消息前缀
 * @param delimiterInsideMessage 消息内部的分隔符
 * @returns 检测到的消息数组
 */
function detectLogMessages(
  document: TextDocument,
  knownLogFunctions: string[],
  logMessagePrefix: string,
  delimiterInsideMessage: string,
): Message[] {
  const messages: Message[] = [];
  const documentNbrOfLines: number = document.lineCount;

  // Pattern for active logs: console.log(...)
  const activeLogPattern = new RegExp(
    `^\\s*(${knownLogFunctions.map(escapeRegex).join('|')})\\b`,
  );

  // Pattern for commented logs: // console.log(...)
  const commentedLogPattern = new RegExp(
    `^\\s*//\\s*(${knownLogFunctions.map(escapeRegex).join('|')})\\b`,
  );

  const prefixRegex = new RegExp(escapeRegex(logMessagePrefix));
  const delimiterRegex = new RegExp(escapeRegex(delimiterInsideMessage));

  for (let i = 0; i < documentNbrOfLines; i++) {
    const line = document.lineAt(i);
    const lineText = line.text.trim();

    // Check if line is a commented or active log
    const isCommented = commentedLogPattern.test(lineText);
    const isActive = !isCommented && activeLogPattern.test(lineText);

    if (!isCommented && !isActive) continue;

    // Extract the log function name (e.g., 'console.log', 'console.warn')
    let logFunctionMatch = null;
    if (isCommented) {
      logFunctionMatch = lineText.match(commentedLogPattern);
    } else {
      logFunctionMatch = lineText.match(activeLogPattern);
    }
    const logFunction = logFunctionMatch ? logFunctionMatch[1] : undefined;

    // Find the closing parenthesis for the log call
    const closedParenthesisLine = closingContextLine(
      document,
      i,
      BracketType.PARENTHESIS,
    );

    if (
      closedParenthesisLine === -1 ||
      closedParenthesisLine < i ||
      closedParenthesisLine >= documentNbrOfLines
    ) {
      continue;
    }

    // Single-line log statement
    if (closedParenthesisLine === i) {
      const hasTurboMarkers =
        prefixRegex.test(lineText) && delimiterRegex.test(lineText);
      const spaces = spacesBeforeLogMsg(document, i, closedParenthesisLine);
      messages.push({
        spaces,
        lines: [line.rangeIncludingLineBreak],
        ...(isCommented && { isCommented: true }),
        ...(logFunction && { logFunction }),
        isTurboConsoleLog: hasTurboMarkers,
      });
      continue;
    }

    // Multi-line log statement
    const logMessage: Message = {
      spaces: spacesBeforeLogMsg(document, i, closedParenthesisLine),
      lines: [],
      ...(isCommented && { isCommented: true }),
      ...(logFunction && { logFunction }),
    };

    let msg = '';
    for (let j = i; j <= closedParenthesisLine; j++) {
      msg += document.lineAt(j).text;
      logMessage.lines.push(document.lineAt(j).rangeIncludingLineBreak);
    }

    const hasTurboMarkers = prefixRegex.test(msg) && delimiterRegex.test(msg);
    logMessage.isTurboConsoleLog = hasTurboMarkers;

    messages.push(logMessage);
  }

  return messages;
}
