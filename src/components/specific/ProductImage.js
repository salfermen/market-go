import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { getIcon } from '../../utils/icons';

// Imagen del producto.
// - Si el producto trae `image` (URL del backend), se muestra la foto.
// - Si no, se muestra una ilustración provisional: fondo pastel + ícono de la categoría.
//   Así la app funciona sin internet y sin depender de imágenes externas.
export default function ProductImage({ product, size, iconSize, radius = 12, style }) {
  const Icon = getIcon(product?.icon);
  const dimension = size ? { width: size, height: size } : null;

  if (product?.image) {
    return (
      <Image
        source={{ uri: product.image }}
        style={[styles.fill, dimension, { borderRadius: radius }, style]}
        accessibilityLabel={product.name}
      />
    );
  }

  const computedIcon = iconSize ?? (size ? size * 0.42 : 44);
  return (
    <View
      style={[styles.fill, dimension, { borderRadius: radius, backgroundColor: product?.tone ?? '#EDE9FE' }, style]}
      accessibilityRole="image"
      accessibilityLabel={product?.name}
    >
      <View style={styles.glow} />
      <Icon size={computedIcon} color="rgba(11, 27, 67, 0.55)" strokeWidth={1.6} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
});
