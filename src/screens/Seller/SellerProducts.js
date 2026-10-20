import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { Package, Pencil, Plus, Search } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import SellerHeader from '../../components/layout/SellerHeader';
import CustomText from '../../components/common/CustomText';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import SegmentedTabs from '../../components/common/SegmentedTabs';
import CustomModal from '../../components/common/CustomModal';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';
import ProductImage from '../../components/specific/ProductImage';
import StatusChip from '../../components/specific/StatusChip';
import CategoryBadge from '../../components/specific/CategoryBadge';
import useForm from '../../hooks/useForm';
import useToast from '../../hooks/useToast';
import { useSeller, LOW_STOCK } from '../../store/sellerStore';
import { categories } from '../../data/mockData';
import { validateProduct } from '../../utils/validations';
import { formatPrice } from '../../utils/formatters';
import { colors, radius } from '../../theme';

const EMPTY_PRODUCT = { name: '', price: '', stock: '', category: '', description: '' };

const stockInfo = (p) => {
  if (p.stock === 0) return { label: 'Agotado', tone: 'error' };
  if (p.stock <= LOW_STOCK) return { label: `Bajo stock (${p.stock})`, tone: 'warning' };
  return { label: `Stock ${p.stock}`, tone: 'success' };
};

// P-18 Productos del vendedor (inventario + publicar / editar producto)
export default function SellerProducts({ navigation, route }) {
  const seller = useSeller();
  const { toast, showToast } = useToast();
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | producto
  const [saving, setSaving] = useState(false);
  const form = useForm(EMPTY_PRODUCT, validateProduct);

  // "Agregar producto" desde el panel abre el formulario directamente
  useEffect(() => {
    if (route.params?.openForm) openForm('new');
  }, [route.params?.openForm]); // eslint-disable-line react-hooks/exhaustive-deps

  function openForm(product) {
    form.reset(
      product === 'new'
        ? EMPTY_PRODUCT
        : { name: product.name, price: String(product.price), stock: String(product.stock), category: product.category, description: product.description },
    );
    setEditing(product);
  }

  const save = form.handleSubmit(async (values) => {
    setSaving(true);
    if (editing === 'new') {
      await seller.addProduct(values);
      showToast('Producto publicado');
    } else {
      await seller.editProduct(editing.id, {
        name: values.name.trim(),
        price: Number(values.price),
        stock: Number(values.stock),
        category: values.category,
        description: values.description,
      });
      showToast('Cambios guardados');
    }
    setSaving(false);
    setEditing(null);
  });

  const text = query.trim().toLowerCase();
  const filtered = seller.products.filter((p) => {
    if (text && !p.name.toLowerCase().includes(text)) return false;
    if (tab === 'active') return p.active;
    if (tab === 'low') return p.active && p.stock <= LOW_STOCK;
    if (tab === 'paused') return !p.active;
    return true;
  });

  return (
    <ScreenWrapper scroll keyboard background={colors.surface} header={<SellerHeader section="Inventario" title="Mis productos" />} contentStyle={styles.content}>
      <View style={styles.topRow}>
        <InputField placeholder="Buscar en mi inventario" icon={Search} value={query} onChangeText={setQuery} style={styles.search} />
        <Pressable style={styles.addButton} onPress={() => openForm('new')} accessibilityLabel="Nuevo producto" testID="products-add">
          <Plus size={22} color={colors.white} />
        </Pressable>
      </View>

      <SegmentedTabs
        scrollable
        options={[
          { key: 'all', label: 'Todos', count: seller.products.length },
          { key: 'active', label: 'Activos' },
          { key: 'low', label: 'Bajo stock', count: seller.inventory.low + seller.inventory.out },
          { key: 'paused', label: 'Pausados' },
        ]}
        value={tab}
        onChange={setTab}
        style={styles.tabs}
      />

      {seller.loading ? <LoadingSpinner /> : null}
      {!seller.loading && filtered.length === 0 ? (
        <EmptyState icon={Package} title="Sin productos" message="Publica tu primer producto para empezar a vender." actionText="Publicar producto" onAction={() => openForm('new')} />
      ) : null}

      {filtered.map((product) => {
        const stock = stockInfo(product);
        return (
          <Pressable
            key={product.id}
            style={[styles.row, !product.active && styles.rowPaused]}
            onPress={() => navigation.navigate('Product', { productId: product.id })}
            testID={`seller-product-${product.id}`}
          >
            <ProductImage product={product} size={64} radius={10} iconSize={26} />
            <View style={styles.flex}>
              <CustomText variant="bodyBold" numberOfLines={1}>
                {product.name}
              </CustomText>
              <CustomText variant="smallBold" color="primary">
                {formatPrice(product.price)}
              </CustomText>
              <View style={styles.chips}>
                <StatusChip label={stock.label} tone={stock.tone} />
                {!product.active ? <StatusChip label="Pausado" tone="neutral" /> : null}
              </View>
            </View>
            <View style={styles.actions}>
              <Switch
                value={product.active}
                onValueChange={() => seller.toggleProductActive(product)}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor={colors.white}
                accessibilityLabel={product.active ? 'Pausar producto' : 'Activar producto'}
              />
              <Pressable onPress={() => openForm(product)} style={styles.edit} accessibilityLabel={`Editar ${product.name}`} testID={`edit-${product.id}`}>
                <Pencil size={16} color={colors.primary} />
              </Pressable>
            </View>
          </Pressable>
        );
      })}

      {/* Nuevo producto / Editar producto */}
      <CustomModal
        visible={!!editing}
        hideIcon
        align="left"
        title={editing === 'new' ? 'Nuevo producto' : 'Editar producto'}
        onClose={() => setEditing(null)}
        primaryText={saving ? 'Guardando…' : editing === 'new' ? 'Publicar' : 'Guardar'}
        onPrimary={save}
        secondaryText="Cancelar"
        testID="product-form"
      >
        <InputField label="Nombre del producto" placeholder="Ej. Bolso tejido en fique" testID="product-name" {...form.getFieldProps('name')} />
        <View style={styles.row2}>
          <InputField label="Precio (COP)" keyboardType="number-pad" placeholder="85000" style={styles.flex} testID="product-price" {...form.getFieldProps('price')} />
          <InputField label="Stock" keyboardType="number-pad" placeholder="10" style={styles.flex} testID="product-stock" {...form.getFieldProps('stock')} />
        </View>
        <CustomText variant="smallBold" style={styles.label}>
          Categoría
        </CustomText>
        <View style={styles.categoryRow}>
          {categories.map((c) => (
            <CategoryBadge
              key={c.id}
              label={c.name}
              icon={c.icon}
              active={form.values.category === c.id}
              onPress={() => form.setField('category', c.id)}
              testID={`product-cat-${c.id}`}
            />
          ))}
        </View>
        {form.errors.category ? (
          <CustomText variant="caption" color="error" style={styles.categoryError}>
            {form.errors.category}
          </CustomText>
        ) : null}
        <InputField label="Descripción (opcional)" multiline placeholder="Materiales, medidas, cuidados…" {...form.getFieldProps('description')} />
      </CustomModal>

      <Toast {...toast} />
      <PrimaryButton title="Publicar producto" icon={Plus} onPress={() => openForm('new')} style={styles.bottomButton} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 16 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  search: { flex: 1, marginBottom: 8 },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: { marginBottom: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  rowPaused: { opacity: 0.6 },
  chips: { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  actions: { alignItems: 'center', gap: 8 },
  edit: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row2: { flexDirection: 'row', gap: 10 },
  label: { marginBottom: 8 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  categoryError: { marginTop: -6, marginBottom: 10 },
  bottomButton: { marginTop: 8 },
});
