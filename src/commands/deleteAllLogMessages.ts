import * as fs from 'fs';
import * as vscode from 'vscode';

import { Command, Message } from '../entities';
import { canInsertLogInDocument } from '../helpers';

/**
 * 创建删除所有日志消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function deleteAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.deleteAllLogMessages',
    /**
     * 处理删除所有日志消息的命令
     * @param param0 命令参数
     * @param param0.extensionProperties 扩展配置属性
     * @param param0.debugMessage 调试消息处理器
     * @param param0.context VS Code 扩展上下文
     */
    handler: async ({ extensionProperties, debugMessage, context }) => {
      const { logFunction, logMessagePrefix, delimiterInsideMessage } =
        extensionProperties;
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const document: vscode.TextDocument = editor.document;

      // Get extension version
      const version = vscode.extensions.getExtension(
        'ChakrounAnas.turbo-console-log',
      )?.packageJSON.version;

      // Check if log operations are allowed
      const canOperate = canInsertLogInDocument(context, document, version);
      if (!canOperate) {
        return;
      }

      // Use the provided debug message for now
      const activeDebugMessage = debugMessage;

      const logMessages: Message[] = await activeDebugMessage.detectAll(
        fs,
        vscode,
        document.uri.fsPath,
        logFunction,
        logMessagePrefix,
        delimiterInsideMessage,
      );
      editor
        .edit((editBuilder) => {
          logMessages.forEach(({ lines, isTurboConsoleLog }) => {
            // Only process Turbo Console Log messages
            if (!isTurboConsoleLog) {
              return;
            }
            const firstLine = lines[0];
            const lastLine = lines[lines.length - 1];

            // Check if line before exists and is empty
            if (firstLine.start.line > 0) {
              const lineBeforeFirstLine = new vscode.Range(
                new vscode.Position(firstLine.start.line - 1, 0),
                new vscode.Position(
                  firstLine.start.line - 1,
                  document.lineAt(firstLine.start.line - 1).text.length,
                ),
              );
              if (document.lineAt(firstLine.start.line - 1).text === '') {
                editBuilder.delete(lineBeforeFirstLine);
              }
            }

            // Check if line after exists and is empty
            if (lastLine.start.line < document.lineCount - 1) {
              const lineAfterLastLine = new vscode.Range(
                new vscode.Position(lastLine.start.line + 1, 0),
                new vscode.Position(
                  lastLine.start.line + 1,
                  document.lineAt(lastLine.start.line + 1).text.length,
                ),
              );
              if (document.lineAt(lastLine.start.line + 1).text === '') {
                editBuilder.delete(lineAfterLastLine);
              }
            }

            lines.forEach((line: vscode.Range) => {
              editBuilder.delete(line);
            });
          });
        })
        .then(async (applied) => {
          if (applied) {
            await document.save();
          }
        });
    },
  };
}
