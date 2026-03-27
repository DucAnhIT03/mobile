import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { ArrowLeft, Search, MoreHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userApi, FollowUser } from '../api/userApi';
import { BASE_URL } from '../services/api';
import { showAlert } from '../utils/alert';

export default function ConnectionsScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const {
    tab: initialTab = 'followers',
    userId,
    username = '',
    followersCount: initFollowersCount = 0,
    followingCount: initFollowingCount = 0,
  } = route.params || {};

  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [followersCount, setFollowersCount] = useState(initFollowersCount);
  const [followingCount, setFollowingCount] = useState(initFollowingCount);

  const resolveAvatar = (avatar?: string) => {
    if (!avatar) return 'https://i.pravatar.cc/150';
    return avatar.startsWith('http') ? avatar : `${BASE_URL}${avatar}`;
  };

  const loadData = async () => {
    if (!userId) return;
    try {
      const [followersRes, followingRes] = await Promise.all([
        userApi.getFollowers(userId),
        userApi.getFollowing(userId),
      ]);
      setFollowers(followersRes.data);
      setFollowing(followingRes.data);
      setFollowersCount(followersRes.data.length);
      setFollowingCount(followingRes.data.length);
    } catch {
      showAlert('Lỗi', 'Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleFollow = async (targetUserId: number) => {
    // Find user in current list
    const updateList = (list: FollowUser[], setList: React.Dispatch<React.SetStateAction<FollowUser[]>>) => {
      setList(list.map(u => u.id === targetUserId ? { ...u, isFollowing: true } : u));
    };
    updateList(followers, setFollowers);
    updateList(following, setFollowing);

    try {
      await userApi.follow(targetUserId);
    } catch {
      // Revert
      const revert = (list: FollowUser[], setList: React.Dispatch<React.SetStateAction<FollowUser[]>>) => {
        setList(list.map(u => u.id === targetUserId ? { ...u, isFollowing: false } : u));
      };
      revert(followers, setFollowers);
      revert(following, setFollowing);
      showAlert('Lỗi', 'Không thể theo dõi');
    }
  };

  const handleUnfollow = async (targetUserId: number) => {
    const updateList = (list: FollowUser[], setList: React.Dispatch<React.SetStateAction<FollowUser[]>>) => {
      setList(list.map(u => u.id === targetUserId ? { ...u, isFollowing: false } : u));
    };
    updateList(followers, setFollowers);
    updateList(following, setFollowing);

    try {
      await userApi.unfollow(targetUserId);
    } catch {
      const revert = (list: FollowUser[], setList: React.Dispatch<React.SetStateAction<FollowUser[]>>) => {
        setList(list.map(u => u.id === targetUserId ? { ...u, isFollowing: true } : u));
      };
      revert(followers, setFollowers);
      revert(following, setFollowing);
      showAlert('Lỗi', 'Không thể hủy theo dõi');
    }
  };

  const currentList = activeTab === 'followers' ? followers : following;
  const filteredList = currentList.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.displayName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}m`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ArrowLeft size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.title}>{username}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'followers' && styles.tabActive]} onPress={() => setActiveTab('followers')}>
          <Text style={[styles.tabText, activeTab === 'followers' && styles.tabTextActive]}>{formatCount(followersCount)} Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'following' && styles.tabActive]} onPress={() => setActiveTab('following')}>
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>{formatCount(followingCount)} Following</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Search size={16} color="#9ca3af" style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Search" placeholderTextColor="#9ca3af" value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={filteredList}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" colors={['#3b82f6']} />
          }
          ListEmptyComponent={<View style={styles.emptyState}><Text style={styles.emptyText}>Không tìm thấy người dùng nào</Text></View>}
          renderItem={({ item: user }) => (
            <TouchableOpacity
              style={styles.userRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('UserProfile', {
                userId: user.id,
                username: user.username,
                avatar: user.avatar,
                isOnline: user.isOnline,
              })}
            >
              <View style={styles.userLeft}>
                <Image source={{ uri: resolveAvatar(user.avatar) }} style={styles.avatar} />
                <View>
                  <Text style={styles.username}>{user.username}</Text>
                  <Text style={styles.name}>{user.displayName || user.username}</Text>
                </View>
              </View>
              <View style={styles.userRight}>
                {user.isFollowing ? (
                  <TouchableOpacity style={styles.followingBtn} onPress={() => handleUnfollow(user.id)}>
                    <Text style={styles.followingBtnText}>Đang theo dõi</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.followBtn} onPress={() => handleFollow(user.id)}>
                    <Text style={styles.followBtnText}>Theo dõi</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151' },
  backBtn: { padding: 8 },
  title: { fontSize: 17, fontWeight: 'bold', color: '#fff', marginLeft: 16 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#374151' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#fff' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: '#262626', borderRadius: 12, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 15, color: '#fff' },
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  userLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  username: { fontSize: 14, fontWeight: '600', color: '#fff' },
  name: { fontSize: 14, color: '#9ca3af' },
  userRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  followBtn: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#3b82f6', borderRadius: 8 },
  followBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  followingBtn: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#262626', borderRadius: 8, borderWidth: 1, borderColor: '#374151' },
  followingBtnText: { fontSize: 14, fontWeight: '600', color: '#d1d5db' },
  emptyState: { alignItems: 'center', justifyContent: 'center', height: 160 },
  emptyText: { color: '#9ca3af' },
});
