import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  TextInput, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { usersAPI, authAPI } from '../services/api';
import { COLORS, Card, SectionTitle, ScreenHeader, PrimaryButton, DangerButton, AppInput } from '../components/UIKit';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwMode, setPwMode] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const handleSaveProfile = async () => {
    if (!name || !email) { Alert.alert('Error', 'Name and email are required.'); return; }
    setSavingProfile(true);
    try {
      const res = await usersAPI.update(user.id, { name, email });
      updateUser(res.data.data);
      setEditMode(false);
      Alert.alert('✅ Updated', 'Profile updated successfully!');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not update profile.');
    } finally { setSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) { Alert.alert('Error', 'Fill all password fields.'); return; }
    if (newPw !== confirmPw) { Alert.alert('Error', "New passwords don't match."); return; }
    if (newPw.length < 6) { Alert.alert('Error', 'New password must be at least 6 characters.'); return; }
    setSavingPw(true);
    try {
      await authAPI.updatePassword(currentPw, newPw);
      setPwMode(false);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      Alert.alert('✅ Password Changed', 'Your password has been updated.');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Could not change password.');
    } finally { setSavingPw(false); }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'EC';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <LinearGradient colors={['#00C9A7', '#0096c7']} style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Profile Section */}
        <SectionTitle title="Account Details" />
        <Card>
          {editMode ? (
            <>
              <AppInput label="Full Name" value={name} onChangeText={setName} placeholder="Full Name" />
              <AppInput label="Email" value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <PrimaryButton title={savingProfile ? 'Saving…' : 'Save Changes'} onPress={handleSaveProfile} loading={savingProfile} style={{ flex: 1 }} />
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditMode(false); setName(user?.name); setEmail(user?.email); }}>
                  <Text style={{ color: COLORS.textMuted, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <InfoRow icon="person" label="Name" value={user?.name} />
              <InfoRow icon="mail" label="Email" value={user?.email} />
              <InfoRow icon="calendar" label="Joined" value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'} />
              <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(true)}>
                <Ionicons name="create-outline" size={18} color={COLORS.teal} />
                <Text style={{ color: COLORS.teal, fontWeight: '700', marginLeft: 6 }}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          )}
        </Card>

        {/* Change Password */}
        <SectionTitle title="Security" />
        <Card>
          {pwMode ? (
            <>
              <AppInput label="Current Password" value={currentPw} onChangeText={setCurrentPw} placeholder="••••••••" secureTextEntry />
              <AppInput label="New Password" value={newPw} onChangeText={setNewPw} placeholder="••••••••" secureTextEntry />
              <AppInput label="Confirm New Password" value={confirmPw} onChangeText={setConfirmPw} placeholder="••••••••" secureTextEntry />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <PrimaryButton title={savingPw ? 'Saving…' : 'Update Password'} onPress={handleChangePassword} loading={savingPw} style={{ flex: 1 }} />
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setPwMode(false)}>
                  <Text style={{ color: COLORS.textMuted, fontWeight: '700' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity style={styles.editBtn} onPress={() => setPwMode(true)}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.teal} />
              <Text style={{ color: COLORS.teal, fontWeight: '700', marginLeft: 6 }}>Change Password</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* App Info */}
        <SectionTitle title="About" />
        <Card>
          <InfoRow icon="leaf" label="App" value="EcoCred v1.0.0" />
          <InfoRow icon="server" label="Backend" value="EcoGuard API v1.0" />
        </Card>

        <DangerButton title="🚪 Logout" onPress={handleLogout} style={{ marginTop: 8, marginBottom: 30 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon + '-outline'} size={16} color={COLORS.teal} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18, paddingTop: 60 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarWrap: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '900' },
  userName: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  userEmail: { color: COLORS.textMuted, fontSize: 14 },
  label: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.surfaceAlt, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, marginBottom: 16, width: '100%' },
  editBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, justifyContent: 'center' },
  cancelBtn: { backgroundColor: COLORS.surfaceAlt, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border + '44' },
  infoIcon: { width: 36, height: 36, backgroundColor: COLORS.teal + '15', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { color: COLORS.text, fontSize: 15, fontWeight: '600', marginTop: 2 },
});
