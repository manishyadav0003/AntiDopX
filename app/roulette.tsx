import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { arrayUnion, doc, increment, updateDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { G, Path } from "react-native-svg";

import { auth, db } from "../src/firebase/config";

const items = [
  {
    name: "Creatine",
    risk: "Low",
    note: "Well-studied. Choose third-party certified batches (Informed Sport / NSF).",
  },
  {
    name: "Whey Protein",
    risk: "Low",
    note: "Generally safe. Always look for batch certification against cross-contamination.",
  },
  {
    name: "Vitamin D",
    risk: "Low",
    note: "Permitted. Recommended to verify clinical blood levels before supplementation.",
  },
  {
    name: "Omega 3",
    risk: "Low",
    note: "Safe and beneficial anti-inflammatory fatty acids from trusted brands.",
  },
  {
    name: "Energy Booster",
    risk: "High",
    note: "DANGER: High risk of undeclared stimulants (e.g., DMAA, octodrine) banned in-competition.",
  },
  {
    name: "Pre-Workout Mix",
    risk: "Medium",
    note: "Moderate to high risk. Frequently contains hidden prohibited stimulants or unlisted botanicals.",
  },
];

const AnimatedView = Animated.createAnimatedComponent(View);

export default function RouletteScreen() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotation.value}deg`,
        },
      ],
    };
  });

  const spin = () => {
    if (spinning) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setSpinning(true);
    setResult(null);
    setIsSaved(false);

    const randomDegrees = 1800 + Math.floor(Math.random() * 360);

    rotation.value = withTiming(rotation.value + randomDegrees, {
      duration: 4000,
    });

    setTimeout(() => {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      setResult(randomItem);
      setSpinning(false);
      try {
        Haptics.notificationAsync(
          randomItem.risk === "High"
            ? Haptics.NotificationFeedbackType.Warning
            : Haptics.NotificationFeedbackType.Success
        );
      } catch {}
    }, 4000);
  };

  const handleSaveToLibrary = async () => {
    if (!result || isSaved || saving) return;

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Sign In Required", "Please log in to save supplements to your library.");
      return;
    }

    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        savedSupplements: arrayUnion({
          name: result.name,
          risk: result.risk,
          note: result.note,
          savedAt: new Date().toISOString(),
        }),
        xp: increment(15),
      });

      setIsSaved(true);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      Alert.alert(
        "Saved to Library! (+15 XP)",
        `${result.name} added to your reference library.\n\nANTI-DOPING NOTICE:\nDietary supplements carry an inherent risk of inadvertent contamination. WADA does NOT certify any dietary supplement. Always demand third-party batch testing certificates.`
      );
    } catch (error: any) {
      Alert.alert("Error Saving", error?.message || "Failed to save supplement.");
    } finally {
      setSaving(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "#16A34A";
      case "Medium":
        return "#F59E0B";
      case "High":
        return "#DC2626";
      default:
        return "#2563EB";
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#0f172a" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/achievements" as any)}>
          <MaterialCommunityIcons
            name="bookmark-outline"
            size={24}
            color="#0f172a"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.gameTag}>INTERACTIVE SIMULATOR</Text>

      <Text style={styles.title}>Supplement Roulette</Text>

      <Text style={styles.subtitle}>
        Spin to discover what{"'"}s safe, what carries contamination risks, and what contains hidden prohibited substances.
      </Text>

      {/* Wheel */}
      <View style={styles.wheelContainer}>
        <View style={styles.pointer} />

        <AnimatedView style={animatedStyle}>
          <Svg width={300} height={300}>
            <G>
              <Path
                d="M150 150 L150 0 A150 150 0 0 1 280 75 Z"
                fill="#22C55E"
              />
              <Path
                d="M150 150 L280 75 A150 150 0 0 1 280 225 Z"
                fill="#0891B2"
              />
              <Path
                d="M150 150 L280 225 A150 150 0 0 1 150 300 Z"
                fill="#F59E0B"
              />
              <Path
                d="M150 150 L150 300 A150 150 0 0 1 20 225 Z"
                fill="#EF4444"
              />
              <Path
                d="M150 150 L20 225 A150 150 0 0 1 20 75 Z"
                fill="#06B6D4"
              />
              <Path
                d="M150 150 L20 75 A150 150 0 0 1 150 0 Z"
                fill="#8B5CF6"
              />
            </G>
          </Svg>

          <View style={styles.centerCircle}>
            <Text style={styles.centerText}>SPIN</Text>
          </View>
        </AnimatedView>
      </View>

      <TouchableOpacity
        style={[styles.spinButton, spinning && { opacity: 0.7 }]}
        disabled={spinning}
        onPress={spin}
        activeOpacity={0.8}
      >
        <Text style={styles.spinButtonText}>
          {spinning ? "Evaluating Roulette..." : "SPIN THE WHEEL"}
        </Text>
      </TouchableOpacity>

      {/* Result */}
      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>{result.name}</Text>

            <View
              style={[
                styles.riskBadge,
                {
                  backgroundColor: getRiskColor(result.risk),
                },
              ]}
            >
              <Text style={styles.riskText}>{result.risk} Risk</Text>
            </View>
          </View>

          <Text style={styles.note}>{result.note}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Safety</Text>
              <Text style={styles.statValue}>
                {result.risk === "Low"
                  ? "9/10"
                  : result.risk === "Medium"
                  ? "6/10"
                  : "2/10"}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>WADA</Text>
              <Text style={styles.statValue}>
                {result.risk === "High" ? "Watch / Banned" : "Allowed"}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Testing</Text>
              <Text style={styles.statValue}>
                {result.risk === "High" ? "Contaminated" : "Batch Tested"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              isSaved && { backgroundColor: "#10B981" },
              saving && { opacity: 0.6 },
            ]}
            onPress={handleSaveToLibrary}
            disabled={isSaved || saving}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {isSaved
                ? "Saved in Library (+15 XP)"
                : saving
                ? "Saving..."
                : "Save to Athlete Library"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
  },
  gameTag: {
    color: "#0891B2",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 20,
  },
  title: {
    color: "#0F172A",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 6,
  },
  subtitle: {
    color: "#64748B",
    marginTop: 8,
    lineHeight: 22,
    marginBottom: 20,
  },
  wheelContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 25,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#06B6D4",
    marginBottom: -18,
    zIndex: 100,
  },
  centerCircle: {
    position: "absolute",
    top: 110,
    left: 110,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  centerText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0891B2",
  },
  spinButton: {
    backgroundColor: "#06B6D4",
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 30,
    shadowColor: "#06B6D4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  spinButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  resultCard: {
    backgroundColor: "#fff",
    marginTop: 25,
    padding: 22,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultTitle: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "bold",
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  riskText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
  note: {
    color: "#475569",
    marginTop: 12,
    lineHeight: 22,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  statBox: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 14,
    width: "30%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },
  statValue: {
    color: "#0891B2",
    fontWeight: "bold",
    marginTop: 6,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#06B6D4",
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 14,
  },
  saveButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15,
  },
});
