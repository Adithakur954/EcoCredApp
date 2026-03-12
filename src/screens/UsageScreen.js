import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar,
  TouchableOpacity, Alert, Dimensions
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { usageAPI } from '../services/api';
import { COLORS, Card, SectionTitle, ScreenHeader, PrimaryButton, EmptyState, AppInput } from '../components/UIKit';

const { width } = Dimensions.get('window');
const RESOURCE_TYPES = ['electricity', 'water'];

export default function UsageScreen() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('electricity');
  const [amount, setAmount] = useState('');
  const [deviceId, setDeviceId] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await usageAPI.getSummary(user.id);
      setSummary(res.data.data);
    } catch (e) { console.log(e?.message); }
  }, [user]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleLog = async () => {
    if (!amount || isNaN(parseFloat(amount))) { Alert.alert('Error', 'Enter a valid amount.'); return; }
    setLoading(true);
    try {
      await usageAPI.logEvent(user.id, selectedType, parseFloat(amount), deviceId ? parseInt(deviceId) : null);
      Alert.alert('🎉 Logged!', `+5 EcoPoints earned! Amount: ${amount} ${selectedType === 'electricity' ? 'kWh' : 'L'}`);
      setAmount('');
      setDeviceId('');
      await load();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to log usage.');
    } finally { setLoading(false); }
  };

  // Build chart data
  const trends = summary?.trends ?? [];
  const filtered = trends.filter(t => t.resource_type === selectedType).slice(0, 7).reverse();
  const chartLabels = filtered.map(t => {
    const d = new Date(t.usage_date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
  const chartData = filtered.map(t => parseFloat(t.total_amount));
  const hasChart = chartData.length > 0;

  const currentWeek = summary?.currentWeek ?? [];
  const elecTotal = currentWeek.find(w => w.resource_type === 'electricity');
  const waterTotal = currentWeek.find(w => w.resource_type === 'water');

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.teal} />}
        contentContainerStyle={styles.scroll}
      >
        <ScreenHeader title="Usage Tracker" subtitle="Log and monitor your resource consumption" />

        {/* This Week Summary */}
        <View style={styles.weekRow}>
          <WeekCard icon="⚡" label="Electricity" value={elecTotal ? `${parseFloat(elecTotal.total).toFixed(1)} kWh` : '0 kWh'} color="#FFD700" />
          <WeekCard icon="💧" label="Water" value={waterTotal ? `${parseFloat(waterTotal.total).toFixed(0)} L` : '0 L'} color={COLORS.blue} />
        </View>

        {/* Log Usage */}
        <SectionTitle title="Log Usage Event" />
        <Card>
          <Text style={styles.subLabel}>Resource Type</Text>
          <View style={styles.typeRow}>
            {RESOURCE_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.typeBtn, selectedType === type && styles.typeBtnActive]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[styles.typeBtnText, selectedType === type && { color: '#fff' }]}>
                  {type === 'electricity' ? '⚡ Elec' : '💧 Water'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <AppInput
            label={`Amount (${selectedType === 'electricity' ? 'kWh' : 'Liters'})`}
            value={amount}
            onChangeText={setAmount}
            placeholder={`e.g. ${selectedType === 'electricity' ? '2.5' : '50'}`}
            keyboardType="numeric"
          />

          <AppInput
            label="Device ID (Optional)"
            value={deviceId}
            onChangeText={setDeviceId}
            placeholder="e.g. 3"
            keyboardType="numeric"
          />

          <PrimaryButton title="🌱 Log & Earn points" onPress={handleLog} loading={loading} style={{ marginTop: 12 }} />
        </Card>

        {/* Chart */}
        <SectionTitle title="7-Day Trend" />
        <View style={styles.typeRow}>
          {RESOURCE_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.typeBtnSmall, selectedType === type && styles.typeBtnActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.typeBtnText, selectedType === type && { color: '#fff' }]}>
                {type === 'electricity' ? '⚡' : '💧'} {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {hasChart ? (
          <Card style={{ paddingHorizontal: 0, paddingVertical: 10, overflow: 'hidden' }}>
            <BarChart
              data={{
                labels: chartLabels.length > 0 ? chartLabels : ['No data'],
                datasets: [{ data: chartData.length > 0 ? chartData : [0] }],
              }}
              width={width - 36}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: COLORS.surface,
                backgroundGradientFrom: COLORS.surface,
                backgroundGradientTo: COLORS.surface,
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 201, 167, ${opacity})`,
                labelColor: () => COLORS.textMuted,
                style: { borderRadius: 16 },
                propsForBars: { rx: 6, ry: 6 },
              }}
              style={{ borderRadius: 16 }}
              showValuesOnTopOfBars
            />
          </Card>
        ) : (
          <EmptyState icon="📊" message="No data yet. Start logging usage to see trends!" />
        )}
      </ScrollView>
    </View>
  );
}

function WeekCard({ icon, label, value, color }) {
  return (
    <View style={[styles.weekCard, { borderColor: color + '25' }]}>
      <View style={[styles.weekIcon, { backgroundColor: color + '15' }]}>
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      </View>
      <Text style={[styles.weekVal, { color }]}>{value}</Text>
      <Text style={styles.weekLabel}>{label} / week</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18, paddingTop: 56 },
  weekRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  weekCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1 },
  weekIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  weekVal: { fontSize: 22, fontWeight: '800' },
  weekLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 4, fontWeight: '700', textTransform: 'uppercase' },
  subLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 12, alignItems: 'center' },
  typeBtnSmall: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 8, alignItems: 'center' },
  typeBtnActive: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  typeBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 13 },
});

