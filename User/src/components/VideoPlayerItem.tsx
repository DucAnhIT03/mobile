import React, { useEffect, useState, useCallback, useRef, memo } from 'react';
import {
  View, TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  AppState, AppStateStatus, Platform,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { AlertTriangle, RotateCcw, Volume2, VolumeX } from 'lucide-react-native';

type ContentFit = 'contain' | 'cover' | 'fill';

interface Props {
  uri: string;
  style?: any;
  shouldPlay?: boolean;
  isMuted?: boolean;
  isLooping?: boolean;
  contentFit?: ContentFit;
  nativeControls?: boolean;
  onMuteToggle?: () => void;
  onProgress?: (position: number, duration: number) => void;
}

/**
 * Video player tối ưu bộ nhớ:
 * - Dùng expo-video useVideoPlayer
 * - Tự động pause + giải phóng tài nguyên khi không hiển thị
 * - Poll progress nhẹ (500ms thay vì 250ms)
 * - Volume luôn = 1.0 để đảm bảo có âm thanh
 */
function VideoPlayerItemBase({
  uri,
  style,
  shouldPlay = false,
  isMuted = false,
  isLooping = true,
  contentFit = 'contain',
  nativeControls = false,
  onMuteToggle,
  onProgress,
}: Props) {
  const [hasError, setHasError] = useState(false);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  const player = useVideoPlayer(uri, (p) => {
    p.loop = isLooping;
    p.muted = isMuted;
    p.volume = 1.0;
    // KHÔNG tự play ở đây — để useEffect quản lý
  });

  // Lắng nghe status thay đổi
  const { status, error } = useEvent(player, 'statusChange', {
    status: player.status,
    error: undefined,
  });

  const isLoading = status === 'loading' || status === 'idle';

  // Phát hiện lỗi
  useEffect(() => {
    if (status === 'error') {
      setHasError(true);
    } else if (status === 'readyToPlay') {
      setHasError(false);
    }
  }, [status, error]);

  // Đồng bộ shouldPlay — logic trung tâm
  useEffect(() => {
    if (!player || hasError) return;
    try {
      if (shouldPlay) {
        player.play();
      } else {
        player.pause();
      }
    } catch {}
  }, [shouldPlay, player, hasError]);

  // Đồng bộ muted + volume
  useEffect(() => {
    if (!player) return;
    try {
      player.muted = isMuted;
      player.volume = 1.0;
    } catch {}
  }, [isMuted, player]);

  // Đồng bộ loop
  useEffect(() => {
    if (!player) return;
    try { player.loop = isLooping; } catch {}
  }, [isLooping, player]);

  // Pause khi app vào background
  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (!player) return;
      try {
        if (state === 'background' || state === 'inactive') {
          player.pause();
        } else if (state === 'active' && shouldPlay) {
          player.play();
        }
      } catch {}
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [shouldPlay, player]);

  // Progress tracking — poll mỗi 500ms (giảm CPU)
  useEffect(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    if (onProgress && shouldPlay && player && !hasError) {
      progressInterval.current = setInterval(() => {
        if (!isMounted.current) return;
        try {
          const ct = player.currentTime || 0;
          const dur = player.duration || 0;
          if (dur > 0) onProgress(ct, dur);
        } catch {}
      }, 500);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };
  }, [shouldPlay, player, hasError, onProgress]);

  // Cleanup khi unmount — pause + giải phóng tài nguyên
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
      // Pause player khi unmount để giải phóng decoder
      try {
        player.pause();
      } catch {}
    };
  }, [player]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    try {
      player.replace(uri);
      player.volume = 1.0;
      if (shouldPlay) {
        setTimeout(() => {
          try { player.play(); } catch {}
        }, 500);
      }
    } catch {}
  }, [uri, shouldPlay, player]);

  if (hasError) {
    return (
      <View style={[style || styles.video, styles.errorContainer]}>
        <AlertTriangle size={32} color="#ef4444" />
        <Text style={styles.errorText}>Không thể phát video</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
          <RotateCcw size={16} color="#fff" />
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[style || styles.video, { overflow: 'hidden', backgroundColor: '#000' }]}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        nativeControls={nativeControls}
        allowsPictureInPicture={false}
      />

      {isLoading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}

      {onMuteToggle && (
        <TouchableOpacity onPress={onMuteToggle} style={styles.muteControl}>
          {isMuted ? <VolumeX size={18} color="#fff" /> : <Volume2 size={18} color="#fff" />}
        </TouchableOpacity>
      )}
    </View>
  );
}

const VideoPlayerItem = memo(VideoPlayerItemBase, (prevProps, nextProps) => {
  return (
    prevProps.uri === nextProps.uri &&
    prevProps.shouldPlay === nextProps.shouldPlay &&
    prevProps.isMuted === nextProps.isMuted &&
    prevProps.isLooping === nextProps.isLooping &&
    prevProps.contentFit === nextProps.contentFit &&
    prevProps.nativeControls === nextProps.nativeControls
  );
});

export default VideoPlayerItem;

const styles = StyleSheet.create({
  video: { width: '100%', height: '100%' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  errorContainer: {
    backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  errorText: { color: '#9ca3af', fontSize: 13 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: 'rgba(59,130,246,0.2)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(59,130,246,0.4)',
  },
  retryText: { color: '#3b82f6', fontSize: 13, fontWeight: '600' },
  muteControl: {
    position: 'absolute', bottom: 12, right: 12,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
});
