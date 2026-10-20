// Constantes compartidas por varias pantallas.

// Estados de un pedido vistos por el cliente
export const CLIENT_ORDER_STATUS = {
  paid: { label: 'Pagado', tone: 'info' },
  packed: { label: 'Empacado', tone: 'warning' },
  shipped: { label: 'En camino', tone: 'primary' },
  delivered: { label: 'Entregado', tone: 'success' },
};

// Pasos del seguimiento de envío (Deliver.js)
export const TRACKING_STEPS = [
  { key: 'paid', title: 'Pedido confirmado', description: 'Recibimos tu pago y avisamos al vendedor.' },
  { key: 'packed', title: 'Empacado', description: 'El emprendimiento preparó tu paquete.' },
  { key: 'shipped', title: 'En camino', description: 'La transportadora recogió el paquete.' },
  { key: 'delivered', title: 'Entregado', description: 'El paquete llegó a la dirección indicada.' },
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'Única'];

export const FILTER_COLORS = [
  { name: 'Blanco', hex: '#F9FAFB' },
  { name: 'Negro', hex: '#1F2937' },
  { name: 'Azul', hex: '#60A5FA' },
  { name: 'Rojo', hex: '#F87171' },
  { name: 'Verde', hex: '#34D399' },
  { name: 'Rosa', hex: '#F9A8D4' },
  { name: 'Café', hex: '#92400E' },
  { name: 'Beige', hex: '#E7D7B9' },
];

export const SORT_OPTIONS = [
  { key: 'popular', label: 'Popular' },
  { key: 'newest', label: 'Lo más nuevo' },
  { key: 'price_asc', label: 'Precio: menor a mayor' },
  { key: 'price_desc', label: 'Precio: mayor a menor' },
  { key: 'rating', label: 'Mejor calificados' },
];

// Colores de los "chips" de estado
export const TONES = {
  info: { bg: '#DBEAFE', fg: '#1D4ED8' },
  warning: { bg: '#FEF3C7', fg: '#B45309' },
  primary: { bg: '#EDE9FE', fg: '#6D28D9' },
  success: { bg: '#DCFCE7', fg: '#15803D' },
  error: { bg: '#FFE4EA', fg: '#BE123C' },
  neutral: { bg: '#F3F4F6', fg: '#4B5563' },
};

export const APP_VERSION = '0.2.0';
export const SUPPORT_EMAIL = 'soporte@marketgo.co';
