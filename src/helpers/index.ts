import { canInsertLogInDocument } from './canInsertLogInDocument';
import { getExtensionProperties } from './config';
import { initialWorkspaceLogsCount } from './initialWorkspaceLogsCount/initialWorkspaceLogsCount';
import { isJavaScriptOrTypeScriptFile, isPhpFile } from './file';
import { loadPhpDebugMessage } from './loadPhpDebugMessage';
import { readFromGlobalState, writeToGlobalState } from './state';

export {
  readFromGlobalState,
  writeToGlobalState,
  getExtensionProperties,
  isJavaScriptOrTypeScriptFile,
  isPhpFile,
  canInsertLogInDocument,
  loadPhpDebugMessage,
  initialWorkspaceLogsCount,
};
