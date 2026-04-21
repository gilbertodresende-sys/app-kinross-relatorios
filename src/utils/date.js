export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export function addDays(baseDate, days) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return d;
}

export function isDateInsideForecastRange(dateStr) {
  const selected = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  const max = addDays(today, 16);

  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const maxOnly = new Date(max.getFullYear(), max.getMonth(), max.getDate());

  return selected >= todayOnly && selected <= maxOnly;
}