import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, StatusBar,
  TouchableOpacity, Alert, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { devicesAPI } from '../services/api';
import { COLORS, Card, SectionTitle, ScreenHeader, PrimaryButton, Badge, EmptyState, AppInput } from '../components/UIKit';

const STATUS_COLORS = {
  active: COLORS.green,
  inactive: COLORS.textMuted,
  maintenance: '#FFD700',
  offline: COLORS.red,
};

const DEVICE_TYPES = ['Smart Meter', 'HVAC', 'Lighting', 'Solar Panel', 'EV Charger', 'Sensor', 'Other'];

export default function DevicesScreen() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ device_name: '', device_type: '', device_id: '', status: 'active', location: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await devicesAPI.getAll();
      setDevices(res.data.data);
    } catch (e) { console.log(e?.message); }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await devicesAPI.getStats();
      setStats(res.data.data);
    } catch (e) { console.log(e?.message); }
  }, []);

  useEffect(() => { load(); loadStats(); }, [load, loadStats]);
  const onRefresh = async () => { setRefreshing(true); await Promise.all([load(), loadStats()]); setRefreshing(false); };

  const handleCreate = async () => {
    const { device_name, device_type, device_id, status, location } = form;
    if (!device_name || !device_type || !device_id) { Alert.alert('Missing', 'Name, type and device ID are required.'); return; }
    setSaving(true);
    try {
      await devicesAPI.create({ device_name, device_type, device_id, status, location, user_id: user.id });
      setModalVisible(false);
      setForm({ device_name: '', device_type: '', device_id: '', status: 'active', location: '' });
      await load();
      Alert.alert('✅ Created', `${device_name} added successfully!`);
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to create device.');
    } finally { setSaving(false); }
  };

  const handleDelete = (device) => {
    Alert.alert('Delete Device', `Remove "${device.device_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try { await devicesAPI.delete(device.id); await load(); } catch (e) { Alert.alert('Error', 'Could not delete device.'); }
        }
      }
    ]);
  };

  const handleStatusToggle = async (device) => {
    const next = device.status === 'active' ? 'inactive' : 'active';
    try {
      await devicesAPI.updateStatus(device.id, next);
      await load();
    } catch (e) { Alert.alert('Error', 'Could not update status.'); }
  };

  const filtered = devices.filter(d =>
    d.device_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.device_type?.toLowerCase().includes(search.toLowerCase()) ||
    d.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.teal} />}
        contentContainerStyle={styles.scroll}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <ScreenHeader title="Devices" subtitle={`${devices.length} registered`} />
          <TouchableOpacity onPress={() => setStatsVisible(!statsVisible)} style={styles.statsIcon}>
            <Ionicons name="stats-chart" size={20} color={COLORS.teal} />
          </TouchableOpacity>
        </View>

        {/* Stats Panel */}
        {statsVisible && stats && (
          <Card style={{ marginBottom: 20 }}>
            <SectionTitle title="Device Summary" />
            <View style={styles.statsRow}>
              <StatMini label="Total" value={stats.summary.total_devices} color={COLORS.text} />
              <StatMini label="Active" value={stats.summary.active_devices} color={COLORS.green} />
              <StatMini label="Inactive" value={stats.summary.inactive_devices} color={COLORS.textMuted} />
              <StatMini label="Offline" value={stats.summary.offline_devices} color={COLORS.red} />
            </View>
          </Card>
        )}

        {/* Search */}
        <AppInput
          placeholder="Search devices…"
          value={search}
          onChangeText={setSearch}
          rightSlot={<Ionicons name="search" size={18} color={COLORS.textMuted} />}
          style={{ marginBottom: 20 }}
        />

        <PrimaryButton title="＋ Add New Device" onPress={() => setModalVisible(true)} style={{ marginBottom: 24 }} />

        <SectionTitle title={`All Devices (${filtered.length})`} />
        {filtered.length === 0 ? (
          <EmptyState icon="📡" message="No devices found. Add your first smart device!" />
        ) : (
          filtered.map(d => (
            <Card key={d.id} style={styles.deviceCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={[styles.devIcon, { backgroundColor: (STATUS_COLORS[d.status] || COLORS.textMuted) + '15' }]}>
                  <Ionicons name="hardware-chip" size={24} color={STATUS_COLORS[d.status] || COLORS.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.devName}>{d.device_name}</Text>
                  <Text style={styles.devType}>{d.device_type} {d.location ? `· ${d.location}` : ''}</Text>
                </View>
                <Badge label={d.status} color={STATUS_COLORS[d.status] || COLORS.textMuted} />
              </View>
              <View style={styles.devActions}>
                <TouchableOpacity style={styles.devBtn} onPress={() => handleStatusToggle(d)}>
                  <Ionicons name={d.status === 'active' ? 'pause-circle' : 'play-circle'} size={18} color={COLORS.teal} />
                  <Text style={[styles.devBtnText, { color: COLORS.teal }]}>{d.status === 'active' ? 'Turn Off' : 'Turn On'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.devBtn} onPress={() => handleDelete(d)}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.red} />
                  <Text style={[styles.devBtnText, { color: COLORS.red }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add Device Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Device</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <AppInput
                label="Device Name"
                value={form.device_name}
                onChangeText={v => setForm(p => ({ ...p, device_name: v }))}
                placeholder="e.g. Living Room AC"
              />
              <AppInput
                label="Device Serial ID"
                value={form.device_id}
                onChangeText={v => setForm(p => ({ ...p, device_id: v }))}
                placeholder="e.g. SN-10293"
              />
              <AppInput
                label="Location (Optional)"
                value={form.location}
                onChangeText={v => setForm(p => ({ ...p, location: v }))}
                placeholder="e.g. Bedroom"
              />
              
              <Text style={styles.modalLabel}>Device Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {DEVICE_TYPES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chipBtn, form.device_type === t && styles.chipBtnActive]}
                    onPress={() => setForm(p => ({ ...p, device_type: t }))}
                  >
                    <Text style={[styles.chipText, form.device_type === t && { color: '#fff' }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <PrimaryButton title={saving ? 'Saving…' : 'Save Device'} onPress={handleCreate} loading={saving} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatMini({ label, value, color }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={{ color: COLORS.textMuted, fontSize: 11, textTransform: 'uppercase', fontWeight: '700', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18, paddingTop: 56 },
  statsIcon: { padding: 8, backgroundColor: COLORS.surfaceAlt, borderRadius: 10, marginBottom: 8 },
  statsRow: { flexDirection: 'row', marginTop: 12 },
  statVal: { fontSize: 22, fontWeight: '800' },
  deviceCard: { marginBottom: 16 },
  devIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  devName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  devType: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  devActions: { flexDirection: 'row', gap: 20, marginTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border + '60', paddingTop: 12 },
  devBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  devBtnText: { fontSize: 14, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: '#000000bb', justifyContent: 'flex-end' },
  modal: { backgroundColor: COLORS.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { color: COLORS.text, fontSize: 24, fontWeight: '800' },
  modalLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  chipBtn: { borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10 },
  chipBtnActive: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  chipText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
});

