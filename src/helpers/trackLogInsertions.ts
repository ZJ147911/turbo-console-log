import * as vscode from 'vscode';

import { GlobalStateKey } from '@/entities';

import { NotificationEvent } from '../notifications/NotificationEvent';
import { showNotification } from '../notifications/showNotification';
import { readFromGlobalState, writeToGlobalState } from './index';

// In-memory tracking of files with log insertions in current session
// Automatically resets on VS Code restart
const filesWithLogsInSession = new Set<string>();

/**
 * Clears the session-based file tracking (for testing purposes only)
 * @internal
 */
export function clearFilesWithLogsInSession(): void {
  filesWithLogsInSession.clear();
}

/**
 * Tracks log insertion commands usage
 * Shows three-day streak notification after 3 consecutive days
 * Shows multi-file logs notification when logs inserted in 3+ files
 * Shows ten inserts notification after 10 uses
 * Shows twenty inserts notification after 20 uses
 * Shows fifty inserts notification after 50 uses
 * Shows hundred inserts notification after 100 uses
 * @param context VS Code extension context
 */
export async function trackLogInsertions(
  context: vscode.ExtensionContext,
): Promise<void> {
  // Get extension version
  const version = vscode.extensions.getExtension(
    'ChakrounAnas.turbo-console-log',
  )?.packageJSON.version;

  // Increment command usage count (track for all users, including Pro)
  let commandUsageCount =
    readFromGlobalState<number>(context, GlobalStateKey.COMMAND_USAGE_COUNT) ||
    0;
  commandUsageCount++;
  writeToGlobalState(
    context,
    GlobalStateKey.COMMAND_USAGE_COUNT,
    commandUsageCount,
  );

  // Update last insertion date AFTER tracking streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  writeToGlobalState(
    context,
    GlobalStateKey.LAST_INSERTION_DATE,
    today.getTime(),
  );



  // Track file with log insertion (session-based, in-memory)
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    filesWithLogsInSession.add(activeEditor.document.uri.toString());
  }

  // Check if user has inserted logs in 3+ files in current session (pain-point driven conversion)
  const hasShownMultiFileLogsNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_MULTI_FILE_LOGS_NOTIFICATION,
  );

  if (!hasShownMultiFileLogsNotification && filesWithLogsInSession.size >= 3) {
    // Show multi-file logs notification (non-blocking) with version info
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_MULTI_FILE_LOGS,
      version,
      context,
    );

    // Only mark as shown if it was actually displayed (not blocked by cooldown)
    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_MULTI_FILE_LOGS_NOTIFICATION,
        true,
      );
    }
    return;
  }

  // Check if user has reached the 10 inserts milestone (educational)
  const hasShownTenInsertsMilestoneNotification = readFromGlobalState<boolean>(
    context,
    GlobalStateKey.HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION,
  );

  if (!hasShownTenInsertsMilestoneNotification && commandUsageCount >= 10) {
    // Show ten inserts milestone notification (non-blocking) with version info
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_TEN_INSERTS,
      version,
      context,
    );

    // Only mark as shown if it was actually displayed (not blocked by cooldown)
    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_TEN_INSERTS_MILESTONE_NOTIFICATION,
        true,
      );
    }
    return;
  }

  // Check if user has reached the 20 inserts milestone (newsletter invitation)
  const hasShownTwentyInsertsMilestoneNotification =
    readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION,
    );
  const hasShownFiftyInsertsMilestoneNotification =
    readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION,
    );

  // Skip 20 inserts notification for existing users who already hit 50
  if (!hasShownTwentyInsertsMilestoneNotification && commandUsageCount >= 20) {
    // If user already reached 50, mark 20 as shown and skip
    if (hasShownFiftyInsertsMilestoneNotification) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION,
        true,
      );
      return;
    }

    // Show twenty inserts milestone notification (non-blocking) with version info
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_TWENTY_INSERTS,
      version,
      context,
    );

    // Only mark as shown if it was actually displayed (not blocked by cooldown)
    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_TWENTY_INSERTS_MILESTONE_NOTIFICATION,
        true,
      );
    }
    return;
  }

  // Check if user has reached the 50 inserts milestone
  if (!hasShownFiftyInsertsMilestoneNotification && commandUsageCount >= 50) {
    // Show fifty inserts milestone notification (non-blocking) with version info
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_FIFTY_INSERTS,
      version,
      context,
    );

    // Only mark as shown if it was actually displayed (not blocked by cooldown)
    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_FIFTY_INSERTS_MILESTONE_NOTIFICATION,
        true,
      );
    }
    return;
  }

  // Check if user has reached the 100 inserts milestone (pro conversion)
  const hasShownHundredInsertsMilestoneNotification =
    readFromGlobalState<boolean>(
      context,
      GlobalStateKey.HAS_SHOWN_HUNDRED_INSERTS_MILESTONE_NOTIFICATION,
    );

  if (
    !hasShownHundredInsertsMilestoneNotification &&
    commandUsageCount >= 100
  ) {
    // Show hundred inserts milestone notification (non-blocking) with version info
    const wasShown = await showNotification(
      NotificationEvent.EXTENSION_HUNDRED_INSERTS,
      version,
      context,
    );

    // Only mark as shown if it was actually displayed (not blocked by cooldown)
    if (wasShown) {
      writeToGlobalState(
        context,
        GlobalStateKey.HAS_SHOWN_HUNDRED_INSERTS_MILESTONE_NOTIFICATION,
        true,
      );
    }
  }
}
