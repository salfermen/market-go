import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Camera, ChevronRight, Clock, Search } from 'lucide-react-native';

import CustomText from '../../components/common/CustomText';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import SectionHeader from '../../components/layout/SectionHeader';
import ProductCard from '../../components/specific/ProductCard';
import ProductImage from '../../components/specific/ProductImage';
import useAsync from '../../hooks/useAsync';
import useCountdown from '../../hooks/useCountdown';
import { getCategories, getProducts } from '../../api/products.api';
import { useShop } from '../../store/shopStore';
import { formatPrice, splitCountdown } from '../../utils/formatters';
import { getIcon } from '../../utils/icons';
import { colors, radius, shadow } from '../../theme';

// P-06 Tienda (inicio del cliente)
// Se conserva la estructura de la pantalla original: encabezado con búsqueda,
// banner "Gran oferta", categorías, nuevos artículos, oferta relámpago,
// los más populares y destacados. Ahora los datos llegan desde src/api
// y la barra inferior la pone ClientTabs.
const ShopClient = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isInWishlist, toggleWishlist } = useShop();
  const seconds = useCountdown(2218); // 00:36:58
  const { data, loading, error, reload } = useAsync(() => Promise.all([getProducts(), getCategories()]), []);

  const openProduct = (product) => navigation.navigate('Product', { productId: product.id });

  if (loading) return <LoadingSpinner fullScreen message="Cargando la tienda…" />;
  if (error) {
    return (
      <SafeAreaView style={styles.screen}>
        <EmptyState icon={Search} title="No pudimos cargar la tienda" message={error} actionText="Reintentar" onAction={reload} />
      </SafeAreaView>
    );
  }

  const [products, categories] = data;
  const newProducts = products.filter((p) => p.isNew).slice(0, 4);
  const flashSaleProducts = products.filter((p) => p.isFlash).slice(0, 6);
  const mostPopular = products.filter((p) => p.isPopular).slice(0, 4);
  const featuredProducts = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
  const featured = featuredProducts[currentSlide];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <CustomText variant="h1" style={styles.headerTitle}>
          Tienda
        </CustomText>
        <Pressable style={styles.searchInput} onPress={() => navigation.navigate('Search')} testID="home-search" accessibilityRole="search">
          <CustomText variant="small" color="textLight" style={styles.searchText}>
            Busca
          </CustomText>
          <Camera size={18} color={colors.primary} />
        </Pressable>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Search')} accessibilityLabel="Buscar">
          <Search size={22} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <Pressable style={styles.banner} onPress={() => navigation.navigate('FlashSale')} testID="home-banner">
          <View style={styles.bannerTextWrap}>
            <CustomText style={styles.bannerTitle}>Gran oferta</CustomText>
            <CustomText style={styles.bannerSubtitle}>Hasta un 60 % en emprendimientos locales</CustomText>
            <View style={styles.bannerButton}>
              <CustomText style={styles.bannerButtonText}>Obtener oferta</CustomText>
            </View>
          </View>
          <View style={styles.bannerImage}>
            <ProductImage product={flashSaleProducts[0]} size={104} radius={52} />
          </View>
        </Pressable>

        {/* Categories Section */}
        <View style={styles.section}>
          <SectionHeader title="Categorías" onAction={() => navigation.navigate('Categories')} testID="home-categories-all" />
          <View style={styles.categoriesGrid}>
            {categories.slice(0, 4).map((category) => {
              const Icon = getIcon(category.icon);
              return (
                <TouchableOpacity
                  key={category.id}
                  testID={`home-category-${category.id}`}
                  onPress={() => navigation.navigate('Search', { category: category.id, title: category.name })}
                  style={[styles.categoryCard, { backgroundColor: category.tone }]}
                >
                  <Icon size={34} color={colors.ink} strokeWidth={1.5} />
                  <View style={styles.categoryOverlay}>
                    <CustomText style={styles.categoryName}>{category.name}</CustomText>
                    <View style={styles.categoryCount}>
                      <CustomText variant="caption" weight="700">
                        {category.count}
                      </CustomText>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* New Articles Section */}
        <View style={styles.section}>
          <SectionHeader title="Nuevos artículos" onAction={() => navigation.navigate('Search', { sort: 'newest', title: 'Nuevos artículos' })} />
          <View style={styles.productsGrid}>
            {newProducts.map((product) => (
              <ProductCard
                key={product.id}
                testID={`home-new-${product.id}`}
                product={product}
                width="48%"
                onPress={() => openProduct(product)}
                isFavorite={isInWishlist(product.id)}
                onToggleFavorite={toggleWishlist}
              />
            ))}
          </View>
        </View>

        {/* Flash Sale Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Oferta relámpago"
            actionText=""
            onAction={() => navigation.navigate('FlashSale')}
            right={<Countdown seconds={seconds} />}
          />
          <View style={styles.flashGrid}>
            {flashSaleProducts.map((product) => (
              <ProductCard key={product.id} product={product} width="31%" variant="compact" onPress={() => openProduct(product)} />
            ))}
          </View>
        </View>

        {/* Most Popular Section */}
        <View style={styles.section}>
          <SectionHeader title="Los más populares" onAction={() => navigation.navigate('Search', { sort: 'popular', title: 'Los más populares' })} />
          <View style={styles.productsGrid}>
            {mostPopular.map((product) => (
              <ProductCard key={product.id} product={product} width="48%" onPress={() => openProduct(product)} />
            ))}
          </View>
        </View>

        {/* Featured Products Carousel */}
        <View style={styles.section}>
          <SectionHeader title="Destacados" />
          <View style={styles.carousel}>
            <Pressable onPress={() => openProduct(featured)} style={styles.carouselImage}>
              <ProductImage product={featured} radius={10} iconSize={64} style={styles.fill} />
              <View style={styles.carouselCaption}>
                <CustomText variant="bodyBold" color="white" numberOfLines={1}>
                  {featured.name}
                </CustomText>
                <CustomText variant="smallBold" color="white">
                  {formatPrice(featured.price)} · ★ {featured.rating.toFixed(1)}
                </CustomText>
              </View>
            </Pressable>
            <View style={styles.carouselControls}>
              <TouchableOpacity onPress={prevSlide} style={styles.carouselArrow} accessibilityLabel="Anterior">
                <ChevronRight size={22} color={colors.ink} style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <View style={styles.dotsRow}>
                {featuredProducts.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setCurrentSlide(idx)}
                    style={[styles.dot, idx === currentSlide && styles.dotActive]}
                    accessibilityLabel={`Destacado ${idx + 1}`}
                  />
                ))}
              </View>
              <TouchableOpacity onPress={nextSlide} style={styles.carouselArrow} accessibilityLabel="Siguiente">
                <ChevronRight size={22} color={colors.ink} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function Countdown({ seconds }) {
  const [h, m, s] = splitCountdown(seconds);
  return (
    <View style={styles.timer} accessibilityLabel={`Termina en ${h} horas ${m} minutos ${s} segundos`}>
      <Clock size={16} color={colors.primary} />
      {[h, m, s].map((part, i) => (
        <View key={i} style={styles.timerBox}>
          <CustomText variant="smallBold">{part}</CustomText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { marginRight: 4 },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    height: 40,
  },
  searchText: { flex: 1 },
  iconButton: { padding: 6 },
  content: { padding: 16, paddingTop: 4, gap: 24 },
  fill: { flex: 1 },
  banner: {
    backgroundColor: colors.yellow,
    borderRadius: 16,
    height: 160,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    overflow: 'hidden',
  },
  bannerTextWrap: { flex: 1 },
  bannerTitle: { fontSize: 26, fontWeight: '800', color: colors.white, marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: colors.white, marginBottom: 12, fontWeight: '600' },
  bannerButton: {
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: { color: '#B45309', fontWeight: '700', fontSize: 13 },
  bannerImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {},
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  categoryCard: {
    width: '48%',
    height: 104,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  categoryOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  categoryName: { color: colors.ink, fontWeight: '700', fontSize: 14 },
  categoryCount: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timerBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  flashGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  carousel: { backgroundColor: colors.surface, borderRadius: 16, padding: 16 },
  carouselImage: { width: '100%', aspectRatio: 16 / 9, borderRadius: 10, overflow: 'hidden', marginBottom: 12 },
  carouselCaption: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: 'rgba(11, 27, 67, 0.55)',
  },
  carouselControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  carouselArrow: { padding: 8 },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 20 },
});

export default ShopClient;
