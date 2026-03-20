import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
type TabType = 'posts' | 'reels' | 'tagged';

const postsData = [
  { id: 1, image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=400&auto=format&fit=crop', isCarousel: true },
  { id: 2, image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&auto=format&fit=crop', isCarousel: false },
  { id: 3, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop', isCarousel: true },
  { id: 4, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop', isCarousel: false },
  { id: 5, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop', isCarousel: false },
  { id: 6, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop', isCarousel: true },
];
const reelsData = [
  { id: 1, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop', views: '15.4K' },
  { id: 2, image: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?q=80&w=400&auto=format&fit=crop', views: '1.2M' },
  { id: 3, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop', views: '324K' },
  { id: 4, image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=400&auto=format&fit=crop', views: '12K' },
];
const taggedData = [
  { id: 1, image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop', isCarousel: false },
  { id: 2, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop', isCarousel: true },
];

const GRID_SIZE = (width - 2) / 3;

export default function Profile() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => { setShowMenu(false); router.replace('/login'); };

  const currentData = activeTab === 'posts' ? postsData : activeTab === 'reels' ? reelsData : taggedData;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.userName}>Alex Chen</Text>
        <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.menuBtn}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarSection}>
            <LinearGradient colors={['#F97316', '#EC4899', '#9333EA']} style={styles.avatarRing} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.avatarInner}>
                <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.profileAvatar} />
              </View>
            </LinearGradient>
            <TouchableOpacity style={styles.addAvatarBadge}>
              <Ionicons name="add" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}><Text style={styles.statNumber}>49</Text><Text style={styles.statLabel}>Posts</Text></View>
            <TouchableOpacity style={styles.statItem} onPress={() => router.push({ pathname: '/connections', params: { tab: 'followers' } })}>
              <Text style={styles.statNumber}>1,14k</Text><Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem} onPress={() => router.push({ pathname: '/connections', params: { tab: 'following' } })}>
              <Text style={styles.statNumber}>63</Text><Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio & Actions */}
        <View style={styles.bioSection}>
          <Text style={styles.bioName}>Alex Chen</Text>
          <Text style={styles.bioText}>Digital Creator | Sharing life's moments | Seattle 📍</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/edit-profile')}>
              <Text style={styles.actionBtnText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/create')}>
              <Text style={styles.actionBtnText}>Create Content</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tab, activeTab === 'posts' && styles.tabActive]} onPress={() => setActiveTab('posts')}>
            <Ionicons name="grid-outline" size={24} color={activeTab === 'posts' ? '#fff' : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'reels' && styles.tabActive]} onPress={() => setActiveTab('reels')}>
            <Ionicons name="film-outline" size={24} color={activeTab === 'reels' ? '#fff' : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'tagged' && styles.tabActive]} onPress={() => setActiveTab('tagged')}>
            <Ionicons name="person-outline" size={24} color={activeTab === 'tagged' ? '#fff' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {currentData.map((item: any) => (
            <View key={item.id} style={[styles.gridItem, activeTab === 'reels' && { aspectRatio: 9 / 16 }]}>
              <Image source={{ uri: item.image }} style={styles.gridImage} />
              {item.isCarousel && (
                <View style={styles.carouselBadge}><Ionicons name="copy-outline" size={14} color="#fff" /></View>
              )}
              {item.views && (
                <View style={styles.viewsBadge}><Ionicons name="play" size={12} color="#fff" /><Text style={styles.viewsText}>{item.views}</Text></View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Sheet Menu */}
      <Modal visible={showMenu} transparent animationType="slide">
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowMenu(false)} />
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <TouchableOpacity style={styles.sheetItem} onPress={() => { setShowMenu(false); router.push('/activity-history'); }}>
            <Ionicons name="time-outline" size={24} color="#fff" /><Text style={styles.sheetItemText}>Lịch sử hoạt động</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetItem} onPress={() => { setShowMenu(false); router.push('/settings'); }}>
            <Ionicons name="settings-outline" size={24} color="#fff" /><Text style={styles.sheetItemText}>Cài đặt và quyền riêng tư</Text>
          </TouchableOpacity>
          <View style={styles.sheetDivider} />
          <TouchableOpacity style={styles.sheetItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" /><Text style={[styles.sheetItemText, { color: '#EF4444' }]}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 8 },
  userName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  menuBtn: { padding: 8 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 24 },
  avatarSection: { position: 'relative' },
  avatarRing: { width: 96, height: 96, borderRadius: 48, padding: 3 },
  avatarInner: { flex: 1, borderRadius: 45, borderWidth: 4, borderColor: Colors.surface, overflow: 'hidden' },
  profileAvatar: { width: '100%', height: '100%' },
  addAvatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.surface },
  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginLeft: 24 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 13, color: '#9CA3AF' },
  bioSection: { paddingHorizontal: 16, paddingBottom: 24 },
  bioName: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 4 },
  bioText: { fontSize: 15, color: '#D1D5DB', marginBottom: 16 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 8, backgroundColor: Colors.surfaceHigh, borderRadius: 12, alignItems: 'center', borderWidth: 0.5, borderColor: '#555' },
  actionBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#333' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 1 },
  gridItem: { width: GRID_SIZE, aspectRatio: 1, position: 'relative' },
  gridImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  carouselBadge: { position: 'absolute', top: 8, right: 8 },
  viewsBadge: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewsText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  bottomSheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheetHandle: { width: 48, height: 6, borderRadius: 3, backgroundColor: '#555', alignSelf: 'center', marginBottom: 16 },
  sheetItem: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12 },
  sheetItemText: { fontSize: 18, fontWeight: '500', color: '#fff' },
  sheetDivider: { height: 1, backgroundColor: '#333', marginVertical: 8 },
});
