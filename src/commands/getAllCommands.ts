import { Command } from '../entities';
import { commentAllLogMessagesCommand } from './commentAllLogMessages';
import { correctAllLogMessagesCommand } from './correctAllLogMessages';
import { deleteAllLogMessagesCommand } from './deleteAllLogMessages';
import { displayLogMessageCommand } from './displayLogMessage';
import { insertConsoleDebugCommand } from './insertConsoleDebug';
import { insertConsoleErrorCommand } from './insertConsoleError';
import { insertConsoleInfoCommand } from './insertConsoleInfo';
import { insertConsoleLogCommand } from './insertConsoleLog';
import { insertConsoleTableCommand } from './insertConsoleTable';
import { insertConsoleWarnCommand } from './insertConsoleWarn';
import { insertCustomLogCommand } from './insertCustomLog';
import { uncommentAllLogMessagesCommand } from './uncommentAllLogMessages';
/**
 * 获取所有可用的命令
 * @returns 命令对象数组
 */
export function getAllCommands(): Array<Command> {
  return [
    insertConsoleLogCommand(),
    insertConsoleDebugCommand(),
    insertConsoleTableCommand(),
    insertConsoleInfoCommand(),
    insertConsoleWarnCommand(),
    displayLogMessageCommand(),
    insertConsoleErrorCommand(),
    insertCustomLogCommand(),
    commentAllLogMessagesCommand(),
    uncommentAllLogMessagesCommand(),
    deleteAllLogMessagesCommand(),
    correctAllLogMessagesCommand(),
  ];
}
