import {
  FontAwesome5,
  MaterialCommunityIcons
} from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ChallengesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="gamepad-variant" size={28} color="#0284C7" style={{ marginRight: 8 }} />
        <Text style={styles.header}>Play &amp; Compete</Text>
      </View>

      <Text style={styles.subHeader}>
        Fast interactive simulations. Real anti-doping knowledge.
      </Text>

      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => router.push('/scenario' as any)}
        accessibilityRole="button"
      >
        <Text style={styles.badge}>FEATURED SIMULATION</Text>

        <Text style={styles.featuredTitle}>What Would You Do?</Text>

        <Text style={styles.featuredDescription}>
          Make split-second decisions in real-life anti-doping testing and supplement scenarios.
        </Text>

        <View style={styles.xpRow}>
          <FontAwesome5 name="bolt" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.xpText}>+80 XP per completed scenario</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.grid}>
        <GameCard
          title="Supplement Roulette"
          subtitle="Spin to assess risks"
          icon="dice"
          iconColor="#F97316"
          route="/roulette"
        />
        <GameCard
          title="Medicine Scanner"
          subtitle="AI barcode verification"
          icon="camera"
          iconColor="#0284C7"
          route="/medicinescanner"
        />
        <GameCard
          title="Quiz Arena"
          subtitle="Timed rapid fire"
          icon="brain"
          iconColor="#10B981"
          route="/quiz"
        />
        <GameCard
          title="Case Studies"
          subtitle="Branching outcomes"
          icon="question-circle"
          iconColor="#06B6D4"
          route="/scenario"
        />
      </View>

      <View style={styles.sectionHeaderRow}>
        <MaterialCommunityIcons name="trophy-outline" size={22} color="#0F172A" style={{ marginRight: 8 }} />
        <Text style={styles.sectionTitle}>Live Tournaments</Text>
      </View>

      <TournamentCard
        title="Clean Sport National Cup"
        players="1,240 Athletes Competing"
        status="LIVE"
      />

      <TournamentCard
        title="Supplement Awareness Week"
        players="Solo Knowledge Challenge"
        status="ACTIVE"
      />

      <TournamentCard
        title="TUE Regulatory Mastery"
        players="National Curriculum Event"
        status="UPCOMING"
      />
    </ScrollView>
  );
}

function GameCard({
  title,
  subtitle,
  icon,
  route,
  iconColor,
}: {
  title: string;
  subtitle: string;
  icon: any;
  route: string;
  iconColor: string;
}) {
  return (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={() => router.push(route as any)}
    >
      <FontAwesome5
  name={icon}
  size={28}
  color={iconColor}
/>

      <Text style={styles.gameTitle}>
        {title}
      </Text>

      <Text style={styles.gameSubtitle}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

function TournamentCard({
  title,
  players,
  status,
}: {
  title: string;
  players: string;
  status: string;
}) {
  return (
    <View style={styles.tournamentCard}>
      <MaterialCommunityIcons
        name="trophy"
        size={28}
        color="#F59E0B"
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.tournamentTitle}>
          {title}
        </Text>

        <Text style={styles.tournamentPlayers}>
          {players}
        </Text>
      </View>

      <Text style={styles.status}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  header: {
    color: '#0F172A',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subHeader: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
    fontWeight: '500',
  },
  featuredCard: {
    backgroundColor: '#0F172A',
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0284C7',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 14,
  },
  featuredDescription: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  xpText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gameCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gameTitle: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
    marginTop: 12,
  },
  gameSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },

 tournamentCard: {
  backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 24,
    borderWidth: 1,
borderColor: '#E5E7EB',
shadowColor: '#000',
shadowOpacity: 0.06,
shadowRadius: 8,
elevation: 4,
  },

  tournamentTitle: {
  color: '#111827',
    fontWeight: 'bold',
  },

  tournamentPlayers: {
    color: '#64748B',
    fontSize: 12,
  },

  status: {
    color: '#22C55E',
    fontWeight: 'bold',
  },
});