import * as vscode from 'vscode';

/**
 * 命令注册器
 * 负责统一管理命令的注册和执行
 */
export class CommandRegistry {
  private commands: QuickConsole.Command[] = [];

  /**
   * 注册命令
   * @param command 命令对象
   */
  registerCommand(command: QuickConsole.Command): void {
    this.commands.push(command);
  }

  /**
   * 注册多个命令
   * @param commands 命令对象数组
   */
  registerCommands(commands: QuickConsole.Command[]): void {
    this.commands.push(...commands);
  }

  /**
   * 激活所有注册的命令
   * @param context VS Code 扩展上下文
   * @param extensionProperties 扩展配置属性
   * @param jsDebugMessage JavaScript 调试消息对象
   * @param phpDebugMessage PHP 调试消息对象
   */
  activateCommands(
    context: vscode.ExtensionContext,
    extensionProperties: QuickConsole.ExtensionProperties,
    jsDebugMessage: DebugMessage,
    phpDebugMessage?: DebugMessage,
  ): void {
    for (const { name, handler } of this.commands) {
      const disposable = vscode.commands.registerCommand(
        name,
        (args: string[]) => {
          handler({
            extensionProperties,
            jsDebugMessage,
            phpDebugMessage,
            args,
            context,
          });
        },
      );
      context.subscriptions.push(disposable);
    }
  }

  /**
   * 获取所有注册的命令
   * @returns 命令对象数组
   */
  getCommands(): QuickConsole.Command[] {
    return this.commands;
  }
}
