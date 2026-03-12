import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, AppInput, PrimaryButton } from '../../components/UIKit';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true); setError('');
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e) {
      setError(e?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <LinearGradient colors={['#00C9A7', '#0096c7']} style={styles.hero}>
        <Text style={styles.logo}>🌿 EcoCred</Text>
        <Text style={styles.tagline}>Track. Earn. Save the Planet.</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.form}>
        <ScrollView contentContainerStyle={styles.formInner} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.sub}>Sign in to continue</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={COLORS.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPw}
            rightSlot={
              <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                <Ionicons name={showPw ? 'eye' : 'eye-off'} size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            }
          />

          <PrimaryButton
            title={loading ? 'Signing in…' : 'Sign In'}
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 12 }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.footerText, { color: COLORS.teal, fontWeight: '700' }]}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  hero: { paddingTop: 70, paddingBottom: 50, alignItems: 'center' },
  logo: { fontSize: 36, fontWeight: '900', color: '#fff' },
  tagline: { fontSize: 14, color: '#ffffffcc', marginTop: 6 },
  form: { flex: 1, backgroundColor: COLORS.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, overflow: 'hidden' },
  formInner: { padding: 28, paddingTop: 36 },
  title: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  sub: { color: COLORS.textMuted, fontSize: 14, marginTop: 4, marginBottom: 28 },
  eyeBtn: { padding: 4 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ff475715', borderRadius: 12, padding: 14, marginBottom: 20, gap: 10, borderWidth: 1, borderColor: '#ff475730' },
  errorText: { color: COLORS.red, fontSize: 13, flex: 1, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: COLORS.textMuted, fontSize: 14 },
});

