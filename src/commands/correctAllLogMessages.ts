import * as fs from 'fs';
import * as vscode from 'vscode';

import { Command, Message } from '../entities';
import { trackLogManagementCommands } from '../helpers';
import { showNotification } from '../ui';

/**
 * 从日志消息中提取文件名
 * @param logMessage 日志消息文本
 * @param delimiterInsideMessage 消息内部的分隔符
 * @returns 提取的文件名，如果没有找到则返回 null
 */
function getFilenameFromLogMessage(
  logMessage: string,
  delimiterInsideMessage: string,
): string | null {
  const regex = new RegExp(
    `[\\s\\S]*?${delimiterInsideMessage}\\s([\\w.-]+\\.\\w+)`,
  );
  const match = logMessage.match(regex);
  return match ? match[1] : null;
}

/**
 * 创建修正所有日志消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function correctAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.correctAllLogMessages',
    /**
     * 处理修正所有日志消息的命令
     * @param param0 命令参数
     * @param param0.extensionProperties 扩展配置属性
     * @param param0.debugMessage 调试消息处理器
     * @param param0.context VS Code 扩展上下文
     */
    handler: async ({ extensionProperties, debugMessage, context }) => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const document: vscode.TextDocument = editor.document;
      const currentFileName = document.fileName.includes('/')
        ? document.fileName.split('/').pop()
        : document.fileName.split('\\').pop();

      const logMessages: Message[] = await debugMessage.detectAll(
        fs,
        vscode,
        document.uri.fsPath,
        extensionProperties.logFunction,
        extensionProperties.logMessagePrefix,
        extensionProperties.delimiterInsideMessage,
      );

      const edits: { range: vscode.Range; newText: string }[] = [];
      let updatedCount = 0;

      return editor
        .edit((editBuilder) => {
          logMessages.forEach(({ lines, isTurboConsoleLog }) => {
            // Only process Turbo Console Log messages
            if (!isTurboConsoleLog) {
              return;
            }
            lines.forEach((line: vscode.Range) => {
              const lineText = document.getText(line);

              // Parse file name and line number from log messages using detectAll output
              const includeFilename = extensionProperties.includeFilename;
              const includeLineNum = extensionProperties.includeLineNum;

              // Extract current log message details
              const currentLine = line.start.line + 1;

              // Build the corrected log message based on user settings
              let correctedLog = lineText;
              let needsUpdate = false;

              if (includeFilename && currentFileName) {
                const extractedFilename = getFilenameFromLogMessage(
                  lineText,
                  extensionProperties.delimiterInsideMessage,
                );
                if (!lineText.includes(currentFileName) && extractedFilename) {
                  correctedLog = correctedLog.replace(
                    extractedFilename,
                    currentFileName,
                  );
                  needsUpdate = true;
                }
              }

              if (includeLineNum) {
                // Replace the line number if necessary
                const regexLineNum = new RegExp(`:\\d+`);
                const currentLineInfo = `:${currentLine}`;
                if (!lineText.includes(currentLineInfo)) {
                  correctedLog = correctedLog.replace(
                    regexLineNum,
                    currentLineInfo,
                  );
                  needsUpdate = true;
                }
              }
              if (needsUpdate && lineText !== correctedLog) {
                edits.push({ range: line, newText: correctedLog });
                updatedCount++;
              }
            });
          });

          // Apply the edits
          edits.forEach(({ range, newText }) =>
            editBuilder.replace(range, newText),
          );
        })
        .then(async (applied) => {
          if (applied && edits.length > 0) {
            await document.save();
            // Track log management command usage
            trackLogManagementCommands(context, 'correct');
          }
          if (extensionProperties.logCorrectionNotificationEnabled) {
            const editCount = edits.length;
            if (editCount !== 0) {
              if (editCount === 1) {
                showNotification(`1 log message has been updated`, 5000);
                return;
              }
              showNotification(
                `${updatedCount} log messages have been updated`,
                5000,
              );
            }
          }
        });
    },
  };
}
