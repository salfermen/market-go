import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Banknote, Building2, CircleCheck, CreditCard, MapPin, Pencil, Plus, ShoppingBag, Smartphone, Ticket, UserRound } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import CustomHeader from '../../components/layout/CustomHeader';
import Divider from '../../components/layout/Divider';
import CustomText from '../../components/common/CustomText';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import CustomModal from '../../components/common/CustomModal';
import EmptyState from '../../components/common/EmptyState';
import ProductImage from '../../components/specific/ProductImage';
import useForm from '../../hooks/useForm';
import { useAuth } from '../../store/authStore';
import { useCart, SHIPPING_OPTIONS, PAYMENT_TYPES } from '../../store/cartStore';
import { useShop } from '../../store/shopStore';
import { createOrder } from '../../api/orders.api';
import { validateAddress, validateCard } from '../../utils/validations';
import { formatDate, formatPrice, maskCard } from '../../utils/formatters';
import { colors, radius } from '../../theme';

const PAYMENT_ICONS = { card: CreditCard, pse: Building2, nequi: Smartphone, cash: Banknote };

// P-10 Pasarela de pago (Checkout)
// Dirección, contacto, productos, opciones de envío, método de pago y confirmación.
// El pago es simulado: la tarjeta terminada en 0002 se rechaza para mostrar el error.
export default function Payment({ navigation }) {
  const { user, changePoints } = useAuth();
  const cart = useCart();
  const { addOrder } = useShop();
  const [addressModal, setAddressModal] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [cardModal, setCardModal] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | processing | failed | success
  const [order, setOrder] = useState(null);

  const addressForm = useForm({ fullName: user.name, phone: user.phone, city: '', address: '' }, validateAddress);
  const cardForm = useForm({ number: '', holder: '', expiry: '', cvv: '' }, validateCard);

  if (cart.items.length === 0 && status !== 'success') {
    return (
      <ScreenWrapper header={<CustomHeader title="Pago" />}>
        <EmptyState icon={ShoppingBag} title="No hay productos para pagar" actionText="Ir a la tienda" onAction={() => navigation.popTo('ClientTabs', { screen: 'ShopClient' })} />
      </ScreenWrapper>
    );
  }

  const selectedCard = cart.savedCards.find((c) => c.id === cart.payment.cardId);
  const shipping = SHIPPING_OPTIONS[cart.shippingMethod];
  const eta = new Date(Date.now() + (cart.shippingMethod === 'express' ? 2 : 7) * 86400000);

  const pay = async () => {
    setStatus('processing');
    // Simulación de rechazo para demostrar el manejo de errores
    if (cart.payment.type === 'card' && selectedCard?.last4 === '0002') {
      setTimeout(() => setStatus('failed'), 1500);
      return;
    }
    try {
      const created = await createOrder({
        userId: user.id,
        items: cart.items,
        address: cart.selectedAddress,
        shippingMethod: cart.shippingMethod,
        paymentMethod: cart.payment.type,
        voucherCode: cart.voucherError ? null : cart.voucher?.code,
        totals: { shipping: cart.shipping, total: cart.total },
      });
      addOrder(created);
      changePoints(Math.floor(cart.total / 1000)); // 1 punto por cada $1.000
      setOrder(created);
      setStatus('success');
    } catch {
      setStatus('failed');
    }
  };

  // El carrito se vacía al salir de la confirmación, para que el fondo no cambie mientras se ve el mensaje
  const finish = (goToOrder) => {
    cart.clearCart();
    if (goToOrder) navigation.replace('Deliver', { orderId: order.id });
    else navigation.popTo('ClientTabs', { screen: 'ShopClient' });
  };

  const saveAddress = addressForm.handleSubmit((values) => {
    cart.addAddress({ ...values, label: 'Nueva' });
    addressForm.reset();
    setAddingAddress(false);
    setAddressModal(false);
  });

  const saveCard = cardForm.handleSubmit((values) => {
    const digits = values.number.replace(/\D/g, '');
    cart.addCard({
      brand: digits.startsWith('5') ? 'Mastercard' : 'Visa',
      last4: digits.slice(-4),
      holder: values.holder.toUpperCase(),
      expiry: values.expiry,
    });
    cardForm.reset();
    setCardModal(false);
  });

  const footer = (
    <View style={styles.footer}>
      <View>
        <CustomText variant="caption" color="textMuted">
          Total a pagar
        </CustomText>
        <CustomText variant="h2">{formatPrice(cart.total)}</CustomText>
      </View>
      <PrimaryButton title="Pagar" variant="dark" onPress={pay} style={styles.payButton} testID="payment-pay" />
    </View>
  );

  return (
    <ScreenWrapper scroll edges={['top', 'bottom']} header={<CustomHeader title="Pago" subtitle="Revisa y confirma tu pedido" />} footer={status === 'success' ? null : footer}>
      {/* Dirección */}
      <InfoCard icon={MapPin} title="Dirección de envío" onEdit={() => setAddressModal(true)} testID="payment-address">
        {cart.selectedAddress
          ? `${cart.selectedAddress.fullName} · ${cart.selectedAddress.address}, ${cart.selectedAddress.city}`
          : 'Agrega una dirección de envío'}
      </InfoCard>

      {/* Contacto */}
      <InfoCard icon={UserRound} title="Información de contacto">
        {`${user.phone}\n${user.email}`}
      </InfoCard>

      {/* Productos */}
      <View style={styles.sectionHeader}>
        <CustomText variant="h3">Elementos</CustomText>
        <View style={styles.count}>
          <CustomText variant="caption" weight="700" color="primary">
            {cart.count}
          </CustomText>
        </View>
        <View style={styles.flex} />
        <SecondaryButton
          title={cart.voucher ? cart.voucher.code : 'Añadir cupón'}
          icon={Ticket}
          size="sm"
          onPress={() => navigation.navigate('Voucher', { selectMode: true })}
          testID="payment-voucher"
        />
      </View>
      {cart.items.map((item) => (
        <View key={item.key} style={styles.item}>
          <ProductImage product={item.product} size={48} radius={24} iconSize={20} />
          <View style={styles.flex}>
            <CustomText variant="small" numberOfLines={1}>
              {item.product.name}
            </CustomText>
            <CustomText variant="caption" color="textMuted">
              {[item.color, item.size].filter(Boolean).join(' · ')} · x{item.quantity}
            </CustomText>
          </View>
          <CustomText variant="smallBold">{formatPrice(item.product.price * item.quantity)}</CustomText>
        </View>
      ))}

      {/* Envío */}
      <CustomText variant="h3" style={styles.sectionTitle}>
        Opciones de envío
      </CustomText>
      {Object.values(SHIPPING_OPTIONS).map((option) => {
        const active = cart.shippingMethod === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => cart.setShippingMethod(option.id)}
            style={[styles.option, active && styles.optionActive]}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            testID={`shipping-${option.id}`}
          >
            <Radio active={active} />
            <CustomText variant="bodyBold">{option.label}</CustomText>
            <View style={styles.timeChip}>
              <CustomText variant="caption" color="primary">
                {option.time}
              </CustomText>
            </View>
            <View style={styles.flex} />
            <CustomText variant="smallBold">{option.cost === 0 ? 'GRATIS' : formatPrice(option.cost)}</CustomText>
          </Pressable>
        );
      })}
      <CustomText variant="caption" color="textMuted">
        Entrega estimada: {formatDate(eta)} ({shipping.label.toLowerCase()})
      </CustomText>

      {/* Método de pago */}
      <CustomText variant="h3" style={styles.sectionTitle}>
        Método de pago
      </CustomText>
      <View style={styles.methods}>
        {Object.entries(PAYMENT_TYPES).map(([type, label]) => {
          const Icon = PAYMENT_ICONS[type];
          const active = cart.payment.type === type;
          return (
            <Pressable
              key={type}
              onPress={() => cart.setPayment({ ...cart.payment, type })}
              style={[styles.method, active && styles.methodActive]}
              testID={`payment-${type}`}
            >
              <Icon size={18} color={active ? colors.white : colors.primary} />
              <CustomText variant="smallBold" style={{ color: active ? colors.white : colors.text }}>
                {label}
              </CustomText>
            </Pressable>
          );
        })}
      </View>

      {cart.payment.type === 'card' ? (
        <View>
          {cart.savedCards.map((card) => {
            const active = cart.payment.cardId === card.id;
            return (
              <Pressable key={card.id} onPress={() => cart.setPayment({ type: 'card', cardId: card.id })} style={[styles.card, active && styles.cardActive]}>
                <Radio active={active} />
                <CreditCard size={20} color={colors.ink} />
                <View style={styles.flex}>
                  <CustomText variant="smallBold">
                    {card.brand} {maskCard(card.last4)}
                  </CustomText>
                  <CustomText variant="caption" color="textMuted">
                    {card.holder} · vence {card.expiry}
                  </CustomText>
                </View>
              </Pressable>
            );
          })}
          <SecondaryButton title="Agregar tarjeta" icon={Plus} size="sm" onPress={() => setCardModal(true)} style={styles.addCard} testID="payment-add-card" />
        </View>
      ) : (
        <View style={styles.methodInfo}>
          <CustomText variant="small" color="textMuted">
            {cart.payment.type === 'pse' && 'Serás redirigido al portal de tu banco para autorizar el pago (simulado).'}
            {cart.payment.type === 'nequi' && `Recibirás una notificación en la app Nequi del número ${user.phone} (simulado).`}
            {cart.payment.type === 'cash' && 'Pagas en efectivo cuando recibas tu pedido. Disponible en ciudades principales.'}
          </CustomText>
        </View>
      )}

      {/* Resumen */}
      <View style={styles.summary}>
        <Row label="Subtotal" value={formatPrice(cart.subtotal)} />
        {cart.discount > 0 ? <Row label={`Cupón ${cart.voucher.code}`} value={`- ${formatPrice(cart.discount)}`} green /> : null}
        {cart.voucherError ? (
          <CustomText variant="caption" color="warning">
            {cart.voucherError}
          </CustomText>
        ) : null}
        <Row label="Envío" value={cart.shipping === 0 ? 'Gratis' : formatPrice(cart.shipping)} />
        <Divider spacing={6} />
        <Row label="Total" value={formatPrice(cart.total)} bold />
      </View>

      {/* Modal: direcciones (Checkout -> Direcciones -> Formulario de dirección) */}
      <CustomModal
        visible={addressModal}
        hideIcon
        align="left"
        title={addingAddress ? 'Nueva dirección' : 'Dirección de envío'}
        onClose={() => {
          setAddressModal(false);
          setAddingAddress(false);
        }}
        primaryText={addingAddress ? 'Guardar dirección' : undefined}
        onPrimary={saveAddress}
        secondaryText={addingAddress ? 'Cancelar' : undefined}
        onSecondary={() => setAddingAddress(false)}
      >
        {addingAddress ? (
          <View>
            <InputField label="Quién recibe" testID="address-name" {...addressForm.getFieldProps('fullName')} />
            <InputField label="Celular" keyboardType="phone-pad" maxLength={10} testID="address-phone" {...addressForm.getFieldProps('phone')} />
            <InputField label="Ciudad" placeholder="Ej. Bogotá" testID="address-city" {...addressForm.getFieldProps('city')} />
            <InputField label="Dirección" placeholder="Ej. Calle 45 # 12-30, Apto 201" testID="address-line" {...addressForm.getFieldProps('address')} />
          </View>
        ) : (
          <View>
            {cart.addresses.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => {
                  cart.selectAddress(a.id);
                  setAddressModal(false);
                }}
                style={[styles.card, cart.selectedAddressId === a.id && styles.cardActive]}
              >
                <Radio active={cart.selectedAddressId === a.id} />
                <View style={styles.flex}>
                  <CustomText variant="smallBold">{a.label}</CustomText>
                  <CustomText variant="caption" color="textMuted">
                    {a.address}, {a.city}
                  </CustomText>
                </View>
              </Pressable>
            ))}
            <SecondaryButton title="Agregar nueva dirección" icon={Plus} size="sm" onPress={() => setAddingAddress(true)} testID="address-add" />
          </View>
        )}
      </CustomModal>

      {/* Modal: nueva tarjeta */}
      <CustomModal
        visible={cardModal}
        hideIcon
        align="left"
        title="Agregar tarjeta"
        message="Tus datos se envían cifrados. En esta versión el pago es simulado."
        onClose={() => setCardModal(false)}
        primaryText="Guardar tarjeta"
        onPrimary={saveCard}
        secondaryText="Cancelar"
      >
        <InputField label="Número de tarjeta" keyboardType="number-pad" maxLength={19} placeholder="4242 4242 4242 4242" testID="card-number" {...cardForm.getFieldProps('number')} />
        <InputField label="Titular" autoCapitalize="characters" testID="card-holder" {...cardForm.getFieldProps('holder')} />
        <View style={styles.row2}>
          <InputField label="Vence (MM/AA)" maxLength={5} placeholder="08/28" style={styles.flex} testID="card-expiry" {...cardForm.getFieldProps('expiry')} />
          <InputField label="CVV" keyboardType="number-pad" maxLength={4} secureTextEntry style={styles.flex} testID="card-cvv" {...cardForm.getFieldProps('cvv')} />
        </View>
      </CustomModal>

      {/* Estados del pago */}
      <CustomModal visible={status === 'processing'} loading title="Procesando el pago…" message="No cierres la aplicación." onClose={() => {}} />
      <CustomModal
        visible={status === 'failed'}
        variant="error"
        title="No pudimos procesar tu pago"
        message="Tu banco rechazó la transacción. Prueba con otro método de pago; no se realizó ningún cobro."
        primaryText="Cambiar método"
        onClose={() => setStatus('idle')}
        onPrimary={() => setStatus('idle')}
      />
      <CustomModal
        visible={status === 'success'}
        variant="success"
        title="¡Compra exitosa!"
        message={order ? `Tu pedido #${order.id} fue confirmado. Te avisaremos cuando el emprendimiento lo despache.` : ''}
        primaryText="Ver pedido"
        onPrimary={() => finish(true)}
        secondaryText="Seguir comprando"
        onSecondary={() => finish(false)}
        onClose={() => finish(true)}
        testID="payment-success"
      >
        <View style={styles.successInfo}>
          <CircleCheck size={16} color={colors.success} />
          <CustomText variant="caption" color="textMuted">
            Sumaste {order ? Math.floor(order.total / 1000) : 0} puntos de recompensa
          </CustomText>
        </View>
      </CustomModal>
    </ScreenWrapper>
  );
}

