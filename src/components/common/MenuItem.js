import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import CustomText from './CustomText';
import { colors, radius, spacing } from '../../theme';

// Fila de menú para Perfil y Configuración: ícono + texto + valor/flecha.
export default function MenuItem({ icon: Icon, label, value, onPress, danger = false, right, testID }) {
  const tint = danger ? colors.error : colors.primary;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {Icon ? (
        <View style={[styles.iconBox, { backgroundColor: danger ? colors.errorLight : colors.primaryLight }]}>
          <Icon size={18} color={tint} />
        </View>
      ) : null}
      <CustomText variant="bodyBold" style={[styles.label, danger && { color: colors.error }]} numberOfLines={1}>
        {label}
      </CustomText>
      {value ? (
        <CustomText variant="small" color="textMuted" numberOfLines={1}>
          {value}
        </CustomText>
      ) : null}
      {right ?? (onPress ? <ChevronRight size={18} color={colors.textLight} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontWeight: '500',
  },
});
