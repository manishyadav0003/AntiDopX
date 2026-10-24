import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminGuard } from '../../src/components/admin/AdminGuard';
import { AdminHeader } from '../../src/components/admin/AdminHeader';
import { subscribeToAdminAuditLogs } from '../../src/services/adminService';
import type { AdminAuditLog } from '../../src/types/admin';

export default function AdminAuditScreen() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAdminAuditLogs(50, (data) => {
      setLogs(data);
      setLoading(false);
    });

    return () => {
      unsub();
    };
  }, []);

  return (
    <AdminGuard>
      <SafeAreaView style={styles.container} edges={['top']}>
        <AdminHeader
          title="Audit Log"
          subtitle="Immutable Regulatory Activity Trail"
        />

        <View style={styles.complianceNotice}>
          <Feather name="lock" size={16} color="#10B981" style={{ marginRight: 8 }} />
          <Text style={styles.complianceText}>
            WADA compliance requires audit trails to be immutable. Administrative actions recorded below cannot be altered or removed.
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Syncing audit logs...</Text>
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="shield" size={40} color="#64748B" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>No audit events recorded yet</Text>
                <Text style={styles.emptySubtitle}>Administrative actions will appear here in real-time.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={styles.actionPill}>
                    <Text style={styles.actionText}>{item.action}</Text>
                  </View>
                  <Text style={styles.timestampText}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </View>

                <Text style={styles.detailsText}>{item.details}</Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>TARGET</Text>
                    <Text style={styles.metaVal}>{item.targetEntity}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>ACTOR</Text>
                    <Text style={styles.metaVal}>{item.adminEmail || item.adminId}</Text>
                  </View>
                </View>
              </View>
            )}
          />
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
  complianceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98110',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#10B98125',
  },
  complianceText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
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
  listContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    color: '#64748B',
    fontSize: 13,
  },
  logCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionPill: {
    backgroundColor: '#0EA5E920',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0EA5E940',
  },
  actionText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timestampText: {
    color: '#64748B',
    fontSize: 11,
  },
  detailsText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#33415550',
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaVal: {
    color: '#94A3B8',
    fontSize: 11,
  },
});
