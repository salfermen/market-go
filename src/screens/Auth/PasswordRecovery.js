import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { CircleCheck, Lock, Mail, Smartphone } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import BlobBackground from '../../components/layout/BlobBackground';
import CustomText from '../../components/common/CustomText';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import CustomModal from '../../components/common/CustomModal';
import Avatar from '../../components/common/Avatar';
import Toast from '../../components/common/Toast';
import useForm from '../../hooks/useForm';
import useToast from '../../hooks/useToast';
import { resetPassword, sendRecoveryCode, verifyRecoveryCode } from '../../api/auth.api';
import { validateEmailStep, validateNewPassword } from '../../utils/validations';
import { colors, radius } from '../../theme';

// P-05 Recuperar contraseña
// Pasos: (correo) -> método SMS/correo -> código de 4 dígitos -> nueva contraseña -> confirmación.
export default function PasswordRecovery({ navigation, route }) {
  const initialEmail = route.params?.email ?? '';
  const name = route.params?.name;
  const [step, setStep] = useState(initialEmail ? 'method' : 'email');
  const [email, setEmail] = useState(initialEmail);
  const [method, setMethod] = useState('sms');
  const [destination, setDestination] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast, showToast } = useToast();

  const emailForm = useForm({ email: initialEmail }, validateEmailStep);
  const passwordForm = useForm({ password: '', confirm: '' }, validateNewPassword);

  const run = async (fn) => {
    setError(null);
    setLoading(true);
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const sendCode = () =>
    run(async () => {
      const result = await sendRecoveryCode({ email, method });
      setDestination(result.destination);
      setCode('');
      setStep('code');
    });

  const verify = () => {
    if (code.length < 4) {
      setError('Ingresa los 4 dígitos');
      return;
    }
    run(async () => {
      await verifyRecoveryCode({ email, code });
      setStep('reset');
    });
  };

  const save = passwordForm.handleSubmit(({ password }) =>
    run(async () => {
      await resetPassword({ email, password });
      setDone(true);
    }),
  );

  return (
    <ScreenWrapper scroll keyboard edges={['top', 'bottom']} contentStyle={styles.content}>
      <BlobBackground variant="password" />

      <View style={styles.header}>
        <Avatar name={name ?? email ?? 'M G'} size={96} ring />
        <CustomText variant="h2" align="center" style={styles.title}>
          {step === 'reset' ? 'Configurar nueva contraseña' : 'Recuperación de contraseña'}
        </CustomText>
      </View>

      {step === 'email' ? (
        <>
          <CustomText variant="body" color="textMuted" align="center" style={styles.text}>
            Escribe el correo con el que te registraste.
          </CustomText>
          <InputField placeholder="Correo electrónico" icon={Mail} keyboardType="email-address" autoCapitalize="none" testID="recovery-email" {...emailForm.getFieldProps('email')} />
          <PrimaryButton
            title="Continuar"
            onPress={emailForm.handleSubmit((v) => {
              setEmail(v.email.trim());
              setStep('method');
            })}
          />
        </>
      ) : null}

      {step === 'method' ? (
        <>
          <CustomText variant="body" color="textMuted" align="center" style={styles.text}>
            ¿Cómo quieres restablecer tu contraseña?
          </CustomText>
          <Option icon={Smartphone} label="SMS" description="Al celular registrado" active={method === 'sms'} onPress={() => setMethod('sms')} testID="recovery-sms" />
          <Option icon={Mail} label="Correo" description={email} active={method === 'email'} onPress={() => setMethod('email')} testID="recovery-mail" />
          <ErrorText error={error} />
          <PrimaryButton title="Siguiente" onPress={sendCode} loading={loading} style={styles.mainButton} testID="recovery-next" />
        </>
      ) : null}

      {step === 'code' ? (
        <>
          <CustomText variant="body" color="textMuted" align="center" style={styles.text}>
            Ingresa el código de 4 dígitos que enviamos a{'\n'}
            <CustomText variant="bodyBold" color="ink">
              {destination}
            </CustomText>
          </CustomText>
          <CodeInput value={code} onChange={(v) => { setCode(v); setError(null); }} hasError={!!error} />
          <CustomText variant="caption" color="textLight" align="center" style={styles.hint}>
            Modo de prueba: el código es 1234
          </CustomText>
          <ErrorText error={error} center />
          <PrimaryButton title="Verificar" onPress={verify} loading={loading} style={styles.mainButton} testID="recovery-verify" />
          <PrimaryButton
            title="Enviar de nuevo"
            variant="dark"
            size="sm"
            onPress={() => showToast(`Te enviamos un nuevo código a ${destination}`)}
            style={styles.resend}
          />
        </>
      ) : null}

      {step === 'reset' ? (
        <>
          <CustomText variant="body" color="textMuted" align="center" style={styles.text}>
            Por favor, establece una nueva contraseña para tu cuenta.
          </CustomText>
          <InputField placeholder="Nueva contraseña" icon={Lock} secureTextEntry testID="recovery-password" {...passwordForm.getFieldProps('password')} />
          <InputField placeholder="Repite la contraseña" icon={Lock} secureTextEntry testID="recovery-confirm" {...passwordForm.getFieldProps('confirm')} />
          <ErrorText error={error} />
          <PrimaryButton title="Guardar" onPress={save} loading={loading} style={styles.mainButton} testID="recovery-save" />
        </>
      ) : null}

      <SecondaryButton title="Cancelar" variant="ghost" onPress={() => navigation.goBack()} style={styles.cancel} />

      <CustomModal
        visible={done}
        variant="success"
        title="¡Contraseña actualizada!"
        message="Ya puedes iniciar sesión con tu nueva contraseña."
        primaryText="Volver al inicio"
        onPrimary={() => navigation.popTo('Login')}
        onClose={() => navigation.popTo('Login')}
        testID="recovery-done"
      />
      <Toast {...toast} />
    </ScreenWrapper>
  );
}

