import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Camera, Check, Lock, Mail, UserRound } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import BlobBackground from '../../components/layout/BlobBackground';
import CustomText from '../../components/common/CustomText';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import CustomModal from '../../components/common/CustomModal';
import useForm from '../../hooks/useForm';
import { useAuth } from '../../store/authStore';
import { validateRegister } from '../../utils/validations';
import { getInitials } from '../../utils/formatters';
import { colors } from '../../theme';

// P-02 Crear cuenta
// Formulario con validaciones visuales: nombre, correo, contraseña segura,
// celular colombiano y aceptación de términos.
export default function CreateAccount({ navigation }) {
  const { signUp, startSession } = useAuth();
  const form = useForm({ name: '', email: '', password: '', phone: '', acceptTerms: false }, validateRegister);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [session, setSession] = useState(null); // respuesta del registro, para la confirmación

  const onSubmit = form.handleSubmit(async (values) => {
    setApiError(null);
    setLoading(true);
    try {
      const result = await signUp({ ...values, email: values.email.trim(), phone: values.phone.replace(/\s/g, '') });
      setSession(result);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setLoading(false);
    }
  });

  const initials = getInitials(form.values.name);

  return (
    <ScreenWrapper scroll keyboard edges={['top', 'bottom']} contentStyle={styles.content}>
      <BlobBackground variant="register" />

      <CustomText variant="hero" style={styles.title} accessibilityRole="header">
        Crear una{'\n'}Cuenta
      </CustomText>

      <View style={styles.avatar} accessibilityLabel="Foto de perfil">
        {initials ? (
          <CustomText variant="h2" color="primary">
            {initials}
          </CustomText>
        ) : (
          <Camera size={26} color={colors.primary} />
        )}
      </View>

      <InputField placeholder="Nombre completo" icon={UserRound} autoCapitalize="words" testID="register-name" {...form.getFieldProps('name')} />
      <InputField
        placeholder="Correo electrónico"
        icon={Mail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        testID="register-email"
        {...form.getFieldProps('email')}
      />
      <InputField
        placeholder="Contraseña"
        icon={Lock}
        secureTextEntry
        helper="Mínimo 8 caracteres, con mayúscula, minúscula y número"
        testID="register-password"
        {...form.getFieldProps('password')}
      />
      <InputField
        placeholder="Celular"
        keyboardType="phone-pad"
        maxLength={10}
        prefix={<CustomText variant="smallBold">🇨🇴 +57</CustomText>}
        testID="register-phone"
        {...form.getFieldProps('phone')}
      />

      <Pressable
        style={styles.terms}
        onPress={() => form.setField('acceptTerms', !form.values.acceptTerms)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: form.values.acceptTerms }}
        testID="register-terms"
      >
        <View style={[styles.checkbox, form.values.acceptTerms && styles.checkboxOn, form.errors.acceptTerms && styles.checkboxError]}>
          {form.values.acceptTerms ? <Check size={14} color={colors.white} /> : null}
        </View>
        <CustomText variant="small" color="textMuted" style={styles.termsText}>
          Acepto los <CustomText variant="smallBold" color="primary">términos y condiciones</CustomText> y la política de
          tratamiento de datos.
        </CustomText>
      </Pressable>
      {form.errors.acceptTerms ? (
        <CustomText variant="caption" color="error" style={styles.termsError}>
          {form.errors.acceptTerms}
        </CustomText>
      ) : null}

      {apiError ? (
        <View style={styles.apiError}>
          <CustomText variant="smallBold" color="error">
            {apiError}
          </CustomText>
        </View>
      ) : null}

      <PrimaryButton title="Hecho" onPress={onSubmit} loading={loading} style={styles.submit} testID="register-submit" />
      <SecondaryButton title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} testID="register-cancel" />

      {/* Confirmación de cuenta (flujo de navegación: Registro -> Confirmación -> Home) */}
      <CustomModal
        visible={!!session}
        variant="success"
        title="¡Cuenta creada!"
        message={`Bienvenido a MarketGO, ${session?.user.name.split(' ')[0] ?? ''}. Ganaste 100 puntos de bienvenida.`}
        primaryText="Continuar"
        onPrimary={() => startSession(session)}
        onClose={() => startSession(session)}
        testID="register-success"
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  title: {
    marginBottom: 24,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  terms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxError: {
    borderColor: colors.error,
  },
  termsText: {
    flex: 1,
  },
  termsError: {
    marginTop: 6,
    marginLeft: 32,
  },
  apiError: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.errorLight,
  },
  submit: {
    marginTop: 24,
    marginBottom: 8,
  },
});
