import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image,
  Dimensions, ScrollView, RefreshControl, ActivityIndicator, Share,
} from 'react-native';
import { Search as SearchIcon, X, Play, MessageSquare } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { postApi, PostItem } from '../api/postApi';
import { userApi, UserInfo } from '../api/userApi';
import { BASE_URL } from '../services/api';
import VideoThumbnailItem from '../components/VideoThumbnailItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = (SCREEN_WIDTH - 4) / 3;

type SearchTab = 'top' | 'video' | 'users' | 'images';
const SEARCH_TABS: { key: SearchTab | 'ask'; label: string }[] = [
  { key: 'ask', label: 'Hỏi' },
  { key: 'top', label: 'Top' },
  { key: 'video', label: 'Video' },
  { key: 'users', label: 'Người dùng' },
  { key: 'images', label: 'Ảnh' },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('top');
  const [allPosts, setAllPosts] = useState<PostItem[]>([]);
  const [searchPosts, setSearchPosts] = useState<PostItem[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);

  const resolveUri = (uri: string) => {
    if (!uri) return 'https://i.pravatar.cc/150';
    return uri.startsWith('http') ? uri : `${BASE_URL}${uri}`;
  };

  const loadExplore = async () => {
    try {
      const res = await postApi.getFeed();
      setAllPosts(res.data.posts || []);
    } catch {} finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { loadExplore(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExplore();
    setRefreshing(false);
  };

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setSearchPosts([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const [userRes] = await Promise.all([
          userApi.search(query.trim()),
        ]);
        setUsers(userRes.data || []);
        // Filter posts by caption
        const q = query.trim().toLowerCase();
        const filtered = allPosts.filter(p =>
          p.caption?.toLowerCase().includes(q) ||
          p.user?.username?.toLowerCase().includes(q) ||
          p.user?.displayName?.toLowerCase().includes(q)
        );
        setSearchPosts(filtered);
      } catch {}
      setSearching(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, allPosts]);

  const isSearchMode = query.trim().length > 0;

  // Filtered data based on active tab
  const getFilteredPosts = () => {
    if (!isSearchMode) return allPosts;
    switch (activeTab) {
      case 'video': return searchPosts.filter(p => p.type === 'video');
      case 'images': return searchPosts.filter(p => p.type === 'image');
      case 'top': return searchPosts;
      default: return searchPosts;
    }
  };

  const renderExploreItem = ({ item }: { item: PostItem }) => {
    const isVideo = item.type === 'video';
    return (
      <TouchableOpacity
        style={styles.gridItem}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('PostDetail', { post: item })}
      >
        {isVideo ? (
          <VideoThumbnailItem
            videoUri={resolveUri(item.media[0])}
            thumbnailUri={item.thumbnail ? resolveUri(item.thumbnail) : null}
            style={styles.gridImage}
          />
        ) : (
          <Image source={{ uri: resolveUri(item.media[0]) }} style={styles.gridImage} />
        )}
        {isVideo && (
          <View style={styles.videoIcon}>
            <Play size={14} color="#fff" fill="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({ item }: { item: UserInfo }) => (
    <TouchableOpacity
      style={styles.userItem}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('UserProfile', {
        userId: item.id, username: item.username,
        avatar: item.avatar, isOnline: item.isOnline,
      })}
    >
      <Image
        source={{ uri: item.avatar ? resolveUri(item.avatar) : 'https://i.pravatar.cc/150' }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userDisplayName}>{item.displayName || item.username}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      {item.isOnline && <View style={styles.onlineDot} />}
    </TouchableOpacity>
  );

  const handleTabPress = (key: SearchTab | 'ask') => {
    if (key === 'ask') {
      navigation.navigate('AIChat');
      return;
    }
    setActiveTab(key);
  };

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
            placeholder="Tìm kiếm..."
            placeholderTextColor="#6b7280"
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <X size={14} color="#d1d5db" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Search Tabs — chỉ hiện khi đang tìm kiếm */}
      {isSearchMode && (
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 0 }}>
            {SEARCH_TABS.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabBtn, tab.key !== 'ask' && activeTab === tab.key && styles.tabBtnActive]}
                onPress={() => handleTabPress(tab.key)}
              >
                {tab.key === 'ask' ? (
                  <View style={styles.askBtn}>
                    <MessageSquare size={14} color="#3b82f6" />
                    <Text style={styles.askText}>{tab.label}</Text>
                  </View>
                ) : (
                  <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {isSearchMode ? (
        /* === SEARCH RESULTS === */
        searching ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#3b82f6" /></View>
        ) : activeTab === 'users' ? (
          <FlatList
            key="users-list"
            data={users}
            keyExtractor={item => item.id.toString()}
            renderItem={renderUserItem}
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>Không tìm thấy người dùng</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            key="grid-3col"
            data={getFilteredPosts()}
            numColumns={3}
            keyExtractor={item => item.id.toString()}
            renderItem={renderExploreItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
              </View>
            }
          />
        )
      ) : (
        /* === EXPLORE GRID === */
        loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#3b82f6" /></View>
        ) : (
          <FlatList
            data={allPosts}
            numColumns={3}
            keyExtractor={item => item.id.toString()}
            renderItem={renderExploreItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 80 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" colors={['#3b82f6']} />
            }
            ListEmptyComponent={
              <View style={styles.center}>
                <SearchIcon size={48} color="#374151" />
                <Text style={styles.emptyText}>Chưa có bài viết nào</Text>
              </View>
            }
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  searchHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  searchInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: 999, paddingHorizontal: 16,
  },
  searchInput: { flex: 1, paddingVertical: 12, color: '#fff', fontSize: 16 },
  clearBtn: { padding: 6, backgroundColor: '#374151', borderRadius: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#6b7280', textAlign: 'center', paddingHorizontal: 24 },

  // Tabs — pill/chip style
  tabsContainer: {
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 10,
  },
  tabBtn: {
    paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 4,
    borderRadius: 20, backgroundColor: '#1A1A1A',
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  tabBtnActive: {
    backgroundColor: '#fff', borderColor: '#fff',
  },
  tabText: { fontSize: 14, fontWeight: '600', color: '#9ca3af' },
  tabTextActive: { color: '#000' },
  askBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(99,102,241,0.12)', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(99,102,241,0.35)',
  },
  askText: { fontSize: 14, fontWeight: '700', color: '#818cf8' },

  // Grid
  gridItem: { width: ITEM_WIDTH, height: ITEM_WIDTH, padding: 0.5 },
  gridImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  videoIcon: { position: 'absolute', top: 6, right: 6 },

  // User
  userItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  userAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#2A2A2A' },
  userInfo: { flex: 1 },
  userDisplayName: { fontSize: 15, fontWeight: '600', color: '#fff' },
  username: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e' },
});
