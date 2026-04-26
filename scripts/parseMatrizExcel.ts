/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

type SupervisaoTipo = 'eletrica' | 'instrumentacao';

interface MatrizIsolationPair {
  energy: string;
  target: string;
  procedure: string;
}

interface MatrizItem {
  itemNumber?: number;
  equipment: string;
  equipmentSearchKey: string;
  energies: string[];
  isolationTargets: string[];
  procedures: string[];
  isolationPairs: MatrizIsolationPair[];
  notes?: string[];
}

interface MatrizArquivo {
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

interface MatrizesDatabase {
  version: string;
  updatedAt: string;
  matrices: MatrizArquivo[];
}

interface MatrizResumo {
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

interface CatalogoMatrizes {
  version: string;
  updatedAt: string;
  matrices: MatrizResumo[];
}

const ROOT = process.cwd();
const DEFAULT_ELETRICA = path.join(ROOT, 'Matriz_Isolamento_Eletrica_P2.xlsx');
const DEFAULT_INSTRUMENTACAO = path.join(ROOT, 'Matriz_Isolamento_Instrumentação_P2.xlsx');
const OUTPUT_DB_JSON = path.join(ROOT, 'datamatriz', 'json', 'matrizes.json');
const OUTPUT_CATALOGO_JSON = path.join(ROOT, 'datamatriz', 'json', 'catalogo-matrizes.json');

function normalizeWhitespace(value: string): string {
  return value.replace(/\r/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeSearchText(value: string): string {
  return stripAccents(value).toLowerCase().replace(/\s+/g, ' ').trim();
}

function normalizeEquipmentCode(value: string): string {
  return stripAccents(value).toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function splitMultilineText(value: string): string[] {
  return normalizeWhitespace(value)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of values) {
    const value = normalizeWhitespace(raw);
    if (!value) continue;

    const key = normalizeSearchText(value);
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(value);
  }

  return result;
}

function uniquePairs(values: MatrizIsolationPair[]): MatrizIsolationPair[] {
  const seen = new Set<string>();
  const result: MatrizIsolationPair[] = [];

  for (const pair of values) {
    const energy = normalizeWhitespace(pair.energy);
    const target = normalizeWhitespace(pair.target);
    const procedure = normalizeWhitespace(pair.procedure);

    if (!energy && !target && !procedure) continue;

    const key = [
      normalizeSearchText(energy),
      normalizeSearchText(target),
      normalizeSearchText(procedure),
    ].join('|||');

    if (seen.has(key)) continue;
    seen.add(key);

    result.push({
      energy,
      target,
      procedure,
    });
  }

  return result;
}

function cellToString(value: unknown): string {
  if (value == null) return '';
  return normalizeWhitespace(String(value));
}

function isNumericSequence(value: string): boolean {
  const raw = normalizeWhitespace(value);
  return /^\d+$/.test(raw);
}

function looksLikeEquipmentCode(value: string): boolean {
  const raw = normalizeWhitespace(value);
  if (!raw) return false;

  const normalized = normalizeEquipmentCode(raw);
  if (!normalized) return false;

  const invalidTerms = [
    'registro',
    'ondevoutrabalhar',
    'energiasexistentes',
    'oquedeveraserisolado',
    'comofazer',
    'equipemultidisciplinar',
    'responsaveldesignado',
    'referenciabibliografica',
    'aprovacaodamatriz',
    'definicoesdasenergias',
    'pagina',
  ];

  if (invalidTerms.some((term) => normalized.includes(term))) {
    return false;
  }

  return /[a-z]/i.test(raw) && /\d/.test(raw);
}

function isHeaderRow(row: string[]): boolean {
  const rowText = normalizeSearchText(row.join(' | '));

  return (
    rowText.includes('onde vou trabalhar') &&
    rowText.includes('energias existentes') &&
    rowText.includes('o que devera ser isolado')
  );
}

function isAdministrativeRow(row: string[]): boolean {
  const text = normalizeSearchText(row.join(' '));

  return (
    text.includes('equipe multidisciplinar') ||
    text.includes('lista de oficiais de isolamento') ||
    text.includes('responsavel designado') ||
    text.includes('aprovacao da matriz') ||
    text.includes('referencia bibliografica') ||
    text.includes('referencias bibliograficas') ||
    text.includes('definicoes das energias') ||
    text.includes('gerencia:') ||
    text.includes('data da revisao') ||
    text.includes('pagina ') ||
    text.includes('assinatura') ||
    text.includes('departamento')
  );
}

function extractMeta(rows: string[][], sheetName: string, supervisao: SupervisaoTipo) {
  let area = '';
  let revision = '';
  let updatedAt = '';

  for (const row of rows.slice(0, 25)) {
    const joined = row.join(' | ');

    if (!area) {
      const match = joined.match(/ÁREA:\s*([^|]+)/i) || joined.match(/AREA:\s*([^|]+)/i);
      if (match) area = normalizeWhitespace(match[1]);
    }

    if (!revision) {
      const match = joined.match(/REVISÃO:\s*([^\|]+)/i) || joined.match(/REVISAO:\s*([^\|]+)/i);
      if (match) revision = normalizeWhitespace(match[1]);
    }

    if (!updatedAt) {
      const match =
        joined.match(/DATA DA REVISÃO:\s*([^\|]+)/i) ||
        joined.match(/DATA DA REVISAO:\s*([^\|]+)/i);
      if (match) updatedAt = normalizeWhitespace(match[1]);
    }
  }

  return {
    id: `${supervisao}-${sheetName}`,
    code: sheetName,
    name: sheetName,
    supervisao,
    area: area || sheetName,
    revision,
    updatedAt,
    pdfPath: `/datamatriz/pdf/${supervisao}/${sheetName}.pdf`,
  };
}

function appendValues(target: string[], values: string[]): string[] {
  return uniqueNonEmpty([...target, ...values]);
}

function appendPairs(target: MatrizIsolationPair[], values: MatrizIsolationPair[]): MatrizIsolationPair[] {
  return uniquePairs([...target, ...values]);
}

function buildRowPairs(energy: string, targetColumns: string[], procedureColumns: string[]): MatrizIsolationPair[] {
  const maxLen = Math.max(targetColumns.length, procedureColumns.length);
  const pairs: MatrizIsolationPair[] = [];

  for (let i = 0; i < maxLen; i += 1) {
    const target = targetColumns[i] ?? '';
    const procedure = procedureColumns[i] ?? '';

    if (!target && !procedure && !energy) continue;

    pairs.push({
      energy,
      target,
      procedure,
    });
  }

  return uniquePairs(pairs);
}

function parseSheet(rows: string[][], sheetName: string, supervisao: SupervisaoTipo): MatrizArquivo {
  const meta = extractMeta(rows, sheetName, supervisao);

  const grouped = new Map<string, MatrizItem>();
  let currentEquipmentKey = '';
  let currentItemNumber: number | undefined;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];

    if (isHeaderRow(row)) {
      continue;
    }

    if (isAdministrativeRow(row)) {
      currentEquipmentKey = '';
      currentItemNumber = undefined;
      continue;
    }

    const colA = cellToString(row[0]);
    const colB = cellToString(row[1]);
    const colC = cellToString(row[2]);
    const colD = cellToString(row[3]);
    const colE = cellToString(row[4]);
    const colF = cellToString(row[5]);
    const colG = cellToString(row[6]);
    const colH = cellToString(row[7]);
    const colI = cellToString(row[8]);
    const colJ = cellToString(row[9]);

    const rowText = [colA, colB, colC, colD, colE, colF, colG, colH, colI, colJ].join(' ').trim();
    if (!rowText) continue;

    const hasSequence = isNumericSequence(colA);
    const hasEquipment = looksLikeEquipmentCode(colB);

    const targetColumns = [colD, colE, colF, colG].filter(Boolean);
    const procedureColumns = [colH, colI, colJ].filter(Boolean);
    const rowPairs = buildRowPairs(colC, targetColumns, procedureColumns);
    const combinedIsolation = targetColumns.join('\n');
    const combinedProcedure = procedureColumns.join('\n');

    const startsNewEquipment = hasSequence && hasEquipment;

    if (startsNewEquipment) {
      const key = normalizeEquipmentCode(colB);
      currentEquipmentKey = key;
      currentItemNumber = Number(colA) || undefined;

      const existing = grouped.get(key);

      if (existing) {
        existing.energies = appendValues(existing.energies, splitMultilineText(colC));
        existing.isolationTargets = appendValues(existing.isolationTargets, splitMultilineText(combinedIsolation));
        existing.procedures = appendValues(existing.procedures, splitMultilineText(combinedProcedure));
        existing.isolationPairs = appendPairs(existing.isolationPairs, rowPairs);

        if (!existing.itemNumber && currentItemNumber) {
          existing.itemNumber = currentItemNumber;
        }
      } else {
        grouped.set(key, {
          itemNumber: currentItemNumber,
          equipment: colB,
          equipmentSearchKey: key,
          energies: uniqueNonEmpty(splitMultilineText(colC)),
          isolationTargets: uniqueNonEmpty(splitMultilineText(combinedIsolation)),
          procedures: uniqueNonEmpty(splitMultilineText(combinedProcedure)),
          isolationPairs: uniquePairs(rowPairs),
          notes: [],
        });
      }

      continue;
    }

    const isContinuationRow =
      !!currentEquipmentKey &&
      !hasEquipment &&
      !isHeaderRow(row) &&
      !isAdministrativeRow(row) &&
      (!!colC || targetColumns.length > 0 || procedureColumns.length > 0);

    if (!isContinuationRow) {
      continue;
    }

    const current = grouped.get(currentEquipmentKey);
    if (!current) continue;

    current.energies = appendValues(current.energies, splitMultilineText(colC));
    current.isolationTargets = appendValues(current.isolationTargets, splitMultilineText(combinedIsolation));
    current.procedures = appendValues(current.procedures, splitMultilineText(combinedProcedure));
    current.isolationPairs = appendPairs(current.isolationPairs, rowPairs);
  }

  const items = Array.from(grouped.values())
    .map((item) => ({
      ...item,
      energies: uniqueNonEmpty(
        item.isolationPairs.length
          ? item.isolationPairs.map((pair) => pair.energy).filter(Boolean)
          : item.energies,
      ),
      isolationTargets: uniqueNonEmpty(
        item.isolationPairs.length
          ? item.isolationPairs.map((pair) => pair.target).filter(Boolean)
          : item.isolationTargets,
      ),
      procedures: uniqueNonEmpty(
        item.isolationPairs.length
          ? item.isolationPairs.map((pair) => pair.procedure).filter(Boolean)
          : item.procedures,
      ),
      isolationPairs: uniquePairs(item.isolationPairs),
    }))
    .filter(
      (item) =>
        item.equipment &&
        (item.isolationPairs.length || item.isolationTargets.length || item.procedures.length),
    )
    .sort((a, b) => {
      const aNum = a.itemNumber ?? Number.MAX_SAFE_INTEGER;
      const bNum = b.itemNumber ?? Number.MAX_SAFE_INTEGER;
      if (aNum !== bNum) return aNum - bNum;
      return a.equipment.localeCompare(b.equipment, 'pt-BR');
    });

  return {
    ...meta,
    items,
  };
}

function readWorkbook(filePath: string, supervisao: SupervisaoTipo): MatrizArquivo[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath, {
    cellDates: false,
    raw: false,
  });

