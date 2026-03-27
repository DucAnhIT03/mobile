import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChevronLeft, Search, UserCircle, Bookmark, Archive, Clock, Bell, Lock, Users, Ban, EyeOff, MessageCircle, AtSign, MessageSquare, Share2, Smartphone, Database, Shield, PlusCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const sections = [
    { title: 'Tài khoản của bạn', badge: 'Meta', items: [{ icon: UserCircle, label: 'Trung tâm tài khoản', description: 'Mật khẩu, bảo mật, thông tin cá nhân, quảng cáo' }] },
    { title: 'Cách bạn dùng ConnectDucAnh', items: [{ icon: Bookmark, label: 'Đã lưu' }, { icon: Archive, label: 'Lưu trữ' }, { icon: Clock, label: 'Hoạt động của bạn' }, { icon: Bell, label: 'Thông báo' }, { icon: Clock, label: 'Thời gian sử dụng' }] },
    { title: 'Ai có thể xem nội dung của bạn', items: [{ icon: Lock, label: 'Quyền riêng tư của tài khoản', value: 'Công khai' }, { icon: Users, label: 'Bạn thân' }, { icon: Ban, label: 'Đã chặn' }, { icon: EyeOff, label: 'Ẩn tin và buổi phát trực tiếp' }] },
    { title: 'Cách người khác có thể tương tác với bạn', items: [{ icon: MessageCircle, label: 'Tin nhắn và lượt phản hồi tin' }, { icon: AtSign, label: 'Thẻ và lượt nhắc' }, { icon: MessageSquare, label: 'Bình luận' }, { icon: Share2, label: 'Chia sẻ và remix' }] },
    { title: 'Ứng dụng và file phương tiện của bạn', items: [{ icon: Smartphone, label: 'Quyền của thiết bị' }, { icon: Database, label: 'Mức sử dụng dữ liệu và chất lượng file phương tiện' }] },
    { title: 'Dành cho gia đình', items: [{ icon: Shield, label: 'Giám sát' }] },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ChevronLeft size={24} color="#fff" /></TouchableOpacity>
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
              {section.badge && <Text style={styles.sectionBadge}>{section.badge}</Text>}
            </View>
            {section.items.map((item: any, iIndex) => (
              <TouchableOpacity key={iIndex} style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <item.icon size={24} color="#fff" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    {item.description && <Text style={styles.settingDesc}>{item.description}</Text>}
                  </View>
                </View>
                <View style={styles.settingRight}>
                  {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                  <ChevronRight size={20} color="#6b7280" />
                </View>
              </TouchableOpacity>
            ))}
            <View style={styles.divider} />
          </View>
        ))}

        {/* Login section */}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Đăng nhập</Text></View>
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}><PlusCircle size={24} color="#3b82f6" /><Text style={[styles.settingLabel, { color: '#3b82f6' }]}>Thêm tài khoản</Text></View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={() => navigation.replace('Login')}>
          <View style={styles.settingLeft}><LogOut size={24} color="#ef4444" /><Text style={[styles.settingLabel, { color: '#ef4444' }]}>Đăng xuất</Text></View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { padding: 8 },
  title: { fontSize: 17, fontWeight: '600', color: '#fff', marginLeft: 16 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 15, color: '#fff' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 },
  sectionBadge: { fontSize: 12, color: '#60a5fa', fontWeight: '600' },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 16, color: '#fff' },
  settingDesc: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingValue: { fontSize: 14, color: '#9ca3af' },
  divider: { height: 6, backgroundColor: 'rgba(0,0,0,0.5)', marginVertical: 8 },
});
