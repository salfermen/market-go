import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react-native';
import CustomText from './CustomText';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import { colors, radius, spacing } from '../../theme';

// Modal base reutilizable para confirmaciones, mensajes de éxito/error y cargas.
// Ej.: "¿Seguro que deseas vaciar el carrito?", "¡Cuenta creada!", "Procesando pago…"
const VARIANTS = {
  success: { Icon: CircleCheck, color: colors.success, bg: colors.successLight },
  error: { Icon: CircleAlert, color: colors.error, bg: colors.errorLight },
  warning: { Icon: TriangleAlert, color: colors.warning, bg: colors.warningLight },
  info: { Icon: Info, color: colors.primary, bg: colors.primaryLight },
};

export default function CustomModal({
  visible,
  onClose,
  variant = 'info',
  title,
  message,
  loading = false,
  primaryText,
  onPrimary,
  primaryVariant = 'primary',
  secondaryText,
  onSecondary,
  children,
  hideIcon = false,
  align = 'center',
  testID,
}) {
  const config = VARIANTS[variant] ?? VARIANTS.info;
  const { Icon } = config;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={loading ? undefined : onClose} testID={testID}>
        {/* El Pressable interno evita que tocar la tarjeta cierre el modal */}
        <Pressable style={styles.card} onPress={() => {}} accessibilityViewIsModal>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.icon} />
          ) : hideIcon ? null : (
            <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
              <Icon size={30} color={config.color} />
            </View>
          )}

          {title ? (
            <CustomText variant="h3" align={align} style={[styles.title, align === 'left' && styles.stretch]}>
              {title}
            </CustomText>
          ) : null}
          {message ? (
            <CustomText variant="small" color="textMuted" align={align} style={[styles.message, align === 'left' && styles.stretch]}>
              {message}
            </CustomText>
          ) : null}

          {children ? (
            <ScrollView style={styles.children} contentContainerStyle={styles.childrenContent} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          ) : null}

          {primaryText || secondaryText ? (
            <View style={styles.actions}>
              {secondaryText ? (
                <SecondaryButton
                  title={secondaryText}
                  onPress={onSecondary ?? onClose}
                  variant="ghost"
                  style={styles.action}
                  testID="modal-secondary"
                />
              ) : null}
              {primaryText ? (
                <PrimaryButton
                  title={primaryText}
                  onPress={onPrimary ?? onClose}
                  variant={primaryVariant}
                  style={styles.action}
                  testID="modal-primary"
                />
              ) : null}
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
  },
  message: {
    marginBottom: spacing.sm,
  },
  stretch: {
    alignSelf: 'stretch',
  },
  children: {
    alignSelf: 'stretch',
    maxHeight: 460,
  },
  childrenContent: {
    paddingTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    alignSelf: 'stretch',
  },
  action: {
    flex: 1,
  },
});
