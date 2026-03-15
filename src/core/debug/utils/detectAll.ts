/**
 * 检测文件中的所有日志消息
 * @param fs 文件系统模块
 * @param vscode VS Code 模块
 * @param filePath 文件路径
 * @param logFunction 日志函数名称
 * @param logMessagePrefix 日志消息前缀
 * @param delimiterInsideMessage 消息内部的分隔符
 * @param isPhp 是否是 PHP 文件
 * @returns 检测到的消息数组
 */
export async function detectAll(
  fs: typeof import('fs'),
  vscode: typeof import('vscode'),
  filePath: string,
  logFunction: QuickConsole.ExtensionProperties['logFunction'],
  logMessagePrefix: QuickConsole.ExtensionProperties['logMessagePrefix'],
  delimiterInsideMessage: QuickConsole.ExtensionProperties['delimiterInsideMessage'],
  isPhp: boolean = false,
): Promise<QuickConsole.Message[]> {
  try {
    // 读取文件内容
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    const messages: QuickConsole.Message[] = [];

    // 搜索所有的日志语句
    let logRegex;
    if (isPhp) {
      logRegex = new RegExp(`${logFunction}\((.*)\);`, 'g');
    } else {
      logRegex = /console\.(log|debug|info|warn|error|table)\((.*)\);/g;
    }

    lines.forEach((line, index) => {
      let match;
      const lineCopy = line;

      // 查找所有匹配的日志语句
      while ((match = logRegex.exec(lineCopy)) !== null) {
        // 提取空格
        const spaces = lineCopy.substring(0, match.index);

        // 检查是否是由 Turbo Console Log 插入的日志
        const isQuickConsole =
          lineCopy.includes(logMessagePrefix) &&
          lineCopy.includes(delimiterInsideMessage);

        // 检查是否被注释
        const isCommented = isPhp
          ? lineCopy.trim().startsWith('//') || lineCopy.trim().startsWith('#')
          : lineCopy.trim().startsWith('//');

        // 创建消息对象
        const message: QuickConsole.Message = {
          spaces,
          lines: [index.toString()],
          isCommented,
          logFunction: isPhp ? logFunction : match[1],
          isQuickConsole,
        };

        messages.push(message);
      }
    });

    return messages;
  } catch (error) {
    console.error('Error detecting log messages:', error);
    return [];
  }
}
