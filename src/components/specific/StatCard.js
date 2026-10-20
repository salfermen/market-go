import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from '../common/CustomText';
import { colors, radius } from '../../theme';

// Indicador (KPI) del panel del vendedor: etiqueta, valor y variación.
export default function StatCard({ label, value, change, changeLabel = 'vs. mes anterior', icon: Icon, tone = colors.primaryLight, iconColor = colors.primary, style, compact = false }) {
  const positive = Number(change) >= 0;
  return (
    <View style={[styles.card, compact && styles.compact, style]}>
      <View style={styles.header}>
        <CustomText variant="small" color="textMuted" style={styles.label} numberOfLines={2}>
          {label}
        </CustomText>
        {Icon ? (
          <View style={[styles.icon, { backgroundColor: tone }]}>
            <Icon size={18} color={iconColor} />
          </View>
        ) : null}
      </View>
      <CustomText variant={compact ? 'h2' : 'h1'} style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </CustomText>
      {change !== undefined && change !== null ? (
        <CustomText variant="caption" color="textMuted">
          <CustomText variant="caption" weight="700" style={{ color: positive ? colors.success : colors.error }}>
            {positive ? '+' : ''}
            {change}%
          </CustomText>{' '}
          {changeLabel}
        </CustomText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  compact: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    flex: 1,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    marginTop: 4,
    marginBottom: 4,
  },
});
