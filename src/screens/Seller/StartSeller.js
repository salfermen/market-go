import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChartColumn, ClipboardList, Package, Plus, ShoppingBag, Star, Wallet } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import SellerHeader from '../../components/layout/SellerHeader';
import SectionHeader from '../../components/layout/SectionHeader';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/specific/StatCard';
import BarChart from '../../components/specific/BarChart';
import DonutChart from '../../components/specific/DonutChart';
import ProductImage from '../../components/specific/ProductImage';
import StatusChip from '../../components/specific/StatusChip';
import { useAuth } from '../../store/authStore';
import { useSeller, ORDER_STATUS } from '../../store/sellerStore';
import { formatCompactPrice, formatDateTime, formatNumber, formatPrice } from '../../utils/formatters';
import { stores } from '../../data/mockData';
import { colors, radius } from '../../theme';

const STATUS_TONE = { new: 'error', preparing: 'warning', shipped: 'primary', delivered: 'success' };

// P-17 Inicio del vendedor (Panel del emprendedor – Resumen)
export default function StartSeller({ navigation }) {
  const { user } = useAuth();
  const seller = useSeller();
  const store = stores.find((s) => s.id === user.storeId);

  if (seller.loading || !seller.sales) {
    return (
      <ScreenWrapper background={colors.surface} padded={false} header={<SellerHeader section="Panel" title="Resumen" />}>
        <LoadingSpinner message="Cargando tu panel…" />
      </ScreenWrapper>
    );
  }

  const { totals, weekly } = seller.sales;
  const topProducts = [...seller.products].sort((a, b) => b.sold - a.sold).slice(0, 3);

  return (
    <ScreenWrapper scroll background={colors.surface} header={<SellerHeader section="Panel" title="Resumen" />} contentStyle={styles.content}>
      <CustomText variant="h1">Hola, {user.name.split(' ')[0]}</CustomText>
      <CustomText variant="small" color="textMuted" style={styles.subtitle}>
        Aquí tienes el resumen de {store?.name ?? 'tu tienda'} hoy.
      </CustomText>

      <PrimaryButton
        title="Agregar producto"
        icon={Plus}
        onPress={() => navigation.navigate('SellerProducts', { openForm: Date.now() })}
        testID="seller-add-product"
      />

      {/* KPIs */}
      <View style={styles.grid}>
        <StatCard label="Ventas totales" value={formatCompactPrice(totals.revenue)} change={totals.revenueChange} icon={Wallet} style={styles.half} compact />
        <StatCard label="Pedidos" value={formatNumber(totals.orders)} change={totals.ordersChange} icon={ShoppingBag} tone={colors.successLight} iconColor={colors.success} style={styles.half} compact />
        <StatCard label="Productos activos" value={seller.activeProducts} icon={Package} tone={colors.warningLight} iconColor={colors.warning} style={styles.half} compact />
        <StatCard
          label="Valoración media"
          value={`${seller.averageRating.toFixed(1)} / 5`}
          icon={Star}
          tone={colors.errorLight}
          iconColor={colors.error}
          style={styles.half}
          compact
        />
      </View>

      {/* Ventas de la semana */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.flex}>
            <CustomText variant="h3">Ventas</CustomText>
            <CustomText variant="caption" color="textMuted">
              Rendimiento de los últimos 7 días
            </CustomText>
          </View>
          <View style={styles.periodChip}>
            <CustomText variant="caption" weight="700">
              Esta semana
            </CustomText>
          </View>
        </View>
        <BarChart data={weekly} formatValue={formatCompactPrice} />
      </View>

      {/* Inventario */}
      <View style={styles.card}>
        <SectionHeader title="Estado del inventario" actionText="Ver inventario" onAction={() => navigation.navigate('SellerProducts')} />
        <DonutChart
          centerValue={seller.activeProducts}
          centerLabel="productos"
          segments={[
            { label: 'Stock normal', value: seller.inventory.normal, color: colors.primary },
            { label: 'Bajo stock', value: seller.inventory.low, color: colors.yellow },
            { label: 'Agotados', value: seller.inventory.out, color: '#F472B6' },
          ]}
        />
      </View>

      {/* Pedidos recientes */}
      <View style={styles.card}>
        <SectionHeader title="Pedidos recientes" onAction={() => navigation.navigate('SellerOrders')} />
        {seller.orders.length === 0 ? (
          <CustomText variant="small" color="textMuted">
            Aún no tienes pedidos.
          </CustomText>
        ) : (
          seller.orders.slice(0, 3).map((order) => (
            <Pressable key={order.id} style={styles.orderRow} onPress={() => navigation.navigate('SellerOrders')}>
              <View style={styles.flex}>
                <CustomText variant="smallBold">#{order.id}</CustomText>
                <CustomText variant="caption" color="textMuted">
                  {order.customer} · {formatDateTime(order.date)}
                </CustomText>
              </View>
              <View style={styles.orderRight}>
                <CustomText variant="smallBold">{formatPrice(order.total)}</CustomText>
                <StatusChip label={ORDER_STATUS[order.status].label} tone={STATUS_TONE[order.status]} />
              </View>
            </Pressable>
          ))
        )}
      </View>

      {/* Más vendidos */}
      <View style={styles.card}>
        <SectionHeader title="Productos más vendidos" />
        {topProducts.map((product, index) => (
          <Pressable key={product.id} style={styles.topRow} onPress={() => navigation.navigate('Product', { productId: product.id })}>
            <CustomText variant="smallBold" color="textLight" style={styles.rank}>
              0{index + 1}
            </CustomText>
            <ProductImage product={product} size={44} radius={8} iconSize={20} />
            <View style={styles.flex}>
              <CustomText variant="small">{product.name}</CustomText>
              <CustomText variant="caption" color="textMuted">
                {product.sold} vendidos
              </CustomText>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Accesos rápidos */}
      <View style={styles.quickRow}>
        <QuickLink icon={ChartColumn} label="Reportes" onPress={() => navigation.navigate('SellerReports')} testID="seller-reports" />
        <QuickLink icon={Star} label="Reseñas" onPress={() => navigation.navigate('SellerReviews')} testID="seller-reviews" />
        <QuickLink icon={ClipboardList} label="Pedidos" onPress={() => navigation.navigate('SellerOrders')} />
      </View>
    </ScreenWrapper>
  );
}

function QuickLink({ icon: Icon, label, onPress, testID }) {
  return (
    <Pressable style={styles.quick} onPress={onPress} testID={testID} accessibilityRole="button">
      <View style={styles.quickIcon}>
        <Icon size={20} color={colors.primary} />
      </View>
      <CustomText variant="smallBold">{label}</CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 16, gap: 14 },
  subtitle: { marginTop: -8 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  half: { width: '48.5%' },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  periodChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  rank: { width: 22 },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quick: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
