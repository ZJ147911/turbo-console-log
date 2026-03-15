import * as vscode from 'vscode';

import { Command } from '../entities';
import { canInsertLogInDocument } from '../helpers';
import { getTabSize } from '../utilities';

/**
 * 创建日志插入命令的工厂函数
 * @param commandName 命令名称
 * @param logType 日志类型或日志类型获取函数
 * @returns 命令对象
 */
export function createLogCommand(
  commandName: string,
  logType: string | ((extensionProperties: any) => string),
): Command {
  return {
    name: commandName,
    handler: async ({ extensionProperties, debugMessage, context }) => {
      const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize: number | string = getTabSize(editor.options.tabSize);
      const document: vscode.TextDocument = editor.document;

      // Get extension version
      const version = vscode.extensions.getExtension(
        'ChakrounAnas.turbo-console-log',
      )?.packageJSON.version;

      // Check if log insertion is allowed
      const canInsert = canInsertLogInDocument(context, document, version);
      if (!canInsert) {
        return;
      }

      // Use the provided debug message
      const activeDebugMessage = debugMessage;

      // Get the actual log type
      const actualLogType = typeof logType === 'function' ? logType(extensionProperties) : logType;

      for (let index = 0; index < editor.selections.length; index++) {
        const selection: vscode.Selection = editor.selections[index];
        let wordUnderCursor = '';
        const rangeUnderCursor: vscode.Range | undefined =
          document.getWordRangeAtPosition(selection.active);
        // if rangeUnderCursor is undefined, `document.getText(undefined)` will return the entire file.
        if (rangeUnderCursor) {
          wordUnderCursor = document.getText(rangeUnderCursor);
        }
        const selectedVar: string =
          document.getText(selection) || wordUnderCursor;
        const lineOfSelectedVar: number = selection.active.line;
        if (selectedVar.trim().length !== 0) {
          await editor.edit((editBuilder) => {
            activeDebugMessage.msg(
              editBuilder,
              document,
              selectedVar,
              lineOfSelectedVar,
              tabSize,
              extensionProperties,
              actualLogType,
            );
          });
        }
      }
    },
  };
}
