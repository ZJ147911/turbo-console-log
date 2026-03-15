import path from 'path';
import { TextEditorEdit, TextDocument, window } from 'vscode';

import { ExtensionProperties, LogMessage, LogContextMetadata } from '../../../entities';

import { parseCode } from '../../../debug-message/js/JSDebugMessage/msg/acorn-utils';
import { constructDebuggingMsg } from '../../../debug-message/js/JSDebugMessage/msg/constructDebuggingMsg';
import { constructDebuggingMsgContent } from '../../../debug-message/js/JSDebugMessage/msg/constructDebuggingMsgContent';
import { omit } from '../../../debug-message/js/JSDebugMessage/msg/helpers/omit';
import { insertDebugMessage } from '../../../debug-message/js/JSDebugMessage/msg/insertDebugMessage';
import { logMessage } from '../../../debug-message/js/JSDebugMessage/msg/logMessage';
import { line as logMessageLine } from '../../../debug-message/js/JSDebugMessage/msg/logMessageLine';
import { spacesBeforeLogMsg } from '../../../debug-message/js/JSDebugMessage/msg/spacesBeforeLogMsg';
import { applyTransformedCode, needTransformation, performTransformation } from '../../../debug-message/js/JSDebugMessage/msg/transformer';

/**
 * 生成并插入调试消息到文档中的主函数
 * 此函数根据选中的变量和扩展配置，编排创建调试日志消息的整个过程
 *
 * @param textEditor 用于进行编辑的文本编辑器实例
 * @param document 正在编辑的文本文档
 * @param selectedVar 要调试的选中变量名
 * @param lineOfSelectedVar 变量所在的行号
 * @param tabSize 用于正确缩进的制表符大小设置
 * @param extensionProperties 扩展的配置属性
 * @param logFunction 日志函数名称
 */
export function msg(
  textEditor: TextEditorEdit,
  document: TextDocument,
  selectedVar: string,
  lineOfSelectedVar: number,
  tabSize: number,
  extensionProperties: ExtensionProperties,
  logFunction: string,
): void {
  // Parse the code once and reuse the AST throughout the process
  const code = document.getText();

  // Get file extension from document URI
  const filePath = document.uri.fsPath;
  const fileExtension = path.extname(filePath);

  let ast;

  try {
    ast = parseCode(code, fileExtension, lineOfSelectedVar);
  } catch (error) {
    // Show error notification to the user
    window.showErrorMessage(
      `Turbo AST: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
    return;
  }

  const logMsg: LogMessage = logMessage(
    ast,
    document,
    lineOfSelectedVar,
    selectedVar,
  );

  const lineOfLogMsg: number = logMessageLine(
    ast,
    document,
    lineOfSelectedVar,
    selectedVar,
    logMsg,
  );

  const targetLine = (logMsg.metadata as LogContextMetadata)?.deepObjectLine || lineOfSelectedVar;

  const spacesBeforeMsg: string = spacesBeforeLogMsg(
    document,
    targetLine,
    lineOfLogMsg,
  );

  const targetVar = (logMsg.metadata as LogContextMetadata)?.deepObjectPath || selectedVar;

  const debuggingMsgContent: string = constructDebuggingMsgContent(
    ast,
    document,
    targetVar,
    lineOfSelectedVar,
    lineOfLogMsg,
    omit(extensionProperties, [
      'wrapLogMessage',
      'insertEmptyLineAfterLogMessage',
    ]),
    logFunction,
  );

  const debuggingMsg: string = constructDebuggingMsg(
    extensionProperties,
    debuggingMsgContent,
    spacesBeforeMsg,
    logFunction,
  );

  // Handle code transformation if needed
  if (needTransformation(ast, document, lineOfSelectedVar, selectedVar)) {
    const transformedCode = performTransformation(
      ast,
      document,
      lineOfSelectedVar,
      selectedVar,
      debuggingMsg,
      {
        addSemicolonInTheEnd: extensionProperties.addSemicolonInTheEnd,
        tabSize: tabSize,
      },
    );
    applyTransformedCode(document, transformedCode);
    return;
  }

  // Insert the debugging message into the document
  insertDebugMessage(
    document,
    textEditor,
    lineOfLogMsg,
    debuggingMsg,
    extensionProperties.insertEmptyLineBeforeLogMessage,
    extensionProperties.insertEmptyLineAfterLogMessage,
  );
}
