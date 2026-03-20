import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';

export default function ActivityHistory() {
  const router = useRouter();

  const interactionItems = [
    { id: 'likes', icon: 'heart-outline' as const, label: 'Lượt thích', description: 'Xem, bỏ thích các bài viết, thước phim và bình luận.' },
    { id: 'comments', icon: 'chatbubble-outline' as const, label: 'Bình luận', description: 'Xem, xóa bình luận của bạn.' },
    { id: 'tags', icon: 'pricetag-outline' as const, label: 'Thẻ', description: 'Xem, ẩn hoặc xóa thẻ của bạn trên bài viết và bình luận.' },
    { id: 'story-replies', icon: 'chatbubbles-outline' as const, label: 'Phản hồi tin', description: 'Xem, xóa phản hồi tin của bạn.' },
    { id: 'reviews', icon: 'star-outline' as const, label: 'Đánh giá', description: 'Xem, xóa đánh giá của bạn.' },
  ];

  const removedItems = [
    { id: 'recently-deleted', icon: 'trash-outline' as const, label: 'Đã xóa gần đây', description: 'Xem, khôi phục nội dung đã xóa.' },
    { id: 'archived', icon: 'archive-outline' as const, label: 'Đã lưu trữ', description: 'Xem, khôi phục nội dung đã lưu trữ.' },
  ];

  const usageItems = [
    { id: 'time-spent', icon: 'time-outline' as const, label: 'Thời gian đã dùng', description: 'Quản lý thời gian bạn dùng ứng dụng.' },
    { id: 'search-history', icon: 'search-outline' as const, label: 'Lịch sử tìm kiếm', description: 'Xem, xóa lịch sử tìm kiếm.' },
    { id: 'links-visited', icon: 'link-outline' as const, label: 'Liên kết bạn đã truy cập', description: 'Xem các liên kết bạn đã truy cập gần đây.' },
  ];

  const renderItem = (item: { id: string; icon: any; label: string; description: string }) => (
    <TouchableOpacity key={item.id} style={styles.item}>
      <View style={styles.itemLeft}>
        <View style={styles.itemIcon}><Ionicons name={item.icon} size={24} color="#fff" /></View>
        <View style={styles.itemText}>
          <Text style={styles.itemLabel}>{item.label}</Text>
          <Text style={styles.itemDesc}>{item.description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6B7280" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="chevron-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử hoạt động</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Một nơi để quản lý hoạt động của bạn</Text>
          <Text style={styles.introDesc}>Chúng tôi đã thêm công cụ để bạn có thể xem xét và quản lý ảnh, video, tài khoản cũng như hoạt động của mình trên ConnectDucAnh.</Text>
        </View>
        <Text style={styles.sectionTitle}>Tương tác</Text>
        {interactionItems.map(renderItem)}
        <View style={styles.separator} />
        <Text style={styles.sectionTitle}>Nội dung đã xóa và lưu trữ</Text>
        {removedItems.map(renderItem)}
        <View style={styles.separator} />
        <Text style={styles.sectionTitle}>Cách bạn dùng ConnectDucAnh</Text>
        {usageItems.map(renderItem)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { padding: 8, marginRight: 16 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#fff' },
  intro: { padding: 16 },
  introTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  introDesc: { fontSize: 14, color: '#9CA3AF', lineHeight: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#fff', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1, marginRight: 8 },
  itemIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  itemText: { flex: 1 },
  itemLabel: { fontSize: 16, fontWeight: '600', color: '#fff' },
  itemDesc: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  separator: { height: 8, backgroundColor: 'rgba(0,0,0,0.3)', marginVertical: 8 },
});
