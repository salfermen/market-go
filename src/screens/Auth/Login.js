import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Heart, Info, Mail } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import BlobBackground from '../../components/layout/BlobBackground';
import CustomText from '../../components/common/CustomText';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import useForm from '../../hooks/useForm';
import { checkEmail } from '../../api/auth.api';
import { validateEmailStep } from '../../utils/validations';
import { colors } from '../../theme';

// P-03 Iniciar sesión (paso 1: correo)
// Se pide primero el correo; si la cuenta existe se pasa a Password con el nombre del usuario.
export default function Login({ navigation }) {
  const form = useForm({ email: '' }, validateEmailStep);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const onSubmit = form.handleSubmit(async ({ email }) => {
    setApiError(null);
    setLoading(true);
    try {
      const { name } = await checkEmail(email.trim());
      navigation.navigate('Password', { email: email.trim(), name });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  });

  const emailProps = form.getFieldProps('email');

  return (
    <ScreenWrapper scroll keyboard edges={['top', 'bottom']} contentStyle={styles.content}>
      <BlobBackground variant="login" />

      <View style={styles.spacer} />
      <CustomText variant="hero" accessibilityRole="header">
        Iniciar Sesión
      </CustomText>
      <View style={styles.subtitleRow}>
        <CustomText variant="body" color="textMuted">
          ¡Qué bueno verte de vuelta!
        </CustomText>
        <Heart size={16} color={colors.ink} fill={colors.ink} />
      </View>

      <InputField
        placeholder="Correo electrónico"
        icon={Mail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        returnKeyType="next"
        onSubmitEditing={onSubmit}
        testID="login-email"
        {...emailProps}
        onChangeText={(value) => {
          setApiError(null);
          emailProps.onChangeText(value);
        }}
        error={emailProps.error ?? apiError}
      />
      {apiError ? (
        <Pressable onPress={() => navigation.navigate('CreateAccount')} style={styles.createLink}>
          <CustomText variant="smallBold" color="primary">
            ¿No tienes cuenta? Crea una aquí
          </CustomText>
        </Pressable>
      ) : null}

      <PrimaryButton title="Siguiente" onPress={onSubmit} loading={loading} style={styles.submit} testID="login-next" />
      <SecondaryButton title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} testID="login-cancel" />

      <Pressable
        style={styles.demo}
        onPress={() => form.setField('email', 'ramona@marketgo.co')}
        accessibilityRole="button"
        accessibilityLabel="Usar cuenta de prueba"
        testID="login-demo"
      >
        <Info size={16} color={colors.primary} />
        <CustomText variant="caption" color="textMuted" style={styles.demoText}>
          Cuenta de prueba (toca para usarla):{'\n'}
          <CustomText variant="caption" weight="700" color="ink">
            ramona@marketgo.co · Market123
          </CustomText>
        </CustomText>
      </Pressable>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
  },
  spacer: {
    height: 330,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginBottom: 24,
  },
  createLink: {
    marginTop: -4,
    marginBottom: 4,
  },
  submit: {
    marginTop: 16,
    marginBottom: 8,
  },
  demo: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  demoText: {
    flex: 1,
  },
});
