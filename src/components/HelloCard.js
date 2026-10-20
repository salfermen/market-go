import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from './common/CustomText';
import { colors, radius } from '../theme';

// Tarjeta de saludo / bienvenida (Bienvenida 1, 2 y 3 del flujo de navegación).
// Es un componente visual reutilizable, no una pantalla: Start.js muestra tres
// HelloCard seguidas como carrusel de bienvenida.
export default function HelloCard({ icon: Icon, tone = colors.primaryLight, title, text, children, style, testID }) {
  return (
    <View style={[styles.card, style]} testID={testID}>
      <View style={[styles.illustration, { backgroundColor: tone }]}>
        <View style={styles.ring}>
          {Icon ? <Icon size={64} color={colors.primary} strokeWidth={1.5} /> : null}
        </View>
      </View>
      <View style={styles.body}>
        <CustomText variant="h2" align="center">
          {title}
        </CustomText>
        <CustomText variant="small" color="textMuted" align="center" style={styles.text}>
          {text}
        </CustomText>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    boxShadow: '0px 12px 30px rgba(11, 27, 67, 0.15)',
  },
  illustration: {
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 24,
    paddingBottom: 28,
  },
  text: {
    marginTop: 10,
    lineHeight: 20,
  },
});
