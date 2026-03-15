import { Command } from '../entities';
import { createLogCommand } from './createLogCommand';

/**
 * 创建显示日志消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function displayLogMessageCommand(): Command {
  return createLogCommand(
    'turboConsoleLog.displayLogMessage',
    'log'
  );
}
