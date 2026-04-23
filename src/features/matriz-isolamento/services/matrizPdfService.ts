import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Linking from 'expo-linking';

import { MatrizArquivo } from '../types/matriz.types';
import { matrizSyncService } from './matrizSyncService';

const bundledManifest = require('../../../../datamatriz/manifest/manifest.json') as {
  pdfBaseUrl?: string;
};

function getFileNameFromPath(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

async function openLocalPdf(uri: string): Promise<void> {
  if (Platform.OS === 'android') {
    const contentUri = await FileSystem.getContentUriAsync(uri);
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      flags: 1,
      type: 'application/pdf',
    });
    return;
  }

  await Linking.openURL(uri);
}

export const matrizPdfService = {
  async openPdf(matrix: MatrizArquivo): Promise<void> {
    if (!matrix.pdfPath) {
      throw new Error('PDF oficial não configurado para esta matriz.');
    }

    if (/^https?:\/\//i.test(matrix.pdfPath)) {
      await Linking.openURL(matrix.pdfPath);
      return;
    }

    const localBundledPath = matrix.pdfPath;
    const localInfo = await FileSystem.getInfoAsync(localBundledPath);

    if (localInfo.exists) {
      await openLocalPdf(localBundledPath);
      return;
    }

    if (bundledManifest.pdfBaseUrl) {
      const fileName = getFileNameFromPath(matrix.pdfPath);
      const remotePdfUrl = `${bundledManifest.pdfBaseUrl.replace(/\/$/, '')}/${fileName}`;
      const downloadedUri = await matrizSyncService.downloadPdfIfConfigured(remotePdfUrl, fileName);
      await openLocalPdf(downloadedUri);
      return;
    }

    throw new Error('PDF oficial indisponível neste dispositivo.');
  },
};