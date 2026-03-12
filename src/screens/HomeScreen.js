import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar,
  TouchableOpacity, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { gamificationAPI, usageAPI } from '../services/api';
import { COLORS, Card, SectionTitle, EmptyState } from '../components/UIKit';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [gamStatus, setGamStatus] = useState(null);
  const [summary, setSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [g, u] = await Promise.all([
        gamificationAPI.getUserStatus(user.id),
        usageAPI.getSummary(user.id),
      ]);
      setGamStatus(g.data.data);
      setSummary(u.data.data);
    } catch (e) { console.log(e?.message); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const pts = gamStatus?.user?.points ?? 0;
  const streak = gamStatus?.user?.streak_days ?? 0;
  const badges = gamStatus?.badges ?? [];
  const currentWeek = summary?.currentWeek ?? [];
  const elec = currentWeek.find(w => w.resource_type === 'electricity');
  const water = currentWeek.find(w => w.resource_type === 'water');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.teal} />}
      >
        {/* Hero */}
        <LinearGradient colors={['#00C9A7', '#0096c7']} style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>Good {getTimeOfDay()}, 👋</Text>
              <Text style={styles.heroName}>{user?.name || 'Eco User'}</Text>
            </View>
            <View style={styles.ptsBubble}>
              <Text style={styles.ptsBubbleVal}>{pts}</Text>
              <Text style={styles.ptsBubbleLabel}>pts</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatBox icon="🔥" value={streak} label="Streak" />
            <StatBox icon="🏅" value={badges.length} label="Badges" />
            <StatBox icon="⚡" value={elec ? `${parseFloat(elec.total).toFixed(1)}` : '0'} label="kWh" />
            <StatBox icon="💧" value={water ? `${parseFloat(water.total).toFixed(0)}` : '0'} label="Liters" />
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Quick actions */}
          <SectionTitle title="Quick Actions" />
          <View style={styles.quickRow}>
            <QuickAction icon="flash" label="Track" color="#FFD700" onPress={() => navigation.navigate('Usage')} />
            <QuickAction icon="hardware-chip" label="Devices" color={COLORS.teal} onPress={() => navigation.navigate('Devices')} />
            <QuickAction icon="leaf" label="Tips" color={COLORS.green} onPress={() => navigation.navigate('Tips')} />
            <QuickAction icon="trophy" label="Leader" color="#ff4757" onPress={() => navigation.navigate('Gamification')} />
          </View>

          {/* Recent Badges */}
          <SectionTitle title="Recent Badges" />
          {badges.length > 0 ? (
            badges.slice(0, 3).map((b) => (
              <Card key={b.id} style={styles.badgeCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View style={styles.badgeIcon}><Text style={{ fontSize: 24 }}>🏅</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.badgeName}>{b.name}</Text>
                    <Text style={styles.badgeDesc}>{b.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
                </View>
              </Card>
            ))
          ) : (
            <EmptyState icon="🏅" message="Log usage events to earn your first badge!" />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function StatBox({ icon, value, label }) {
  return (
    <View style={styles.statBox}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={styles.statVal}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={styles.qa} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.qaIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  hero: { paddingTop: 60, paddingBottom: 32, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  greeting: { color: '#ffffffcc', fontSize: 14, fontWeight: '600' },
  heroName: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 4 },
  ptsBubble: { backgroundColor: '#ffffff25', borderRadius: 32, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ffffff40' },
  ptsBubbleVal: { color: '#fff', fontSize: 22, fontWeight: '900' },
  ptsBubbleLabel: { color: '#ffffffcc', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, backgroundColor: '#ffffff15', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#ffffff20' },
  statVal: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 4 },
  statLabel: { color: '#ffffffaa', fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 2, textTransform: 'uppercase' },
  body: { padding: 18, paddingTop: 24 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  qa: { alignItems: 'center', flex: 1 },
  qaIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 1, borderColor: COLORS.border + '40' },
  qaLabel: { color: COLORS.text, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  badgeCard: { marginBottom: 12 },
  badgeIcon: { width: 52, height: 52, backgroundColor: '#FFD70015', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFD70030' },
  badgeName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  badgeDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
});

