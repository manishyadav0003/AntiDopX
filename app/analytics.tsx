import {
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth } from '../src/firebase/config';
import {
  getAnalytics,
  type AnalyticsData,
} from '../src/firebase/analyticsService';
import { createEmptyMonthlyXP } from '../src/types/userProfile';

const WEEK_KEYS = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7'] as const;

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError('Please sign in to view analytics.');
      setAnalytics(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await getAnalytics(currentUser.uid);

    if (!result.success) {
      setError(result.error);
      setAnalytics(null);
      setIsLoading(false);
      return;
    }

    setAnalytics(result.data);
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [loadAnalytics])
  );

  const monthlyXP = analytics?.monthlyXP || createEmptyMonthlyXP();

  const weekValues = useMemo(
    () => WEEK_KEYS.map((key) => monthlyXP[key] || 0),
    [monthlyXP]
  );

  const maxWeekXP = useMemo(
    () => Math.max(...weekValues, 1),
    [weekValues]
  );

  const monthlyGrowthPercent = useMemo(() => {
    const firstHalf = weekValues.slice(0, 3).reduce((sum, value) => sum + value, 0);
    const secondHalf = weekValues.slice(4).reduce((sum, value) => sum + value, 0);

    if (firstHalf === 0) {
      return secondHalf > 0 ? 100 : 0;
    }

    return Math.round(((secondHalf - firstHalf) / firstHalf) * 100);
  }, [weekValues]);

  const weakAreaDescription = useMemo(() => {
    if (!analytics) return '';

    if (analytics.weakArea.score <= 0) {
      return `You have not started the ${analytics.weakArea.title.replace(' Needs Attention', '')} module yet. Review it before your next test.`;
    }

    return `Your latest score in this area is ${analytics.weakArea.score}%. Review the module before your next test.`;
  }, [analytics]);

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator color="#2563EB" size="large" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAnalytics}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>No analytics data available yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>

        <View style={styles.filter}>
          <Text style={styles.filterText}>Last 30 Days</Text>
        </View>
      </View>

      <Text style={styles.title}>Your Progress</Text>
      <Text style={styles.subtitle}>Where your knowledge is growing.</Text>

      <View style={styles.kpiGrid}>
        <KpiCard
          icon={
            <MaterialIcons name="trending-up" size={24} color="white" />
          }
          value={`${analytics.knowledgeGrowth}%`}
          label="Knowledge Growth"
        />
        <KpiCard
          icon={<FontAwesome5 name="brain" size={22} color="white" />}
          value={`${analytics.quizAccuracy}%`}
          label="Quiz Accuracy"
        />
        <KpiCard
          icon={
            <MaterialIcons name="track-changes" size={24} color="white" />
          }
          value={`${analytics.completedModules}/${analytics.totalModules}`}
          label="Modules Complete"
        />
        <KpiCard
          icon={<Ionicons name="calendar" size={24} color="white" />}
          value={`${analytics.currentStreak}d`}
          label="Active Streak"
        />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>TOTAL XP</Text>
        <Text style={styles.summaryValue}>{analytics.totalXP.toLocaleString()} XP</Text>
        <Text style={styles.summaryMeta}>
          Level {analytics.currentLevel} • {analytics.totalQuizzes} quizzes taken
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartLabel}>MONTHLY XP</Text>
            <Text style={styles.chartXP}>
              {analytics.totalMonthlyXP.toLocaleString()} XP
            </Text>
          </View>
          <Text style={styles.growth}>
            {monthlyGrowthPercent >= 0 ? '+' : ''}
            {monthlyGrowthPercent}% vs earlier weeks
          </Text>
        </View>

        <View style={styles.chartContainer}>
          {weekValues.map((value, index) => (
            <View key={WEEK_KEYS[index]} style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max((value / maxWeekXP) * 100, value > 0 ? 8 : 4),
                  },
                ]}
              />
              <Text style={styles.barLabel}>W{index + 1}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.chartLabel}>MODULE COMPLETION</Text>

        {analytics.moduleCompletion.map((module) => (
          <View key={module.title} style={styles.moduleRow}>
            <View style={styles.moduleHeader}>
              <Text style={styles.moduleName}>{module.title}</Text>
              <Text style={styles.modulePercent}>{module.progress}%</Text>
            </View>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${module.progress}%`,
                    backgroundColor: module.color,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningLabel}>WEAK AREA</Text>
        <Text style={styles.warningTitle}>{analytics.weakArea.title}</Text>
        <Text style={styles.warningDescription}>{weakAreaDescription}</Text>

        <TouchableOpacity
          style={styles.studyButton}
          onPress={() => router.push(analytics.weakArea.route as '/modules/anti-doping-basics')}
        >
          <Text style={styles.studyButtonText}>
            Study {analytics.recommendedModule.title} →
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function KpiCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.kpiCard}>
      <View style={styles.kpiIcon}>{icon}</View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  headerRow: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filter: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  filterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 24,
  },
  subtitle: {
    color: '#94A3B8',
    marginTop: 6,
    marginBottom: 20,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  kpiIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  kpiLabel: {
    color: '#94A3B8',
    marginTop: 4,
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    marginTop: 8,
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryMeta: {
    color: '#CBD5E1',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  chartXP: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  growth: {
    color: '#22C55E',
    fontWeight: '700',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    marginTop: 24,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: 20,
    backgroundColor: '#06B6D4',
    borderRadius: 6,
  },
  barLabel: {
    color: '#94A3B8',
    marginTop: 6,
    fontSize: 10,
  },
  moduleRow: {
    marginTop: 16,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moduleName: {
    color: 'white',
    fontWeight: '600',
  },
  modulePercent: {
    color: '#94A3B8',
  },
  progressBackground: {
    height: 8,
    backgroundColor:  '#E5E7EB',
    borderRadius: 10,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  warningCard: {
    backgroundColor: '#F59E0B',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
  },
  warningLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  warningTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 6,
  },
  warningDescription: {
    color: 'white',
    marginTop: 10,
    lineHeight: 22,
  },
  studyButton: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  studyButtonText: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
});
