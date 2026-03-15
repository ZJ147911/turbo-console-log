import { processLogMessages, isLogMessageLine } from '../utils/commandUtils';

/**
 * 创建取消注释所有日志消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function uncommentAllLogMessagesCommand(): TurboConsoleLog.Command {
  return {
    name: 'turboConsoleLog.uncommentAllLogMessages',
    /**
     * 取消注释所有日志消息的处理函数
     * @param param0.jsDebugMessage JavaScript 调试消息对象
     * @param param0.phpDebugMessage PHP 调试消息对象
     */
    handler: async (context) => {
      await processLogMessages(context, (line, isPhp) => {
        if (line.trim().startsWith('//') && isLogMessageLine(line, isPhp)) {
          return line.trim().substring(2).trim();
        }
        return null;
      });
    },
  };
}