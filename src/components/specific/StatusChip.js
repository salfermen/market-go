import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from '../common/CustomText';
import { TONES } from '../../utils/constants';

// Etiqueta de color para estados (Nuevo, Enviado, Entregado, Bajo stock…)
export default function StatusChip({ label, tone = 'neutral', style }) {
  const t = TONES[tone] ?? TONES.neutral;
  return (
    <View style={[styles.chip, { backgroundColor: t.bg }, style]}>
      <CustomText variant="caption" weight="700" style={{ color: t.fg }}>
        {label}
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
