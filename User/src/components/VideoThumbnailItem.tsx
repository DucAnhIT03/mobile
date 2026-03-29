import React, { useState, useEffect } from 'react';
import { Image, View, StyleSheet } from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Play } from 'lucide-react-native';

interface VideoThumbnailItemProps {
  videoUri: string;
  thumbnailUri?: string | null;
  style?: any;
}

/**
 * Component hiển thị thumbnail cho video.
 * Ưu tiên: thumbnailUri > Cloudinary auto-thumb > expo-video-thumbnails > placeholder
 */
export default function VideoThumbnailItem({ videoUri, thumbnailUri, style }: VideoThumbnailItemProps) {
  const [thumbSource, setThumbSource] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      // 1. Dùng thumbnail có sẵn
      if (thumbnailUri) {
        setThumbSource(thumbnailUri);
        return;
      }

      // 2. Cloudinary: thay extension → .jpg
      if (videoUri.includes('cloudinary') || videoUri.includes('res.cloudinary')) {
        setThumbSource(videoUri.replace(/\.[^.]+$/, '.jpg'));
        return;
      }

      // 3. Dùng expo-video-thumbnails trích xuất frame đầu
      try {
        const result = await VideoThumbnails.getThumbnailAsync(videoUri, { time: 1000 });
        if (!cancelled) {
          setThumbSource(result.uri);
        }
      } catch {
        // 4. Fallback: không có ảnh
        if (!cancelled) {
          setFailed(true);
        }
      }
    };

    resolve();
    return () => { cancelled = true; };
  }, [videoUri, thumbnailUri]);

  if (failed || !thumbSource) {
    return (
      <View style={[style, styles.placeholder]}>
        <Play size={32} color="rgba(255,255,255,0.7)" fill="rgba(255,255,255,0.7)" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: thumbSource }}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
