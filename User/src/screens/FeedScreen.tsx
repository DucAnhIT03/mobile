import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions, RefreshControl, ActivityIndicator } from 'react-native';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Plus, Bell, Play, Volume2, VolumeX } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { CommentsModal } from '../components/CommentsModal';
import { NotificationsModal } from '../components/NotificationsModal';
import { LinearGradient } from 'expo-linear-gradient';
import { postApi, PostItem } from '../api/postApi';
import { BASE_URL } from '../services/api';
import { Video, ResizeMode } from 'expo-av';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const stories = [
  { id: 1, user: 'Your Story', image: 'https://i.pravatar.cc/150?img=11', isUser: true, hasStory: false },
  { id: 2, user: 'alex_chen', image: 'https://i.pravatar.cc/150?img=12', hasStory: true },
  { id: 3, user: 'sarah.j', image: 'https://i.pravatar.cc/150?img=32', hasStory: true },
  { id: 4, user: 'mike.travels', image: 'https://i.pravatar.cc/150?img=47', hasStory: true },
  { id: 5, user: 'emma_w', image: 'https://i.pravatar.cc/150?img=5', hasStory: true },
  { id: 6, user: 'david.dev', image: 'https://i.pravatar.cc/150?img=8', hasStory: true },
];

interface FeedPost extends PostItem {
  isLiked: boolean;
  isSaved: boolean;
}

