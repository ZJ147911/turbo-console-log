import { AxiosError } from 'axios';
import * as vscode from 'vscode';

import { ExtensionProperties } from '../../entities';
import { showNotification } from '../../ui';
import { fetchProBundle } from './fetchProBundle';
import { isOnline } from './isOnline';
import { runProBundle } from './runProBundle';
import { writeProBundleToCache } from './writeProBundleToCache';

export async function updateProBundle(
  context: vscode.ExtensionContext,
  proVersion: string,
  licenseKey: string,
  extensionProperties: ExtensionProperties,
) {
  const isUserConnectedToInternet = await isOnline();
  const errorMsg =
    'Something went wrong while updating your Pro bundle, please check the Turbo Pro panel for more context and a chance to retry!';

  if (!isUserConnectedToInternet) {
    vscode.window.showErrorMessage(errorMsg);
    throw new Error(
      '📡 No internet connection. Please connect and try again from the panel!',
    );
  }
  try {
    const proBundle = await fetchProBundle(licenseKey, proVersion);
    writeProBundleToCache(context, licenseKey, proBundle, proVersion);
    await runProBundle(extensionProperties, proBundle, context);
    showNotification(
      `🎉 Pro Bundle Updated v${proVersion}, reload your window please!`,
      10000,
    );
  } catch (error) {
    console.error('Turbo Pro update failed: ', error);
    let errorMsg =
      (error as { message?: string })?.message ?? 'Something went wrong!';
    if (error instanceof AxiosError) {
      errorMsg = error.response?.data?.error;
    }
    vscode.window.showErrorMessage(errorMsg);
    throw new Error(errorMsg);
  }
}
