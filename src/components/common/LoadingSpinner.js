import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import CustomText from './CustomText';
import { colors } from '../../theme';

// Indicador de carga centralizado. Se muestra mientras la API responde.
export default function LoadingSpinner({ message = 'Cargando…', fullScreen = false, style }) {
  return (
    <View
      style={[styles.container, fullScreen && styles.fullScreen, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <CustomText variant="small" color="textMuted" style={styles.text}>
          {message}
        </CustomText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  text: {
    marginTop: 12,
  },
});
