import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Eye, Trash2 } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import CustomHeader from '../../components/layout/CustomHeader';
import SegmentedTabs from '../../components/common/SegmentedTabs';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CustomModal from '../../components/common/CustomModal';
import ProductCard from '../../components/specific/ProductCard';
import useAsync from '../../hooks/useAsync';
import { getProducts } from '../../api/products.api';
import { useShop } from '../../store/shopStore';
import { colors } from '../../theme';

const isSameDay = (a, b) => a.toDateString() === b.toDateString();

// P-14 Vistos recientemente
export default function RecentlyViewed({ navigation }) {
  const { recentlyViewed, clearRecentlyViewed, isInWishlist, toggleWishlist } = useShop();
  const { data: products, loading } = useAsync(() => getProducts(), []);
  const [tab, setTab] = useState('today');
  const [confirm, setConfirm] = useState(false);

  const today = new Date();
  const yesterday = new Date(Date.now() - 86400000);
  const filtered = recentlyViewed.filter((r) => {
    const d = new Date(r.viewedAt);
    if (tab === 'today') return isSameDay(d, today);
    if (tab === 'yesterday') return isSameDay(d, yesterday);
    return true;
  });
  const items = filtered.map((r) => products?.find((p) => p.id === r.productId)).filter(Boolean);

  return (
    <ScreenWrapper
      scroll
      header={
        <CustomHeader
          title="Visto recientemente"
          right={
            recentlyViewed.length ? (
              <Pressable onPress={() => setConfirm(true)} style={styles.clear} accessibilityLabel="Borrar historial">
                <Trash2 size={18} color={colors.error} />
              </Pressable>
            ) : null
          }
        />
      }
    >
      <SegmentedTabs
        options={[
          { key: 'today', label: 'Hoy' },
          { key: 'yesterday', label: 'Ayer' },
          { key: 'all', label: 'Todo' },
        ]}
        value={tab}
        onChange={setTab}
        style={styles.tabs}
      />

      {loading ? <LoadingSpinner /> : null}
      {!loading && items.length === 0 ? (
        <EmptyState icon={Eye} title="Nada por aquí" message="Los productos que abras aparecerán en esta lista." />
      ) : null}

      <View style={styles.grid}>
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            width="48%"
            onPress={() => navigation.navigate('Product', { productId: product.id })}
            isFavorite={isInWishlist(product.id)}
            onToggleFavorite={toggleWishlist}
          />
        ))}
      </View>

      <CustomModal
        visible={confirm}
        variant="warning"
        title="¿Borrar el historial?"
        message="Se eliminarán todos los productos vistos recientemente."
        primaryText="Borrar"
        onPrimary={() => {
          clearRecentlyViewed();
          setConfirm(false);
        }}
        secondaryText="Cancelar"
        onClose={() => setConfirm(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  clear: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 18,
  },
});
