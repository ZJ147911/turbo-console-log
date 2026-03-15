import * as vscode from 'vscode';

import { Command } from '../entities';
import {
  trackLogInsertions,
  canInsertLogInDocument,
  loadPhpDebugMessage,
} from '../helpers';
import { getTabSize } from '../utilities';

/**
 * 创建日志插入命令的工厂函数
 * @param commandName 命令名称
 * @param logType 日志类型
 * @param phpLogType PHP 环境下的日志类型
 * @returns 命令对象
 */
export function createLogCommand(
  commandName: string,
  logType: string,
  phpLogType: string,
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

      // Check if log insertion is allowed (PHP requires Pro)
      const canInsert = canInsertLogInDocument(context, document, version);
      if (!canInsert) {
        return;
      }

      // For PHP files, load PHP debug message from Pro bundle
      let activeDebugMessage = debugMessage;
      let currentLogType = logType;

      if (document.languageId === 'php') {
        const phpDebugMessage = await loadPhpDebugMessage(context);
        if (!phpDebugMessage) {
          vscode.window.showErrorMessage(
            'Failed to load PHP support from Pro bundle.',
          );
          return;
        }
        activeDebugMessage = phpDebugMessage;
        currentLogType = phpLogType;
      }
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
              currentLogType,
            );
          });
        }
      }

      // Track logs insertions
      trackLogInsertions(context);
    },
  };
}
