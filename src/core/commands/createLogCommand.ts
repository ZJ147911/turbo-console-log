import * as vscode from 'vscode';

import { canInsertLogInDocument, isPhpFile } from '../../helpers';
import { getTabSize } from '../utils';
import { isPrintableVariable } from '../utils/astUtils';

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

      // 按文件类型选择调试消息处理器：PHP 用 phpDebugMessage，否则用 jsDebugMessage
      let activeDebugMessage = jsDebugMessage;
      if (isPhpFile(document.fileName) && phpDebugMessage) {
        activeDebugMessage = phpDebugMessage;
      }

      // 若 logType 为函数则根据配置计算实际方法名（如自定义 log），否则直接使用字符串
      const actualLogType =
        typeof logType === 'function' ? logType(extensionProperties) : logType;

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
          // 检查是否为可打印的变量
          const languageType = isPhpFile(document.fileName) ? 'php' : 'js';
          if (isPrintableVariable(selectedVar, languageType)) {
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
          } else {
            // 如果不是可打印的变量，显示提示
            vscode.window.showInformationMessage(
              'Selected content is not a printable variable',
            );
          }
        }
      }
    },
  };
}
