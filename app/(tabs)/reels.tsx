import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Dimensions, ViewToken } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Colors } from '../../constants/theme';
import { CommentsModal } from '../../components/CommentsModal';

const { height, width } = Dimensions.get('window');

const REELS_DATA = [
  { id: 1, video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', user: 'travel_diaries', description: 'Beautiful sunset at the beach 🌅 #nature #sunset #travel', music: 'Original Audio - travel_diaries', likes: '1.2M', comments: '4,231', shares: '12K', avatar: 'https://i.pravatar.cc/150?img=32', isLiked: false },
  { id: 2, video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', user: 'tech_guru', description: 'Testing the new drone! 🚁 #tech #drone #gadgets', music: 'Trending Song - Artist', likes: '890K', comments: '1,023', shares: '5K', avatar: 'https://i.pravatar.cc/150?img=11', isLiked: true },
  { id: 3, video: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', user: 'foodie_adventures', description: 'Making the perfect pasta 🍝 #food #cooking #pasta', music: 'Italian Cooking Music', likes: '2.5M', comments: '12K', shares: '45K', avatar: 'https://i.pravatar.cc/150?img=47', isLiked: false },
];

function ReelItem({ item, isActive, onLike, onComment }: {
  item: typeof REELS_DATA[0];
  isActive: boolean;
  onLike: () => void;
  onComment: () => void;
}) {
  const player = useVideoPlayer(item.video, (p) => {
    p.loop = true;
  });

  React.useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  return (
    <View style={[styles.reelContainer, { height }]}>
      {/* Video Player */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
      <View style={styles.gradientBottom} />
      <View style={styles.gradientTop} />

      {/* Right Actions */}
      <View style={styles.rightActions}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.reelAvatar} />
          <View style={styles.followBadge}><Ionicons name="add" size={12} color="#fff" /></View>
        </View>

        <TouchableOpacity onPress={onLike} style={styles.actionBtn}>
          <Ionicons name={item.isLiked ? 'heart' : 'heart-outline'} size={28} color={item.isLiked ? '#EF4444' : '#fff'} />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onComment} style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={28} color="#fff" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={28} color="#fff" />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="ellipsis-horizontal" size={28} color="#fff" />
        </TouchableOpacity>

        <Image source={{ uri: item.avatar }} style={styles.musicThumb} />
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <View style={styles.userRow}>
          <Text style={styles.reelUsername}>{item.user}</Text>
          <TouchableOpacity style={styles.followPill}>
            <Text style={styles.followText}>Follow</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.reelDescription} numberOfLines={2}>{item.description}</Text>
        <View style={styles.musicRow}>
          <Ionicons name="musical-notes" size={14} color="#fff" />
          <Text style={styles.musicText} numberOfLines={1}>{item.music}</Text>
        </View>
      </View>
    </View>
  );
}

export default function Reels() {
  const [reels, setReels] = useState(REELS_DATA);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [activeCommentReelId, setActiveCommentReelId] = useState<number | null>(null);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveReelIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const toggleLike = (id: number) => {
    setReels(reels.map(reel => reel.id === id ? { ...reel, isLiked: !reel.isLiked } : reel));
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reels</Text>
      </View>

      <FlatList
        data={reels}
        keyExtractor={item => String(item.id)}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={height}
        decelerationRate="fast"
        renderItem={({ item, index }) => (
          <ReelItem
            item={item}
            isActive={index === activeReelIndex}
            onLike={() => toggleLike(item.id)}
            onComment={() => setActiveCommentReelId(item.id)}
          />
        )}
      />

      <CommentsModal isOpen={activeCommentReelId !== null} onClose={() => setActiveCommentReelId(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 56, paddingHorizontal: 16, zIndex: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  reelContainer: { width, position: 'relative', backgroundColor: '#000' },
  rightActions: { position: 'absolute', right: 16, bottom: 120, alignItems: 'center', gap: 24, zIndex: 10 },
  avatarContainer: { position: 'relative', marginBottom: 8 },
  reelAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#fff' },
  followBadge: { position: 'absolute', bottom: -6, left: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, fontWeight: '500', color: '#fff' },
  musicThumb: { width: 40, height: 40, borderRadius: 8, borderWidth: 2, borderColor: '#fff', marginTop: 8 },
  bottomInfo: { position: 'absolute', left: 16, bottom: 80, right: 80, zIndex: 10 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  reelUsername: { fontSize: 15, fontWeight: '600', color: '#fff' },
  followPill: { paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: '#fff', borderRadius: 6 },
  followText: { fontSize: 12, fontWeight: '500', color: '#fff' },
  reelDescription: { fontSize: 14, color: '#fff', lineHeight: 20, marginBottom: 12 },
  musicRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start' },
  musicText: { fontSize: 12, fontWeight: '500', color: '#fff', maxWidth: 150 },
  gradientBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '33%', backgroundColor: 'rgba(0,0,0,0.5)' },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 96, backgroundColor: 'rgba(0,0,0,0.3)' },
});
