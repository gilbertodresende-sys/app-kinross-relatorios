import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

import {
  MatrizArquivo,
  MatrizCatalogoItem,
  MatrizItem,
  MatrizesDatabase,
} from '../types/matriz.types';
import { normalizeSearchText } from '../utils/normalizeText';

const STORAGE_KEYS = {
  dbVersion: 'matriz_db_version',
  dbUpdatedAt: 'matriz_db_updated_at',
};

const DATA_DIR = `${FileSystem.documentDirectory}datamatriz/`;
const JSON_FILE = `${DATA_DIR}matrizes.json`;

const bundledDatabase = require('../../../../datamatriz/json/matrizes.json') as MatrizesDatabase;
const bundledCatalog = require('../../../../datamatriz/json/catalogo-matrizes.json') as {
  matrices?: MatrizCatalogoItem[];
};

async function ensureDataDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(DATA_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DATA_DIR, { intermediates: true });
  }
}

async function readLocalDatabase(): Promise<MatrizesDatabase | null> {
  try {
    await ensureDataDir();
    const info = await FileSystem.getInfoAsync(JSON_FILE);

    if (!info.exists) return null;

    const content = await FileSystem.readAsStringAsync(JSON_FILE);
    return JSON.parse(content) as MatrizesDatabase;
  } catch (error) {
    console.warn('Falha ao ler base local de matrizes:', error);
    return null;
  }
}

async function writeLocalDatabase(database: MatrizesDatabase): Promise<void> {
  await ensureDataDir();
  await FileSystem.writeAsStringAsync(JSON_FILE, JSON.stringify(database, null, 2));

  await AsyncStorage.setItem(STORAGE_KEYS.dbVersion, database.version);
  await AsyncStorage.setItem(STORAGE_KEYS.dbUpdatedAt, database.updatedAt);
}

function sanitizeDatabase(database: MatrizesDatabase): MatrizesDatabase {
  return {
    version: database.version ?? '0.0.0',
    updatedAt: database.updatedAt ?? new Date().toISOString(),
    matrices: Array.isArray(database.matrices) ? database.matrices : [],
  };
}

async function getDatabase(): Promise<MatrizesDatabase> {
  const local = await readLocalDatabase();

  if (local?.matrices?.length) {
    return sanitizeDatabase(local);
  }

  return sanitizeDatabase(bundledDatabase);
}

function toCatalogItem(matrix: MatrizArquivo): MatrizCatalogoItem {
  return {
    id: matrix.id,
    code: matrix.code,
    name: matrix.name,
    supervisao: matrix.supervisao,
    area: matrix.area,
    revision: matrix.revision,
    updatedAt: matrix.updatedAt,
    pdfPath: matrix.pdfPath,
    equipmentCount: matrix.items.length,
  };
}

export const matrizRepository = {
  async getDatabase(): Promise<MatrizesDatabase> {
    return getDatabase();
  },

  async saveDatabase(database: MatrizesDatabase): Promise<void> {
    await writeLocalDatabase(sanitizeDatabase(database));
  },

  async getCatalog(): Promise<MatrizCatalogoItem[]> {
    try {
      if (bundledCatalog?.matrices?.length) {
        return bundledCatalog.matrices;
      }
    } catch (error) {
      console.warn('Falha ao usar catálogo resumido embutido:', error);
    }

    const database = await getDatabase();

    return database.matrices
      .map(toCatalogItem)
      .sort((a, b) => {
        if (a.supervisao !== b.supervisao) {
          return a.supervisao.localeCompare(b.supervisao);
        }
        return a.code.localeCompare(b.code, 'pt-BR');
      });
  },

  async getMatrixById(id: string): Promise<MatrizArquivo | null> {
    const database = await getDatabase();
    return database.matrices.find((matrix) => matrix.id === id) ?? null;
  },

  async getMatricesBySupervisao(
    supervisao: 'eletrica' | 'instrumentacao',
  ): Promise<MatrizArquivo[]> {
    const database = await getDatabase();
    return database.matrices
      .filter((matrix) => matrix.supervisao === supervisao)
      .sort((a, b) => a.code.localeCompare(b.code, 'pt-BR'));
  },

  async findEquipment(matrixId: string, equipment: string): Promise<MatrizItem | null> {
    const matrix = await this.getMatrixById(matrixId);
    if (!matrix) return null;

    const key = normalizeSearchText(equipment);

    return (
      matrix.items.find(
        (item) =>
          normalizeSearchText(item.equipment) === key ||
          normalizeSearchText(item.equipmentSearchKey) === key,
      ) ?? null
    );
  },

  async getStorageMetadata(): Promise<{ version: string | null; updatedAt: string | null }> {
    const version = await AsyncStorage.getItem(STORAGE_KEYS.dbVersion);
    const updatedAt = await AsyncStorage.getItem(STORAGE_KEYS.dbUpdatedAt);

    return {
      version,
      updatedAt,
    };
  },
};