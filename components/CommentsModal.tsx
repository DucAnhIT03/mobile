import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

interface Comment {
  id: number;
  user: string;
  userImage: string;
  text: string;
  time: string;
  likes: number;
  isLiked: boolean;
}

const initialComments: Comment[] = [
  { id: 1, user: 'sarah.j', userImage: 'https://i.pravatar.cc/150?img=32', text: 'This is so beautiful! 😍', time: '2h', likes: 12, isLiked: false },
  { id: 2, user: 'mike.travels', userImage: 'https://i.pravatar.cc/150?img=47', text: 'Wow, amazing shot!', time: '1h', likes: 5, isLiked: true },
  { id: 3, user: 'emma_w', userImage: 'https://i.pravatar.cc/150?img=5', text: 'Need to go there ASAP 🔥', time: '45m', likes: 0, isLiked: false },
  { id: 4, user: 'david.dev', userImage: 'https://i.pravatar.cc/150?img=8', text: 'What camera did you use?', time: '10m', likes: 2, isLiked: false },
];

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommentsModal({ isOpen, onClose }: CommentsModalProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');

  const toggleLike = (commentId: number) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
      }
      return c;
    }));
  };

  const handlePost = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now(),
      user: 'alex_chen',
      userImage: 'https://i.pravatar.cc/150?img=12',
      text: newComment,
      time: 'Just now',
      likes: 0,
      isLiked: false,
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ width: 24 }} />
            <Text style={styles.headerTitle}>Comments</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
          </View>

          {/* Comments List */}
          <FlatList
            data={comments}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{ padding: 16, gap: 20 }}
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <Image source={{ uri: item.userImage }} style={styles.commentAvatar} />
                <View style={{ flex: 1 }}>
                  <View style={styles.commentContent}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.commentText}>
                        <Text style={styles.commentUser}>{item.user} </Text>
                        {item.text}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleLike(item.id)} style={{ paddingLeft: 8 }}>
                      <Ionicons name={item.isLiked ? 'heart' : 'heart-outline'} size={14} color={item.isLiked ? '#EF4444' : '#9CA3AF'} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.commentMeta}>
                    <Text style={styles.metaText}>{item.time}</Text>
                    {item.likes > 0 && <Text style={styles.metaText}>{item.likes}</Text>}
                    <Text style={styles.metaTextBtn}>Reply</Text>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Input */}
          <View style={styles.inputBar}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=12' }} style={styles.inputAvatar} />
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment..."
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={handlePost}
                returnKeyType="send"
              />
              {newComment.trim().length > 0 && (
                <TouchableOpacity onPress={handlePost} style={styles.postBtn}>
                  <Text style={styles.postBtnText}>Post</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContainer: { height: '70%', backgroundColor: Colors.surfaceLight, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  commentRow: { flexDirection: 'row', gap: 12 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18 },
  commentContent: { flexDirection: 'row', alignItems: 'flex-start' },
  commentText: { fontSize: 13, color: '#E5E7EB', lineHeight: 18 },
  commentUser: { fontWeight: '600', color: '#fff' },
  commentMeta: { flexDirection: 'row', gap: 16, marginTop: 4 },
  metaText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  metaTextBtn: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingBottom: 36, borderTopWidth: 0.5, borderTopColor: '#333', backgroundColor: Colors.surfaceLight },
  inputAvatar: { width: 36, height: 36, borderRadius: 18 },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceHigh, borderRadius: 999, paddingHorizontal: 16, height: 40 },
  input: { flex: 1, color: '#fff', fontSize: 14 },
  postBtn: { marginLeft: 8 },
  postBtnText: { color: '#3B82F6', fontWeight: '600', fontSize: 14 },
});
