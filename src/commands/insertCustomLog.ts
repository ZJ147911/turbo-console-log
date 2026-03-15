import { Command } from '../entities';
import { createLogCommand } from './createLogCommand';

/**
 * 创建插入自定义日志的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function insertCustomLogCommand(): Command {
  return createLogCommand(
    'turboConsoleLog.insertCustomLog',
    (extensionProperties) => extensionProperties.logFunction || 'log'
  );
}
