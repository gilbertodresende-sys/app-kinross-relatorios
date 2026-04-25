import { MatrizItem } from '../types/matriz.types';
import { normalizeEquipmentCode } from './normalizeText';

export function filterEquipment(items: MatrizItem[], query: string): MatrizItem[] {
  const q = normalizeEquipmentCode(query);

  if (!q) return items;

  return items.filter((item) => {
    const equipment = normalizeEquipmentCode(item.equipment);
    const searchKey = normalizeEquipmentCode(item.equipmentSearchKey);

    return equipment.includes(q) || searchKey.includes(q);
  });
}