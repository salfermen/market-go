import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Check, Headphones, MapPin, Package, Star, Truck } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import CustomHeader from '../../components/layout/CustomHeader';
import CustomText from '../../components/common/CustomText';
import EmptyState from '../../components/common/EmptyState';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import OrderItem from '../../components/specific/OrderItem';
import ProductImage from '../../components/specific/ProductImage';
import StatusChip from '../../components/specific/StatusChip';
import { useShop } from '../../store/shopStore';
import { CLIENT_ORDER_STATUS, TRACKING_STEPS } from '../../utils/constants';
import { formatDate, formatPrice } from '../../utils/formatters';
import { colors, radius } from '../../theme';

// P-11 Seguimiento de envío (Detalle del pedido)
// Con orderId muestra la línea de tiempo del envío; sin orderId lista los pedidos "Para recibir".
export default function Deliver({ navigation, route }) {
  const { orders } = useShop();
  const orderId = route.params?.orderId;
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    const pending = orders.filter((o) => o.status !== 'delivered');
    return (
      <ScreenWrapper scroll header={<CustomHeader title="Para recibir" subtitle="Rastrea tus pedidos en camino" />}>
        {pending.length === 0 ? (
          <EmptyState icon={Truck} title="No tienes envíos pendientes" message="Cuando compres algo, podrás seguir su recorrido aquí." />
        ) : (
          pending.map((o) => (
            <OrderItem
              key={o.id}
              order={o}
              onPress={() => navigation.setParams({ orderId: o.id })}
              actionLabel="Rastrear"
              onAction={() => navigation.setParams({ orderId: o.id })}
              testID={`deliver-${o.id}`}
            />
          ))
        )}
      </ScreenWrapper>
    );
  }

  const currentIndex = TRACKING_STEPS.findIndex((s) => s.key === order.status);
  const status = CLIENT_ORDER_STATUS[order.status];
  const firstProductId = order.items[0]?.productId;

  return (
    <ScreenWrapper
      scroll
      edges={['top', 'bottom']}
      header={<CustomHeader title="Seguimiento de envío" breadcrumb={`Orden #${order.id}`} />}
    >
      {/* Progreso */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <CustomText variant="bodyBold">{status.label}</CustomText>
          <StatusChip label={formatDate(order.date)} tone="neutral" />
        </View>
        <View style={styles.progress}>
          {TRACKING_STEPS.map((step, index) => (
            <React.Fragment key={step.key}>
              <View style={[styles.progressDot, index <= currentIndex && styles.progressDotDone]}>
                {index <= currentIndex ? <Check size={12} color={colors.white} /> : null}
              </View>
              {index < TRACKING_STEPS.length - 1 ? (
                <View style={[styles.progressLine, index < currentIndex && styles.progressLineDone]} />
              ) : null}
            </React.Fragment>
          ))}
        </View>
        <View style={styles.tracking}>
          <Package size={16} color={colors.primary} />
          <View style={styles.flex}>
            <CustomText variant="caption" color="textMuted">
              Número de rastreo
            </CustomText>
            <CustomText variant="smallBold" selectable>
              {order.tracking}
            </CustomText>
          </View>
        </View>
      </View>

      {/* Línea de tiempo */}
      <CustomText variant="h3" style={styles.sectionTitle}>
        Recorrido del paquete
      </CustomText>
      <View style={styles.timeline}>
        {TRACKING_STEPS.map((step, index) => {
          const done = index <= currentIndex;
          const active = index === currentIndex;
          return (
            <View key={step.key} style={styles.step}>
              <View style={styles.stepRail}>
                <View style={[styles.stepDot, done && styles.stepDotDone, active && styles.stepDotActive]} />
                {index < TRACKING_STEPS.length - 1 ? <View style={[styles.stepLine, index < currentIndex && styles.stepLineDone]} /> : null}
              </View>
              <View style={styles.stepText}>
                <View style={styles.rowBetween}>
                  <CustomText variant="bodyBold" style={!done && { color: colors.textLight }}>
                    {step.title}
                  </CustomText>
                  {done ? (
                    <CustomText variant="caption" color="primary" weight="700">
                      {formatDate(new Date(new Date(`${order.date}T08:00`).getTime() + index * 86400000))}
                    </CustomText>
                  ) : null}
                </View>
                <CustomText variant="caption" color="textMuted">
                  {step.description}
                </CustomText>
              </View>
            </View>
          );
        })}
      </View>

      {/* Dirección y productos */}
      <View style={[styles.card, styles.address]}>
        <MapPin size={18} color={colors.primary} />
        <View style={styles.flex}>
          <CustomText variant="smallBold">Dirección de entrega</CustomText>
          <CustomText variant="caption" color="textMuted">
            {order.address}
          </CustomText>
        </View>
      </View>

      <CustomText variant="h3" style={styles.sectionTitle}>
        Productos
      </CustomText>
      {order.items.map((item) => (
        <View key={`${item.productId}-${item.color}-${item.size}`} style={styles.item}>
          <ProductImage product={item} size={48} radius={10} iconSize={20} />
          <View style={styles.flex}>
            <CustomText variant="small" numberOfLines={1}>
              {item.name}
            </CustomText>
            <CustomText variant="caption" color="textMuted">
              x{item.quantity}
            </CustomText>
          </View>
          <CustomText variant="smallBold">{formatPrice(item.price * item.quantity)}</CustomText>
        </View>
      ))}
      <View style={[styles.rowBetween, styles.total]}>
        <CustomText variant="bodyBold">Total pagado</CustomText>
        <CustomText variant="h3">{formatPrice(order.total)}</CustomText>
      </View>

      {order.status === 'delivered' && !order.reviewed ? (
        <PrimaryButton
          title="Calificar producto"
          icon={Star}
          onPress={() => navigation.navigate('Reviews', { productId: firstProductId, orderId: order.id })}
          style={styles.button}
        />
      ) : null}
      <SecondaryButton title="Contactar soporte" icon={Headphones} onPress={() => navigation.navigate('ChatSupport')} style={styles.button} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  progressDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotDone: {
    backgroundColor: colors.primary,
  },
  progressLine: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
    borderRadius: 2,
  },
  progressLineDone: {
    backgroundColor: colors.primary,
  },
  tracking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 12,
  },
  timeline: {
    paddingLeft: 4,
  },
  step: {
    flexDirection: 'row',
    gap: 14,
  },
  stepRail: {
    alignItems: 'center',
    width: 16,
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginTop: 3,
  },
  stepDotDone: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  stepDotActive: {
    boxShadow: '0px 0px 0px 5px rgba(124, 58, 237, 0.2)',
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  stepLineDone: {
    backgroundColor: colors.primary,
  },
  stepText: {
    flex: 1,
    paddingBottom: 20,
  },
  address: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  total: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    marginTop: 14,
  },
});
