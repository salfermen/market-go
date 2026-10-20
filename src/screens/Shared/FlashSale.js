import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Clock, Zap } from 'lucide-react-native';

import CustomText from '../../components/common/CustomText';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ProductCard from '../../components/specific/ProductCard';
import ProductImage from '../../components/specific/ProductImage';
import useAsync from '../../hooks/useAsync';
import useCountdown from '../../hooks/useCountdown';
import { getProducts } from '../../api/products.api';
import { useShop } from '../../store/shopStore';
import { getDiscount, splitCountdown } from '../../utils/formatters';
import { colors, radius } from '../../theme';

const DISCOUNTS = [
  { key: 0, label: 'Todos' },
  { key: 10, label: '10%' },
  { key: 15, label: '15%' },
  { key: 20, label: '20%' },
  { key: 25, label: '25%' },
];

// P-27 Ofertas relámpago
export default function FlashSale({ navigation }) {
  const [discount, setDiscount] = useState(0);
  const seconds = useCountdown(2218);
  const [h, m, s] = splitCountdown(seconds);
  const { isInWishlist, toggleWishlist } = useShop();
  const { data: products, loading } = useAsync(() => getProducts({ onlyDiscount: true, discount: discount || undefined, sort: 'price_asc' }), [discount]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="light" />
      {/* Encabezado morado */}
      <View style={styles.hero}>
        <View style={styles.heroBlob} />
        <View style={styles.heroTop}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back} accessibilityLabel="Volver" testID="flash-back">
            <ChevronLeft size={22} color={colors.white} />
          </Pressable>
          <CustomText variant="h1" color="white" style={styles.flex}>
            Oferta relámpago
          </CustomText>
        </View>
        <View style={styles.heroSub}>
          <CustomText variant="small" color="white" style={styles.flex}>
            Elige tu descuento · termina en
          </CustomText>
          <View style={styles.timer}>
            <Clock size={16} color={colors.white} />
            {[h, m, s].map((part, i) => (
              <View key={i} style={styles.timerBox}>
                <CustomText variant="smallBold" color="primary">
                  {part}
                </CustomText>
              </View>
            ))}
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.discounts}>
          {DISCOUNTS.map((d) => (
            <Pressable key={d.key} onPress={() => setDiscount(d.key)} style={[styles.discountChip, discount === d.key && styles.discountChipActive]} testID={`flash-${d.key}`}>
              <CustomText variant="smallBold" style={{ color: discount === d.key ? colors.primary : colors.white }}>
                {d.label}
              </CustomText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <CustomText variant="h3" style={styles.sectionTitle}>
          {discount ? `${discount}% de descuento o más` : 'Todas las ofertas'}
        </CustomText>

        {loading ? <LoadingSpinner /> : null}
        {!loading && products.length === 0 ? <EmptyState icon={Zap} title="No hay ofertas con ese descuento" message="Prueba con un porcentaje menor." /> : null}

        {!loading ? (
          <View style={styles.grid}>
            {products.map((product, index) => (
              <React.Fragment key={product.id}>
                <ProductCard
                  product={product}
                  width="48%"
                  onPress={() => navigation.navigate('Product', { productId: product.id })}
                  isFavorite={isInWishlist(product.id)}
                  onToggleFavorite={toggleWishlist}
                  testID={`flash-product-${product.id}`}
                />
                {index === 3 ? (
                  <View style={styles.banner}>
                    <View style={styles.flex}>
                      <CustomText variant="h2" color="white">
                        Gran oferta
                      </CustomText>
                      <CustomText variant="small" color="white">
                        Hasta {Math.max(...products.map((p) => getDiscount(p.price, p.oldPrice)))}% en productos seleccionados
                      </CustomText>
                    </View>
                    <ProductImage product={products[0]} size={70} radius={35} iconSize={30} />
                  </View>
                ) : null}
              </React.Fragment>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primaryDark },
  flex: { flex: 1 },
  hero: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  heroBlob: {
    position: 'absolute',
    right: -60,
    top: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(217, 228, 255, 0.25)',
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroSub: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, paddingLeft: 48 },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timerBox: { backgroundColor: colors.white, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  discounts: { gap: 8, marginTop: 16 },
  discountChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  discountChipActive: { backgroundColor: colors.white },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  sectionTitle: { marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 18 },
  banner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.yellow,
  },
});
