import * as path from "path";

/**
 * 日志消息生成器
 * 负责生成不同类型的日志消息
 */
export class LogMessageGenerator {
  /**
   * 生成调试消息内容
   * @param selectedVar 选中的变量
   * @param extensionProperties 扩展配置属性
   * @param filename 文件名（可选）
   * @param lineNum 行号（可选）
   * @param enclosingClass 包含的类名（可选）
   * @param enclosingFunction 包含的函数名（可选）
   * @param isPhp 是否是 PHP 文件
   * @returns 调试消息内容
   */
  static generateMessageContent(
    selectedVar: string,
    extensionProperties: TurboConsoleLog.ExtensionProperties,
    filename?: string,
    lineNum?: number,
    enclosingClass?: string,
    enclosingFunction?: string,
    isPhp: boolean = false,
  ): string {
    const parts = [];

    // 添加前缀
    if (isPhp) {
      parts.push(`'${extensionProperties.logMessagePrefix}`);
    } else {
      parts.push(`${extensionProperties.quote}${extensionProperties.logMessagePrefix}`);
    }

    // 添加分隔符
    if (extensionProperties.delimiterInsideMessage) {
      parts.push(`${extensionProperties.delimiterInsideMessage}`);
    }

    // 添加文件名
    if (extensionProperties.includeFilename && filename) {
      parts.push(`${filename}`);
    }

    // 添加行号
    if (extensionProperties.includeLineNum && lineNum) {
      parts.push(`${lineNum}`);
    }

    // 添加类名
    if (extensionProperties.insertEnclosingClass && enclosingClass) {
      parts.push(`${enclosingClass}`);
    }

    // 添加函数名
    if (extensionProperties.insertEnclosingFunction && enclosingFunction) {
      parts.push(`${enclosingFunction}`);
    }

    // 添加变量名和后缀
    if (isPhp) {
      parts.push(`${selectedVar}${extensionProperties.logMessageSuffix}'`);
      // 添加变量值
      parts.push(` . ${selectedVar}`);
    } else {
      parts.push(`${selectedVar}${extensionProperties.logMessageSuffix}${extensionProperties.quote}`);
      // 添加变量值
      parts.push(selectedVar);
    }

    return parts.join(" ");
  }

  /**
   * 生成完整的调试消息
   * @param messageContent 消息内容
   * @param logFunction 日志函数名称
   * @param tabSize 制表符大小
   * @param extensionProperties 扩展配置属性
   * @param isPhp 是否是 PHP 文件
   * @returns 完整的调试消息
   */
  static generateLogMessage(
    messageContent: string,
    logFunction: string,
    tabSize: number,
    extensionProperties: TurboConsoleLog.ExtensionProperties,
    isPhp: boolean = false,
  ): string {
    const indent = " ".repeat(tabSize);
    const semicolon = extensionProperties.addSemicolonInTheEnd ? ";" : "";

    if (isPhp) {
      return `${indent}${logFunction}(${messageContent})${semicolon}`;
    } else {
      if (extensionProperties.wrapLogMessage) {
        return `${indent}console.${logFunction}(${messageContent})${semicolon}`;
      } else {
        return `${indent}console.${logFunction}(${messageContent})${semicolon}`;
      }
    }
  }

  /**
   * 计算日志消息的行号
   * @param lineOfSelectedVar 选中变量的行号
   * @returns 日志消息的行号
   */
  static calculateLogLine(lineOfSelectedVar: number): number {
    return lineOfSelectedVar + 1;
  }
}
