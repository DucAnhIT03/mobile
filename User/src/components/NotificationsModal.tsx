import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Modal, ActivityIndicator } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { notificationApi, NotificationItem } from '../api/notificationApi';
import { BASE_URL } from '../services/api';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const resolveUri = (uri: string) => {
    if (!uri) return 'https://i.pravatar.cc/150';
    return uri.startsWith('http') ? uri : `${BASE_URL}${uri}`;
  };

  const loadNotifications = async () => {
    try {
      const res = await notificationApi.getNotifications();
      setNotifications(res.data.items || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins}p`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}w`;
  };

  const getNotifMessage = (n: NotificationItem) => {
    switch (n.type) {
      case 'follow': return 'đã theo dõi bạn.';
      case 'like': return 'đã thích bài viết của bạn.';
      case 'comment': return `đã bình luận: ${n.content || ''}`;
      case 'mention': return `đã nhắc đến bạn: ${n.content || ''}`;
      case 'system': return n.content || 'Thông báo hệ thống';
      default: return '';
    }
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <View style={[styles.notifRow, !item.isRead && styles.unreadRow]}>
      <Image
        source={{ uri: item.actor?.avatar ? resolveUri(item.actor.avatar) : 'https://i.pravatar.cc/150' }}
        style={styles.avatar}
      />
      <View style={styles.notifContent}>
        <Text style={styles.notifText} numberOfLines={2}>
          <Text style={styles.notifUser}>{item.actor?.displayName || item.actor?.username || 'Hệ thống'} </Text>
          <Text style={styles.notifBody}>{getNotifMessage(item)}</Text>
        </Text>
        <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </View>
  );

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={{ width: 24 }} />
            <Text style={styles.headerTitle}>Thông báo</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#fff" /></TouchableOpacity>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
              <Check size={16} color="#3b82f6" />
              <Text style={styles.markAllText}>Đánh dấu tất cả đã đọc ({unreadCount})</Text>
            </TouchableOpacity>
          )}

          {loading ? (
            <View style={styles.center}><ActivityIndicator size="large" color="#3b82f6" /></View>
          ) : notifications.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={item => item.id.toString()}
              renderItem={renderNotification}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContainer: { height: '85%', backgroundColor: '#1A1A1A', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2A2A2A',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  markAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#2A2A2A',
  },
  markAllText: { fontSize: 13, color: '#3b82f6', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#6b7280' },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  unreadRow: { backgroundColor: 'rgba(59,130,246,0.08)' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2A2A2A' },
  notifContent: { flex: 1 },
  notifText: { fontSize: 13, lineHeight: 18 },
  notifUser: { fontWeight: '700', color: '#fff' },
  notifBody: { color: '#d1d5db' },
  notifTime: { fontSize: 12, color: '#6b7280', marginTop: 3 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' },
});
