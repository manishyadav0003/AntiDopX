import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminGuard } from '../../src/components/admin/AdminGuard';
import { AdminHeader } from '../../src/components/admin/AdminHeader';
import { getAdminCurriculumModules } from '../../src/services/adminService';
import type { AdminCurriculumModule } from '../../src/types/admin';

export default function AdminModulesScreen() {
  const [modules, setModules] = useState<AdminCurriculumModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getAdminCurriculumModules();
      setModules(data);
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <AdminGuard>
      <SafeAreaView style={styles.container} edges={['top']}>
        <AdminHeader
          title="Curriculum Management"
          subtitle={`${modules.length} Anti-Doping Educational Modules`}
        />

        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading curriculum modules...</Text>
          </View>
        ) : (
          <FlatList
            data={modules}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => {
              const isExpanded = expandedId === item.id;
              return (
                <View style={styles.moduleCard}>
                  <TouchableOpacity
                    style={styles.cardMain}
                    onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    <View style={styles.moduleLeft}>
                      <View style={styles.indexCircle}>
                        <Text style={styles.indexNum}>{index + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.moduleTitle}>{item.title}</Text>
                        <Text style={styles.moduleSlug}>Key: {item.id}</Text>
                      </View>
                    </View>

                    <View style={styles.rightPillCol}>
                      <View style={styles.xpBadge}>
                        <Feather name="zap" size={11} color="#06B6D4" style={{ marginRight: 3 }} />
                        <Text style={styles.xpText}>+{item.xpReward} XP</Text>
                      </View>
                      <Feather
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#64748B"
                        style={{ marginTop: 4 }}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Summary row */}
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <Feather name="layers" size={12} color="#94A3B8" style={{ marginRight: 4 }} />
                      <Text style={styles.summaryText}>{item.sectionsCount} Sections</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Feather name="help-circle" size={12} color="#94A3B8" style={{ marginRight: 4 }} />
                      <Text style={styles.summaryText}>{item.questionsCount} Quiz Questions</Text>
                    </View>
                    <View style={styles.publishPill}>
                      <View style={styles.greenDot} />
                      <Text style={styles.publishText}>PUBLISHED</Text>
                    </View>
                  </View>

                  {isExpanded ? (
                    <View style={styles.expandedDetails}>
                      <View style={styles.metaBox}>
                        <Text style={styles.metaLabel}>WADA Curriculum Alignment</Text>
                        <Text style={styles.metaValue}>
                          Strict Liability, Testing Protocols, and Substance Caution rules active.
                        </Text>
                      </View>
                      <View style={styles.metaBox}>
                        <Text style={styles.metaLabel}>Route Endpoint</Text>
                        <Text style={styles.metaValue}>/modules/{item.slug}</Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            }}
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
  moduleCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  moduleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  indexCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#8B5CF620',
    borderWidth: 1,
    borderColor: '#8B5CF640',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexNum: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: '800',
  },
  moduleTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  moduleSlug: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  rightPillCol: {
    alignItems: 'flex-end',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06B6D415',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  xpText: {
    color: '#06B6D4',
    fontSize: 11,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#33415550',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  publishPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greenDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  publishText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  expandedDetails: {
    padding: 16,
    backgroundColor: '#131D31',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 10,
  },
  metaBox: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
  },
  metaLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metaValue: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 18,
  },
});
