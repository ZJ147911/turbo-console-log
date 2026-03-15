import * as fs from 'fs';
import * as vscode from 'vscode';

import { Command, Message } from '../entities';
import { canInsertLogInDocument } from '../helpers';

/**
 * 创建注释所有日志消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function commentAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.commentAllLogMessages',
    /**
     * 处理注释所有日志消息的命令
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
          logMessages.forEach(
            ({ spaces, lines, isCommented, isTurboConsoleLog }) => {
              // Only process Turbo Console Log messages
              if (!isTurboConsoleLog) {
                return;
              }
              if (isCommented) {
                return; // Skip commenting if the message is already commented
              }
              lines.forEach((line: vscode.Range) => {
                editBuilder.delete(line);
                editBuilder.insert(
                  new vscode.Position(line.start.line, 0),
                  `${spaces}// ${document.getText(line).trim()}\n`,
                );
              });
            },
          );
        })
        .then(async (applied) => {
          if (applied) {
            await document.save();
          }
        });
    },
  };
}
