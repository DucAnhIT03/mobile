import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChevronLeft, Heart, MessageCircle, Tag, MessageSquare, Star, Trash2, Archive, Clock, Search, Link as LinkIcon, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ActivityHistoryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const interactionItems = [
    { id: 'likes', icon: Heart, label: 'Lượt thích', description: 'Xem, bỏ thích các bài viết, thước phim và bình luận.' },
    { id: 'comments', icon: MessageCircle, label: 'Bình luận', description: 'Xem, xóa bình luận của bạn.' },
    { id: 'tags', icon: Tag, label: 'Thẻ', description: 'Xem, ẩn hoặc xóa thẻ của bạn trên bài viết và bình luận.' },
    { id: 'story-replies', icon: MessageSquare, label: 'Phản hồi tin', description: 'Xem, xóa phản hồi tin của bạn.' },
    { id: 'reviews', icon: Star, label: 'Đánh giá', description: 'Xem, xóa đánh giá của bạn.' },
  ];
  const removedItems = [
    { id: 'recently-deleted', icon: Trash2, label: 'Đã xóa gần đây', description: 'Xem, khôi phục nội dung đã xóa.' },
    { id: 'archived', icon: Archive, label: 'Đã lưu trữ', description: 'Xem, khôi phục nội dung đã lưu trữ.' },
  ];
  const usageItems = [
    { id: 'time-spent', icon: Clock, label: 'Thời gian đã dùng', description: 'Quản lý thời gian bạn dùng ứng dụng.' },
    { id: 'search-history', icon: Search, label: 'Lịch sử tìm kiếm', description: 'Xem, xóa lịch sử tìm kiếm.' },
    { id: 'links-visited', icon: LinkIcon, label: 'Liên kết bạn đã truy cập', description: 'Xem các liên kết bạn đã truy cập gần đây.' },
  ];

  const navigateMap: Record<string, string> = {
    'likes': 'LikesHistory',
    'comments': 'CommentsHistory',
  };

  const renderItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.listItem}
      onPress={() => {
        const screen = navigateMap[item.id];
        if (screen) navigation.navigate(screen);
      }}
    >
      <View style={styles.listItemLeft}>
        <View style={styles.iconCircle}><item.icon size={24} color="#fff" /></View>
        <View style={styles.listItemText}><Text style={styles.itemLabel}>{item.label}</Text><Text style={styles.itemDesc}>{item.description}</Text></View>
      </View>
      <ChevronRight size={20} color="#6b7280" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><ChevronLeft size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.title}>Lịch sử hoạt động</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Một nơi để quản lý hoạt động của bạn</Text>
          <Text style={styles.introDesc}>Chúng tôi đã thêm công cụ để bạn có thể xem xét và quản lý ảnh, video, tài khoản cũng như hoạt động của mình trên ConnectDucAnh.</Text>
        </View>

        <Text style={styles.sectionTitle}>Tương tác</Text>
        {interactionItems.map(renderItem)}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Nội dung đã xóa và lưu trữ</Text>
        {removedItems.map(renderItem)}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Cách bạn dùng ConnectDucAnh</Text>
        {usageItems.map(renderItem)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { padding: 8 },
  title: { fontSize: 17, fontWeight: '600', color: '#fff', marginLeft: 16 },
  introSection: { padding: 16 },
  introTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  introDesc: { fontSize: 14, color: '#9ca3af', lineHeight: 20 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff', paddingHorizontal: 16, paddingVertical: 8 },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  listItemText: { flex: 1 },
  itemLabel: { fontSize: 16, fontWeight: '600', color: '#fff' },
  itemDesc: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  divider: { height: 8, backgroundColor: 'rgba(0,0,0,0.5)', marginVertical: 16 },
});
