import React, { useState } from 'react';
import {
  View, Text, Image, TextInput, TouchableOpacity, StyleSheet,
  Dimensions, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { X, Camera as CameraIcon, ImageIcon, Video, ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { storyApi } from '../api/storyApi';
import { showAlert } from '../utils/alert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CreateStoryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [mediaUri, setMediaUri] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [step, setStep] = useState<'select' | 'preview'>('select');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Thông báo', 'Cần quyền truy cập thư viện');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType('image');
      setStep('preview');
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
      videoMaxDuration: 30,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType('video');
      setStep('preview');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Thông báo', 'Cần quyền truy cập camera');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType('image');
      setStep('preview');
    }
  };

  const handlePost = async () => {
    if (!mediaUri) return;
    setPosting(true);
    try {
      await storyApi.createStory(mediaUri, mediaType, caption || undefined);
      showAlert('Thành công', 'Đã đăng story!');
      navigation.goBack();
    } catch (error: any) {
      showAlert('Lỗi', error.response?.data?.message || 'Không thể đăng story');
    } finally {
      setPosting(false);
    }
  };

  // === STEP 2: Preview & Caption ===
  if (step === 'preview') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('select')} style={styles.closeBtn}>
            <ChevronLeft size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Story mới</Text>
          <TouchableOpacity onPress={handlePost} disabled={posting}>
            <Text style={[styles.shareBtn, posting && { opacity: 0.5 }]}>
              {posting ? 'Đang đăng...' : 'Đăng'}
            </Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Image source={{ uri: mediaUri }} style={styles.previewImage} resizeMode="cover" />

            {mediaType === 'video' && (
              <View style={styles.videoLabel}>
                <Video size={14} color="#fff" />
                <Text style={styles.videoLabelText}>Video</Text>
              </View>
            )}

            <View style={styles.captionSection}>
              <TextInput
                style={styles.captionInput}
                placeholder="Thêm chú thích cho story..."
                placeholderTextColor="#6b7280"
                multiline
                value={caption}
                onChangeText={setCaption}
                maxLength={500}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo Story</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.optionsContainer}>
        <Text style={styles.sectionTitle}>Chọn nội dung cho story</Text>

        <TouchableOpacity style={styles.optionBtn} onPress={pickImage}>
          <View style={[styles.optionIcon, { backgroundColor: '#3b82f6' }]}>
            <ImageIcon size={24} color="#fff" />
          </View>
          <View style={styles.optionTextWrap}>
            <Text style={styles.optionTitle}>Chọn ảnh</Text>
            <Text style={styles.optionSub}>Chọn ảnh từ thư viện</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionBtn} onPress={pickVideo}>
          <View style={[styles.optionIcon, { backgroundColor: '#a855f7' }]}>
            <Video size={24} color="#fff" />
          </View>
          <View style={styles.optionTextWrap}>
            <Text style={styles.optionTitle}>Chọn video</Text>
            <Text style={styles.optionSub}>Video ngắn tối đa 30 giây</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionBtn} onPress={takePhoto}>
          <View style={[styles.optionIcon, { backgroundColor: '#22c55e' }]}>
            <CameraIcon size={24} color="#fff" />
          </View>
          <View style={styles.optionTextWrap}>
            <Text style={styles.optionTitle}>Chụp ảnh</Text>
            <Text style={styles.optionSub}>Mở camera để chụp</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  shareBtn: { fontSize: 16, fontWeight: '700', color: '#3b82f6' },
  optionsContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 32, gap: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#2A2A2A', borderRadius: 16,
    paddingVertical: 18, paddingHorizontal: 20,
  },
  optionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optionTextWrap: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  optionSub: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  previewImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.2, backgroundColor: '#000' },
  videoLabel: {
    position: 'absolute', top: 80, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  videoLabelText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  captionSection: { paddingHorizontal: 16, paddingVertical: 16 },
  captionInput: {
    fontSize: 16, color: '#fff', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12,
    padding: 16, minHeight: 80, textAlignVertical: 'top',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingText: { fontSize: 14, color: '#fff' },
});
