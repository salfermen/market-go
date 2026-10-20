import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from './CustomText';
import { getInitials } from '../../utils/formatters';
import { colors } from '../../theme';

const TONES = ['#EDE9FE', '#FCE7F3', '#DBEAFE', '#DCFCE7', '#FEF3C7', '#FFE4E6'];
const TEXT = ['#6D28D9', '#BE185D', '#1D4ED8', '#15803D', '#B45309', '#BE123C'];

// Círculo con las iniciales del usuario. El color depende del nombre,
// así la misma persona siempre se ve igual.
export default function Avatar({ name = '', size = 44, ring = false, style }) {
  const index = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TONES.length;
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: TONES[index] },
        ring && styles.ring,
        style,
      ]}
      accessibilityLabel={`Avatar de ${name}`}
    >
      <CustomText style={{ color: TEXT[index], fontSize: size * 0.38, fontWeight: '800' }}>{getInitials(name)}</CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 4,
    borderColor: colors.white,
    boxShadow: '0px 4px 12px rgba(11, 27, 67, 0.15)',
  },
});
