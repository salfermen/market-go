import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomText from './CustomText';
import PrimaryButton from './PrimaryButton';
import { colors, spacing } from '../../theme';

// Mensaje para listas vacías (carrito, favoritos, búsquedas sin resultados…)
export default function EmptyState({ icon: Icon, title, message, actionText, onAction, style }) {
  return (
    <View style={[styles.container, style]}>
      {Icon ? (
        <View style={styles.iconCircle}>
          <Icon size={36} color={colors.primary} />
        </View>
      ) : null}
      <CustomText variant="h3" align="center">
        {title}
      </CustomText>
      {message ? (
        <CustomText variant="small" color="textMuted" align="center" style={styles.message}>
          {message}
        </CustomText>
      ) : null}
      {actionText ? <PrimaryButton title={actionText} onPress={onAction} size="sm" style={styles.button} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    boxShadow: '0px 6px 18px rgba(124, 58, 237, 0.18)',
  },
  message: {
    marginTop: spacing.sm,
    maxWidth: 280,
  },
  button: {
    marginTop: spacing.lg,
  },
});
