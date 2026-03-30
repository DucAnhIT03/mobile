import React, { useState, useCallback, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions, RefreshControl, ActivityIndicator, Share } from 'react-native';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Plus, Bell, Play, Volume2, VolumeX } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { CommentsModal } from '../components/CommentsModal';
import { NotificationsModal } from '../components/NotificationsModal';
import { LinearGradient } from 'expo-linear-gradient';
import { postApi, PostItem } from '../api/postApi';
import { storyApi, StoryUser } from '../api/storyApi';
import { BASE_URL } from '../services/api';
import VideoPlayerItem from '../components/VideoPlayerItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatApi } from '../api/chatApi';
import { notificationApi } from '../api/notificationApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeedPost extends PostItem {
  isLiked: boolean;
  isSaved: boolean;
}

interface StoryCircle {
  id: number;
  user: string;
  image: string;
  isUser: boolean;
  hasStory: boolean;
  userId: number;
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
  const [storyCircles, setStoryCircles] = useState<StoryCircle[]>([]);
  const [currentUserAvatar, setCurrentUserAvatar] = useState('https://i.pravatar.cc/150');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  // Watch time tracking per video post
  const videoWatchStart = useRef<Record<number, number>>({});

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const ids = viewableItems.map((v: any) => v.item?.id).filter(Boolean);
    const newVisible = new Set(ids);
    const prevVisible = Object.keys(videoWatchStart.current).map(Number);

    // Send interaction for videos that scrolled out of view
    for (const id of prevVisible) {
      if (!newVisible.has(id)) {
        const watchTimeMs = Date.now() - (videoWatchStart.current[id] || Date.now());
        delete videoWatchStart.current[id];
        if (watchTimeMs > 500) {
          postApi.trackInteraction({
            postId: id,
            action: watchTimeMs < 2000 ? 'skip' : 'view',
            watchTimeMs,
            videoDurationMs: 30000,
          }).catch(() => {});
        }
      }
    }

    // Start tracking newly visible video posts
    for (const id of ids) {
      if (!videoWatchStart.current[id]) {
        videoWatchStart.current[id] = Date.now();
      }
    }

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

  const loadStories = async () => {
    try {
      // Lấy avatar current user
      const userStr = await AsyncStorage.getItem('user');
      let myAvatar = 'https://i.pravatar.cc/150';
      let myId = 0;
      if (userStr) {
        const me = JSON.parse(userStr);
        myAvatar = me.avatar || myAvatar;
        myId = me.id || 0;
        setCurrentUserAvatar(myAvatar);
      }

      const res = await storyApi.getStories();
      const users = res.data.users || [];

      // Tạo danh sách circle
      const circles: StoryCircle[] = [];

      // "Your Story" — nút thêm story, LUÔN hiện ở đầu
      circles.push({
        id: -1,
        user: 'Your Story',
        image: myAvatar,
        isUser: true,
        hasStory: false,
        userId: myId,
      });

      // Nếu user đã có story → thêm circle riêng để xem story của mình
      const myStories = users.find(u => u.userId === myId);
      if (myStories && myStories.stories.length > 0) {
        // Dùng ảnh media của story đầu tiên làm thumbnail
        const firstStoryMedia = myStories.stories[0]?.mediaUrl;
        circles.push({
          id: myId,
          user: 'Story của bạn',
          image: firstStoryMedia ? resolveUri(firstStoryMedia) : myAvatar,
          isUser: false,
          hasStory: true,
          userId: myId,
        });
      }

      // Các user khác — dùng ảnh media story đầu tiên làm thumbnail
      for (const u of users) {
        if (u.userId === myId) continue;
        const firstMedia = u.stories[0]?.mediaUrl;
        circles.push({
          id: u.userId,
          user: u.displayName || u.username,
          image: firstMedia ? resolveUri(firstMedia) : (u.avatar ? resolveUri(u.avatar) : 'https://i.pravatar.cc/150'),
          isUser: false,
          hasStory: u.hasUnviewed,
          userId: u.userId,
        });
      }

      setStoryCircles(circles);
    } catch {
      // Fallback: chỉ hiện "Your Story"
      setStoryCircles([{ id: -1, user: 'Your Story', image: 'https://i.pravatar.cc/150', isUser: true, hasStory: false, userId: 0 }]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFeed();
      loadStories();
      // Load unread message count
      chatApi.getConversations()
        .then(res => {
          const total = (res.data || []).reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setUnreadMessages(total);
        })
        .catch(() => {});
      // Load unread notification count
      notificationApi.getUnreadCount()
        .then(res => setUnreadNotifs(res.data.count || 0))
        .catch(() => {});
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFeed(), loadStories()]);
    setRefreshing(false);
  };

  const toggleLike = async (postId: number) => {
    // Track like interaction for recommendation
    postApi.trackInteraction({ postId, action: 'like' }).catch(() => {});

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

  const toggleSave = async (postId: number) => {
    // Optimistic update
    setPosts(posts.map(post => post.id === postId ? { ...post, isSaved: !post.isSaved } : post));
    try {
      const res = await postApi.toggleBookmark(postId);
      setPosts(prev => prev.map(post => post.id === postId ? { ...post, isSaved: res.data.saved } : post));
    } catch {
      // Revert
      setPosts(prev => prev.map(post => post.id === postId ? { ...post, isSaved: !post.isSaved } : post));
    }
  };

  const handleShare = async (post: FeedPost) => {
    try {
      const userName = post.user?.displayName || post.user?.username || 'User';
      await Share.share({
        message: `${userName}: ${post.caption || ''} - Xem trên ConnectDucAnh`,
        title: 'Chia sẻ bài viết',
      });
      // Track share interaction
      if (post.type === 'video') {
        postApi.trackInteraction({ postId: post.id, action: 'share' }).catch(() => {});
      }
    } catch {}
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

  const renderStory = ({ item: story }: { item: StoryCircle }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => {
        if (story.isUser) {
          // Nút "Your Story" → luôn mở tạo story mới
          navigation.navigate('CreateStory');
        } else {
          navigation.navigate('StoryViewer', { userId: story.userId });
        }
      }}
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
            <VideoPlayerItem
              uri={postImage}
              style={styles.postImage}
              shouldPlay={isFocused && visiblePostIds.includes(post.id)}
              isMuted={isMuted || !isFocused || !visiblePostIds.includes(post.id)}
              isLooping={true}
              contentFit="contain"
              nativeControls={false}
              onMuteToggle={() => setIsMuted(!isMuted)}
            />
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
            <TouchableOpacity onPress={() => handleShare(post)}><Send size={24} color="#fff" /></TouchableOpacity>
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
            {unreadNotifs > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{unreadNotifs > 99 ? '99+' : unreadNotifs}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ChatList')} style={styles.iconBtn}>
            <MessageCircle size={24} color="#fff" />
            {unreadMessages > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{unreadMessages > 99 ? '99+' : unreadMessages}</Text></View>
            )}
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
              data={storyCircles}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => `story-${item.id}`}
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
