import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import CustomText from './CustomText';
import { colors, radius, spacing } from '../../theme';

// Pestañas horizontales para filtrar contenido dentro de una pantalla.
// variant: 'pill' (chips redondeados) | 'underline' (subrayado)
//   <SegmentedTabs options={[{ key: 'all', label: 'Todos' }]} value={tab} onChange={setTab} />
export default function SegmentedTabs({ options, value, onChange, variant = 'pill', scrollable = false, style }) {
  const content = options.map((option) => {
    const active = option.key === value;
    return (
      <Pressable
        key={option.key}
        testID={`tab-${option.key}`}
        onPress={() => onChange(option.key)}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        style={[
          variant === 'pill' ? styles.pill : styles.underline,
          !scrollable && styles.flexItem,
          active && (variant === 'pill' ? styles.pillActive : styles.underlineActive),
        ]}
      >
        <CustomText
          variant="smallBold"
          numberOfLines={1}
          style={{ color: active ? (variant === 'pill' ? colors.white : colors.primary) : colors.textMuted }}
        >
          {option.label}
          {option.count !== undefined ? ` (${option.count})` : ''}
        </CustomText>
      </Pressable>
    );
  });

  if (scrollable) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, style]}>
        {content}
      </ScrollView>
    );
  }
  return <View style={[styles.row, variant === 'underline' && styles.underlineRow, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  underlineRow: {
    gap: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  flexItem: {
    flex: 1,
  },
  pill: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.input,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: colors.primary,
  },
  underline: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  underlineActive: {
    borderBottomColor: colors.primary,
  },
});
