import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

const storiesData = [
  { id: 2, user: 'alex_chen', avatar: 'https://i.pravatar.cc/150?img=12', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop', time: '2h' },
  { id: 3, user: 'sarah.j', avatar: 'https://i.pravatar.cc/150?img=32', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000&auto=format&fit=crop', time: '5h' },
  { id: 4, user: 'mike.travels', avatar: 'https://i.pravatar.cc/150?img=47', image: 'https://images.unsplash.com/photo-1506744626753-eda8151a7471?q=80&w=1000&auto=format&fit=crop', time: '8h' },
  { id: 5, user: 'emma_w', avatar: 'https://i.pravatar.cc/150?img=5', image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&auto=format&fit=crop', time: '12h' },
  { id: 6, user: 'david.dev', avatar: 'https://i.pravatar.cc/150?img=8', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop', time: '15h' },
];

export default function StoryViewer() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const initialIndex = storiesData.findIndex(s => s.id === Number(id));
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const currentStory = storiesData[currentIndex];

  useEffect(() => {
    progressAnim.setValue(0);
    if (isPaused) return;

    animRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000,
      useNativeDriver: false,
    });

    animRef.current.start(({ finished }) => {
      if (finished) {
        if (currentIndex < storiesData.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsLiked(false);
        } else {
          router.back();
        }
      }
    });

    return () => { animRef.current?.stop(); };
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    if (currentIndex < storiesData.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsLiked(false);
    } else {
      router.back();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsLiked(false);
    }
  };

  if (!currentStory) return null;

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image source={{ uri: currentStory.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={styles.gradientOverlay} />

      {/* Top UI */}
      <View style={styles.topUI}>
        {/* Progress Bars */}
        <View style={styles.progressRow}>
          {storiesData.map((story, idx) => (
            <View key={story.id} style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: idx === currentIndex
                      ? progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                      : idx < currentIndex ? '100%' : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* User Info */}
        <View style={styles.userRow}>
          <View style={styles.userInfo}>
            <Image source={{ uri: currentStory.avatar }} style={styles.userAvatar} />
            <Text style={styles.userName}>{currentStory.user}</Text>
            <Text style={styles.timeText}>{currentStory.time}</Text>
          </View>
          <View style={styles.userActions}>
            <TouchableOpacity><Ionicons name="ellipsis-horizontal" size={24} color="#fff" /></TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()}><Ionicons name="close" size={28} color="#fff" /></TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tap Areas */}
      <View style={styles.tapAreas}>
        <TouchableOpacity
          style={styles.tapLeft}
          onPress={handlePrev}
          onPressIn={() => setIsPaused(true)}
          onPressOut={() => setIsPaused(false)}
          activeOpacity={1}
        />
        <TouchableOpacity
          style={styles.tapRight}
          onPress={handleNext}
          onPressIn={() => setIsPaused(true)}
          onPressOut={() => setIsPaused(false)}
          activeOpacity={1}
        />
      </View>

      {/* Bottom UI */}
      <View style={styles.bottomUI}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.replyInput}
            placeholder={`Gửi tin nhắn cho ${currentStory.user}`}
            placeholderTextColor="rgba(255,255,255,0.8)"
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
          />
        </View>
        <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={28} color={isLiked ? '#EF4444' : '#fff'} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="paper-plane-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gradientOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  topUI: { paddingTop: 56, paddingHorizontal: 16, zIndex: 10, gap: 12 },
  progressRow: { flexDirection: 'row', gap: 4 },
  progressTrack: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 1, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 1 },
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.2)' },
  userName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  timeText: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  userActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tapAreas: { flex: 1, flexDirection: 'row', zIndex: 10 },
  tapLeft: { width: '33%', height: '100%' },
  tapRight: { width: '67%', height: '100%' },
  bottomUI: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, paddingBottom: 32, zIndex: 10 },
  inputWrapper: { flex: 1 },
  replyInput: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 20, color: '#fff', fontSize: 14 },
});
