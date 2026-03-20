import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { CommentsModal } from '../../components/CommentsModal';
import { NotificationsModal } from '../../components/NotificationsModal';

const { width } = Dimensions.get('window');

const stories = [
  { id: 1, user: 'Your Story', image: 'https://i.pravatar.cc/150?img=11', isUser: true, hasStory: false },
  { id: 2, user: 'alex_chen', image: 'https://i.pravatar.cc/150?img=12', hasStory: true },
  { id: 3, user: 'sarah.j', image: 'https://i.pravatar.cc/150?img=32', hasStory: true },
  { id: 4, user: 'mike.travels', image: 'https://i.pravatar.cc/150?img=47', hasStory: true },
  { id: 5, user: 'emma_w', image: 'https://i.pravatar.cc/150?img=5', hasStory: true },
  { id: 6, user: 'david.dev', image: 'https://i.pravatar.cc/150?img=8', hasStory: true },
];

const initialPosts = [
  {
    id: 1, user: 'alex_chen', userImage: 'https://i.pravatar.cc/150?img=12', location: 'Seattle, Washington',
    image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop',
    likes: 1234, caption: 'Exploring the beautiful Pacific Northwest! 🌲✨', comments: 42, time: '2 HOURS AGO', isLiked: false, isSaved: false,
  },
  {
    id: 2, user: 'sarah.j', userImage: 'https://i.pravatar.cc/150?img=32', location: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000&auto=format&fit=crop',
    likes: 892, caption: 'Café hopping in Le Marais ☕️🥐', comments: 15, time: '5 HOURS AGO', isLiked: true, isSaved: true,
  },
];

export default function Feed() {
  const [posts, setPosts] = useState(initialPosts);
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const router = useRouter();

  const toggleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 };
      }
      return post;
    }));
  };

  const toggleSave = (postId: number) => {
    setPosts(posts.map(post => post.id === postId ? { ...post, isSaved: !post.isSaved } : post));
  };

  const renderStory = ({ item }: { item: typeof stories[0] }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => item.isUser ? router.push('/create') : router.push({ pathname: '/story-viewer', params: { id: String(item.id) } })}
    >
      <View style={[styles.storyRing, item.hasStory && styles.storyRingActive]}>
        <View style={styles.storyImageWrapper}>
          <Image source={{ uri: item.image }} style={styles.storyImage} />
          {item.isUser && (
            <View style={styles.addStoryBadge}>
              <Ionicons name="add" size={14} color="#fff" />
            </View>
          )}
        </View>
      </View>
      <Text style={styles.storyUsername} numberOfLines={1}>{item.user}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: typeof initialPosts[0] }) => (
    <View style={styles.postContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.postHeaderLeft}>
          <Image source={{ uri: item.userImage }} style={styles.postAvatar} />
          <View>
            <Text style={styles.postUsername}>{item.user}</Text>
            {item.location && <Text style={styles.postLocation}>{item.location}</Text>}
          </View>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color="#D1D5DB" />
      </View>

      {/* Post Image */}
      <Image source={{ uri: item.image }} style={styles.postImage} />

      {/* Post Actions */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={() => toggleLike(item.id)}>
            <Ionicons name={item.isLiked ? 'heart' : 'heart-outline'} size={26} color={item.isLiked ? '#EF4444' : '#fff'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveCommentPostId(item.id)}>
            <Ionicons name="chatbubble-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="paper-plane-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => toggleSave(item.id)}>
          <Ionicons name={item.isSaved ? 'bookmark' : 'bookmark-outline'} size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Likes & Caption */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>{item.likes.toLocaleString()} likes</Text>
        <Text style={styles.captionText}>
          <Text style={styles.captionUser}>{item.user}  </Text>
          {item.caption}
        </Text>
        <TouchableOpacity onPress={() => setActiveCommentPostId(item.id)}>
          <Text style={styles.viewComments}>View all {item.comments} comments</Text>
        </TouchableOpacity>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ConnectDucAnh</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setIsNotificationsOpen(true)} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <View style={styles.badge}><Text style={styles.badgeText}>5</Text></View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/chat-list' as any)} style={styles.iconBtn}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#fff" />
            <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => String(item.id)}
        renderItem={renderPost}
        ListHeaderComponent={
          <View style={styles.storiesSection}>
            <FlatList
              data={stories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => String(item.id)}
              renderItem={renderStory}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <CommentsModal isOpen={activeCommentPostId !== null} onClose={() => setActiveCommentPostId(null)} />
      <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: '#333', backgroundColor: 'rgba(0,0,0,0.95)' },
  headerTitle: { fontSize: 22, fontWeight: '600', color: '#fff', fontStyle: 'italic' },
  headerIcons: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  iconBtn: { position: 'relative' },
  badge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  storiesSection: { paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  storyItem: { alignItems: 'center', gap: 4, width: 76 },
  storyRing: { padding: 2, borderRadius: 999 },
  storyRingActive: { borderWidth: 2, borderColor: 'transparent', backgroundColor: 'transparent', borderTopColor: '#FBBF24', borderRightColor: '#EF4444', borderBottomColor: '#C026D3', borderLeftColor: '#F97316' },
  storyImageWrapper: { backgroundColor: '#000', padding: 2, borderRadius: 999, position: 'relative' },
  storyImage: { width: 64, height: 64, borderRadius: 32 },
  addStoryBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3B82F6', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#000' },
  storyUsername: { fontSize: 12, color: '#D1D5DB', textAlign: 'center', width: 72 },
  postContainer: { borderBottomWidth: 0.5, borderBottomColor: '#333', paddingBottom: 16 },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12 },
  postHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  postAvatar: { width: 32, height: 32, borderRadius: 16 },
  postUsername: { fontSize: 13, fontWeight: '600', color: '#fff' },
  postLocation: { fontSize: 11, color: '#9CA3AF' },
  postImage: { width: width, height: width, resizeMode: 'cover' },
  postActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12 },
  postActionsLeft: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  postInfo: { paddingHorizontal: 12 },
  likesText: { fontSize: 13, fontWeight: '600', color: '#fff', marginBottom: 4 },
  captionText: { fontSize: 13, color: '#fff', lineHeight: 18 },
  captionUser: { fontWeight: '600' },
  viewComments: { fontSize: 13, color: '#9CA3AF', marginTop: 6 },
  timeText: { fontSize: 10, color: '#6B7280', marginTop: 6 },
});
