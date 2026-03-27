import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable, StyleSheet, FlatList, Dimensions, ViewToken, useWindowDimensions, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import { Heart, MessageCircle, Share2, Music, MoreHorizontal, Plus, Volume2, VolumeX, Play } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { CommentsModal } from '../components/CommentsModal';
import { Video, ResizeMode } from 'expo-av';
import { postApi, PostItem } from '../api/postApi';
import { BASE_URL } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ReelItem extends PostItem {
  isLiked: boolean;
}

export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const isFocused = useIsFocused();
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [activeCommentReelId, setActiveCommentReelId] = useState<number | null>(null);
  const [containerHeight, setContainerHeight] = useState(windowHeight);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pauseIconOpacity = useRef(new Animated.Value(0)).current;
  const REEL_HEIGHT = containerHeight;

  const resolveUri = (uri: string) => {
    if (!uri) return '';
    return uri.startsWith('http') ? uri : `${BASE_URL}${uri}`;
  };

  const loadReels = async () => {
    try {
      const res = await postApi.getReels();
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
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReels();
    }, [])
  );

  // Reset pause state when returning to the screen
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
      // Revert
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
    setIsPaused(prev => !prev);
    pauseIconOpacity.setValue(1);
    Animated.timing(pauseIconOpacity, {
      toValue: 0,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveReelIndex(viewableItems[0].index);
      setIsPaused(false);
    }
  }, []);

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

    return (
      <View style={[styles.reelContainer, { height: REEL_HEIGHT }]}>
        {/* Video */}
        {videoUri ? (
          <Video
            source={{ uri: videoUri }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            shouldPlay={index === activeReelIndex && isFocused && !isPaused}
            isLooping
            isMuted={isMuted}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#6b7280' }}>Không thể tải video</Text>
          </View>
        )}

        {/* Tap overlay to pause/play */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleTapVideo}>
          <Animated.View style={[styles.pauseIconContainer, { opacity: pauseIconOpacity }]}>
            <View style={styles.pauseIconBg}>
              <Play size={40} color="#fff" fill="#fff" />
            </View>
          </Animated.View>
        </Pressable>

        {/* Right Actions */}
        <View style={styles.rightActions}>
          <View style={styles.reelAvatarContainer}>
            <Image source={{ uri: userAvatar }} style={styles.reelAvatar} />
            <View style={styles.followBadge}><Plus size={12} color="#fff" /></View>
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
        <View style={styles.bottomInfo}>
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" colors={['#3b82f6']} />
          }
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <Play size={48} color="#374151" />
          <Text style={{ color: '#6b7280', fontSize: 16 }}>Chưa có video Short nào</Text>
          <Text style={{ color: '#4b5563', fontSize: 14 }}>Hãy đăng video đầu tiên!</Text>
        </View>
      )}

      <CommentsModal
        isOpen={activeCommentReelId !== null}
        onClose={() => setActiveCommentReelId(null)}
        postId={activeCommentReelId ?? undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  headerOverlay: { position: 'absolute', left: 16, right: 16, zIndex: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  muteBtn: { padding: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20 },
  reelContainer: { width: SCREEN_WIDTH, backgroundColor: '#000', position: 'relative' },
  rightActions: { position: 'absolute', right: 16, bottom: 80, alignItems: 'center', gap: 24, zIndex: 10 },
  reelAvatarContainer: { position: 'relative', marginBottom: 8 },
  reelAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#fff' },
  followBadge: { position: 'absolute', bottom: -8, alignSelf: 'center', width: 20, height: 20, borderRadius: 10, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, fontWeight: '500', color: '#fff' },
  bottomInfo: { position: 'absolute', left: 16, bottom: 24, right: 80, zIndex: 10 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  reelUser: { fontSize: 15, fontWeight: '600', color: '#fff' },
  reelDescription: { fontSize: 14, color: '#fff', lineHeight: 20, marginBottom: 12 },
  musicRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12, alignSelf: 'flex-start' },
  musicText: { fontSize: 12, fontWeight: '500', color: '#fff', maxWidth: 150 },
  pauseIconContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  pauseIconBg: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
});
