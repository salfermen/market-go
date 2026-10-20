import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors, textVariants } from '../../theme';

// Texto base de la app. Evita usar <Text> directamente para mantener
// la misma escala tipográfica y colores en todas las pantallas.
//
// <CustomText variant="h2" color="primary">Título</CustomText>
const HEADINGS = ['hero', 'h1', 'h2', 'h3'];

export default function CustomText({
  variant = 'body',
  color,
  align,
  weight,
  style,
  children,
  ...rest
}) {
  const defaultColor = HEADINGS.includes(variant) ? colors.ink : colors.text;
  return (
    <Text
      style={[
        styles.base,
        textVariants[variant],
        { color: colors[color] ?? color ?? defaultColor },
        align && { textAlign: align },
        weight && { fontWeight: weight },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
