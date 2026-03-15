import * as vscode from 'vscode';

import { getAllCommands, jsDebugMessage, CommandRegistry } from './core';
import {
  getExtensionProperties,
  loadPhpDebugMessage,
  isJavaScriptOrTypeScriptFile,
  isPhpFile,
} from './helpers';

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration('turboConsoleLog');
  const extensionProperties: TurboConsoleLog.ExtensionProperties =
    getExtensionProperties(config);

  // Register all commands using CommandRegistry
  const commandRegistry = new CommandRegistry();
  const commands = getAllCommands();
  commandRegistry.registerCommands(commands);

  // Load PHP debug message processor
  const phpDebugMessage = await loadPhpDebugMessage(context.extensionPath);

  // Activate commands with both debug message processors
  commandRegistry.activateCommands(
    context,
    extensionProperties,
    jsDebugMessage,
    phpDebugMessage || undefined,
  );
}