  const matrices: MatrizArquivo[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false,
    });

    const matrix = parseSheet(rows, sheetName, supervisao);
    matrices.push(matrix);

    console.log(
      `[OK] ${supervisao} / ${sheetName} -> ${matrix.items.length} equipamentos consolidados.`,
    );
  }

  return matrices;
}

function buildCatalog(matrices: MatrizArquivo[], version: string, updatedAt: string): CatalogoMatrizes {
  return {
    version,
    updatedAt,
    matrices: matrices
      .map((matrix) => ({
        id: matrix.id,
        code: matrix.code,
        name: matrix.name,
        supervisao: matrix.supervisao,
        area: matrix.area,
        revision: matrix.revision,
        updatedAt: matrix.updatedAt,
        pdfPath: matrix.pdfPath,
        equipmentCount: matrix.items.length,
      }))
      .sort((a, b) => {
        if (a.supervisao !== b.supervisao) {
          return a.supervisao.localeCompare(b.supervisao);
        }
        return a.code.localeCompare(b.code, 'pt-BR');
      }),
  };
}

function ensureOutputDir(filePath: string): void {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const eletricaPath = process.argv[2] || DEFAULT_ELETRICA;
  const instrumentacaoPath = process.argv[3] || DEFAULT_INSTRUMENTACAO;

  const matrices = [
    ...readWorkbook(eletricaPath, 'eletrica'),
    ...readWorkbook(instrumentacaoPath, 'instrumentacao'),
  ];

  const version = new Date().toISOString().slice(0, 10);
  const updatedAt = new Date().toISOString();

  const database: MatrizesDatabase = {
    version,
    updatedAt,
    matrices,
  };

  const catalog = buildCatalog(matrices, version, updatedAt);

  ensureOutputDir(OUTPUT_DB_JSON);
  ensureOutputDir(OUTPUT_CATALOGO_JSON);

  fs.writeFileSync(OUTPUT_DB_JSON, JSON.stringify(database, null, 2), 'utf-8');
  fs.writeFileSync(OUTPUT_CATALOGO_JSON, JSON.stringify(catalog, null, 2), 'utf-8');

  console.log(`[OK] Base consolidada gerada em: ${OUTPUT_DB_JSON}`);
  console.log(`[OK] Catálogo resumido gerado em: ${OUTPUT_CATALOGO_JSON}`);
  console.log(`[OK] Total de matrizes: ${database.matrices.length}`);
}

main();