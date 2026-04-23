import { MatrizItem } from '../types/matriz.types';
import { normalizeSearchText } from './normalizeText';

export function filterEquipment(items: MatrizItem[], query: string): MatrizItem[] {
  const q = normalizeSearchText(query);

  if (!q) return items;

  return items.filter((item) => {
    const equipment = normalizeSearchText(item.equipment);
    const searchKey = normalizeSearchText(item.equipmentSearchKey);
    const targets = item.isolationTargets.map(normalizeSearchText).join(' ');
    const procedures = item.procedures.map(normalizeSearchText).join(' ');

    return (
      equipment.includes(q) ||
      searchKey.includes(q) ||
      targets.includes(q) ||
      procedures.includes(q)
    );
  });
}