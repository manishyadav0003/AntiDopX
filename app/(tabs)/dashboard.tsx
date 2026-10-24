import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
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

import { ProgressBar } from '../../src/components/common/ProgressBar';
import { auth } from '../../src/firebase/config';
import {
  getDashboardData,
  type DashboardData,
} from '../../src/firebase/dashboardService';
import { useTranslation } from '../../src/localization';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError('Please sign in to view your dashboard.');
      setDashboard(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await getDashboardData(currentUser.uid);

    if (!result.success) {
      setError(result.error);
      setDashboard(null);
      setIsLoading(false);
      return;
    }

    setDashboard(result.data);
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard])
  );

  if (isLoading && !dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#06B6D4" size="large" />
      </View>
    );
  }

  if (error && !dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboard}>
          <Text style={styles.retryButtonText}>{t.common.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No dashboard data available.</Text>
      </View>
    );
  }

  const unlockedBadges = dashboard.badges.filter((badge) => badge.unlocked);
  const visibleBadges =
    unlockedBadges.length > 0
      ? unlockedBadges.slice(0, 4)
      : dashboard.badges.slice(0, 4);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 140 }}
    >
      {/* Top Hero Card - Compact greeting, profile access, level & XP */}
      <View style={styles.hero}>
        <View style={styles.userRow}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push('/(tabs)/profile' as any)}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
          >
            <Text style={styles.avatarText}>
              {dashboard.name?.charAt(0)?.toUpperCase() || 'A'}
            </Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.welcome}>{t.dashboard.welcome}</Text>
            <Text style={styles.userName}>{dashboard.name || t.dashboard.athlete}</Text>
            <Text style={styles.userSport}>{dashboard.sport || 'Athlete'}</Text>
          </View>

          <View style={styles.streakBadge}>
            <FontAwesome5 name="fire" size={13} color="#F97316" style={{ marginRight: 4 }} />
            <Text style={styles.streakText}>{dashboard.streak}d</Text>
          </View>
        </View>

        {/* Level Progression */}
        <View style={styles.levelCard}>
          <View style={styles.levelRow}>
            <View>
              <Text style={styles.levelLabel}>{t.common.level.toUpperCase()}</Text>
              <Text style={styles.levelValue}>{dashboard.level}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.levelLabel}>{t.common.xp.toUpperCase()}</Text>
              <Text style={styles.xpValue}>
                {dashboard.xp} / {dashboard.xpCap}
              </Text>
            </View>
          </View>

          <ProgressBar
            progressPercent={dashboard.xpProgressPercent}
            height={8}
            color="#FFFFFF"
            backgroundColor="rgba(255,255,255,0.25)"
            style={{ marginTop: 14 }}
          />
        </View>
      </View>

      {/* Prioritized Action: Continue Learning / Recommended Module */}
      <View style={styles.recommendedCard}>
        <View style={styles.recommendedBadgeRow}>
          <View style={styles.recommendedPill}>
            <Feather name="compass" size={12} color="#0284C7" style={{ marginRight: 4 }} />
            <Text style={styles.recommendedPillText}>RECOMMENDED LEARNING</Text>
          </View>
          <Text style={styles.recommendedProgress}>
            {dashboard.completionPercent}% {t.common.completed}
          </Text>
        </View>
        <Text style={styles.recommendedTitle}>{dashboard.recommendedModule.title}</Text>
        <Text style={styles.recommendedDesc}>
          Master key anti-doping protocols, athlete rights, and banned substances.
        </Text>
        <TouchableOpacity
          style={styles.recommendedBtn}
          onPress={() => router.push(dashboard.recommendedModule.route as any)}
        >
          <Text style={styles.recommendedBtnText}>{t.common.continue}</Text>
          <Feather name="arrow-right" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>

      {/* Today's Daily Mission */}
      <View style={styles.missionCard}>
        <View style={styles.missionHeader}>
          <Text style={styles.missionHeading}>{t.dashboard.dailyMission}</Text>
          <View style={styles.missionTimeRow}>
            <Feather name="clock" size={12} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.missionTime}>
              {t.dashboard.endsIn} {dashboard.dailyMission.endsInHours}{t.dashboard.hours}
            </Text>
          </View>
        </View>

        <Text style={styles.missionText}>
          {dashboard.dailyMission.description}
        </Text>

        <ProgressBar
          progressPercent={dashboard.dailyMission.progressPercent}
          height={8}
          color="#06B6D4"
          style={{ marginTop: 14 }}
        />

        <View style={styles.missionFooterRow}>
          <View style={styles.rewardRow}>
            <Feather name="zap" size={13} color="#16A34A" style={{ marginRight: 4 }} />
            <Text style={styles.reward}>
              +{dashboard.dailyMission.rewardXP} XP &amp; Badge
            </Text>
          </View>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => router.push('/quiz' as any)}
          >
            <Text style={styles.continueBtnText}>{t.common.continue} →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* National Rank & Performance Summary */}
      <TouchableOpacity
        style={styles.rankCard}
        onPress={() => router.push('/(tabs)/leaderboard' as any)}
      >
        <View style={styles.rankHeader}>
          <Feather name="award" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.rankTitle}>{t.dashboard.rankTitle}</Text>
        </View>
        <Text style={styles.rankText}>
          {dashboard.rank
            ? `#${dashboard.rank.position} ${t.dashboard.nationally} • ${dashboard.rank.percentileLabel}`
            : 'Complete your first quiz to join rankings'}
        </Text>
        <Text style={styles.rankSubtext}>
          View national athlete leaderboard →
        </Text>
      </TouchableOpacity>

      {/* AI Anti-Doping Coach Shortcut */}
      <View style={styles.aiCoachBanner}>
        <View style={styles.aiIconBox}>
          <MaterialCommunityIcons name="robot" size={24} color="#06B6D4" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.aiTitle}>{t.dashboard.aiCoachTitle}</Text>
          <Text style={styles.aiSubtitle}>
            Instant guidance on WADA regulations &amp; substances
          </Text>
        </View>
        <TouchableOpacity
          style={styles.aiBtn}
          onPress={() => router.push('/ai-coach' as any)}
        >
          <Text style={styles.aiBtnText}>{t.dashboard.askAi}</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Play & Core Tools */}
      <Text style={styles.sectionTitle}>{t.dashboard.quickPlay}</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => router.push('/learning-journey')}
        >
          <View style={styles.gridIconBox}>
            <Feather name="book-open" size={22} color="#0284C7" />
          </View>
          <Text style={styles.gridTitle}>{t.dashboard.learnTitle}</Text>
          <Text style={styles.gridSubtitle}>16 {t.dashboard.learnSubtitle}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => router.push('/medicinescanner')}
        >
          <View style={styles.gridIconBox}>
            <Feather name="camera" size={22} color="#0284C7" />
          </View>
          <Text style={styles.gridTitle}>{t.dashboard.scannerTitle}</Text>
          <Text style={styles.gridSubtitle}>{t.dashboard.scannerSubtitle}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => router.push('/quiz')}
        >
          <View style={styles.gridIconBox}>
            <MaterialCommunityIcons name="brain" size={22} color="#0284C7" />
          </View>
          <Text style={styles.gridTitle}>{t.dashboard.quizTitle}</Text>
          <Text style={styles.gridSubtitle}>{t.dashboard.quizSubtitle}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => router.push('/roulette')}
        >
          <View style={styles.gridIconBox}>
            <MaterialCommunityIcons name="dice-multiple-outline" size={22} color="#0284C7" />
          </View>
          <Text style={styles.gridTitle}>{t.dashboard.spinTitle}</Text>
          <Text style={styles.gridSubtitle}>{t.dashboard.spinSubtitle}</Text>
        </TouchableOpacity>
      </View>

      {/* Coach Communication Banner */}
      <View style={styles.coachBanner}>
        <View style={styles.coachIconBox}>
          <FontAwesome5 name="user-graduate" size={22} color="#10B981" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.coachBannerTitle}>Assigned Coach</Text>
          <Text style={styles.coachBannerSubtitle}>
            Direct messaging with verified mentors
          </Text>
        </View>
        <TouchableOpacity
          style={styles.coachMessageBtn}
          onPress={() => {
            const currentUser = auth.currentUser;
            const convId = `${currentUser?.uid || 'athlete'}_coach-primary`;
            router.push({
              pathname: '/chat/[conversationId]',
              params: { conversationId: convId, recipientName: 'Coach Mentor' },
            } as any);
          }}
        >
          <Text style={styles.coachMessageBtnText}>{t.dashboard.messageCoach}</Text>
        </TouchableOpacity>
      </View>

      {/* Badges Section */}
      <View style={styles.badgeHeader}>
        <Text style={styles.sectionTitleWithoutMargin}>Badges &amp; Achievements</Text>
        <TouchableOpacity onPress={() => router.push('/achievements')}>
          <Text style={styles.viewAll}>View all →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.badgesRow}>
        {visibleBadges.map((badge) => (
          <View
            key={badge.key}
            style={[styles.badgeCard, badge.unlocked && styles.badgeCardUnlocked]}
          >
            <View
              style={[
                styles.badgeIconWrapper,
                badge.unlocked && styles.badgeIconWrapperUnlocked,
              ]}
            >
              <MaterialCommunityIcons
                name={(badge.icon || 'medal') as any}
                size={24}
                color={badge.unlocked ? '#0284C7' : '#94A3B8'}
              />
            </View>
            <Text style={styles.badgeName} numberOfLines={2}>
              {badge.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#06B6D4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  hero: {
    backgroundColor: '#06B6D4',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 85,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 22,
  },
  welcome: {
    color: '#E0F2FE',
    fontSize: 13,
    fontWeight: '500',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  userSport: {
    color: '#BAE6FD',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  streakBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  levelCard: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 22,
    padding: 18,
    marginTop: 20,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelLabel: {
    color: '#E0F2FE',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  levelValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  xpValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  recommendedCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -35,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  recommendedBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedPillText: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  recommendedProgress: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  recommendedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  recommendedDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  recommendedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignSelf: 'flex-start',
  },
  recommendedBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 24,
    padding: 18,
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  missionHeading: {
    color: '#06B6D4',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  missionTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  missionTime: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  missionText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 24,
  },
  missionFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reward: {
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 13,
  },
  continueBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  continueBtnText: {
    color: '#06B6D4',
    fontWeight: '700',
    fontSize: 13,
  },
  aiCoachBanner: {
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  aiIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  aiSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  aiBtn: {
    backgroundColor: '#06B6D4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 10,
  },
  aiBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
    color: '#0F172A',
  },
  sectionTitleWithoutMargin: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  gridSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  coachBanner: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  coachIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coachBannerTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  coachBannerSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  coachMessageBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 10,
  },
  coachMessageBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  badgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
    marginBottom: 6,
  },
  viewAll: {
    color: '#06B6D4',
    fontWeight: '700',
    fontSize: 13,
  },
  badgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 18,
  },
  badgeCard: {
    alignItems: 'center',
    width: '23%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeCardUnlocked: {
    borderColor: '#BAE6FD',
    backgroundColor: '#F8FAFC',
  },
  badgeIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIconWrapperUnlocked: {
    backgroundColor: '#E0F2FE',
  },
  badgeName: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    color: '#334155',
  },
  rankCard: {
    marginHorizontal: 20,
    backgroundColor: '#0F172A',
    borderRadius: 22,
    padding: 18,
    marginTop: 14,
  },
  rankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  rankText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
    marginTop: 6,
  },
  rankSubtext: {
    color: '#94A3B8',
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
});
