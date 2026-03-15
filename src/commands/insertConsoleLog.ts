import { Command } from '../entities';
import { createLogCommand } from './createLogCommand';

/**
 * 创建插入 console.log 日志的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function insertConsoleLogCommand(): Command {
  return createLogCommand(
    'turboConsoleLog.insertConsoleLog',
    'log',
    'var_dump'
  );
}
