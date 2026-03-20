import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function VideoCall() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Main Video (Other Person) */}
      <Image source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop' }} style={StyleSheet.absoluteFill} />
      <View style={styles.gradientBottom} />
      <View style={styles.gradientTop} />

      {/* PiP (Self) */}
      <View style={styles.pip}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop' }} style={styles.pipImage} />
      </View>

      {/* Timer */}
      <View style={styles.timer}><Text style={styles.timerText}>05:24</Text></View>

      {/* Bottom User Info */}
      <View style={styles.userInfo}>
        <View style={styles.userRow}>
          <Text style={styles.userInfoName}>Alex Chen</Text>
          <View style={styles.verifiedBadge}><Ionicons name="checkmark" size={10} color="#fff" /></View>
        </View>
        <Text style={styles.userInfoHandle}>@alexchen | #travel #friends</Text>
      </View>

      {/* Controls Panel */}
      <View style={styles.controlsPanel}>
        <View style={styles.controlsHandle} />
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlBtn}>
            <View style={styles.controlIcon}><Ionicons name="mic-off" size={24} color="#333" /></View>
            <Text style={styles.controlLabel}>Mute</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn}>
            <View style={styles.controlIcon}><Ionicons name="camera-reverse-outline" size={24} color="#333" /></View>
            <Text style={styles.controlLabel}>Flip Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => router.back()}>
            <View style={styles.endCallIcon}><Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} /></View>
            <Text style={styles.controlLabel}>End Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn}>
            <View style={styles.controlIcon}><Ionicons name="videocam-off-outline" size={24} color="#333" /></View>
            <Text style={styles.controlLabel}>Video Off</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  gradientBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '33%', backgroundColor: 'rgba(0,0,0,0.5)' },
  gradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 96, backgroundColor: 'rgba(0,0,0,0.3)' },
  pip: { position: 'absolute', top: 60, left: 16, width: 112, height: 160, borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', zIndex: 20 },
  pipImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  timer: { position: 'absolute', top: 60, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, zIndex: 20 },
  timerText: { fontSize: 14, fontWeight: '500', color: '#fff', letterSpacing: 2 },
  userInfo: { position: 'absolute', bottom: 200, left: 24, zIndex: 20 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  userInfoName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  verifiedBadge: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' },
  userInfoHandle: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.9)' },
  controlsPanel: { position: 'absolute', bottom: 32, left: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 32, padding: 24, zIndex: 30 },
  controlsHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  controlBtn: { alignItems: 'center', gap: 8 },
  controlIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  endCallIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  controlLabel: { fontSize: 12, fontWeight: '600', color: '#333' },
});
