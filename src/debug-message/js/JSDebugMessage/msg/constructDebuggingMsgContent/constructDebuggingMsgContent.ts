/**
 * Constructs the debugging message content using helper functions.
 */

import { TextDocument } from 'vscode';

import { ExtensionProperties } from '@/entities';

import type { AcornNode } from '../acorn-utils';

import {
  addPrefix,
  addFileInfo,
  addEnclosingContext,
  addVariable,
  buildLogMessage,
  getFileName,
  getEnclosingContext,
} from './helpers';

/**
 * 使用辅助函数构建调试消息内容
 * @param ast 预解析的 AST（以避免重复解析）
 * @param document 文本文档
 * @param selectedVar 选中的变量名
 * @param lineOfSelectedVar 选中变量的行号
 * @param lineOfLogMsg 日志消息将插入的行号
 * @param extensionProperties 扩展的配置属性
 * @param logFunction 日志函数名称
 * @returns 构建的调试消息内容
 */
export function constructDebuggingMsgContent(
  ast: AcornNode,
  document: TextDocument,
  selectedVar: string,
  lineOfSelectedVar: number,
  lineOfLogMsg: number,
  extensionProperties: Omit<
    ExtensionProperties,
    'wrapLogMessage' | 'insertEmptyLineAfterLogMessage'
  >,
  logFunction: string,
): string {
  const {
    includeFilename,
    includeLineNum,
    logMessagePrefix,
    logMessageSuffix,
    delimiterInsideMessage,
    insertEmptyLineBeforeLogMessage,
    quote,
    insertEnclosingClass,
    insertEnclosingFunction,
  } = extensionProperties;

  const fileName = getFileName(document.fileName);

  const { className, functionName } = getEnclosingContext(
    ast,
    document,
    lineOfSelectedVar,
    insertEnclosingClass,
    insertEnclosingFunction,
  );

  const actualLineNum =
    lineOfLogMsg + (insertEmptyLineBeforeLogMessage ? 2 : 1);

  // Build message parts using helper functions
  const parts: string[] = [];

  parts.push(...addPrefix(logMessagePrefix, delimiterInsideMessage));

  parts.push(
    ...addFileInfo(
      fileName,
      actualLineNum,
      includeFilename,
      includeLineNum,
      delimiterInsideMessage,
    ),
  );
  parts.push(
    ...addEnclosingContext(className, functionName, delimiterInsideMessage),
  );
  parts.push(...addVariable(selectedVar, logMessageSuffix));

  // Build final message
  const result = buildLogMessage(
    parts,
    logFunction,
    quote,
    selectedVar,
    extensionProperties.addSemicolonInTheEnd,
  );
  return result;
}
