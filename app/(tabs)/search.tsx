import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

const { width } = Dimensions.get('window');
const categories = ['For You', 'Trending', 'Music', 'Comedy', 'Gaming', 'Food', 'Dance', 'Beauty', 'Sports'];
const GRID_GAP = 1;
const NUM_COLS = 2;
const ITEM_WIDTH = (width - GRID_GAP) / NUM_COLS;

const exploreItems = [
  { id: 1, type: 'video', url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop', views: '1.2M' },
  { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1516280440502-62b210214eb7?q=80&w=400&auto=format&fit=crop', views: '890K' },
  { id: 3, type: 'video', url: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=400&auto=format&fit=crop', views: '2.4M' },
  { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop', views: '500K' },
  { id: 5, type: 'video', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop', views: '3.1M' },
  { id: 6, type: 'image', url: 'https://images.unsplash.com/photo-1504609774734-ee3874f6ce4a?q=80&w=400&auto=format&fit=crop', views: '120K' },
  { id: 7, type: 'video', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop', views: '4.5M' },
  { id: 8, type: 'image', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop', views: '670K' },
  { id: 9, type: 'video', url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop', views: '900K' },
  { id: 10, type: 'image', url: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=400&auto=format&fit=crop', views: '2.1M' },
  { id: 11, type: 'video', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop', views: '3.3M' },
  { id: 12, type: 'image', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop', views: '1.1M' },
];

export default function Search() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('For You');

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search..."
              placeholderTextColor="#6B7280"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.micBtn}>
            <Ionicons name="mic" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.categoryBtn, activeCategory === cat && styles.categoryBtnActive]}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Explore Grid */}
      <FlatList
        data={exploreItems}
        numColumns={NUM_COLS}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        columnWrapperStyle={{ gap: GRID_GAP }}
        ItemSeparatorComponent={() => <View style={{ height: GRID_GAP }} />}
        renderItem={({ item }) => (
          <View style={[styles.gridItem, { width: ITEM_WIDTH }]}>
            <Image source={{ uri: item.url }} style={styles.gridImage} />
            <View style={styles.gridOverlay} />
            <View style={styles.gridInfo}>
              <Ionicons name={item.type === 'video' ? 'play' : 'image-outline'} size={14} color="#fff" />
              <Text style={styles.gridViews}>{item.views}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: 4, backgroundColor: 'rgba(0,0,0,0.8)', borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceLight, borderRadius: 999, height: 44, paddingHorizontal: 16 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  clearBtn: { padding: 4, backgroundColor: '#333', borderRadius: 999 },
  micBtn: { width: 44, height: 44, backgroundColor: Colors.surfaceLight, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  categoriesRow: { paddingHorizontal: 16, gap: 10, paddingVertical: 12 },
  categoryBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#333' },
  categoryBtnActive: { backgroundColor: '#fff', borderColor: '#fff' },
  categoryText: { fontSize: 14, fontWeight: '500', color: '#9CA3AF' },
  categoryTextActive: { color: '#000' },
  gridItem: { aspectRatio: 3 / 4, backgroundColor: '#1A1A1A', position: 'relative', overflow: 'hidden' },
  gridImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  gridOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', backgroundColor: 'rgba(0,0,0,0.4)' },
  gridInfo: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  gridViews: { fontSize: 13, fontWeight: '600', color: '#fff' },
});
