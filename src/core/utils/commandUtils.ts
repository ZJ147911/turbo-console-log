import * as vscode from 'vscode';

import { isPhpFile } from '../../helpers';

/* eslint-disable @typescript-eslint/no-explicit-any -- 命令上下文类型需兼容多种处理器 */
/**
 * 命令处理上下文接口
 */
export interface CommandHandlerContext {
  jsDebugMessage: any;
  phpDebugMessage?: any;
  extensionProperties?: any;
}

/**
 * 处理日志消息的回调函数类型
 */
export type LogMessageHandler = (
  line: string,
  isPhpFile: boolean,
  extensionProperties?: any,
) => string | null;

/**
 * 处理文档中的日志消息
 * @param context 命令处理上下文
 * @param handler 日志消息处理函数
 * @param shouldFilter 是否需要过滤行
 */
export async function processLogMessages(
  context: CommandHandlerContext,
  handler: LogMessageHandler,
  shouldFilter: boolean = false,
): Promise<void> {
  const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document: vscode.TextDocument = editor.document;
  const text: string = document.getText();
  const isPhp = isPhpFile(document.fileName);

  // 处理每一行
  const lines = text.split('\n');
  let updatedLines: string[];

  if (shouldFilter) {
    // 过滤模式：只保留返回非null的行
    updatedLines = lines.filter((line) => {
      const result = handler(line, isPhp, context.extensionProperties);
      return result !== null;
    });
  } else {
    // 映射模式：替换返回非null的行
    updatedLines = lines.map((line) => {
      const result = handler(line, isPhp, context.extensionProperties);
      return result !== null ? result : line;
    });
  }

  // 更新文档
  await editor.edit((editBuilder) => {
    editBuilder.replace(
      new vscode.Range(0, 0, document.lineCount, 0),
      updatedLines.join('\n'),
    );
  });
}

/** 行首仅为注释则不算日志行（避免误匹配注释里的示例代码，如 // console.log('example')） */
function isCommentOnlyLine(trimmed: string, isPhp: boolean): boolean {
  return (
    trimmed.startsWith('//') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('/*') ||
    (isPhp && trimmed.startsWith('#'))
  );
}

/** JS/TS：精确匹配 console 的 log/debug/info/warn/error/table 调用，避免仅因包含 "console." 就命中 */
const JS_LOG_CALL = /console\.(log|debug|info|warn|error|table)\s*\(/;
/** PHP：精确匹配 error_log / var_dump / print_r 的调用 */
const PHP_LOG_CALL = /(error_log|var_dump|print_r)\s*\(/;

/**
 * 检查是否是日志消息行（精确匹配 log 调用，且排除纯注释行）
 * @param line 行内容
 * @param isPhp 是否是 PHP 文件
 * @returns 是否是日志消息行
 */
export function isLogMessageLine(line: string, isPhp: boolean): boolean {
  const trimmed = line.trim();
  if (trimmed.length === 0) return false;
  if (isCommentOnlyLine(trimmed, isPhp)) return false;

  return isPhp ? PHP_LOG_CALL.test(trimmed) : JS_LOG_CALL.test(trimmed);
}

/**
 * 检查是否是「被注释掉的」日志行并返回去掉注释后的整行（保留行首缩进）
 * @param line 行内容
 * @param isPhp 是否是 PHP 文件
 * @returns 若是则返回去掉 // 或 # 后的该行内容，否则返回 null
 */
export function getUncommentedLogLine(
  line: string,
  isPhp: boolean,
): string | null {
  const trimmed = line.trim();
  // 只处理以 // 或 PHP 的 # 开头的注释行
  const commentPrefix = trimmed.startsWith('//')
    ? '//'
    : isPhp && trimmed.startsWith('#')
      ? '#'
      : null;
  if (!commentPrefix) return null;
  const afterComment = trimmed.slice(commentPrefix.length).trim();
  if (afterComment.length === 0) return null;
  // 去掉注释后必须是合法的 log 调用，才视为“被注释的日志行”
  if (
    !(isPhp ? PHP_LOG_CALL.test(afterComment) : JS_LOG_CALL.test(afterComment))
  )
    return null;
  // 保留行首缩进，返回整行（仅去掉 // 或 # 及其后一个空格）
  const leadingSpaces = line.match(/^\s*/)?.[0] ?? '';
  return leadingSpaces + afterComment;
}
