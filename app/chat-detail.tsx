import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/theme';

export default function ChatDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');

  const chat = { name: 'Alex Chen', handle: '@alex_chen', avatar: 'https://i.pravatar.cc/150?img=11', online: true };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: chat.avatar }} style={styles.headerAvatar} />
            {chat.online && <View style={styles.onlineDot} />}
          </View>
          <View>
            <Text style={styles.handleText}>{chat.handle}</Text>
            <Text style={styles.nameText}>{chat.name}</Text>
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push({ pathname: '/video-call', params: { id: String(id) } })} style={styles.headerActionBtn}>
            <Ionicons name="videocam-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messages} contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 16 }}>
        {/* Received */}
        <View style={styles.receivedMsg}>
          <View style={styles.receivedBubble}><Text style={styles.msgText}>Hey! Did you see that new video? It's hilarious!</Text></View>
          <Text style={styles.timeStamp}>10:05 AM</Text>
        </View>
        {/* Sent */}
        <View style={styles.sentMsg}>
          <View style={styles.sentBubble}><Text style={styles.msgText}>Yeah, I saw it! Totally reminds me of that TikTok trend.</Text></View>
          <View style={styles.sentMeta}><Text style={styles.timeStamp}>10:06 AM</Text><Ionicons name="checkmark" size={16} color="#2563EB" /></View>
        </View>
        {/* Received Image */}
        <View style={styles.receivedMsg}>
          <View style={styles.receivedBubble}>
            <View style={styles.sharedImageWrapper}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=400&auto=format&fit=crop' }} style={styles.sharedImage} />
              <Image source={{ uri: chat.avatar }} style={styles.sharedImageAvatar} />
            </View>
            <View style={styles.likeInfo}>
              <View style={styles.likeIcon}><Ionicons name="heart" size={10} color="#EF4444" /></View>
              <Text style={styles.likeText}>Liked by 45 people</Text>
            </View>
          </View>
          <Text style={styles.timeStamp}>10:07 AM</Text>
        </View>
        {/* Sent */}
        <View style={styles.sentMsg}>
          <View style={styles.sentBubble}><Text style={styles.msgText}>That's awesome! We should go there sometime. 😂</Text></View>
          <View style={styles.sentMeta}><Text style={styles.timeStamp}>10:08 AM</Text><Ionicons name="checkmark" size={16} color="#2563EB" /></View>
        </View>
        {/* Received Video */}
        <View style={styles.receivedMsg}>
          <View style={styles.receivedBubble}>
            <View style={styles.videoPreview}>
              <View style={styles.playButton}><Ionicons name="play" size={20} color="#fff" /></View>
              <View style={styles.progressBar}><View style={styles.progressFill} /><View style={styles.progressThumb} /></View>
            </View>
            <Text style={styles.videoTitle}>New TikTok Share</Text>
          </View>
          <Text style={styles.timeStamp}>10:09 AM</Text>
        </View>
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.emojiBtn}><Ionicons name="happy-outline" size={24} color="#fff" /></TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={message} onChangeText={setMessage} placeholder="Message..." placeholderTextColor="#9CA3AF" />
            {message.trim().length > 0 ? (
              <TouchableOpacity style={styles.sendBtn}><Ionicons name="send" size={20} color="#3B82F6" /></TouchableOpacity>
            ) : (
              <View style={styles.inputActions}>
                <TouchableOpacity><Ionicons name="camera-outline" size={20} color="#fff" /></TouchableOpacity>
                <TouchableOpacity><Ionicons name="image-outline" size={20} color="#fff" /></TouchableOpacity>
              </View>
            )}
          </View>
          {!message.trim().length && (
            <TouchableOpacity style={styles.micOuterBtn}><Ionicons name="mic" size={20} color="#fff" /></TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 8, paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { padding: 8, marginRight: 4 },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrapper: { position: 'relative' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.1)' },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.green, borderWidth: 2, borderColor: '#000' },
  handleText: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  nameText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  onlineText: { fontSize: 12, color: Colors.green, fontWeight: '500' },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerActionBtn: { padding: 8 },
  messages: { flex: 1 },
  receivedMsg: { alignItems: 'flex-start', maxWidth: '85%' },
  receivedBubble: { backgroundColor: Colors.surfaceMid, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderTopLeftRadius: 4 },
  sentMsg: { alignItems: 'flex-end', alignSelf: 'flex-end', maxWidth: '85%' },
  sentBubble: { backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderTopRightRadius: 4 },
  msgText: { fontSize: 16, color: '#fff', lineHeight: 22 },
  timeStamp: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  sentMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  sharedImageWrapper: { borderRadius: 12, overflow: 'hidden', marginBottom: 8, position: 'relative' },
  sharedImage: { width: 240, height: 160, resizeMode: 'cover' },
  sharedImageAvatar: { position: 'absolute', top: 8, left: 8, width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#000' },
  likeInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4 },
  likeIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.2)', alignItems: 'center', justifyContent: 'center' },
  likeText: { fontSize: 13, color: '#D1D5DB', fontWeight: '500' },
  videoPreview: { width: 240, height: 140, backgroundColor: '#000', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8, position: 'relative' },
  playButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  progressBar: { position: 'absolute', bottom: 12, left: 12, right: 12, height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, flexDirection: 'row', alignItems: 'center' },
  progressFill: { width: '33%', height: '100%', backgroundColor: '#fff', borderRadius: 2 },
  progressThumb: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff', marginLeft: -6 },
  videoTitle: { fontSize: 15, fontWeight: '700', color: '#fff', paddingHorizontal: 4 },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 12, paddingBottom: 32, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.1)' },
  emojiBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceMid, alignItems: 'center', justifyContent: 'center' },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceMid, borderRadius: 999, paddingHorizontal: 12, height: 40 },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  sendBtn: { padding: 4 },
  inputActions: { flexDirection: 'row', gap: 12, marginLeft: 8 },
  micOuterBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceMid, alignItems: 'center', justifyContent: 'center' },
});
