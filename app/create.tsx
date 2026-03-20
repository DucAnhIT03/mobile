import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');
type TabType = 'Post' | 'Video' | 'Story' | 'Live';
const GALLERY_SIZE = (width - 3) / 4;

export default function Create() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('Video');

  const TabSelector = () => (
    <View style={styles.tabSelector}>
      {(['Post', 'Video', 'Story', 'Live'] as TabType[]).map(tab => (
        <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          {activeTab === tab && <View style={styles.tabDot} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  if (activeTab === 'Post') {
    const galleryImages = Array.from({ length: 24 }).map((_, i) => `https://picsum.photos/seed/${i + 100}/400/400`);
    return (
      <View style={styles.container}>
        <View style={styles.postHeader}>
          <View style={styles.postHeaderLeft}>
            <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color="#fff" /></TouchableOpacity>
            <Text style={styles.postTitle}>New Post</Text>
          </View>
          <TouchableOpacity><Text style={styles.nextBtn}>Next</Text></TouchableOpacity>
        </View>
        <Image source={{ uri: 'https://picsum.photos/seed/100/800/800' }} style={styles.postPreview} />
        <View style={styles.galleryControls}>
          <View style={styles.recentsRow}><Text style={styles.recentsText}>Recents</Text><Ionicons name="chevron-down" size={16} color="#fff" /></View>
          <View style={styles.galleryBtns}>
            <TouchableOpacity style={styles.galleryBtn}><Ionicons name="copy-outline" size={16} color="#fff" /></TouchableOpacity>
            <TouchableOpacity style={styles.galleryBtn}><Ionicons name="camera-outline" size={16} color="#fff" /></TouchableOpacity>
          </View>
        </View>
        <FlatList data={galleryImages} numColumns={4} keyExtractor={(_, i) => String(i)} renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.galleryImage} />
        )} contentContainerStyle={{ gap: 1 }} columnWrapperStyle={{ gap: 1 }} />
        <View style={styles.bottomTabs}><TabSelector /></View>
      </View>
    );
  }

  // Camera UI (Video, Story, Live)
  return (
    <View style={styles.container}>
      <Image source={{ uri: activeTab === 'Story' ? 'https://images.unsplash.com/photo-1611162618479-ee4d1e02548c?q=80&w=400&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=400&auto=format&fit=crop' }} style={StyleSheet.absoluteFill} resizeMode="cover" />

      {/* Top Bar */}
      <View style={styles.cameraTopBar}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color="#fff" /></TouchableOpacity>
        {activeTab !== 'Live' && (
          <TouchableOpacity style={styles.addSoundBtn}>
            <Ionicons name="musical-notes" size={16} color="#fff" />
            <Text style={styles.addSoundText}>Add Sound</Text>
          </TouchableOpacity>
        )}
        <View style={{ width: 28 }} />
      </View>

      {/* Right Sidebar Tools */}
      <View style={styles.rightTools}>
        {activeTab === 'Story' ? (
          <>
            <ToolButton icon="text-outline" label="Create" />
            <ToolButton icon="infinite-outline" label="Boomerang" />
            <ToolButton icon="grid-outline" label="Layout" />
            <ToolButton icon="hand-left-outline" label="Hands-free" />
          </>
        ) : (
          <>
            <ToolButton icon="camera-reverse-outline" label="Flip" />
            <ToolButton icon="flash-outline" label="Speed" />
            <ToolButton icon="timer-outline" label="Timer" />
            <ToolButton icon="color-wand-outline" label="Filters" />
          </>
        )}
        <TouchableOpacity style={styles.toolIconOnly}><Ionicons name="chevron-down" size={20} color="#fff" /></TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.cameraBottom}>
        <View style={styles.recordRow}>
          <TouchableOpacity style={styles.uploadBtn}><Ionicons name="image-outline" size={20} color="#fff" /><Text style={styles.uploadText}>Upload</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.recordOuter, (activeTab === 'Video' || activeTab === 'Live') && styles.recordOuterRed]}>
            <View style={[styles.recordInner, (activeTab === 'Video' || activeTab === 'Live') && styles.recordInnerRed]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadBtn}><Ionicons name="color-wand-outline" size={20} color="#fff" /><Text style={styles.uploadText}>Effects</Text></TouchableOpacity>
        </View>
        <TabSelector />
      </View>
    </View>
  );
}

function ToolButton({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.toolItem}>
      <View style={styles.toolIcon}><Ionicons name={icon as any} size={20} color="#fff" /></View>
      <Text style={styles.toolLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16 },
  postHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  postTitle: { fontSize: 17, fontWeight: '600', color: '#fff' },
  nextBtn: { color: '#3B82F6', fontWeight: '600', fontSize: 16 },
  postPreview: { width, height: width, resizeMode: 'cover' },
  galleryControls: { height: 48, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recentsText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  galleryBtns: { flexDirection: 'row', gap: 12 },
  galleryBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  galleryImage: { width: GALLERY_SIZE, height: GALLERY_SIZE, resizeMode: 'cover' },
  bottomTabs: { backgroundColor: '#000', paddingTop: 8, paddingBottom: 56, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.1)', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  tabSelector: { flexDirection: 'row', justifyContent: 'center', gap: 32, height: 48, alignItems: 'center' },
  tabText: { fontSize: 15, fontWeight: '500', color: '#9CA3AF' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff', alignSelf: 'center', marginTop: 4 },
  cameraTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: 16, zIndex: 10 },
  addSoundBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
  addSoundText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  rightTools: { position: 'absolute', top: 120, right: 16, alignItems: 'center', gap: 24, zIndex: 10 },
  toolItem: { alignItems: 'center', gap: 4 },
  toolIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  toolIconOnly: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  toolLabel: { fontSize: 11, fontWeight: '500', color: '#fff' },
  cameraBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: 56, paddingTop: 40, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.6)' },
  recordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 40, marginBottom: 24 },
  uploadBtn: { alignItems: 'center', gap: 8 },
  uploadText: { fontSize: 12, fontWeight: '500', color: '#fff' },
  recordOuter: { width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: 'rgba(255,255,255,0.8)', padding: 6, alignItems: 'center', justifyContent: 'center' },
  recordOuterRed: { borderColor: 'rgba(255,59,48,0.8)' },
  recordInner: { width: '100%', height: '100%', borderRadius: 999, backgroundColor: '#fff' },
  recordInnerRed: { backgroundColor: '#FF3B30' },
});
