import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, TouchableWithoutFeedback, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useVideoPlayer, VideoView, VideoContentFit } from 'expo-video';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

interface Props {
  uri: string;
  style?: any;
  shouldPlay?: boolean;
  isMuted?: boolean;
  isLooping?: boolean;
  contentFit?: VideoContentFit;
  nativeControls?: boolean;
  onMuteToggle?: () => void;
}

/** Reusable video player component using expo-video with custom tap-to-show controls */
export default function VideoPlayerItem({
  uri,
  style,
  shouldPlay = false,
  isMuted = false,
  isLooping = true,
  contentFit = 'contain',
  nativeControls = false,
  onMuteToggle,
}: Props) {
  const [showControls, setShowControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(shouldPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const controlsOpacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const player = useVideoPlayer(uri, (p) => {
    p.loop = isLooping;
    p.muted = isMuted;
    if (shouldPlay) {
      p.play();
    }
  });

  // Sync shouldPlay
  useEffect(() => {
    if (shouldPlay) {
      player.play();
      setIsPlaying(true);
    } else {
      player.pause();
      setIsPlaying(false);
    }
  }, [shouldPlay]);

  // Sync muted
  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted]);

  // Sync loop
  useEffect(() => {
    player.loop = isLooping;
  }, [isLooping]);

  // Poll thời gian hiện tại khi đang phát
  useEffect(() => {
    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = setInterval(() => {
      if (!isSeeking) {
        try {
          setCurrentTime(player.currentTime || 0);
          setDuration(player.duration || 0);
        } catch {}
      }
    }, 250);
    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  }, [isSeeking]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  const startHideTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setShowControls(false);
      Animated.timing(controlsOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }, 3000);
  }, []);

  const handleTap = useCallback(() => {
    if (showControls) {
      // Ẩn controls
      setShowControls(false);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      Animated.timing(controlsOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    } else {
      // Hiện controls
      setShowControls(true);
      Animated.timing(controlsOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      startHideTimer();
    }
  }, [showControls, startHideTimer]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
    startHideTimer();
  }, [isPlaying, startHideTimer]);

  const handleSeek = useCallback((value: number) => {
    setIsSeeking(false);
    player.currentTime = value;
    setCurrentTime(value);
    startHideTimer();
  }, [startHideTimer]);

  const handleReplay = useCallback(() => {
    player.currentTime = 0;
    player.play();
    setIsPlaying(true);
    startHideTimer();
  }, [startHideTimer]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Nếu dùng native controls (ví dụ ở Reels) thì không cần custom overlay
  if (nativeControls) {
    return (
      <VideoView
        style={style || styles.video}
        player={player}
        contentFit={contentFit}
        nativeControls={true}
      />
    );
  }

  return (
    <View style={[style || styles.video, { overflow: 'hidden' }]}>
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit={contentFit}
        nativeControls={false}
      />

      {/* Vùng tap */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>

      {/* Overlay controls */}
      <Animated.View style={[styles.controlsOverlay, { opacity: controlsOpacity }]} pointerEvents={showControls ? 'auto' : 'none'}>
        {/* Center play/pause */}
        <TouchableOpacity style={styles.centerBtn} onPress={handlePlayPause}>
          {isPlaying ? (
            <Pause size={36} color="#fff" fill="#fff" />
          ) : (
            <Play size={36} color="#fff" fill="#fff" />
          )}
        </TouchableOpacity>

        {/* Replay */}
        <TouchableOpacity style={styles.replayBtn} onPress={handleReplay}>
          <RotateCcw size={20} color="#fff" />
        </TouchableOpacity>

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={currentTime}
            onSlidingStart={() => { setIsSeeking(true); if (hideTimer.current) clearTimeout(hideTimer.current); }}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor="#3b82f6"
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbTintColor="#3b82f6"
          />
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
          {onMuteToggle && (
            <TouchableOpacity onPress={onMuteToggle} style={styles.muteControl}>
              {isMuted ? <VolumeX size={18} color="#fff" /> : <Volume2 size={18} color="#fff" />}
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  video: { width: '100%', height: '100%' },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  replayBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
    paddingTop: 4,
  },
  slider: { flex: 1, marginHorizontal: 4, height: 20 },
  timeText: { fontSize: 11, color: '#fff', fontVariant: ['tabular-nums'] },
  muteControl: { marginLeft: 8 },
});
