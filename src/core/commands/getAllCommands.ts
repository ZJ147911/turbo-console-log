import { commentAllLogMessagesCommand } from './commentAllLogMessages';
import { correctAllLogMessagesCommand } from './correctAllLogMessages';
import { deleteAllLogMessagesCommand } from './deleteAllLogMessages';
import {
  insertConsoleLogCommand,
  insertConsoleDebugCommand,
  insertConsoleInfoCommand,
  insertConsoleTableCommand,
  insertConsoleWarnCommand,
  insertConsoleErrorCommand,
  insertCustomLogCommand,
} from './insertLogCommands';
import { uncommentAllLogMessagesCommand } from './uncommentAllLogMessages';
/**
 * 获取所有可用的命令
 * @returns 命令对象数组
 */
export function getAllCommands(): Array<QuickConsole.Command> {
  return [
    insertConsoleLogCommand(),
    insertConsoleDebugCommand(),
    insertConsoleTableCommand(),
    insertConsoleInfoCommand(),
    insertConsoleWarnCommand(),
    insertConsoleErrorCommand(),
    insertCustomLogCommand(),
    commentAllLogMessagesCommand(),
    uncommentAllLogMessagesCommand(),
    deleteAllLogMessagesCommand(),
    correctAllLogMessagesCommand(),
  ];
}
