import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ClipboardList } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import SellerHeader from '../../components/layout/SellerHeader';
import Divider from '../../components/layout/Divider';
import CustomText from '../../components/common/CustomText';
import SegmentedTabs from '../../components/common/SegmentedTabs';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CustomModal from '../../components/common/CustomModal';
import Toast from '../../components/common/Toast';
import OrderItem from '../../components/specific/OrderItem';
import useToast from '../../hooks/useToast';
import { useSeller, ORDER_FLOW, ORDER_STATUS } from '../../store/sellerStore';
import { formatDateTime, formatPrice } from '../../utils/formatters';
import { colors } from '../../theme';

// P-19 Órdenes del vendedor (seguimiento de pedidos recibidos)
export default function SellerOrders() {
  const seller = useSeller();
  const { toast, showToast } = useToast();
  const [tab, setTab] = useState('new');
  const [detail, setDetail] = useState(null);

  const count = (status) => seller.orders.filter((o) => o.status === status).length;
  const list = tab === 'all' ? seller.orders : seller.orders.filter((o) => o.status === tab);

  const advance = async (order) => {
    const next = ORDER_FLOW[ORDER_FLOW.indexOf(order.status) + 1];
    await seller.advanceOrder(order);
    showToast(`Pedido #${order.id}: ${ORDER_STATUS[next].label.toLowerCase()}`);
  };

  return (
    <ScreenWrapper scroll background={colors.surface} header={<SellerHeader section="Pedidos" title="Pedidos recibidos" />} contentStyle={styles.content}>
      <SegmentedTabs
        scrollable
        options={[
          { key: 'new', label: 'Nuevos', count: count('new') },
          { key: 'preparing', label: 'En preparación', count: count('preparing') },
          { key: 'shipped', label: 'Enviados', count: count('shipped') },
          { key: 'delivered', label: 'Entregados', count: count('delivered') },
          { key: 'all', label: 'Todos' },
        ]}
        value={tab}
        onChange={setTab}
        style={styles.tabs}
      />

      {seller.loading ? <LoadingSpinner /> : null}
      {!seller.loading && list.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Sin pedidos en este estado" message="Cuando un cliente compre, el pedido aparecerá aquí." />
      ) : null}

      {list.map((order) => (
        <OrderItem
          key={order.id}
          order={order}
          variant="seller"
          testID={`seller-order-${order.id}`}
          onPress={() => setDetail(order)}
          actionLabel={ORDER_STATUS[order.status].next}
          actionPrimary
          onAction={() => advance(order)}
        />
      ))}

      <CustomModal visible={!!detail} hideIcon align="left" title={detail ? `Pedido #${detail.id}` : ''} primaryText="Cerrar" onClose={() => setDetail(null)}>
        {detail ? (
          <View>
            <CustomText variant="small" color="textMuted">
              Cliente
            </CustomText>
            <CustomText variant="bodyBold">
              {detail.customer} · {detail.city}
            </CustomText>
            <CustomText variant="caption" color="textMuted">
              {formatDateTime(detail.date)} · {ORDER_STATUS[detail.status].label}
            </CustomText>
            <Divider spacing={12} />
            {detail.items.map((item) => (
              <View key={item.productId} style={styles.itemRow}>
                <CustomText variant="small" style={styles.flex}>
                  {item.quantity} × {item.name}
                </CustomText>
                <CustomText variant="smallBold">{formatPrice(item.price * item.quantity)}</CustomText>
              </View>
            ))}
            <Divider spacing={12} />
            <View style={styles.itemRow}>
              <CustomText variant="bodyBold" style={styles.flex}>
                Total
              </CustomText>
              <CustomText variant="h3">{formatPrice(detail.total)}</CustomText>
            </View>
          </View>
        ) : null}
      </CustomModal>
      <Toast {...toast} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 16 },
  tabs: { marginBottom: 14 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
});
