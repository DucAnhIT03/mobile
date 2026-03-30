import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable, StyleSheet, FlatList, Dimensions, ViewToken, useWindowDimensions, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import { Heart, MessageCircle, Share2, Music, MoreHorizontal, Plus, Volume2, VolumeX, Play } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useFocusEffect, useNavigation } from '@react-navigation/native';
import { CommentsModal } from '../components/CommentsModal';
import VideoPlayerItem from '../components/VideoPlayerItem';
import { postApi, PostItem } from '../api/postApi';
import { userApi } from '../api/userApi';
import { BASE_URL } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ReelItem extends PostItem {
  isLiked: boolean;
}

export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [activeCommentReelId, setActiveCommentReelId] = useState<number | null>(null);
  const [containerHeight, setContainerHeight] = useState(windowHeight);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [followedUsers, setFollowedUsers] = useState<Set<number>>(new Set());
  const pauseIconOpacity = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const lastTap = useRef<number>(0);
  const REEL_HEIGHT = containerHeight;

  // Watch time tracking
  const watchStartTime = useRef<number>(0);
  const prevReelIndex = useRef<number>(0);
  const interactionCount = useRef<number>(0);
  const isRefreshingFeed = useRef<boolean>(false);

  const resolveUri = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('http') ? uri : `${BASE_URL}${uri}`;
  };

  const loadReels = async () => {
    try {
      const res = await postApi.getRecommendedFeed(1, 20);
      const posts = res.data.posts || [];
      const enriched: ReelItem[] = await Promise.all(
        posts.map(async (p) => {
          let isLiked = false;
          try {
            const likeRes = await postApi.isLiked(p.id);
            isLiked = likeRes.data.liked;
          } catch {}
          return { ...p, isLiked };
        })
      );
      setReels(enriched);
    } catch {
      try {
        const res = await postApi.getReels();
        const posts = res.data.posts || [];
        const enriched: ReelItem[] = posts.map(p => ({ ...p, isLiked: false }));
        setReels(enriched);
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sau khi user like hoặc xem lâu → re-fetch đề xuất mới
   * Thay thế các video CHƯA XEM (sau vị trí hiện tại) bằng video mới được ranking lại
   * → Video tiếp theo sẽ phù hợp với sở thích hiện tại của user
   */
  const refreshUpcomingReels = async () => {
    if (isRefreshingFeed.current) return;
    isRefreshingFeed.current = true;
    try {
      const res = await postApi.getRecommendedFeed(1, 30);
      const newPosts = res.data.posts || [];
      if (newPosts.length === 0) return;

      setReels(prev => {
        // Giữ lại video đã xem (từ đầu đến vị trí hiện tại +1)
        const keepCount = activeReelIndex + 2;
        const watched = prev.slice(0, keepCount);
        const watchedIds = new Set(watched.map(r => r.id));

        // Lọc video mới (chưa có trong list đã xem)
        const fresh = newPosts
          .filter(p => !watchedIds.has(p.id))
          .map(p => ({ ...p, isLiked: false } as ReelItem));

        return [...watched, ...fresh];
      });
    } catch {
      // Silent fail
    } finally {
      isRefreshingFeed.current = false;
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReels();
    }, [])
  );

  useEffect(() => {
    if (isFocused) {
      setIsPaused(false);
    }
  }, [isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReels();
    setRefreshing(false);
  };

  const toggleLike = async (postId: number) => {
    // Track like interaction → re-fetch đề xuất realtime
    postApi.trackInteraction({ postId, action: 'like' }).then(() => {
      interactionCount.current += 1;
      refreshUpcomingReels();
    }).catch(() => {});

    // Optimistic update
    setReels(prev =>
      prev.map(reel =>
        reel.id === postId
          ? { ...reel, isLiked: !reel.isLiked, likesCount: reel.isLiked ? reel.likesCount - 1 : reel.likesCount + 1 }
          : reel
      )
    );
    try {
      const res = await postApi.toggleLike(postId);
      setReels(prev =>
        prev.map(reel =>
          reel.id === postId
            ? { ...reel, isLiked: res.data.liked, likesCount: res.data.likesCount }
            : reel
        )
      );
    } catch {
      setReels(prev =>
        prev.map(reel =>
          reel.id === postId
            ? { ...reel, isLiked: !reel.isLiked, likesCount: reel.isLiked ? reel.likesCount - 1 : reel.likesCount + 1 }
            : reel
        )
      );
    }
  };

  const handleTapVideo = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // === DOUBLE TAP → LIKE ===
      const currentReel = reels[activeReelIndex];
      if (currentReel && !currentReel.isLiked) {
        toggleLike(currentReel.id);
      }
      // Heart animation
      setShowHeart(true);
      heartScale.setValue(0);
      Animated.sequence([
        Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, friction: 3 }),
        Animated.timing(heartScale, { toValue: 0, duration: 400, delay: 300, useNativeDriver: true }),
      ]).start(() => setShowHeart(false));
      lastTap.current = 0;
    } else {
      // === SINGLE TAP → PAUSE/RESUME ===
      lastTap.current = now;
      setTimeout(() => {
        if (lastTap.current === now) {
          setIsPaused(prev => !prev);
          pauseIconOpacity.setValue(1);
          Animated.timing(pauseIconOpacity, {
            toValue: 0,
            duration: 600,
            delay: 300,
            useNativeDriver: true,
          }).start();
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  /** Track watch time → re-fetch khi xem lâu hoặc sau vài tương tác */
  const sendWatchInteraction = (reelIndex: number) => {
    if (reels.length === 0 || reelIndex >= reels.length) return;
    const reel = reels[reelIndex];
    const watchTimeMs = Date.now() - watchStartTime.current;
    if (watchTimeMs < 200) return;

    const action = watchTimeMs < 2000 ? 'skip' : 'view';
    postApi.trackInteraction({
      postId: reel.id,
      action,
      watchTimeMs,
      videoDurationMs: 15000,
    }).then(() => {
      interactionCount.current += 1;
      // Re-fetch sau mỗi 2 lần tương tác hoặc khi xem lâu > 5s
      if (watchTimeMs > 5000 || interactionCount.current % 2 === 0) {
        refreshUpcomingReels();
      }
    }).catch(() => {});
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      const newIndex = viewableItems[0].index;
      if (prevReelIndex.current !== newIndex) {
        sendWatchInteraction(prevReelIndex.current);
      }
      prevReelIndex.current = newIndex;
      setActiveReelIndex(newIndex);
      setIsPaused(false);
      watchStartTime.current = Date.now();
    }
  }, [reels]);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const renderReel = ({ item: reel, index }: { item: ReelItem; index: number }) => {
    const videoUri = reel.media?.[0] ? resolveUri(reel.media[0]) : '';
    const userAvatar = reel.user?.avatar ? resolveUri(reel.user.avatar) : 'https://i.pravatar.cc/150';
    const userName = reel.user?.displayName || reel.user?.username || 'User';
    const isNearActive = Math.abs(index - activeReelIndex) <= 1;

    return (
      <View style={[styles.reelContainer, { height: REEL_HEIGHT }]}>
        {/* Video — chỉ render khi gần reel đang xem để tiết kiệm bộ nhớ */}
        {videoUri && isNearActive ? (
          <VideoPlayerItem
            uri={videoUri}
            style={StyleSheet.absoluteFill}
            shouldPlay={index === activeReelIndex && isFocused && !isPaused}
            isMuted={isMuted}
            isLooping={true}
            contentFit="cover"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }]}>
            <Play size={48} color="#555" fill="#555" />
          </View>
        )}

        {/* Tap overlay — single tap = pause, double tap = like */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleTapVideo}>
          {/* Pause icon animation */}
          <Animated.View style={[styles.pauseIconContainer, { opacity: pauseIconOpacity }]}>
            <View style={styles.pauseIconBg}>
              <Play size={40} color="#fff" fill="#fff" />
            </View>
          </Animated.View>
          {/* Double-tap heart animation */}
          {showHeart && (
            <Animated.View style={[styles.pauseIconContainer, { transform: [{ scale: heartScale }] }]}>
              <Heart size={80} color="#ef4444" fill="#ef4444" />
            </Animated.View>
          )}
        </Pressable>

        {/* Right Actions */}
        <View style={styles.rightActions} pointerEvents="box-none">
          <View style={styles.reelAvatarContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (reel.user) {
                  navigation.navigate('UserProfile', {
                    userId: reel.user.id,
                    username: reel.user.username,
                    avatar: reel.user.avatar,
                    isOnline: false,
                  });
                }
              }}
            >
              <Image source={{ uri: userAvatar }} style={styles.reelAvatar} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.followBadge, followedUsers.has(reel.user?.id || 0) && styles.followedBadge]}
              onPress={async () => {
                if (!reel.user) return;
                const uid = reel.user.id;
                try {
                  if (followedUsers.has(uid)) {
                    await userApi.unfollow(uid);
                    setFollowedUsers(prev => { const s = new Set(prev); s.delete(uid); return s; });
                  } else {
                    await userApi.follow(uid);
                    setFollowedUsers(prev => new Set(prev).add(uid));
                  }
                } catch {}
              }}
            >
              {followedUsers.has(reel.user?.id || 0)
                ? <Text style={styles.followedText}>✓</Text>
                : <Plus size={12} color="#fff" />
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => toggleLike(reel.id)} style={styles.actionBtn}>
            <Heart size={28} color={reel.isLiked ? '#ef4444' : '#fff'} fill={reel.isLiked ? '#ef4444' : 'none'} />
            <Text style={styles.actionText}>{formatCount(reel.likesCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveCommentReelId(reel.id)} style={styles.actionBtn}>
            <MessageCircle size={28} color="#fff" />
            <Text style={styles.actionText}>{formatCount(reel.commentsCount)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Share2 size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <MoreHorizontal size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo} pointerEvents="box-none">
          <View style={styles.userRow}>
            <Text style={styles.reelUser}>{userName}</Text>
          </View>
          {reel.caption ? (
            <Text style={styles.reelDescription} numberOfLines={2}>{reel.caption}</Text>
          ) : null}
          <View style={styles.musicRow}>
            <Music size={14} color="#fff" />
            <Text style={styles.musicText} numberOfLines={1}>Original Audio - {userName}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
      {/* Title + Volume */}
      <View style={[styles.headerOverlay, { top: insets.top }]}>
        <Text style={styles.headerTitle}>Reels</Text>
        <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.muteBtn}>
          {isMuted ? <VolumeX size={22} color="#fff" /> : <Volume2 size={22} color="#fff" />}
        </TouchableOpacity>
      </View>

      {reels.length > 0 ? (
        <FlatList
          data={reels}
          keyExtractor={item => item.id.toString()}
          renderItem={renderReel}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({ length: REEL_HEIGHT, offset: REEL_HEIGHT * index, index })}
          windowSize={3}
          maxToRenderPerBatch={2}
          removeClippedSubviews={true}
          initialNumToRender={2}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" colors={['#3b82f6']} />
          }
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <Play size={48} color="#374151" />
          <Text style={{ color: '#6b7280', fontSize: 16 }}>Chưa có video Short nào</Text>
        </View>
      )}

      {activeCommentReelId !== null && (
        <CommentsModal
          postId={activeCommentReelId}
          isOpen={true}
          onClose={() => setActiveCommentReelId(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  headerOverlay: {
    position: 'absolute', left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  muteBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20,
    padding: 8,
  },
  reelContainer: { width: SCREEN_WIDTH, backgroundColor: '#000' },
  rightActions: {
    position: 'absolute', right: 12, bottom: 120,
    alignItems: 'center', gap: 16,
  },
  reelAvatarContainer: { alignItems: 'center', marginBottom: 8 },
  reelAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#fff' },
  followBadge: {
    position: 'absolute', bottom: -6,
    backgroundColor: '#ef4444', borderRadius: 10, padding: 2,
  },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  bottomInfo: {
    position: 'absolute', bottom: 20, left: 12, right: 80,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  reelUser: { color: '#fff', fontSize: 15, fontWeight: '700' },
  reelDescription: { color: '#e5e7eb', fontSize: 13, marginBottom: 6, lineHeight: 18 },
  musicRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  musicText: { color: '#d1d5db', fontSize: 13 },
  pauseIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
  },
  pauseIconBg: {
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 40,
    padding: 16,
  },
  followedBadge: {
    backgroundColor: '#22c55e',
  },
  followedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
