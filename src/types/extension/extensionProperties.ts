/**
 * 扩展配置属性类型
 */
export type ExtensionProperties = {
  /** 是否包装日志消息 */
  wrapLogMessage: boolean;
  /** 日志消息前缀 */
  logMessagePrefix: string;
  /** 日志消息后缀 */
  logMessageSuffix: string;
  /** 是否在末尾添加分号 */
  addSemicolonInTheEnd: boolean;
  /** 是否插入包含的类名 */
  insertEnclosingClass: boolean;
  /** 是否启用日志修正通知 */
  logCorrectionNotificationEnabled: boolean;
  /** 是否插入包含的函数名 */
  insertEnclosingFunction: boolean;
  /** 是否在日志消息前插入空行 */
  insertEmptyLineBeforeLogMessage: boolean;
  /** 是否在日志消息后插入空行 */
  insertEmptyLineAfterLogMessage: boolean;
  /** 消息内部的分隔符 */
  delimiterInsideMessage: string;
  /** 是否包含文件名 */
  includeFilename: boolean;
  /** 是否包含行号 */
  includeLineNum: boolean;
  /** 引号类型 */
  quote: string;
  /** 日志函数名称 */
  logFunction: string;
};
