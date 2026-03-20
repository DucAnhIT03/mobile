import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    router.replace('/(tabs)/feed');
  };

  return (
    <LinearGradient colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]} style={styles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started!</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="rgba(255,255,255,0.7)" value={name} onChangeText={setName} />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="rgba(255,255,255,0.7)" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="rgba(255,255,255,0.7)" value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <TouchableOpacity style={styles.signupButton} onPress={handleSignUp} activeOpacity={0.8}>
            <Text style={styles.signupButtonText}>Sign Up</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.pink} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton}><Ionicons name="logo-apple" size={20} color="#000" /></TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}><Ionicons name="logo-google" size={20} color="#EA4335" /></TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}><Ionicons name="logo-facebook" size={20} color="#1877F2" /></TouchableOpacity>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topNav: { paddingTop: 56, paddingHorizontal: 16 },
  backBtn: { padding: 8 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 32, justifyContent: 'center', paddingVertical: 32 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  form: { width: '100%', gap: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 999, paddingHorizontal: 16, height: 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#fff', fontSize: 16 },
  signupButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 16, marginTop: 8 },
  signupButtonText: { fontSize: 18, fontWeight: '700', color: '#7e22ce' },
  divider: { flexDirection: 'row', alignItems: 'center', marginTop: 32, width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  dividerText: { marginHorizontal: 16, color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 24 },
  socialButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  loginRow: { flexDirection: 'row', alignItems: 'center', marginTop: 32 },
  loginText: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  loginLink: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
