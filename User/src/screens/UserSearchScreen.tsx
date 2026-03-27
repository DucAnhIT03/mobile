import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, Image, ActivityIndicator, Animated, RefreshControl,
} from 'react-native';
import { ArrowLeft, Search, UserPlus, UserCheck, MessageCircle, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { userApi, UserInfo } from '../api/userApi';
import { chatApi } from '../api/chatApi';
import { useAuth } from '../contexts/AuthContext';
import { showAlert } from '../utils/alert';
import { BASE_URL } from '../services/api';

const resolveAvatar = (a?: string) => {
  if (!a) return 'https://i.pravatar.cc/150';
  return a.startsWith('http') ? a : `${BASE_URL}${a}`;
};

export default function UserSearchScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [followedUsers, setFollowedUsers] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const toggleFollow = async (userId: number) => {
    const wasFollowed = followedUsers.has(userId);
    // Optimistic update
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (wasFollowed) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
    try {
      if (wasFollowed) {
        await userApi.unfollow(userId);
      } else {
        await userApi.follow(userId);
      }
    } catch (error: any) {
      // Revert on error
      setFollowedUsers(prev => {
        const next = new Set(prev);
        if (wasFollowed) {
          next.add(userId);
        } else {
          next.delete(userId);
        }
        return next;
      });
      showAlert('Lỗi', error.response?.data?.message || 'Thao tác thất bại');
    }
  };

  // Load suggested users on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const res = await userApi.getAll();
        // Filter out current user
        const filtered = res.data.filter((u: UserInfo) => u.id !== currentUser?.id);
        setSuggestedUsers(filtered);
      } catch (error) {
        // Silently fail for suggestions
      } finally {
        setLoadingSuggestions(false);
      }
    };
    loadSuggestions();
  }, []);

  // Search users with debounce
  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await userApi.search(query.trim());
        const filtered = res.data.filter((u: UserInfo) => u.id !== currentUser?.id);
        setUsers(filtered);
      } catch (error) {
        showAlert('Lỗi', 'Không thể tìm kiếm người dùng');
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleStartChat = async (targetUser: UserInfo) => {
    try {
      const res = await chatApi.createConversation(targetUser.id);
      navigation.navigate('ChatDetail', {
        id: res.data.id.toString(),
        name: targetUser.username,
        avatar: targetUser.avatar,
        isOnline: targetUser.isOnline,
      });
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Không thể tạo cuộc trò chuyện';
      showAlert('Lỗi', msg);
    }
  };

  const displayList = query.trim() ? users : suggestedUsers;
  const isSearching = query.trim().length > 0;

  const renderUserCard = ({ item }: { item: UserInfo }) => (
    <TouchableOpacity
      style={styles.userCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('UserProfile', {
        userId: item.id,
        username: item.username,
        avatar: item.avatar,
        isOnline: item.isOnline,
        email: item.email,
      })}
    >
      <View style={styles.userLeft}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: resolveAvatar(item.avatar) }} style={styles.avatar} />
          {item.isOnline && <View style={styles.onlineDot} />}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username} numberOfLines={1}>{item.username}</Text>
          <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={(e) => {
            e.stopPropagation();
            handleStartChat(item);
          }}
          activeOpacity={0.7}
        >
          <MessageCircle size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.followBtn, followedUsers.has(item.id) && styles.followedBtn]}
          onPress={(e) => {
            e.stopPropagation();
            toggleFollow(item.id);
          }}
          activeOpacity={0.7}
        >
          {followedUsers.has(item.id) ? (
            <UserCheck size={14} color="#d1d5db" />
          ) : (
            <UserPlus size={14} color="#fff" />
          )}
          <Text style={[styles.followBtnText, followedUsers.has(item.id) && styles.followedBtnText]}>
            {followedUsers.has(item.id) ? 'Đã theo dõi' : 'Theo dõi'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <Search size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm người dùng..."
            placeholderTextColor="#6b7280"
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <X size={14} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          {isSearching ? (
            <Search size={16} color="#3b82f6" />
          ) : (
            <UserPlus size={16} color="#3b82f6" />
          )}
          <Text style={styles.sectionTitle}>
            {isSearching ? `Kết quả tìm kiếm` : 'Gợi ý kết bạn'}
          </Text>
        </View>
        {isSearching && !loading && (
          <Text style={styles.resultCount}>{users.length} người dùng</Text>
        )}
      </View>

      {/* User List */}
      {loading || loadingSuggestions ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
        </View>
      ) : (
        <FlatList
          data={displayList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={async () => {
              setRefreshing(true);
              try {
                const res = await userApi.getAll();
                setSuggestedUsers(res.data.filter((u: UserInfo) => u.id !== currentUser?.id));
              } catch (e) {}
              setRefreshing(false);
            }} tintColor="#3b82f6" colors={['#3b82f6']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrapper}>
                <Search size={40} color="#4b5563" />
              </View>
              <Text style={styles.emptyTitle}>
                {isSearching ? 'Không tìm thấy người dùng' : 'Chưa có gợi ý'}
              </Text>
              <Text style={styles.emptySubtext}>
                {isSearching
                  ? 'Thử tìm bằng tên hoặc email khác'
                  : 'Hãy thử tìm kiếm bạn bè'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    padding: 4,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 15,
  },
  clearBtn: {
    padding: 6,
    backgroundColor: '#374151',
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#d1d5db',
  },
  resultCount: {
    fontSize: 13,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#374151',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#121212',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f3f4f6',
  },
  email: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  chatBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
  },
  followedBtn: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#374151',
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  followedBtnText: {
    color: '#d1d5db',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d1d5db',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
