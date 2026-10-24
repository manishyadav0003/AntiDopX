import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import {
  getLeaderboard,
  type LeaderboardEntry,
} from "../../src/firebase/leaderboardService";

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const result = await getLeaderboard();

    if (!result.success) {
      setError(result.error);
      Alert.alert("Error", result.error);
      setIsLoading(false);
      return;
    }

    setEntries(result.data);
    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLeaderboard();
    }, [loadLeaderboard])
  );

  const top3 = entries.slice(0, 3);
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leaderboard</Text>

        <Text style={styles.headerSubtitle}>Top clean athletes this month</Text>
      </View>

      <TouchableOpacity
        style={styles.refreshButton}
        onPress={loadLeaderboard}
        disabled={isLoading}
      >
        <Text style={styles.refreshButtonText}>
          {isLoading ? "Refreshing..." : "Refresh"}
        </Text>
      </TouchableOpacity>

      {isLoading ? <ActivityIndicator color="#60A5FA" /> : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!isLoading && entries.length === 0 && !error ? (
        <Text style={styles.emptyText}>No leaderboard entries yet.</Text>
      ) : null}

  
      {top3.length === 3 && (
        <View style={styles.podiumContainer}>
          {/* SECOND */}
          <View style={styles.sidePodium}>
            <View style={styles.avatarSilver}>
              <Text style={styles.avatarLabel}>{top3[1]?.name?.charAt(0)}</Text>
            </View>

            <Text style={styles.podiumName}>{top3[1]?.name}</Text>

            <Text style={styles.podiumXP}>
              {top3[1]?.xp.toLocaleString()} XP
            </Text>

            <View style={[styles.podiumBlock, { height: 70 }]}>
              <Text style={styles.blockNumber}>2</Text>
            </View>
          </View>
          <View style={styles.centerPodium}>
            <MaterialCommunityIcons name="crown" size={26} color="#F59E0B" style={styles.crown} />

            <View style={styles.avatarGold}>
              <Text style={styles.avatarLabel}>{top3[0]?.name?.charAt(0)}</Text>
            </View>

            <Text style={styles.podiumName}>{top3[0]?.name}</Text>

            <Text style={styles.podiumXP}>
              {top3[0]?.xp.toLocaleString()} XP
            </Text>

            <View style={[styles.podiumBlock, { height: 110 }]}>
              <Text style={styles.blockNumber}>1</Text>
            </View>
          </View>
          <View style={styles.sidePodium}>
            <View style={styles.avatarBronze}>
              <Text style={styles.avatarLabel}>{top3[2]?.name?.charAt(0)}</Text>
            </View>

            <Text style={styles.podiumName}>{top3[2]?.name}</Text>

            <Text style={styles.podiumXP}>
              {top3[2]?.xp.toLocaleString()} XP
            </Text>

            <View style={[styles.podiumBlock, { height: 55 }]}>
              <Text style={styles.blockNumber}>3</Text>
            </View>
          </View>
        </View>
      )}
      {entries.map((entry, index) => (
        <View
          key={`${entry.name}-${entry.sport}-${index}`}
          style={styles.entryCard}
        >
          <Text style={styles.rank}>{index + 1}</Text>

          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {entry.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </Text>
          </View>

          <View style={styles.entryDetails}>
            <Text style={styles.entryName}>{entry.name}</Text>

            <Text style={styles.entrySport}>{entry.sport}</Text>
          </View>

          <View style={styles.scoreGroup}>
            <Text style={styles.xp}>{entry.xp.toLocaleString()}</Text>

            <Text style={styles.level}>XP</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120, // Increased bottom spacing
  },
  header: {
    marginTop: 25,
    marginBottom: 20,
  },

  headerTitle: {
    color: "#0F172A",
    fontSize: 30,
    fontWeight: "700",
  },

  headerSubtitle: {
    color: "#64748B",
    fontSize: 16,
    marginTop: 4,
  },

  refreshButton: {
    alignSelf: "flex-start",
    backgroundColor: "#06B6D4",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 20,
  },

  refreshButtonText: {
    color: "white",
    fontWeight: "700",
  },

  podium: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 20,
  },

  podiumCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#334155",
  },

  podiumFirst: {
    borderColor: "#F59E0B",
    backgroundColor: "#1E293B",
    transform: [{ scale: 1.05 }],
  },

  podiumEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },

  podiumRank: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },

  podiumSport: {
    color: "#94A3B8",
    fontSize: 12,
    textAlign: "center",
  },

  podiumDetail: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 4,
  },

  entryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  rank: {
    width: 35,
    fontSize: 22,
    fontWeight: "700",
    color: "#475569",
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#06B6D4",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
  },

  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  entryDetails: {
    flex: 1,
    gap: 4,
  },

  entryName: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "700",
  },

  entrySport: {
    color: "#64748B",
    fontSize: 14,
    marginTop: 2,
  },
  scoreGroup: {
    alignItems: "flex-end",
    gap: 4,
  },

  xp: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
  },

  level: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "right",
  },

  streak: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    color: "#CBD5E1",
    fontSize: 16,
  },

  errorText: {
    color: "#EF4444",
    fontSize: 15,
    marginTop: 10,
  },

  podiumContainer: {
    backgroundColor: "#06B6D4",
    borderRadius: 32,
    paddingTop: 18,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },

  centerPodium: {
    alignItems: "center",
  },

  sidePodium: {
    alignItems: "center",
  },

  crown: {
    fontSize: 26,
    marginBottom: 6,
  },

  avatarGold: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ed2d8d", // Pink
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FBCFE8",
  },

  avatarSilver: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#18dc3f", // Orange
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FED7AA",
  },

  avatarBronze: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ec832d",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#CBD5E1",
  },

  avatarLabel: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 22,
  },

  podiumBlock: {
    width: 100,
    backgroundColor: "#22D3EE",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  blockNumber: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },

  podiumName: {
    color: "#fff",
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },

  podiumXP: {
    color: "#E0F2FE",
    fontSize: 13,
    marginTop: 2,
  },
});
