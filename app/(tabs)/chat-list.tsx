import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';

const chats = [
  { id: 1, name: 'Alex Johnson', message: 'Just saw the new video!', time: '10:30 AM', unread: 2, avatar: 'https://i.pravatar.cc/150?img=11', online: true },
  { id: 2, name: 'Sarah Lee', message: 'Are you coming to the...', time: 'Yesterday', unread: 5, avatar: 'https://i.pravatar.cc/150?img=5', online: true },
  { id: 3, name: 'Sarah Lee', message: 'Are you coming to the...', time: 'Yesterday', unread: 5, avatar: 'https://i.pravatar.cc/150?img=8', online: false },
  { id: 4, name: 'Sarah Luna', message: 'Event details shared...', time: 'Mon', unread: 1, avatar: 'https://i.pravatar.cc/150?img=9', online: true },
  { id: 5, name: 'Community Group', message: 'Event details shared...', time: 'Mon', unread: 1, avatar: 'https://i.pravatar.cc/150?img=10', online: true },
  { id: 6, name: 'Comn Laby', message: 'Event details shared...', time: 'Mon', unread: 2, avatar: 'https://i.pravatar.cc/150?img=12', online: true },
  { id: 7, name: 'TikTok Trends', message: 'New viral sound...', time: 'Sun', unread: '9+', avatar: 'https://i.pravatar.cc/150?img=16', online: false },
];

export default function ChatList() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={styles.searchInput} placeholder="Search chats and messages" placeholderTextColor="#9CA3AF" />
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="create-outline" size={20} color="#D1D5DB" />
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <FlatList
        data={chats}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatRow}
            onPress={() => router.push({ pathname: '/chat-detail', params: { id: String(item.id) } })}
            activeOpacity={0.7}
          >
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
              {item.online && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatTopRow}>
                <Text style={styles.chatName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.chatTime}>{item.time}</Text>
              </View>
              <View style={styles.chatBottomRow}>
                <Text style={styles.chatMessage} numberOfLines={1}>{item.message}</Text>
                {item.unread && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16 },
  searchWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceHigh, borderRadius: 16, paddingHorizontal: 12, height: 42 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  editBtn: { width: 44, height: 44, backgroundColor: Colors.surfaceHigh, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  chatRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 12 },
  avatarWrapper: { position: 'relative' },
  chatAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 0.5, borderColor: '#333' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.green, borderWidth: 2, borderColor: Colors.surface },
  chatInfo: { flex: 1 },
  chatTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 },
  chatName: { fontSize: 17, fontWeight: '600', color: '#fff', flex: 1, marginRight: 8 },
  chatTime: { fontSize: 12, color: '#9CA3AF' },
  chatBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatMessage: { fontSize: 15, color: '#9CA3AF', flex: 1, marginRight: 16 },
  unreadBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
  unreadText: { fontSize: 12, fontWeight: '700', color: '#fff' },
});
