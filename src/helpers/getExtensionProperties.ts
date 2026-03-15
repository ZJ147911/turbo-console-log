import * as vscode from 'vscode';

/**
 * 从工作区配置中获取扩展属性
 * @param workspaceConfig 工作区配置对象
 * @returns 扩展属性对象
 */
export function getExtensionProperties(
  workspaceConfig: vscode.WorkspaceConfiguration,
) {
  return {
    /** 是否包装日志消息 */
    wrapLogMessage: workspaceConfig.wrapLogMessage || false,
    /** 日志消息前缀 */
    logMessagePrefix: workspaceConfig.logMessagePrefix || '🚀',
    /** 日志消息后缀 */
    logMessageSuffix: workspaceConfig.logMessageSuffix || ':',
    /** 是否在末尾添加分号 */
    addSemicolonInTheEnd: workspaceConfig.addSemicolonInTheEnd || false,
    /** 是否插入包含的类名 */
    insertEnclosingClass: workspaceConfig.insertEnclosingClass ?? true,
    /** 是否启用日志修正通知 */
    logCorrectionNotificationEnabled:
      workspaceConfig.logCorrectionNotificationEnabled || false,
    /** 是否插入包含的函数名 */
    insertEnclosingFunction: workspaceConfig.insertEnclosingFunction ?? true,
    /** 是否在日志消息前插入空行 */
    insertEmptyLineBeforeLogMessage:
      workspaceConfig.insertEmptyLineBeforeLogMessage || false,
    /** 是否在日志消息后插入空行 */
    insertEmptyLineAfterLogMessage:
      workspaceConfig.insertEmptyLineAfterLogMessage || false,
    /** 引号类型 */
    quote: workspaceConfig.quote || '"',
    /** 消息内部的分隔符 */
    delimiterInsideMessage: workspaceConfig.delimiterInsideMessage || '~',
    /** 是否包含行号 */
    includeLineNum: workspaceConfig.includeLineNum || false,
    /** 是否包含文件名 */
    includeFilename: workspaceConfig.includeFilename || false,
    /** 日志函数名称 */
    logFunction: workspaceConfig.logFunction || 'log',
  };
}
