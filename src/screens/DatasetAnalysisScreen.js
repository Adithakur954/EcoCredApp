import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar,
  TouchableOpacity, Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { COLORS, Card, SectionTitle } from '../components/UIKit';
import { datasetAPI } from '../services/api';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;

// ─── Demo / fallback data (shown when API is not yet connected) ────────────────
const DEMO_SUMMARY = {
  avgUse: 1.42, avgGen: 0.38, avgSolar: 0.31, netBalance: -1.04,
};
const DEMO_TIMESERIES = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  use:    [1.5,   1.2,   1.8,   1.3,   1.6,   2.1,   1.4],
  gen:    [0.4,   0.5,   0.3,   0.6,   0.4,   0.2,   0.5],
  solar:  [0.3,   0.4,   0.2,   0.5,   0.3,   0.15,  0.4],
};
const DEMO_APPLIANCES = [
  { name: 'Furnace 1',   avgKw: 0.42 },
  { name: 'Furnace 2',   avgKw: 0.38 },
  { name: 'House Total', avgKw: 0.35 },
  { name: 'Dishwasher',  avgKw: 0.18 },
  { name: 'Barn',        avgKw: 0.14 },
  { name: 'Fridge',      avgKw: 0.12 },
  { name: 'Home Office', avgKw: 0.10 },
  { name: 'Wine Cellar', avgKw: 0.09 },
  { name: 'Microwave',   avgKw: 0.07 },
  { name: 'Kitchen 12',  avgKw: 0.06 },
  { name: 'Kitchen 14',  avgKw: 0.05 },
  { name: 'Kitchen 38',  avgKw: 0.04 },
  { name: 'Garage Door', avgKw: 0.03 },
  { name: 'Living Room', avgKw: 0.03 },
  { name: 'Well',        avgKw: 0.02 },
];
const DEMO_WEATHER = {
  avgTemp: 12.4, avgHumidity: 0.68, avgWindSpeed: 5.2,
  avgCloudCover: 0.44, avgDewPoint: 6.1, avgPressure: 1013.2,
};

const RANGES = ['24h', '7d', '30d'];

