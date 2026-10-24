import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getAchievements,
  type AchievementKey,
  type Achievements,
} from '../src/firebase/achievementService';
import { auth } from '../src/firebase/config';
import { getUserProfile } from '../src/firebase/userService';

const achievementMeta: {
  key: AchievementKey;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
}[] = [
  {
    key: 'firstModule',
    icon: 'medal',
    iconColor: '#0284C7',
    title: 'First Module',
    description: 'Complete your first module',
  },
  {
    key: 'threeModules',
    icon: 'shield-check',
    iconColor: '#10B981',
    title: '3 Modules Completed',
    description: 'Complete 3 learning modules',
  },
  {
    key: 'fiveModules',
    icon: 'trophy',
    iconColor: '#F59E0B',
    title: '5 Modules Completed',
    description: 'Complete all 5 learning modules',
  },
  {
    key: 'xp100',
    icon: 'lightning-bolt',
    iconColor: '#38BDF8',
    title: '100 XP Earned',
    description: 'Earn 100 total XP',
  },
  {
    key: 'streak7',
    icon: 'fire',
    iconColor: '#F97316',
    title: '7 Day Streak',
    description: 'Maintain a 7-day streak',
  },
];

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Achievements | null>(null);
  const [completedModules, setCompletedModules] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setIsLoading(true);

        const currentUser = auth.currentUser;
        if (!currentUser) {
          setIsLoading(false);
          return;
        }

        const achievementResult = await getAchievements(currentUser.uid);
        if (achievementResult.success) {
          setAchievements(achievementResult.data);
        }

        const profileResult = await getUserProfile(currentUser.uid);
        if (profileResult.success && profileResult.data) {
          const progress = profileResult.data.progress || {};
          const completed = Object.values(progress).filter(Boolean).length;
          setCompletedModules(completed);
        }

        setIsLoading(false);
      };

      loadData();
    }, [])
  );

  const earnedCount = achievements
    ? Object.values(achievements).filter(Boolean).length
    : 0;

  const progress = achievements
    ? (earnedCount / achievementMeta.length) * 100
    : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
          name="arrow-back"
          size={24}
          color="white"
          />
        </TouchableOpacity>
        <Text style={styles.title}>
          Achievements
        </Text>

        {achievements ? (
          <>
            <Text style={styles.subtitle}>
              {earnedCount} of {achievementMeta.length} unlocked
            </Text>

            <Text style={styles.completedText}>
              {completedModules}/5 modules completed
            </Text>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>
          </>
        ) : null}
      </View>

      {isLoading ? (
        <ActivityIndicator
          color="#60A5FA"
          style={{ marginTop: 40 }}
        />
      ) : (
        <View style={styles.grid}>
          {achievementMeta.map((meta) => {
            const isEarned = achievements?.[meta.key] === true;

            return (
              <View
                key={meta.key}
                style={[
                  styles.badgeCard,
                  !isEarned && styles.lockedBadge,
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    !isEarned && styles.lockedIcon,
                  ]}
                >
                  {isEarned ? (
                      <MaterialCommunityIcons name={meta.icon as any} size={28} color={meta.iconColor} />
                    ) : (
                      <Feather name="lock" size={24} color="#94A3B8" />
                    )}
                </View>

                <Text
                  style={[
                    styles.badgeTitle,
                    !isEarned && { color: '#94A3B8' },
                  ]}
                >
                  {meta.title}
                </Text>

                <Text style={styles.badgeDescription}>
                  {meta.description}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fafd',
  },

  header: {
    backgroundColor: '#06B6D4',
    paddingTop: 55,
    paddingBottom: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },

  backButton: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: 'rgba(255,255,255,0.18)',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 20,
},

  title: {
    color: 'white',
    fontSize: 38,
    fontWeight: '800',
  },

  subtitle: {
    color: '#EAFBFF',
    fontSize: 16,
    marginTop: 4,
  },

  completedText: {
    color: '#BFDBFE',
    marginTop: 4,
    fontSize: 13,
  },

  progressBar: {
    height: 10,
    backgroundColor: '#16c6e8',
    borderRadius: 99,
    marginTop: 18,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 99,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 22,
  },

  badgeCard:{
width:'31%',
backgroundColor:'#06B6D4',
borderRadius:22,
paddingVertical:18,
paddingHorizontal:10,
marginBottom:14,

alignItems:'center',

shadowColor:'#14C8E8',
shadowOpacity:0.12,
shadowRadius:12,
shadowOffset:{
width:0,
height:5
},

elevation:5,
},

  lockedBadge:{
    backgroundColor:'#FAFCFE',
    borderWidth:1,
    borderStyle:'dashed',
    borderColor:'#DCE6EF',
  },

  iconContainer:{
width:62,
height:62,
borderRadius:31,
justifyContent:'center',
alignItems:'center',
},

  lockedIcon: {
    backgroundColor: '#334155',
  },

  emoji: {
    fontSize: 28,
  },

  badgeTitle:{
    fontSize:13,
    fontWeight:'700',
    color:'#16202C',
    textAlign:'center',
    marginTop:10,
  },

  badgeDescription:{
    fontSize:11,
    color:'#64748B',
    textAlign:'center',
    marginTop:4,
  },
});
