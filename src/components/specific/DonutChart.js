import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import CustomText from '../common/CustomText';
import { colors } from '../../theme';

// Gráfica de dona (estado del inventario). Cada segmento es un arco de círculo
// dibujado con strokeDasharray.
export default function DonutChart({ segments, size = 130, thickness = 16, centerValue, centerLabel }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <View style={styles.row}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surface} strokeWidth={thickness} fill="none" />
          {segments.map((seg) => {
            const length = (seg.value / total) * circumference;
            const circle = (
              <Circle
                key={seg.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                fill="none"
              />
            );
            offset += length;
            return circle;
          })}
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <CustomText variant="h2">{centerValue}</CustomText>
          <CustomText variant="caption" color="textMuted">
            {centerLabel}
          </CustomText>
        </View>
      </View>

      <View style={styles.legend}>
        {segments.map((seg) => (
          <View key={seg.label} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: seg.color }]} />
            <CustomText variant="small" color="textMuted" style={styles.legendLabel}>
              {seg.label}
            </CustomText>
            <CustomText variant="smallBold">{seg.value}</CustomText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flex: 1,
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
  },
});
