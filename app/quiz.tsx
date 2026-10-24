import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBadge } from '../src/components/common/AppBadge';
import { AppButton } from '../src/components/common/AppButton';
import { ProgressBar } from '../src/components/common/ProgressBar';
import { auth } from '../src/firebase/config';
import {
  getDynamicQuizSession,
  submitQuizArenaResult,
  type QuizArenaQuestion,
} from '../src/firebase/quizService';
import type { QuizArenaAnswer } from '../src/firebase/functionsService';
import { useTranslation } from '../src/localization';

export default function QuizScreen() {
  const { t } = useTranslation();
  const [session, setSession] = useState(() => getDynamicQuizSession({ mode: 'rapid_fire', targetQuestionCount: 5 }));
  const [questions, setQuestions] = useState<QuizArenaQuestion[]>(session.questions);
  const [idx, setIdx] = useState(0);
  const [time, setTime] = useState(session.timeLimitSeconds);
  const [score, setScore] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [answers, setAnswers] = useState<QuizArenaAnswer[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [newTotalXP, setNewTotalXP] = useState<number | null>(null);
  const [newLevel, setNewLevel] = useState<string>('');
  const [submitError, setSubmitError] = useState('');

  const currentQuestion = questions[idx] || questions[0];

  const persistQuizResult = useCallback(async (submittedAnswers: QuizArenaAnswer[]) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setSubmitError('Please sign in to save your quiz results.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const result = await submitQuizArenaResult(submittedAnswers, currentUser.uid);

    if (!result.success) {
      setSubmitError(result.error);
      Alert.alert('Notice', result.error);
      setIsSubmitting(false);
      return;
    }

    setScore(result.data.score);
    setPercentage(result.data.percentage);
    setXpEarned(result.data.xpEarned);
    setNewTotalXP(result.data.totalXP);
    setNewLevel(result.data.level);
    setIsSubmitting(false);
  }, []);

  const nextQuestion = useCallback(
    async (submittedAnswers: QuizArenaAnswer[]) => {
      if (idx >= questions.length - 1) {
        setDone(true);
        await persistQuizResult(submittedAnswers);
        return;
      }

      setIdx((prev) => prev + 1);
      setPicked(null);
      setShowExplanation(false);
      setTime(session.timeLimitSeconds);
    },
    [idx, questions.length, persistQuizResult, session.timeLimitSeconds]
  );

  // Timer countdown
  useEffect(() => {
    if (done || picked !== null) return;

    const timer = setTimeout(() => {
      if (time <= 1) {
        try {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch {}
        const timedOutAnswers = [
          ...answers,
          { questionId: currentQuestion.id, optionIndex: -1 },
        ];
        setAnswers(timedOutAnswers);
        void nextQuestion(timedOutAnswers);
        return;
      }

      setTime((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [time, picked, done, nextQuestion, answers, currentQuestion]);

  const handleAnswer = (optionIndex: number) => {
    if (picked !== null) return;

    setPicked(optionIndex);
    setShowExplanation(true);

    const isCorrect = currentQuestion.correctOptionIndex !== undefined
      ? currentQuestion.correctOptionIndex === optionIndex
      : false;

    try {
      if (isCorrect) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {}

    const nextAnswers = [
      ...answers,
      { questionId: currentQuestion.id, optionIndex },
    ];
    setAnswers(nextAnswers);

    // Give athlete 1.2s to read the explanation before moving to next
    setTimeout(() => {
      void nextQuestion(nextAnswers);
    }, 1400);
  };

  const resetQuiz = () => {
    const newSession = getDynamicQuizSession({ mode: 'rapid_fire', targetQuestionCount: 5 });
    setSession(newSession);
    setQuestions(newSession.questions);
    setIdx(0);
    setScore(0);
    setPercentage(0);
    setAnswers([]);
    setPicked(null);
    setShowExplanation(false);
    setTime(newSession.timeLimitSeconds);
    setDone(false);
    setXpEarned(0);
    setSubmitError('');
  };

  if (done) {
    return (
      <SafeAreaView style={styles.resultContainer}>
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
          {isSubmitting ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#06B6D4" size="large" />
              <Text style={styles.submittingText}>{t.common.loading}</Text>
            </View>
          ) : (
            <>
              <MaterialCommunityIcons
                name="trophy"
                size={84}
                color="#FACC15"
              />

              <Text style={styles.resultTitle}>{t.quiz.complete}</Text>
              <Text style={styles.resultSubtitle}>{t.quiz.greatJob}</Text>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {score}/{questions.length}
                  </Text>
                  <Text style={styles.statLabel}>{t.quiz.score}</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{percentage}%</Text>
                  <Text style={styles.statLabel}>{t.quiz.accuracy}</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={[styles.statValue, { color: '#06B6D4' }]}>
                    +{xpEarned}
                  </Text>
                  <Text style={styles.statLabel}>{t.quiz.xpEarned}</Text>
                </View>
              </View>

              {newLevel ? (
                <View style={styles.levelCard}>
                  <Text style={styles.levelCardLabel}>CURRENT LEVEL</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Feather name="award" size={18} color="#0284C7" style={{ marginRight: 6 }} />
                    <Text style={styles.levelCardValue}>{newLevel}</Text>
                  </View>
                  {newTotalXP !== null && (
                    <Text style={styles.levelCardXP}>Total: {newTotalXP.toLocaleString()} XP</Text>
                  )}
                </View>
              ) : null}

              {submitError ? (
                <Text style={styles.errorText}>{submitError}</Text>
              ) : null}

              <AppButton
                title={t.quiz.backToDashboard}
                onPress={() => router.replace('/(tabs)/dashboard')}
                size="lg"
                style={{ width: '100%', marginTop: 16 }}
              />

              <TouchableOpacity onPress={resetQuiz} style={styles.playAgainTouch}>
                <Text style={styles.playAgain}>{t.quiz.playAgain}</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const progressPercent = ((idx + 1) / questions.length) * 100;
  const isUrgent = time <= 5;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle}>{session.title}</Text>
        </View>

        <View style={[styles.timerBadge, isUrgent && styles.timerUrgent]}>
          <Text style={[styles.timerText, isUrgent && styles.timerTextUrgent]}>
            ⏱ {time}{t.quiz.secondsLeft}
          </Text>
        </View>
      </View>

      <ProgressBar
        progressPercent={progressPercent}
        height={6}
        color="#06B6D4"
        style={{ marginBottom: 16 }}
      />

      <View style={styles.questionMetaRow}>
        <Text style={styles.progress}>
          {t.quiz.questionProgress} {idx + 1} {t.quiz.of} {questions.length}
        </Text>
        <AppBadge label={`+${session.possibleXP} XP`} variant="xp" />
      </View>

      <Text style={styles.question}>{currentQuestion.question}</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {currentQuestion.options.map((option, optionIndex) => {
          const isSelected = picked === optionIndex;
          const isCorrect =
            currentQuestion.correctOptionIndex !== undefined &&
            currentQuestion.correctOptionIndex === optionIndex;
          const isWrong =
            picked !== null &&
            isSelected &&
            currentQuestion.correctOptionIndex !== optionIndex;

          let btnBg = '#FFFFFF';
          let borderColor = '#E2E8F0';

          if (picked !== null) {
            if (isCorrect) {
              btnBg = '#DCFCE7';
              borderColor = '#22C55E';
            } else if (isWrong) {
              btnBg = '#FEE2E2';
              borderColor = '#EF4444';
            } else {
              btnBg = '#F8FAFC';
            }
          }

          return (
            <TouchableOpacity
              key={`${option}-${optionIndex}`}
              disabled={picked !== null}
              activeOpacity={0.8}
              style={[
                styles.optionButton,
                { backgroundColor: btnBg, borderColor },
                isSelected && styles.optionSelected,
              ]}
              onPress={() => handleAnswer(optionIndex)}
            >
              <View style={styles.optionContent}>
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + optionIndex)}
                </Text>
                <Text style={styles.optionText}>{option}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {showExplanation && currentQuestion.explanation ? (
          <View style={styles.explanationCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Feather name="info" size={14} color="#0284C7" style={{ marginRight: 6 }} />
              <Text style={styles.explanationHeader}>{t.quiz.explanation}</Text>
            </View>
            <Text style={styles.explanationText}>
              {currentQuestion.explanation}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sessionHeader: {
    flex: 1,
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  timerBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  timerUrgent: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  timerText: {
    color: '#0284C7',
    fontWeight: '800',
    fontSize: 14,
  },
  timerTextUrgent: {
    color: '#DC2626',
  },
  questionMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progress: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  question: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 24,
  },
  optionButton: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  optionSelected: {
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 32,
    fontWeight: '800',
    color: '#06B6D4',
    marginRight: 12,
    overflow: 'hidden',
  },
  optionText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  explanationCard: {
    backgroundColor: '#F0FDFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 16,
    marginTop: 14,
  },
  explanationHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0284C7',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#0F172A',
    lineHeight: 20,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  resultScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingBox: {
    alignItems: 'center',
    gap: 12,
  },
  submittingText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
  resultTitle: {
    color: '#0F172A',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 16,
  },
  resultSubtitle: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 6,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  statValue: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: '#64748B',
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  levelCard: {
    width: '100%',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  levelCardLabel: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  levelCardValue: {
    color: '#065F46',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  levelCardXP: {
    color: '#047857',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  playAgainTouch: {
    marginTop: 16,
    padding: 8,
  },
  playAgain: {
    color: '#06B6D4',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
  },
});