export default function FeedScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [visiblePostIds, setVisiblePostIds] = useState<number[]>([]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const ids = viewableItems.map((v: any) => v.item?.id).filter(Boolean);
    setVisiblePostIds(ids);
  }).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const resolveUri = (uri: string) => {
    if (!uri) return 'https://i.pravatar.cc/150';
    return uri.startsWith('http') ? uri : `${BASE_URL}${uri}`;
  };

  const loadFeed = async () => {
    try {
      const res = await postApi.getFeed();
      const feedPosts = res.data.posts || [];

      // Check liked status for each post
      const enriched: FeedPost[] = await Promise.all(
        feedPosts.map(async (p) => {
          let isLiked = false;
          try {
            const likeRes = await postApi.isLiked(p.id);
            isLiked = likeRes.data.liked;
          } catch {}
          return { ...p, isLiked, isSaved: false };
        })
      );

      setPosts(enriched);
    } catch {
      // Silently fail, posts will remain empty
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const toggleLike = async (postId: number) => {
    // Optimistic update
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1 }
          : post
      )
    );

    try {
      const res = await postApi.toggleLike(postId);
      // Sync with server response
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, isLiked: res.data.liked, likesCount: res.data.likesCount }
            : post
        )
      );
    } catch {
      // Revert on error
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, isLiked: !post.isLiked, likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1 }
            : post
        )
      );
    }
  };

  const toggleSave = (postId: number) => {
    setPosts(posts.map(post => post.id === postId ? { ...post, isSaved: !post.isSaved } : post));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'VỪA XONG';
    if (diffHours < 24) return `${diffHours} GIỜ TRƯỚC`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} NGÀY TRƯỚC`;
    return date.toLocaleDateString('vi-VN').toUpperCase();
  };

  const renderStory = ({ item: story }: any) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => story.isUser ? navigation.navigate('Create') : navigation.navigate('StoryViewer', { id: story.id.toString() })}
    >
      {story.hasStory ? (
        <LinearGradient colors={['#fbbf24', '#ef4444', '#d946ef']} style={styles.storyRing} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.storyRingInner}>
            <Image source={{ uri: story.image }} style={styles.storyAvatar} />
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.storyNoRing}>
          <Image source={{ uri: story.image }} style={styles.storyAvatar} />
          {story.isUser && (
            <View style={styles.storyAddIcon}>
              <Plus size={14} color="#fff" />
            </View>
          )}
        </View>
      )}
      <Text style={styles.storyUser} numberOfLines={1}>{story.user}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item: post }: { item: FeedPost }) => {
    const userAvatar = post.user?.avatar ? resolveUri(post.user.avatar) : 'https://i.pravatar.cc/150';
    const userName = post.user?.displayName || post.user?.username || 'User';
    const postImage = post.media?.[0] ? resolveUri(post.media[0]) : 'https://via.placeholder.com/400';

    return (
      <View style={styles.postContainer}>
        {/* Post Header */}
        <TouchableOpacity
          style={styles.postHeader}
          onPress={() => post.user && navigation.navigate('UserProfile', {
            userId: post.user.id,
            username: post.user.username,
            avatar: post.user.avatar,
            isOnline: false,
          })}
        >
          <View style={styles.postHeaderLeft}>
            <Image source={{ uri: userAvatar }} style={styles.postAvatar} />
            <View>
              <Text style={styles.postUserName}>{userName}</Text>
            </View>
          </View>
          <MoreHorizontal size={20} color="#d1d5db" />
        </TouchableOpacity>

        {/* Post Media */}
        {post.type === 'video' ? (
          <View style={{ position: 'relative', backgroundColor: '#000' }}>
            <Video
              source={{ uri: postImage }}
              style={styles.postImage}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={isFocused && visiblePostIds.includes(post.id)}
              isLooping
              isMuted={isMuted || !isFocused || !visiblePostIds.includes(post.id)}
            />
            <TouchableOpacity
              style={styles.muteBtn}
              onPress={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX size={18} color="#fff" /> : <Volume2 size={18} color="#fff" />}
            </TouchableOpacity>
          </View>
        ) : (
          <Image source={{ uri: postImage }} style={styles.postImage} />
        )}

        {/* Post Actions */}
        <View style={styles.postActions}>
          <View style={styles.postActionsLeft}>
            <TouchableOpacity onPress={() => toggleLike(post.id)}>
              <Heart size={24} color={post.isLiked ? '#ef4444' : '#fff'} fill={post.isLiked ? '#ef4444' : 'none'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveCommentPostId(post.id)}>
              <MessageCircle size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity><Send size={24} color="#fff" /></TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => toggleSave(post.id)}>
            <Bookmark size={24} color="#fff" fill={post.isSaved ? '#fff' : 'none'} />
          </TouchableOpacity>
        </View>

        {/* Likes & Caption */}
        <View style={styles.postInfo}>
          <Text style={styles.likesText}>{post.likesCount.toLocaleString()} likes</Text>
          <Text style={styles.captionText}>
            <Text style={styles.captionUser}>{userName}  </Text>
            {post.caption}
          </Text>
          <TouchableOpacity onPress={() => setActiveCommentPostId(post.id)}>
            <Text style={styles.commentsLink}>View all {post.commentsCount} comments</Text>
          </TouchableOpacity>
          <Text style={styles.timeText}>{formatDate(post.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ConnectDucAnh</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setIsNotificationsOpen(true)} style={styles.iconBtn}>
            <Bell size={24} color="#fff" />
            <View style={styles.badge}><Text style={styles.badgeText}>5</Text></View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ChatList')} style={styles.iconBtn}>
            <MessageCircle size={24} color="#fff" />
            <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <FlatList
              data={stories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.storiesList}
              renderItem={renderStory}
              style={styles.storiesContainer}
            />
          }
          renderItem={renderPost}
          contentContainerStyle={{ paddingBottom: 80 }}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" colors={['#3b82f6']} />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ color: '#6b7280', fontSize: 16 }}>Chưa có bài viết nào</Text>
              <Text style={{ color: '#4b5563', fontSize: 14, marginTop: 4 }}>Hãy tạo bài viết đầu tiên!</Text>
            </View>
          }
        />
      )}

      <CommentsModal
        isOpen={activeCommentPostId !== null}
        onClose={() => setActiveCommentPostId(null)}
        postId={activeCommentPostId ?? undefined}
        onCommentAdded={() => {
          // Update comment count locally
          if (activeCommentPostId !== null) {
            setPosts(prev => prev.map(p =>
              p.id === activeCommentPostId
                ? { ...p, commentsCount: p.commentsCount + 1 }
                : p
            ));
          }
        }}
      />
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  headerTitle: { fontSize: 24, fontWeight: '600', color: '#fff', fontStyle: 'italic' },
  headerIcons: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  iconBtn: { position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  storiesContainer: { borderBottomWidth: 1, borderBottomColor: '#1f2937' },
  storiesList: { paddingHorizontal: 16, paddingVertical: 12, gap: 16 },
  storyItem: { alignItems: 'center', gap: 4, width: 72 },
  storyRing: { width: 72, height: 72, borderRadius: 36, padding: 2, alignItems: 'center', justifyContent: 'center' },
  storyRingInner: { backgroundColor: '#000', borderRadius: 34, padding: 2 },
  storyNoRing: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  storyAvatar: { width: 68, height: 68, borderRadius: 34 },
  storyAddIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3b82f6', borderRadius: 10, padding: 2, borderWidth: 2, borderColor: '#000' },
  storyUser: { fontSize: 12, color: '#d1d5db', textAlign: 'center', width: 72 },
  postContainer: { borderBottomWidth: 1, borderBottomColor: '#1f2937', paddingBottom: 16 },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12 },
  postHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  postAvatar: { width: 32, height: 32, borderRadius: 16 },
  postUserName: { fontSize: 13, fontWeight: '600', color: '#fff' },
  postLocation: { fontSize: 11, color: '#9ca3af' },
  postImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH, resizeMode: 'cover' },
  postActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12 },
  postActionsLeft: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  postInfo: { paddingHorizontal: 12 },
  likesText: { fontSize: 13, fontWeight: '600', color: '#fff', marginBottom: 4 },
  captionText: { fontSize: 13, color: '#fff', lineHeight: 18 },
  captionUser: { fontWeight: '600' },
  commentsLink: { fontSize: 13, color: '#9ca3af', marginTop: 6 },
  timeText: { fontSize: 10, color: '#6b7280', marginTop: 6 },
  videoPlayOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  videoPlayBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  muteBtn: { position: 'absolute', bottom: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
});
