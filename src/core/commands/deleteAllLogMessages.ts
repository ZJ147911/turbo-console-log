import { processLogMessages, isLogMessageLine } from '../utils/commandUtils';

/**
 * 创建删除所有日志消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function deleteAllLogMessagesCommand(): TurboConsoleLog.Command {
  return {
    name: 'turboConsoleLog.deleteAllLogMessages',
    /**
     * 删除所有日志消息的处理函数
     * @param param0.jsDebugMessage JavaScript 调试消息对象
     * @param param0.phpDebugMessage PHP 调试消息对象
     */
    handler: async (context) => {
      await processLogMessages(
        context,
        (line, isPhp) => {
          // 只保留非日志消息行
          return isLogMessageLine(line, isPhp) ? null : line;
        },
        true,
      ); // 使用过滤模式
    },
  };
}
