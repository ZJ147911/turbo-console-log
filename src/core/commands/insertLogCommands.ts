import { createLogCommand } from './createLogCommand';

/**
 * 创建插入 console.log 日志消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function insertConsoleLogCommand() {
  return createLogCommand('quickConsole.insertConsoleLog', 'log');
}

/**
 * 创建插入 console.debug 调试消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function insertConsoleDebugCommand() {
  return createLogCommand('quickConsole.insertConsoleDebug', 'debug');
}

/**
 * 创建插入 console.info 信息消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function insertConsoleInfoCommand() {
  return createLogCommand('quickConsole.insertConsoleInfo', 'info');
}

/**
 * 创建插入 console.table 表格消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function insertConsoleTableCommand() {
  return createLogCommand('quickConsole.insertConsoleTable', 'table');
}

/**
 * 创建插入 console.warn 警告消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function insertConsoleWarnCommand() {
  return createLogCommand('quickConsole.insertConsoleWarn', 'warn');
}

/**
 * 创建插入 console.error 错误消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function insertConsoleErrorCommand() {
  return createLogCommand('quickConsole.insertConsoleError', 'error');
}

/**
 * 创建插入自定义日志消息的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function insertCustomLogCommand() {
  return createLogCommand(
    'quickConsole.insertCustomLog',
    (extensionProperties) => extensionProperties.logFunction || 'log',
  );
}
