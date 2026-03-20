import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

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

  const todayNotifications = notifications.filter(n => n.type !== 'suggestion');
  const suggestions = notifications.filter(n => n.type === 'suggestion');

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={{ width: 24 }} />
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            {/* Today */}
            <Text style={styles.sectionTitle}>Today</Text>
            <View style={{ gap: 16, marginBottom: 24 }}>
              {todayNotifications.map(n => (
                <View key={n.id} style={styles.notifRow}>
                  <Image source={{ uri: n.userImage }} style={styles.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifText}>
                      <Text style={{ fontWeight: '600' }}>{n.user} </Text>
                      {n.type === 'follow' && 'started following you.'}
                      {n.type === 'like' && 'liked your post.'}
                      {n.type === 'comment' && `commented: ${n.content}`}
                      <Text style={{ color: '#6B7280' }}> {n.time}</Text>
                    </Text>
                  </View>
                  {n.type === 'follow' ? (
                    <TouchableOpacity onPress={() => toggleFollow(n.id)} style={[styles.followBtn, n.isFollowing && styles.followingBtn]}>
                      <Text style={styles.followBtnText}>{n.isFollowing ? 'Following' : 'Follow'}</Text>
                    </TouchableOpacity>
                  ) : (
                    n.postImage && <Image source={{ uri: n.postImage }} style={styles.postThumb} />
                  )}
                </View>
              ))}
            </View>

            {/* Suggestions */}
            <View style={{ borderTopWidth: 0.5, borderTopColor: '#333', paddingTop: 16 }}>
              <Text style={styles.sectionTitle}>Suggested for you</Text>
              <View style={{ gap: 16 }}>
                {suggestions.map(n => (
                  <View key={n.id} style={styles.notifRow}>
                    <Image source={{ uri: n.userImage }} style={styles.avatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', color: '#fff', fontSize: 13 }}>{n.user}</Text>
                      <Text style={{ color: '#6B7280', fontSize: 13 }}>{n.subtitle}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleFollow(n.id)} style={[styles.followBtn, n.isFollowing && styles.followingBtn]}>
                      <Text style={styles.followBtnText}>{n.isFollowing ? 'Following' : 'Follow'}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContainer: { height: '85%', backgroundColor: Colors.surfaceLight, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 16 },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  notifText: { fontSize: 13, color: '#D1D5DB', lineHeight: 18 },
  postThumb: { width: 44, height: 44, borderRadius: 6 },
  followBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8, backgroundColor: '#3B82F6' },
  followingBtn: { backgroundColor: '#363636' },
  followBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
