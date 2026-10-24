import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminGuard } from '../../src/components/admin/AdminGuard';
import { AdminHeader } from '../../src/components/admin/AdminHeader';
import { auth } from '../../src/firebase/config';
import {
  getAdminSystemSettings,
  updateAdminSystemSettings,
} from '../../src/services/adminService';
import type { AdminSystemSettings } from '../../src/types/admin';

export default function AdminSettingsScreen() {
  const [settings, setSettings] = useState<AdminSystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getAdminSystemSettings();
      setSettings(data);
      setLoading(false);
    };
    void load();
  }, []);

  const handleToggle = (key: keyof AdminSystemSettings, val: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [key]: val,
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const adminUid = auth.currentUser?.uid || 'admin-designated';

    const res = await updateAdminSystemSettings(adminUid, settings);
    setSaving(false);

    if (res.success) {
      Alert.alert('Settings Saved', 'Platform configuration updated successfully.');
    } else {
      Alert.alert('Save Failed', res.error || 'Failed to update settings.');
    }
  };

  return (
    <AdminGuard>
      <SafeAreaView style={styles.container} edges={['top']}>
        <AdminHeader
          title="Platform Settings"
          subtitle="System Security &amp; Authorization Configuration"
        />

        {loading || !settings ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={styles.loadingText}>Loading system settings...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Designated Admin Box */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.iconWrap}>
                  <Feather name="shield" size={18} color="#0EA5E9" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Designated Administrator Policy</Text>
                  <Text style={styles.cardSub}>Single Authorized Authority</Text>
                </View>
              </View>

              <View style={styles.idBox}>
                <Text style={styles.idLabel}>ACTIVE ADMIN UID</Text>
                <Text style={styles.idValue} selectable>
                  {settings.adminUid || 'Not configured in environment'}
                </Text>
              </View>

              <Text style={styles.idNote}>
                Client-side role tampering is blocked by Firestore Security Rules. Only tokens matching this UID or containing server custom claims can authorize changes.
              </Text>
            </View>

            {/* Feature Controls */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconWrap, { backgroundColor: '#10B98120' }]}>
                  <Feather name="sliders" size={18} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Feature Availability</Text>
                  <Text style={styles.cardSub}>Global module &amp; tool controls</Text>
                </View>
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Athlete Registration</Text>
                  <Text style={styles.switchSub}>Allow new athletes to sign up</Text>
                </View>
                <Switch
                  value={settings.registrationOpen}
                  onValueChange={(val) => handleToggle('registrationOpen', val)}
                  trackColor={{ false: '#334155', true: '#0EA5E9' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Medicine Barcode Scanner</Text>
                  <Text style={styles.switchSub}>Camera barcode and manual medicine lookup</Text>
                </View>
                <Switch
                  value={settings.scannerEnabled}
                  onValueChange={(val) => handleToggle('scannerEnabled', val)}
                  trackColor={{ false: '#334155', true: '#0EA5E9' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>AI Anti-Doping Coach</Text>
                  <Text style={styles.switchSub}>Context-aware athlete learning assistant</Text>
                </View>
                <Switch
                  value={settings.aiCoachEnabled}
                  onValueChange={(val) => handleToggle('aiCoachEnabled', val)}
                  trackColor={{ false: '#334155', true: '#0EA5E9' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchLabel}>Maintenance Mode</Text>
                  <Text style={styles.switchSub}>Suspend non-admin access for updates</Text>
                </View>
                <Switch
                  value={settings.maintenanceMode}
                  onValueChange={(val) => handleToggle('maintenanceMode', val)}
                  trackColor={{ false: '#334155', true: '#EF4444' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Quiz Standards */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconWrap, { backgroundColor: '#8B5CF620' }]}>
                  <Feather name="award" size={18} color="#8B5CF6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Academic Standards</Text>
                  <Text style={styles.cardSub}>WADA Code Mastery Passing Criteria</Text>
                </View>
              </View>

              <View style={styles.thresholdRow}>
                <Text style={styles.thresholdLabel}>Minimum Quiz Passing Score</Text>
                <View style={styles.thresholdBadge}>
                  <Text style={styles.thresholdText}>{settings.minQuizPassingScore}%</Text>
                </View>
              </View>
              <Text style={styles.thresholdHelp}>
                Athletes must achieve at least {settings.minQuizPassingScore}% accuracy to earn module XP and badges.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              disabled={saving}
              onPress={handleSave}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>Save Configuration</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </AdminGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 12,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0EA5E920',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  cardSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 1,
  },
  idBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  idLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  idValue: {
    color: '#0EA5E9',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  idNote: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#33415550',
  },
  switchLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  switchSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  thresholdLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  thresholdBadge: {
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B5CF650',
  },
  thresholdText: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '800',
  },
  thresholdHelp: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0EA5E9',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
