import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth } from "../src/firebase/config";
import {
  getScenarios,
  recordScenarioResult,
  type Scenario,
  type ScenarioChoice,
} from "../src/firebase/scenarioService";

export default function ScenarioScreen() {
  const [scenarios] = useState<Scenario[]>(() => {
    const result = getScenarios();
    return result.success ? result.data : [];
  });
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [xpEarnedMessage, setXpEarnedMessage] = useState<string>("");

  const changeScenario = (nextIndex: number) => {
    setCurrentIndex(nextIndex);
    setSelected(null);
    setXpEarnedMessage("");
  };

  const current =
    scenarios.length > 0 && currentIndex < scenarios.length
      ? scenarios[currentIndex]
      : null;

  const result = current
    ? current.choices.find((c: ScenarioChoice) => c.id === selected)
    : null;

  const isCompleted = current ? completedIds.has(current.id) : false;

  const handleSelect = async (choice: ScenarioChoice) => {
    if (isCompleted) return;

    setSelected(choice.id);

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const recordResult = await recordScenarioResult(currentUser.uid, current!.id);
    if (recordResult.success) {
      if (recordResult.data.xpEarned > 0) {
        setXpEarnedMessage(`+${recordResult.data.xpEarned} XP earned!`);
        setCompletedIds((prev) => new Set(prev).add(current!.id));
      } else {
        setXpEarnedMessage("Already completed - no XP awarded");
      }
    } else {
      Alert.alert("Error", recordResult.error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={28} color="#1E293B" />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcons name="bolt" size={16} color="#06B6D4" style={{ marginRight: 2 }} />
          <Text style={styles.xpText}>+{current?.xpReward || 0} XP</Text>
        </View>
      </View>

      {current ? (
        <>
          <Text style={styles.scenarioLabel}>
            {current.subtitle}
            {isCompleted ? " (Completed)" : ""}
          </Text>

          <Text style={styles.title}>{current.title}</Text>

          {/* Situation Card */}
          <View style={styles.situationCard}>
            <View style={styles.warningIcon}>
              <Text style={styles.warningIconText}>!</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{current.situationTitle}</Text>
              <Text style={styles.cardText}>{current.situationText}</Text>
            </View>
          </View>

          {/* Choices */}
          {current.choices.map((choice) => {
            const isSelected = selected === choice.id;
            const showResult = selected !== null;

            return (
              <TouchableOpacity
                key={choice.id}
                disabled={showResult || isCompleted}
                onPress={() => handleSelect(choice)}
                style={[
                  styles.choiceCard,
                  showResult &&
                    isSelected &&
                    choice.outcome === "bad" &&
                    styles.badChoice,
                  showResult &&
                    isSelected &&
                    choice.outcome === "good" &&
                    styles.goodChoice,
                  showResult &&
                    isSelected &&
                    choice.outcome === "best" &&
                    styles.bestChoice,
                  isCompleted && styles.completedChoice,
                ]}
              >
                <Text style={styles.choiceLetter}>
                  {choice.id.toUpperCase()}
                </Text>
                <Text style={styles.choiceText}>{choice.label}</Text>
              </TouchableOpacity>
            );
          })}

          {/* XP Message */}
          {xpEarnedMessage && (
            <View style={styles.xpBanner}>
              <Text style={styles.xpBannerText}>{xpEarnedMessage}</Text>
            </View>
          )}

          {/* Result */}
          {result && (
            <View
              style={[
                styles.resultCard,
                result.outcome === "bad"
                  ? styles.badResult
                  : styles.goodResult,
              ]}
            >
              <Text style={styles.resultTitle}>
                {result.outcome === "best"
                  ? "Pro Move!" : result.outcome === "good" ? "Smart Choice" : "Caution Required"}
              </Text>

              <Text style={styles.resultText}>{result.text}</Text>

              <View style={styles.resultButtons}>
                {currentIndex > 0 && (
                  <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => changeScenario(currentIndex - 1)}
                  >
                    <Text style={styles.navButtonText}>← Previous</Text>
                  </TouchableOpacity>
                )}

                {currentIndex < scenarios.length - 1 && (
                  <TouchableOpacity
                    style={styles.navButtonPrimary}
                    onPress={() => changeScenario(currentIndex + 1)}
                  >
                    <Text style={styles.navButtonPrimaryText}>
                      Next Scenario →
                    </Text>
                  </TouchableOpacity>
                )}

                {currentIndex === scenarios.length - 1 && (
                  <TouchableOpacity
                    style={styles.exitButton}
                    onPress={() => router.back()}
                  >
                    <Text style={styles.exitText}>Exit</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </>
      ) : (
        <Text style={styles.emptyText}>Loading scenarios...</Text>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 20,
  },

  xpText: {
    color: "#22C55E",
    fontWeight: "700",
    fontSize: 16,
  },

  xpBanner: {
    backgroundColor: "#166534",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    marginTop: 16,
  },

  xpBannerText: {
    color: "#BBF7D0",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  scenarioLabel: {
    color: "#06B6D4",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },

  title: {
    color: "#0F172A",
    fontSize: 34,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 24,
  },

  situationCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  warningIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#FB923C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  warningIconText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  cardTitle: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 8,
  },

  cardText: {
    color: "#64748B",
    lineHeight: 22,
    fontSize: 15,
  },

  choiceCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 22,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  completedChoice: {
    opacity: 0.6,
  },

  choiceLetter: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E0F2FE",
    textAlign: "center",
    textAlignVertical: "center",
    color: "#06B6D4",
    fontWeight: "800",
    fontSize: 18,
    marginRight: 14,
    overflow: "hidden",
  },

  choiceText: {
    color: "#0F172A",
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },

  badChoice: {
    borderWidth: 2,
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },

  goodChoice: {
    borderWidth: 2,
    borderColor: "#06B6D4",
    backgroundColor: "#F0FDFF",
  },

  bestChoice: {
    borderWidth: 2,
    borderColor: "#22C55E",
    backgroundColor: "#F0FDF4",
  },

  resultCard: {
    marginTop: 20,
    padding: 22,
    borderRadius: 24,
    marginBottom: 30,
  },

  badResult: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },

  goodResult: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
  },

  resultTitle: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },

  resultText: {
    color: "#475569",
    lineHeight: 24,
    fontSize: 15,
  },

  resultButtons: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },

  navButton: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 14,
    borderRadius: 12,
  },

  navButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },

  navButtonPrimary: {
    flex: 1,
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 12,
  },

  navButtonPrimaryText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },

  exitButton: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    padding: 16,
    borderRadius: 16,
  },

  exitText: {
    color: "#0F172A",
    textAlign: "center",
    fontWeight: "700",
  },

  emptyText: {
    color: "#64748B",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});

