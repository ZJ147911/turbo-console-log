import * as vscode from 'vscode';

import { getAllCommands } from './commands/';
import { jsDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import {
  getExtensionProperties,
  traceExtensionVersionHistory,
  listenToPhpFileOpenings,
  updateUserActivityStatus,
  listenToManualConsoleLogs,
  listenToInactiveTwoWeeksReturn,
  listenToInactiveFourWeeksSurvey,
  listenToActivationDayThree,
  listenToActivationDaySeven,
  listenToJSMessyFileDetection,
  listenToPhpMessyFileDetection,
  listenToJSMultiLogTypes,
  listenToPhpMultiLogTypes,
  listenToWeekendTurboSundays,
  listenToCommitWithLogs,
  listenToCustomLogLibrary,
  listenToLogsInTestFile,
} from './helpers';
import { releaseNotes } from './releases';

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration('turboConsoleLog');
  const extensionProperties: ExtensionProperties =
    getExtensionProperties(config);
  // Register all commands
  const commands: Array<Command> = getAllCommands();
  for (const { name, handler } of commands) {
    vscode.commands.registerCommand(name, (args: unknown[]) => {
      handler({
        extensionProperties,
        debugMessage: jsDebugMessage,
        args,
        context,
      });
    });
  }

  // 移除 Pro 相关面板注册

  // Get current extension version
  const version = vscode.extensions.getExtension(
    'ChakrounAnas.turbo-console-log',
  )?.packageJSON.version;

  // Update user activity status (ACTIVE/INACTIVE based on 7-day window)
  // Must run before traceExtensionVersionHistory since update reporting relies on this
  updateUserActivityStatus(context);

  // Trace version history and handle fresh install welcome
  // (creates or updates version array in global state + shows welcome for new users)
  traceExtensionVersionHistory(context, version);

  // Listen to PHP file openings and show announcement immediately (v3.10.0 strategy)
  listenToPhpFileOpenings(context, version);

  // Listen to manual console.log typing for INACTIVE users (re-engagement strategy)
  listenToManualConsoleLogs(context);

  // Listen to JS/TS file openings for inactive users (14-28 days)
  listenToInactiveTwoWeeksReturn(context, version);

  // Listen to JS/TS file openings for long-term inactive users (28+ days) - show survey
  listenToInactiveFourWeeksSurvey(context, version);

  // Listen to JS/TS file openings for new users with zero usage (3-7 days activation nudge)
  listenToActivationDayThree(context, version);

  // Listen to JS/TS file openings for new users with zero usage (7-14 days final activation attempt)
  listenToActivationDaySeven(context, version);

  // Listen to JS/TS messy file detection and show notification
  listenToJSMessyFileDetection(context, version);

  // Listen to PHP messy file detection and show notification
  listenToPhpMessyFileDetection(context, version);

  // Listen to JS/TS multi-log-type detection and show notification
  listenToJSMultiLogTypes(context, version);

  // Listen to PHP multi-log-type detection and show notification
  listenToPhpMultiLogTypes(context, version);

  // Listen to Git commits with logs and show notification
  listenToCommitWithLogs(context, version);

  // Listen to custom logging library usage and show notification
  listenToCustomLogLibrary(context, version);

  // Listen to logs in test files and show notification
  listenToLogsInTestFile(context, version);

  // Show weekend Turbo Sundays article notification (if it's weekend)
  listenToWeekendTurboSundays(context, version);

  // 移除 Pro 相关逻辑和 freemium launcher 激活
}
