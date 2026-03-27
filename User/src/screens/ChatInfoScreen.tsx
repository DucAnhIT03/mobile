import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  ScrollView, Dimensions,
} from 'react-native';
import { ArrowLeft, User, Search, Bell, MoreHorizontal, Lock, UserCog, Users, Palette } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BASE_URL } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ChatInfoScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { name, avatar, isOnline, targetUserId } = route.params || {};

  const resolveAvatar = (a?: string) => {
    if (!a) return 'https://i.pravatar.cc/150';
    return a.startsWith('http') ? a : `${BASE_URL}${a}`;
  };

  const menuItems = [
    { icon: <Palette size={22} color="#d1d5db" />, title: 'Chủ đề', subtitle: 'Mặc định' },
    { icon: <Lock size={22} color="#d1d5db" />, title: 'Quyền riêng tư và an toàn', subtitle: '' },
    { icon: <UserCog size={22} color="#d1d5db" />, title: 'Biệt danh', subtitle: '' },
    { icon: <Users size={22} color="#d1d5db" />, title: 'Tạo nhóm chat', subtitle: '' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Avatar & Name */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: resolveAvatar(avatar) }} style={styles.avatar} />
            {isOnline && <View style={styles.onlineDot} />}
          </View>
          <Text style={styles.displayName}>{name || 'User'}</Text>
          <Text style={styles.statusText}>{isOnline ? 'Đang hoạt động' : 'Không hoạt động'}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigation.navigate('UserProfile', { userId: targetUserId })}
          >
            <View style={styles.quickIconCircle}>
              <User size={20} color="#d1d5db" />
            </View>
            <Text style={styles.quickLabel}>Trang cá{'\n'}nhân</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn}>
            <View style={styles.quickIconCircle}>
              <Search size={20} color="#d1d5db" />
            </View>
            <Text style={styles.quickLabel}>Tìm kiếm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn}>
            <View style={styles.quickIconCircle}>
              <Bell size={20} color="#d1d5db" />
            </View>
            <Text style={styles.quickLabel}>Tắt thông{'\n'}báo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn}>
            <View style={styles.quickIconCircle}>
              <MoreHorizontal size={20} color="#d1d5db" />
            </View>
            <Text style={styles.quickLabel}>Lựa chọn</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuIconWrapper}>{item.icon}</View>
              <View style={styles.menuTextWrapper}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                {item.subtitle ? <Text style={styles.menuSubtitle}>{item.subtitle}</Text> : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Shared Media */}
        <View style={styles.sharedSection}>
          <Text style={styles.sharedTitle}>File phương tiện được chia sẻ</Text>
          <View style={styles.sharedGrid}>
            <View style={styles.sharedPlaceholder}>
              <Text style={styles.sharedPlaceholderText}>Chưa có file nào</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4 },

  // Profile
  profileSection: { alignItems: 'center', paddingVertical: 24 },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)' },
  onlineDot: { position: 'absolute', bottom: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#22c55e', borderWidth: 3, borderColor: '#000' },
  displayName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  statusText: { fontSize: 14, color: '#9ca3af' },

  // Quick actions
  quickActions: { flexDirection: 'row', justifyContent: 'center', gap: 24, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  quickBtn: { alignItems: 'center', gap: 8, width: 70 },
  quickIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 12, color: '#d1d5db', textAlign: 'center', lineHeight: 16 },

  // Menu items
  menuSection: { paddingTop: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  menuIconWrapper: { width: 40, alignItems: 'center' },
  menuTextWrapper: { flex: 1, marginLeft: 12 },
  menuTitle: { fontSize: 16, color: '#fff', fontWeight: '500' },
  menuSubtitle: { fontSize: 13, color: '#9ca3af', marginTop: 2 },

  // Shared media
  sharedSection: { paddingHorizontal: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  sharedTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 },
  sharedGrid: {},
  sharedPlaceholder: { height: 100, backgroundColor: '#1a1a1a', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sharedPlaceholderText: { color: '#6b7280', fontSize: 14 },
});
