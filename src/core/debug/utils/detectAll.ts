/** 转义正则中的特殊字符，用于动态拼接 PHP 的 logFunction（如 error_log、print_r） */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** JS/TS：匹配 console.(log|debug|info|warn|error|table)(...); 分号可选，参数非贪婪，同一行多条可分别匹配 */
const JS_LOG_REGEX =
  /console\.(log|debug|info|warn|error|table)\s*\(([\s\S]*?)\)\s*;?/g;

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
  _vscode: typeof import('vscode'),
  filePath: string,
  logFunction: QuickConsole.ExtensionProperties['logFunction'],
  logMessagePrefix: QuickConsole.ExtensionProperties['logMessagePrefix'],
  delimiterInsideMessage: QuickConsole.ExtensionProperties['delimiterInsideMessage'],
  isPhp: boolean = false,
): Promise<QuickConsole.Message[]> {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n');
    const messages: QuickConsole.Message[] = [];

    // PHP 按配置的 logFunction 动态拼正则并转义；JS 使用固定 console 方法集合
    const logRegex = isPhp
      ? new RegExp(
          `${escapeRegExp(logFunction)}\\s*\\(([\\s\\S]*?)\\)\\s*;?`,
          'g',
        )
      : JS_LOG_REGEX;

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      // 全局正则跨行使用时必须每行重置 lastIndex，否则下一行从错误位置开始匹配
      logRegex.lastIndex = 0;

      let match: RegExpExecArray | null;
      while ((match = logRegex.exec(line)) !== null) {
        const spaces = line.substring(0, match.index);
        const isQuickConsole =
          line.includes(logMessagePrefix) &&
          line.includes(delimiterInsideMessage);
        const trimmed = line.trim();
        const isCommented = isPhp
          ? trimmed.startsWith('//') || trimmed.startsWith('#')
          : trimmed.startsWith('//');

        messages.push({
          spaces,
          lines: [String(index)],
          isCommented,
          logFunction: isPhp ? logFunction : match[1],
          isQuickConsole,
        });
      }
    }

    return messages;
  } catch (error) {
    console.error('Error detecting log messages:', error);
    return [];
  }
}
