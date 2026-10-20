import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ArrowRight, Heart } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import CustomHeader from '../../components/layout/CustomHeader';
import SectionHeader from '../../components/layout/SectionHeader';
import CustomText from '../../components/common/CustomText';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';
import ProductCard from '../../components/specific/ProductCard';
import ProductImage from '../../components/specific/ProductImage';
import useAsync from '../../hooks/useAsync';
import useToast from '../../hooks/useToast';
import { getProducts } from '../../api/products.api';
import { useShop } from '../../store/shopStore';
import { useCart } from '../../store/cartStore';
import { plural } from '../../utils/formatters';
import { colors } from '../../theme';

// P-08 Lista de deseos (Favoritos)
export default function Wishlist({ navigation }) {
  const { wishlist, toggleWishlist, recentlyViewed } = useShop();
  const { addItem } = useCart();
  const { toast, showToast } = useToast();
  const { data: products, loading } = useAsync(() => getProducts(), []);

  if (loading) return <LoadingSpinner fullScreen />;

  const byId = (id) => products.find((p) => p.id === id);
  const favorites = wishlist.map(byId).filter(Boolean);
  const recent = recentlyViewed.map((r) => byId(r.productId)).filter(Boolean).slice(0, 5);
  const popular = products.filter((p) => p.isPopular && !wishlist.includes(p.id)).slice(0, 6);

  const addToCart = (product) => {
    if (product.stock === 0) {
      showToast('Producto agotado', 'error');
      return;
    }
    addItem(product, { color: product.colors[0]?.name, size: product.sizes[0] });
    showToast('Agregado al carrito');
  };

  return (
    <ScreenWrapper scroll header={<CustomHeader title="Lista de deseos" subtitle={`${plural(favorites.length, 'producto guardado', 'productos guardados')}`} showBack={false} />}>
      {recent.length > 0 ? (
        <View style={styles.recentBlock}>
          <SectionHeader title="Visto recientemente" actionText="" onAction={() => navigation.navigate('RecentlyViewed')} testID="wishlist-recent" />
          <View style={styles.recentRow}>
            {recent.map((p) => (
              <Pressable key={p.id} onPress={() => navigation.navigate('Product', { productId: p.id })} style={styles.recentItem}>
                <ProductImage product={p} size={52} radius={26} iconSize={22} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Tu lista de deseos está vacía"
          message="Toca el corazón de un producto para guardarlo aquí."
          actionText="Explorar productos"
          onAction={() => navigation.navigate('ShopClient')}
        />
      ) : (
        favorites.map((product) => (
          <ProductCard
            key={product.id}
            variant="row"
            product={product}
            testID={`wishlist-${product.id}`}
            onPress={() => navigation.navigate('Product', { productId: product.id })}
            isFavorite
            onToggleFavorite={toggleWishlist}
            onAddToCart={addToCart}
          />
        ))
      )}

      <View style={styles.popular}>
        <SectionHeader title="Los más populares" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRow}>
          {popular.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="compact"
              width={110}
              onPress={() => navigation.navigate('Product', { productId: product.id })}
            />
          ))}
          <Pressable style={styles.moreCard} onPress={() => navigation.navigate('Search', { sort: 'popular', title: 'Los más populares' })}>
            <ArrowRight size={20} color={colors.primary} />
            <CustomText variant="caption" color="primary" weight="700">
              Ver más
            </CustomText>
          </Pressable>
        </ScrollView>
      </View>
      <Toast {...toast} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  recentBlock: {
    marginBottom: 12,
  },
  recentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  recentItem: {
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.white,
    boxShadow: '0px 3px 8px rgba(11, 27, 67, 0.12)',
  },
  popular: {
    marginTop: 24,
  },
  popularRow: {
    gap: 12,
    paddingBottom: 8,
  },
  moreCard: {
    width: 90,
    height: 110,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
