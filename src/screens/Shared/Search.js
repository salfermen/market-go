import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ChevronLeft, Search as SearchIcon, SlidersHorizontal, Trash2, X } from 'lucide-react-native';

import ScreenWrapper from '../../components/layout/ScreenWrapper';
import SectionHeader from '../../components/layout/SectionHeader';
import CustomText from '../../components/common/CustomText';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PrimaryButton from '../../components/common/PrimaryButton';
import SecondaryButton from '../../components/common/SecondaryButton';
import Avatar from '../../components/common/Avatar';
import ProductCard from '../../components/specific/ProductCard';
import useAsync from '../../hooks/useAsync';
import useDebounce from '../../hooks/useDebounce';
import { getProducts, getStore } from '../../api/products.api';
import { useShop } from '../../store/shopStore';
import { categories } from '../../data/mockData';
import { SORT_OPTIONS } from '../../utils/constants';
import { formatNumber, formatPrice, plural } from '../../utils/formatters';
import { colors, radius } from '../../theme';

const RECOMMENDED = ['Mochila', 'Vestido', 'Tenis', 'Collar', 'Jean', 'Reloj'];

// Cuenta los filtros activos para mostrarlos en el botón de filtro
const countFilters = (f = {}) =>
  ['minPrice', 'maxPrice', 'minRating', 'size', 'color', 'sort', 'category'].filter((k) => f[k] !== undefined && f[k] !== '' && f[k] !== null).length;

