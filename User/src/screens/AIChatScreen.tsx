import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Animated, Easing,
} from 'react-native';
import { ChevronLeft, Send, Sparkles, Lightbulb, Code, Pencil, Globe, RotateCcw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { aiApi, AiChatMessage } from '../api/aiApi';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
};

const SUGGESTIONS = [
  { icon: Lightbulb, label: 'Giải thích khái niệm', prompt: 'Giải thích cho tôi về trí tuệ nhân tạo' },
  { icon: Code, label: 'Viết code', prompt: 'Viết cho tôi một hàm sắp xếp mảng bằng JavaScript' },
  { icon: Pencil, label: 'Viết nội dung', prompt: 'Viết cho tôi một bài thơ về mùa xuân' },
  { icon: Globe, label: 'Dịch ngôn ngữ', prompt: 'Dịch câu "Hello, how are you?" sang tiếng Việt' },
];

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, easing: Easing.ease, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, easing: Easing.ease, useNativeDriver: true }),
        ])
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  const dotStyle = (anim: Animated.Value) => ({
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 1, 0.4] }),
  });

  return (
    <View style={styles.typingRow}>
      <LinearGradient colors={['#2563eb', '#3b82f6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.aiAvatarSmall}>
        <Sparkles size={12} color="#fff" />
      </LinearGradient>
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[styles.typingDot, dotStyle(dot)]} />
        ))}
      </View>
    </View>
  );
}

export default function AIChatScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 500, useNativeDriver: true,
    }).start();
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const getNow = () => {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || message).trim();
    if (!msg || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), text: msg, isUser: true, timestamp: getNow() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setMessage('');
    scrollToBottom();
    setIsTyping(true);

    try {
      // Build conversation history for AI context
      const history: AiChatMessage[] = updatedMessages.map(m => ({
        role: m.isUser ? 'user' : 'model',
        text: m.text,
      }));

      const res = await aiApi.chat(history);
      const reply = res.data.reply || 'Xin lỗi, tôi không thể trả lời lúc này.';
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: reply, isUser: false, timestamp: getNow() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Không thể kết nối AI. Vui lòng kiểm tra kết nối mạng và thử lại! 🔄',
        isUser: false,
        timestamp: getNow(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const handleSuggestion = (prompt: string) => {
    sendMessage(prompt);
  };

  const clearChat = () => {
    setMessages([]);
    setIsTyping(false);
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
        <View style={styles.headerCenter}>
          <LinearGradient colors={['#2563eb', '#3b82f6', '#60a5fa']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.aiAvatar}>
            <Sparkles size={20} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.aiName}>AI Assistant</Text>
            <Text style={styles.aiStatus}>Luôn sẵn sàng hỗ trợ</Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
          <RotateCcw size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesArea}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={['#2563eb', '#3b82f6', '#60a5fa']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.welcomeIcon}
            >
              <Sparkles size={40} color="#fff" />
            </LinearGradient>
            <Text style={styles.welcomeTitle}>AI Assistant</Text>
            <Text style={styles.welcomeSubtitle}>
              Xin chào! Tôi là trợ lý AI của bạn.{'\n'}Hãy hỏi tôi bất cứ điều gì!
            </Text>

            {/* Suggestions */}
            <View style={styles.suggestionsGrid}>
              {SUGGESTIONS.map((s, i) => (
                <TouchableOpacity key={i} style={styles.suggestionCard} onPress={() => handleSuggestion(s.prompt)}>
                  <s.icon size={20} color="#3b82f6" />
                  <Text style={styles.suggestionText}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        ) : (
          <>
            {messages.map((msg) => (
              <View key={msg.id} style={msg.isUser ? styles.userMsgRow : styles.aiMsgRow}>
                {!msg.isUser && (
                  <LinearGradient colors={['#2563eb', '#3b82f6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.aiAvatarSmall}>
                    <Sparkles size={12} color="#fff" />
                  </LinearGradient>
                )}
                <View style={[msg.isUser ? styles.userBubble : styles.aiBubble]}>
                  <Text style={styles.msgText}>{msg.text}</Text>
                </View>
              </View>
            ))}
            {isTyping && <TypingIndicator />}

            {/* Quick suggestions after AI response */}
            {messages.length > 0 && !isTyping && (
              <View style={styles.quickSuggestions}>
                {SUGGESTIONS.slice(0, 2).map((s, i) => (
                  <TouchableOpacity key={i} style={styles.quickChip} onPress={() => handleSuggestion(s.prompt)}>
                    <s.icon size={14} color="#3b82f6" />
                    <Text style={styles.quickChipText}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputArea, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Hỏi AI bất cứ điều gì..."
            placeholderTextColor="#6b7280"
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={!message.trim() || isTyping}
            style={[styles.sendBtn, message.trim() && !isTyping ? styles.sendBtnActive : null]}
          >
            <Send size={18} color={message.trim() && !isTyping ? '#fff' : '#6b7280'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>AI có thể tạo ra thông tin không chính xác</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 8 },
  aiAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  aiName: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
  aiStatus: { fontSize: 12, color: '#3b82f6', fontWeight: '500' },
  clearBtn: { padding: 8 },

  // Messages
  messagesArea: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 24 },

  // Welcome
  welcomeContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  welcomeIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  welcomeSubtitle: { fontSize: 16, color: '#9ca3af', textAlign: 'center', lineHeight: 24, marginBottom: 32 },

  // Suggestions
  suggestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', width: '100%' },
  suggestionCard: {
    width: '45%', backgroundColor: '#2A2A2A', borderWidth: 1, borderColor: '#374151',
    borderRadius: 16, padding: 16, gap: 10, alignItems: 'flex-start',
  },
  suggestionText: { fontSize: 14, fontWeight: '600', color: '#d1d5db' },

  // Message bubbles
  userMsgRow: { alignItems: 'flex-end', marginBottom: 16 },
  aiMsgRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 16, maxWidth: '90%' },
  aiAvatarSmall: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  userBubble: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderBottomRightRadius: 6, maxWidth: '85%' },
  aiBubble: { backgroundColor: '#2A2A2A', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderTopLeftRadius: 6, flex: 1 },
  msgText: { fontSize: 15, color: '#fff', lineHeight: 22 },

  // Typing
  typingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 16 },
  typingBubble: { flexDirection: 'row', gap: 4, backgroundColor: '#2A2A2A', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 20, borderTopLeftRadius: 6 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3b82f6' },

  // Quick suggestions
  quickSuggestions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 },
  quickChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#2A2A2A', borderWidth: 1, borderColor: '#374151',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  quickChipText: { fontSize: 13, color: '#9ca3af', fontWeight: '500' },

  // Input
  inputArea: { paddingHorizontal: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#2A2A2A', borderRadius: 24, paddingLeft: 16, paddingRight: 6, paddingVertical: 4, gap: 8 },
  input: { flex: 1, color: '#fff', fontSize: 15, maxHeight: 100, paddingVertical: 10 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  sendBtnActive: { backgroundColor: '#3b82f6' },
  disclaimer: { fontSize: 11, color: '#4b5563', textAlign: 'center', marginTop: 6 },
});
