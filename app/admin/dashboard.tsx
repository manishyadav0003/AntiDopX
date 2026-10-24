import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminGuard } from '../../src/components/admin/AdminGuard';
import { AdminHeader } from '../../src/components/admin/AdminHeader';
import {
  subscribeToAdminAuditLogs,
  subscribeToAdminMetrics,
} from '../../src/services/adminService';
import type { AdminAuditLog, AdminDashboardMetrics } from '../../src/types/admin';

export default function AdminDashboardScreen() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [recentLogs, setRecentLogs] = useState<AdminAuditLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubMetrics = subscribeToAdminMetrics((data) => {
      setMetrics(data);
      setRefreshing(false);
    });

    const unsubLogs = subscribeToAdminAuditLogs(4, (logs) => {
      setRecentLogs(logs);
    });

    return () => {
      unsubMetrics();
      unsubLogs();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Realtime listeners trigger automatically
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <AdminGuard>
      <SafeAreaView style={styles.container} edges={['top']}>
        <AdminHeader
          title="Executive Terminal"
          subtitle="Real-time Anti-Doping Management"
          rightAction={
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={onRefresh}
            >
              <Feather name="refresh-cw" size={16} color="#0EA5E9" />
            </TouchableOpacity>
          }
        />

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0EA5E9"
            />
          }
        >
          {/* Security Status Banner */}
          <View style={styles.statusBanner}>
            <View style={styles.statusLeft}>
              <View style={styles.activeDot} />
              <View>
                <Text style={styles.statusTitle}>Firestore Data Sync Active</Text>
                <Text style={styles.statusSubtitle}>WADA 2026 Code Compliant Rules Engine</Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <Feather name="shield" size={13} color="#10B981" style={{ marginRight: 4 }} />
              <Text style={styles.statusBadgeText}>ENFORCED</Text>
            </View>
          </View>

          {/* KPI Metrics Grid */}
          <Text style={styles.sectionHeader}>Platform Overview</Text>

          {!metrics ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#0EA5E9" />
              <Text style={styles.loadingText}>Syncing real-time records...</Text>
            </View>
          ) : (
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <View style={[styles.kpiIconWrap, { backgroundColor: '#0284C720' }]}>
                  <Feather name="users" size={20} color="#0EA5E9" />
                </View>
                <Text style={styles.kpiValue}>{metrics.totalUsers}</Text>
                <Text style={styles.kpiLabel}>Total Accounts</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={[styles.kpiIconWrap, { backgroundColor: '#10B98120' }]}>
                  <MaterialCommunityIcons name="run" size={20} color="#10B981" />
                </View>
                <Text style={styles.kpiValue}>{metrics.totalAthletes}</Text>
                <Text style={styles.kpiLabel}>Registered Athletes</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={[styles.kpiIconWrap, { backgroundColor: '#F59E0B20' }]}>
                  <Feather name="user-check" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.kpiValue}>{metrics.totalCoaches}</Text>
                <Text style={styles.kpiLabel}>Verified Coaches</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={[styles.kpiIconWrap, { backgroundColor: '#8B5CF620' }]}>
                  <Feather name="book-open" size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.kpiValue}>{metrics.totalModules}</Text>
                <Text style={styles.kpiLabel}>Active Modules</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={[styles.kpiIconWrap, { backgroundColor: '#EC489920' }]}>
                  <MaterialCommunityIcons name="pill" size={20} color="#EC4899" />
                </View>
                <Text style={styles.kpiValue}>{metrics.totalMedicines}</Text>
                <Text style={styles.kpiLabel}>Verified Medicines</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={[styles.kpiIconWrap, { backgroundColor: '#06B6D420' }]}>
                  <Feather name="activity" size={20} color="#06B6D4" />
                </View>
                <Text style={styles.kpiValue}>{metrics.activeUsersThisWeek}</Text>
                <Text style={styles.kpiLabel}>Weekly Active</Text>
              </View>
            </View>
          )}

          {/* Quick Management Shortcuts */}
          <Text style={styles.sectionHeader}>Administrative Consoles</Text>

          <View style={styles.consolesList}>
            <TouchableOpacity
              style={styles.consoleCard}
              onPress={() => router.push('/admin/users')}
            >
              <View style={styles.consoleLeft}>
                <View style={[styles.consoleIcon, { backgroundColor: '#0284C720' }]}>
                  <Feather name="users" size={20} color="#0EA5E9" />
                </View>
                <View>
                  <Text style={styles.consoleTitle}>User &amp; Role Management</Text>
                  <Text style={styles.consoleDesc}>Inspect athletes, assign coaches, configure roles</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.consoleCard}
              onPress={() => router.push('/admin/modules')}
            >
              <View style={styles.consoleLeft}>
                <View style={[styles.consoleIcon, { backgroundColor: '#8B5CF620' }]}>
                  <Feather name="book" size={20} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={styles.consoleTitle}>Curriculum &amp; Question Bank</Text>
                  <Text style={styles.consoleDesc}>16 WADA educational modules and adaptive quiz bank</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.consoleCard}
              onPress={() => router.push('/admin/medicines')}
            >
              <View style={styles.consoleLeft}>
                <View style={[styles.consoleIcon, { backgroundColor: '#EC489920' }]}>
                  <MaterialCommunityIcons name="shield-search" size={20} color="#EC4899" />
                </View>
                <View>
                  <Text style={styles.consoleTitle}>Medicine &amp; WADA Reference Database</Text>
                  <Text style={styles.consoleDesc}>Verify ingredients, barcodes, and TUE requirements</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.consoleCard}
              onPress={() => router.push('/admin/audit')}
            >
              <View style={styles.consoleLeft}>
                <View style={[styles.consoleIcon, { backgroundColor: '#10B98120' }]}>
                  <Feather name="shield" size={20} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.consoleTitle}>Regulatory Audit Trails</Text>
                  <Text style={styles.consoleDesc}>Immutable event log of administrative operations</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.consoleCard}
              onPress={() => router.push('/admin/settings')}
            >
              <View style={styles.consoleLeft}>
                <View style={[styles.consoleIcon, { backgroundColor: '#F59E0B20' }]}>
                  <Feather name="sliders" size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.consoleTitle}>System Security &amp; Authorization</Text>
                  <Text style={styles.consoleDesc}>Designated administrator UID and security rules status</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Recent Audit Events */}
          <View style={styles.auditHeaderRow}>
            <Text style={styles.sectionHeader}>Recent Audit Events</Text>
            <TouchableOpacity onPress={() => router.push('/admin/audit')}>
              <Text style={styles.viewAllText}>View Log</Text>
            </TouchableOpacity>
          </View>

          {recentLogs.length === 0 ? (
            <View style={styles.emptyLogBox}>
              <Feather name="check-circle" size={20} color="#64748B" style={{ marginBottom: 6 }} />
              <Text style={styles.emptyLogText}>No critical audit flags registered.</Text>
            </View>
          ) : (
            <View style={styles.logsList}>
              {recentLogs.map((log) => (
                <View key={log.id} style={styles.logCard}>
                  <View style={styles.logTop}>
                    <View style={styles.logBadge}>
                      <Text style={styles.logBadgeText}>{log.action}</Text>
                    </View>
                    <Text style={styles.logTime}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <Text style={styles.logDetails}>{log.details}</Text>
                  <Text style={styles.logTarget}>{log.targetEntity}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </AdminGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  statusTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  statusSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98115',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  kpiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiValue: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '900',
  },
  kpiLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  loadingBox: {
    padding: 32,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 10,
  },
  consolesList: {
    gap: 10,
    marginBottom: 24,
  },
  consoleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  consoleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  consoleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  consoleTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  consoleDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  auditHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  viewAllText: {
    color: '#0EA5E9',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyLogBox: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyLogText: {
    color: '#64748B',
    fontSize: 13,
  },
  logsList: {
    gap: 10,
  },
  logCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  logBadge: {
    backgroundColor: '#0EA5E915',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logBadgeText: {
    color: '#0EA5E9',
    fontSize: 10,
    fontWeight: '800',
  },
  logTime: {
    color: '#64748B',
    fontSize: 11,
  },
  logDetails: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  logTarget: {
    color: '#94A3B8',
    fontSize: 11,
  },
});
