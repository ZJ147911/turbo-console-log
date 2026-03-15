import vscode from 'vscode';

import { NotificationEvent } from './NotificationEvent';

/**
 * Shows a notification (simplified version without network requests)
 * @param notificationEvent Type of notification event
 * @param version Extension version
 * @param context VS Code extension context
 * @param logCount Optional log count
 * @returns boolean indicating if notification was shown
 */
export async function showNotification(
  notificationEvent: NotificationEvent,
  version: string,
  context: vscode.ExtensionContext,
  logCount?: number,
): Promise<boolean> {
  // Simplified: Always return false to disable notifications
  // This ensures no network requests are made
  return false;
}
