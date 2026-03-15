import * as vscode from 'vscode';

import { isPhpFile } from './index';

/**
 * Checks if log insertion should proceed
 * @param context VS Code extension context
 * @param document The document being edited
 * @param version Extension version for notification tracking
 * @returns true if log insertion should proceed
 */
export function canInsertLogInDocument(
  context: vscode.ExtensionContext,
  document: vscode.TextDocument,
  version: string,
): boolean {
  // All users can now use PHP logging
  return true;
}