// P-25 Búsqueda (también muestra resultados por categoría y el perfil de una tienda)
export default function Search({ navigation, route }) {
  const params = route.params ?? {};
  const { searchHistory, addSearch, clearSearchHistory, isInWishlist, toggleWishlist, followedStores, toggleFollowStore } = useShop();
  const [query, setQuery] = useState(params.query ?? '');
  const debouncedQuery = useDebounce(query, 400);

  // Filtros base que vienen de otra pantalla (categoría, tienda…) + los del panel de filtros
  const baseFilters = {
    category: params.category,
    subcategory: params.subcategory,
    gender: params.gender,
    storeId: params.storeId,
    sort: params.sort,
  };
  const [filters, setFilters] = useState(params.filters ?? {});
  useEffect(() => {
    if (params.filters) setFilters(params.filters);
  }, [params.filters]);

  const activeFilters = { ...baseFilters, ...filters, query: debouncedQuery };
  const isBrowsing = !debouncedQuery && countFilters(filters) === 0 && !params.category && !params.storeId && !params.sort;

  const { data: results, loading } = useAsync(() => getProducts(activeFilters), [JSON.stringify(activeFilters)]);
  const { data: store } = useAsync(() => (params.storeId ? getStore(params.storeId) : Promise.resolve(null)), [params.storeId]);
  const { data: popular } = useAsync(() => getProducts({ sort: 'popular' }), []);

  const submit = () => addSearch(query);
  const filterCount = countFilters(filters);
  const following = store && followedStores.includes(store.id);
  const categoryName = categories.find((c) => c.id === (filters.category ?? params.category))?.name;
  const sortLabel = SORT_OPTIONS.find((s) => s.key === (filters.sort ?? params.sort))?.label;

  const header = (
    <View style={styles.header}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back} accessibilityLabel="Volver" testID="search-back">
        <ChevronLeft size={22} color={colors.ink} />
      </Pressable>
      <View style={styles.inputWrap}>
        <SearchIcon size={18} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={submit}
          placeholder={params.title ? `Buscar en ${params.title}` : 'Buscar productos'}
          placeholderTextColor={colors.textLight}
          returnKeyType="search"
          autoFocus={!params.category && !params.storeId && !params.sort}
          style={styles.input}
          accessibilityLabel="Buscar productos"
          testID="search-input"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Borrar búsqueda">
            <X size={16} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={() => navigation.navigate('Filter', { filters: { ...filters, category: filters.category ?? params.category } })}
        style={[styles.filterButton, filterCount > 0 && styles.filterButtonActive]}
        accessibilityLabel="Filtros"
        testID="search-filter"
      >
        <SlidersHorizontal size={18} color={filterCount > 0 ? colors.white : colors.primary} />
        {filterCount > 0 ? (
          <View style={styles.filterBadge}>
            <CustomText variant="caption" color="primary" weight="800">
              {filterCount}
            </CustomText>
          </View>
        ) : null}
      </Pressable>
    </View>
  );

  return (
    <ScreenWrapper scroll keyboard header={header}>
      {/* Perfil del emprendimiento */}
      {store ? (
        <View style={styles.storeCard}>
          <View style={styles.storeTop}>
            <Avatar name={store.name} size={56} />
            <View style={styles.flex}>
              <CustomText variant="h3">{store.name}</CustomText>
              <CustomText variant="caption" color="textMuted">
                {store.city} · ★ {store.rating} · {formatNumber(store.followers + (following ? 1 : 0))} seguidores
              </CustomText>
            </View>
          </View>
          <CustomText variant="small" color="textMuted" style={styles.storeDescription}>
            {store.description}
          </CustomText>
          {following ? (
            <SecondaryButton title="Siguiendo" size="sm" onPress={() => toggleFollowStore(store.id)} testID="store-follow" />
          ) : (
            <PrimaryButton title="Seguir tienda" size="sm" onPress={() => toggleFollowStore(store.id)} testID="store-follow" />
          )}
        </View>
      ) : null}

      {isBrowsing ? (
        <>
          {searchHistory.length > 0 ? (
            <>
              <SectionHeader
                title="Historial de búsqueda"
                right={
                  <Pressable onPress={clearSearchHistory} hitSlop={8} accessibilityLabel="Borrar historial">
                    <Trash2 size={18} color={colors.error} />
                  </Pressable>
                }
              />
              <View style={styles.chips}>
                {searchHistory.map((term) => (
                  <Chip key={term} label={term} onPress={() => setQuery(term)} />
                ))}
              </View>
            </>
          ) : null}

          <SectionHeader title="Recomendaciones" style={styles.section} />
          <View style={styles.chips}>
            {RECOMMENDED.map((term) => (
              <Chip key={term} label={term} onPress={() => setQuery(term)} testID={`suggest-${term}`} />
            ))}
          </View>

          <SectionHeader title="Descubrir" style={styles.section} />
          <View style={styles.grid}>
            {(popular ?? []).slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} width="48%" onPress={() => navigation.navigate('Product', { productId: product.id })} />
            ))}
          </View>
        </>
      ) : (
        <>
          <View style={styles.resultsHeader}>
            <CustomText variant="h3" style={styles.flex}>
              {params.title && !debouncedQuery ? params.title : debouncedQuery ? `“${debouncedQuery}”` : 'Resultados'}
            </CustomText>
            <CustomText variant="small" color="textMuted">
              {loading ? 'Buscando…' : plural(results?.length ?? 0, 'producto')}
            </CustomText>
          </View>

          {/* Filtros activos */}
          {filterCount > 0 ? (
            <View style={[styles.chips, styles.activeChips]}>
              {categoryName && filters.category ? <Chip label={categoryName} active /> : null}
              {filters.minPrice || filters.maxPrice ? (
                <Chip label={`${filters.minPrice ? formatPrice(filters.minPrice) : '$ 0'} – ${filters.maxPrice ? formatPrice(filters.maxPrice) : 'máx.'}`} active />
              ) : null}
              {filters.size ? <Chip label={`Talla ${filters.size}`} active /> : null}
              {filters.color ? <Chip label={filters.color} active /> : null}
              {filters.minRating ? <Chip label={`${filters.minRating}+ ★`} active /> : null}
              {filters.sort ? <Chip label={sortLabel} active /> : null}
              <Chip label="Limpiar" onPress={() => setFilters({})} />
            </View>
          ) : null}

          {loading ? <LoadingSpinner /> : null}
          {!loading && results?.length === 0 ? (
            <EmptyState
              icon={SearchIcon}
              title="Sin resultados"
              message="Prueba con otras palabras o quita algunos filtros."
              actionText={filterCount > 0 ? 'Limpiar filtros' : undefined}
              onAction={() => setFilters({})}
            />
          ) : null}
          {!loading ? (
            <View style={styles.grid}>
              {results?.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  width="48%"
                  testID={`result-${product.id}`}
                  onPress={() => {
                    if (debouncedQuery) addSearch(debouncedQuery);
                    navigation.navigate('Product', { productId: product.id });
                  }}
                  isFavorite={isInWishlist(product.id)}
                  onToggleFavorite={toggleWishlist}
                />
              ))}
            </View>
          ) : null}
        </>
      )}
    </ScreenWrapper>
  );
}

function Chip({ label, onPress, active, testID }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.chip, active && styles.chipActive]} testID={testID}>
      <CustomText variant="small" style={{ color: active ? colors.primary : colors.text }} weight={active ? '700' : '500'}>
        {label}
      </CustomText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.input,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    height: 44,
  },
  input: { flex: 1, fontSize: 15, color: colors.text, outlineStyle: 'none' },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: { backgroundColor: colors.primary },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  storeCard: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    marginBottom: 18,
    gap: 10,
  },
  storeTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  storeDescription: {},
  section: { marginTop: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  activeChips: { marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.input,
  },
  chipActive: { backgroundColor: colors.primaryLight },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 18 },
});
