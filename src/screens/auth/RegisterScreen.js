import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, AppInput, PrimaryButton } from '../../components/UIKit';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) { setError('Please fill all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (e) {
      setError(e?.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <LinearGradient colors={['#0096c7', '#00C9A7']} style={styles.hero}>
        <Text style={styles.logo}>🌿 EcoCred</Text>
        <Text style={styles.tagline}>Join the green revolution</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.form}>
        <ScrollView contentContainerStyle={styles.formInner} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.sub}>Start earning EcoPoints today</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={COLORS.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <AppInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Jane Doe"
          />

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
            placeholder="Min. 6 characters"
            secureTextEntry
          />

          <PrimaryButton
            title={loading ? 'Creating account…' : 'Create Account'}
            onPress={handleRegister}
            loading={loading}
            style={{ marginTop: 12 }}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.footerText, { color: COLORS.teal, fontWeight: '700' }]}>Sign In</Text>
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
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ff475715', borderRadius: 12, padding: 14, marginBottom: 20, gap: 10, borderWidth: 1, borderColor: '#ff475730' },
  errorText: { color: COLORS.red, fontSize: 13, flex: 1, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { color: COLORS.textMuted, fontSize: 14 },
});

