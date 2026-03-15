import { TextDocument, TextEditorEdit, Position } from 'vscode';

/**
 * 将调试消息插入到文档中的指定位置
 * @param document 文本文档
 * @param textEditor 用于进行编辑的文本编辑器实例
 * @param lineOfLogMsg 日志消息应该插入的行号
 * @param debuggingMsg 要插入的调试消息
 * @param insertEmptyLineBeforeLogMessage 是否在日志消息前插入空行
 * @param insertEmptyLineAfterLogMessage 是否在日志消息后插入空行
 */
export function insertDebugMessage(
  document: TextDocument,
  textEditor: TextEditorEdit,
  lineOfLogMsg: number,
  debuggingMsg: string,
  insertEmptyLineBeforeLogMessage: boolean,
  insertEmptyLineAfterLogMessage: boolean,
): void {
  textEditor.insert(
    new Position(
      lineOfLogMsg >= document.lineCount ? document.lineCount : lineOfLogMsg,
      0,
    ),
    `${insertEmptyLineBeforeLogMessage ? '\n' : ''}${
      lineOfLogMsg === document.lineCount ? '\n' : ''
    }${debuggingMsg}\n${insertEmptyLineAfterLogMessage ? '\n' : ''}`,
  );
}
