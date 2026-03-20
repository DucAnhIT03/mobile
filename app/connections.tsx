import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/theme';

const MOCK_FOLLOWERS = [
  { id: 1, username: 'sarah_j', name: 'Sarah Jenkins', avatar: 'https://i.pravatar.cc/150?img=5', isFollowing: true },
  { id: 2, username: 'mike.dev', name: 'Mike Chen', avatar: 'https://i.pravatar.cc/150?img=8', isFollowing: false },
  { id: 3, username: 'emma_travels', name: 'Emma Wilson', avatar: 'https://i.pravatar.cc/150?img=9', isFollowing: true },
  { id: 4, username: 'alex_photography', name: 'Alex Rivera', avatar: 'https://i.pravatar.cc/150?img=12', isFollowing: false },
  { id: 5, username: 'jessica.designs', name: 'Jessica Taylor', avatar: 'https://i.pravatar.cc/150?img=16', isFollowing: true },
  { id: 6, username: 'david_b', name: 'David Brown', avatar: 'https://i.pravatar.cc/150?img=33', isFollowing: false },
  { id: 7, username: 'lisa.music', name: 'Lisa Anderson', avatar: 'https://i.pravatar.cc/150?img=44', isFollowing: true },
  { id: 8, username: 'ryan_fitness', name: 'Ryan Martinez', avatar: 'https://i.pravatar.cc/150?img=55', isFollowing: false },
];

const MOCK_FOLLOWING = [
  { id: 1, username: 'tech_guru', name: 'Tech Insider', avatar: 'https://i.pravatar.cc/150?img=60', isFollowing: true },
  { id: 2, username: 'nature_shots', name: 'Nature Photography', avatar: 'https://i.pravatar.cc/150?img=61', isFollowing: true },
  { id: 3, username: 'sarah_j', name: 'Sarah Jenkins', avatar: 'https://i.pravatar.cc/150?img=5', isFollowing: true },
  { id: 4, username: 'daily_quotes', name: 'Daily Inspiration', avatar: 'https://i.pravatar.cc/150?img=62', isFollowing: true },
  { id: 5, username: 'emma_travels', name: 'Emma Wilson', avatar: 'https://i.pravatar.cc/150?img=9', isFollowing: true },
];

export default function Connections() {
  const router = useRouter();
  const { tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>((tab as string) === 'following' ? 'following' : 'followers');
  const [searchQuery, setSearchQuery] = useState('');

  const currentList = activeTab === 'followers' ? MOCK_FOLLOWERS : MOCK_FOLLOWING;
  const filteredList = currentList.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>alex_chen</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'followers' && styles.tabActive]} onPress={() => setActiveTab('followers')}>
          <Text style={[styles.tabText, activeTab === 'followers' && styles.tabTextActive]}>1,14k Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'following' && styles.tabActive]} onPress={() => setActiveTab('following')}>
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>63 Following</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={styles.searchInput} placeholder="Search" placeholderTextColor="#9CA3AF" value={searchQuery} onChangeText={setSearchQuery} />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredList}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No users found.</Text></View>}
        renderItem={({ item }) => (
          <View style={styles.userRow}>
            <View style={styles.userInfo}>
              <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
              <View>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.fullName}>{item.name}</Text>
              </View>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>{activeTab === 'followers' ? 'Remove' : 'Following'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 6 }}><Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" /></TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  backBtn: { padding: 8, marginRight: 16 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#333' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#fff' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#fff' },
  searchContainer: { padding: 16 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceMid, borderRadius: 12, paddingHorizontal: 12, height: 40 },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userAvatar: { width: 48, height: 48, borderRadius: 24 },
  username: { fontSize: 14, fontWeight: '600', color: '#fff' },
  fullName: { fontSize: 14, color: '#9CA3AF' },
  userActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { paddingHorizontal: 20, paddingVertical: 6, backgroundColor: Colors.surfaceMid, borderRadius: 8 },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  empty: { alignItems: 'center', justifyContent: 'center', height: 160 },
  emptyText: { color: '#9CA3AF' },
});
