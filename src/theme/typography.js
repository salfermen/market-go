// Escala tipográfica. Se usa la fuente del sistema (Roboto en Android,
// San Francisco en iOS) para no agregar dependencias de fuentes.

export const textVariants = {
  hero: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, lineHeight: 40 },
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700' },
  h3: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
  small: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  smallBold: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500', lineHeight: 14 },
  price: { fontSize: 16, fontWeight: '800' },
};

export default textVariants;
