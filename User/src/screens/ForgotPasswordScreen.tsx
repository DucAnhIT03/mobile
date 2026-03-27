import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LockKeyhole, ArrowLeft, ArrowUpRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert } from 'react-native';

export default function ForgotPasswordScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const handleReset = () => {
    Alert.alert('Success', 'Password reset link sent to your email/phone!');
    navigation.navigate('Login');
  };

  return (
    <LinearGradient colors={['#7e22ce', '#ec4899', '#f97316']} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 80 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <LockKeyhole size={48} color="#fff" strokeWidth={1.5} />
          </View>

          <Text style={styles.heading}>Trouble logging in?</Text>
          <Text style={styles.description}>
            Enter your email, phone, or username and we'll send you a link to get back into your account.
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email, Phone, or Username"
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleReset} activeOpacity={0.8}>
              <Text style={styles.submitBtnText}>Send Login Link</Text>
              <ArrowUpRight size={20} color="#ec4899" strokeWidth={3} />
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.createLink}>Create New Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 32 },
  topNav: { width: '100%', alignItems: 'flex-start' },
  backBtn: { padding: 8 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  heading: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  description: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 22, paddingHorizontal: 8, marginBottom: 40 },
  form: { width: '100%', gap: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 999, paddingVertical: 16, paddingHorizontal: 24, color: '#fff', fontSize: 16 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 999, paddingVertical: 16, marginTop: 8, gap: 8 },
  submitBtnText: { fontSize: 18, fontWeight: 'bold', color: '#7e22ce' },
  divider: { flexDirection: 'row', alignItems: 'center', marginTop: 40, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  dividerText: { paddingHorizontal: 16, color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  createLink: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginTop: 32 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.05)', paddingTop: 16, alignItems: 'center' },
  backText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
