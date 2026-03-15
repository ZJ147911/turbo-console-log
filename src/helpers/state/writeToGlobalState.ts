import * as vscode from 'vscode';

/**
 * 向全局状态中写入数据
 * @param context VS Code 扩展上下文
 * @param key 存储键名
 * @param value 要存储的值
 */
export function writeToGlobalState(
  context: vscode.ExtensionContext,
  key: string,
  value: unknown,
): void {
  context.globalState.update(key, value);
}
