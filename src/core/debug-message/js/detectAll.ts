import type { TextDocument } from 'vscode';
import { Message, ExtensionProperties, BracketType } from '../../../entities';
import { closingContextLine } from '../../utilities';
import { spacesBeforeLogMsg } from '../../../debug-message/js/JSDebugMessage/msg/spacesBeforeLogMsg';

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

  // 构建正则表达式模式以匹配任何日志函数调用（活动或已注释）
  const logFunctionPattern = knownLogFunctions
    .map((fn) => escapeRegex(fn))
    .join('|');

  // 匹配活动和已注释的日志：console.log(...) 或 // console.log(...)
  const logPattern = new RegExp(
    `(?://\s*)?(${logFunctionPattern})\s*\(`,
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
    // 阶段 1：快速预过滤 - 使用 fs 读取原始文件内容（廉价）
    const sourceCode = await fs.promises.readFile(filePath, 'utf8');

    if (!hasLogs(sourceCode, customLogFunction)) {
      return []; // 未找到日志 - 避免昂贵的 openTextDocument 调用！
    }

    // 阶段 2：找到日志！现在打开 VS Code 文档进行详细检测（昂贵）
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

    // 使用统一检测检测所有日志消息（活动和已注释）
    const messages = detectLogMessages(
      document,
      knownLogFunctions,
      logMessagePrefix,
      delimiterInsideMessage,
    );

    // 按行号排序
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

  // 活动日志的模式：console.log(...)
  const activeLogPattern = new RegExp(
    `^\s*(${knownLogFunctions.map(escapeRegex).join('|')})\b`,
  );

  // 已注释日志的模式：// console.log(...)
  const commentedLogPattern = new RegExp(
    `^\s*//\s*(${knownLogFunctions.map(escapeRegex).join('|')})\b`,
  );

  const prefixRegex = new RegExp(escapeRegex(logMessagePrefix));
  const delimiterRegex = new RegExp(escapeRegex(delimiterInsideMessage));

  for (let i = 0; i < documentNbrOfLines; i++) {
    const line = document.lineAt(i);
    const lineText = line.text.trim();

    // 检查行是否是已注释或活动的日志
    const isCommented = commentedLogPattern.test(lineText);
    const isActive = !isCommented && activeLogPattern.test(lineText);

    if (!isCommented && !isActive) continue;

    // 提取日志函数名称（例如，'console.log'，'console.warn'）
    let logFunctionMatch = null;
    if (isCommented) {
      logFunctionMatch = lineText.match(commentedLogPattern);
    } else {
      logFunctionMatch = lineText.match(activeLogPattern);
    }
    const logFunction = logFunctionMatch ? logFunctionMatch[1] : undefined;

    // 找到日志调用的右括号
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

    // 单行日志语句
    if (closedParenthesisLine === i) {
      const hasTurboMarkers = prefixRegex.test(lineText) && delimiterRegex.test(lineText);
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

    // 多行日志语句
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
