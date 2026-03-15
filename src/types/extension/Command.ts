import * as vscode from 'vscode';

import { DebugMessage } from '../../debug-message';
import { ExtensionProperties } from './extensionProperties';

/**
 * 命令处理函数的属性类型
 */
type CommandHandlerProperties = {
  /** VS Code 扩展上下文 */
  context: vscode.ExtensionContext;
  /** 扩展配置属性 */
  extensionProperties: ExtensionProperties;
  /** 调试消息处理器 */
  debugMessage: DebugMessage;
  /** 命令参数（可选） */
  args?: unknown[];
};

/**
 * 命令类型定义
 */
export type Command = {
  /** 命令名称 */
  name: string;
  /** 命令处理函数 */
  handler: (
    commandHandlerProperties: CommandHandlerProperties,
  ) => Promise<void>;
};
