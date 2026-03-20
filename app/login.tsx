import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    router.replace('/(tabs)/feed');
  };

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoOuter}>
            <LinearGradient colors={['#9333ea', '#ec4899']} style={styles.logoGradient}>
              <View style={styles.logoInnerCircle}>
                <View style={styles.logoDot} />
              </View>
            </LinearGradient>
          </View>
          <Text style={styles.appName}>ConnectDucAnh</Text>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to continue.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="phone-portrait-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone number or Email"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={phone}
              onChangeText={setPhone}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { paddingRight: 80 }]}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>Login</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.pink} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={24} color="#EA4335" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          </TouchableOpacity>
        </View>

        {/* Sign up */}
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 48 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoOuter: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  logoGradient: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  logoInnerCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  logoDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#9333ea' },
  appName: { fontSize: 32, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
  welcomeSection: { alignItems: 'center', marginBottom: 40 },
  welcomeTitle: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  welcomeSubtitle: { fontSize: 18, color: 'rgba(255,255,255,0.8)' },
  form: { width: '100%', gap: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 999, paddingHorizontal: 16, height: 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  forgotBtn: { position: 'absolute', right: 24, top: 0, bottom: 0, justifyContent: 'center' },
  forgotText: { color: 'rgba(255,255,255,0.9)', fontWeight: '500', fontSize: 14 },
  loginButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 16, marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 30, elevation: 8 },
  loginButtonText: { fontSize: 18, fontWeight: '700', color: '#7e22ce' },
  divider: { flexDirection: 'row', alignItems: 'center', marginTop: 40, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  dividerText: { marginHorizontal: 16, color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 32 },
  socialButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  signupRow: { flexDirection: 'row', alignItems: 'center', marginTop: 40 },
  signupText: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  signupLink: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
