import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Clock, Eye, Heart, Share2, Store, Truck, Zap } from 'lucide-react-native';

import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import QuantityStepper from '../../components/common/QuantityStepper';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';
import SectionHeader from '../../components/layout/SectionHeader';
import ProductImage from '../../components/specific/ProductImage';
import ProductCard from '../../components/specific/ProductCard';
import RatingStars from '../../components/specific/RatingStars';
import ReviewCard from '../../components/specific/ReviewCard';
import useAsync from '../../hooks/useAsync';
import useToast from '../../hooks/useToast';
import useCountdown from '../../hooks/useCountdown';
import { getProductById, getProducts, getReviews } from '../../api/products.api';
import { useAuth } from '../../store/authStore';
import { useCart, SHIPPING_OPTIONS } from '../../store/cartStore';
import { useShop } from '../../store/shopStore';
import { formatPrice, getDiscount, splitCountdown } from '../../utils/formatters';
import { colors, radius } from '../../theme';

// Variaciones de tono para simular la galería de fotos (Galería del producto)
const GALLERY_TONES = (tone) => [tone, '#F3F4F6', '#EDE9FE'];

// P-24 Detalle de producto
export default function Product({ navigation, route }) {
  const { productId } = route.params;
  const { width } = useWindowDimensions();
  const { isSeller } = useAuth();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist, addRecentlyViewed } = useShop();
  const { toast, showToast } = useToast();
  const seconds = useCountdown(2218);

  const [slide, setSlide] = useState(0);
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [variantError, setVariantError] = useState(null);

  const { data, loading, error } = useAsync(
    () => Promise.all([getProductById(productId), getReviews(productId)]),
    [productId],
  );
  const product = data?.[0];
  const reviews = data?.[1] ?? [];

  const { data: related } = useAsync(
    () => (product ? getProducts({ category: product.category }) : Promise.resolve([])),
    [product?.id],
  );

  useEffect(() => {
    if (!product) return;
    if (!isSeller) addRecentlyViewed(product.id);
    // Si solo hay una opción, se selecciona automáticamente
    setColor(product.colors.length === 1 ? product.colors[0].name : null);
    setSize(product.sizes.length === 1 ? product.sizes[0] : null);
    setQuantity(1);
    setSlide(0);
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <LoadingSpinner fullScreen message="Cargando producto…" />;
  if (error || !product) {
    return (
      <SafeAreaView style={styles.screen}>
        <EmptyState icon={Eye} title="Producto no disponible" message={error} actionText="Volver" onAction={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const discount = getDiscount(product.price, product.oldPrice);
  const favorite = isInWishlist(product.id);
  const outOfStock = product.stock === 0;
  const galleryWidth = Math.min(width, 480);
  const [h, m, s] = splitCountdown(seconds);

  // Valida que el usuario haya elegido color y talla antes de agregar al carrito
  const validateVariant = () => {
    if (product.colors.length > 0 && !color) return 'Selecciona un color';
    if (!size) return 'Selecciona una talla';
    return null;
  };

  const add = (goToCart) => {
    const problem = validateVariant();
    if (problem) {
      setVariantError(problem);
      return;
    }
    addItem(product, { quantity, color, size });
    if (goToCart) navigation.popTo('ClientTabs', { screen: 'Cart' });
    else showToast(`Agregado al carrito (${quantity})`);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Galería */}
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / galleryWidth))}
            onScroll={(e) => setSlide(Math.round(e.nativeEvent.contentOffset.x / galleryWidth))}
            scrollEventThrottle={32}
          >
            {GALLERY_TONES(product.tone).map((tone, index) => (
              <View key={index} style={{ width: galleryWidth, height: galleryWidth * 0.9 }}>
                <ProductImage product={{ ...product, tone }} radius={0} iconSize={110 - index * 20} style={styles.fill} />
              </View>
            ))}
          </ScrollView>
          <View style={styles.galleryDots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.galleryDot, i === slide && styles.galleryDotActive]} />
            ))}
          </View>
          <Pressable style={[styles.floating, styles.back]} onPress={() => navigation.goBack()} accessibilityLabel="Volver" testID="product-back">
            <ChevronLeft size={22} color={colors.ink} />
          </Pressable>
          <Pressable style={[styles.floating, styles.share]} onPress={() => showToast('Enlace copiado para compartir')} accessibilityLabel="Compartir">
            <Share2 size={18} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.body}>
          {/* Precio */}
          <View style={styles.priceRow}>
            <CustomText variant="h1">{formatPrice(product.price)}</CustomText>
            {product.isFlash ? (
              <View style={styles.timer}>
                <Clock size={16} color={colors.primary} />
                {[h, m, s].map((part, i) => (
                  <View key={i} style={styles.timerBox}>
                    <CustomText variant="smallBold">{part}</CustomText>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
          {product.oldPrice ? (
            <View style={styles.oldRow}>
              <CustomText variant="small" color="error" style={styles.strike}>
                {formatPrice(product.oldPrice)}
              </CustomText>
              <View style={styles.discount}>
                <CustomText variant="caption" color="white" weight="700">
                  -{discount}%
                </CustomText>
              </View>
            </View>
          ) : null}

          <CustomText variant="h2" style={styles.name}>
            {product.name}
          </CustomText>
          <Pressable style={styles.ratingRow} onPress={() => navigation.navigate('Reviews', { productId: product.id })} testID="product-rating">
            <RatingStars value={product.rating} showValue count={product.reviewsCount} />
            <CustomText variant="caption" color="textMuted">
              · {product.sold} vendidos
            </CustomText>
          </Pressable>

          {/* Tienda (perfil del emprendimiento) */}
          <Pressable
            style={styles.store}
            onPress={() => !isSeller && navigation.navigate('Search', { storeId: product.storeId, title: product.store?.name })}
            testID="product-store"
          >
            <View style={styles.storeIcon}>
              <Store size={18} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <CustomText variant="smallBold">{product.store?.name}</CustomText>
              <CustomText variant="caption" color="textMuted">
                {product.store?.city} · ★ {product.store?.rating}
              </CustomText>
            </View>
            {!isSeller ? (
              <CustomText variant="smallBold" color="primary">
                Ver tienda ›
              </CustomText>
            ) : null}
          </Pressable>

          <CustomText variant="body" color="textMuted" style={styles.description}>
            {product.description}
          </CustomText>

          {/* Variaciones */}
          {product.colors.length > 0 ? (
            <>
              <CustomText variant="h3" style={styles.section}>
                Color: <CustomText variant="body" color="textMuted">{color ?? 'elige uno'}</CustomText>
              </CustomText>
              <View style={styles.options}>
                {product.colors.map((c) => (
                  <Pressable
                    key={c.name}
                    onPress={() => {
                      setColor(c.name);
                      setVariantError(null);
                    }}
                    style={[styles.colorOuter, color === c.name && styles.colorOuterActive]}
                    accessibilityLabel={`Color ${c.name}`}
                    accessibilityState={{ selected: color === c.name }}
                    testID={`color-${c.name}`}
                  >
                    <View style={[styles.colorInner, { backgroundColor: c.hex }]} />
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <CustomText variant="h3" style={styles.section}>
            Talla
          </CustomText>
          <View style={styles.options}>
            {product.sizes.map((sz) => (
              <Pressable
                key={sz}
                onPress={() => {
                  setSize(sz);
                  setVariantError(null);
                }}
                style={[styles.size, size === sz && styles.sizeActive]}
                testID={`size-${sz}`}
              >
                <CustomText variant="smallBold" style={{ color: size === sz ? colors.white : colors.text }}>
                  {sz}
                </CustomText>
              </Pressable>
            ))}
          </View>
          {variantError ? (
            <CustomText variant="smallBold" color="error" style={styles.variantError}>
              {variantError}
            </CustomText>
          ) : null}

          {!isSeller ? (
            <View style={styles.qtyRow}>
              <CustomText variant="h3">Cantidad</CustomText>
              <QuantityStepper value={quantity} onChange={setQuantity} max={Math.max(product.stock, 1)} testID="product-qty" />
            </View>
          ) : null}
          <CustomText variant="caption" color={outOfStock ? 'error' : product.stock <= 5 ? 'warning' : 'textMuted'} weight="700">
            {outOfStock ? 'Agotado' : product.stock <= 5 ? `¡Solo quedan ${product.stock} unidades!` : `${product.stock} unidades disponibles`}
          </CustomText>

          {/* Especificaciones */}
          <CustomText variant="h3" style={styles.section}>
            Especificaciones
          </CustomText>
          <View style={styles.specs}>
            <Spec label="Material" value={product.material} />
            <Spec label="Origen" value={product.origin} />
            <Spec label="Categoría" value={product.subcategory} />
          </View>

          {/* Entrega */}
          <CustomText variant="h3" style={styles.section}>
            Entrega
          </CustomText>
          {Object.values(SHIPPING_OPTIONS).map((o) => (
            <View key={o.id} style={styles.delivery}>
              {o.id === 'express' ? <Zap size={16} color={colors.primary} /> : <Truck size={16} color={colors.primary} />}
              <CustomText variant="smallBold">{o.label}</CustomText>
              <CustomText variant="caption" color="textMuted" style={styles.flex}>
                {o.time}
              </CustomText>
              <CustomText variant="smallBold">{o.cost === 0 ? 'Gratis' : formatPrice(o.cost)}</CustomText>
            </View>
          ))}

          {/* Reseñas */}
          <SectionHeader title="Calificación y reseñas" actionText="Ver todas" onAction={() => navigation.navigate('Reviews', { productId: product.id })} style={styles.section} testID="product-reviews" />
          {reviews.length ? (
            <ReviewCard review={reviews[0]} />
          ) : (
            <CustomText variant="small" color="textMuted">
              Este producto aún no tiene reseñas.
            </CustomText>
          )}

          {/* Relacionados */}
          {related && related.filter((p) => p.id !== product.id).length ? (
            <>
              <SectionHeader title="También te podría interesar" style={styles.section} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.related}>
                {related
                  .filter((p) => p.id !== product.id)
                  .slice(0, 6)
                  .map((p) => (
                    <ProductCard key={p.id} product={p} width={150} onPress={() => navigation.push('Product', { productId: p.id })} />
                  ))}
              </ScrollView>
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* Barra inferior */}
      {isSeller ? (
        <View style={styles.sellerBar}>
          <Eye size={16} color={colors.primary} />
          <CustomText variant="smallBold" color="primary">
            Vista previa: así ven tus clientes este producto
          </CustomText>
        </View>
      ) : (
        <View style={styles.bottomBar}>
          <Pressable
            onPress={() => {
              toggleWishlist(product.id);
              showToast(favorite ? 'Quitado de favoritos' : 'Guardado en favoritos');
            }}
            style={styles.heart}
            accessibilityLabel={favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            testID="product-fav"
          >
            <Heart size={22} color={favorite ? colors.error : colors.ink} fill={favorite ? colors.error : 'transparent'} />
          </Pressable>
          <PrimaryButton title="Agregar al carrito" variant="dark" size="sm" onPress={() => add(false)} disabled={outOfStock} style={styles.flex} testID="product-add" />
          <PrimaryButton title={outOfStock ? 'Agotado' : 'Comprar ahora'} size="sm" onPress={() => add(true)} disabled={outOfStock} style={styles.flex} testID="product-buy" />
        </View>
      )}
      <Toast {...toast} bottom={90} />
    </SafeAreaView>
  );
}

function Spec({ label, value }) {
  return (
    <View style={styles.spec}>
      <CustomText variant="caption" color="textMuted">
        {label}
      </CustomText>
      <CustomText variant="smallBold">{value}</CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 24 },
  fill: { flex: 1 },
  flex: { flex: 1 },
  galleryDots: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  galleryDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.8)' },
  galleryDotActive: { width: 26, backgroundColor: colors.primary },
  floating: {
    position: 'absolute',
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: { left: 16 },
  share: { right: 16 },
  body: { padding: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timerBox: { backgroundColor: colors.primaryLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  oldRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  strike: { textDecorationLine: 'line-through' },
  discount: { backgroundColor: colors.error, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  name: { marginTop: 10 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  store: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginTop: 14,
  },
  storeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: { marginTop: 14 },
  section: { marginTop: 22, marginBottom: 10 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOuterActive: { borderColor: colors.primary },
  colorInner: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.border },
  size: {
    minWidth: 48,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.input,
    alignItems: 'center',
  },
  sizeActive: { backgroundColor: colors.primary },
  variantError: { marginTop: 10 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 8 },
  specs: { flexDirection: 'row', gap: 8 },
  spec: { flex: 1, padding: 10, borderRadius: radius.md, backgroundColor: colors.primarySoft, gap: 2 },
  delivery: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    marginBottom: 8,
  },
  related: { gap: 12, paddingBottom: 6 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  heart: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: colors.primarySoft,
  },
});
