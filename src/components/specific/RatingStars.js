import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import CustomText from '../common/CustomText';
import { colors } from '../../theme';

// Estrellas de calificación. Si recibe onChange se vuelve interactivo
// (para escribir reseñas); si no, solo muestra el valor.
export default function RatingStars({ value = 0, size = 14, onChange, showValue = false, count, style }) {
  return (
    <View style={[styles.row, style]}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const star = (
          <Star
            size={size}
            color={filled ? colors.star : colors.border}
            fill={filled ? colors.star : 'transparent'}
          />
        );
        return onChange ? (
          <Pressable
            key={n}
            testID={`star-${n}`}
            onPress={() => onChange(n)}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`${n} estrellas`}
          >
            {star}
          </Pressable>
        ) : (
          <View key={n}>{star}</View>
        );
      })}
      {showValue ? (
        <CustomText variant="caption" color="textMuted" style={styles.value}>
          {Number(value).toFixed(1)}
          {count !== undefined ? ` (${count})` : ''}
        </CustomText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  value: {
    marginLeft: 4,
  },
});
