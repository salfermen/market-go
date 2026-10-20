import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, SCREEN_PADDING } from '../../theme';

// Contenedor global de cada pantalla.
// - SafeAreaView evita que el contenido quede debajo del notch o la barra de estado.
// - scroll: envuelve el contenido en un ScrollView.
// - keyboard: sube el contenido cuando aparece el teclado (formularios).
// - header / footer: zonas fijas arriba y abajo (no se desplazan con el scroll).
// edges: por defecto solo 'top' porque la barra de pestañas ya respeta el borde inferior.
export default function ScreenWrapper({
  children,
  scroll = false,
  padded = true,
  keyboard = false,
  background = colors.background,
  edges = ['top'],
  header,
  footer,
  statusBarStyle = 'dark',
  contentStyle,
  style,
  testID,
}) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[padded && styles.padded, styles.scrollContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: background }, style]} edges={edges} testID={testID}>
      <StatusBar style={statusBarStyle} />
      {header}
      {keyboard ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: SCREEN_PADDING,
  },
  scrollContent: {
    paddingBottom: 32,
  },
});
