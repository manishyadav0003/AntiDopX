import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { AppButton } from '../../src/components/common/AppButton';
import { AppCard } from '../../src/components/common/AppCard';
import { ProgressBar } from '../../src/components/common/ProgressBar';
import { auth } from '../../src/firebase/config';
import { learningModules } from '../../src/learning/modules';
import { getAthleteDetailForCoach } from '../../src/services/coachService';
import type { CoachAthleteSummary } from '../../src/types/roles';

export default function CoachAthleteDetailScreen() {
  const { athleteId } = useLocalSearchParams<{ athleteId: string }>();
  const [athlete, setAthlete] = useState<CoachAthleteSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const currentUser = auth.currentUser;
      const coachId = currentUser ? currentUser.uid : 'coach-primary';

      const res = await getAthleteDetailForCoach(coachId, athleteId || 'athlete-seed-1');
      if (res.success) {
        setAthlete(res.data);
      }
      setLoading(false);
    };

    void load();
  }, [athleteId]);

  if (loading || !athlete) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#06B6D4" size="large" style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const completionPercent = Math.round(
    (athlete.completedModulesCount / athlete.totalModulesCount) * 100
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{athlete.name}</Text>

        <AppBadge label={athlete.level} variant="neutral" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{athlete.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{athlete.name}</Text>
          <Text style={styles.sport}>{athlete.sport}</Text>
          <Text style={styles.email}>{athlete.email}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="zap" size={16} color="#0284C7" style={{ marginRight: 4 }} />
                <Text style={styles.statValue}>{athlete.xp}</Text>
              </View>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesome5 name="fire" size={15} color="#F97316" style={{ marginRight: 4 }} />
                <Text style={styles.statValue}>{athlete.streak}d</Text>
              </View>
              <Text style={styles.statLabel}>Active Streak</Text>
            </View>
            <View style={styles.statBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="target" size={16} color="#10B981" style={{ marginRight: 4 }} />
                <Text style={styles.statValue}>{athlete.averageQuizScore}%</Text>
              </View>
              <Text style={styles.statLabel}>Quiz Accuracy</Text>
            </View>
          </View>
        </View>

        {/* Message Athlete Button */}
        <AppButton
          title={`Message ${athlete.name}`}
          icon={<Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />}
          onPress={() => {
            const currentUser = auth.currentUser;
            const coachId = currentUser ? currentUser.uid : 'coach-primary';
            const convId = `${athlete.uid}_${coachId}`;
            router.push({
              pathname: '/chat/[conversationId]',
              params: {
                conversationId: convId,
                recipientId: athlete.uid,
                recipientName: athlete.name,
              },
            } as any);
          }}
          size="lg"
          style={{ marginVertical: 14 }}
        />

        {/* Progress Overview */}
        <AppCard>
          <Text style={styles.sectionTitle}>Curriculum Mastery</Text>
          <ProgressBar
            progressPercent={completionPercent}
            height={10}
            color="#06B6D4"
            showLabel
            labelText={`${athlete.completedModulesCount} of ${athlete.totalModulesCount} Modules Completed`}
            style={{ marginVertical: 10 }}
          />

          {athlete.weakTopics.length > 0 ? (
            <View style={styles.weakWarningBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Feather name="alert-triangle" size={14} color="#F59E0B" style={{ marginRight: 6 }} />
                <Text style={styles.weakWarningTitle}>Needs Revision:</Text>
              </View>
              <Text style={styles.weakWarningText}>
                {athlete.weakTopics.join(', ')}
              </Text>
            </View>
          ) : (
            <View style={styles.cleanStatusBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="check-circle" size={14} color="#10B981" style={{ marginRight: 6 }} />
                <Text style={styles.cleanStatusText}>High anti-doping curriculum compliance</Text>
              </View>
            </View>
          )}
        </AppCard>

        {/* Module Checklist */}
        <Text style={styles.modulesHeader}>Module Completion Status</Text>
        {learningModules.map((module, index) => {
          const isDone = index < athlete.completedModulesCount;

          return (
            <View key={module.slug} style={styles.moduleItemRow}>
              <View style={[styles.moduleStatusIcon, isDone ? styles.doneIcon : styles.pendingIcon]}>
                <Feather name={isDone ? 'check' : 'minus'} size={14} color={isDone ? '#10B981' : '#94A3B8'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.moduleTitleText, isDone && styles.doneTitleText]}>
                  {module.title}
                </Text>
                <Text style={styles.moduleCategoryText}>{module.category} • +{module.xpReward} XP</Text>
              </View>
              <AppBadge
                label={isDone ? 'COMPLETED' : 'PENDING'}
                variant={isDone ? 'allowed' : 'unknown'}
              />
            </View>
          );
        })}
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
  headerTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: '#06B6D4',
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#06B6D4',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  sport: {
    color: '#E0F2FE',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600',
  },
  email: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    padding: 14,
    marginTop: 18,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#E0F2FE',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  weakWarningBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  weakWarningTitle: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  weakWarningText: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '600',
  },
  cleanStatusBox: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  cleanStatusText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  modulesHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 20,
    marginBottom: 12,
  },
  moduleItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  moduleStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doneIcon: {
    backgroundColor: '#DCFCE7',
  },
  pendingIcon: {
    backgroundColor: '#F1F5F9',
  },
  statusEmoji: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  moduleTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  doneTitleText: {
    color: '#15803D',
  },
  moduleCategoryText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
