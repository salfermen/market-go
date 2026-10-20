import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Mail, Pencil, UserRound } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import CustomHeader from '../../components/layout/CustomHeader';
import CustomText from '../../components/common/CustomText';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import Avatar from '../../components/common/Avatar';
import Toast from '../../components/common/Toast';
import useForm from '../../hooks/useForm';
import useToast from '../../hooks/useToast';
import { useAuth } from '../../store/authStore';
import { validateProfile } from '../../utils/validations';
import { colors } from '../../theme';

// P-30 Editar información del perfil (cliente y vendedor)
export default function EditInfo() {
  const { user, updateUser } = useAuth();
  const { toast, showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  const form = useForm({ name: user.name, email: user.email, phone: user.phone }, validateProfile);

  const changed = form.values.name !== user.name || form.values.email !== user.email || form.values.phone !== user.phone;

  const save = form.handleSubmit(async (values) => {
    setSaving(true);
    setApiError(null);
    try {
      await updateUser({ name: values.name.trim(), email: values.email.trim().toLowerCase(), phone: values.phone });
      showToast('Cambios guardados');
    } catch (error) {
      setApiError(error.message);
    } finally {
      setSaving(false);
    }
  });

  return (
    <ScreenWrapper scroll keyboard edges={['top', 'bottom']} header={<CustomHeader title="Tu perfil" breadcrumb="Ajustes" />}>
      <View style={styles.avatarWrap}>
        <Avatar name={form.values.name || user.name} size={110} ring />
        <View style={styles.editBadge}>
          <Pencil size={14} color={colors.white} />
        </View>
      </View>
      <CustomText variant="caption" color="textMuted" align="center" style={styles.hint}>
        La foto de perfil se podrá subir cuando exista el backend.
      </CustomText>

      <InputField label="Nombre completo" icon={UserRound} testID="edit-name" {...form.getFieldProps('name')} />
      <InputField label="Correo electrónico" icon={Mail} keyboardType="email-address" autoCapitalize="none" testID="edit-email" {...form.getFieldProps('email')} />
      <InputField
        label="Celular"
        keyboardType="phone-pad"
        maxLength={10}
        prefix={<CustomText variant="smallBold">🇨🇴 +57</CustomText>}
        testID="edit-phone"
        {...form.getFieldProps('phone')}
      />

      {apiError ? (
        <CustomText variant="smallBold" color="error" style={styles.apiError}>
          {apiError}
        </CustomText>
      ) : null}

      <PrimaryButton title="Guardar cambios" onPress={save} loading={saving} disabled={!changed} style={styles.save} testID="edit-save" />
      <Toast {...toast} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    alignSelf: 'center',
    marginTop: 12,
  },
  editBadge: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  hint: {
    marginTop: 10,
    marginBottom: 20,
  },
  apiError: {
    marginBottom: 8,
  },
  save: {
    marginTop: 16,
  },
});
