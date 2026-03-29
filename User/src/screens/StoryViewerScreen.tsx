import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { X, MoreHorizontal, Heart, Send, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { storyApi, StoryItem } from '../api/storyApi';
import { BASE_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StoryViewerScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const userId = route.params?.userId;

  const [stories, setStories] = useState<StoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOwnStory, setIsOwnStory] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const resolveUri = (uri: string) => {
    if (!uri) return 'https://i.pravatar.cc/150';
    return uri.startsWith('http') ? uri : `${BASE_URL}${uri}`;
  };

  useEffect(() => {
    const loadStories = async () => {
      try {
        // Kiểm tra có phải story của mình không
        const userStr = await AsyncStorage.getItem('user');
        let myId = 0;
        if (userStr) {
          const me = JSON.parse(userStr);
          myId = me.id || 0;
        }
        setIsOwnStory(userId === myId);

        const res = await storyApi.getUserStories(userId);
        const data = res.data || [];
        if (data.length === 0) {
          navigation.goBack();
          return;
        }
        setStories(data);
      } catch {
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    loadStories();
  }, [userId]);

  const currentStory = stories[currentIndex];

  // Auto-advance timer
  useEffect(() => {
    if (loading || stories.length === 0) return;
    progressAnim.setValue(0);
    if (isPaused) return;

    const animation = Animated.timing(progressAnim, { toValue: 1, duration: 5000, useNativeDriver: false });
    animation.start(({ finished }) => {
      if (finished) {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsLiked(false);
        } else {
          navigation.goBack();
        }
      }
    });

    return () => animation.stop();
  }, [currentIndex, isPaused, loading, stories.length]);

  // Mark as viewed khi hiển thị story
  useEffect(() => {
    if (!currentStory || isOwnStory) return;
    if (!currentStory.isViewed) {
      storyApi.markViewed(currentStory.id).catch(() => {});
    }
  }, [currentIndex, currentStory?.id]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsLiked(false);
    } else {
      navigation.goBack();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsLiked(false);
    }
  };

  const handleDelete = async () => {
    if (!currentStory) return;
    try {
      await storyApi.deleteStory(currentStory.id);
      const remaining = stories.filter((_, i) => i !== currentIndex);
      if (remaining.length === 0) {
        navigation.goBack();
      } else {
        setStories(remaining);
        setCurrentIndex(Math.min(currentIndex, remaining.length - 1));
      }
    } catch {}
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return 'Vừa xong';
    return `${diffH}h`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!currentStory) return null;

  const avatar = currentStory.user?.avatar ? resolveUri(currentStory.user.avatar) : 'https://i.pravatar.cc/150';
  const username = currentStory.user?.displayName || currentStory.user?.username || 'User';
  const mediaUri = resolveUri(currentStory.mediaUrl);

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image source={{ uri: mediaUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} locations={[0, 0.4, 1]} />

      {/* Top UI */}
      <View style={[styles.topUI, { paddingTop: insets.top + 8 }]}>
        {/* Progress Bars */}
        <View style={styles.progressRow}>
          {stories.map((story, idx) => (
            <View key={story.id} style={styles.progressBarBg}>
              {idx < currentIndex ? (
                <View style={[styles.progressBarFill, { width: '100%' }]} />
              ) : idx === currentIndex ? (
                <Animated.View style={[styles.progressBarFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
              ) : null}
            </View>
          ))}
        </View>

        {/* User Info */}
        <View style={styles.userRow}>
          <View style={styles.userLeft}>
            <Image source={{ uri: avatar }} style={styles.storyAvatar} />
            <Text style={styles.storyUser}>{username}</Text>
            <Text style={styles.storyTime}>{formatTime(currentStory.createdAt)}</Text>
          </View>
          <View style={styles.userRight}>
            {isOwnStory && (
              <TouchableOpacity onPress={handleDelete}>
                <Trash2 size={22} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => navigation.goBack()}><X size={28} color="#fff" /></TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tap Areas */}
      <View style={styles.tapAreas}>
        <TouchableWithoutFeedback onPress={handlePrev} onPressIn={() => setIsPaused(true)} onPressOut={() => setIsPaused(false)}>
          <View style={styles.tapLeft} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={handleNext} onPressIn={() => setIsPaused(true)} onPressOut={() => setIsPaused(false)}>
          <View style={styles.tapRight} />
        </TouchableWithoutFeedback>
      </View>

      {/* Caption */}
      {currentStory.caption ? (
        <View style={styles.captionOverlay}>
          <Text style={styles.captionText}>{currentStory.caption}</Text>
        </View>
      ) : null}

      {/* Bottom UI */}
      <View style={[styles.bottomUI, { paddingBottom: insets.bottom + 16 }]}>
        {!isOwnStory ? (
          <>
            <TextInput
              style={styles.replyInput}
              placeholder={`Gửi tin nhắn cho ${username}`}
              placeholderTextColor="rgba(255,255,255,0.8)"
              onFocus={() => setIsPaused(true)}
              onBlur={() => setIsPaused(false)}
            />
            <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
              <Heart size={28} color={isLiked ? '#ef4444' : '#fff'} fill={isLiked ? '#ef4444' : 'none'} />
            </TouchableOpacity>
            <TouchableOpacity><Send size={28} color="#fff" /></TouchableOpacity>
          </>
        ) : (
          <View style={styles.viewersRow}>
            <Text style={styles.viewersText}>Story của bạn</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topUI: { zIndex: 10, paddingHorizontal: 16 },
  progressRow: { flexDirection: 'row', gap: 4, marginBottom: 12 },
  progressBarBg: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 1 },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  storyAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  storyUser: { fontSize: 14, fontWeight: '600', color: '#fff' },
  storyTime: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  userRight: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  tapAreas: { flex: 1, flexDirection: 'row', zIndex: 10 },
  tapLeft: { flex: 1 },
  tapRight: { flex: 2 },
  captionOverlay: { position: 'absolute', bottom: 100, left: 16, right: 16, zIndex: 10 },
  captionText: { fontSize: 16, color: '#fff', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  bottomUI: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, zIndex: 10 },
  replyInput: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 20, color: '#fff', fontSize: 14 },
  viewersRow: { flex: 1, alignItems: 'center' },
  viewersText: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
});
