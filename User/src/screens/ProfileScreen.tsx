import React, { useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Modal, Dimensions, ActivityIndicator, RefreshControl, } from 'react-native';
import { Plus, Play, Grid3X3, Clapperboard, Contact, Layers, Menu, Clock, Settings, LogOut } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { userApi, UserProfile } from '../api/userApi';
import { useAuth } from '../contexts/AuthContext';
import { showAlert } from '../utils/alert';
import { BASE_URL } from '../services/api';
import { postApi, PostItem } from '../api/postApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type TabType = 'posts' | 'reels' | 'tagged';

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user: authUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [showMenu, setShowMenu] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const res = await userApi.getMe();
          setProfile(res.data);
          // Load posts riêng để không ảnh hưởng profile
          try {
            const postsRes = await postApi.getUserPosts(res.data.id);
            setPosts(postsRes.data.posts || []);
          } catch (e) {}
        } catch (error: any) {
          showAlert('Lỗi', 'Không thể tải thông tin cá nhân');
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await userApi.getMe();
      setProfile(res.data);
      try {
        const postsRes = await postApi.getUserPosts(res.data.id);
        setPosts(postsRes.data.posts || []);
      } catch (e) {}
    } catch (e) {}
    setRefreshing(false);
  };

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
    navigation.replace('Login');
  };

  const currentData: PostItem[] = activeTab === 'posts' ? posts : activeTab === 'reels' ? posts.filter(p => p.type === 'video') : [];
  const ITEM_SIZE = SCREEN_WIDTH / 3;

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.userName}>{profile?.username || authUser?.username}</Text>
        <TouchableOpacity onPress={() => setShowMenu(true)} style={styles.menuBtn}><Menu size={28} color="#fff" /></TouchableOpacity>
      </View>

      <FlatList
        data={currentData}
        numColumns={3}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" colors={['#3b82f6']} />
        }
        ListHeaderComponent={
          <View>
            {/* Profile Info */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarSection}>
                <LinearGradient colors={['#fb923c', '#ec4899', '#9333ea']} style={styles.avatarRing} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <View style={styles.avatarRingInner}>
                    <Image source={{ uri: profile?.avatar ? (profile.avatar.startsWith('http') ? profile.avatar : `${BASE_URL}${profile.avatar}`) : 'https://i.pravatar.cc/150' }} style={styles.profileAvatar} />
                  </View>
                </LinearGradient>
                <View style={styles.addBtn}><Plus size={16} color="#fff" /></View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}><Text style={styles.statNumber}>{profile?.postsCount ?? 0}</Text><Text style={styles.statLabel}>Posts</Text></View>
                <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Connections', { tab: 'followers', userId: profile?.id, username: profile?.username, followersCount: profile?.followersCount, followingCount: profile?.followingCount })}>
                  <Text style={styles.statNumber}>{profile?.followersCount ?? 0}</Text><Text style={styles.statLabel}>Followers</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Connections', { tab: 'following', userId: profile?.id, username: profile?.username, followersCount: profile?.followersCount, followingCount: profile?.followingCount })}>
                  <Text style={styles.statNumber}>{profile?.followingCount ?? 0}</Text><Text style={styles.statLabel}>Following</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bio */}
            <View style={styles.bioSection}>
              <Text style={styles.bioName}>{profile?.displayName || profile?.username}</Text>
              {profile?.bio ? <Text style={styles.bioText}>{profile.bio}</Text> : null}
              <View style={styles.actionBtns}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('EditProfile')}><Text style={styles.actionBtnText}>Edit Profile</Text></TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Create')}><Text style={styles.actionBtnText}>Create Content</Text></TouchableOpacity>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity style={[styles.tab, activeTab === 'posts' && styles.tabActive]} onPress={() => setActiveTab('posts')}><Grid3X3 size={24} color={activeTab === 'posts' ? '#fff' : '#6b7280'} /></TouchableOpacity>
              <TouchableOpacity style={[styles.tab, activeTab === 'reels' && styles.tabActive]} onPress={() => setActiveTab('reels')}><Clapperboard size={24} color={activeTab === 'reels' ? '#fff' : '#6b7280'} /></TouchableOpacity>
              <TouchableOpacity style={[styles.tab, activeTab === 'tagged' && styles.tabActive]} onPress={() => setActiveTab('tagged')}><Contact size={24} color={activeTab === 'tagged' ? '#fff' : '#6b7280'} /></TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }: { item: PostItem }) => {
          const imageUri = item.type === 'video' && item.thumbnail
            ? (item.thumbnail.startsWith('http') ? item.thumbnail : `${BASE_URL}${item.thumbnail}`)
            : item.media[0]?.startsWith('http') ? item.media[0] : `${BASE_URL}${item.media[0]}`;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('PostDetail', { post: item })}
              style={[styles.gridItem, { width: ITEM_SIZE, height: ITEM_SIZE }]}
            >
              <Image source={{ uri: imageUri }} style={styles.gridImage} />
              {item.type === 'video' && (
                <View style={styles.videoOverlay}>
                  <Play size={24} color="#fff" fill="#fff" />
                </View>
              )}
              {item.media.length > 1 && <View style={styles.carouselIcon}><Layers size={16} color="#fff" fill="#fff" /></View>}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
            <Grid3X3 size={48} color="#374151" />
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#9ca3af' }}>Chưa có bài viết nào</Text>
            <Text style={{ fontSize: 14, color: '#6b7280' }}>Hãy tạo bài viết đầu tiên!</Text>
            <TouchableOpacity
              style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
              onPress={() => navigation.navigate('Create')}
            >
              <Plus size={18} color="#fff" />
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Tạo bài viết</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Menu Modal */}
      <Modal visible={showMenu} animationType="slide" transparent onRequestClose={() => setShowMenu(false)}>
        <View style={styles.menuOverlay}>
          <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setShowMenu(false)} />
          <View style={[styles.menuSheet, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.menuDragHandle} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('ActivityHistory'); }}>
              <Clock size={24} color="#fff" /><Text style={styles.menuItemText}>Lịch sử hoạt động</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); navigation.navigate('Settings'); }}>
              <Settings size={24} color="#fff" /><Text style={styles.menuItemText}>Cài đặt và quyền riêng tư</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <LogOut size={24} color="#ef4444" /><Text style={[styles.menuItemText, { color: '#ef4444' }]}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  menuBtn: { padding: 8 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 24 },
  avatarSection: { position: 'relative' },
  avatarRing: { width: 96, height: 96, borderRadius: 48, padding: 4, alignItems: 'center', justifyContent: 'center' },
  avatarRingInner: { width: '100%', height: '100%', borderRadius: 44, borderWidth: 4, borderColor: '#121212', overflow: 'hidden' },
  profileAvatar: { width: '100%', height: '100%' },
  addBtn: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#121212' },
  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginLeft: 24 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 13, color: '#9ca3af' },
  bioSection: { paddingHorizontal: 16, paddingBottom: 24 },
  bioName: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  bioText: { fontSize: 15, color: '#d1d5db', marginBottom: 16 },
  actionBtns: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 8, backgroundColor: '#2A2A2A', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  actionBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#374151' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#fff' },
  gridItem: { position: 'relative', padding: 0.5 },
  gridImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  carouselIcon: { position: 'absolute', top: 8, right: 8 },
  viewsRow: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewsText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  menuOverlay: { flex: 1, justifyContent: 'flex-end' },
  menuBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  menuSheet: { backgroundColor: '#121212', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 },
  menuDragHandle: { width: 48, height: 6, borderRadius: 3, backgroundColor: '#4b5563', alignSelf: 'center', marginBottom: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12 },
  menuItemText: { fontSize: 18, fontWeight: '500', color: '#fff' },
  menuDivider: { height: 1, backgroundColor: '#374151', marginVertical: 8 },
  videoOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
});
