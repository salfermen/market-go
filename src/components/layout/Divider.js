import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme';

// Línea de separación estandarizada entre secciones.
export default function Divider({ spacing = 16, style }) {
  return <View style={[styles.line, { marginVertical: spacing }, style]} accessibilityElementsHidden />;
}

const styles = StyleSheet.create({
  line: {
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: colors.border,
  },
});
