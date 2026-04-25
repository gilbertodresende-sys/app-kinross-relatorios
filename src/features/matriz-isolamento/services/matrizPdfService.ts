import * as Linking from 'expo-linking';

import { MatrizArquivo } from '../types/matriz.types';
import { matrizSyncService } from './matrizSyncService';

const bundledManifest = require('../../../../datamatriz/manifest/manifest.json') as {
  pdfBaseUrl?: string;
};

function buildPdfUrl(matrix: MatrizArquivo): string | null {
  if (!matrix.pdfPath) return null;

  if (/^https?:\/\//i.test(matrix.pdfPath)) {
    return matrix.pdfPath;
  }

  if (matrix.pdfPath.startsWith('/')) {
    return matrix.pdfPath;
  }

  return `/${matrix.pdfPath.replace(/^\/+/, '')}`;
}

export const matrizPdfService = {
  async openPdf(matrix: MatrizArquivo): Promise<void> {
    if (!matrix.pdfPath) {
      throw new Error('PDF oficial não configurado para esta matriz.');
    }

    const directUrl = buildPdfUrl(matrix);

    if (directUrl) {
      try {
        await Linking.openURL(directUrl);
        return;
      } catch (error) {
        console.warn('Falha ao abrir PDF por caminho direto:', error);
      }
    }

    if (bundledManifest.pdfBaseUrl) {
      const fileName = matrix.pdfPath.split('/').pop();
      if (!fileName) {
        throw new Error('Nome do arquivo PDF inválido.');
      }

      const remotePdfUrl = `${bundledManifest.pdfBaseUrl.replace(/\/$/, '')}/${fileName}`;
      const downloadedUri = await matrizSyncService.downloadPdfIfConfigured(remotePdfUrl, fileName);
      await Linking.openURL(downloadedUri);
      return;
    }

    throw new Error(
      'PDF oficial não encontrado. Para teste no web, coloque os PDFs em /public/datamatriz/pdf/... ou configure pdfBaseUrl no manifest.',
    );
  },
};