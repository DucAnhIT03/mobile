import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import { ChevronLeft, MoreHorizontal, Camera, Image as ImageIcon, Mic, Send, Play } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Polygon, Rect, Polyline, Path } from 'react-native-svg';
import { chatApi, MessageItem } from '../api/chatApi';
import { getSocket } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';
import { showAlert } from '../utils/alert';
import { BASE_URL } from '../services/api';

export default function ChatDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const conversationId = parseInt(route.params?.id);
  const chatName = route.params?.name || 'Chat';
  const rawAvatar = route.params?.avatar;
  const chatAvatar = rawAvatar ? (rawAvatar.startsWith('http') ? rawAvatar : `${BASE_URL}${rawAvatar}`) : 'https://i.pravatar.cc/150';
  const chatOnline = route.params?.isOnline || false;

  // Load tin nhắn
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await chatApi.getMessages(conversationId);
        setMessages(res.data);
        // Đánh dấu đã đọc
        chatApi.markAsRead(conversationId);
      } catch (error: any) {
        showAlert('Lỗi', 'Không thể tải tin nhắn');
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [conversationId]);

  // WebSocket: join room, lắng nghe tin nhắn mới & typing
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Join conversation room
    socket.emit('joinConversation', { conversationId });

    // Lắng nghe tin nhắn mới
    const handleNewMessage = (msg: any) => {
      if (msg.conversationId === conversationId) {
        const newMsg: MessageItem = {
          ...msg,
          isMine: msg.senderId === user?.id,
        };
        setMessages((prev) => [...prev, newMsg]);
        // Đánh dấu đã đọc
        socket.emit('markRead', { conversationId });
      }
    };

    // Lắng nghe typing
    const handleTyping = (data: any) => {
      if (data.conversationId === conversationId && data.userId !== user?.id) {
        setIsTyping(data.isTyping);
        setTypingUser(data.username || '');
      }
    };

    // Lắng nghe đã đọc
    const handleMessagesRead = (data: any) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleTyping);
    socket.on('messagesRead', handleMessagesRead);

    return () => {
      socket.emit('leaveConversation', { conversationId });
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleTyping);
      socket.off('messagesRead', handleMessagesRead);
    };
  }, [conversationId, user?.id]);

  // Gửi tin nhắn qua WebSocket
  const handleSend = () => {
    if (!message.trim()) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit('sendMessage', {
      conversationId,
      content: message.trim(),
      type: 'text',
    });

    // Dừng typing
    socket.emit('typing', { conversationId, isTyping: false });
    setMessage('');
  };

  // Gửi typing event
  const handleTextChange = (text: string) => {
    setMessage(text);

    const socket = getSocket();
    if (!socket) return;

    socket.emit('typing', { conversationId, isTyping: true });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Dừng typing sau 2 giây không gõ
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { conversationId, isTyping: false });
    }, 2000);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: MessageItem }) => {
    if (item.isMine) {
      return (
        <View style={styles.sentBubbleRow}>
          <View style={styles.sentBubble}>
            <Text style={styles.msgText}>{item.content}</Text>
          </View>
          <View style={styles.sentMeta}>
            <Text style={styles.timeLabel}>{formatTime(item.createdAt)}</Text>
            {item.isRead && (
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Polyline points="20 6 9 17 4 12" />
              </Svg>
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={styles.receivedBubbleRow}>
        <View style={styles.receivedBubble}>
          <Text style={styles.msgText}>{item.content}</Text>
        </View>
        <Text style={styles.timeLabel}>{formatTime(item.createdAt)}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: chatAvatar }} style={styles.headerAvatar} />
            {chatOnline && <View style={styles.onlineDot} />}
          </View>
          <View style={{ flex: 1, flexShrink: 1 }}>
            <Text style={styles.chatName} numberOfLines={1}>{chatName}</Text>
            {isTyping ? (
              <Text style={styles.typingText}>Đang gõ...</Text>
            ) : (
              <Text style={styles.onlineText}>{chatOnline ? 'Online' : 'Offline'}</Text>
            )}
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('VideoCall', {
            targetUserId: route.params?.targetUserId,
            targetName: chatName,
            targetAvatar: chatAvatar,
            callType: 'voice',
            conversationId,
            isIncoming: false,
          })} style={styles.actionBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('VideoCall', {
            targetUserId: route.params?.targetUserId,
            targetName: chatName,
            targetAvatar: chatAvatar,
            callType: 'video',
            conversationId,
            isIncoming: false,
          })} style={styles.actionBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Polygon points="23 7 16 12 23 17 23 7" />
              <Rect x={1} y={5} width={15} height={14} rx={2} ry={2} />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><MoreHorizontal size={24} color="#fff" /></TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => {
            setRefreshing(true);
            try {
              const res = await chatApi.getMessages(conversationId);
              setMessages(res.data);
            } catch (e) {}
            setRefreshing(false);
          }} tintColor="#3b82f6" colors={['#3b82f6']} />
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyMessagesContainer}>
              <Text style={styles.emptyMessagesText}>Bắt đầu cuộc trò chuyện!</Text>
              <Text style={styles.emptyMessagesSubtext}>Gửi tin nhắn đầu tiên</Text>
            </View>
          ) : null
        }
      />

      {/* Typing indicator */}
      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingIndicatorText}>{typingUser} đang gõ...</Text>
        </View>
      )}

      {/* Input Area */}
      <View style={[styles.inputArea, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.emojiBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx={12} cy={12} r={10} />
            <Path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <Line x1={9} y1={9} x2={9.01} y2={9} />
            <Line x1={15} y1={9} x2={15.01} y2={9} />
          </Svg>
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={handleTextChange}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#9ca3af"
          />
          <View style={styles.inputActions}>
            {message.trim().length > 0 ? (
              <TouchableOpacity onPress={handleSend}>
                <Send size={20} color="#3b82f6" />
              </TouchableOpacity>
            ) : (
              <>
                <Camera size={20} color="#fff" />
                <ImageIcon size={20} color="#fff" />
              </>
            )}
          </View>
        </View>
        {!message.trim().length && (
          <TouchableOpacity style={styles.micBtn}><Mic size={20} color="#fff" /></TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 8 },
  avatarWrapper: { position: 'relative' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#22c55e', borderWidth: 2, borderColor: '#000' },
  chatName: { fontSize: 17, fontWeight: 'bold', color: '#fff', maxWidth: 180 },
  onlineText: { fontSize: 12, color: '#22c55e', fontWeight: '500' },
  typingText: { fontSize: 12, color: '#3b82f6', fontWeight: '500' },
  headerActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8 },
  messagesContent: { padding: 16, gap: 16, flexGrow: 1 },
  receivedBubbleRow: { alignItems: 'flex-start', maxWidth: '85%' },
  receivedBubble: { backgroundColor: '#262626', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderTopLeftRadius: 4 },
  sentBubbleRow: { alignItems: 'flex-end', alignSelf: 'flex-end', maxWidth: '85%' },
  sentBubble: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderTopRightRadius: 4 },
  msgText: { fontSize: 16, color: '#fff', lineHeight: 22 },
  timeLabel: { fontSize: 12, color: '#6b7280', marginTop: 4, marginLeft: 4 },
  sentMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginRight: 4 },
  emptyMessagesContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyMessagesText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  emptyMessagesSubtext: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  typingIndicator: { paddingHorizontal: 20, paddingVertical: 4 },
  typingIndicatorText: { fontSize: 13, color: '#3b82f6', fontStyle: 'italic' },
  inputArea: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  emojiBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#262626', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  inputActions: { flexDirection: 'row', gap: 12, marginLeft: 8 },
  micBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#262626', alignItems: 'center', justifyContent: 'center' },
});