function InfoCard({ icon: Icon, title, children, onEdit, testID }) {
  return (
    <View style={styles.infoCard}>
      <Icon size={18} color={colors.primary} />
      <View style={styles.flex}>
        <CustomText variant="smallBold">{title}</CustomText>
        <CustomText variant="caption" color="textMuted">
          {children}
        </CustomText>
      </View>
      {onEdit ? (
        <Pressable onPress={onEdit} style={styles.editButton} accessibilityLabel={`Editar ${title}`} testID={testID}>
          <Pencil size={14} color={colors.white} />
        </Pressable>
      ) : null}
    </View>
  );
}

function Radio({ active }) {
  return <View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View>;
}

function Row({ label, value, bold, green }) {
  return (
    <View style={styles.summaryRow}>
      <CustomText variant={bold ? 'bodyBold' : 'small'} color={bold ? 'ink' : 'textMuted'}>
        {label}
      </CustomText>
      <CustomText variant={bold ? 'h3' : 'smallBold'} color={green ? 'success' : 'ink'}>
        {value}
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
  editButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 6,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  count: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  timeChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  methods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  methodActive: {
    backgroundColor: colors.primary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 8,
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  addCard: {
    alignSelf: 'flex-start',
  },
  methodInfo: {
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  summary: {
    marginTop: 20,
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
  row2: {
    flexDirection: 'row',
    gap: 10,
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
  payButton: {
    flex: 1,
  },
  successInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
