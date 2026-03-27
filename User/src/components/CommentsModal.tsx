import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { X, Heart, Trash2 } from 'lucide-react-native';
import { postApi, CommentItem } from '../api/postApi';
import { useAuth } from '../contexts/AuthContext';
import { BASE_URL } from '../services/api';
import { showAlert } from '../utils/alert';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: number;
  onCommentAdded?: () => void;
}

export function CommentsModal({ isOpen, onClose, postId, onCommentAdded }: CommentsModalProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const { user } = useAuth();

  // Load comments khi mở modal
  useEffect(() => {
    if (isOpen && postId) {
      loadComments();
    }
    if (!isOpen) {
      setComments([]);
    }
  }, [isOpen, postId]);

  const loadComments = async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await postApi.getComments(postId);
      setComments(res.data.comments || []);
    } catch {
      showAlert('Lỗi', 'Không thể tải bình luận');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newComment.trim() || !postId || posting) return;
    setPosting(true);
    try {
      const res = await postApi.addComment(postId, newComment.trim());
      setComments([res.data, ...comments]);
      setNewComment('');
      onCommentAdded?.();
    } catch {
      showAlert('Lỗi', 'Không thể gửi bình luận');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await postApi.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch {
      showAlert('Lỗi', 'Không thể xóa bình luận');
    }
  };

  const resolveAvatar = (avatar?: string) => {
    if (!avatar) return 'https://i.pravatar.cc/150';
    return avatar.startsWith('http') ? avatar : `${BASE_URL}${avatar}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes}p`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return `${Math.floor(diffDays / 7)}w`;
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ width: 24 }} />
            <Text style={styles.headerTitle}>Bình luận</Text>
            <TouchableOpacity onPress={onClose}><X size={24} color="#fff" /></TouchableOpacity>
          </View>

          {/* Comments List */}
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <Text style={{ color: '#6b7280', fontSize: 15 }}>Chưa có bình luận nào</Text>
                  <Text style={{ color: '#4b5563', fontSize: 13, marginTop: 4 }}>Hãy là người đầu tiên bình luận!</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  <Image source={{ uri: resolveAvatar(item.user?.avatar) }} style={styles.avatar} />
                  <View style={styles.commentContent}>
                    <View style={styles.commentTextRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.commentText}>
                          <Text style={styles.commentUser}>{item.user?.displayName || item.user?.username || 'User'}  </Text>
                          {item.content}
                        </Text>
                      </View>
                      {item.userId === user?.id && (
                        <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginLeft: 8, padding: 4 }}>
                          <Trash2 size={14} color="#6b7280" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.commentMeta}>
                      <Text style={styles.metaText}>{formatTime(item.createdAt)}</Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )}

          {/* Input Area */}
          <View style={styles.inputArea}>
            <Image source={{ uri: resolveAvatar(user?.avatar) }} style={styles.inputAvatar} />
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Thêm bình luận..."
                placeholderTextColor="#6b7280"
                onSubmitEditing={handlePost}
                returnKeyType="send"
              />
              {newComment.trim() ? (
                <TouchableOpacity onPress={handlePost} style={styles.postBtn} disabled={posting}>
                  <Text style={[styles.postText, posting && { opacity: 0.5 }]}>Đăng</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContainer: { height: '70%', backgroundColor: '#1A1A1A', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#374151' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  listContent: { padding: 16, gap: 20 },
  commentRow: { flexDirection: 'row', gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  commentContent: { flex: 1 },
  commentTextRow: { flexDirection: 'row', alignItems: 'flex-start' },
  commentText: { fontSize: 13, color: '#e5e7eb', lineHeight: 18 },
  commentUser: { fontWeight: '700', color: '#fff' },
  commentMeta: { flexDirection: 'row', gap: 16, marginTop: 4 },
  metaText: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  inputArea: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: '#374151', backgroundColor: '#1A1A1A' },
  inputAvatar: { width: 36, height: 36, borderRadius: 18 },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#2A2A2A', borderRadius: 999, paddingLeft: 16, paddingRight: 12 },
  input: { flex: 1, paddingVertical: 10, color: '#fff', fontSize: 14 },
  postBtn: { paddingLeft: 8 },
  postText: { color: '#3b82f6', fontWeight: '600', fontSize: 14 },
});
