import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, Search } from 'lucide-react-native';

import CustomText from '../../components/common/CustomText';
import SegmentedTabs from '../../components/common/SegmentedTabs';
import { categories as categoryList, categoryGroups } from '../../data/mockData';
import { getIcon } from '../../utils/icons';
import { colors, radius } from '../../theme';

// P-07 Categorías
// La versión anterior estaba escrita con etiquetas web (div, button, img + Tailwind),
// que no existen en React Native. Se convirtió a View / TouchableOpacity / StyleSheet
// conservando el mismo diseño: título, pestañas Todos/Mujeres/Hombres y acordeón
// de categorías con sus subcategorías en dos columnas.
const TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'women', label: 'Mujeres' },
  { key: 'men', label: 'Hombres' },
];

const GENDER = { all: undefined, women: 'mujeres', men: 'hombres' };

const Categories = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [expandedCategory, setExpandedCategory] = useState('ropa');

  const currentCategories = categoryGroups[activeTab];

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const openSubcategory = (categoryId, subcategory) =>
    navigation.navigate('Search', { category: categoryId, subcategory, gender: GENDER[activeTab], title: subcategory });

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <CustomText variant="h1">{currentCategories.title}</CustomText>
        <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.headerButton} accessibilityLabel="Buscar">
          <Search size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <SegmentedTabs
        options={TABS}
        value={activeTab}
        variant="underline"
        onChange={(tab) => {
          setActiveTab(tab);
          setExpandedCategory('ropa');
        }}
        style={styles.tabs}
      />

      {/* Categories List */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {currentCategories.items.map((item) => {
          const category = categoryList.find((c) => c.id === item.id);
          const Icon = getIcon(category.icon);
          const expanded = expandedCategory === item.id;
          return (
            <View key={item.id} style={styles.card}>
              {/* Category Header */}
              <TouchableOpacity
                onPress={() => toggleCategory(item.id)}
                style={styles.cardHeader}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                testID={`category-${item.id}`}
              >
                <View style={styles.cardTitle}>
                  <View style={[styles.thumb, { backgroundColor: category.tone }]}>
                    <Icon size={22} color={colors.ink} strokeWidth={1.6} />
                  </View>
                  <CustomText variant="bodyBold">{category.name}</CustomText>
                </View>
                {expanded ? <ChevronUp size={20} color={colors.textLight} /> : <ChevronDown size={20} color={colors.textLight} />}
              </TouchableOpacity>

              {/* Subcategories */}
              {expanded && (
                <View style={styles.subcategories}>
                  {item.subcategories.map((subcategory) => (
                    <TouchableOpacity
                      key={subcategory}
                      onPress={() => openSubcategory(item.id, subcategory)}
                      style={styles.subcategory}
                      testID={`subcategory-${subcategory}`}
                    >
                      <CustomText variant="small" numberOfLines={1}>
                        {subcategory}
                      </CustomText>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity onPress={() => navigation.navigate('Search', { category: item.id, gender: GENDER[activeTab], title: category.name })} style={[styles.subcategory, styles.seeAll]}>
                    <CustomText variant="smallBold" color="primary">
                      Ver todo
                    </CustomText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerButton: { padding: 6 },
  tabs: { marginHorizontal: 16, marginBottom: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subcategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    padding: 14,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  subcategory: {
    width: '48%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  seeAll: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.primarySoft,
  },
});

export default Categories;
