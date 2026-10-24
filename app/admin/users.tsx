import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminGuard } from '../../src/components/admin/AdminGuard';
import { AdminHeader } from '../../src/components/admin/AdminHeader';
import { auth } from '../../src/firebase/config';
import {
  assignCoachToAthlete,
  subscribeToAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '../../src/services/adminService';
import type { AccountStatus, AdminUser } from '../../src/types/admin';
import type { UserRole } from '../../src/types/roles';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ATHLETE' | 'COACH' | 'ADMIN'>('ALL');

  // Role edit modal state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState('');

  useEffect(() => {
    const unsub = subscribeToAdminUsers(roleFilter, (data) => {
      setUsers(data);
      setLoading(false);
    });

    return () => {
      unsub();
    };
  }, [roleFilter]);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.sport.toLowerCase().includes(q)
    );
  });

  const coaches = users.filter((u) => u.role === 'COACH');

  const handleUpdateRole = async (newRole: UserRole) => {
    if (!selectedUser) return;
    const adminUid = auth.currentUser?.uid || 'admin-designated';

    setShowRoleModal(false);
    const res = await updateAdminUserRole(adminUid, selectedUser.uid, newRole);
    if (res.success) {
      Alert.alert('Role Updated', `${selectedUser.name} role changed to ${newRole}`);
    } else {
      Alert.alert('Update Failed', res.error || 'Permission denied');
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const adminUid = auth.currentUser?.uid || 'admin-designated';
    const nextStatus: AccountStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    Alert.alert(
      `${nextStatus === 'SUSPENDED' ? 'Suspend' : 'Activate'} User`,
      `Are you sure you want to change ${user.name}'s status to ${nextStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: nextStatus === 'SUSPENDED' ? 'destructive' : 'default',
          onPress: async () => {
            const res = await updateAdminUserStatus(adminUid, user.uid, nextStatus);
            if (!res.success) {
              Alert.alert('Status Error', res.error || 'Action failed');
            }
          },
        },
      ]
    );
  };

  const handleAssignCoach = async () => {
    if (!selectedUser || !selectedCoachId) return;
    const adminUid = auth.currentUser?.uid || 'admin-designated';
    const coach = coaches.find((c) => c.uid === selectedCoachId);
    if (!coach) return;

    setShowCoachModal(false);
    const res = await assignCoachToAthlete(
      adminUid,
      coach.uid,
      coach.name,
      coach.email,
      selectedUser.uid,
      selectedUser.name,
      selectedUser.email,
      selectedUser.sport
    );

    if (res.success) {
      Alert.alert('Assignment Saved', `${coach.name} assigned to ${selectedUser.name}`);
    } else {
      Alert.alert('Assignment Failed', res.error || 'Action failed');
    }
  };

  return (
    <AdminGuard>
      <SafeAreaView style={styles.container} edges={['top']}>
        <AdminHeader
          title="User Directory"
          subtitle={`${filteredUsers.length} accounts found`}
        />

        <View style={styles.filterSection}>
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color="#64748B" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email, sport..."
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
            {(['ALL', 'ATHLETE', 'COACH', 'ADMIN'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.chip, roleFilter === r && styles.chipActive]}
                onPress={() => setRoleFilter(r)}
              >
                <Text style={[styles.chipText, roleFilter === r && styles.chipTextActive]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color="#0EA5E9" />
            <Text style={styles.loadingText}>Loading user records from Firestore...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Feather name="user-x" size={36} color="#64748B" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>No matching accounts</Text>
                <Text style={styles.emptySubtitle}>Try changing your filter or search query.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.userCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.userInfoLeft}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarInitials}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName}>{item.name}</Text>
                      <Text style={styles.userEmail}>{item.email}</Text>
                      <Text style={styles.userSport}>{item.sport}</Text>
                    </View>
                  </View>

                  <View style={styles.badgesCol}>
                    <View
                      style={[
                        styles.roleBadge,
                        item.role === 'ADMIN'
                          ? styles.badgeAdmin
                          : item.role === 'COACH'
                          ? styles.badgeCoach
                          : styles.badgeAthlete,
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleBadgeText,
                          item.role === 'ADMIN'
                            ? styles.textAdmin
                            : item.role === 'COACH'
                            ? styles.textCoach
                            : styles.textAthlete,
                        ]}
                      >
                        {item.role}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        item.status === 'ACTIVE'
                          ? styles.statusActive
                          : item.status === 'SUSPENDED'
                          ? styles.statusSuspended
                          : styles.statusPending,
                      ]}
                    >
                      <Text style={styles.statusBadgeText}>{item.status}</Text>
                    </View>
                  </View>
                </View>

                {/* Metrics strip */}
                <View style={styles.statsStrip}>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>XP Earned</Text>
                    <Text style={styles.statNum}>{item.xp}</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Streak</Text>
                    <Text style={styles.statNum}>{item.streak}d</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Modules</Text>
                    <Text style={styles.statNum}>{item.completedModulesCount}/16</Text>
                  </View>
                </View>

                {item.role === 'ATHLETE' ? (
                  <View style={styles.coachRow}>
                    <Feather name="user-check" size={13} color="#0EA5E9" style={{ marginRight: 6 }} />
                    <Text style={styles.coachLabel}>
                      Coach:{' '}
                      <Text style={{ color: '#F8FAFC', fontWeight: '700' }}>
                        {item.assignedCoachName || 'Unassigned'}
                      </Text>
                    </Text>
                  </View>
                ) : null}

                {/* Actions Bar */}
                <View style={styles.actionsBar}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => {
                      setSelectedUser(item);
                      setShowRoleModal(true);
                    }}
                  >
                    <Feather name="shield" size={13} color="#0EA5E9" style={{ marginRight: 5 }} />
                    <Text style={styles.actionBtnText}>Change Role</Text>
                  </TouchableOpacity>

                  {item.role === 'ATHLETE' ? (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => {
                        setSelectedUser(item);
                        setSelectedCoachId(item.assignedCoachId || '');
                        setShowCoachModal(true);
                      }}
                    >
                      <Feather name="link" size={13} color="#8B5CF6" style={{ marginRight: 5 }} />
                      <Text style={[styles.actionBtnText, { color: '#8B5CF6' }]}>
                        Assign Coach
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      item.status === 'ACTIVE' ? styles.btnSuspend : styles.btnActivate,
                    ]}
                    onPress={() => handleToggleStatus(item)}
                  >
                    <Feather
                      name={item.status === 'ACTIVE' ? 'slash' : 'check'}
                      size={13}
                      color={item.status === 'ACTIVE' ? '#EF4444' : '#10B981'}
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: item.status === 'ACTIVE' ? '#EF4444' : '#10B981' },
                      ]}
                    >
                      {item.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        {/* Change Role Modal */}
        <Modal visible={showRoleModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Update Role for {selectedUser?.name}</Text>
              <Text style={styles.modalSubtitle}>
                Select the permitted platform role. Role authorization is enforced by Firestore rules.
              </Text>

              {(['ATHLETE', 'COACH', 'ADMIN'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.roleOption,
                    selectedUser?.role === r && styles.roleOptionSelected,
                  ]}
                  onPress={() => handleUpdateRole(r)}
                >
                  <Text style={styles.roleOptionText}>{r}</Text>
                  {selectedUser?.role === r ? (
                    <Feather name="check" size={16} color="#0EA5E9" />
                  ) : null}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowRoleModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Assign Coach Modal */}
        <Modal visible={showCoachModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Assign Coach to {selectedUser?.name}</Text>
              <Text style={styles.modalSubtitle}>
                Select an active coach to oversee curriculum progress and anti-doping verification.
              </Text>

              {coaches.length === 0 ? (
                <Text style={styles.noCoachText}>No coach accounts currently available.</Text>
              ) : (
                coaches.map((c) => (
                  <TouchableOpacity
                    key={c.uid}
                    style={[
                      styles.roleOption,
                      selectedCoachId === c.uid && styles.roleOptionSelected,
                    ]}
                    onPress={() => setSelectedCoachId(c.uid)}
                  >
                    <View>
                      <Text style={styles.roleOptionText}>{c.name}</Text>
                      <Text style={styles.coachEmailSub}>{c.email}</Text>
                    </View>
                    {selectedCoachId === c.uid ? (
                      <Feather name="check" size={16} color="#0EA5E9" />
                    ) : null}
                  </TouchableOpacity>
                ))
              )}

              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  !selectedCoachId && { opacity: 0.5 },
                ]}
                disabled={!selectedCoachId}
                onPress={handleAssignCoach}
              >
                <Text style={styles.modalConfirmText}>Save Coach Assignment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowCoachModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: '#0EA5E920',
    borderColor: '#0EA5E9',
  },
  chipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#0EA5E9',
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
  userCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0EA5E920',
    borderWidth: 1,
    borderColor: '#0EA5E950',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#0EA5E9',
    fontSize: 18,
    fontWeight: '800',
  },
  userName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  userEmail: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 1,
  },
  userSport: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 1,
  },
  badgesCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeAdmin: {
    backgroundColor: '#8B5CF620',
  },
  badgeCoach: {
    backgroundColor: '#F59E0B20',
  },
  badgeAthlete: {
    backgroundColor: '#0EA5E920',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textAdmin: {
    color: '#A78BFA',
  },
  textCoach: {
    color: '#FBBF24',
  },
  textAthlete: {
    color: '#38BDF8',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: '#10B98115',
  },
  statusSuspended: {
    backgroundColor: '#EF444415',
  },
  statusPending: {
    backgroundColor: '#F59E0B15',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
  },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  statNum: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  coachLabel: {
    color: '#94A3B8',
    fontSize: 12,
  },
  actionsBar: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#33415550',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionBtnText: {
    color: '#0EA5E9',
    fontSize: 11,
    fontWeight: '700',
  },
  btnSuspend: {
    borderColor: '#EF444440',
  },
  btnActivate: {
    borderColor: '#10B98140',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  roleOptionSelected: {
    borderColor: '#0EA5E9',
    backgroundColor: '#0EA5E910',
  },
  roleOptionText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  coachEmailSub: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  noCoachText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 16,
  },
  modalConfirmBtn: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalCancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCancelText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});
