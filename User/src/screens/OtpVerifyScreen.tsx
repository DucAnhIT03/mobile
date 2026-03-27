import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authApi } from '../api';
import { showAlert } from '../utils/alert';

export default function OtpVerifyScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const email = route.params?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer cho resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    // Xử lý paste nhiều ký tự
    if (text.length > 1) {
      const chars = text.split('').slice(0, 6);
      chars.forEach((char, i) => {
        if (index + i < 6) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      // Auto submit nếu đủ 6 ký tự
      if (newOtp.every((c) => c !== '')) {
        handleVerify(newOtp.join(''));
      }
      return;
    }

    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit khi nhập đủ 6 ký tự
    if (text && newOtp.every((c) => c !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length !== 6) {
      showAlert('Lỗi', 'Vui lòng nhập đủ 6 ký tự OTP');
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    try {
      await authApi.verifyOtp({ email, code: otpCode });

      showAlert(
        '🎉 Đăng ký thành công!',
        'Tài khoản đã được tạo. Vui lòng đăng nhập để tiếp tục.',
        [
          {
            text: 'Đăng nhập ngay',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
    } catch (error: any) {
      const message = error.response?.data?.message || 'Mã OTP không hợp lệ';
      showAlert('Lỗi', message);
      // Reset OTP fields
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await authApi.resendOtp(email);
      showAlert('Thành công', 'Mã OTP mới đã được gửi đến email của bạn');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gửi lại OTP thất bại';
      showAlert('Lỗi', message);
    } finally {
      setResending(false);
    }
  };

  return (
    <LinearGradient colors={['#7e22ce', '#ec4899', '#f97316']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={28} color="#fff" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🔐</Text>
          </View>
          <Text style={styles.heading}>Xác thực OTP</Text>
          <Text style={styles.subheading}>
            Nhập mã 6 ký tự đã gửi đến
          </Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyBtn, loading && styles.verifyBtnDisabled]}
          onPress={() => handleVerify()}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#7e22ce" />
          ) : (
            <Text style={styles.verifyBtnText}>Xác nhận</Text>
          )}
        </TouchableOpacity>

        {/* Resend */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Chưa nhận được mã? </Text>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>Gửi lại sau {countdown}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resending} style={styles.resendBtn}>
              {resending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <RefreshCw size={14} color="#fff" />
                  <Text style={styles.resendLink}> Gửi lại</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 32, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', padding: 8, marginBottom: 20 },

  headerSection: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  iconEmoji: { fontSize: 36 },
  heading: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  subheading: { fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  emailText: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 4 },

  otpContainer: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  otpInput: {
    width: 48, height: 56, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    fontSize: 24, fontWeight: 'bold', color: '#fff',
    textAlign: 'center',
  },
  otpInputFilled: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderColor: '#fff',
  },

  verifyBtn: {
    width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderRadius: 999, paddingVertical: 16,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 15, elevation: 5,
  },
  verifyBtnDisabled: { opacity: 0.7 },
  verifyBtnText: { fontSize: 18, fontWeight: 'bold', color: '#7e22ce' },

  resendContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 28 },
  resendText: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  countdownText: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  resendBtn: { flexDirection: 'row', alignItems: 'center' },
  resendLink: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
});
