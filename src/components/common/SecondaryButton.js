import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import CustomText from './CustomText';
import { colors, radius } from '../../theme';

// Botón secundario: contorno (outline), texto (ghost) o de peligro (danger).
export default function SecondaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon: Icon,
  variant = 'outline',
  size = 'md',
  style,
  testID,
}) {
  const isDisabled = disabled || loading;
  const color = variant === 'danger' ? colors.error : variant === 'ghost' ? colors.textMuted : colors.primary;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.button,
        size === 'sm' && styles.small,
        variant === 'outline' && { borderColor: colors.primary, borderWidth: 1.5 },
        variant === 'danger' && { borderColor: colors.error, borderWidth: 1.5 },
        pressed && { backgroundColor: variant === 'danger' ? colors.errorLight : colors.primarySoft },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <View style={styles.content}>
          {Icon ? <Icon size={size === 'sm' ? 15 : 18} color={color} /> : null}
          <CustomText variant={size === 'sm' ? 'smallBold' : 'bodyBold'} style={{ color }} numberOfLines={1}>
            {title}
          </CustomText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  small: {
    minHeight: 34,
    paddingHorizontal: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  disabled: {
    opacity: 0.5,
  },
});
