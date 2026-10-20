import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bell } from 'lucide-react-native';
import CustomHeader from './CustomHeader';
import { useSeller } from '../../store/sellerStore';
import { colors } from '../../theme';

// Encabezado de las pantallas del vendedor: "Mi tienda / Sección" + campana de pedidos nuevos.
export default function SellerHeader({ section, title, showBack = false }) {
  const navigation = useNavigation();
  const { newOrders } = useSeller();
  return (
    <CustomHeader
      breadcrumb={`Mi tienda / ${section}`}
      title={title}
      showBack={showBack}
      style={styles.header}
      right={
        <Pressable
          onPress={() => navigation.popTo('SellerTabs', { screen: 'SellerOrders' })}
          style={styles.bell}
          accessibilityLabel={`Pedidos nuevos: ${newOrders}`}
        >
          <Bell size={20} color={colors.ink} />
          {newOrders > 0 ? <View style={styles.dot} /> : null}
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bell: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.error,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
});
