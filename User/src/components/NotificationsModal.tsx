import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Modal } from 'react-native';
import { X } from 'lucide-react-native';

interface Notification {
  id: number;
  type: 'follow' | 'like' | 'comment' | 'suggestion';
  user: string;
  userImage: string;
  time?: string;
  content?: string;
  postImage?: string;
  subtitle?: string;
  isFollowing?: boolean;
}

const initialNotifications: Notification[] = [
  { id: 1, type: 'follow', user: 'jane_doe', userImage: 'https://i.pravatar.cc/150?img=1', time: '2h', isFollowing: false },
  { id: 2, type: 'like', user: 'mike.travels', userImage: 'https://i.pravatar.cc/150?img=47', time: '3h', postImage: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=100' },
  { id: 3, type: 'comment', user: 'sarah.j', userImage: 'https://i.pravatar.cc/150?img=32', time: '5h', content: 'This is amazing! 🔥', postImage: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=100' },
  { id: 4, type: 'suggestion', user: 'photography_daily', userImage: 'https://i.pravatar.cc/150?img=15', subtitle: 'Suggested for you', isFollowing: false },
  { id: 5, type: 'suggestion', user: 'travel_vibes', userImage: 'https://i.pravatar.cc/150?img=20', subtitle: 'Followed by sarah.j', isFollowing: false },
];

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const toggleFollow = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isFollowing: !n.isFollowing } : n));
  };

  const todayItems = notifications.filter(n => n.type !== 'suggestion');
  const suggestionItems = notifications.filter(n => n.type === 'suggestion');

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={{ width: 24 }} />
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#fff" /></TouchableOpacity>
          </View>

          <FlatList
            data={[{ type: 'section', key: 'today' }, ...todayItems.map(i => ({ ...i, key: `t-${i.id}` })), { type: 'section', key: 'suggestions' }, ...suggestionItems.map(i => ({ ...i, key: `s-${i.id}` }))]}
            keyExtractor={(item: any) => item.key || item.id?.toString()}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={({ item }: any) => {
              if (item.type === 'section') {
                return (
                  <View style={item.key === 'suggestions' ? styles.sectionHeaderSuggestion : styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{item.key === 'today' ? 'Today' : 'Suggested for you'}</Text>
                  </View>
                );
              }
              const n = item as Notification;
              return (
                <View style={styles.notifRow}>
                  <Image source={{ uri: n.userImage }} style={styles.avatar} />
                  <View style={styles.notifContent}>
                    <Text style={styles.notifText} numberOfLines={2}>
                      <Text style={styles.notifUser}>{n.user} </Text>
                      {n.type === 'follow' && <Text style={styles.notifBody}>started following you.</Text>}
                      {n.type === 'like' && <Text style={styles.notifBody}>liked your post.</Text>}
                      {n.type === 'comment' && <Text style={styles.notifBody}>commented: {n.content}</Text>}
                      {n.type === 'suggestion' && ''}
                      {n.time && <Text style={styles.notifTime}> {n.time}</Text>}
                    </Text>
                    {n.type === 'suggestion' && <Text style={styles.subtitleText}>{n.subtitle}</Text>}
                  </View>
                  {(n.type === 'follow' || n.type === 'suggestion') ? (
                    <TouchableOpacity
                      style={[styles.followBtn, n.isFollowing && styles.followingBtn]}
                      onPress={() => toggleFollow(n.id)}
                    >
                      <Text style={styles.followBtnText}>{n.isFollowing ? 'Following' : 'Follow'}</Text>
                    </TouchableOpacity>
                  ) : n.postImage ? (
                    <Image source={{ uri: n.postImage }} style={styles.postThumb} />
                  ) : null}
                </View>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContainer: { height: '85%', backgroundColor: '#1A1A1A', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  sectionHeaderSuggestion: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderTopWidth: 1, borderTopColor: '#374151' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#fff' },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  notifContent: { flex: 1 },
  notifText: { fontSize: 13 },
  notifUser: { fontWeight: '700', color: '#fff' },
  notifBody: { color: '#d1d5db' },
  notifTime: { color: '#6b7280' },
  subtitleText: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  followBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, backgroundColor: '#3b82f6' },
  followingBtn: { backgroundColor: '#363636' },
  followBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  postThumb: { width: 44, height: 44, borderRadius: 6 },
});
