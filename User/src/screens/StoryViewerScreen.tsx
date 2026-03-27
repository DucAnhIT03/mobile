import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Animated, Dimensions } from 'react-native';
import { X, MoreHorizontal, Heart, Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const storiesData = [
  { id: 2, user: 'alex_chen', avatar: 'https://i.pravatar.cc/150?img=12', image: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=1000&auto=format&fit=crop', time: '2h' },
  { id: 3, user: 'sarah.j', avatar: 'https://i.pravatar.cc/150?img=32', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1000&auto=format&fit=crop', time: '5h' },
  { id: 4, user: 'mike.travels', avatar: 'https://i.pravatar.cc/150?img=47', image: 'https://images.unsplash.com/photo-1506744626753-eda8151a7471?q=80&w=1000&auto=format&fit=crop', time: '8h' },
  { id: 5, user: 'emma_w', avatar: 'https://i.pravatar.cc/150?img=5', image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1000&auto=format&fit=crop', time: '12h' },
  { id: 6, user: 'david.dev', avatar: 'https://i.pravatar.cc/150?img=8', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop', time: '15h' },
];

export default function StoryViewerScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const id = route.params?.id;

  const initialIndex = storiesData.findIndex(s => s.id === Number(id));
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentStory = storiesData[currentIndex];

  useEffect(() => {
    progressAnim.setValue(0);
    if (isPaused) return;

    const animation = Animated.timing(progressAnim, { toValue: 1, duration: 5000, useNativeDriver: false });
    animation.start(({ finished }) => {
      if (finished) {
        if (currentIndex < storiesData.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setIsLiked(false);
        } else {
          navigation.goBack();
        }
      }
    });

    return () => animation.stop();
  }, [currentIndex, isPaused]);

  const handleNext = () => {
    if (currentIndex < storiesData.length - 1) { setCurrentIndex(prev => prev + 1); setIsLiked(false); }
    else navigation.goBack();
  };

  const handlePrev = () => {
    if (currentIndex > 0) { setCurrentIndex(prev => prev - 1); setIsLiked(false); }
  };

  if (!currentStory) return null;

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image source={{ uri: currentStory.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} locations={[0, 0.4, 1]} />

      {/* Top UI */}
      <View style={[styles.topUI, { paddingTop: insets.top + 8 }]}>
        {/* Progress Bars */}
        <View style={styles.progressRow}>
          {storiesData.map((story, idx) => (
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
            <Image source={{ uri: currentStory.avatar }} style={styles.storyAvatar} />
            <Text style={styles.storyUser}>{currentStory.user}</Text>
            <Text style={styles.storyTime}>{currentStory.time}</Text>
          </View>
          <View style={styles.userRight}>
            <TouchableOpacity><MoreHorizontal size={24} color="#fff" /></TouchableOpacity>
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

      {/* Bottom UI */}
      <View style={[styles.bottomUI, { paddingBottom: insets.bottom + 16 }]}>
        <TextInput
          style={styles.replyInput}
          placeholder={`Gửi tin nhắn cho ${currentStory.user}`}
          placeholderTextColor="rgba(255,255,255,0.8)"
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        />
        <TouchableOpacity onPress={() => setIsLiked(!isLiked)}>
          <Heart size={28} color={isLiked ? '#ef4444' : '#fff'} fill={isLiked ? '#ef4444' : 'none'} />
        </TouchableOpacity>
        <TouchableOpacity><Send size={28} color="#fff" /></TouchableOpacity>
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
  bottomUI: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, zIndex: 10 },
  replyInput: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 20, color: '#fff', fontSize: 14 },
});
