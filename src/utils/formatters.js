// Funciones para formatear precios, fechas y textos.

// 89900 -> "$ 89.900" (pesos colombianos, sin decimales)
// Se hace a mano en lugar de Intl para obtener el mismo resultado en Android, iOS y web.
export function formatPrice(value) {
  const amount = Math.round(Number(value) || 0);
  const withDots = Math.abs(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${amount < 0 ? '-' : ''}$ ${withDots}`;
}

// 1250 -> "1.250"
export function formatNumber(value) {
  return Math.round(Number(value) || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// 320000 -> "320 mil"; 1250000 -> "1,3 M" (etiquetas cortas de las gráficas)
export function formatShort(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace('.', ',')} M`;
  if (value >= 1000) return `${Math.round(value / 1000)} mil`;
  return String(Math.round(value));
}

// 1250000 -> "$ 1,3 M" (para gráficas y tarjetas pequeñas)
export function formatCompactPrice(value) {
  if (value >= 1000000) return `$ ${(value / 1000000).toFixed(1).replace('.', ',')} M`;
  if (value >= 1000) return `$ ${Math.round(value / 1000)} mil`;
  return formatPrice(value);
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Convierte 'AAAA-MM-DD' o 'AAAA-MM-DDTHH:mm' a Date sin problemas de zona horaria
function toDate(value) {
  if (value instanceof Date) return value;
  const [datePart, timePart = '00:00'] = String(value).split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [hh, mm] = timePart.split(':').map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0);
}

// '2026-10-14' -> "14 oct 2026"
export function formatDate(value) {
  const date = toDate(value);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// '2026-10-19T10:42' -> "19 oct, 10:42"
export function formatDateTime(value) {
  const date = toDate(value);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${hh}:${mm}`;
}

// Fecha relativa para reseñas: "Hace 2 días"
export function formatRelative(value, now = new Date()) {
  const diffDays = Math.floor((now - toDate(value)) / 86400000);
  if (diffDays <= 0) return 'Hoy';
  if (diffDays === 1) return 'Hace 1 día';
  if (diffDays < 30) return `Hace ${diffDays} días`;
  return formatDate(value);
}

// 2218 segundos -> ['00', '36', '58']
export function splitCountdown(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0'));
}

// "Ramona Díaz" -> "RD"
export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

// "4111111111111111" -> "•••• •••• •••• 1111"
export function maskCard(number = '') {
  const digits = number.replace(/\D/g, '');
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

// "3001234567" -> "+57 300 123 4567"
export function formatPhone(phone = '') {
  const d = phone.replace(/\D/g, '');
  if (d.length !== 10) return phone;
  return `+57 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

// Porcentaje de descuento a partir de precio actual y anterior
export function getDiscount(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}

// plural(1, 'producto') -> "1 producto"; plural(3, 'producto') -> "3 productos"
export function plural(count, singular, pluralForm = `${singular}s`) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
