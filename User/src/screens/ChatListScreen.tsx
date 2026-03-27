import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Search, UserPlus, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { chatApi, ConversationItem } from '../api/chatApi';
import { getSocket } from '../services/socket';
import { showAlert } from '../utils/alert';
import { BASE_URL } from '../services/api';

const resolveAvatar = (a?: string) => {
  if (!a) return 'https://i.pravatar.cc/150';
  return a.startsWith('http') ? a : `${BASE_URL}${a}`;
};

export default function ChatListScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = async () => {
    try {
      const res = await chatApi.getConversations();
      setConversations(res.data);
    } catch (error: any) {
      showAlert('Lỗi', 'Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  // Reload khi screen được focus
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, []);

  // Lắng nghe WebSocket cho tin nhắn mới
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleConversationUpdated = (data: any) => {
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === data.conversationId
            ? { ...c, lastMessage: data.lastMessage, unreadCount: c.unreadCount + 1 }
            : c
        );
        // Sắp xếp lại theo tin nhắn mới nhất
        return updated.sort((a, b) => {
          const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return timeB - timeA;
        });
      });
    };

    const handleUserOnline = (data: any) => {
      setConversations((prev) =>
        prev.map((c) => {
          const isParticipant = c.participants?.some((p) => p.id === data.userId);
          return isParticipant ? { ...c, isOnline: true } : c;
        })
      );
    };

    const handleUserOffline = (data: any) => {
      setConversations((prev) =>
        prev.map((c) => {
          const isParticipant = c.participants?.some((p) => p.id === data.userId);
          return isParticipant ? { ...c, isOnline: false } : c;
        })
      );
    };

    socket.on('conversationUpdated', handleConversationUpdated);
    socket.on('userOnline', handleUserOnline);
    socket.on('userOffline', handleUserOffline);

    return () => {
      socket.off('conversationUpdated', handleConversationUpdated);
      socket.off('userOnline', handleUserOnline);
      socket.off('userOffline', handleUserOffline);
    };
  }, []);

  const filteredChats = searchQuery.trim()
    ? conversations.filter((c) => c.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  const formatTime = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchWrapper}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm cuộc trò chuyện"
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('UserSearch')}>
          <UserPlus size={20} color="#d1d5db" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" colors={['#3b82f6']} />
          }
          ListHeaderComponent={() => (
            <TouchableOpacity style={styles.aiChatRow} onPress={() => navigation.navigate('AIChat')}>
              <LinearGradient
                colors={['#2563eb', '#3b82f6', '#60a5fa']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.aiAvatarGradient}
              >
                <Sparkles size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.chatContent}>
                <View style={styles.chatTop}>
                  <Text style={styles.aiChatName}>AI Assistant</Text>
                  <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>AI</Text></View>
                </View>
                <Text style={styles.aiChatMessage}>Hỏi tôi bất cứ điều gì...</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
              <Text style={styles.emptySubtext}>Hãy bắt đầu trò chuyện mới!</Text>
            </View>
          )}
          renderItem={({ item: chat }) => (
            <TouchableOpacity
              style={styles.chatRow}
              onPress={() => navigation.navigate('ChatDetail', { id: chat.id.toString(), name: chat.name, avatar: chat.avatar, isOnline: chat.isOnline, targetUserId: chat.participants?.[0]?.id })}
            >
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: resolveAvatar(chat.avatar) }} style={styles.avatar} />
                {chat.isOnline && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.chatContent}>
                <View style={styles.chatTop}>
                  <Text style={styles.chatName} numberOfLines={1}>{chat.name}</Text>
                  <Text style={styles.chatTime}>{formatTime(chat.lastMessage?.createdAt)}</Text>
                </View>
                <View style={styles.chatBottom}>
                  <Text style={styles.chatMessage} numberOfLines={1}>
                    {chat.lastMessage?.content || 'Bắt đầu trò chuyện...'}
                  </Text>
                  {chat.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{chat.unreadCount > 9 ? '9+' : chat.unreadCount}</Text>
                    </View>
                  )}
                </View>
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
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
  searchWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A2A2A', borderRadius: 16, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: '#fff' },
  editBtn: { width: 44, height: 44, backgroundColor: '#2A2A2A', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  emptySubtext: { fontSize: 14, color: '#9ca3af', marginTop: 4 },

  // AI Chat row
  aiChatRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: 'rgba(59,130,246,0.08)', borderBottomWidth: 1, borderBottomColor: 'rgba(59,130,246,0.15)' },
  aiAvatarGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  aiChatName: { fontSize: 17, fontWeight: '700', color: '#60a5fa' },
  aiChatMessage: { fontSize: 15, color: '#3b82f6', fontWeight: '500', marginTop: 2 },
  aiBadge: { backgroundColor: '#3b82f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  aiBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#fff' },

  // Normal chat rows
  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 12 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: '#374151' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#121212' },
  chatContent: { flex: 1 },
  chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { fontSize: 17, fontWeight: '600', color: '#fff', flex: 1, marginRight: 8 },
  chatTime: { fontSize: 12, color: '#9ca3af' },
  chatBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatMessage: { fontSize: 15, color: '#9ca3af', flex: 1, marginRight: 16 },
  unreadBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  unreadText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
});