function Option({ icon: Icon, label, description, active, onPress, testID }) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      style={[styles.option, active ? styles.optionActive : styles.optionIdle]}
    >
      <Icon size={20} color={active ? colors.primary : colors.error} />
      <View style={styles.optionText}>
        <CustomText variant="bodyBold">{label}</CustomText>
        <CustomText variant="caption" color="textMuted" numberOfLines={1}>
          {description}
        </CustomText>
      </View>
      {active ? <CircleCheck size={22} color={colors.primary} fill={colors.primaryLight} /> : <View style={styles.radio} />}
    </Pressable>
  );
}

// Cuatro casillas que muestran los dígitos; un TextInput invisible recibe el teclado
function CodeInput({ value, onChange, hasError }) {
  return (
    <View style={styles.codeWrap}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.codeBox,
            value.length === i && styles.codeBoxActive,
            hasError && styles.codeBoxError,
          ]}
        >
          <CustomText variant="h2">{value[i] ? '•' : ''}</CustomText>
        </View>
      ))}
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 4))}
        keyboardType="number-pad"
        maxLength={4}
        autoFocus
        caretHidden
        style={styles.codeHidden}
        accessibilityLabel="Código de verificación"
        testID="recovery-code"
      />
    </View>
  );
}

function ErrorText({ error, center }) {
  if (!error) return null;
  return (
    <CustomText variant="smallBold" color="error" align={center ? 'center' : 'left'} style={styles.error}>
      {error}
    </CustomText>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 100,
  },
  title: {
    marginTop: 16,
  },
  text: {
    marginTop: 8,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    marginBottom: 10,
  },
  optionActive: {
    backgroundColor: colors.primaryLight,
  },
  optionIdle: {
    backgroundColor: colors.errorLight,
  },
  optionText: {
    flex: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.pink,
    backgroundColor: colors.white,
  },
  mainButton: {
    marginTop: 12,
  },
  codeWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  codeBox: {
    width: 56,
    height: 60,
    borderRadius: 14,
    backgroundColor: colors.input,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  codeBoxActive: {
    borderColor: colors.primary,
  },
  codeBoxError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  codeHidden: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.02,
    color: 'transparent',
  },
  hint: {
    marginTop: 12,
  },
  error: {
    marginTop: 8,
  },
  resend: {
    marginTop: 12,
    alignSelf: 'center',
  },
  cancel: {
    marginTop: 12,
  },
});
