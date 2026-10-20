import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';

// Formas orgánicas decorativas de las pantallas de autenticación
// (Crear cuenta, Iniciar sesión, Contraseña), tomadas del prototipo de Figma.
// Se dibujan con SVG para que escalen sin perder calidad.

const BLOB_A =
  'M47.5,-57.2C59.9,-45.9,67.4,-29.1,70.2,-11.6C73,5.9,71.1,24.1,61.9,37.6C52.7,51.1,36.2,59.9,18.7,65.6C1.2,71.3,-17.3,73.9,-33.5,67.6C-49.7,61.3,-63.6,46.1,-70.2,28.6C-76.8,11.1,-76.1,-8.7,-68.3,-24.7C-60.5,-40.7,-45.6,-52.9,-29.9,-63.2C-14.2,-73.5,2.3,-81.9,17.6,-78.4C32.9,-74.9,35.1,-68.5,47.5,-57.2Z';
const BLOB_B =
  'M39.9,-51.6C52.4,-38.8,63.6,-26,68.1,-10.6C72.6,4.8,70.4,22.8,61.2,35.9C52,49,35.8,57.2,18.6,63.3C1.4,69.4,-16.8,73.4,-31.6,67.4C-46.4,61.4,-57.8,45.4,-65.4,27.9C-73,10.4,-76.8,-8.6,-70.6,-23.9C-64.4,-39.2,-48.2,-50.8,-32.4,-62.9C-16.6,-75,-1.2,-87.6,11.9,-84.1C25,-80.6,27.4,-64.4,39.9,-51.6Z';
const BLOB_C =
  'M54.3,-63.4C68.3,-52.3,76.3,-33.4,78.1,-14.5C79.9,4.4,75.5,23.3,65.1,37.4C54.7,51.5,38.3,60.8,20.4,67.3C2.5,73.8,-16.9,77.5,-33.5,71.4C-50.1,65.3,-63.9,49.4,-71.4,31.2C-78.9,13,-80.1,-7.5,-73.2,-24.6C-66.3,-41.7,-51.3,-55.4,-35.1,-66C-18.9,-76.6,-1.5,-84.1,15.7,-82.9C32.9,-81.7,40.3,-74.5,54.3,-63.4Z';

const VARIANTS = {
  register: [
    { d: BLOB_C, color: colors.accent, size: 300, pos: { top: -90, right: -120 } },
    { d: BLOB_A, color: colors.primaryDark, size: 240, pos: { top: -70, right: -110 } },
  ],
  login: [
    { d: BLOB_C, color: colors.accent, size: 420, pos: { top: -70, left: -40 } },
    { d: BLOB_B, color: colors.primaryDark, size: 380, pos: { top: -150, left: -150 } },
    { d: BLOB_A, color: colors.primaryDark, size: 150, pos: { top: 260, right: -80 } },
  ],
  password: [
    { d: BLOB_C, color: colors.accent, size: 340, pos: { top: -120, right: -110 } },
    { d: BLOB_B, color: colors.primaryDark, size: 380, pos: { top: -200, left: -120 } },
  ],
  onboarding: [
    { d: BLOB_B, color: colors.primaryDark, size: 360, pos: { top: -160, left: -140 } },
    { d: BLOB_C, color: colors.accent, size: 320, pos: { bottom: -140, right: -140 } },
  ],
};

export default function BlobBackground({ variant = 'register' }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {VARIANTS[variant].map((blob, index) => (
        <Svg
          key={index}
          width={blob.size}
          height={blob.size}
          viewBox="0 0 200 200"
          style={[styles.blob, blob.pos]}
        >
          <Path d={blob.d} fill={blob.color} transform="translate(100 100)" />
        </Svg>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
  },
});
