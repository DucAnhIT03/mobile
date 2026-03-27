import React, { useState } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity, StyleSheet,
  FlatList, Dimensions, ScrollView, ActivityIndicator, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { X, Camera as CameraIcon, Layers, ChevronLeft, MapPin, Users, ChevronDown, Video, ImageIcon, Link } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { postApi } from '../api/postApi';
import { showAlert } from '../utils/alert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type PostType = 'image' | 'video';

export default function CreateScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [previewMedia, setPreviewMedia] = useState<string>('');
  const [postType, setPostType] = useState<PostType>('image');
  const [step, setStep] = useState<'select' | 'caption'>('select');
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUrlPost, setIsUrlPost] = useState(false);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Thông báo', 'Cần quyền truy cập thư viện');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      const uris = result.assets.map(a => a.uri);
      setSelectedMedia(uris);
      setPreviewMedia(uris[0]);
      setPostType('image');
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Thông báo', 'Cần quyền truy cập thư viện');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      videoMaxDuration: 60, // Max 60 giây
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setSelectedMedia([uri]);
      setPreviewMedia(uri);
      setPostType('video');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Thông báo', 'Cần quyền truy cập camera');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setSelectedMedia(prev => [...prev, uri]);
      if (!previewMedia) setPreviewMedia(uri);
      setPostType('image');
    }
  };

  const recordVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Thông báo', 'Cần quyền truy cập camera');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 60,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setSelectedMedia([uri]);
      setPreviewMedia(uri);
      setPostType('video');
    }
  };

  const removeMedia = (index: number) => {
    const newMedia = selectedMedia.filter((_, i) => i !== index);
    setSelectedMedia(newMedia);
    if (newMedia.length > 0) {
      setPreviewMedia(newMedia[0]);
    } else {
      setPreviewMedia('');
      setPostType('image');
    }
  };

  const handleNext = () => {
    if (selectedMedia.length === 0) {
      showAlert('Thông báo', 'Vui lòng chọn ít nhất 1 ảnh hoặc video');
      return;
    }
    setStep('caption');
  };

  const handleShare = async () => {
    setPosting(true);
    try {
      if (isUrlPost) {
        await postApi.createPostFromUrl({
          caption,
          type: 'video',
          mediaUrls: [videoUrl],
        });
      } else {
        await postApi.createPost({
          caption,
          type: postType,
          mediaUris: selectedMedia,
        });
      }
      showAlert('Thành công', 'Đã đăng bài viết');
      navigation.goBack();
    } catch (error: any) {
      showAlert('Lỗi', error.response?.data?.message || 'Không thể đăng bài');
    } finally {
      setPosting(false);
    }
  };

  const handleUrlSubmit = () => {
    if (!videoUrl.trim()) {
      showAlert('Thông báo', 'Vui lòng nhập URL video');
      return;
    }
    // Basic URL validation
    if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
      showAlert('Thông báo', 'URL không hợp lệ, phải bắt đầu bằng http:// hoặc https://');
      return;
    }
    setIsUrlPost(true);
    setPostType('video');
    setPreviewMedia(videoUrl);
    setSelectedMedia([videoUrl]);
    setShowUrlModal(false);
    setStep('caption');
  };

  // === STEP 2: Caption ===
  if (step === 'caption') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('select')} style={styles.closeBtn}>
            <ChevronLeft size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bài viết mới</Text>
          <TouchableOpacity onPress={handleShare} disabled={posting}>
            <Text style={[styles.shareBtn, posting && { opacity: 0.5 }]}>
              {posting ? 'Đang đăng...' : 'Chia sẻ'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.captionContent} showsVerticalScrollIndicator={false}>
          <View style={styles.captionRow}>
            <View style={styles.captionThumbWrap}>
              <Image source={{ uri: previewMedia }} style={styles.captionThumb} />
              {postType === 'video' && (
                <View style={styles.videoTag}><Video size={12} color="#fff" /><Text style={styles.videoTagText}>Video</Text></View>
              )}
            </View>
            <TextInput
              style={styles.captionInput}
              placeholder="Viết chú thích..."
              placeholderTextColor="#6b7280"
              multiline
              value={caption}
              onChangeText={setCaption}
              maxLength={2200}
            />
          </View>

          {/* Preview media đã chọn */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
            {selectedMedia.map((item, i) => (
              <View key={i} style={styles.previewThumb}>
                <Image source={{ uri: item }} style={styles.previewThumbImage} />
                <TouchableOpacity style={styles.previewRemoveBtn} onPress={() => removeMedia(i)}>
                  <X size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.captionOptions}>
            <TouchableOpacity style={styles.optionItem}>
              <MapPin size={20} color="#fff" />
              <Text style={styles.optionText}>Thêm vị trí</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionItem}>
              <Users size={20} color="#fff" />
              <Text style={styles.optionText}>Gắn thẻ người</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {posting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Đang tải lên...</Text>
          </View>
        )}
      </View>
    );
  }

  // === STEP 1: Select Media ===
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <X size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bài viết mới</Text>
        </View>
        <TouchableOpacity onPress={handleNext}>
          <Text style={[styles.nextBtn, selectedMedia.length === 0 && { opacity: 0.3 }]}>Tiếp</Text>
        </TouchableOpacity>
      </View>

      {/* Preview */}
      <TouchableOpacity onPress={pickImages} activeOpacity={0.8}>
        {previewMedia ? (
          <View>
            <Image source={{ uri: previewMedia }} style={styles.mainPreview} />
            {postType === 'video' && (
              <View style={styles.previewVideoOverlay}>
                <Video size={48} color="#fff" />
                <Text style={styles.previewVideoText}>Video</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.mainPreview, styles.emptyPreview]}>
            <Layers size={48} color="#6b7280" />
            <Text style={styles.emptyText}>Chọn ảnh hoặc video</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Controls */}
      <View style={styles.galleryControls}>
        <TouchableOpacity style={styles.recentsBtn}>
          <Text style={styles.recentsText}>Recents</Text>
          <ChevronDown size={16} color="#fff" />
        </TouchableOpacity>
        <View style={styles.galleryActions}>
          <TouchableOpacity style={styles.smallCircleBtn} onPress={pickImages}>
            <Layers size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallCircleBtn} onPress={takePhoto}>
            <CameraIcon size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected thumbnails or empty state */}
      {selectedMedia.length > 0 ? (
        <FlatList
          data={selectedMedia}
          numColumns={4}
          keyExtractor={(_, i) => i.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.galleryItem} onPress={() => setPreviewMedia(item)}>
              <Image source={{ uri: item }} style={styles.galleryImage} />
              {item === previewMedia && <View style={styles.selectedOverlay} />}
              <View style={styles.imageNumber}>
                <Text style={styles.imageNumberText}>{index + 1}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <TouchableOpacity style={styles.bigPickBtn} onPress={pickImages}>
            <ImageIcon size={28} color="#3b82f6" />
            <View>
              <Text style={styles.bigPickTitle}>Chọn ảnh</Text>
              <Text style={styles.bigPickSub}>Chọn nhiều ảnh từ thư viện</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bigPickBtn} onPress={pickVideo}>
            <Video size={28} color="#a855f7" />
            <View>
              <Text style={styles.bigPickTitle}>Chọn video</Text>
              <Text style={styles.bigPickSub}>Video ngắn tối đa 60 giây</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bigPickBtn} onPress={takePhoto}>
            <CameraIcon size={28} color="#22c55e" />
            <View>
              <Text style={styles.bigPickTitle}>Chụp ảnh</Text>
              <Text style={styles.bigPickSub}>Mở camera để chụp</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bigPickBtn} onPress={recordVideo}>
            <Video size={28} color="#ef4444" />
            <View>
              <Text style={styles.bigPickTitle}>Quay video</Text>
              <Text style={styles.bigPickSub}>Quay video ngắn từ camera</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bigPickBtn} onPress={() => setShowUrlModal(true)}>
            <Link size={28} color="#f59e0b" />
            <View>
              <Text style={styles.bigPickTitle}>Dán link video</Text>
              <Text style={styles.bigPickSub}>Đăng video từ đường dẫn URL</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* URL Input Modal */}
      <Modal visible={showUrlModal} animationType="slide" transparent onRequestClose={() => setShowUrlModal(false)}>
        <View style={styles.urlModalOverlay}>
          <TouchableOpacity style={styles.urlModalBackdrop} activeOpacity={1} onPress={() => setShowUrlModal(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.urlModalContent}>
            <View style={styles.urlModalHeader}>
              <Text style={styles.urlModalTitle}>Dán link video</Text>
              <TouchableOpacity onPress={() => setShowUrlModal(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.urlModalDesc}>Dán đường dẫn URL video (MP4, MOV, ...)</Text>
            <TextInput
              style={styles.urlInput}
              placeholder="https://example.com/video.mp4"
              placeholderTextColor="#6b7280"
              value={videoUrl}
              onChangeText={setVideoUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <TouchableOpacity style={styles.urlSubmitBtn} onPress={handleUrlSubmit}>
              <Text style={styles.urlSubmitText}>Tiếp tục</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  nextBtn: { fontSize: 16, fontWeight: '700', color: '#3b82f6' },
  shareBtn: { fontSize: 16, fontWeight: '700', color: '#3b82f6' },

  // Gallery step
  mainPreview: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.75, resizeMode: 'cover', backgroundColor: '#1e1e1e' },
  emptyPreview: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, color: '#6b7280' },
  previewVideoOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', gap: 8 },
  previewVideoText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  galleryControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, height: 48 },
  recentsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recentsText: { fontSize: 15, fontWeight: '600', color: '#fff' },
  galleryActions: { flexDirection: 'row', gap: 12 },
  smallCircleBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center' },
  galleryItem: { width: SCREEN_WIDTH / 4, aspectRatio: 1, padding: 1, position: 'relative' },
  galleryImage: { width: '100%', height: '100%', backgroundColor: '#374151' },
  selectedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(59,130,246,0.3)', borderWidth: 2, borderColor: '#3b82f6' },
  imageNumber: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  imageNumberText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // Placeholder options
  placeholderContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 24, gap: 12 },
  bigPickBtn: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#2A2A2A', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 20 },
  bigPickTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  bigPickSub: { fontSize: 13, color: '#9ca3af', marginTop: 2 },

  // Caption step
  captionContent: { flex: 1 },
  captionRow: { flexDirection: 'row', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  captionThumbWrap: { position: 'relative' },
  captionThumb: { width: 64, height: 64, borderRadius: 8 },
  videoTag: { position: 'absolute', bottom: 2, left: 2, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  videoTagText: { fontSize: 9, fontWeight: '600', color: '#fff' },
  captionInput: { flex: 1, fontSize: 16, color: '#fff', textAlignVertical: 'top', minHeight: 80 },
  previewRow: { paddingHorizontal: 16, paddingVertical: 12 },
  previewThumb: { width: 72, height: 72, borderRadius: 8, marginRight: 8, position: 'relative' },
  previewThumbImage: { width: '100%', height: '100%', borderRadius: 8 },
  previewRemoveBtn: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
  captionOptions: { paddingHorizontal: 16, gap: 0 },
  optionItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  optionText: { fontSize: 16, color: '#fff' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#fff' },

  // URL Modal
  urlModalOverlay: { flex: 1, justifyContent: 'flex-end' },
  urlModalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  urlModalContent: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  urlModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  urlModalTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  urlModalDesc: { fontSize: 14, color: '#9ca3af', marginBottom: 16 },
  urlInput: { backgroundColor: '#2A2A2A', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#fff', borderWidth: 1, borderColor: '#374151', marginBottom: 16 },
  urlSubmitBtn: { backgroundColor: '#3b82f6', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  urlSubmitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
