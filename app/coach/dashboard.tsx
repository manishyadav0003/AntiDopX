import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBadge } from '../../src/components/common/AppBadge';
import { AppCard } from '../../src/components/common/AppCard';
import { auth } from '../../src/firebase/config';
import { useTranslation } from '../../src/localization';
import { getCoachDashboardMetrics } from '../../src/services/coachService';
import type { CoachAthleteSummary, CoachDashboardMetrics } from '../../src/types/roles';

export default function CoachDashboardScreen() {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<CoachDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    const coachId = currentUser ? currentUser.uid : 'coach-primary';

    const res = await getCoachDashboardMetrics(coachId);
    if (res.success) {
      setMetrics(res.data);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>{t.coach.portalTitle}</Text>
          <Text style={styles.headerSubtitle}>{t.coach.portalSubtitle}</Text>
        </View>

        <AppBadge label="COACH" variant="allowed" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <ActivityIndicator color="#06B6D4" size="large" style={{ marginTop: 40 }} />
        ) : metrics ? (
          <>
            {/* Coach Overview Card */}
            <View style={styles.overviewCard}>
              <View style={styles.coachRow}>
                <View style={styles.coachAvatar}>
                  <Text style={styles.coachAvatarText}>CP</Text>
                </View>
                <View>
                  <Text style={styles.coachName}>Coach Dashboard</Text>
                  <Text style={styles.coachSpecialty}>Certified Clean Sport Mentor</Text>
                </View>
              </View>

              <View style={styles.kpiRow}>
                <View style={styles.kpiBox}>
                  <Text style={styles.kpiValue}>{metrics.totalAthletes}</Text>
                  <Text style={styles.kpiLabel}>{t.coach.assignedAthletes}</Text>
                </View>
                <View style={styles.kpiBox}>
                  <Text style={styles.kpiValue}>{metrics.activeThisWeek}</Text>
                  <Text style={styles.kpiLabel}>{t.coach.activeAthletes}</Text>
                </View>
                <View style={styles.kpiBox}>
                  <Text style={styles.kpiValue}>{metrics.averageProgressPercent}%</Text>
                  <Text style={styles.kpiLabel}>{t.coach.avgProgress}</Text>
                </View>
                <View style={styles.kpiBox}>
                  <Text style={styles.kpiValue}>{metrics.averageQuizScore}%</Text>
                  <Text style={styles.kpiLabel}>{t.coach.avgQuizScore}</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push('/coach/athletes' as any)}
              >
                <FontAwesome5 name="users" size={24} color="#06B6D4" />
                <Text style={styles.actionCardTitle}>All Athletes</Text>
                <Text style={styles.actionCardSubtitle}>View roster & scores</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push('/ai-coach' as any)}
              >
                <MaterialIcons name="psychology" size={28} color="#8B5CF6" />
                <Text style={styles.actionCardTitle}>AI Coach Assistant</Text>
                <Text style={styles.actionCardSubtitle}>Rule lookup & curriculum</Text>
              </TouchableOpacity>
            </View>

            {/* Athletes Needing Attention */}
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="alert-triangle" size={18} color="#F59E0B" style={{ marginRight: 6 }} />
                <Text style={styles.sectionTitle}>{t.coach.attentionNeeded}</Text>
              </View>
              <Text style={styles.sectionCount}>
                {metrics.athletesNeedingAttention.length} athletes
              </Text>
            </View>

            {metrics.athletesNeedingAttention.length === 0 ? (
              <AppCard variant="flat">
                <Text style={styles.emptyText}>All assigned athletes are actively keeping up with their learning!</Text>
              </AppCard>
            ) : (
              metrics.athletesNeedingAttention.map((athlete: CoachAthleteSummary) => (
                <TouchableOpacity
                  key={athlete.uid}
                  style={styles.athleteCard}
                  onPress={() => {
                    router.push({
                      pathname: '/coach/athlete-detail',
                      params: { athleteId: athlete.uid },
                    } as any);
                  }}
                >
                  <View style={styles.athleteTopRow}>
                    <View style={styles.athleteAvatar}>
                      <Text style={styles.athleteAvatarText}>
                        {athlete.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.athleteName}>{athlete.name}</Text>
                      <Text style={styles.athleteSport}>{athlete.sport}</Text>
                    </View>
                    <AppBadge label={athlete.level} variant="neutral" />
                  </View>

                  <View style={styles.athleteMetricsRow}>
                    <Text style={styles.metricText}>Score: {athlete.averageQuizScore}%</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <FontAwesome5 name="fire" size={11} color="#F97316" style={{ marginRight: 4 }} />
                      <Text style={styles.metricText}>{athlete.streak}d streak</Text>
                    </View>
                    <Text style={styles.metricText}>
                      {athlete.completedModulesCount}/{athlete.totalModulesCount} modules
                    </Text>
                  </View>

                  {athlete.weakTopics.length > 0 ? (
                    <View style={styles.weakBadgeBox}>
                      <Text style={styles.weakBadgeLabel}>Weak areas: </Text>
                      <Text style={styles.weakBadgeText}>{athlete.weakTopics.join(', ')}</Text>
                    </View>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <Text style={styles.viewDetailText}>View Full Profile →</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBox: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  overviewCard: {
    backgroundColor: '#06B6D4',
    borderRadius: 26,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#06B6D4',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  coachAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  coachAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  coachName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  coachSpecialty: {
    color: '#E0F2FE',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    padding: 14,
  },
  kpiBox: {
    alignItems: 'center',
    flex: 1,
  },
  kpiValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  kpiLabel: {
    color: '#E0F2FE',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  actionCardTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  actionCardSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionCount: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  athleteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  athleteTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  athleteAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#06B6D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  athleteAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  athleteName: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '700',
  },
  athleteSport: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 2,
  },
  athleteMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metricText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  weakBadgeBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6,
  },
  weakBadgeLabel: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '700',
  },
  weakBadgeText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  cardFooter: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  viewDetailText: {
    color: '#06B6D4',
    fontWeight: '700',
    fontSize: 13,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 14,
  },
});
