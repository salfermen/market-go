import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowRight, Lock } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import BlobBackground from '../../components/layout/BlobBackground';
import CustomText from '../../components/common/CustomText';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import CustomModal from '../../components/common/CustomModal';
import Avatar from '../../components/common/Avatar';
import { useAuth } from '../../store/authStore';
import { colors } from '../../theme';

const MAX_ATTEMPTS = 3;

// P-04 Contraseña (paso 2 del inicio de sesión)
// Saluda al usuario por su nombre, valida la contraseña y bloquea tras 3 intentos fallidos.
export default function Password({ navigation, route }) {
  const { email, name } = route.params ?? {};
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const onSubmit = async () => {
    if (!password) {
      setError('Escribe tu contraseña');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email, password); // si funciona, AppNavigator cambia al flujo del cliente
    } catch (e) {
      const used = attempts + 1;
      setAttempts(used);
      setPassword('');
      if (used >= MAX_ATTEMPTS) {
        setBlocked(true);
      } else {
        const left = MAX_ATTEMPTS - used;
        setError(`${e.message}. Te ${left === 1 ? 'queda 1 intento' : `quedan ${left} intentos`}.`);
      }
      setLoading(false);
    }
  };

  const goToRecovery = () => {
    setBlocked(false);
    navigation.navigate('PasswordRecovery', { email, name });
  };

  return (
    <ScreenWrapper scroll keyboard edges={['top', 'bottom']} contentStyle={styles.content}>
      <BlobBackground variant="password" />

      <View style={styles.header}>
        <Avatar name={name ?? email ?? ''} size={104} ring />
        <CustomText variant="h1" align="center" style={styles.hello}>
          ¡Hola, {name ?? 'de nuevo'}!
        </CustomText>
        <CustomText variant="body" color="textMuted" align="center">
          Escribe tu contraseña
        </CustomText>
        <CustomText variant="caption" color="textLight" align="center" style={styles.email}>
          {email}
        </CustomText>
      </View>

      <InputField
        placeholder="Contraseña"
        icon={Lock}
        secureTextEntry
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          if (error) setError(null);
        }}
        onSubmitEditing={onSubmit}
        error={error}
        autoFocus
        testID="password-input"
      />

      <Pressable onPress={goToRecovery} style={styles.forgot} testID="password-forgot">
        <CustomText variant="smallBold" color={error ? 'error' : 'primary'} align="center">
          ¿Olvidaste tu contraseña?
        </CustomText>
      </Pressable>

      <PrimaryButton title="Iniciar sesión" onPress={onSubmit} loading={loading} testID="password-submit" />

      <Pressable onPress={() => navigation.goBack()} style={styles.notYou} testID="password-not-you">
        <CustomText variant="small" color="text">
          ¿No eres tú?
        </CustomText>
        <View style={styles.arrow}>
          <ArrowRight size={14} color={colors.white} />
        </View>
      </Pressable>

      <CustomModal
        visible={blocked}
        variant="warning"
        title="Has alcanzado el número máximo de intentos"
        message="Por seguridad, restablece tu contraseña o vuelve a intentarlo más tarde."
        primaryText="Restablecer"
        onPrimary={goToRecovery}
        secondaryText="De acuerdo"
        onSecondary={() => navigation.goBack()}
        onClose={() => navigation.goBack()}
        testID="password-blocked"
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 110,
    marginBottom: 28,
  },
  hello: {
    marginTop: 18,
    marginBottom: 6,
  },
  email: {
    marginTop: 4,
  },
  forgot: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  notYou: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 28,
  },
  arrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
