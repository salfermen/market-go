import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import CustomText from './CustomText';
import { colors } from '../../theme';

// Control "–  1  +" para cantidades. Respeta mínimo y máximo (stock).
export default function QuantityStepper({ value, onChange, min = 1, max = 99, size = 'md', testID }) {
  const dimension = size === 'sm' ? 28 : 36;
  const canDecrease = value > min;
  const canIncrease = value < max;

  return (
    <View style={styles.row} testID={testID}>
      <Pressable
        onPress={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        accessibilityRole="button"
        accessibilityLabel="Disminuir cantidad"
        style={[styles.button, { width: dimension, height: dimension }, !canDecrease && styles.disabled]}
      >
        <Minus size={16} color={colors.primary} />
      </Pressable>
      <View style={[styles.value, { height: dimension }]}>
        <CustomText variant="bodyBold">{value}</CustomText>
      </View>
      <Pressable
        onPress={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        accessibilityRole="button"
        accessibilityLabel="Aumentar cantidad"
        style={[styles.button, { width: dimension, height: dimension }, !canIncrease && styles.disabled]}
      >
        <Plus size={16} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  button: {
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    minWidth: 36,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.35,
  },
});
