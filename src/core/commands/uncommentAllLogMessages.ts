import {
  processLogMessages,
  getUncommentedLogLine,
} from '../utils/commandUtils';

/**
 * 创建取消注释所有日志消息的命令
 * 仅对“被注释的日志行”（// 或 # 后紧跟 log 调用）去掉注释并保留行首缩进
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function uncommentAllLogMessagesCommand(): QuickConsole.Command {
  return {
    name: 'quickConsole.uncommentAllLogMessages',
    handler: async (context) => {
      await processLogMessages(context, (line, isPhp) => {
        const uncommented = getUncommentedLogLine(line, isPhp);
        return uncommented !== null ? uncommented : null;
      });
    },
  };
}
