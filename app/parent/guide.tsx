import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ParentGuideScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Parent & Guardian Portal</Text>
          <Text style={styles.headerSubtitle}>Youth Clean Sport & Safety Guide</Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>PARENT</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerRow}>
            <View style={styles.bannerIconBox}>
              <MaterialCommunityIcons name="account-group" size={26} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Protecting Your Young Athlete</Text>
              <Text style={styles.bannerSubtitle}>
                Most young athletes who test positive didn&apos;t intend to cheat — they consumed contaminated supplements or everyday cold medicines.
              </Text>
            </View>
          </View>
        </View>

        {/* Key Rules Every Parent Must Know */}
        <Text style={styles.sectionTitle}>Essential Rules Every Parent Must Know</Text>

        <View style={styles.guideCard}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="balance-scale" size={20} color="#06B6D4" />
            <Text style={styles.cardTitle}>1. Strict Liability Applies at Any Age</Text>
          </View>
          <Text style={styles.cardBody}>
            Under WADA regulations, young athletes are solely responsible for any substance found in their sample. An unintentional mistake from a coach, friend, or family member cannot excuse an Anti-Doping Rule Violation.
          </Text>
        </View>

        <View style={styles.guideCard}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="prescription-bottle-alt" size={20} color="#EF4444" />
            <Text style={styles.cardTitle}>2. Danger in Everyday Cold & Cough Medicines</Text>
          </View>
          <Text style={styles.cardBody}>
            Common over-the-counter decongestants (e.g. medicines containing pseudoephedrine, ephedrine) are strictly banned in-competition. Always scan medications with the AntiDopX scanner before administering.
          </Text>
        </View>

        <View style={styles.guideCard}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="file-medical-alt" size={20} color="#F59E0B" />
            <Text style={styles.cardTitle}>3. Therapeutic Use Exemptions (TUE)</Text>
          </View>
          <Text style={styles.cardBody}>
            If your child has asthma (inhalers), ADHD (prescribed stimulants), or diabetes (insulin), you must obtain an approved TUE through their National Anti-Doping Agency (NADA/WADA) BEFORE they compete.
          </Text>
        </View>

        <View style={styles.guideCard}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="shield-alt" size={20} color="#10B981" />
            <Text style={styles.cardTitle}>4. Your Right to Accompany During Testing</Text>
          </View>
          <Text style={styles.cardBody}>
            Under WADA international standards, underage athletes have the absolute right to have an adult representative (parent or coach) accompany them at every stage of the Doping Control sample collection process.
          </Text>
        </View>

        {/* Quick Safety Actions */}
        <Text style={styles.sectionTitle}>Parent Toolkit & Quick Tools</Text>

        <View style={styles.toolsGrid}>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => router.push('/medicinescanner')}
            activeOpacity={0.8}
          >
            <Ionicons name="barcode-outline" size={28} color="#06B6D4" />
            <Text style={styles.toolTitle}>Scan Medication</Text>
            <Text style={styles.toolSubtitle}>Instant WADA status check</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => router.push('/ai-coach')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="robot-outline" size={28} color="#8B5CF6" />
            <Text style={styles.toolTitle}>Ask AI Coach</Text>
            <Text style={styles.toolSubtitle}>24/7 rule & safety advice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => router.push('/learning-journey')}
            activeOpacity={0.8}
          >
            <Ionicons name="book-outline" size={28} color="#10B981" />
            <Text style={styles.toolTitle}>16 Modules</Text>
            <Text style={styles.toolSubtitle}>Full curriculum review</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => router.push('/roulette')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="slot-machine-outline" size={28} color="#F59E0B" />
            <Text style={styles.toolTitle}>Supplement Spin</Text>
            <Text style={styles.toolSubtitle}>Contamination simulator</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#06B6D4',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0891B2',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  bannerCard: {
    backgroundColor: '#06B6D4',
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#EAFBFF',
    marginTop: 6,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
    marginTop: 10,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 10,
    flex: 1,
  },
  cardBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  toolCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
    textAlign: 'center',
  },
  toolSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
});
