import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Vibration } from 'react-native';
import { MicOff, Mic, RefreshCcw, PhoneOff, VideoOff, Video, Phone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getSocket } from '../services/socket';
import { BASE_URL } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type CallState = 'calling' | 'ringing' | 'connected' | 'ended';

export default function VideoCallScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { targetUserId, targetName, targetAvatar, callType, conversationId, isIncoming, callerId } = route.params || {};

  const [callState, setCallState] = useState<CallState>(isIncoming ? 'ringing' : 'calling');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'voice');
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resolveAvatar = (avatar: string | undefined) => {
    if (!avatar) return 'https://i.pravatar.cc/150';
    return avatar.startsWith('http') ? avatar : `${BASE_URL}${avatar}`;
  };

  // Bắt đầu cuộc gọi (nếu là người gọi)
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (!isIncoming) {
      // Gửi yêu cầu gọi
      socket.emit('callUser', {
        targetUserId,
        callType: callType || 'video',
        conversationId,
      });
    }

    // Lắng nghe events
    const handleCallAccepted = () => {
      setCallState('connected');
      // Bắt đầu đếm thời gian
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    };

    const handleCallRejected = () => {
      setCallState('ended');
      setTimeout(() => navigation.goBack(), 1500);
    };

    const handleCallEnded = () => {
      setCallState('ended');
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => navigation.goBack(), 1500);
    };

    const handleCallFailed = (data: any) => {
      setCallState('ended');
      setTimeout(() => navigation.goBack(), 1500);
    };

    const handleCallRinging = () => {
      setCallState('ringing');
    };

    socket.on('callAccepted', handleCallAccepted);
    socket.on('callRejected', handleCallRejected);
    socket.on('callEnded', handleCallEnded);
    socket.on('callFailed', handleCallFailed);
    socket.on('callRinging', handleCallRinging);

    return () => {
      socket.off('callAccepted', handleCallAccepted);
      socket.off('callRejected', handleCallRejected);
      socket.off('callEnded', handleCallEnded);
      socket.off('callFailed', handleCallFailed);
      socket.off('callRinging', handleCallRinging);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAcceptCall = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('acceptCall', { callerId });
    setCallState('connected');
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const handleRejectCall = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('rejectCall', { callerId });
    navigation.goBack();
  };

  const handleEndCall = () => {
    const socket = getSocket();
    if (!socket) return;
    const target = isIncoming ? callerId : targetUserId;
    socket.emit('endCall', { targetUserId: target });
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('ended');
    setTimeout(() => navigation.goBack(), 500);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getStatusText = () => {
    switch (callState) {
      case 'calling': return 'Đang gọi...';
      case 'ringing': return isIncoming ? 'Cuộc gọi đến' : 'Đang đổ chuông...';
      case 'connected': return formatDuration(duration);
      case 'ended': return 'Cuộc gọi đã kết thúc';
    }
  };

  const displayName = targetName || 'User';
  const displayAvatar = resolveAvatar(targetAvatar);

  return (
    <View style={styles.container}>
      {/* Background */}
      {callState === 'connected' && !isVideoOff ? (
        <Image source={{ uri: displayAvatar }} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={0} />
      ) : (
        <LinearGradient
          colors={['#1e1b4b', '#312e81', '#4338ca']}
          style={StyleSheet.absoluteFill}
        />
      )}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.bottomOverlay} />
      <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={[styles.topOverlay, { height: insets.top + 60 }]} />

      {/* Call Info */}
      <View style={[styles.callInfo, { paddingTop: insets.top + 60 }]}>
        <Image source={{ uri: displayAvatar }} style={styles.callerAvatar} />
        <Text style={styles.callerName}>{displayName}</Text>
        <Text style={styles.callStatus}>{getStatusText()}</Text>
        {callType === 'voice' && callState === 'connected' && (
          <View style={styles.wavesContainer}>
            {[...Array(5)].map((_, i) => (
              <View key={i} style={[styles.waveBar, { height: 12 + Math.random() * 24 }]} />
            ))}
          </View>
        )}
      </View>

      {/* Controls */}
      {isIncoming && callState === 'ringing' ? (
        // Incoming call — Accept / Reject
        <View style={[styles.incomingControls, { bottom: insets.bottom + 40 }]}>
          <TouchableOpacity style={styles.controlBtn} onPress={handleRejectCall}>
            <View style={styles.rejectCircle}><PhoneOff size={28} color="#fff" /></View>
            <Text style={styles.controlLabel}>Từ chối</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={handleAcceptCall}>
            <View style={styles.acceptCircle}><Phone size={28} color="#fff" /></View>
            <Text style={styles.controlLabel}>Chấp nhận</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // In-call controls
        <View style={[styles.controlsPanel, { bottom: insets.bottom + 16 }]}>
          <View style={styles.controlsDragHandle} />
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlBtn} onPress={() => setIsMuted(!isMuted)}>
              <View style={[styles.controlCircle, isMuted && styles.controlCircleActive]}>
                {isMuted ? <MicOff size={24} color="#fff" /> : <Mic size={24} color="#1f2937" />}
              </View>
              <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn}>
              <View style={styles.controlCircle}><RefreshCcw size={24} color="#1f2937" /></View>
              <Text style={styles.controlLabel}>Flip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={handleEndCall}>
              <View style={styles.endCallCircle}><PhoneOff size={28} color="#fff" /></View>
              <Text style={styles.controlLabel}>Kết thúc</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={() => setIsVideoOff(!isVideoOff)}>
              <View style={[styles.controlCircle, isVideoOff && styles.controlCircleActive]}>
                {isVideoOff ? <VideoOff size={24} color="#fff" /> : <Video size={24} color="#1f2937" />}
              </View>
              <Text style={styles.controlLabel}>{isVideoOff ? 'Video On' : 'Video Off'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bottomOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%' },
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },

  // Call info
  callInfo: { alignItems: 'center', zIndex: 10 },
  callerAvatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', marginBottom: 20 },
  callerName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  callStatus: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  wavesContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24 },
  waveBar: { width: 4, borderRadius: 2, backgroundColor: '#22c55e' },

  // Incoming call buttons
  incomingControls: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 60 },
  rejectCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
  acceptCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' },

  // In-call controls
  controlsPanel: { position: 'absolute', left: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 32, padding: 24, zIndex: 30 },
  controlsDragHandle: { width: 40, height: 4, backgroundColor: '#d1d5db', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  controlBtn: { alignItems: 'center', gap: 8 },
  controlCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  controlCircleActive: { backgroundColor: '#374151' },
  endCallCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
  controlLabel: { fontSize: 12, fontWeight: '600', color: '#1f2937' },
});
