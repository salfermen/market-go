import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  Award,
  ChevronRight,
  ClipboardList,
  Eye,
  Headphones,
  Info,
  LogOut,
  Megaphone,
  Pencil,
  Settings as SettingsIcon,
  Store,
  Ticket,
} from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import SectionHeader from '../../components/layout/SectionHeader';
import Divider from '../../components/layout/Divider';
import CustomText from '../../components/common/CustomText';
import Avatar from '../../components/common/Avatar';
import MenuItem from '../../components/common/MenuItem';
import CustomModal from '../../components/common/CustomModal';
import InputField from '../../components/common/InputField';
import ProductImage from '../../components/specific/ProductImage';
import useAsync from '../../hooks/useAsync';
import { getProducts } from '../../api/products.api';
import { useAuth } from '../../store/authStore';
import { useShop } from '../../store/shopStore';
import { announcement } from '../../data/mockData';
import { formatNumber } from '../../utils/formatters';
import { colors, radius } from '../../theme';

// P-13 Perfil del cliente
export default function ProfileClient({ navigation }) {
  const { user, logout, setMode, createStore } = useAuth();
  const { recentlyViewed, orders } = useShop();
  const { data: products } = useAsync(() => getProducts(), []);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [storeModal, setStoreModal] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [storeError, setStoreError] = useState(null);
  const [creating, setCreating] = useState(false);

  const firstName = user.name.split(' ')[0];
  const recent = recentlyViewed
    .map((r) => products?.find((p) => p.id === r.productId))
    .filter(Boolean)
    .slice(0, 6);
  const toReceive = orders.filter((o) => o.status !== 'delivered').length;
  const toReview = orders.filter((o) => o.status === 'delivered' && !o.reviewed).length;

  // "Mi tienda": si el usuario ya tiene tienda pasa al modo vendedor; si no, la crea
  const openStore = () => {
    if (user.storeId) setMode('seller');
    else setStoreModal(true);
  };

  const submitStore = async () => {
    if (storeName.trim().length < 3) {
      setStoreError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    setCreating(true);
    await createStore({ name: storeName });
    setCreating(false);
    setStoreModal(false);
    setMode('seller');
  };

  return (
    <ScreenWrapper scroll>
      {/* Encabezado */}
      <View style={styles.topRow}>
        <Avatar name={user.name} size={46} ring />
        <Pressable style={styles.activityPill} onPress={() => navigation.navigate('History')} testID="profile-activity">
          <CustomText variant="smallBold" color="white">
            Mi actividad
          </CustomText>
        </Pressable>
        <View style={styles.flex} />
        <IconButton icon={Ticket} label="Cupones" onPress={() => navigation.navigate('Voucher')} />
        <IconButton icon={SettingsIcon} label="Configuración" onPress={() => navigation.navigate('Settings')} testID="profile-settings" />
      </View>

      <CustomText variant="hero" style={styles.hello}>
        ¡Hola, {firstName}!
      </CustomText>

      {/* Anuncio */}
      <Pressable style={styles.announcement} onPress={() => navigation.navigate('Search', { category: 'artesanal', title: 'Artesanal' })}>
        <Megaphone size={20} color={colors.primary} />
        <View style={styles.flex}>
          <CustomText variant="smallBold">{announcement.title}</CustomText>
          <CustomText variant="caption" color="textMuted">
            {announcement.text}
          </CustomText>
        </View>
        <View style={styles.arrowCircle}>
          <ChevronRight size={16} color={colors.white} />
        </View>
      </Pressable>

      {/* Puntos */}
      <Pressable style={styles.points} onPress={() => navigation.navigate('UserRewards')} testID="profile-points">
        <Award size={22} color={colors.white} />
        <View style={styles.flex}>
          <CustomText variant="caption" color="white">
            Tus puntos MarketGO
          </CustomText>
          <CustomText variant="h2" color="white">
            {formatNumber(user.points)} pts
          </CustomText>
        </View>
        <CustomText variant="smallBold" color="white">
          Ver recompensas ›
        </CustomText>
      </Pressable>

      {/* Visto recientemente */}
      <SectionHeader title="Visto recientemente" actionText="" onAction={() => navigation.navigate('RecentlyViewed')} style={styles.section} />
      {recent.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
          {recent.map((p) => (
            <Pressable key={p.id} onPress={() => navigation.navigate('Product', { productId: p.id })} style={styles.recentItem}>
              <ProductImage product={p} size={56} radius={28} iconSize={24} />
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <CustomText variant="small" color="textMuted">
          Aún no has visto productos.
        </CustomText>
      )}

      {/* Mis órdenes */}
      <SectionHeader title="Mis órdenes" style={styles.section} />
      <View style={styles.ordersRow}>
        <OrderChip label="Para recibir" count={toReceive} onPress={() => navigation.navigate('Deliver')} testID="profile-to-receive" />
        <OrderChip label="Para reseñar" count={toReview} onPress={() => navigation.navigate('History', { filter: 'delivered' })} />
        <OrderChip label="Todos" count={orders.length} onPress={() => navigation.navigate('History')} />
      </View>

      <Divider spacing={20} />

      {/* Menú */}
      <MenuItem icon={ClipboardList} label="Mis pedidos" onPress={() => navigation.navigate('History')} testID="menu-history" />
      <MenuItem icon={Eye} label="Vistos recientemente" onPress={() => navigation.navigate('RecentlyViewed')} />
      <MenuItem icon={Award} label="Mis recompensas" onPress={() => navigation.navigate('UserRewards')} testID="menu-rewards" />
      <MenuItem icon={Ticket} label="Mis cupones" onPress={() => navigation.navigate('Voucher')} testID="menu-vouchers" />
      <MenuItem icon={Pencil} label="Editar información" onPress={() => navigation.navigate('EditInfo')} testID="menu-edit" />
      <MenuItem
        icon={Store}
        label="Mi tienda"
        value={user.storeId ? 'Panel del emprendedor' : 'Crear tienda'}
        onPress={openStore}
        testID="menu-store"
      />
      <MenuItem icon={Headphones} label="Soporte" onPress={() => navigation.navigate('ChatSupport')} testID="menu-support" />
      <MenuItem icon={SettingsIcon} label="Configuración" onPress={() => navigation.navigate('Settings')} />
      <MenuItem icon={Info} label="Acerca de MarketGO" onPress={() => navigation.navigate('About')} testID="menu-about" />
      <MenuItem icon={LogOut} label="Cerrar sesión" danger onPress={() => setConfirmLogout(true)} testID="menu-logout" />

      <CustomModal
        visible={confirmLogout}
        variant="warning"
        title="¿Cerrar sesión?"
        message="Tendrás que ingresar tu correo y contraseña de nuevo."
        primaryText="Cerrar sesión"
        onPrimary={logout}
        secondaryText="Cancelar"
        onClose={() => setConfirmLogout(false)}
        testID="logout-modal"
      />

      <CustomModal
        visible={storeModal}
        variant="info"
        title="Activa tu tienda"
        message="Publica tus productos y recibe pedidos desde el celular."
        primaryText={creating ? 'Creando…' : 'Crear tienda'}
        onPrimary={submitStore}
        secondaryText="Ahora no"
        onClose={() => setStoreModal(false)}
      >
        <InputField
          label="Nombre de la tienda"
          placeholder="Ej. Dulces de la abuela"
          value={storeName}
          onChangeText={(t) => {
            setStoreName(t);
            setStoreError(null);
          }}
          error={storeError}
          testID="store-name"
        />
      </CustomModal>
    </ScreenWrapper>
  );
}

function IconButton({ icon: Icon, label, onPress, testID }) {
  return (
    <Pressable onPress={onPress} style={styles.iconButton} accessibilityLabel={label} accessibilityRole="button" testID={testID}>
      <Icon size={18} color={colors.primary} />
    </Pressable>
  );
}

function OrderChip({ label, count, onPress, testID }) {
  return (
    <Pressable onPress={onPress} style={styles.orderChip} testID={testID}>
      <CustomText variant="smallBold" color="primary">
        {label}
      </CustomText>
      {count > 0 ? (
        <View style={styles.orderCount}>
          <CustomText variant="caption" color="white" weight="700">
            {count}
          </CustomText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
  },
  activityPill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hello: {
    marginTop: 18,
    marginBottom: 16,
  },
  announcement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  points: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    marginTop: 12,
  },
  section: {
    marginTop: 22,
  },
  recentRow: {
    gap: 12,
    paddingVertical: 4,
  },
  recentItem: {
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.white,
    boxShadow: '0px 3px 8px rgba(11, 27, 67, 0.12)',
  },
  ordersRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  orderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  orderCount: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});
