import { processLogMessages } from '../utils/commandUtils';

/**
 * 创建修正所有日志消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function correctAllLogMessagesCommand(): QuickConsole.Command {
  return {
    name: 'quickConsole.correctAllLogMessages',
    /**
     * 修正所有日志消息的处理函数
     * @param param0.extensionProperties 扩展配置属性
     * @param param0.jsDebugMessage JavaScript 调试消息对象
     * @param param0.phpDebugMessage PHP 调试消息对象
     */
    handler: async (context) => {
      await processLogMessages(context, (line, isPhp, extensionProperties) => {
        if (!extensionProperties) return null;

        const prefix = extensionProperties.logMessagePrefix;

        // JS/TS：保留原方法名与实参，仅统一加上前缀（非贪婪匹配参数，支持一行多条）
        if (!isPhp) {
          const replaced = line.replace(
            /console\.(log|debug|info|warn|error|table)\s*\(([\s\S]*?)\)\s*;?/g,
            (_, method, args) =>
              `console.${method}('${prefix}', ${args.trim()});`,
          );
          return replaced !== line ? replaced : null;
        }

        // PHP：保留原函数名与实参，仅统一加上前缀
        if (isPhp) {
          const replaced = line.replace(
            /(error_log|var_dump|print_r)\s*\(([\s\S]*?)\)\s*;?/g,
            (_, fn, args) => `${fn}('${prefix}', ${args.trim()});`,
          );
          return replaced !== line ? replaced : null;
        }

        return null;
      });
    },
  };
}
