import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable, StyleSheet, FlatList, Dimensions, ViewToken, useWindowDimensions, Animated, ActivityIndicator, RefreshControl, AppState, AppStateStatus } from 'react-native';
import { Heart, MessageCircle, Share2, Music, MoreHorizontal, Plus, Volume2, VolumeX, Play } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useFocusEffect, useNavigation } from '@react-navigation/native';
import { CommentsModal } from '../components/CommentsModal';
import VideoPlayerItem from '../components/VideoPlayerItem';
import VideoThumbnailItem from '../components/VideoThumbnailItem';
import { postApi, PostItem } from '../api/postApi';
import { userApi } from '../api/userApi';
import { BASE_URL } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * CHỈ 1 VIDEO PLAYER TẠI MỘT THỜI ĐIỂM.
 * Video trước/sau chỉ hiện thumbnail tĩnh → tiết kiệm 90% RAM.
 */
const MAX_REELS_IN_MEMORY = 50;

interface ReelItem extends PostItem {
  isLiked: boolean;
}

/** Component render 1 reel — dùng key={reel.id + isActive} để force unmount player khi chuyển video */
const ReelItemRenderer = React.memo(({
  reel,
  index,
  activeIndex,
  isFocused,
  isPaused,
  isMuted,
  onTapVideo,
  onLike,
  onComment,
  onFollow,
  onNavigateProfile,
  isFollowed,
  showHeart,
  heartScale,
  pauseIconOpacity,
  reelHeight,
  videoProgress,
  showProgressBar,
  videoDuration,
  onProgress,
}: {
  reel: ReelItem;
  index: number;
  activeIndex: number;
  isFocused: boolean;
  isPaused: boolean;
  isMuted: boolean;
  onTapVideo: () => void;
  onLike: (id: number) => void;
  onComment: (id: number) => void;
  onFollow: (userId: number) => void;
  onNavigateProfile: (user: any) => void;
  isFollowed: boolean;
  showHeart: boolean;
  heartScale: Animated.Value;
  pauseIconOpacity: Animated.Value;
  reelHeight: number;
  videoProgress: number;
  showProgressBar: boolean;
  videoDuration: number;
  onProgress: (pos: number, dur: number) => void;
}) => {
  const resolveUri = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('http') ? uri : `${BASE_URL}${uri}`;
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const videoUri = reel.media?.[0] ? resolveUri(reel.media[0]) : '';
  const userAvatar = reel.user?.avatar ? resolveUri(reel.user.avatar) : 'https://i.pravatar.cc/150';
  const userName = reel.user?.displayName || reel.user?.username || 'User';
  const isActive = index === activeIndex;

  return (
    <View style={[styles.reelContainer, { height: reelHeight }]}>
      {/* 
        CHỈ render VideoPlayerItem cho video ĐANG ACTIVE.
        Các video khác hiện thumbnail tĩnh (Image) → 0 MB RAM cho decoder.
      */}
      {videoUri && isActive ? (
        <VideoPlayerItem
          uri={videoUri}
          style={StyleSheet.absoluteFill}
          shouldPlay={isFocused && !isPaused}
          isMuted={isMuted}
          isLooping={true}
          contentFit="cover"
          onProgress={onProgress}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
          {videoUri ? (
            <VideoThumbnailItem
              videoUri={videoUri}
              thumbnailUri={reel.thumbnail}
              style={[StyleSheet.absoluteFill, { resizeMode: 'cover' }]}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }]}>
              <Play size={48} color="#555" fill="#555" />
            </View>
          )}
        </View>
      )}

      {/* Tap overlay */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onTapVideo}>
        {isActive && (
          <>
            <Animated.View style={[styles.pauseIconContainer, { opacity: pauseIconOpacity }]}>
              <View style={styles.pauseIconBg}>
                <Play size={40} color="#fff" fill="#fff" />
              </View>
            </Animated.View>
            {showHeart && (
              <Animated.View style={[styles.pauseIconContainer, { transform: [{ scale: heartScale }] }]}>
                <Heart size={80} color="#ef4444" fill="#ef4444" />
              </Animated.View>
            )}
          </>
        )}
      </Pressable>

      {/* Progress bar mỏng luôn hiện ở dưới */}
      {isActive && (
        <View style={styles.progressBarContainer} pointerEvents="none">
          <View style={[styles.progressBarFill, { width: `${Math.min(videoProgress * 100, 100)}%` }]} />
        </View>
      )}

      {/* Progress bar chi tiết khi tap */}
      {isActive && showProgressBar && videoDuration > 0 && (
        <View style={styles.detailedProgressOverlay} pointerEvents="none">
          <View style={styles.detailedProgressBg}>
            <View style={[styles.detailedProgressFill, { width: `${Math.min(videoProgress * 100, 100)}%` }]} />
          </View>
        </View>
      )}

      {/* Right Actions */}
      <View style={styles.rightActions} pointerEvents="box-none">
        <View style={styles.reelAvatarContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => reel.user && onNavigateProfile(reel.user)}
          >
            <Image source={{ uri: userAvatar }} style={styles.reelAvatar} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.followBadge, isFollowed && styles.followedBadge]}
            onPress={() => reel.user && onFollow(reel.user.id)}
          >
            {isFollowed
              ? <Text style={styles.followedText}>✓</Text>
              : <Plus size={12} color="#fff" />
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => onLike(reel.id)} style={styles.actionBtn}>
          <Heart size={28} color={reel.isLiked ? '#ef4444' : '#fff'} fill={reel.isLiked ? '#ef4444' : 'none'} />
          <Text style={styles.actionText}>{formatCount(reel.likesCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onComment(reel.id)} style={styles.actionBtn}>
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
}, (prev, next) => {
  // Chỉ re-render khi:
  // 1. Active state thay đổi (active ↔ inactive)
  // 2. Like state thay đổi
  // 3. Play/Mute state thay đổi cho active item
  const prevIsActive = prev.index === prev.activeIndex;
  const nextIsActive = next.index === next.activeIndex;

  if (prevIsActive !== nextIsActive) return false; // Active state changed
  if (prev.reel.isLiked !== next.reel.isLiked) return false;
  if (prev.isFollowed !== next.isFollowed) return false;

  if (nextIsActive) {
    // Active item cần re-render khi play/mute/progress thay đổi
    if (prev.isPaused !== next.isPaused) return false;
    if (prev.isMuted !== next.isMuted) return false;
    if (prev.isFocused !== next.isFocused) return false;
    if (prev.showHeart !== next.showHeart) return false;
    if (prev.showProgressBar !== next.showProgressBar) return false;
    if (Math.abs(prev.videoProgress - next.videoProgress) > 0.01) return false;
  }

  return true; // Không cần re-render
});

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
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const pauseIconOpacity = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const lastTap = useRef<number>(0);
  const REEL_HEIGHT = containerHeight;
  const flatListRef = useRef<FlatList>(null);
  const progressHideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Watch time tracking
  const watchStartTime = useRef<number>(0);
  const prevReelIndex = useRef<number>(0);
  const interactionCount = useRef<number>(0);
  const isRefreshingFeed = useRef<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadReels = async () => {
    try {
      // Lấy TẤT CẢ video reels từ hệ thống
      const res = await postApi.getReels(1);
      const allPosts = res.data.posts || [];
      const total = res.data.total || 0;

      // Enrich với like status
      const enriched: ReelItem[] = await Promise.all(
        allPosts.map(async (p) => {
          let isLiked = false;
          try {
            const likeRes = await postApi.isLiked(p.id);
            isLiked = likeRes.data.liked;
          } catch {}
          return { ...p, isLiked };
        })
      );

      setReels(enriched);
      setCurrentPage(1);
      setHasMore(enriched.length < total);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  /** Load thêm video khi scroll đến cuối */
  const loadMoreReels = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await postApi.getReels(nextPage);
      const newPosts = res.data.posts || [];
      const total = res.data.total || 0;

      if (newPosts.length === 0) {
        setHasMore(false);
        return;
      }

      const enriched: ReelItem[] = await Promise.all(
        newPosts.map(async (p) => {
          let isLiked = false;
          try {
            const likeRes = await postApi.isLiked(p.id);
            isLiked = likeRes.data.liked;
          } catch {}
          return { ...p, isLiked };
        })
      );

      setReels(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const unique = enriched.filter(r => !existingIds.has(r.id));
        return [...prev, ...unique];
      });
      setCurrentPage(nextPage);
      setHasMore(reels.length + enriched.length < total);
    } catch {} finally {
      setLoadingMore(false);
    }
  };

  const refreshUpcomingReels = async () => {
    // Chỉ track interaction, không thay đổi list
  };

  useFocusEffect(
    useCallback(() => {
      loadReels();
    }, [])
  );

  useEffect(() => {
    if (isFocused) setIsPaused(false);
  }, [isFocused]);

  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        setIsPaused(true);
      } else if (state === 'active' && isFocused) {
        setIsPaused(false);
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    setActiveReelIndex(0);
    await loadReels();
    setRefreshing(false);
  };

  const toggleLike = useCallback(async (postId: number) => {
    postApi.trackInteraction({ postId, action: 'like' }).catch(() => {});

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
  }, []);

  const handleTapVideo = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      const currentReel = reels[activeReelIndex];
      if (currentReel && !currentReel.isLiked) {
        toggleLike(currentReel.id);
      }
      setShowHeart(true);
      heartScale.setValue(0);
      Animated.sequence([
        Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, friction: 3 }),
        Animated.timing(heartScale, { toValue: 0, duration: 400, delay: 300, useNativeDriver: true }),
      ]).start(() => setShowHeart(false));
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      setTimeout(() => {
        if (lastTap.current === now) {
          setIsPaused(prev => !prev);
          pauseIconOpacity.setValue(1);
          Animated.timing(pauseIconOpacity, { toValue: 0, duration: 600, delay: 300, useNativeDriver: true }).start();

          setShowProgressBar(true);
          if (progressHideTimeout.current) clearTimeout(progressHideTimeout.current);
          progressHideTimeout.current = setTimeout(() => setShowProgressBar(false), 4000);
        }
      }, DOUBLE_TAP_DELAY);
    }
  }, [reels, activeReelIndex, toggleLike]);

  const sendWatchInteraction = useCallback((reelIndex: number) => {
    if (reels.length === 0 || reelIndex >= reels.length) return;
    const reel = reels[reelIndex];
    const watchTimeMs = Date.now() - watchStartTime.current;
    if (watchTimeMs < 200) return;

    postApi.trackInteraction({
      postId: reel.id,
      action: watchTimeMs < 2000 ? 'skip' : 'view',
      watchTimeMs,
      videoDurationMs: 15000,
    }).catch(() => {});
  }, [reels]);

  const handleProgress = useCallback((pos: number, dur: number) => {
    setVideoProgress(dur > 0 ? pos / dur : 0);
    setVideoDuration(dur);
  }, []);

  const handleFollow = useCallback(async (userId: number) => {
    try {
      if (followedUsers.has(userId)) {
        await userApi.unfollow(userId);
        setFollowedUsers(prev => { const s = new Set(prev); s.delete(userId); return s; });
      } else {
        await userApi.follow(userId);
        setFollowedUsers(prev => new Set(prev).add(userId));
      }
    } catch {}
  }, [followedUsers]);

  const handleNavigateProfile = useCallback((user: any) => {
    navigation.navigate('UserProfile', {
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      isOnline: false,
    });
  }, [navigation]);

  const handleComment = useCallback((id: number) => {
    setActiveCommentReelId(id);
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      const newIndex = viewableItems[0].index;
      if (prevReelIndex.current !== newIndex) {
        sendWatchInteraction(prevReelIndex.current);
      }
      prevReelIndex.current = newIndex;
      setActiveReelIndex(newIndex);
      setIsPaused(false);
      setVideoProgress(0);
      setShowProgressBar(false);
      watchStartTime.current = Date.now();
    }
  }, [sendWatchInteraction]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const renderReel = useCallback(({ item: reel, index }: { item: ReelItem; index: number }) => {
    return (
      <ReelItemRenderer
        reel={reel}
        index={index}
        activeIndex={activeReelIndex}
        isFocused={isFocused}
        isPaused={isPaused}
        isMuted={isMuted}
        onTapVideo={handleTapVideo}
        onLike={toggleLike}
        onComment={handleComment}
        onFollow={handleFollow}
        onNavigateProfile={handleNavigateProfile}
        isFollowed={followedUsers.has(reel.user?.id || 0)}
        showHeart={showHeart}
        heartScale={heartScale}
        pauseIconOpacity={pauseIconOpacity}
        reelHeight={REEL_HEIGHT}
        videoProgress={videoProgress}
        showProgressBar={showProgressBar}
        videoDuration={videoDuration}
        onProgress={handleProgress}
      />
    );
  }, [activeReelIndex, isFocused, isPaused, isMuted, showHeart, followedUsers, videoProgress, showProgressBar, videoDuration, handleTapVideo, toggleLike, handleFollow, handleNavigateProfile, handleComment, handleProgress]);

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
          ref={flatListRef}
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
          // === TỐI ƯU BỘ NHỚ CỰC ĐẠI ===
          windowSize={3}
          maxToRenderPerBatch={1}
          removeClippedSubviews={true}
          initialNumToRender={1}
          updateCellsBatchingPeriod={150}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" colors={['#3b82f6']} />
          }
          onEndReached={loadMoreReels}
          onEndReachedThreshold={2}
          ListFooterComponent={loadingMore ? (
            <View style={{ height: 60, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#3b82f6" />
            </View>
          ) : null}
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
  // Progress bar mỏng luôn hiện
  progressBarContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2, backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressBarFill: {
    height: '100%', backgroundColor: '#fff',
  },
  // Progress bar chi tiết khi tap
  detailedProgressOverlay: {
    position: 'absolute', bottom: 6, left: 12, right: 12,
  },
  detailedProgressBg: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2, overflow: 'hidden',
  },
  detailedProgressFill: {
    height: '100%', backgroundColor: '#fff',
    borderRadius: 2,
  },
});
