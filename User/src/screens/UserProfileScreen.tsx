import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  FlatList, Dimensions, ActivityIndicator, RefreshControl,
} from 'react-native';
import { ArrowLeft, MoreHorizontal, Grid3X3, Clapperboard, Contact, Play, Layers, MessageCircle, UserPlus, UserCheck, Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userApi, UserProfile } from '../api/userApi';
import { chatApi } from '../api/chatApi';
import { showAlert } from '../utils/alert';
import { BASE_URL } from '../services/api';
import { postApi, PostItem } from '../api/postApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type TabType = 'posts' | 'reels' | 'tagged';

export default function UserProfileScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { userId } = route.params || {};
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const ITEM_SIZE = SCREEN_WIDTH / 3;
  const currentData: PostItem[] = activeTab === 'posts' ? posts : activeTab === 'reels' ? posts.filter(p => p.type === 'video') : [];

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await userApi.getProfile(userId);
        setProfile(res.data);
        try {
          const postsRes = await postApi.getUserPosts(userId);
          setPosts(postsRes.data.posts || []);
        } catch (e) {}
      } catch (error: any) {
        showAlert('Lỗi', 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    if (userId) loadData();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await userApi.getProfile(userId);
      setProfile(res.data);
      try {
        const postsRes = await postApi.getUserPosts(userId);
        setPosts(postsRes.data.posts || []);
      } catch (e) {}
    } catch (e) {}
    setRefreshing(false);
  };

  const handleMessage = async () => {
    if (!profile) return;
    try {
      const res = await chatApi.createConversation(profile.id);
      navigation.navigate('ChatDetail', {
        id: res.data.id.toString(),
        name: profile.username,
        avatar: profile.avatar,
        isOnline: profile.isOnline,
      });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Không thể tạo cuộc trò chuyện';
      showAlert('Lỗi', msg);
    }
  };

  const handleFollow = async () => {
    if (!profile || followLoading) return;
    setFollowLoading(true);
    try {
      if (profile.isFollowing) {
        await userApi.unfollow(profile.id);
        setProfile({ ...profile, isFollowing: false, followersCount: profile.followersCount - 1 });
      } else {
        await userApi.follow(profile.id);
        setProfile({ ...profile, isFollowing: true, followersCount: profile.followersCount + 1 });
      }
    } catch (error: any) {
      showAlert('Lỗi', error.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: '#9ca3af', fontSize: 16 }}>Người dùng không tồn tại</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerUsername} numberOfLines={1}>{profile.username}</Text>
        <TouchableOpacity style={styles.moreBtn}>
          <MoreHorizontal size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentData}
        numColumns={3}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" colors={['#3b82f6']} />
        }
        ListHeaderComponent={
          <View>
            {/* Profile Info Row */}
            <View style={styles.profileHeader}>
              <View style={styles.avatarSection}>
                <View style={styles.avatarRing}>
                  <Image
                    source={{ uri: profile.avatar ? (profile.avatar.startsWith('http') ? profile.avatar : `${BASE_URL}${profile.avatar}`) : 'https://i.pravatar.cc/150' }}
                    style={styles.profileAvatar}
                  />
                </View>
                {profile.isOnline && <View style={styles.onlineBadge} />}
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{profile.postsCount}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Connections', { tab: 'followers', userId: profile.id, username: profile.username, followersCount: profile.followersCount, followingCount: profile.followingCount })}>
                  <Text style={styles.statNumber}>{profile.followersCount}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Connections', { tab: 'following', userId: profile.id, username: profile.username, followersCount: profile.followersCount, followingCount: profile.followingCount })}>
                  <Text style={styles.statNumber}>{profile.followingCount}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bio */}
            <View style={styles.bioSection}>
              <Text style={styles.bioName}>{profile.displayName || profile.username}</Text>
              {profile.bio ? <Text style={styles.bioText}>{profile.bio}</Text> : null}
              <Text style={styles.bioEmail}>{profile.email}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.followBtn, profile.isFollowing && styles.followingBtn]}
                onPress={handleFollow}
                activeOpacity={0.7}
                disabled={followLoading}
              >
                {profile.isFollowing ? (
                  <UserCheck size={16} color="#d1d5db" />
                ) : (
                  <UserPlus size={16} color="#fff" />
                )}
                <Text style={[styles.followBtnText, profile.isFollowing && styles.followingBtnText]}>
                  {profile.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.messageBtn} onPress={handleMessage} activeOpacity={0.7}>
                <MessageCircle size={16} color="#fff" />
                <Text style={styles.messageBtnText}>Nhắn tin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.notifyBtn} activeOpacity={0.7}>
                <Bell size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
                onPress={() => setActiveTab('posts')}
              >
                <Grid3X3 size={24} color={activeTab === 'posts' ? '#fff' : '#6b7280'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'reels' && styles.tabActive]}
                onPress={() => setActiveTab('reels')}
              >
                <Clapperboard size={24} color={activeTab === 'reels' ? '#fff' : '#6b7280'} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'tagged' && styles.tabActive]}
                onPress={() => setActiveTab('tagged')}
              >
                <Contact size={24} color={activeTab === 'tagged' ? '#fff' : '#6b7280'} />
              </TouchableOpacity>
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
              {item.media.length > 1 && (
                <View style={styles.carouselIcon}>
                  <Layers size={16} color="#fff" fill="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          activeTab === 'tagged' ? (
            <View style={styles.emptyContainer}>
              <Contact size={48} color="#374151" />
              <Text style={styles.emptyTitle}>Chưa có ảnh được gắn thẻ</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: { padding: 4 },
  headerUsername: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 16,
  },
  moreBtn: { padding: 4 },

  // Profile header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  avatarSection: { position: 'relative' },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#3b82f6',
    padding: 3,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#121212',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 24,
  },
  statItem: { alignItems: 'center' },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },

  // Bio
  bioSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bioName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bioText: {
    fontSize: 14,
    color: '#d1d5db',
    marginBottom: 2,
  },
  bioEmail: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
  },
  followingBtn: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#374151',
  },
  followBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  followingBtnText: {
    color: '#d1d5db',
  },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  messageBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  notifyBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#fff' },

  // Grid
  gridItem: { position: 'relative', padding: 0.5 },
  gridImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  carouselIcon: { position: 'absolute', top: 8, right: 8 },
  viewsRow: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: { fontSize: 12, fontWeight: '600', color: '#fff' },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  videoOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
});
