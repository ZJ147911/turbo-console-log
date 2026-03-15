import { TextEditorEdit, TextDocument } from 'vscode';

import { isPhpFile } from '../../../helpers';
import { getEnclosingContext } from '../../utils';
import { insertDebugMessage, LogMessageGenerator } from './';

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
  extensionProperties: TurboConsoleLog.ExtensionProperties,
  logFunction: string,
): void {
  // 检测文件类型
  const isPhp = isPhpFile(document.fileName);

  // 计算日志消息的行号
  const lineOfLogMsg = LogMessageGenerator.calculateLogLine(lineOfSelectedVar);

  // 获取文件名
  const filename = extensionProperties.includeFilename
    ? document.fileName
    : undefined;

  // 获取行号
  const lineNum = extensionProperties.includeLineNum
    ? lineOfSelectedVar + 1
    : undefined;

  // 通过 AST 解析获取类名和函数名
  const { enclosingClass, enclosingFunction } = getEnclosingContext(
    document,
    lineOfSelectedVar,
  );

  // 生成调试消息内容
  const debuggingMsgContent = LogMessageGenerator.generateMessageContent(
    selectedVar,
    extensionProperties,
    filename,
    lineNum,
    enclosingClass,
    enclosingFunction,
    isPhp,
  );

  // 生成完整的调试消息
  const debuggingMsg = LogMessageGenerator.generateLogMessage(
    debuggingMsgContent,
    logFunction,
    tabSize,
    extensionProperties,
    isPhp,
  );

  // 插入调试消息到文档
  insertDebugMessage(
    document,
    textEditor,
    lineOfLogMsg,
    debuggingMsg,
    extensionProperties.insertEmptyLineBeforeLogMessage,
    extensionProperties.insertEmptyLineAfterLogMessage,
  );
}
