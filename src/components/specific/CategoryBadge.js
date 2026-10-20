import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import CustomText from '../common/CustomText';
import { getIcon } from '../../utils/icons';
import { colors, radius } from '../../theme';

// Pastilla o ícono para filtrar por categoría.
// variant: 'chip' (horizontal) | 'circle' (ícono redondo con texto debajo)
export default function CategoryBadge({ label, icon, tone, active = false, onPress, variant = 'chip', testID }) {
  const Icon = icon ? getIcon(icon) : null;

  if (variant === 'circle') {
    return (
      <Pressable testID={testID} onPress={onPress} style={styles.circleWrap} accessibilityRole="button" accessibilityState={{ selected: active }}>
        <View style={[styles.circle, { backgroundColor: tone ?? colors.primaryLight }, active && styles.circleActive]}>
          {Icon ? <Icon size={24} color={colors.ink} strokeWidth={1.7} /> : null}
        </View>
        <CustomText variant="caption" align="center" numberOfLines={1} style={active && { color: colors.primary }}>
          {label}
        </CustomText>
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      {Icon ? <Icon size={14} color={active ? colors.white : colors.primary} /> : null}
      <CustomText variant="smallBold" style={{ color: active ? colors.white : colors.text }}>
        {label}
      </CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  circleWrap: {
    width: 68,
    alignItems: 'center',
    gap: 6,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    boxShadow: '0px 3px 8px rgba(11, 27, 67, 0.12)',
  },
  circleActive: {
    borderColor: colors.primary,
  },
});
