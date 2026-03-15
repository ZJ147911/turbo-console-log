import * as vscode from 'vscode';

import { isPhpFile } from '../../helpers';

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

/**
 * 检查是否是日志消息行
 * @param line 行内容
 * @param isPhp 是否是 PHP 文件
 * @returns 是否是日志消息行
 */
export function isLogMessageLine(line: string, isPhp: boolean): boolean {
  if (isPhp) {
    return (
      line.includes('error_log') ||
      line.includes('var_dump') ||
      line.includes('print_r')
    );
  } else {
    return line.includes('console.');
  }
}
