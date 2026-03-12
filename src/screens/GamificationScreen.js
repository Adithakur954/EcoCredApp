import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar, TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { gamificationAPI } from '../services/api';
import { COLORS, Card, SectionTitle, ScreenHeader, EmptyState } from '../components/UIKit';

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const RANK_ICONS = ['🥇', '🥈', '🥉'];

export default function GamificationScreen() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [status, setStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('leaderboard');

  const load = useCallback(async () => {
    try {
      const [lb, st] = await Promise.all([
        gamificationAPI.getLeaderboard(),
        gamificationAPI.getUserStatus(user.id),
      ]);
      setLeaderboard(lb.data.data);
      setStatus(st.data.data);
    } catch (e) { console.log(e?.message); }
  }, [user]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const myRank = leaderboard.findIndex(u => u.id === user.id) + 1;
  const pts = status?.user?.points ?? 0;
  const streak = status?.user?.streak_days ?? 0;
  const badges = status?.badges ?? [];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.teal} />}
        contentContainerStyle={styles.scroll}
      >
        <ScreenHeader title="Gamification" subtitle="Compete, earn badges, and climb the ranks" />

        {/* Hero card */}
        <LinearGradient colors={['#FFD700', '#ff9a00']} style={styles.heroCard}>
          <Text style={styles.heroLbl}>Your EcoPoints</Text>
          <Text style={styles.heroVal}>{pts}</Text>
          <View style={styles.heroRow}>
            <MiniStat icon="🔥" value={streak} label="Streak days" />
            <MiniStat icon="🏅" value={badges.length} label="Badges" />
            <MiniStat icon="🎖️" value={myRank > 0 ? `#${myRank}` : '—'} label="Rank" />
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {['leaderboard', 'badges'].map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && { color: COLORS.teal }]}>
                {t === 'leaderboard' ? '🏆 Leaderboard' : '🏅 My Badges'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'leaderboard' ? (
          <>
            <SectionTitle title="Top 10 Eco Heroes" />
            {leaderboard.length === 0 ? (
              <EmptyState icon="🏆" message="No leaderboard data yet." />
            ) : (
              leaderboard.map((entry, i) => {
                const isMe = entry.id === user.id;
                return (
                  <Card key={entry.id} style={[styles.lbCard, isMe && { borderColor: COLORS.teal, borderWidth: 2 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                      <Text style={styles.rankNum}>{RANK_ICONS[i] || `#${i + 1}`}</Text>
                      <View style={[styles.avatar, { backgroundColor: isMe ? COLORS.teal : COLORS.surfaceAlt }]}>
                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                          {entry.name?.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.lbName, isMe && { color: COLORS.teal }]}>{entry.name} {isMe ? '(You)' : ''}</Text>
                        <Text style={styles.lbStreak}>🔥 {entry.streak_days} day streak</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.lbPts, { color: i < 3 ? RANK_COLORS[i] : COLORS.text }]}>{entry.points}</Text>
                        <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>pts</Text>
                      </View>
                    </View>
                  </Card>
                );
              })
            )}
          </>
        ) : (
          <>
            <SectionTitle title="Earned Badges" />
            {badges.length === 0 ? (
              <EmptyState icon="🏅" message="No badges yet. Keep logging to earn them!" />
            ) : (
              badges.map(b => (
                <Card key={b.id} style={styles.badgeCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <LinearGradient colors={['#FFD700', '#ff9a00']} style={styles.badgeIconWrap}>
                      <Text style={{ fontSize: 22 }}>🏅</Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.badgeName}>{b.name}</Text>
                      <Text style={styles.badgeDesc}>{b.description}</Text>
                      <Text style={styles.badgeDate}>
                        Earned: {new Date(b.earned_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function MiniStat({ icon, value, label }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>{value}</Text>
      <Text style={{ color: '#ffffff99', fontSize: 10, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18, paddingTop: 56 },
  heroCard: { borderRadius: 20, padding: 24, marginBottom: 20, alignItems: 'center' },
  heroLbl: { color: '#ffffffaa', fontSize: 13, fontWeight: '700' },
  heroVal: { color: '#fff', fontSize: 48, fontWeight: '900', marginVertical: 8 },
  heroRow: { flexDirection: 'row', width: '100%', marginTop: 8 },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  tabBtn: { flex: 1, paddingVertical: 13, alignItems: 'center', borderRadius: 11 },
  tabBtnActive: { backgroundColor: COLORS.surfaceAlt },
  tabText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 14 },
  lbCard: { marginBottom: 10 },
  rankNum: { fontSize: 22, width: 30 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  lbName: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  lbStreak: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  lbPts: { fontSize: 18, fontWeight: '900' },
  badgeCard: { marginBottom: 12 },
  badgeIconWrap: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  badgeName: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  badgeDesc: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  badgeDate: { color: COLORS.teal, fontSize: 11, marginTop: 4, fontWeight: '600' },
});
