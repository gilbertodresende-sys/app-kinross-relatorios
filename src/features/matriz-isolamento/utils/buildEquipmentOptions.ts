import { MatrizItem, OptionItem } from '../types/matriz.types';

export function buildEquipmentOptions(items: MatrizItem[]): OptionItem[] {
  return items
    .map((item) => ({
      label: item.equipment,
      value: item.equipment,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}