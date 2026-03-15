import * as vscode from 'vscode';

import { DebugMessage } from '@/debug-message';

/**
 * Loads PHP debug message
 * @param context VS Code extension context
 * @returns PHP debug message instance or null if unavailable
 */
export async function loadPhpDebugMessage(
  context: vscode.ExtensionContext,
): Promise<DebugMessage | null> {
  // PHP debugging is now available for all users
  // Return null for now, as we're working on a native PHP debug message implementation
  return null;
}