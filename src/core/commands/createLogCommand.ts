import * as vscode from 'vscode';

import { canInsertLogInDocument, isPhpFile } from '../../helpers';
import { getTabSize } from '../utils';
import { isPrintableVariable, stripTsTypeSyntax } from '../utils/astUtils';

/**
 * 创建日志插入命令的工厂函数
 * @param commandName 命令名称
 * @param logType 日志类型或日志类型获取函数
 * @returns 命令对象
 */
export function createLogCommand(
  commandName: string,
  logType:
    | string
    | ((extensionProperties: QuickConsole.ExtensionProperties) => string),
): QuickConsole.Command {
  return {
    name: commandName,
    handler: async ({
      extensionProperties,
      jsDebugMessage,
      phpDebugMessage,
      context,
    }) => {
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const tabSize: number | string = getTabSize(editor.options.tabSize);
      const document: vscode.TextDocument = editor.document;

      // 从当前扩展上下文取版本号，避免写死扩展 ID，任意 publisher 下都能正确插入日志
      const version = context.extension?.packageJSON?.version as
        | string
        | undefined;
      if (!canInsertLogInDocument(context, document, version)) {
        return;
      }

      const isPhp = isPhpFile(document.fileName);
      const activeDebugMessage =
        isPhp && phpDebugMessage ? phpDebugMessage : jsDebugMessage;
      const actualLogType =
        typeof logType === 'function' ? logType(extensionProperties) : logType;
      const languageType = isPhp ? 'php' : 'js';

      const edits: Array<{
        varToLog: string;
        lineOfSelectedVar: number;
      }> = [];
      let hasInvalidSelection = false;

      for (let index = 0; index < editor.selections.length; index++) {
        const selection = editor.selections[index];
        const rangeUnderCursor = document.getWordRangeAtPosition(
          selection.active,
        );
        const wordUnderCursor = rangeUnderCursor
          ? document.getText(rangeUnderCursor)
          : '';
        const selectedVar = document.getText(selection) || wordUnderCursor;
        if (selectedVar.trim().length === 0) continue;

        if (isPrintableVariable(selectedVar, languageType)) {
          edits.push({
            varToLog:
              languageType === 'js'
                ? stripTsTypeSyntax(selectedVar)
                : selectedVar,
            lineOfSelectedVar: selection.active.line,
          });
        } else {
          hasInvalidSelection = true;
        }
      }

      if (hasInvalidSelection) {
        vscode.window.showInformationMessage(
          'Selected content is not a printable variable',
        );
      }
      if (edits.length > 0) {
        // 从底向上插入，避免上方插入导致下方行号偏移
        edits.sort((a, b) => b.lineOfSelectedVar - a.lineOfSelectedVar);
        await editor.edit((editBuilder) => {
          for (const { varToLog, lineOfSelectedVar } of edits) {
            activeDebugMessage.msg(
              editBuilder,
              document,
              varToLog,
              lineOfSelectedVar,
              tabSize,
              extensionProperties,
              actualLogType,
            );
          }
        });
      }
    },
  };
}
