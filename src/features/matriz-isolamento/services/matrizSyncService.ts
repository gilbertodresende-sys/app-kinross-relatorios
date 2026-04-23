import * as FileSystem from 'expo-file-system/legacy';

import { ManifestMatriz, MatrizesDatabase } from '../types/matriz.types';
import { matrizRepository } from './matrizRepository';

const manifestBundled = require('../../../../datamatriz/manifest/manifest.json') as ManifestMatriz;

const REMOTE_TIMEOUT_MS = 15000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Tempo limite excedido na sincronização.')), timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await withTimeout(fetch(url), REMOTE_TIMEOUT_MS);

  if (!response.ok) {
    throw new Error(`Falha ao buscar recurso remoto. HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

export const matrizSyncService = {
  async getBundledManifest(): Promise<ManifestMatriz> {
    return manifestBundled;
  },

  async getRemoteManifest(): Promise<ManifestMatriz | null> {
    if (!manifestBundled.jsonUrl) return null;

    try {
      const manifestUrl = manifestBundled.jsonUrl.replace(/\/json\/[^/]+$/i, '/manifest/manifest.json');
      return await fetchJson<ManifestMatriz>(manifestUrl);
    } catch (error) {
      console.warn('Não foi possível buscar o manifest remoto:', error);
      return null;
    }
  },

  async syncIfNeeded(): Promise<{
    updated: boolean;
    version: string;
    updatedAt: string;
    message: string;
  }> {
    const bundled = await this.getBundledManifest();
    const currentDb = await matrizRepository.getDatabase();

    if (!bundled.jsonUrl) {
      return {
        updated: false,
        version: currentDb.version,
        updatedAt: currentDb.updatedAt,
        message: 'Sincronização remota não configurada. Usando base local.',
      };
    }

    try {
      const remoteManifest = await this.getRemoteManifest();

      if (!remoteManifest?.jsonUrl) {
        return {
          updated: false,
          version: currentDb.version,
          updatedAt: currentDb.updatedAt,
          message: 'Manifest remoto indisponível. Usando base local.',
        };
      }

      if (remoteManifest.version === currentDb.version) {
        return {
          updated: false,
          version: currentDb.version,
          updatedAt: currentDb.updatedAt,
          message: 'Base já está atualizada.',
        };
      }

      const remoteDb = await fetchJson<MatrizesDatabase>(remoteManifest.jsonUrl);
      await matrizRepository.saveDatabase(remoteDb);

      return {
        updated: true,
        version: remoteDb.version,
        updatedAt: remoteDb.updatedAt,
        message: 'Base atualizada com sucesso.',
      };
    } catch (error) {
      console.warn('Erro ao sincronizar matrizes:', error);

      return {
        updated: false,
        version: currentDb.version,
        updatedAt: currentDb.updatedAt,
        message: 'Falha na sincronização. Mantendo base local.',
      };
    }
  },

  async downloadPdfIfConfigured(pdfUrl: string, fileName: string): Promise<string> {
    const dir = `${FileSystem.documentDirectory}datamatriz/pdf/`;
    const dirInfo = await FileSystem.getInfoAsync(dir);

    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    const target = `${dir}${fileName}`;
    const info = await FileSystem.getInfoAsync(target);

    if (info.exists) return target;

    const download = await FileSystem.downloadAsync(pdfUrl, target);
    return download.uri;
  },
};