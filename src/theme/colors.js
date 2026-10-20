// Paleta de MarketGO.
// Se toma del logo (morado + azul marino) y del prototipo en Figma.
// Ningún componente debe escribir colores "a mano": siempre se importan de aquí.

const colors = {
  // Marca
  primary: '#7C3AED', // botones y acentos (contraste AA con texto blanco)
  primaryDark: '#6635E8', // formas decorativas (blobs) y estados presionados
  primaryLight: '#EDE9FE', // chips, fondos de iconos
  primarySoft: '#F5F3FF', // fondo de pantallas de autenticación
  accent: '#D9E4FF', // forma secundaria de los fondos decorativos
  ink: '#0B1B43', // títulos (azul marino del logo)

  // Texto
  text: '#1F2937',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',

  // Superficies
  background: '#FFFFFF',
  surface: '#F7F7FB', // fondo de paneles (vendedor) y tarjetas suaves
  input: '#F3F4F8',
  border: '#E5E7EB',
  white: '#FFFFFF',
  dark: '#1F1F2E', // botón oscuro "Agregar al carrito"

  // Estados
  error: '#E11D48',
  errorLight: '#FFE4EA',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  info: '#2563EB',
  infoLight: '#DBEAFE',

  // Complementarios
  yellow: '#FBBF24', // banner "Gran oferta"
  pink: '#FFCFDB',
  star: '#F59E0B',
  overlay: 'rgba(11, 27, 67, 0.55)',
};

export default colors;
