import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Download, MapPin } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import SellerHeader from '../../components/layout/SellerHeader';
import SectionHeader from '../../components/layout/SectionHeader';
import CustomText from '../../components/common/CustomText';
import PrimaryButton from '../../components/common/PrimaryButton';
import CustomModal from '../../components/common/CustomModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DonutChart from '../../components/specific/DonutChart';
import ProductImage from '../../components/specific/ProductImage';
import { useSeller } from '../../store/sellerStore';
import { formatPrice } from '../../utils/formatters';
import { colors, radius } from '../../theme';

// P-21 Reportes del vendedor
export default function SellerReports() {
  const seller = useSeller();
  const [exportInfo, setExportInfo] = useState(false);

  if (seller.loading || !seller.sales) {
    return (
      <ScreenWrapper background={colors.surface} padded={false} header={<SellerHeader section="Reportes" title="Reportes" showBack />}>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  const byCategory = seller.sales.byCategory;
  const top = [...seller.products].sort((a, b) => b.sold * b.price - a.sold * a.price).slice(0, 5);
  const cities = Object.entries(
    seller.orders.reduce((acc, o) => ({ ...acc, [o.city]: (acc[o.city] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <ScreenWrapper scroll background={colors.surface} edges={['top', 'bottom']} header={<SellerHeader section="Reportes" title="Reportes" showBack />} contentStyle={styles.content}>
      {/* Ventas por categoría */}
      <View style={styles.card}>
        <SectionHeader title="Ventas por categoría" />
        {byCategory.length === 0 ? (
          <CustomText variant="small" color="textMuted">
            Sin datos todavía.
          </CustomText>
        ) : (
          byCategory.map((row) => (
            <View key={row.label} style={styles.barRow}>
              <CustomText variant="small" style={styles.barLabel}>
                {row.label}
              </CustomText>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${row.value}%` }]} />
              </View>
              <CustomText variant="smallBold" style={styles.barValue}>
                {row.value}%
              </CustomText>
            </View>
          ))
        )}
      </View>

      {/* Productos con más ingresos */}
      <View style={styles.card}>
        <SectionHeader title="Productos con más ingresos" />
        {top.map((product, index) => (
          <View key={product.id} style={styles.topRow}>
            <CustomText variant="smallBold" color="textLight" style={styles.rank}>
              0{index + 1}
            </CustomText>
            <ProductImage product={product} size={40} radius={8} iconSize={18} />
            <View style={styles.flex}>
              <CustomText variant="small" numberOfLines={1}>
                {product.name}
              </CustomText>
              <CustomText variant="caption" color="textMuted">
                {product.sold} unidades
              </CustomText>
            </View>
            <CustomText variant="smallBold">{formatPrice(product.sold * product.price)}</CustomText>
          </View>
        ))}
      </View>

      {/* Inventario */}
      <View style={styles.card}>
        <SectionHeader title="Estado del inventario" />
        <DonutChart
          centerValue={seller.activeProducts}
          centerLabel="activos"
          segments={[
            { label: 'Stock normal', value: seller.inventory.normal, color: colors.primary },
            { label: 'Bajo stock', value: seller.inventory.low, color: colors.yellow },
            { label: 'Agotados', value: seller.inventory.out, color: '#F472B6' },
          ]}
        />
      </View>

      {/* Ciudades */}
      <View style={styles.card}>
        <SectionHeader title="Pedidos por ciudad" />
        {cities.map(([city, total]) => (
          <View key={city} style={styles.cityRow}>
            <MapPin size={16} color={colors.primary} />
            <CustomText variant="small" style={styles.flex}>
              {city}
            </CustomText>
            <CustomText variant="smallBold">
              {total} {total === 1 ? 'pedido' : 'pedidos'}
            </CustomText>
          </View>
        ))}
      </View>

      <PrimaryButton title="Exportar reporte" icon={Download} onPress={() => setExportInfo(true)} />

      <CustomModal
        visible={exportInfo}
        variant="info"
        title="Exportación en desarrollo"
        message="La descarga del reporte en PDF/Excel se habilitará cuando el backend en Ktor esté disponible."
        primaryText="Entendido"
        onClose={() => setExportInfo(false)}
      />
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
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  barLabel: { width: 90 },
  barTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.primaryLight, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5, backgroundColor: colors.primary },
  barValue: { width: 40, textAlign: 'right' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  rank: { width: 22 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
});
