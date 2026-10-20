import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ChartColumn, Headphones, Info, LogOut, MapPin, Pencil, Repeat, Settings as SettingsIcon, Star, Users } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import SellerHeader from '../../components/layout/SellerHeader';
import Divider from '../../components/layout/Divider';
import CustomText from '../../components/common/CustomText';
import Avatar from '../../components/common/Avatar';
import MenuItem from '../../components/common/MenuItem';
import CustomModal from '../../components/common/CustomModal';
import { useAuth } from '../../store/authStore';
import { useSeller } from '../../store/sellerStore';
import { stores } from '../../data/mockData';
import { formatNumber } from '../../utils/formatters';
import { colors, radius } from '../../theme';

// P-23 Perfil del vendedor (datos de la tienda y opciones)
export default function SellerProfile({ navigation }) {
  const { user, setMode, logout } = useAuth();
  const seller = useSeller();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const store = stores.find((s) => s.id === user.storeId);

  return (
    <ScreenWrapper scroll background={colors.surface} header={<SellerHeader section="Perfil" title="Mi tienda" />} contentStyle={styles.content}>
      <View style={styles.storeCard}>
        <Avatar name={store?.name ?? user.name} size={64} ring />
        <View style={styles.flex}>
          <CustomText variant="h2">{store?.name}</CustomText>
          <CustomText variant="small" color="textMuted">
            Administrada por {user.name}
          </CustomText>
          <View style={styles.metaRow}>
            <Meta icon={MapPin} text={store?.city} />
            <Meta icon={Star} text={seller.averageRating ? seller.averageRating.toFixed(1) : '—'} />
            <Meta icon={Users} text={`${formatNumber(store?.followers ?? 0)} seguidores`} />
          </View>
        </View>
      </View>
      <CustomText variant="small" color="textMuted" style={styles.description}>
        {store?.description}
      </CustomText>

      <View style={styles.menu}>
        <MenuItem icon={Pencil} label="Editar información" onPress={() => navigation.navigate('EditInfo')} testID="seller-menu-edit" />
        <MenuItem icon={ChartColumn} label="Reportes" onPress={() => navigation.navigate('SellerReports')} />
        <MenuItem icon={Star} label="Reseñas de clientes" onPress={() => navigation.navigate('SellerReviews')} />
        <MenuItem icon={Headphones} label="Soporte para vendedores" onPress={() => navigation.navigate('ChatSupport')} />
        <MenuItem icon={SettingsIcon} label="Configuración" onPress={() => navigation.navigate('Settings')} testID="seller-menu-settings" />
        <MenuItem icon={Info} label="Acerca de MarketGO" onPress={() => navigation.navigate('About')} />
        <Divider spacing={8} />
        <MenuItem icon={Repeat} label="Cambiar a modo comprador" onPress={() => setMode('client')} testID="seller-menu-client" />
        <MenuItem icon={LogOut} label="Cerrar sesión" danger onPress={() => setConfirmLogout(true)} />
      </View>

      <CustomModal
        visible={confirmLogout}
        variant="warning"
        title="¿Cerrar sesión?"
        message="Tendrás que ingresar tu correo y contraseña de nuevo."
        primaryText="Cerrar sesión"
        onPrimary={logout}
        secondaryText="Cancelar"
        onClose={() => setConfirmLogout(false)}
      />
    </ScreenWrapper>
  );
}

function Meta({ icon: Icon, text }) {
  return (
    <View style={styles.meta}>
      <Icon size={13} color={colors.primary} />
      <CustomText variant="caption" color="textMuted">
        {text}
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 16 },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  description: { marginVertical: 14, paddingHorizontal: 4 },
  menu: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
  },
});
