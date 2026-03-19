import * as vscode from 'vscode';

import { getAllCommands, jsDebugMessage, CommandRegistry } from './core';
import { getExtensionProperties, loadPhpDebugMessage } from './helpers';

/**
 * 扩展激活入口（由 VS Code 在首次触发本扩展命令时调用，见 package.json activationEvents）
 * @param context 扩展上下文，用于注册命令、订阅等
 */
export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration('quickConsole');
  const extensionProperties: QuickConsole.ExtensionProperties =
    getExtensionProperties(config);

  // 使用 CommandRegistry 统一注册所有命令（插入 log、注释/取消注释/删除/修正等）
  const commandRegistry = new CommandRegistry();
  const commands = getAllCommands();
  commandRegistry.registerCommands(commands);

  // 加载 PHP 调试消息处理器（JS/TS 使用内置的 jsDebugMessage）
  const phpDebugMessage = loadPhpDebugMessage(context.extensionPath);

  // 将命令挂到 context.subscriptions，并注入配置与 JS/PHP 两个调试处理器
  commandRegistry.activateCommands(
    context,
    extensionProperties,
    jsDebugMessage,
    phpDebugMessage || undefined,
  );
}
