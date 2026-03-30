import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Smartphone, ArrowUpRight, Eye, EyeOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { authApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { connectSocket } from '../services/socket';
import { showAlert } from '../utils/alert';

export default function LoginScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({ email: email.trim(), password });
      const { user, token } = response.data;

      await setAuth(user, token);
      await connectSocket();

      navigation.replace('MainTabs');
    } catch (error: any) {
      let msg = 'Đăng nhập thất bại. Kiểm tra kết nối server.';
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message?.includes('Network')) {
        msg = 'Không thể kết nối server. Kiểm tra backend đã chạy chưa.';
      }
      showAlert('Thông báo', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#7e22ce', '#ec4899', '#f97316']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <LinearGradient colors={['#9333ea', '#ec4899']} style={styles.logoInnerCircle}>
              <View style={styles.logoInnerDot}>
                <View style={styles.logoPurpleDot} />
              </View>
            </LinearGradient>
          </View>
          <Text style={styles.appName}>ConnectDucAnh</Text>
        </View>

        <View style={styles.headingContainer}>
          <Text style={styles.heading}>Welcome Back!</Text>
          <Text style={styles.subheading}>Sign in to continue.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <Smartphone size={20} color="rgba(255,255,255,0.7)" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputIcon}>
              <Lock size={20} color="rgba(255,255,255,0.7)" />
            </View>
            <TextInput
              ref={passwordRef}
              style={[styles.input, { paddingRight: 110 }]}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.7)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} color="rgba(255,255,255,0.7)" /> : <Eye size={20} color="rgba(255,255,255,0.7)" />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.8} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ec4899" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Login</Text>
                <ArrowUpRight size={20} color="#ec4899" strokeWidth={3} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="black">
              <Path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.93 3.57-.84 1.51.11 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.61 1.54-1.58 3.12-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </Svg>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="#1877F2">
              <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </Svg>
          </TouchableOpacity>
        </View>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  logoInnerCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  logoInnerDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  logoPurpleDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#9333ea' },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 8, letterSpacing: -0.5 },
  headingContainer: { alignItems: 'center', marginBottom: 40 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subheading: { fontSize: 18, color: 'rgba(255,255,255,0.8)' },
  form: { width: '100%', gap: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 999, overflow: 'hidden' },
  inputIcon: { paddingLeft: 16, paddingRight: 8 },
  input: { flex: 1, paddingVertical: 16, paddingRight: 16, color: '#fff', fontSize: 16 },
  forgotBtn: { position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' },
  forgotText: { color: 'rgba(255,255,255,0.9)', fontWeight: '600', fontSize: 14 },
  eyeBtn: { position: 'absolute', right: 70, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 8 },
  loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 999, paddingVertical: 16, marginTop: 8, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 15, elevation: 5 },
  loginBtnText: { fontSize: 18, fontWeight: 'bold', color: '#7e22ce' },
  divider: { flexDirection: 'row', alignItems: 'center', marginTop: 40, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  dividerText: { paddingHorizontal: 16, color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 32 },
  socialBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  signupRow: { flexDirection: 'row', marginTop: 40 },
  signupText: { color: 'rgba(255,255,255,0.9)', fontSize: 15 },
  signupLink: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
