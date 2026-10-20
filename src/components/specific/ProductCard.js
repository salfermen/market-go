import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Heart, ShoppingBag, Star } from 'lucide-react-native';
import CustomText from '../common/CustomText';
import ProductImage from './ProductImage';
import { formatPrice, getDiscount } from '../../utils/formatters';
import { colors, radius, shadow } from '../../theme';

// Tarjeta de producto con imagen, precio y título.
// Se reutiliza en ShopClient, Search, FlashSale, Wishlist, RecentlyViewed y SellerProducts.
// variant: 'grid' (cuadrícula) | 'compact' (carrusel horizontal) | 'row' (lista)
export default function ProductCard({
  product,
  onPress,
  variant = 'grid',
  width,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
  right,
  testID,
}) {
  const discount = getDiscount(product.price, product.oldPrice);
  const badgeText = discount ? `-${discount}%` : product.badge;

  const heart = onToggleFavorite ? (
    <Pressable
      testID={testID ? `${testID}-fav` : undefined}
      onPress={() => onToggleFavorite(product.id)}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      style={variant === 'row' ? styles.rowIcon : styles.heart}
    >
      <Heart size={16} color={isFavorite ? colors.error : colors.textMuted} fill={isFavorite ? colors.error : 'transparent'} />
    </Pressable>
  ) : null;

  if (variant === 'row') {
    return (
      <Pressable testID={testID} onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <View style={styles.rowImage}>
          <ProductImage product={product} size={92} radius={10} />
        </View>
        <View style={styles.rowInfo}>
          <CustomText variant="small" numberOfLines={2}>
            {product.name}
          </CustomText>
          <View style={styles.priceRow}>
            <CustomText variant="price">{formatPrice(product.price)}</CustomText>
            {product.oldPrice ? (
              <CustomText variant="caption" color="error" style={styles.oldPrice}>
                {formatPrice(product.oldPrice)}
              </CustomText>
            ) : null}
          </View>
          <View style={styles.tags}>
            {product.colors?.[0] ? <Tag text={product.colors[0].name} /> : null}
            {product.sizes?.[0] ? <Tag text={product.sizes[0]} /> : null}
          </View>
        </View>
        <View style={styles.rowActions}>
          {right}
          {heart}
          {onAddToCart ? (
            <Pressable
              onPress={() => onAddToCart(product)}
              style={styles.rowIcon}
              accessibilityRole="button"
              accessibilityLabel="Agregar al carrito"
              testID={testID ? `${testID}-cart` : undefined}
            >
              <ShoppingBag size={16} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    );
  }

  const isCompact = variant === 'compact';

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [{ width }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatPrice(product.price)}`}
    >
      <View style={[styles.imageFrame, shadow]}>
        <ProductImage product={product} style={styles.image} radius={8} iconSize={isCompact ? 30 : 46} />
        {badgeText ? (
          <View style={[styles.badge, discount ? styles.badgeSale : styles.badgeInfo]}>
            <CustomText variant="caption" color="white" weight="700">
              {badgeText}
            </CustomText>
          </View>
        ) : null}
        {heart}
      </View>

      {!isCompact ? (
        <CustomText variant="small" numberOfLines={2} style={styles.name}>
          {product.name}
        </CustomText>
      ) : null}
      <View style={[styles.priceRow, isCompact && styles.priceCompact]}>
        <CustomText variant={isCompact ? 'smallBold' : 'price'}>{formatPrice(product.price)}</CustomText>
        {product.oldPrice && !isCompact ? (
          <CustomText variant="caption" color="error" style={styles.oldPrice}>
            {formatPrice(product.oldPrice)}
          </CustomText>
        ) : null}
      </View>
      {!isCompact && product.rating ? (
        <View style={styles.rating}>
          <Star size={12} color={colors.star} fill={colors.star} />
          <CustomText variant="caption" color="textMuted">
            {product.rating.toFixed(1)} · {product.sold} vendidos
          </CustomText>
        </View>
      ) : null}
    </Pressable>
  );
}

function Tag({ text }) {
  return (
    <View style={styles.tag}>
      <CustomText variant="caption" color="primary">
        {text}
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  imageFrame: {
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    padding: 4,
  },
  image: {
    flex: 1,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeSale: {
    backgroundColor: colors.error,
  },
  badgeInfo: {
    backgroundColor: colors.primary,
  },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 8,
    color: colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  priceCompact: {
    justifyContent: 'center',
  },
  oldPrice: {
    textDecorationLine: 'line-through',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  rowImage: {
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 3,
    ...shadow,
  },
  rowInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  rowActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 4,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
