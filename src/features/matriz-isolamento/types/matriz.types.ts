export type SupervisaoTipo = 'eletrica' | 'instrumentacao';

export interface ManifestMatriz {
  version: string;
  updatedAt: string;
  jsonUrl?: string;
  pdfBaseUrl?: string;
}

export interface MatrizItem {
  itemNumber?: number;
  equipment: string;
  equipmentSearchKey: string;
  energies: string[];
  isolationTargets: string[];
  procedures: string[];
  notes?: string[];
}

export interface MatrizArquivo {
  id: string;
  code: string;
  name: string;
  supervisao: SupervisaoTipo;
  area?: string;
  revision?: string;
  updatedAt?: string;
  pdfPath?: string;
  items: MatrizItem[];
}

export interface MatrizesDatabase {
  version: string;
  updatedAt: string;
  matrices: MatrizArquivo[];
}

export interface MatrizCatalogoItem {
  id: string;
  code: string;
  name: string;
  supervisao: SupervisaoTipo;
  area?: string;
  revision?: string;
  updatedAt?: string;
  pdfPath?: string;
  equipmentCount: number;
}

export interface OptionItem {
  label: string;
  value: string;
}