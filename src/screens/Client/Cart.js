import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MapPin, Pencil, ShoppingBag, Ticket, X } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import CustomHeader from '../../components/layout/CustomHeader';
import SectionHeader from '../../components/layout/SectionHeader';
import Divider from '../../components/layout/Divider';
import CustomText from '../../components/common/CustomText';
import EmptyState from '../../components/common/EmptyState';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import CustomModal from '../../components/common/CustomModal';
import CartItem from '../../components/specific/CartItem';
import ProductCard from '../../components/specific/ProductCard';
import useAsync from '../../hooks/useAsync';
import { getProducts } from '../../api/products.api';
import { useCart } from '../../store/cartStore';
import { useShop } from '../../store/shopStore';
import { formatPrice } from '../../utils/formatters';
import { colors, radius } from '../../theme';

// P-09 Carrito de compras
export default function Cart({ navigation }) {
  const cart = useCart();
  const { wishlist } = useShop();
  const [confirmClear, setConfirmClear] = useState(false);
  const { data: products } = useAsync(() => getProducts(), []);

  const inCart = cart.items.map((i) => i.product.id);
  const fromWishlist = (products ?? []).filter((p) => wishlist.includes(p.id) && !inCart.includes(p.id) && p.stock > 0).slice(0, 3);

  const header = (
    <CustomHeader
      title="Carrito"
      showBack={false}
      right={
        <View style={styles.countBubble}>
          <CustomText variant="smallBold" color="primary">
            {cart.count}
          </CustomText>
        </View>
      }
    />
  );

  const wishlistSection =
    fromWishlist.length > 0 ? (
      <View style={styles.section}>
        <SectionHeader title="De tu lista de deseos" onAction={() => navigation.navigate('Wishlist')} />
        {fromWishlist.map((product) => (
          <ProductCard
            key={product.id}
            variant="row"
            product={product}
            onPress={() => navigation.navigate('Product', { productId: product.id })}
            onAddToCart={(p) => cart.addItem(p, { color: p.colors[0]?.name, size: p.sizes[0] })}
            testID={`cart-wish-${product.id}`}
          />
        ))}
      </View>
    ) : null;

  if (cart.items.length === 0) {
    return (
      <ScreenWrapper scroll header={header}>
        <AddressCard address={cart.selectedAddress} onEdit={() => navigation.navigate('Payment')} disabled />
        <EmptyState
          icon={ShoppingBag}
          title="Tu carrito está vacío"
          message="Agrega productos desde la tienda o tu lista de deseos."
          actionText="Continuar comprando"
          onAction={() => navigation.navigate('ShopClient')}
        />
        {wishlistSection}
      </ScreenWrapper>
    );
  }

  const footer = (
    <View style={styles.footer}>
      <View>
        <CustomText variant="caption" color="textMuted">
          Total
        </CustomText>
        <CustomText variant="h2">{formatPrice(cart.total)}</CustomText>
      </View>
      <PrimaryButton title="Finalizar compra" onPress={() => navigation.navigate('Payment')} style={styles.checkout} testID="cart-checkout" />
    </View>
  );

  return (
    <ScreenWrapper scroll header={header} footer={footer}>
      <AddressCard address={cart.selectedAddress} onEdit={() => navigation.navigate('Payment')} />

      {cart.items.map((item) => (
        <CartItem
          key={item.key}
          item={item}
          testID={`cart-item-${item.product.id}`}
          onPress={() => navigation.navigate('Product', { productId: item.product.id })}
          onChangeQuantity={(q) => cart.updateQuantity(item.key, q)}
          onRemove={() => cart.removeItem(item.key)}
        />
      ))}

      <View style={styles.rowBetween}>
        <SecondaryButton title="Continuar comprando" variant="ghost" size="sm" onPress={() => navigation.navigate('ShopClient')} />
        <SecondaryButton title="Vaciar carrito" variant="ghost" size="sm" onPress={() => setConfirmClear(true)} testID="cart-clear" />
      </View>

      {/* Cupón */}
      {cart.voucher ? (
        <View style={[styles.voucher, cart.voucherError && styles.voucherWarning]}>
          <Ticket size={18} color={cart.voucherError ? colors.warning : colors.primary} />
          <View style={styles.flex}>
            <CustomText variant="smallBold">{cart.voucher.code}</CustomText>
            <CustomText variant="caption" color={cart.voucherError ? 'warning' : 'textMuted'}>
              {cart.voucherError ?? cart.voucher.description}
            </CustomText>
          </View>
          <Pressable onPress={cart.removeVoucher} hitSlop={8} accessibilityLabel="Quitar cupón">
            <X size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.voucher} onPress={() => navigation.navigate('Voucher', { selectMode: true })} testID="cart-voucher">
          <Ticket size={18} color={colors.primary} />
          <CustomText variant="smallBold" color="primary" style={styles.flex}>
            Añadir cupón
          </CustomText>
        </Pressable>
      )}

      {/* Resumen */}
      <View style={styles.summary}>
        <SummaryRow label={`Subtotal (${cart.count} artículos)`} value={formatPrice(cart.subtotal)} />
        {cart.discount > 0 ? <SummaryRow label="Descuento" value={`- ${formatPrice(cart.discount)}`} highlight /> : null}
        <SummaryRow label="Envío" value={cart.shipping === 0 ? 'Gratis' : formatPrice(cart.shipping)} />
        <Divider spacing={8} />
        <SummaryRow label="Total" value={formatPrice(cart.total)} bold />
      </View>

      {wishlistSection}

      <CustomModal
        visible={confirmClear}
        variant="warning"
        title="¿Vaciar el carrito?"
        message="Se eliminarán todos los productos del carrito."
        primaryText="Vaciar"
        onPrimary={() => {
          cart.clearCart();
          setConfirmClear(false);
        }}
        secondaryText="Cancelar"
        onClose={() => setConfirmClear(false)}
      />
    </ScreenWrapper>
  );
}

function AddressCard({ address, onEdit, disabled }) {
  return (
    <View style={styles.address}>
      <MapPin size={18} color={colors.primary} />
      <View style={styles.flex}>
        <CustomText variant="smallBold">Dirección de envío</CustomText>
        <CustomText variant="caption" color="textMuted" numberOfLines={2}>
          {address ? `${address.address}, ${address.city}` : 'Agrega una dirección'}
        </CustomText>
      </View>
      {!disabled ? (
        <Pressable onPress={onEdit} style={styles.editButton} accessibilityLabel="Cambiar dirección">
          <Pencil size={14} color={colors.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

function SummaryRow({ label, value, bold, highlight }) {
  return (
    <View style={styles.summaryRow}>
      <CustomText variant={bold ? 'bodyBold' : 'small'} color={bold ? 'ink' : 'textMuted'}>
        {label}
      </CustomText>
      <CustomText variant={bold ? 'h3' : 'smallBold'} color={highlight ? 'success' : 'ink'}>
        {value}
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  countBubble: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  address: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  editButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  voucher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    marginTop: 8,
  },
  voucherWarning: {
    borderColor: colors.warning,
    backgroundColor: colors.warningLight,
  },
  summary: {
    marginTop: 16,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  checkout: {
    flex: 1,
  },
});
