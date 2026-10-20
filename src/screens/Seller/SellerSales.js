import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ChartColumn, Percent, Receipt, ShoppingBag, Wallet } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import SellerHeader from '../../components/layout/SellerHeader';
import SectionHeader from '../../components/layout/SectionHeader';
import CustomText from '../../components/common/CustomText';
import SegmentedTabs from '../../components/common/SegmentedTabs';
import SecondaryButton from '../../components/common/SecondaryButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/specific/StatCard';
import BarChart from '../../components/specific/BarChart';
import { useSeller } from '../../store/sellerStore';
import { formatCompactPrice, formatDateTime, formatNumber, formatPrice, formatShort } from '../../utils/formatters';
import { colors, radius } from '../../theme';

// P-20 Ventas del vendedor
export default function SellerSales({ navigation }) {
  const seller = useSeller();
  const [period, setPeriod] = useState('week');

  if (seller.loading || !seller.sales) {
    return (
      <ScreenWrapper background={colors.surface} padded={false} header={<SellerHeader section="Ventas" title="Ventas" />}>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  const { totals, weekly, monthly } = seller.sales;
  const data = period === 'week' ? weekly : monthly;
  const periodTotal = data.reduce((s, d) => s + d.value, 0);
  const transactions = seller.orders.filter((o) => o.status === 'shipped' || o.status === 'delivered');

  return (
    <ScreenWrapper scroll background={colors.surface} header={<SellerHeader section="Ventas" title="Ventas" />} contentStyle={styles.content}>
      <SegmentedTabs
        options={[
          { key: 'week', label: 'Esta semana' },
          { key: 'month', label: 'Últimos 6 meses' },
        ]}
        value={period}
        onChange={setPeriod}
      />

      <View style={styles.card}>
        <CustomText variant="small" color="textMuted">
          Ingresos del periodo
        </CustomText>
        <CustomText variant="h1" style={styles.total}>
          {formatPrice(periodTotal)}
        </CustomText>
        <BarChart data={data} showValues formatValue={formatShort} height={170} />
      </View>

      <View style={styles.grid}>
        <StatCard label="Ingresos del mes" value={formatCompactPrice(totals.revenue)} change={totals.revenueChange} icon={Wallet} style={styles.half} compact />
        <StatCard label="Pedidos" value={formatNumber(totals.orders)} change={totals.ordersChange} icon={ShoppingBag} tone={colors.successLight} iconColor={colors.success} style={styles.half} compact />
        <StatCard label="Ticket promedio" value={formatCompactPrice(totals.avgTicket)} icon={Receipt} tone={colors.warningLight} iconColor={colors.warning} style={styles.half} compact />
        <StatCard label="Conversión" value={`${String(totals.conversion).replace('.', ',')} %`} icon={Percent} tone={colors.infoLight} iconColor={colors.info} style={styles.half} compact />
      </View>

      <View style={styles.card}>
        <SectionHeader title="Transacciones recientes" />
        {transactions.length === 0 ? (
          <CustomText variant="small" color="textMuted">
            Aún no hay ventas despachadas.
          </CustomText>
        ) : (
          transactions.map((order) => (
            <View key={order.id} style={styles.txRow}>
              <View style={styles.txIcon}>
                <Wallet size={16} color={colors.success} />
              </View>
              <View style={styles.flex}>
                <CustomText variant="smallBold">#{order.id} · {order.customer}</CustomText>
                <CustomText variant="caption" color="textMuted">
                  {formatDateTime(order.date)}
                </CustomText>
              </View>
              <CustomText variant="smallBold" color="success">
                + {formatPrice(order.total)}
              </CustomText>
            </View>
          ))
        )}
      </View>

      <SecondaryButton title="Ver reportes detallados" icon={ChartColumn} onPress={() => navigation.navigate('SellerReports')} testID="sales-reports" />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 16, gap: 14 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  total: { marginTop: 4, marginBottom: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  half: { width: '48.5%' },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  txIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
