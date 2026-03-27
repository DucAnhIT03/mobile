import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { Search as SearchIcon, Mic, X, Play } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Circle, Polyline } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 2;
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_GAP) / 2;

const categories = ['For You', 'Trending', 'Music', 'Comedy', 'Gaming', 'Food', 'Dance', 'Beauty', 'Sports'];

const exploreItems = [
  { id: 1, type: 'video', url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop', views: '1.2M' },
  { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1516280440502-62b210214eb7?q=80&w=1000&auto=format&fit=crop', views: '890K' },
  { id: 3, type: 'video', url: 'https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1000&auto=format&fit=crop', views: '2.4M' },
  { id: 4, type: 'image', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop', views: '500K' },
  { id: 5, type: 'video', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop', views: '3.1M' },
  { id: 6, type: 'image', url: 'https://images.unsplash.com/photo-1504609774734-ee3874f6ce4a?q=80&w=1000&auto=format&fit=crop', views: '120K' },
  { id: 7, type: 'video', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop', views: '4.5M' },
  { id: 8, type: 'image', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop', views: '670K' },
  { id: 9, type: 'video', url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1000&auto=format&fit=crop', views: '900K' },
  { id: 10, type: 'image', url: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1000&auto=format&fit=crop', views: '2.1M' },
  { id: 11, type: 'video', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop', views: '3.3M' },
  { id: 12, type: 'image', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop', views: '1.1M' },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('For You');
  const [refreshing, setRefreshing] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputWrapper}>
          <SearchIcon size={20} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search..."
            placeholderTextColor="#6b7280"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <X size={14} color="#d1d5db" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.micBtn}>
          <Mic size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setActiveCategory(item)}
              style={[styles.categoryBtn, activeCategory === item && styles.categoryBtnActive, { marginRight: 10 }]}
            >
              <Text style={[styles.categoryText, activeCategory === item && styles.categoryTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Grid */}
      <FlatList
        data={exploreItems}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => {
            setRefreshing(true);
            await new Promise(r => setTimeout(r, 1000));
            setRefreshing(false);
          }} tintColor="#3b82f6" colors={['#3b82f6']} />
        }
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <Image source={{ uri: item.url }} style={styles.gridImage} />
            <View style={styles.gridOverlay} />
            <View style={styles.gridInfo}>
              {item.type === 'video' ? (
                <Play size={14} color="#fff" fill="#fff" />
              ) : (
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <Rect x={3} y={3} width={18} height={18} rx={2} ry={2} />
                  <Circle cx={8.5} cy={8.5} r={1.5} />
                  <Polyline points="21 15 16 10 5 21" />
                </Svg>
              )}
              <Text style={styles.gridViews}>{item.views}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  searchHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 999, paddingHorizontal: 16 },
  searchIconPos: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, color: '#fff', fontSize: 16 },
  clearBtn: { padding: 6, backgroundColor: '#374151', borderRadius: 12 },
  micBtn: { padding: 12, backgroundColor: '#1A1A1A', borderRadius: 999 },
  categoriesContainer: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  categoriesList: { paddingHorizontal: 16, paddingVertical: 12 },
  categoryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: '#374151', minHeight: 36, justifyContent: 'center' },
  categoryBtnActive: { backgroundColor: '#fff', borderColor: '#fff' },
  categoryText: { fontSize: 14, fontWeight: '500', color: '#9ca3af' },
  categoryTextActive: { color: '#000' },
  gridItem: { width: ITEM_WIDTH, aspectRatio: 3 / 4, position: 'relative', overflow: 'hidden', backgroundColor: '#1f2937' },
  gridImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  gridOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'transparent' },
  gridInfo: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center' },
  gridViews: { fontSize: 13, fontWeight: '600', color: '#fff' },
});
