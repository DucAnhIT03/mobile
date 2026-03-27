import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { ChevronLeft, Camera, ImageIcon, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { userApi } from '../api/userApi';
import { showAlert } from '../utils/alert';
import { BASE_URL } from '../services/api';

export default function EditProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await userApi.getMe();
        const data = res.data;
        setDisplayName(data.displayName || data.username || '');
        setBio(data.bio || '');
        setUsername(data.username || '');
        if (data.avatar) {
          setAvatar(data.avatar.startsWith('http') ? data.avatar : `${BASE_URL}${data.avatar}`);
        }
      } catch (error) {
        showAlert('Lỗi', 'Không thể tải thông tin cá nhân');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const uploadImage = async (imageUri: string) => {
    setAvatar(imageUri);
    setUploadingAvatar(true);
    try {
      const res = await userApi.uploadAvatar(imageUri);
      const newAvatar = res.data.avatar;
      setAvatar(newAvatar.startsWith('http') ? newAvatar : `${BASE_URL}${newAvatar}`);
      showAlert('Thành công', 'Đã cập nhật ảnh đại diện');
    } catch (error: any) {
      showAlert('Lỗi', error.response?.data?.message || 'Không thể upload ảnh');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const pickFromGallery = async () => {
    setShowAvatarMenu(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Thông báo', 'Cần quyền truy cập thư viện ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    setShowAvatarMenu(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Thông báo', 'Cần quyền truy cập camera');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateProfile({ displayName, bio, username });
      showAlert('Thành công', 'Đã cập nhật thông tin cá nhân');
      navigation.goBack();
    } catch (error: any) {
      showAlert('Lỗi', error.response?.data?.message || 'Không thể cập nhật');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ChevronLeft size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.title}>Chỉnh sửa</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveBtn, saving && { opacity: 0.5 }]}>{saving ? 'Đang lưu...' : 'Lưu'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoWrapper} onPress={() => setShowAvatarMenu(true)} disabled={uploadingAvatar}>
            <Image source={{ uri: avatar || 'https://i.pravatar.cc/150' }} style={styles.profilePhoto} />
            <View style={styles.cameraOverlay}>
              {uploadingAvatar ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Camera size={32} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAvatarMenu(true)} disabled={uploadingAvatar}>
            <Text style={styles.changePhotoText}>{uploadingAvatar ? 'Đang tải lên...' : 'Đổi ảnh đại diện'}</Text>
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Tên hiển thị</Text>
            <TextInput style={styles.fieldInput} value={displayName} onChangeText={setDisplayName} placeholderTextColor="#4b5563" />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>ID người dùng</Text>
            <TextInput
              style={styles.fieldInput}
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#4b5563"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.fieldHint}>ID duy nhất, 7 ngày mới được đổi 1 lần</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.fieldInput, { height: 80, textAlignVertical: 'top' }]}
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={200}
              placeholder="Viết gì đó về bạn..."
              placeholderTextColor="#4b5563"
            />
            <Text style={styles.fieldHint}>{bio.length}/200</Text>
          </View>
        </View>
      </ScrollView>

      {/* Avatar Action Sheet */}
      <Modal visible={showAvatarMenu} animationType="slide" transparent onRequestClose={() => setShowAvatarMenu(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={() => setShowAvatarMenu(false)} />
          <View style={[styles.sheetContainer, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.sheetDragHandle} />
            <Text style={styles.sheetTitle}>Đổi ảnh đại diện</Text>

            <TouchableOpacity style={styles.sheetOption} onPress={pickFromGallery}>
              <View style={styles.sheetIconWrap}><ImageIcon size={22} color="#3b82f6" /></View>
              <Text style={styles.sheetOptionText}>Chọn từ thư viện</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetOption} onPress={takePhoto}>
              <View style={styles.sheetIconWrap}><Camera size={22} color="#22c55e" /></View>
              <Text style={styles.sheetOptionText}>Chụp ảnh</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sheetCancel} onPress={() => setShowAvatarMenu(false)}>
              <Text style={styles.sheetCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { padding: 8 },
  title: { fontSize: 17, fontWeight: '600', color: '#fff' },
  saveBtn: { fontSize: 15, fontWeight: '600', color: '#3b82f6' },
  content: { flex: 1 },
  photoSection: { alignItems: 'center', marginTop: 32, marginBottom: 32 },
  photoWrapper: { position: 'relative', marginBottom: 16 },
  profilePhoto: { width: 96, height: 96, borderRadius: 48, opacity: 0.6, borderWidth: 2, borderColor: '#2A2A2A' },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  changePhotoText: { fontSize: 15, fontWeight: '600', color: '#3b82f6' },
  fields: { paddingHorizontal: 16, gap: 24 },
  field: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 12 },
  fieldLabel: { fontSize: 13, color: '#9ca3af', marginBottom: 6, fontWeight: '500' },
  fieldInput: { fontSize: 16, color: '#fff', padding: 0 },
  fieldHint: { fontSize: 12, color: '#6b7280', marginTop: 8 },
  // Action Sheet
  sheetOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetContainer: { backgroundColor: '#1e1e1e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 },
  sheetDragHandle: { width: 48, height: 6, borderRadius: 3, backgroundColor: '#4b5563', alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 20 },
  sheetOption: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, paddingHorizontal: 8, borderRadius: 12 },
  sheetIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  sheetOptionText: { fontSize: 16, fontWeight: '500', color: '#fff' },
  sheetCancel: { marginTop: 12, paddingVertical: 14, borderRadius: 12, backgroundColor: '#2A2A2A', alignItems: 'center' },
  sheetCancelText: { fontSize: 16, fontWeight: '600', color: '#9ca3af' },
});
