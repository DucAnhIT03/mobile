import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';

export default function ForgotPassword() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('');

  const handleReset = () => {
    Alert.alert('Success', 'Password reset link sent to your email/phone!');
    router.push('/login');
  };

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      {/* Back Button */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Lock Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed-outline" size={48} color="#fff" />
          </View>
        </View>

        <View style={styles.textSection}>
          <Text style={styles.title}>Trouble logging in?</Text>
          <Text style={styles.subtitle}>
            Enter your email, phone, or username and we'll send you a link to get back into your account.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email, Phone, or Username"
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleReset} activeOpacity={0.8}>
            <Text style={styles.submitButtonText}>Send Login Link</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.pink} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.createAccountText}>Create New Account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: { paddingTop: 56, paddingHorizontal: 16 },
  backBtn: { padding: 8 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 32, paddingBottom: 100 },
  iconContainer: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  textSection: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  form: { width: '100%', gap: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 999, paddingHorizontal: 24, height: 56, color: '#fff', fontSize: 16 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 16, marginTop: 8 },
  submitButtonText: { fontSize: 18, fontWeight: '700', color: '#7e22ce' },
  divider: { flexDirection: 'row', alignItems: 'center', marginTop: 40, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  dividerText: { marginHorizontal: 16, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  createAccountText: { marginTop: 32, color: '#fff', fontWeight: '700', fontSize: 15 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 16, paddingBottom: 36, alignItems: 'center' },
  backToLoginText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
