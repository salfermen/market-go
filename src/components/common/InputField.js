import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { CircleAlert, Eye, EyeOff } from 'lucide-react-native';
import CustomText from './CustomText';
import { colors, radius, spacing } from '../../theme';

// Caja de texto estándar con etiqueta, ícono, prefijo y mensaje de error.
// Cuando recibe `error`, el borde se pinta de rojo y el mensaje aparece debajo
// (validación visual de formularios).
export default function InputField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  helper,
  placeholder,
  icon: Icon,
  prefix,
  right,
  secureTextEntry = false,
  multiline = false,
  style,
  inputStyle,
  testID,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry);

  const borderColor = error ? colors.error : focused ? colors.primary : 'transparent';

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <CustomText variant="smallBold" color="text" style={styles.label}>
          {label}
        </CustomText>
      ) : null}

      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          { borderColor },
          error && { backgroundColor: colors.errorLight },
        ]}
      >
        {Icon ? <Icon size={18} color={error ? colors.error : colors.textMuted} /> : null}
        {prefix ? <View style={styles.prefix}>{prefix}</View> : null}

        <TextInput
          testID={testID}
          accessibilityLabel={label ?? placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          secureTextEntry={hidden}
          multiline={multiline}
          style={[styles.input, multiline && styles.inputMultiline, inputStyle]}
          {...rest}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
          >
            {hidden ? <Eye size={18} color={colors.textMuted} /> : <EyeOff size={18} color={colors.textMuted} />}
          </Pressable>
        ) : null}
        {right}
      </View>

      {error ? (
        <View style={styles.messageRow}>
          <CircleAlert size={14} color={colors.error} />
          <CustomText variant="caption" color="error" style={styles.message}>
            {error}
          </CustomText>
        </View>
      ) : helper ? (
        <CustomText variant="caption" color="textMuted" style={styles.helper}>
          {helper}
        </CustomText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.input,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.lg,
    minHeight: 50,
  },
  fieldMultiline: {
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 12,
    outlineStyle: 'none', // quita el borde azul del navegador en web
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
    paddingVertical: 0,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  message: {
    flex: 1,
  },
  helper: {
    marginTop: 6,
  },
});
