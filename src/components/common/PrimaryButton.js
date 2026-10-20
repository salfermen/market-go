import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import CustomText from './CustomText';
import { colors, radius, shadowStrong } from '../../theme';

// Botón principal con estados: normal, presionado, cargando y deshabilitado.
// variant: 'primary' (morado) | 'dark' (oscuro, p. ej. "Agregar al carrito")
export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  style,
  testID,
}) {
  const isDisabled = disabled || loading;
  const background = variant === 'dark' ? colors.dark : colors.primary;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.small,
        { backgroundColor: background },
        variant === 'primary' && !isDisabled && shadowStrong,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <View style={styles.content}>
          {Icon ? <Icon size={size === 'sm' ? 16 : 18} color={colors.white} /> : null}
          <CustomText variant={size === 'sm' ? 'smallBold' : 'bodyBold'} color="white" numberOfLines={1}>
            {title}
          </CustomText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  small: {
    minHeight: 40,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
