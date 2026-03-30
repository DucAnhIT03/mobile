import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { ChevronLeft, Search, UserCircle, Bookmark, Archive, Clock, Bell, Lock, Users, Ban, EyeOff, MessageCircle, AtSign, MessageSquare, Share2, Smartphone, Database, Shield, PlusCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['token', 'user']);
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleItemPress = (label: string) => {
    switch (label) {
      case 'Đã lưu':
        navigation.navigate('SavedPosts');
        break;
      case 'Hoạt động của bạn':
        navigation.navigate('ActivityHistory');
        break;
      case 'Thông báo':
        // Notification settings — can navigate to a dedicated screen
        break;
      case 'Quyền riêng tư của tài khoản':
        navigation.navigate('PrivacySettings');
        break;
      case 'Đã chặn':
        navigation.navigate('BlockedUsers');
        break;
      case 'Trung tâm tài khoản':
        navigation.navigate('EditProfile');
        break;
      default:
        break;
    }
  };

  const sections = [
    { 
      title: 'Tài khoản của bạn',
      items: [
        { icon: UserCircle, label: 'Trung tâm tài khoản', description: 'Mật khẩu, bảo mật, thông tin cá nhân' },
      ],
    },
    { 
      title: 'Cách bạn dùng ConnectDucAnh',
      items: [
        { icon: Bookmark, label: 'Đã lưu' },
        { icon: Archive, label: 'Lưu trữ' },
        { icon: Clock, label: 'Hoạt động của bạn' },
        { icon: Bell, label: 'Thông báo' },
        { icon: Clock, label: 'Thời gian sử dụng' },
      ],
    },
    { 
      title: 'Ai có thể xem nội dung của bạn',
      items: [
        { icon: Lock, label: 'Quyền riêng tư của tài khoản', value: 'Công khai' },
        { icon: Users, label: 'Bạn thân' },
        { icon: Ban, label: 'Đã chặn' },
        { icon: EyeOff, label: 'Ẩn tin và buổi phát trực tiếp' },
      ],
    },
    { 
      title: 'Cách người khác có thể tương tác với bạn',
      items: [
        { icon: MessageCircle, label: 'Tin nhắn và lượt phản hồi tin' },
        { icon: AtSign, label: 'Thẻ và lượt nhắc' },
        { icon: MessageSquare, label: 'Bình luận' },
        { icon: Share2, label: 'Chia sẻ và remix' },
      ],
    },
    { 
      title: 'Ứng dụng và file phương tiện',
      items: [
        { icon: Smartphone, label: 'Quyền của thiết bị' },
        { icon: Database, label: 'Chất lượng file phương tiện' },
      ],
    },
    { 
      title: 'Dành cho gia đình',
      items: [
        { icon: Shield, label: 'Giám sát' },
      ],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Cài đặt và quyền riêng tư</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Search */}
        <View style={styles.searchWrapper}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput style={styles.searchInput} placeholder="Tìm kiếm" placeholderTextColor="#9ca3af" />
        </View>

        {sections.map((section, sIndex) => (
          <View key={sIndex}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item: any, iIndex) => (
              <TouchableOpacity
                key={iIndex}
                style={styles.settingItem}
                onPress={() => handleItemPress(item.label)}
                activeOpacity={0.6}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconWrap}>
                    <item.icon size={22} color="#fff" />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    {item.description && <Text style={styles.settingDesc}>{item.description}</Text>}
                  </View>
                </View>
                <View style={styles.settingRight}>
                  {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                  <ChevronRight size={18} color="#4b5563" />
                </View>
              </TouchableOpacity>
            ))}
            <View style={styles.divider} />
          </View>
        ))}

        {/* Login section */}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Đăng nhập</Text></View>
        <TouchableOpacity style={styles.settingItem} activeOpacity={0.6}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
              <PlusCircle size={22} color="#3b82f6" />
            </View>
            <Text style={[styles.settingLabel, { color: '#3b82f6' }]}>Thêm tài khoản</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout} activeOpacity={0.6}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
              <LogOut size={22} color="#ef4444" />
            </View>
            <Text style={[styles.settingLabel, { color: '#ef4444' }]}>Đăng xuất</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: { padding: 6 },
  title: { fontSize: 17, fontWeight: '600', color: '#fff', marginLeft: 12 },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 12,
    backgroundColor: '#1A1A1A', borderRadius: 12, paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: '#fff' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8 },
  settingItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 11, paddingHorizontal: 16,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center',
  },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 15, color: '#e5e7eb' },
  settingDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingValue: { fontSize: 13, color: '#6b7280' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 6, marginHorizontal: 16 },
});
