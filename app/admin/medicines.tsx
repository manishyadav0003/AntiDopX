import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminGuard } from '../../src/components/admin/AdminGuard';
import { AdminHeader } from '../../src/components/admin/AdminHeader';
import { getAdminMedicineRecords } from '../../src/services/adminService';
import type { AdminMedicineRecord } from '../../src/types/admin';

export default function AdminMedicinesScreen() {
  const [medicines, setMedicines] = useState<AdminMedicineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PROHIBITED' | 'CONDITIONAL' | 'PERMITTED'>('ALL');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await getAdminMedicineRecords();
      setMedicines(data);
      setLoading(false);
    };
    void load();
  }, []);

  const filteredMedicines = medicines.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      m.brandName.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      (m.barcode && m.barcode.includes(q)) ||
      m.category.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' || m.wadaStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminGuard>
      <SafeAreaView style={styles.container} edges={['top']}>
        <AdminHeader
          title="Medicine Reference DB"
          subtitle={`${filteredMedicines.length} verified records`}
        />

        <View style={styles.filterSection}>
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by brand, generic, barcode..."
              placeholderTextColor="#64748B"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x" size={16} color="#64748B" />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.chipRow}>
            {(['ALL', 'PROHIBITED', 'CONDITIONAL', 'PERMITTED'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, statusFilter === s && styles.chipActive]}
                onPress={() => setStatusFilter(s)}
              >
                <Text style={[styles.chipText, statusFilter === s && styles.chipTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#EC4899" />
            <Text style={styles.loadingText}>Loading medicine reference data...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredMedicines}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="pill-off" size={40} color="#64748B" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>No matching medicine records</Text>
                <Text style={styles.emptySubtitle}>Adjust search keyword or status filter.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.medCard}>
                <View style={styles.medHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.brandName}>{item.brandName}</Text>
                    <Text style={styles.genericName}>{item.genericName}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      item.wadaStatus === 'PROHIBITED'
                        ? styles.pillProhibited
                        : item.wadaStatus === 'CONDITIONAL'
                        ? styles.pillConditional
                        : styles.pillPermitted,
                    ]}
                  >
                    <Feather
                      name={
                        item.wadaStatus === 'PROHIBITED'
                          ? 'x-circle'
                          : item.wadaStatus === 'CONDITIONAL'
                          ? 'alert-triangle'
                          : 'check-circle'
                      }
                      size={11}
                      color={
                        item.wadaStatus === 'PROHIBITED'
                          ? '#EF4444'
                          : item.wadaStatus === 'CONDITIONAL'
                          ? '#F59E0B'
                          : '#10B981'
                      }
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        item.wadaStatus === 'PROHIBITED'
                          ? styles.textProhibited
                          : item.wadaStatus === 'CONDITIONAL'
                          ? styles.textConditional
                          : styles.textPermitted,
                      ]}
                    >
                      {item.wadaStatus}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  {item.barcode ? (
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="barcode" size={14} color="#64748B" style={{ marginRight: 4 }} />
                      <Text style={styles.metaText}>{item.barcode}</Text>
                    </View>
                  ) : null}
                  <View style={styles.metaItem}>
                    <Feather name="navigation" size={12} color="#64748B" style={{ marginRight: 4 }} />
                    <Text style={styles.metaText}>{item.category}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="calendar" size={12} color="#64748B" style={{ marginRight: 4 }} />
                    <Text style={styles.metaText}>Verified {item.verifiedDate}</Text>
                  </View>
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.sourceText}>Source: {item.source}</Text>
                  <Text style={styles.authorityText}>Auth: {item.verifiedBy}</Text>
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
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#EC489920',
    borderColor: '#EC4899',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#EC4899',
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
  medCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  genericName: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillProhibited: {
    backgroundColor: '#EF444415',
  },
  pillConditional: {
    backgroundColor: '#F59E0B15',
  },
  pillPermitted: {
    backgroundColor: '#10B98115',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textProhibited: {
    color: '#EF4444',
  },
  textConditional: {
    color: '#F59E0B',
  },
  textPermitted: {
    color: '#10B981',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#33415550',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sourceText: {
    color: '#64748B',
    fontSize: 10,
  },
  authorityText: {
    color: '#64748B',
    fontSize: 10,
  },
});
