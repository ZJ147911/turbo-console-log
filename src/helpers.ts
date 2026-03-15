import * as path from 'path';
import * as vscode from 'vscode';

import { phpDebugMessage } from './core/debug/php';

/**
 * 从工作区配置中获取扩展属性
 * @param workspaceConfig 工作区配置对象
 * @returns 扩展属性对象
 */
export function getExtensionProperties(
  workspaceConfig: vscode.WorkspaceConfiguration,
): TurboConsoleLog.ExtensionProperties {
  return {
    /** 是否包装日志消息 */
    wrapLogMessage: workspaceConfig.wrapLogMessage || false,
    /** 日志消息前缀 */
    logMessagePrefix: workspaceConfig.logMessagePrefix || '🚀',
    /** 日志消息后缀 */
    logMessageSuffix: workspaceConfig.logMessageSuffix || ':',
    /** 是否在末尾添加分号 */
    addSemicolonInTheEnd: workspaceConfig.addSemicolonInTheEnd || false,
    /** 是否插入包含的类名 */
    insertEnclosingClass: workspaceConfig.insertEnclosingClass ?? true,
    /** 是否启用日志修正通知 */
    logCorrectionNotificationEnabled:
      workspaceConfig.logCorrectionNotificationEnabled || false,
    /** 是否插入包含的函数名 */
    insertEnclosingFunction: workspaceConfig.insertEnclosingFunction ?? true,
    /** 是否在日志消息前插入空行 */
    insertEmptyLineBeforeLogMessage:
      workspaceConfig.insertEmptyLineBeforeLogMessage || false,
    /** 是否在日志消息后插入空行 */
    insertEmptyLineAfterLogMessage:
      workspaceConfig.insertEmptyLineAfterLogMessage || false,
    /** 引号类型 */
    quote: workspaceConfig.quote || '"',
    /** 消息内部的分隔符 */
    delimiterInsideMessage: workspaceConfig.delimiterInsideMessage || '~',
    /** 是否包含行号 */
    includeLineNum: workspaceConfig.includeLineNum || false,
    /** 是否包含文件名 */
    includeFilename: workspaceConfig.includeFilename || false,
    /** 日志函数名称 */
    logFunction: workspaceConfig.logFunction || 'log',
  };
}

/**
 * 检查是否可以在文档中插入日志
 * @param context VS Code 扩展上下文
 * @param document 文本文档
 * @param version 扩展版本
 * @returns 是否可以插入日志
 */
export function canInsertLogInDocument(
  context: vscode.ExtensionContext,
  document: vscode.TextDocument,
  version: string | undefined,
): boolean {
  // 检查文档是否存在
  if (!document) {
    return false;
  }

  // 检查文档是否是虚拟文档（如输出窗口或终端）
  if (document.uri.scheme !== 'file') {
    return false;
  }

  // 检查文件类型是否支持
  const fileName = document.fileName;
  if (!isJavaScriptOrTypeScriptFile(fileName) && !isPhpFile(fileName)) {
    return false;
  }

  // 检查扩展是否已激活
  if (!context || !context.subscriptions) {
    return false;
  }

  // 检查版本是否有效
  if (!version) {
    return false;
  }

  // 检查文档是否已保存
  if (document.isDirty) {
    // 可以在未保存的文档中插入日志
  }

  // 所有检查都通过，可以插入日志
  return true;
}

/**
 * 加载PHP调试消息处理器
 * @param extensionPath 扩展路径
 * @returns PHP调试消息处理器
 */
export async function loadPhpDebugMessage(
  extensionPath: string,
): Promise<DebugMessage | null> {
  return phpDebugMessage;
}

/**
 * 检查文件是否是JavaScript或TypeScript文件，或包含JavaScript/TypeScript代码的文件
 * @param fileName 文件名
 * @returns 是否是JavaScript或TypeScript文件，或包含JavaScript/TypeScript代码的文件
 */
export function isJavaScriptOrTypeScriptFile(fileName: string): boolean {
  const jsTsExtensions = ['.js', '.jsx', '.ts', '.tsx', '.html', '.vue', '.svelte', '.astro', '.mdx'];
  const extension = path.extname(fileName);
  return jsTsExtensions.includes(extension);
}

/**
 * 检查文件是否是PHP文件
 * @param fileName 文件名
 * @returns 是否是PHP文件
 */
export function isPhpFile(fileName: string): boolean {
  return path.extname(fileName) === '.php';
}

/**
 * 从全局状态中读取数据
 * @param context VS Code 扩展上下文
 * @param key 存储键名
 * @returns 存储的值，如果不存在则返回 undefined
 */
export function readFromGlobalState<T>(
  context: vscode.ExtensionContext,
  key: string,
): T | undefined {
  return context.globalState.get<T>(key);
}

/**
 * 向全局状态中写入数据
 * @param context VS Code 扩展上下文
 * @param key 存储键名
 * @param value 要存储的值
 */
export function writeToGlobalState(
  context: vscode.ExtensionContext,
  key: string,
  value: string | number | boolean | object | string[] | number[] | boolean[],
): void {
  context.globalState.update(key, value);
}
