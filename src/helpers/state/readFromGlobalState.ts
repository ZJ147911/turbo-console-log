import * as vscode from 'vscode';

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
