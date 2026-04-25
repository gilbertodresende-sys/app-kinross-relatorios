import { MatrizItem, OptionItem } from '../types/matriz.types';
import { normalizeEquipmentCode } from './normalizeText';

export function buildEquipmentOptions(items: MatrizItem[]): OptionItem[] {
  const grouped = new Map<string, OptionItem>();

  for (const item of items) {
    const key = normalizeEquipmentCode(item.equipment);

    if (!grouped.has(key)) {
      grouped.set(key, {
        label: item.equipment,
        value: item.equipment,
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}