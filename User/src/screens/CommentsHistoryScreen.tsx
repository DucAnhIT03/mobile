import React, { useState, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, FlatList,
  ActivityIndicator, RefreshControl, Alert, Dimensions,
} from 'react-native';
import { ChevronLeft, MessageCircle, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { activityApi, CommentHistoryItem } from '../api/activityApi';
import { BASE_URL } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CommentsHistoryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<CommentHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const resolveUri = (uri: string) => {
    if (!uri) return 'https://i.pravatar.cc/150';
    return uri.startsWith('http') ? uri : `${BASE_URL}${uri}`;
  };

  const loadData = async (p = 1, append = false) => {
    try {
      const res = await activityApi.getMyComments(p);
      const data = res.data;
      setItems(prev => append ? [...prev, ...data.items] : data.items);
      setTotal(data.total);
      setPage(p);
    } catch {} finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(1);
    setRefreshing(false);
  };

  const handleDelete = (commentId: number) => {
    Alert.alert('Xóa bình luận', 'Bạn muốn xóa bình luận này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try {
            await activityApi.deleteComment(commentId);
            setItems(prev => prev.filter(i => i.commentId !== commentId));
            setTotal(prev => prev - 1);
          } catch {}
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60));
    if (diffH < 1) return 'Vừa xong';
    if (diffH < 24) return `${diffH} giờ trước`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  };

  const renderItem = ({ item }: { item: CommentHistoryItem }) => {
    const post = item.post;
    if (!post) return null;
    const avatar = post.user?.avatar ? resolveUri(post.user.avatar) : 'https://i.pravatar.cc/150';
    const username = post.user?.displayName || post.user?.username || 'User';
    const media = post.media?.[0] ? resolveUri(post.media[0]) : null;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.username}>Trên bài viết của {username}</Text>
            <Text style={styles.time}>{formatDate(item.commentedAt)}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.commentId)} style={styles.deleteBtn}>
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Comment content */}
        <View style={styles.commentBox}>
          <Text style={styles.commentText}>"{item.content}"</Text>
        </View>

        {/* Post preview */}
        {media && <Image source={{ uri: media }} style={styles.postThumb} />}
        {post.caption ? <Text style={styles.caption} numberOfLines={2}>{post.caption}</Text> : null}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Bình luận ({total})</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#3b82f6" /></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.commentId.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
          onEndReached={() => { if (items.length < total) loadData(page + 1, true); }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.center}>
              <MessageCircle size={48} color="#374151" />
              <Text style={styles.emptyText}>Chưa có bình luận nào</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { padding: 8 },
  title: { fontSize: 17, fontWeight: '600', color: '#fff', marginLeft: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 15, color: '#6b7280' },
  card: { marginHorizontal: 16, marginTop: 16, backgroundColor: '#1e1e1e', borderRadius: 16, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  username: { fontSize: 14, fontWeight: '600', color: '#fff' },
  time: { fontSize: 12, color: '#6b7280' },
  deleteBtn: { padding: 8 },
  commentBox: { paddingHorizontal: 12, paddingBottom: 8 },
  commentText: { fontSize: 15, color: '#e5e7eb', fontStyle: 'italic', lineHeight: 22 },
  postThumb: { width: '100%', height: SCREEN_WIDTH * 0.4, resizeMode: 'cover' },
  caption: { fontSize: 13, color: '#9ca3af', padding: 12 },
});
