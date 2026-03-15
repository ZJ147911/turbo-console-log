import { AxiosError } from 'axios';
import * as vscode from 'vscode';

import { Command } from '../entities';
import {
  fetchProBundle,
  runProBundle,
  writeProBundleToCache,
} from '../pro/utilities';
import { isOnline } from '../pro/utilities/isOnline';
import { showNotification } from '../ui';

/**
 * 创建激活 Turbo Pro 捆绑包的命令
 * @returns 包含命令名称和处理函数的 Command 对象
 */
export function activateTurboProBundleCommand(): Command {
  return {
    name: 'turboConsoleLog.activateTurboProBundle',
    /**
     * 处理激活 Turbo Pro 捆绑包的命令
     * @param param0 命令参数
     * @param param0.extensionProperties 扩展配置属性
     * @param param0.context VS Code 扩展上下文
     */
    handler: async ({ extensionProperties, context }) => {
      const licenseKey = (
        await vscode.window.showInputBox({
          placeHolder: 'Enter your Turbo Pro license key',
          prompt:
            'Paste the license key you received by email to activate Turbo Console Log Pro',
          ignoreFocusOut: true, // Keeps it open if user clicks outside
        })
      )?.trim();

      if (!licenseKey) {
        const result = await vscode.window.showWarningMessage(
          'Pro Activation cancelled — no license key entered!',
          'Try Again',
          'Cancel',
        );
        if (result === 'Try Again') {
          vscode.commands.executeCommand(
            'turboConsoleLog.activateTurboProBundle',
          );
        }
        return;
      }

      // Validate license key format
      if (!licenseKey.startsWith('TCLP-')) {
        const result = await vscode.window.showErrorMessage(
          '❌ Invalid license key format. License keys start with "TCLP-"',
          'Try Again',
          'Cancel',
        );
        if (result === 'Try Again') {
          vscode.commands.executeCommand(
            'turboConsoleLog.activateTurboProBundle',
          );
        }
        return;
      }

      const isUserConnectedToInternet = await isOnline();

      if (!isUserConnectedToInternet) {
        await vscode.window.showErrorMessage(
          '📡 No internet connection. Please connect and try again.',
        );
        return;
      }

      try {
        // Network request to check the key validation
        const version = vscode.extensions.getExtension(
          'ChakrounAnas.turbo-console-log',
        )?.packageJSON.version;
        const proBundle = await fetchProBundle(licenseKey, version);
        runProBundle(extensionProperties, proBundle, context);
        writeProBundleToCache(context, licenseKey, proBundle, version);
        showNotification(
          '🎉 Turbo Console Log Pro Activated, reload your window please!',
          10000,
        );
      } catch (error) {
        console.error('Turbo Pro activation failed: ', error);
        const genericErrorMsg =
          'Something went wrong, please contact the support at support@turboconsolelog.io';
        if (error instanceof AxiosError) {
          const errorMsg = error.response?.data?.error;
          vscode.window.showErrorMessage(errorMsg ?? genericErrorMsg);
          return;
        }
        showNotification(
          'Something went wrong, please contact the support at support@turboconsolelog.io',
          5000,
        );
      }
    },
  };
}
