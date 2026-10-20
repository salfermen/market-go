import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ClipboardList } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import CustomHeader from '../../components/layout/CustomHeader';
import SegmentedTabs from '../../components/common/SegmentedTabs';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CustomModal from '../../components/common/CustomModal';
import InputField from '../../components/common/InputField';
import CustomText from '../../components/common/CustomText';
import OrderItem from '../../components/specific/OrderItem';
import RatingStars from '../../components/specific/RatingStars';
import ProductImage from '../../components/specific/ProductImage';
import useForm from '../../hooks/useForm';
import { useAuth } from '../../store/authStore';
import { useShop } from '../../store/shopStore';
import { addReview } from '../../api/products.api';
import { validateReview } from '../../utils/validations';
import { colors } from '../../theme';

// P-12 Historial de compras (Mis pedidos)
export default function History({ navigation, route }) {
  const { user } = useAuth();
  const { orders, ordersLoading, setOrderReviewed } = useShop();
  const [tab, setTab] = useState(route.params?.filter ?? 'all');
  const [reviewing, setReviewing] = useState(null); // pedido que se está calificando
  const [thanks, setThanks] = useState(false);
  const [saving, setSaving] = useState(false);
  const form = useForm({ rating: 0, comment: '' }, validateReview);

  const active = orders.filter((o) => o.status !== 'delivered');
  const delivered = orders.filter((o) => o.status === 'delivered');
  const list = tab === 'active' ? active : tab === 'delivered' ? delivered : orders;

  const submitReview = form.handleSubmit(async (values) => {
    setSaving(true);
    await addReview(reviewing.items[0].productId, { ...values, author: user.name });
    await setOrderReviewed(reviewing.id);
    setSaving(false);
    setReviewing(null);
    form.reset();
    setThanks(true);
  });

  const actionFor = (order) => {
    if (order.status !== 'delivered') return { label: 'Rastrear', onPress: () => navigation.navigate('Deliver', { orderId: order.id }) };
    if (!order.reviewed) return { label: 'Reseña', onPress: () => setReviewing(order), primary: true };
    return { label: 'Ver detalle', onPress: () => navigation.navigate('Deliver', { orderId: order.id }) };
  };

  return (
    <ScreenWrapper scroll header={<CustomHeader title="Historial" subtitle="Tus compras en MarketGO" />}>
      <SegmentedTabs
        options={[
          { key: 'all', label: 'Todos', count: orders.length },
          { key: 'active', label: 'En curso', count: active.length },
          { key: 'delivered', label: 'Entregados', count: delivered.length },
        ]}
        value={tab}
        onChange={setTab}
        scrollable
        style={styles.tabs}
      />

      {ordersLoading ? <LoadingSpinner /> : null}
      {!ordersLoading && list.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No hay pedidos aquí"
          message="Cuando realices una compra aparecerá en esta lista."
          actionText="Ir a la tienda"
          onAction={() => navigation.popTo('ClientTabs', { screen: 'ShopClient' })}
        />
      ) : null}

      {list.map((order) => {
        const action = actionFor(order);
        return (
          <OrderItem
            key={order.id}
            order={order}
            testID={`order-${order.id}`}
            onPress={() => navigation.navigate('Deliver', { orderId: order.id })}
            actionLabel={action.label}
            onAction={action.onPress}
            actionPrimary={action.primary}
          />
        );
      })}

      {/* Reseña del pedido */}
      <CustomModal
        visible={!!reviewing}
        hideIcon
        title="Reseña"
        onClose={() => {
          setReviewing(null);
          form.reset();
        }}
        primaryText={saving ? 'Enviando…' : 'Comentar'}
        onPrimary={submitReview}
        secondaryText="Cancelar"
        testID="review-modal"
      >
        {reviewing ? (
          <View>
            <View style={styles.reviewProduct}>
              <ProductImage product={reviewing.items[0]} size={44} radius={22} iconSize={18} />
              <View style={styles.flex}>
                <CustomText variant="small" numberOfLines={1}>
                  {reviewing.items[0].name}
                </CustomText>
                <CustomText variant="smallBold">Orden #{reviewing.id}</CustomText>
              </View>
            </View>
            <RatingStars value={form.values.rating} onChange={(n) => form.setField('rating', n)} size={34} style={styles.stars} />
            {form.errors.rating ? (
              <CustomText variant="caption" color="error" align="center">
                {form.errors.rating}
              </CustomText>
            ) : null}
            <InputField placeholder="Tu comentario" multiline style={styles.comment} testID="review-comment" {...form.getFieldProps('comment')} />
          </View>
        ) : null}
      </CustomModal>

      <CustomModal visible={thanks} variant="success" title="¡Listo!" message="Gracias por tu reseña. Ayudas a otros compradores y al emprendimiento." primaryText="Cerrar" onClose={() => setThanks(false)} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: {
    marginBottom: 16,
  },
  reviewProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  stars: {
    justifyContent: 'center',
    marginVertical: 16,
    gap: 8,
  },
  comment: {
    marginTop: 8,
  },
});
