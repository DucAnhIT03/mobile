import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';

export default function Settings() {
  const router = useRouter();

  const renderItem = (item: { id: string; icon: any; label: string; description?: string; value?: string }) => (
    <TouchableOpacity key={item.id} style={styles.item}>
      <View style={styles.itemLeft}>
        <Ionicons name={item.icon} size={24} color="#fff" />
        <View style={{ flex: 1 }}>
          <Text style={styles.itemLabel}>{item.label}</Text>
          {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
        </View>
      </View>
      <View style={styles.itemRight}>
        {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="chevron-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt và quyền riêng tư</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput style={styles.searchInput} placeholder="Tìm kiếm" placeholderTextColor="#9CA3AF" />
          </View>
        </View>

        {/* Account Center */}
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>TÀI KHOẢN CỦA BẠN</Text><Text style={styles.metaLabel}>Meta</Text></View>
        {renderItem({ id: 'account-center', icon: 'person-circle-outline', label: 'Trung tâm tài khoản', description: 'Mật khẩu, bảo mật, thông tin cá nhân, quảng cáo' })}
        <View style={styles.separator} />

        {/* How you use */}
        <Text style={styles.sectionTitlePlain}>CÁCH BẠN DÙNG CONNECTDUCANH</Text>
        {[
          { id: 'saved', icon: 'bookmark-outline', label: 'Đã lưu' },
          { id: 'archive', icon: 'archive-outline', label: 'Lưu trữ' },
          { id: 'activity', icon: 'time-outline', label: 'Hoạt động của bạn' },
          { id: 'notifications', icon: 'notifications-outline', label: 'Thông báo' },
          { id: 'time-spent', icon: 'timer-outline', label: 'Thời gian sử dụng' },
        ].map(renderItem)}
        <View style={styles.separator} />

        {/* Visibility */}
        <Text style={styles.sectionTitlePlain}>AI CÓ THỂ XEM NỘI DUNG CỦA BẠN</Text>
        {[
          { id: 'account-privacy', icon: 'lock-closed-outline', label: 'Quyền riêng tư của tài khoản', value: 'Công khai' },
          { id: 'close-friends', icon: 'people-outline', label: 'Bạn thân' },
          { id: 'blocked', icon: 'ban-outline', label: 'Đã chặn' },
          { id: 'hide-story', icon: 'eye-off-outline', label: 'Ẩn tin và buổi phát trực tiếp' },
        ].map(renderItem)}
        <View style={styles.separator} />

        {/* Interactions */}
        <Text style={styles.sectionTitlePlain}>CÁCH NGƯỜI KHÁC CÓ THỂ TƯƠNG TÁC VỚI BẠN</Text>
        {[
          { id: 'messages', icon: 'chatbubble-outline', label: 'Tin nhắn và lượt phản hồi tin' },
          { id: 'tags', icon: 'at-outline', label: 'Thẻ và lượt nhắc' },
          { id: 'comments', icon: 'chatbubbles-outline', label: 'Bình luận' },
          { id: 'sharing', icon: 'share-social-outline', label: 'Chia sẻ và remix' },
        ].map(renderItem)}
        <View style={styles.separator} />

        {/* App & Media */}
        <Text style={styles.sectionTitlePlain}>ỨNG DỤNG VÀ FILE PHƯƠNG TIỆN CỦA BẠN</Text>
        {[
          { id: 'device-permissions', icon: 'phone-portrait-outline', label: 'Quyền của thiết bị' },
          { id: 'data-usage', icon: 'server-outline', label: 'Mức sử dụng dữ liệu và chất lượng file phương tiện' },
        ].map(renderItem)}
        <View style={styles.separator} />

        {/* Family */}
        <Text style={styles.sectionTitlePlain}>DÀNH CHO GIA ĐÌNH</Text>
        {renderItem({ id: 'supervision', icon: 'shield-checkmark-outline', label: 'Giám sát' })}
        <View style={styles.separator} />

        {/* Login */}
        <Text style={styles.sectionTitlePlain}>ĐĂNG NHẬP</Text>
        <TouchableOpacity style={styles.item}>
          <View style={styles.itemLeft}><Ionicons name="add-circle-outline" size={24} color="#3B82F6" /><Text style={[styles.itemLabel, { color: '#3B82F6' }]}>Thêm tài khoản</Text></View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={() => router.replace('/login')}>
          <View style={styles.itemLeft}><Ionicons name="log-out-outline" size={24} color="#EF4444" /><Text style={[styles.itemLabel, { color: '#EF4444' }]}>Đăng xuất</Text></View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { padding: 8, marginRight: 16 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#fff' },
  searchContainer: { padding: 16 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 12, height: 40 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', letterSpacing: 0.5 },
  metaLabel: { fontSize: 12, fontWeight: '600', color: '#60A5FA' },
  sectionTitlePlain: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', letterSpacing: 0.5, paddingHorizontal: 16, paddingVertical: 8 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemLabel: { fontSize: 16, color: '#fff' },
  itemDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  itemValue: { fontSize: 14, color: '#9CA3AF' },
  separator: { height: 6, backgroundColor: 'rgba(0,0,0,0.3)', marginVertical: 8 },
});
