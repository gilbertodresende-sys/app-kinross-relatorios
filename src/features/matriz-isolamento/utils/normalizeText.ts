export function normalizeWhitespace(value: string): string {
  return value.replace(/\r/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

export function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeSearchText(value: string): string {
  return stripAccents(value)
    .toLowerCase()
    .replace(/\r/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeEquipmentCode(value: string): string {
  return stripAccents(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export function splitMultilineText(value?: string | null): string[] {
  if (!value) return [];

  return normalizeWhitespace(String(value))
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values.map((v) => normalizeWhitespace(v)).filter(Boolean)) {
    const key = normalizeSearchText(value);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result;
}