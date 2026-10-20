import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Check, X } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import CustomText from '../../components/common/CustomText';
import InputField from '../../components/common/InputField';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import CategoryBadge from '../../components/specific/CategoryBadge';
import { categories } from '../../data/mockData';
import { FILTER_COLORS, SIZES, SORT_OPTIONS } from '../../utils/constants';
import { validatePriceRange } from '../../utils/validations';
import { colors, radius } from '../../theme';

const EMPTY = { category: undefined, size: undefined, color: undefined, minPrice: '', maxPrice: '', minRating: undefined, sort: undefined };

// P-26 Filtros de búsqueda (se abre como modal desde Search)
export default function Filter({ navigation, route }) {
  const [filters, setFilters] = useState({ ...EMPTY, ...(route.params?.filters ?? {}) });
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validatePriceRange(filters) : {};

  const set = (key, value) => setFilters((f) => ({ ...f, [key]: f[key] === value ? undefined : value }));
  const setText = (key) => (value) => setFilters((f) => ({ ...f, [key]: value.replace(/\D/g, '') }));

  const apply = () => {
    setSubmitted(true);
    if (Object.keys(validatePriceRange(filters)).length > 0) return;
    // Solo se envían los filtros con valor
    const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''));
    navigation.popTo('Search', { filters: clean }, { merge: true });
  };

  const header = (
    <View style={styles.header}>
      <CustomText variant="h1">Filtrar</CustomText>
      <Pressable onPress={() => navigation.goBack()} style={styles.close} accessibilityLabel="Cerrar filtros" testID="filter-close">
        <X size={20} color={colors.ink} />
      </Pressable>
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <SecondaryButton title="Limpiar" onPress={() => setFilters(EMPTY)} style={styles.flex} testID="filter-clear" />
      <PrimaryButton title="Aplicar" onPress={apply} style={styles.flex} testID="filter-apply" />
    </View>
  );

  return (
    <ScreenWrapper scroll keyboard edges={['top', 'bottom']} header={header} footer={footer}>
      <Title>Categoría</Title>
      <View style={styles.categories}>
        {categories.map((c) => (
          <CategoryBadge
            key={c.id}
            variant="circle"
            label={c.name}
            icon={c.icon}
            tone={c.tone}
            active={filters.category === c.id}
            onPress={() => set('category', c.id)}
            testID={`filter-cat-${c.id}`}
          />
        ))}
      </View>

      <Title>Talla</Title>
      <View style={styles.row}>
        {SIZES.map((s) => (
          <Pressable key={s} onPress={() => set('size', s)} style={[styles.size, filters.size === s && styles.sizeActive]} testID={`filter-size-${s}`}>
            <CustomText variant="smallBold" style={{ color: filters.size === s ? colors.white : colors.text }}>
              {s}
            </CustomText>
          </Pressable>
        ))}
      </View>

      <Title>Color</Title>
      <View style={styles.row}>
        {FILTER_COLORS.map((c) => (
          <Pressable
            key={c.name}
            onPress={() => set('color', c.name)}
            style={[styles.colorOuter, filters.color === c.name && styles.colorOuterActive]}
            accessibilityLabel={`Color ${c.name}`}
            accessibilityState={{ selected: filters.color === c.name }}
          >
            <View style={[styles.color, { backgroundColor: c.hex }]}>
              {filters.color === c.name ? <Check size={14} color={c.name === 'Blanco' || c.name === 'Beige' ? colors.ink : colors.white} /> : null}
            </View>
          </Pressable>
        ))}
      </View>

      <Title>Precio (COP)</Title>
      <View style={styles.priceRow}>
        <InputField placeholder="Mínimo" keyboardType="number-pad" value={filters.minPrice} onChangeText={setText('minPrice')} error={errors.minPrice} style={styles.flex} testID="filter-min" />
        <CustomText variant="bodyBold" color="textMuted" style={styles.dash}>
          –
        </CustomText>
        <InputField placeholder="Máximo" keyboardType="number-pad" value={filters.maxPrice} onChangeText={setText('maxPrice')} error={errors.maxPrice} style={styles.flex} testID="filter-max" />
      </View>

      <Title>Calificación</Title>
      <View style={styles.row}>
        {[4.5, 4, 3].map((r) => (
          <Pressable key={r} onPress={() => set('minRating', r)} style={[styles.size, filters.minRating === r && styles.sizeActive]}>
            <CustomText variant="smallBold" style={{ color: filters.minRating === r ? colors.white : colors.text }}>
              {String(r).replace('.', ',')} ★ o más
            </CustomText>
          </Pressable>
        ))}
      </View>

      <Title>Ordenar por</Title>
      {SORT_OPTIONS.map((option) => {
        const active = filters.sort === option.key;
        return (
          <Pressable key={option.key} onPress={() => set('sort', option.key)} style={[styles.sortRow, active && styles.sortRowActive]} testID={`filter-sort-${option.key}`}>
            <CustomText variant="body" style={[styles.flex, active && { color: colors.primary, fontWeight: '700' }]}>
              {option.label}
            </CustomText>
            {active ? <Check size={18} color={colors.primary} /> : null}
          </Pressable>
        );
      })}
    </ScreenWrapper>
  );
}

function Title({ children }) {
  return (
    <CustomText variant="h3" style={styles.title}>
      {children}
    </CustomText>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  close: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 20, marginBottom: 12 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  size: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.input,
  },
  sizeActive: { backgroundColor: colors.primary },
  colorOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorOuterActive: { borderColor: colors.primary },
  color: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  dash: { marginTop: 14 },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    marginBottom: 4,
  },
  sortRowActive: { backgroundColor: colors.primarySoft },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
});
