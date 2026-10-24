import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RoleSelectionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Who Are You?</Text>
        <Text style={styles.subtitle}>Select your portal to continue</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/sport-selection')}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="run" size={32} color="#06B6D4" />
          </View>
          <Text style={styles.cardTitle}>Athlete</Text>
          <Text style={styles.cardDescription}>
            Learn clean sport principles, scan medicines, complete interactive quizzes, and earn XP.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/coach/dashboard' as any)}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="target" size={30} color="#06B6D4" />
          </View>
          <Text style={styles.cardTitle}>Coach / Mentor</Text>
          <Text style={styles.cardDescription}>
            Monitor assigned athletes, track curriculum completion, and message directly.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/parent/guide' as any)}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="account-child-circle" size={32} color="#06B6D4" />
          </View>
          <Text style={styles.cardTitle}>Parent / Guardian</Text>
          <Text style={styles.cardDescription}>
            Support young athletes with safe medication guidance, TUE protocols, and sample testing rights.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.adminCard]}
          onPress={() => router.push('/admin/dashboard' as any)}
        >
          <View style={[styles.iconCircle, styles.adminIconCircle]}>
            <Feather name="shield" size={28} color="#0EA5E9" />
          </View>
          <View style={styles.adminTitleRow}>
            <Text style={styles.cardTitle}>Administrator</Text>
            <View style={styles.restrictedBadge}>
              <Text style={styles.restrictedText}>RESTRICTED</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            Central management for users, coach assignments, curriculum, medicine reference, and regulatory audit trails.
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06B6D4',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#E0F2FE',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  adminCard: {
    borderWidth: 1.5,
    borderColor: '#0284C740',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#06B6D415',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminIconCircle: {
    backgroundColor: '#0EA5E918',
  },
  adminTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  restrictedBadge: {
    backgroundColor: '#0EA5E915',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  restrictedText: {
    color: '#0284C7',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardDescription: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 6,
  },
});