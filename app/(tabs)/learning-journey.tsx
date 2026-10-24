import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { auth } from '../../src/firebase/config';
import { getModuleTimeline } from '../../src/firebase/moduleService';
import { getUserProfile } from '../../src/firebase/userService';
import { defaultModuleProgress } from '../../src/types/userProfile';

export default function LearningJourneyScreen() {
  const [completionPercent, setCompletionPercent] = useState(0);
  const [timeline, setTimeline] = useState<
    ReturnType<typeof getModuleTimeline>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProgress = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError('Please sign in to view your learning path.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await getUserProfile(currentUser.uid);

    if (!result.success) {
      setError(result.error);
      setTimeline([]);
      setIsLoading(false);
      return;
    }

    const progress = result.data.progress || defaultModuleProgress();
    const moduleTimeline = getModuleTimeline(progress);
    const completedModules = moduleTimeline.filter(
      (entry) => entry.status === 'COMPLETED'
    ).length;

    setTimeline(moduleTimeline);
    setCompletionPercent(
      Math.round((completedModules / moduleTimeline.length) * 100)
    );
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#16C6E8" size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProgress}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.headerTitle}>Learning Path</Text>
      <Text style={styles.headerSubtitle}>
        Master clean sport, one module at a time
      </Text>

      <View style={styles.progressCard}>
        <Text style={styles.currentLabel}>CURRENT PROGRESS</Text>
        <Text style={styles.currentModule}>Clean Sport Journey</Text>

        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${completionPercent}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.progressCount}>{completionPercent}% Complete</Text>
      </View>

      <View style={styles.timeline}>
        {timeline.map((entry) => {
          const content = (
            <>
              <Text style={styles.status}>{entry.status}</Text>
              <Text style={styles.moduleTitle}>{entry.module.title}</Text>
              <Text style={styles.moduleInfo}>
                {entry.lessonCount} lessons • +{entry.xpReward} XP
              </Text>
            </>
          );

          if (!entry.isPressable) {
            return (
              <View key={entry.module.slug} style={styles.moduleCard}>
                {content}
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={entry.module.slug}
              style={styles.moduleCard}
              onPress={() => router.push(entry.module.route as any)}
            >
              {content}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F8FA',
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
    backgroundColor: '#16C6E8',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 6,
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: '#16C6E8',
    borderRadius: 30,
    padding: 24,
    marginBottom: 30,
  },
  currentLabel: {
    color: '#EAFBFF',
    fontWeight: '700',
    marginBottom: 8,
  },
  currentModule: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 999,
  },
  progressBarFill: {
    height: 12,
    backgroundColor: 'white',
    borderRadius: 999,
  },
  progressCount: {
    color: 'white',
    fontWeight: '700',
    marginTop: 12,
  },
  timeline: {
    flex: 1,
    marginBottom: 80,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  status: {
    color: '#0EA5E9',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  moduleTitle: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  moduleInfo: {
    color: '#64748B',
    fontSize: 14,
  },
});
