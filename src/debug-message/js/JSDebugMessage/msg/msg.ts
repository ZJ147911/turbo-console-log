import path from 'path';
import { TextEditorEdit, TextDocument, window } from 'vscode';

import {
  ExtensionProperties,
  LogMessage,
  LogContextMetadata,
} from '@/entities';

import { parseCode } from './acorn-utils';
import { constructDebuggingMsg } from './constructDebuggingMsg';
import { constructDebuggingMsgContent } from './constructDebuggingMsgContent';
import { omit } from './helpers/omit';
import { insertDebugMessage } from './insertDebugMessage';
import { logMessage } from './logMessage';
import { line as logMessageLine } from './logMessageLine';
import { spacesBeforeLogMsg } from './spacesBeforeLogMsg';
import {
  applyTransformedCode,
  needTransformation,
  performTransformation,
} from './transformer';

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
  const spacesBeforeMsg: string = spacesBeforeLogMsg(
    document,
    (logMsg.metadata as LogContextMetadata)?.deepObjectLine
      ? (logMsg.metadata as LogContextMetadata)?.deepObjectLine
      : lineOfSelectedVar,
    lineOfLogMsg,
  );
  const debuggingMsgContent: string = constructDebuggingMsgContent(
    ast,
    document,
    (logMsg.metadata as LogContextMetadata)?.deepObjectPath
      ? (logMsg.metadata as LogContextMetadata)?.deepObjectPath
      : selectedVar,
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
