import { Range } from 'vscode';

/**
 * 消息类型定义
 */
export type Message = {
  /** 空格字符串 */
  spaces: string;
  /** 消息所在的行范围数组 */
  lines: Range[];
  /** 是否被注释（可选） */
  isCommented?: boolean;
  /** 使用的日志函数（可选），例如 'console.log', 'console.warn', 'console.error' */
  logFunction?: string;
  /** 是否是由 Turbo Console Log 插入的日志（包含前缀和分隔符） */
  isTurboConsoleLog?: boolean;
};
