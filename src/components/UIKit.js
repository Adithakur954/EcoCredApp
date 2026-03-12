import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const COLORS = {
  bg: '#0d1117',
  surface: '#161b22',
  surfaceAlt: '#21262d',
  border: '#30363d',
  teal: '#00C9A7',
  tealDark: '#00a88c',
  gold: '#FFD700',
  red: '#ff4757',
  blue: '#4a9eff',
  text: '#e6edf3',
  textMuted: '#8b949e',
  green: '#3fb950',
};

// Gradient Card
export function GradientCard({ colors, style, children }) {
  return (
    <LinearGradient colors={colors || ['#00C9A7', '#0d6efd']} style={[styles.gradCard, style]}>
      {children}
    </LinearGradient>
  );
}

// Plain surface card
export function Card({ style, children }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// Primary button
export function PrimaryButton({ title, onPress, loading, style, small }) {
  return (
    <TouchableOpacity
      style={[styles.btn, small && styles.btnSmall, style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={loading}
    >
      <LinearGradient
        colors={['#00C9A7', '#0096c7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.btnGrad, small && styles.btnSmall]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={[styles.btnText, small && { fontSize: 13 }]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// Danger button
export function DangerButton({ title, onPress, style, small }) {
  return (
    <TouchableOpacity
      style={[styles.dangerBtn, small && styles.btnSmall, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.btnText, small && { fontSize: 13 }]}>{title}</Text>
    </TouchableOpacity>
  );
}

// Text Input
export function AppInput({ label, style, rightSlot, ...props }) {
  return (
    <View style={[styles.inputWrap, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputBox, { flexDirection: 'row', alignItems: 'center' }]}>
        <TextInput
          style={[styles.inputField, { flex: 1 }]}
          placeholderTextColor={COLORS.textMuted}
          {...props}
        />
        {rightSlot && <View style={{ marginLeft: 8 }}>{rightSlot}</View>}
      </View>
    </View>
  );
}

// Badge pill
export function Badge({ label, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// Screen header
export function ScreenHeader({ title, subtitle }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSub}>{subtitle}</Text>}
    </View>
  );
}

// Section title
export function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

// Stat pill (points, streak)
export function StatPill({ icon, value, label, color }) {
  return (
    <View style={[styles.statPill, { borderColor: color + '55' }]}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// Empty state
export function EmptyState({ icon, message }) {
  return (
    <View style={styles.empty}>
      <Text style={{ fontSize: 48 }}>{icon}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gradCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btn: { borderRadius: 12, overflow: 'hidden', marginVertical: 6 },
  btnSmall: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  btnGrad: { paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  dangerBtn: {
    backgroundColor: COLORS.red,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 },
  inputWrap: { marginBottom: 16 },
  label: { color: COLORS.textMuted, fontSize: 12, marginBottom: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  inputBox: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputField: { color: COLORS.text, fontSize: 15, paddingVertical: 10 },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  header: { paddingTop: 16, paddingBottom: 16 },
  headerTitle: { color: COLORS.text, fontSize: 28, fontWeight: '800' },
  headerSub: { color: COLORS.textMuted, fontSize: 14, marginTop: 4 },
  sectionTitle: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase', marginTop: 8 },
  statPill: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginHorizontal: 4,
  },
  statVal: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  statLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600', marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { color: COLORS.textMuted, fontSize: 15, marginTop: 12, textAlign: 'center' },
});

