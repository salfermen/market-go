import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import CustomText from '../common/CustomText';
import SecondaryButton from '../common/SecondaryButton';
import PrimaryButton from '../common/PrimaryButton';
import ProductImage from './ProductImage';
import StatusChip from './StatusChip';
import { formatDate, formatDateTime, formatPrice } from '../../utils/formatters';
import { CLIENT_ORDER_STATUS } from '../../utils/constants';
import { ORDER_STATUS } from '../../store/sellerStore';
import { colors, radius, shadow } from '../../theme';

const SELLER_TONES = { new: 'error', preparing: 'warning', shipped: 'primary', delivered: 'success' };

// Tarjeta de resumen de un pedido.
// variant 'client': historial de compras del cliente.
// variant 'seller': panel de gestión del vendedor.
export default function OrderItem({ order, variant = 'client', onPress, actionLabel, onAction, actionPrimary = false, testID }) {
  const units = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const first = order.items[0];
  const status =
    variant === 'seller'
      ? { label: ORDER_STATUS[order.status].label, tone: SELLER_TONES[order.status] }
      : CLIENT_ORDER_STATUS[order.status];

  return (
    <Pressable testID={testID} onPress={onPress} style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}>
      <View style={styles.top}>
        <View style={styles.imageWrap}>
          <ProductImage product={first} size={64} radius={10} />
          {order.items.length > 1 ? (
            <View style={styles.more}>
              <CustomText variant="caption" color="white" weight="700">
                +{order.items.length - 1}
              </CustomText>
            </View>
          ) : null}
        </View>

        <View style={styles.info}>
          <View style={styles.headerRow}>
            <CustomText variant="bodyBold">Orden #{order.id}</CustomText>
            <StatusChip label={status.label} tone={status.tone} />
          </View>
          <CustomText variant="small" color="textMuted" numberOfLines={1}>
            {variant === 'seller' ? `${order.customer} · ${order.city}` : first.name}
          </CustomText>
          <CustomText variant="caption" color="textMuted" style={styles.meta}>
            {variant === 'seller' ? formatDateTime(order.date) : formatDate(order.date)} · {units}{' '}
            {units === 1 ? 'artículo' : 'artículos'}
          </CustomText>
        </View>
      </View>

      <View style={styles.bottom}>
        <CustomText variant="price">{formatPrice(order.total)}</CustomText>
        {actionLabel ? (
          actionPrimary ? (
            <PrimaryButton title={actionLabel} onPress={onAction} size="sm" testID={testID ? `${testID}-action` : undefined} />
          ) : (
            <SecondaryButton title={actionLabel} onPress={onAction} size="sm" testID={testID ? `${testID}-action` : undefined} />
          )
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  top: {
    flexDirection: 'row',
    gap: 12,
  },
  imageWrap: {
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 2,
    ...shadow,
  },
  more: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: colors.white,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  meta: {
    marginTop: 1,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
