import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import CustomText from '../common/CustomText';
import QuantityStepper from '../common/QuantityStepper';
import ProductImage from './ProductImage';
import { formatPrice } from '../../utils/formatters';
import { colors, shadow } from '../../theme';

// Renglón de un producto dentro del carrito, con controles para sumar o restar cantidades.
export default function CartItem({ item, onChangeQuantity, onRemove, onPress, testID }) {
  const { product, quantity, color, size } = item;
  const variantText = [color, size && `Talla ${size}`].filter(Boolean).join(' · ');

  return (
    <View style={styles.row} testID={testID}>
      <Pressable onPress={onPress} style={styles.imageWrap}>
        <ProductImage product={product} size={88} radius={10} />
        <Pressable
          onPress={onRemove}
          style={styles.remove}
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${product.name}`}
          testID={testID ? `${testID}-remove` : undefined}
        >
          <Trash2 size={14} color={colors.error} />
        </Pressable>
      </Pressable>

      <View style={styles.info}>
        <CustomText variant="small" numberOfLines={2}>
          {product.name}
        </CustomText>
        {variantText ? (
          <CustomText variant="caption" color="textMuted" style={styles.variant}>
            {variantText}
          </CustomText>
        ) : null}
        <View style={styles.bottom}>
          <CustomText variant="price">{formatPrice(product.price * quantity)}</CustomText>
          <QuantityStepper
            value={quantity}
            onChange={onChangeQuantity}
            min={0}
            max={product.stock}
            size="sm"
            testID={testID ? `${testID}-qty` : undefined}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  imageWrap: {
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 3,
    ...shadow,
  },
  remove: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  variant: {
    marginTop: 2,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});
