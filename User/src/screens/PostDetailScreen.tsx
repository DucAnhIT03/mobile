import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { ChevronLeft, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL } from '../services/api';
import { CommentsModal } from '../components/CommentsModal';
import { postApi } from '../api/postApi';
import VideoPlayerItem from '../components/VideoPlayerItem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PostDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const post = route.params?.post;
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likesCount ?? 0);
  const [commentsCount, setCommentsCount] = useState(post?.commentsCount ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Kiểm tra trạng thái like từ API khi mount
  useEffect(() => {
    if (post?.id) {
      postApi.isLiked(post.id)
        .then(res => setIsLiked(res.data.liked))
        .catch(() => {});
    }
  }, [post?.id]);

  if (!post) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 100 }}>Bài viết không tồn tại</Text>
      </View>
    );
  }

  const resolveUri = (uri: string) => {
    if (!uri) return 'https://i.pravatar.cc/150';
    return uri.startsWith('http') ? uri : `${BASE_URL}${uri}`;
  };

  const toggleLike = async () => {
    // Optimistic update
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      const res = await postApi.toggleLike(post.id);
      setIsLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
    } catch {
      // Revert on error
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const userAvatar = post.user?.avatar ? resolveUri(post.user.avatar) : 'https://i.pravatar.cc/150';
  const userName = post.user?.displayName || post.user?.username || 'User';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài viết</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.postHeaderLeft}>
            <Image source={{ uri: userAvatar }} style={styles.postAvatar} />
            <View>
              <Text style={styles.postUserName}>{userName}</Text>
            </View>
          </View>
          <TouchableOpacity><MoreHorizontal size={20} color="#d1d5db" /></TouchableOpacity>
        </View>

        {/* Post Media */}
        {post.media && post.media.length > 0 && (
          post.type === 'video' ? (
            <VideoPlayerItem
              uri={resolveUri(post.media[0])}
              style={styles.postImage}
              shouldPlay={true}
              isLooping={true}
              contentFit="contain"
              nativeControls={true}
            />
          ) : (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setActiveImageIndex(idx);
              }}
            >
              {post.media.map((mediaUri: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: resolveUri(mediaUri) }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          )
        )}

        {/* Image indicators */}
        {post.media && post.media.length > 1 && (
          <View style={styles.indicators}>
            {post.media.map((_: string, index: number) => (
              <View key={index} style={[styles.dot, index === activeImageIndex && styles.dotActive]} />
            ))}
          </View>
        )}

        {/* Post Actions */}
        <View style={styles.postActions}>
          <View style={styles.postActionsLeft}>
            <TouchableOpacity onPress={toggleLike}>
              <Heart size={26} color={isLiked ? '#ef4444' : '#fff'} fill={isLiked ? '#ef4444' : 'none'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowComments(true)}>
              <MessageCircle size={26} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Send size={26} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => setIsSaved(!isSaved)}>
            <Bookmark size={26} color="#fff" fill={isSaved ? '#fff' : 'none'} />
          </TouchableOpacity>
        </View>

        {/* Likes */}
        <View style={styles.postInfo}>
          <Text style={styles.likesText}>{likesCount.toLocaleString()} lượt thích</Text>
          {post.caption ? (
            <Text style={styles.captionText}>
              <Text style={styles.captionUser}>{userName}  </Text>
              {post.caption}
            </Text>
          ) : null}
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Text style={styles.commentsLink}>Xem {commentsCount} bình luận</Text>
          </TouchableOpacity>
          <Text style={styles.timeText}>{formatDate(post.createdAt)}</Text>
        </View>
      </ScrollView>

      <CommentsModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postId={post.id}
        onCommentAdded={() => setCommentsCount((prev: number) => prev + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  postHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 12,
  },
  postHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  postUserName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  postImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH, resizeMode: 'cover' },
  indicators: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4b5563' },
  dotActive: { backgroundColor: '#3b82f6', width: 8, height: 8, borderRadius: 4 },
  postActions: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
  },
  postActionsLeft: { flexDirection: 'row', gap: 18, alignItems: 'center' },
  postInfo: { paddingHorizontal: 14 },
  likesText: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 6 },
  captionText: { fontSize: 14, color: '#fff', lineHeight: 20 },
  captionUser: { fontWeight: '700' },
  commentsLink: { fontSize: 14, color: '#9ca3af', marginTop: 8 },
  timeText: { fontSize: 11, color: '#6b7280', marginTop: 8, textTransform: 'uppercase' },
});
