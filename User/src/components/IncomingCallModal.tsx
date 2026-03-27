import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, Vibration, Animated } from 'react-native';
import { Phone, PhoneOff, Video } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getSocket } from '../services/socket';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../services/api';

interface IncomingCallData {
  callerId: number;
  callerName: string;
  callerAvatar: string;
  callType: 'voice' | 'video';
  conversationId: number;
}

export default function IncomingCallModal() {
  const [visible, setVisible] = useState(false);
  const [callData, setCallData] = useState<IncomingCallData | null>(null);
  const navigation = useNavigation<any>();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleIncomingCall = (data: IncomingCallData) => {
      setCallData(data);
      setVisible(true);
      Vibration.vibrate([0, 500, 300, 500, 300, 500], false);
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      pulseRef.current = anim;
      anim.start();
    };

    socket.on('incomingCall', handleIncomingCall);
    return () => { socket.off('incomingCall', handleIncomingCall); };
  }, []);

  const dismiss = () => {
    Vibration.cancel();
    pulseRef.current?.stop();
    setVisible(false);
    setCallData(null);
  };

  const handleAccept = () => {
    if (!callData) return;
    dismiss();
    // Emit accept trước khi navigate
    const socket = getSocket();
    socket?.emit('acceptCall', { callerId: callData.callerId });
    navigation.navigate('VideoCall', {
      targetUserId: callData.callerId,
      targetName: callData.callerName,
      targetAvatar: callData.callerAvatar,
      callType: callData.callType,
      conversationId: callData.conversationId,
      isIncoming: true,
      callerId: callData.callerId,
    });
  };

  const handleReject = () => {
    if (!callData) return;
    const socket = getSocket();
    socket?.emit('rejectCall', { callerId: callData.callerId });
    dismiss();
  };

  const resolveAvatar = (avatar?: string) => {
    if (!avatar) return 'https://i.pravatar.cc/150';
    return avatar.startsWith('http') ? avatar : `${BASE_URL}${avatar}`;
  };

  if (!visible || !callData) return null;

  return (
    <Modal visible transparent animationType="slide">
      <LinearGradient colors={['#1e1b4b', '#312e81', '#4338ca']} style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.callTypeLabel}>
            {callData.callType === 'video' ? '📹 Cuộc gọi video' : '📞 Cuộc gọi thoại'}
          </Text>
          <Animated.View style={[styles.avatarRing, { transform: [{ scale: pulseAnim }] }]}>
            <Image source={{ uri: resolveAvatar(callData.callerAvatar) }} style={styles.avatar} />
          </Animated.View>
          <Text style={styles.callerName}>{callData.callerName}</Text>
          <Text style={styles.statusText}>Cuộc gọi đến...</Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
            <PhoneOff size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
            {callData.callType === 'video' ? <Video size={28} color="#fff" /> : <Phone size={28} color="#fff" />}
          </TouchableOpacity>
        </View>

        <View style={styles.labelsRow}>
          <Text style={styles.btnLabel}>Từ chối</Text>
          <Text style={styles.btnLabel}>Chấp nhận</Text>
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', gap: 16 },
  callTypeLabel: { fontSize: 16, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginBottom: 16 },
  avatarRing: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', padding: 4 },
  avatar: { width: '100%', height: '100%', borderRadius: 66 },
  callerName: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  statusText: { fontSize: 16, color: 'rgba(255,255,255,0.7)' },
  buttons: { position: 'absolute', bottom: 100, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 60 },
  rejectBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
  acceptBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' },
  labelsRow: { position: 'absolute', bottom: 72, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 60 },
  btnLabel: { fontSize: 14, fontWeight: '600', color: '#fff', textAlign: 'center', width: 72 },
});