const CHART_CONFIG = {
  backgroundGradientFrom: '#161b22',
  backgroundGradientTo: '#161b22',
  color: (opacity = 1) => `rgba(0, 201, 167, ${opacity})`,
  labelColor: () => '#8b949e',
  strokeWidth: 2,
  barPercentage: 0.65,
  propsForDots: { r: '4', strokeWidth: '2', stroke: '#00C9A7' },
  decimalPlaces: 2,
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DatasetAnalysisScreen() {
  const [range, setRange] = useState('7d');
  const [summary, setSummary] = useState(null);
  const [timeSeries, setTimeSeries] = useState(null);
  const [appliances, setAppliances] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);

  const load = useCallback(async (selectedRange) => {
    try {
      const [sumRes, tsRes, appRes, wxRes] = await Promise.all([
        datasetAPI.getSummary(),
        datasetAPI.getTimeSeries(selectedRange),
        datasetAPI.getApplianceBreakdown(),
        datasetAPI.getWeatherCorrelation(),
      ]);
      setSummary(sumRes.data?.data ?? sumRes.data);
      setTimeSeries(tsRes.data?.data ?? tsRes.data);
      setAppliances(appRes.data?.data ?? appRes.data);
      setWeather(wxRes.data?.data ?? wxRes.data);
      setApiConnected(true);
    } catch {
      // API not connected yet — use demo data
      setSummary(DEMO_SUMMARY);
      setTimeSeries(DEMO_TIMESERIES);
      setAppliances(DEMO_APPLIANCES);
      setWeather(DEMO_WEATHER);
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load(range);
  }, [range, load]);

  const onRangeChange = (r) => {
    if (r !== range) {
      setRange(r);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load(range);
    setRefreshing(false);
  };

  const avgUse = toNumber(summary?.avgUse);
  const avgGen = toNumber(summary?.avgGen);
  const avgSolar = toNumber(summary?.avgSolar);
  const netBalance = toNumber(summary?.netBalance);
  const avgTemp = toNumber(weather?.avgTemp);
  const avgHumidity = toNumber(weather?.avgHumidity);
  const avgWindSpeed = toNumber(weather?.avgWindSpeed);
  const avgCloudCover = toNumber(weather?.avgCloudCover);
  const avgDewPoint = toNumber(weather?.avgDewPoint);
  const avgPressure = toNumber(weather?.avgPressure);

  // Build chart data from timeSeries
  const lineLabels = Array.isArray(timeSeries?.labels) ? timeSeries.labels : [];
  const useSeries = (timeSeries?.use ?? []).map((v) => toNumber(v));
  const genSeries = (timeSeries?.gen ?? []).map((v) => toNumber(v));
  const solarSeries = (timeSeries?.solar ?? []).map((v) => toNumber(v));
  const hasLineValues = [...useSeries, ...genSeries, ...solarSeries].some((v) => v !== 0);
  const canRenderLineChart =
    lineLabels.length > 0 &&
    useSeries.length === lineLabels.length &&
    genSeries.length === lineLabels.length &&
    solarSeries.length === lineLabels.length &&
    hasLineValues;

  const lineData = canRenderLineChart ? {
    labels: lineLabels,
    datasets: [
      {
        data: useSeries,
        color: (o = 1) => `rgba(0, 201, 167, ${o})`,
        strokeWidth: 2,
      },
      {
        data: genSeries,
        color: (o = 1) => `rgba(74, 158, 255, ${o})`,
        strokeWidth: 2,
      },
      {
        data: solarSeries,
        color: (o = 1) => `rgba(255, 215, 0, ${o})`,
        strokeWidth: 2,
      },
    ],
    legend: ['Use kW', 'Gen kW', 'Solar kW'],
  } : null;

  // Top 8 appliances for bar chart
  const topAppliances = (appliances ?? [])
    .map((a) => ({ ...a, avgKw: toNumber(a.avgKw) }))
    .slice(0, 8);
  const hasBarValues = topAppliances.some((a) => a.avgKw !== 0);
  const barData = topAppliances.length > 0 ? {
    labels: topAppliances.map((a) => String(a.name ?? 'Unknown').split(' ')[0]),
    datasets: [{ data: topAppliances.map(a => +toNumber(a.avgKw).toFixed(3)) }],
  } : null;

  if (loading && !summary) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.teal} />
        <Text style={styles.loadingText}>Loading analysis…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.teal} />}
      >
        {/* ── Hero Header ── */}
        <LinearGradient colors={['#1a1f2e', '#0d1117']} style={styles.hero}>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroLabel}>DATASET ANALYSIS</Text>
              <Text style={styles.heroTitle}>Energy Insights</Text>
              <Text style={styles.heroSub}>Home energy • Solar • Weather</Text>
            </View>
            <View style={styles.iconBubble}>
              <Ionicons name="analytics" size={28} color={COLORS.teal} />
            </View>
          </View>

          {/* API status indicator */}
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: apiConnected ? COLORS.green : '#ff9800' }]} />
            <Text style={styles.statusText}>
              {apiConnected ? 'Live data' : 'Demo data — connect API to see live stats'}
            </Text>
          </View>

          {/* Range selector */}
          <View style={styles.rangeRow}>
            {RANGES.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
                onPress={() => onRangeChange(r)}
              >
                <Text style={[styles.rangeBtnText, range === r && styles.rangeBtnTextActive]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* ── Overview Cards ── */}
          <SectionTitle title="Overview" />
          <View style={styles.cardGrid}>
            <MetricCard icon="⚡" label="Avg Usage" value={`${avgUse.toFixed(2)} kW`} color={COLORS.teal} />
            <MetricCard icon="🔋" label="Avg Gen" value={`${avgGen.toFixed(2)} kW`} color={COLORS.blue} />
          </View>
          <View style={styles.cardGrid}>
            <MetricCard icon="☀️" label="Avg Solar" value={`${avgSolar.toFixed(2)} kW`} color={COLORS.gold} />
            <MetricCard
              icon={netBalance < 0 ? '📉' : '📈'}
              label="Net Balance"
              value={`${netBalance.toFixed(2)} kW`}
              color={netBalance < 0 ? COLORS.red : COLORS.green}
            />
          </View>

          {/* ── Energy Over Time ── */}
          <SectionTitle title="Energy Over Time" />
          <Card style={styles.chartCard}>
            <View style={styles.legendRow}>
              <LegendDot color={COLORS.teal} label="Usage" />
              <LegendDot color={COLORS.blue} label="Generation" />
              <LegendDot color={COLORS.gold} label="Solar" />
            </View>
            {lineData ? (
              <LineChart
                data={lineData}
                width={CHART_WIDTH - 32}
                height={200}
                chartConfig={CHART_CONFIG}
                bezier
                withDots
                withInnerLines={false}
                withOuterLines={false}
                style={{ borderRadius: 12, marginTop: 8 }}
                fromZero
              />
            ) : (
              <Text style={styles.noChartText}>Not enough valid trend data to draw chart.</Text>
            )}
          </Card>

          {/* ── Appliance Breakdown ── */}
          <SectionTitle title="Appliance Breakdown (Avg kW)" />
          <Card style={styles.chartCard}>
            {barData && hasBarValues ? (
              <BarChart
                data={barData}
                width={CHART_WIDTH - 32}
                height={200}
                chartConfig={{
                  ...CHART_CONFIG,
                  color: (opacity = 1) => `rgba(74, 158, 255, ${opacity})`,
                }}
                style={{ borderRadius: 12 }}
                fromZero
                showValuesOnTopOfBars
                withInnerLines={false}
              />
            ) : (
              <Text style={styles.noChartText}>Not enough valid appliance data to draw chart.</Text>
            )}
            {/* Full list */}
            <View style={styles.applianceList}>
              {(appliances ?? []).map((a, i) => (
                <ApplianceRow
                  key={i}
                  name={a.name}
                  value={toNumber(a.avgKw)}
                  max={toNumber(appliances[0]?.avgKw, 1)}
                />
              ))}
            </View>
          </Card>

          {/* ── Weather Summary ── */}
          <SectionTitle title="Weather Conditions" />
          <Card>
            <View style={styles.weatherGrid}>
              <WeatherStat icon="🌡️" label="Temp" value={`${avgTemp.toFixed(1)}°C`} />
              <WeatherStat icon="💧" label="Humidity" value={`${Math.round(avgHumidity * 100)}%`} />
              <WeatherStat icon="💨" label="Wind" value={`${avgWindSpeed.toFixed(1)} m/s`} />
              <WeatherStat icon="☁️" label="Cloud" value={`${Math.round(avgCloudCover * 100)}%`} />
              <WeatherStat icon="🌫️" label="Dew Pt" value={`${avgDewPoint.toFixed(1)}°C`} />
              <WeatherStat icon="🔵" label="Pressure" value={`${avgPressure.toFixed(0)} hPa`} />
            </View>
          </Card>

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ icon, label, value, color }) {
  return (
    <View style={[styles.metricCard, { borderColor: color + '40' }]}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function LegendDot({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function ApplianceRow({ name, value, max }) {
  const safeValue = toNumber(value);
  const safeMax = toNumber(max, 1);
  const pct = safeMax > 0 ? (safeValue / safeMax) : 0;
  const widthPct = clamp(Number.isFinite(pct) ? pct * 100 : 0, 2, 100);
  return (
    <View style={styles.appRow}>
      <Text style={styles.appName}>{name}</Text>
      <View style={styles.appBarBg}>
        <View style={[styles.appBarFill, { width: `${widthPct}%` }]} />
      </View>
      <Text style={styles.appVal}>{safeValue.toFixed(3)}</Text>
    </View>
  );
}

function WeatherStat({ icon, label, value }) {
  return (
    <View style={styles.wxCard}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={styles.wxVal}>{value}</Text>
      <Text style={styles.wxLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  loadingText: { color: COLORS.textMuted, marginTop: 12, fontSize: 14 },

  // Hero
  hero: { paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  heroLabel: { color: COLORS.teal, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  heroTitle: { color: COLORS.text, fontSize: 26, fontWeight: '800', marginTop: 4 },
  heroSub: { color: COLORS.textMuted, fontSize: 13, marginTop: 3 },
  iconBubble: { width: 54, height: 54, backgroundColor: COLORS.teal + '15', borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.teal + '30' },

  // Status
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.border, marginBottom: 14 },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginRight: 7 },
  statusText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },

  // Range
  rangeRow: { flexDirection: 'row', gap: 8 },
  rangeBtn: { paddingVertical: 7, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  rangeBtnActive: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  rangeBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  rangeBtnTextActive: { color: '#fff' },

  body: { padding: 18, paddingTop: 22 },

  // Overview cards
  cardGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metricCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, borderWidth: 1, alignItems: 'center' },
  metricIcon: { fontSize: 26, marginBottom: 6 },
  metricValue: { fontSize: 18, fontWeight: '800' },
  metricLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },

  // Chart
  chartCard: { paddingHorizontal: 16, paddingVertical: 14 },
  noChartText: { color: COLORS.textMuted, textAlign: 'center', marginVertical: 40, fontSize: 13 },
  legendRow: { flexDirection: 'row', gap: 14, marginBottom: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },

  // Appliance list
  applianceList: { marginTop: 16, gap: 8 },
  appRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appName: { color: COLORS.textMuted, fontSize: 11, width: 80, fontWeight: '600' },
  appBarBg: { flex: 1, height: 6, backgroundColor: COLORS.surfaceAlt, borderRadius: 4, overflow: 'hidden' },
  appBarFill: { height: 6, backgroundColor: COLORS.blue, borderRadius: 4 },
  appVal: { color: COLORS.text, fontSize: 11, fontWeight: '700', width: 42, textAlign: 'right' },

  // Weather
  weatherGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  wxCard: { backgroundColor: COLORS.surfaceAlt, borderRadius: 14, padding: 14, alignItems: 'center', width: (CHART_WIDTH - 32 - 20) / 3, borderWidth: 1, borderColor: COLORS.border },
  wxVal: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginTop: 5 },
  wxLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },
});
