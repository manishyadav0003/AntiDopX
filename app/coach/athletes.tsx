import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

import { AppBadge } from '../../src/components/common/AppBadge';
import { ProgressBar } from '../../src/components/common/ProgressBar';
import { auth } from '../../src/firebase/config';
import { useTranslation } from '../../src/localization';
import { getAssignedAthletes } from '../../src/services/coachService';
import type { CoachAthleteSummary } from '../../src/types/roles';

export default function CoachAthletesScreen() {
  const { t } = useTranslation();
  const [athletes, setAthletes] = useState<CoachAthleteSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAthletes = useCallback(async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    const coachId = currentUser ? currentUser.uid : 'coach-primary';

    const res = await getAssignedAthletes(coachId);
    if (res.success) {
      setAthletes(res.data);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAthletes();
    }, [loadAthletes])
  );

  const filteredAthletes = athletes.filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return a.name.toLowerCase().includes(q) || a.sport.toLowerCase().includes(q);
  });

  const renderAthleteCard = ({ item }: { item: CoachAthleteSummary }) => {
    const progressPercent = Math.round((item.completedModulesCount / item.totalModulesCount) * 100);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => {
          router.push({
            pathname: '/coach/athlete-detail',
            params: { athleteId: item.uid },
          } as any);
        }}
      >
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.sport}>{item.sport}</Text>
          </View>

          <AppBadge label={item.level} variant="neutral" />
        </View>

        <ProgressBar
          progressPercent={progressPercent}
          height={6}
          color="#06B6D4"
          showLabel
          labelText={`${item.completedModulesCount}/${item.totalModulesCount} Modules`}
          style={{ marginVertical: 10 }}
        />

        <View style={styles.metaRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="zap" size={12} color="#0284C7" style={{ marginRight: 3 }} />
            <Text style={styles.metaText}>{item.xp} XP</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome5 name="fire" size={11} color="#F97316" style={{ marginRight: 3 }} />
            <Text style={styles.metaText}>{item.streak}d streak</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="target" size={12} color="#10B981" style={{ marginRight: 3 }} />
            <Text style={styles.metaText}>{item.averageQuizScore}% avg</Text>
          </View>
        </View>

        {item.weakTopics.length > 0 ? (
          <View style={styles.weakAreaRow}>
            <Text style={styles.weakLabel}>Focus:</Text>
            <Text style={styles.weakValues} numberOfLines={1}>
              {item.weakTopics.join(', ')}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Assigned Athletes</Text>
          <Text style={styles.headerSubtitle}>{athletes.length} Athletes Monitored</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Feather name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search athlete by name or sport..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator color="#06B6D4" size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredAthletes}
          keyExtractor={(item) => item.uid}
          renderItem={renderAthleteCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No matching athletes found.</Text>
          }
        />
      )}
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#06B6D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  sport: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  weakAreaRow: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  weakLabel: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  weakValues: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
  },
});
