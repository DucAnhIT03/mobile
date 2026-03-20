import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';

export default function EditProfile() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="chevron-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.saveBtn}>Save</Text></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Photo Section */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoWrapper}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} style={styles.profilePhoto} />
            <View style={styles.cameraOverlay}><Ionicons name="camera" size={32} color="#fff" /></View>
          </TouchableOpacity>
          <TouchableOpacity><Text style={styles.changePhotoText}>Change photo</Text></TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.field}><Text style={styles.fieldLabel}>Name</Text><TextInput style={styles.fieldInput} defaultValue="Alex Chen" placeholderTextColor="#555" /></View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Username</Text><TextInput style={styles.fieldInput} defaultValue="alexchen" placeholderTextColor="#555" />
            <Text style={styles.fieldHint}>tiktok.com/@alexchen</Text>
          </View>
          <View style={styles.field}><Text style={styles.fieldLabel}>Bio</Text><TextInput style={[styles.fieldInput, { height: 64, textAlignVertical: 'top' }]} defaultValue="Digital Creator | Sharing life's moments | Seattle 📍" multiline maxLength={80} placeholderTextColor="#555" /></View>
        </View>

        {/* Social Links */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>SOCIAL</Text>
          <View style={styles.field}><Text style={styles.fieldLabel}>Instagram</Text><TextInput style={styles.fieldInput} placeholder="Add Instagram to your profile" placeholderTextColor="#555" /></View>
          <View style={styles.field}><Text style={styles.fieldLabel}>YouTube</Text><TextInput style={styles.fieldInput} placeholder="Add YouTube to your profile" placeholderTextColor="#555" /></View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#fff' },
  saveBtn: { fontSize: 15, fontWeight: '600', color: Colors.pink },
  photoSection: { alignItems: 'center', marginTop: 32, marginBottom: 32 },
  photoWrapper: { position: 'relative', width: 96, height: 96, borderRadius: 48, overflow: 'hidden' },
  profilePhoto: { width: '100%', height: '100%', opacity: 0.6 },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  changePhotoText: { fontSize: 15, fontWeight: '600', color: '#fff', marginTop: 16 },
  form: { paddingHorizontal: 16, gap: 24 },
  field: { borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 12 },
  fieldLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginBottom: 6 },
  fieldInput: { color: '#fff', fontSize: 16 },
  fieldHint: { fontSize: 12, color: '#6B7280', marginTop: 8 },
  socialSection: { paddingHorizontal: 16, marginTop: 32, gap: 24 },
  socialTitle: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', letterSpacing: 1, marginBottom: 8 },
});
