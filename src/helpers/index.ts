import { activateFreemiumLauncherMode } from './activateFreemiumLauncherMode';
import { activateProMode } from './activateProMode';
import { activateRepairMode } from './activateRepairMode';
import { activateFreemiumMode } from './activeFreemiumMode';
import { canInsertLogInDocument } from './canInsertLogInDocument';
import { deactivateRepairMode } from './deactivateRepairMode';
import { getExtensionProperties } from './config';
import { getUserActivityStatus } from './getUserActivityStatus';
import { GlobalStateKeys } from './GlobalStateKeys';
import { initialWorkspaceLogsCount } from './initialWorkspaceLogsCount/initialWorkspaceLogsCount';
import { isFreshInstall } from './isFreshInstall';
import { isJavaScriptOrTypeScriptFile, isPhpFile } from './file';
import { isProUser } from './isProUser';
import { listenToActivationDaySeven } from './listenToActivationDaySeven';
import { listenToActivationDayThree } from './listenToActivationDayThree';
import { listenToCommitWithLogs } from './listenToCommitWithLogs';
import { listenToCustomLogLibrary } from './listenToCustomLogLibrary';
import { listenToInactiveFourWeeksSurvey } from './listenToInactiveFourWeeksSurvey';
import { listenToInactiveTwoWeeksReturn } from './listenToInactiveTwoWeeksReturn';
import { listenToJSMessyFileDetection } from './listenToJSMessyFileDetection';
import { listenToJSMultiLogTypes } from './listenToJSMultiLogTypes';
import { listenToLogsInTestFile } from './listenToLogsInTestFile';
import { listenToManualConsoleLogs } from './listenToManualConsoleLogs';
import { listenToPhpFileOpenings } from './listenToPhpFileOpenings';
import { listenToPhpMessyFileDetection } from './listenToPhpMessyFileDetection';
import { listenToPhpMultiLogTypes } from './listenToPhpMultiLogTypes';
import { listenToWeekendTurboSundays } from './listenToWeekendTurboSundays';
import { loadPhpDebugMessage } from './loadPhpDebugMessage';
import { readFromGlobalState, writeToGlobalState } from './state';
import { showReleaseNotification } from './showReleaseNotification';
import { showReleaseWebView } from './showReleaseWebView';
import { traceExtensionVersionHistory } from './traceExtensionVersionHistory';
import { trackLogInsertions } from './trackLogInsertions';
import { trackLogManagementCommands } from './trackLogManagementCommands';
import { updateUserActivityStatus } from './updateUserActivityStatus';
export {
  readFromGlobalState,
  writeToGlobalState,
  GlobalStateKeys,
  getExtensionProperties,
  activateFreemiumLauncherMode,
  activateFreemiumMode,
  activateProMode,
  activateRepairMode,
  deactivateRepairMode,
  trackLogInsertions,
  trackLogManagementCommands,
  isProUser,
  isJavaScriptOrTypeScriptFile,
  isPhpFile,
  canInsertLogInDocument,
  traceExtensionVersionHistory,
  isFreshInstall,
  listenToJSMessyFileDetection,
  listenToPhpMessyFileDetection,
  listenToJSMultiLogTypes,
  listenToPhpMultiLogTypes,
  listenToWeekendTurboSundays,
  listenToCommitWithLogs,
  listenToCustomLogLibrary,
  listenToLogsInTestFile,
  listenToPhpFileOpenings,
  loadPhpDebugMessage,
  showReleaseWebView,
  showReleaseNotification,
  updateUserActivityStatus,
  getUserActivityStatus,
  listenToManualConsoleLogs,
  listenToInactiveTwoWeeksReturn,
  listenToInactiveFourWeeksSurvey,
  listenToActivationDayThree,
  listenToActivationDaySeven,
  initialWorkspaceLogsCount,
};
