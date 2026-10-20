import React, { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { Bell, DollarSign, FileText, Globe, Info, KeyRound, Languages, LogOut, Mail, Moon, Trash2, UserRound } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import CustomHeader from '../../components/layout/CustomHeader';
import CustomText from '../../components/common/CustomText';
import MenuItem from '../../components/common/MenuItem';
import CustomModal from '../../components/common/CustomModal';
import InputField from '../../components/common/InputField';
import Toast from '../../components/common/Toast';
import useForm from '../../hooks/useForm';
import useToast from '../../hooks/useToast';
import { useAuth } from '../../store/authStore';
import { resetPassword } from '../../api/auth.api';
import { validateNewPassword } from '../../utils/validations';
import { APP_VERSION } from '../../utils/constants';
import { colors, radius } from '../../theme';

// P-31 Configuración (Ajustes)
export default function Settings({ navigation }) {
  const { user, logout, deleteAccount } = useAuth();
  const { toast, showToast } = useToast();
  const [push, setPush] = useState(true);
  const [emailOffers, setEmailOffers] = useState(false);
  const [modal, setModal] = useState(null); // 'password' | 'logout' | 'delete' | 'terms'
  const passwordForm = useForm({ password: '', confirm: '' }, validateNewPassword);

  const savePassword = passwordForm.handleSubmit(async ({ password }) => {
    await resetPassword({ email: user.email, password });
    passwordForm.reset();
    setModal(null);
    showToast('Contraseña actualizada');
  });

  const toggle = (value, onChange, testID) => (
    <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: colors.border }} thumbColor={colors.white} testID={testID} />
  );

  return (
    <ScreenWrapper scroll edges={['top', 'bottom']} header={<CustomHeader title="Ajustes" />}>
      <Section title="Personal">
        <MenuItem icon={UserRound} label="Perfil" onPress={() => navigation.navigate('EditInfo')} testID="settings-profile" />
        <MenuItem icon={KeyRound} label="Cambiar contraseña" onPress={() => setModal('password')} testID="settings-password" />
      </Section>

      <Section title="Notificaciones">
        <MenuItem icon={Bell} label="Notificaciones push" right={toggle(push, setPush, 'settings-push')} />
        <MenuItem icon={Mail} label="Ofertas por correo" right={toggle(emailOffers, setEmailOffers, 'settings-mail')} />
        <MenuItem icon={Moon} label="Modo oscuro" value="Próximamente" right={<Switch value={false} disabled />} />
      </Section>

      <Section title="Comercio">
        <MenuItem icon={Globe} label="País" value="Colombia" />
        <MenuItem icon={DollarSign} label="Divisa" value="COP $" />
        <MenuItem icon={Languages} label="Idioma" value="Español" />
        <MenuItem icon={FileText} label="Términos y condiciones" onPress={() => setModal('terms')} />
      </Section>

      <Section title="Cuenta">
        <MenuItem icon={Info} label="Acerca de MarketGO" onPress={() => navigation.navigate('About')} testID="settings-about" />
        <MenuItem icon={LogOut} label="Cerrar sesión" onPress={() => setModal('logout')} testID="settings-logout" />
        <MenuItem icon={Trash2} label="Eliminar mi cuenta" danger onPress={() => setModal('delete')} testID="settings-delete" />
      </Section>

      <CustomText variant="caption" color="textMuted" align="center" style={styles.version}>
        MarketGO · Versión {APP_VERSION}
      </CustomText>

      <CustomModal
        visible={modal === 'password'}
        hideIcon
        align="left"
        title="Cambiar contraseña"
        primaryText="Guardar"
        onPrimary={savePassword}
        secondaryText="Cancelar"
        onClose={() => setModal(null)}
      >
        <InputField label="Nueva contraseña" secureTextEntry testID="settings-new-password" {...passwordForm.getFieldProps('password')} />
        <InputField label="Confirmar contraseña" secureTextEntry {...passwordForm.getFieldProps('confirm')} />
      </CustomModal>

      <CustomModal
        visible={modal === 'terms'}
        hideIcon
        align="left"
        title="Términos y condiciones"
        message="MarketGO conecta a compradores con emprendimientos. Cada tienda es responsable de sus productos y envíos; MarketGO protege los datos personales según la Ley 1581 de 2012 (Habeas Data). Documento resumido con fines académicos."
        primaryText="Entendido"
        onClose={() => setModal(null)}
      />

      <CustomModal
        visible={modal === 'logout'}
        variant="warning"
        title="¿Cerrar sesión?"
        message="Volverás a la pantalla de inicio de sesión."
        primaryText="Cerrar sesión"
        onPrimary={logout}
        secondaryText="Cancelar"
        onClose={() => setModal(null)}
        testID="settings-logout-modal"
      />

      <CustomModal
        visible={modal === 'delete'}
        variant="error"
        title="Vas a eliminar tu cuenta"
        message="No podrás restaurar tus datos, pedidos ni puntos."
        primaryText="Borrar"
        primaryVariant="dark"
        onPrimary={deleteAccount}
        secondaryText="Cancelar"
        onClose={() => setModal(null)}
      />
      <Toast {...toast} />
    </ScreenWrapper>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <CustomText variant="smallBold" color="textMuted" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </CustomText>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 18 },
  sectionTitle: { marginBottom: 8, marginLeft: 4, letterSpacing: 0.6 },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
  },
  version: { marginTop: 8 },
});
