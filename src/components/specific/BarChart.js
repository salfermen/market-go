import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from '../common/CustomText';
import { colors } from '../../theme';

// Gráfica de barras simple hecha con Views (sin librerías externas).
// La barra más alta (o la indicada en highlightIndex) se resalta en morado oscuro.
export default function BarChart({ data, height = 150, highlightIndex, formatValue, showValues = false }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const highlight = highlightIndex ?? data.findIndex((d) => d.value === max);

  return (
    <View accessibilityRole="image" accessibilityLabel={`Gráfica de barras: ${data.map((d) => `${d.label} ${formatValue ? formatValue(d.value) : d.value}`).join(', ')}`}>
      <View style={[styles.bars, { height }]}>
        {data.map((d, index) => (
          <View key={d.label} style={styles.column}>
            {showValues ? (
              <CustomText variant="caption" color="textMuted" style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
                {formatValue ? formatValue(d.value) : d.value}
              </CustomText>
            ) : null}
            <View
              style={[
                styles.bar,
                {
                  height: `${Math.max((d.value / max) * 100, 3)}%`,
                  backgroundColor: index === highlight ? colors.primary : colors.primaryLight,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.labels}>
        {data.map((d) => (
          <CustomText key={d.label} variant="caption" color="textMuted" align="center" style={styles.label}>
            {d.label}
          </CustomText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  column: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  value: {
    marginBottom: 4,
    fontSize: 9,
  },
  labels: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  label: {
    flex: 1,
  },
});
