import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tipsAPI } from '../services/api';
import { COLORS, Card, SectionTitle, ScreenHeader, EmptyState } from '../components/UIKit';

const CATEGORIES = ['all', 'electricity', 'water', 'general'];
const CAT_ICONS = { all: '🌎', electricity: '⚡', water: '💧', general: '🌿' };
const CAT_COLORS = { all: COLORS.teal, electricity: '#FFD700', water: COLORS.blue, general: COLORS.green };

export default function TipsScreen() {
  const [tips, setTips] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState('all');

  const load = useCallback(async (cat) => {
    try {
      const res = await tipsAPI.getTips(cat === 'all' ? null : cat);
      setTips(res.data.data);
    } catch (e) { console.log(e?.message); }
  }, []);

  useEffect(() => { load(category); }, [load, category]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(category);
    setRefreshing(false);
  };

  const handleCategory = (cat) => {
    setCategory(cat);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.teal} />}
        contentContainerStyle={styles.scroll}
      >
        <ScreenHeader title="Eco Tips" subtitle="Discover ways to save energy and water" />

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && { backgroundColor: (CAT_COLORS[cat] || COLORS.teal) + '22', borderColor: CAT_COLORS[cat] || COLORS.teal }]}
              onPress={() => handleCategory(cat)}
            >
              <Text style={{ fontSize: 16 }}>{CAT_ICONS[cat]}</Text>
              <Text style={[styles.chipText, category === cat && { color: CAT_COLORS[cat] || COLORS.teal }]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <SectionTitle title={`${tips.length} Tips${category !== 'all' ? ` · ${category}` : ''}`} />

        {tips.length === 0 ? (
          <EmptyState icon="🌿" message="No tips available for this category. Try refreshing!" />
        ) : (
          tips.map((tip, i) => (
            <Card key={tip.id || i} style={styles.tipCard}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
                <View style={[styles.tipIcon, { backgroundColor: (CAT_COLORS[tip.category] || COLORS.teal) + '22' }]}>
                  <Text style={{ fontSize: 22 }}>{CAT_ICONS[tip.category] || '🌿'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                  </View>
                  <Text style={styles.tipDesc}>{tip.description}</Text>
                  <View style={[styles.catBadge, { backgroundColor: (CAT_COLORS[tip.category] || COLORS.teal) + '22', borderColor: CAT_COLORS[tip.category] || COLORS.teal }]}>
                    <Text style={[styles.catBadgeText, { color: CAT_COLORS[tip.category] || COLORS.teal }]}>{tip.category}</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))
        )}

        {/* Reload button */}
        <TouchableOpacity style={styles.reloadBtn} onPress={() => load(category)}>
          <Ionicons name="refresh" size={18} color={COLORS.teal} />
          <Text style={styles.reloadText}>Load more tips</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18, paddingTop: 56 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 8, marginRight: 10 },
  chipText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 13 },
  tipCard: { marginBottom: 14 },
  tipIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tipTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', flex: 1, flexWrap: 'wrap' },
  tipDesc: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20, marginBottom: 10 },
  catBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, alignSelf: 'flex-start' },
  catBadgeText: { fontSize: 11, fontWeight: '700' },
  reloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  reloadText: { color: COLORS.teal, fontWeight: '700', fontSize: 14 },
});
