import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
} from 'react-native';
import { ChevronRight, Heart, Search, ShoppingBag } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ShopClient = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  // Featured products carousel
  const featuredProducts = [
    { id: 1, name: 'Producto 1', price: '$17.00', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-7iRExh1PvwRd27adZA22VVYCRho6sE.png', badge: 'New' },
    { id: 2, name: 'Producto 2', price: '$17.00', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-7iRExh1PvwRd27adZA22VVYCRho6sE.png', badge: 'Sale' },
    { id: 3, name: 'Producto 3', price: '$17.00', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-7iRExh1PvwRd27adZA22VVYCRho6sE.png', badge: 'Hot' },
    { id: 4, name: 'Producto 4', price: '$17.00', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-7iRExh1PvwRd27adZA22VVYCRho6sE.png', badge: 'New' },
  ];

  const categories = [
    { id: 'ropa', name: 'Ropa', count: '340', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png' },
    { id: 'zapatos', name: 'Zapatos', count: '410', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png' },
    { id: 'bolsos', name: 'Bolsos', count: '87', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png' },
    { id: 'accesorios', name: 'Accesorios', count: '210', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png' },
  ];

  const newProducts = [
    { id: 101, name: 'Producto Destacado 1', price: '$17.00', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-4WBfwoZJIyN1GYE3lEb9NVTQKZmADa.png' },
    { id: 102, name: 'Producto Destacado 2', price: '$32.00', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-4WBfwoZJIyN1GYE3lEb9NVTQKZmADa.png' },
    { id: 103, name: 'Producto Destacado 3', price: '$21.00', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-4WBfwoZJIyN1GYE3lEb9NVTQKZmADa.png' },
  ];

  const flashSaleProducts = [
    { id: 201, discount: '20%', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-4WBfwoZJIyN1GYE3lEb9NVTQKZmADa.png' },
    { id: 202, discount: '20%', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-4WBfwoZJIyN1GYE3lEb9NVTQKZmADa.png' },
    { id: 203, discount: '20%', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-4WBfwoZJIyN1GYE3lEb9NVTQKZmADa.png' },
    { id: 204, discount: '20%', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-4WBfwoZJIyN1GYE3lEb9NVTQKZmADa.png' },
    { id: 205, discount: '20%', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-4WBfwoZJIyN1GYE3lEb9NVTQKZmADa.png' },
    { id: 206, discount: '20%', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-4WBfwoZJIyN1GYE3lEb9NVTQKZmADa.png' },
  ];

  const mostPopular = [
    { id: 301, price: '1780', badge: 'New', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-7iRExh1PvwRd27adZA22VVYCRho6sE.png' },
    { id: 302, price: '1780', badge: 'Sale', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-7iRExh1PvwRd27adZA22VVYCRho6sE.png' },
    { id: 303, price: '1780', badge: 'Hot', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-7iRExh1PvwRd27adZA22VVYCRho6sE.png' },
    { id: 304, price: '17', badge: 'New', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-7iRExh1PvwRd27adZA22VVYCRho6sE.png' },
  ];

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tienda</Text>
        <View style={styles.headerActions}>
          <TextInput placeholder="Busca" style={styles.searchInput} />
          <TouchableOpacity style={styles.iconButton}>
            <Search width={22} height={22} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>Gran oferta</Text>
            <Text style={styles.bannerSubtitle}>Hasta un 60 %</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Obtener oferta</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-tzTZnYl16kdZlswa88maaVlP5x32wc.png' }}
            style={styles.bannerImage}
          />
        </View>

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categorías</Text>
            <TouchableOpacity style={styles.seeAll}>
              <Text style={styles.seeAllText}>Ver todo</Text>
              <ChevronRight width={16} height={16} color="#2563EB" />
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={styles.categoryCard}
              >
                <Image source={{ uri: category.image }} style={styles.categoryImage} />
                <View style={styles.categoryOverlay}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryCount}>{category.count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* New Articles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nuevos artículos</Text>
            <TouchableOpacity style={styles.seeAll}>
              <Text style={styles.seeAllText}>Ver todo</Text>
              <ChevronRight width={16} height={16} color="#2563EB" />
            </TouchableOpacity>
          </View>
          <View style={styles.productsGrid}>
            {newProducts.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productImageWrap}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <TouchableOpacity
                    onPress={() => toggleWishlist(product.id)}
                    style={styles.wishlistButton}
                  >
                    <Heart
                      width={18}
                      height={18}
                      color={wishlist.includes(product.id) ? '#EF4444' : '#4B5563'}
                      fill={wishlist.includes(product.id) ? '#EF4444' : 'none'}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.productPrice}>{product.price}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Flash Sale Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Oferta relámpago</Text>
            <View style={styles.timer}>
              <Text style={styles.timerText}>00 : 36 : 58</Text>
            </View>
          </View>
          <View style={styles.flashGrid}>
            {flashSaleProducts.map((product) => (
              <View key={product.id} style={styles.flashCard}>
                <Image source={{ uri: product.image }} style={styles.flashImage} />
                <View style={styles.flashBadge}>
                  <Text style={styles.flashBadgeText}>{product.discount}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Most Popular Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Los más populares</Text>
            <TouchableOpacity style={styles.seeAll}>
              <Text style={styles.seeAllText}>Ver todo</Text>
              <ChevronRight width={16} height={16} color="#2563EB" />
            </TouchableOpacity>
          </View>
          <View style={styles.productsGrid}>
            {mostPopular.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productImageWrap}>
                  <Image source={{ uri: product.image }} style={styles.productImage} />
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>{product.badge}</Text>
                  </View>
                </View>
                <View style={styles.productInfoCenter}>
                  <Text style={styles.productPrice}>${product.price}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Featured Products Carousel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destacados</Text>
          <View style={styles.carousel}>
            <Image
              source={{ uri: featuredProducts[currentSlide].image }}
              style={styles.carouselImage}
            />
            <View style={styles.carouselControls}>
              <TouchableOpacity onPress={prevSlide} style={styles.carouselArrow}>
                <ChevronRight width={22} height={22} color="#111827" style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
              <View style={styles.dotsRow}>
                {featuredProducts.map((_, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setCurrentSlide(idx)}
                    style={[styles.dot, idx === currentSlide && styles.dotActive]}
                  />
                ))}
              </View>
              <TouchableOpacity onPress={nextSlide} style={styles.carouselArrow}>
                <ChevronRight width={22} height={22} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.iconButton}>
          <ShoppingBag width={24} height={24} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Heart width={24} height={24} color="#4B5563" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Search width={24} height={24} color="#4B5563" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    width: 100,
  },
  iconButton: { padding: 8 },
  content: { padding: 16, gap: 24 },
  banner: {
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    height: 160,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    overflow: 'hidden',
  },
  bannerTextWrap: { flex: 1 },
  bannerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  bannerSubtitle: { fontSize: 14, color: '#fff', marginBottom: 10 },
  bannerButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  bannerButtonText: { color: '#D97706', fontWeight: '600', fontSize: 13 },
  bannerImage: { width: 100, height: 120, resizeMode: 'contain' },
  section: { marginBottom: 8 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { color: '#2563EB', fontSize: 13 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: {
    width: (width - 32 - 12) / 2,
    height: 96,
    borderRadius: 10,
    overflow: 'hidden',
  },
  categoryImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  categoryOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  categoryCount: { color: '#fff', fontSize: 12 },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard: {
    width: (width - 32 - 12) / 2,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  productImageWrap: { aspectRatio: 1, backgroundColor: '#E5E7EB' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  wishlistButton: {
    position: 'absolute',
    top: 8, right: 8,
    backgroundColor: '#fff',
    borderRadius: 999,
    padding: 6,
  },
  productInfo: { padding: 10 },
  productInfoCenter: { padding: 10, alignItems: 'center' },
  productName: { fontSize: 13, color: '#4B5563' },
  productPrice: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  timer: { flexDirection: 'row' },
  timerText: { color: '#4B5563', fontSize: 13 },
  flashGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  flashCard: {
    width: (width - 32 - 20) / 3,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  flashImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  flashBadge: {
    position: 'absolute',
    top: 6, left: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flashBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  popularBadge: {
    position: 'absolute',
    top: 8, right: 8,
    backgroundColor: '#FBBF24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularBadgeText: { fontSize: 11, fontWeight: 'bold' },
  carousel: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16 },
  carouselImage: { width: '100%', aspectRatio: 16 / 9, borderRadius: 10, resizeMode: 'cover', marginBottom: 12 },
  carouselControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  carouselArrow: { padding: 8 },
  dotsRow: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
  dotActive: { backgroundColor: '#2563EB' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
  },
});

export default ShopClient;