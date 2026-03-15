import { processLogMessages, isLogMessageLine } from '../utils/commandUtils';

/**
 * 创建修正所有日志消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function correctAllLogMessagesCommand(): TurboConsoleLog.Command {
  return {
    name: 'turboConsoleLog.correctAllLogMessages',
    /**
     * 修正所有日志消息的处理函数
     * @param param0.extensionProperties 扩展配置属性
     * @param param0.jsDebugMessage JavaScript 调试消息对象
     * @param param0.phpDebugMessage PHP 调试消息对象
     */
    handler: async (context) => {
      await processLogMessages(context, (line, isPhp, extensionProperties) => {
        if (!extensionProperties) return null;

        // For JavaScript files
        if (!isPhp && line.includes('console.')) {
          // Replace with a standardized log format
          return line.replace(/console\.\w+\(.*\);/g, `console.log('${extensionProperties.logMessagePrefix} variable:', variable);`);
        }
        // For PHP files
        if (isPhp && (line.includes('error_log') || line.includes('var_dump') || line.includes('print_r'))) {
          // Replace with a standardized log format
          return line.replace(/(error_log|var_dump|print_r)\(.*\);/g, `error_log('${extensionProperties.logMessagePrefix} variable: ' . $variable);`);
        }
        return null;
      });
    },
  };
}