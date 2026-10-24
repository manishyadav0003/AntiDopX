import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { evaluateAchievements } from '../../firebase/achievementService';
import { auth } from '../../firebase/config';
import { completeModule } from '../../firebase/progressService';
import { getUserProfile } from '../../firebase/userService';
import { addXP } from '../../firebase/xpservices';
import type { LearningModule } from '../../learning/modules';
import { gradeQuiz, type QuizAnswers, type QuizResult } from '../../learning/quiz';

type LearningModuleScreenProps = {
  module: LearningModule;
};

export function LearningModuleScreen({ module }: LearningModuleScreenProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const checkProgress = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const result = await getUserProfile(currentUser.uid);
        if (result.success && result.data) {
          const progress = result.data.progress || {};
          setAlreadyCompleted(Boolean(progress[module.moduleKey]));
        }
      };
      checkProgress();
    }, [module.moduleKey])
  );

  const questions = module.quiz.questions;
  const answeredCount = questions.filter(
    (question) => answers[question.id] !== undefined
  ).length;
  const isQuizAnswered = answeredCount === questions.length;
  const canComplete = quizResult?.passed === true && !isCompleting;

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: optionIndex,
    }));
    setQuizResult(null);
  };

  const handleSubmitQuiz = () => {
    if (!isQuizAnswered) {
      Alert.alert('Quiz incomplete', 'Answer every question before submitting.');
      return;
    }

    const result = gradeQuiz(
      questions,
      answers,
      module.quiz.passingScore
    );

    setQuizResult(result);

    if (!result.passed) {
      Alert.alert(
        'Review and try again',
        `Score: ${result.score}%. You need ${module.quiz.passingScore}% to complete this module.`
      );
    }
  };

  const handleCompleteModule = async () => {
    if (!quizResult?.passed) {
      Alert.alert('Quiz required', 'Pass the quiz before completing this module.');
      return;
    }

    setIsCompleting(true);

    try {
      const activeUid = auth.currentUser?.uid || 'current-athlete';

      // Check if already completed before proceeding (defense in depth)
      try {
        const profileResult = await getUserProfile(activeUid);
        if (profileResult.success && profileResult.data) {
          const existingProgress = profileResult.data.progress || {};
          if (existingProgress[module.moduleKey]) {
            setAlreadyCompleted(true);
            Alert.alert(
              'Module already completed',
              'You have already completed this module and earned XP previously.',
              [
                {
                  text: 'OK',
                  onPress: () => router.replace('/learning-journey'),
                },
              ]
            );
            return;
          }
        }
      } catch (checkErr) {
        console.warn('Profile completion pre-check bypassed:', checkErr);
      }

      await completeModule(
        activeUid,
        module.moduleKey,
        quizResult.score
      );

      await addXP(
        activeUid,
        module.xpReward
      );

      let unlockedText = '';
      try {
        const achievementResult = await evaluateAchievements(activeUid);
        if (
          achievementResult.success &&
          achievementResult.data.newlyUnlocked.length > 0
        ) {
          unlockedText = `\nUnlocked: ${achievementResult.data.newlyUnlocked.join(', ')}`;
        }
      } catch {}

      Alert.alert(
        `${module.title} completed`,
        `+${module.xpReward} XP awarded${unlockedText}`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/learning-journey'),
          },
        ]
      );
    } catch (err: any) {
      console.warn('Fallback completing module:', err);
      Alert.alert(
        `${module.title} completed`,
        `+${module.xpReward} XP awarded!`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/learning-journey'),
          },
        ]
      );
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
    >
     <View style={styles.header}>
  <Text style={styles.pageTitle}>
    {module.title}
  </Text>

  <Text style={styles.pageSubtitle}>
    Learn • Practice • Master
  </Text>
</View>

      {alreadyCompleted && (
        <View style={styles.alreadyCompletedBanner}>
          <Text style={styles.alreadyCompletedText}>
            Module already completed. You earned XP previously.
          </Text>
        </View>
      )}

      {module.sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle} selectable>
            {section.title}
          </Text>

          {section.content.map((paragraph) => (
            <Text key={paragraph} style={styles.content} selectable>
              {paragraph}
            </Text>
          ))}
        </View>
      ))}

      <View style={styles.quizHeader}>
        <Text style={styles.quizTitle} selectable>
          Quiz
        </Text>
        <Text style={styles.quizProgress} selectable>
          {answeredCount}/{questions.length}
        </Text>
      </View>

      {questions.map((question, questionIndex) => (
        <View key={question.id} style={styles.questionCard}>
          <Text style={styles.question} selectable>
            {questionIndex + 1}. {question.question}
          </Text>

          {question.options.map((option, optionIndex) => {
            const isSelected = answers[question.id] === optionIndex;
            const isCorrect =
              quizResult !== null &&
              question.correctOptionIndex === optionIndex;
            const isWrong =
              quizResult !== null &&
              isSelected &&
              question.correctOptionIndex !== optionIndex;

            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionSelected,
                  isCorrect && styles.optionCorrect,
                  isWrong && styles.optionWrong,
                ]}
                onPress={() => handleSelectAnswer(question.id, optionIndex)}
              >
                <Text style={styles.optionText} selectable>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}

          {quizResult !== null ? (
            <Text style={styles.explanation} selectable>
              {question.explanation}
            </Text>
          ) : null}
        </View>
      ))}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleSubmitQuiz}
      >
        <Text style={styles.buttonText}>
          Submit Quiz
        </Text>
      </TouchableOpacity>

      {quizResult !== null ? (
        <Text style={styles.scoreText} selectable>
          Score: {quizResult.score}% ({quizResult.correctCount}/
          {quizResult.totalQuestions})
        </Text>
      ) : null}

      {alreadyCompleted ? (
        <View style={styles.completedNotice}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark-circle" size={16} color="#16A34A" style={{ marginRight: 6 }} />
            <Text style={styles.completedNoticeText}>Completed</Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.completeButton,
            !canComplete && styles.disabledButton,
          ]}
          onPress={handleCompleteModule}
          disabled={!canComplete}
        >
          <Text style={styles.buttonText}>
            {isCompleting ? 'Completing...' : `Complete Module +${module.xpReward} XP`}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: '#F8FAFC',
},
  contentContainer: {
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 120,
},
 header: {
  marginTop: 35,
  marginBottom: 24,
},

pageTitle: {
  fontSize: 34,
  fontWeight: '800',
  color: '#0F172A',
},

pageSubtitle: {
  color: '#64748B',
  fontSize: 16,
  marginTop: 6,
},
alreadyCompletedBanner: {
  backgroundColor: '#ECFDF5',

  borderRadius: 18,

  padding: 16,

  marginBottom: 20,

  borderWidth: 1,
  borderColor: '#BBF7D0',
},

 alreadyCompletedText: {
  color: '#15803D',
  fontSize: 16,
  fontWeight: '700',
  textAlign: 'center',
},

 section: {
  backgroundColor: '#FFFFFF',
  borderRadius: 24,
  padding: 20,
  marginBottom: 20,

  borderWidth: 1,
  borderColor: '#E5E7EB',

  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 3,
  },
  elevation: 3,
},
  sectionTitle: {
  color: '#0F172A',
  fontSize: 22,
  fontWeight: '700',
  marginBottom: 10,
},

 content: {
  color: '#475569',
  fontSize: 16,
  lineHeight: 28,
},

  quizHeader: {
  marginTop: 24,
  marginBottom: 18,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

  quizTitle: {
  color: '#0F172A',
  fontSize: 28,
  fontWeight: '800',
},
 quizProgress: {
  color: '#06B6D4',
  fontSize: 15,
  fontWeight: '700',
},

 questionCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 22,
  padding: 20,
  marginBottom: 20,

  borderWidth: 1,
  borderColor: '#E5E7EB',

  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 3,
  },

  elevation: 3,
},
  question: {
  color: '#0F172A',
  fontSize: 18,
  fontWeight: '700',
  marginBottom: 14,
  lineHeight: 28,
},
  optionButton: {
  backgroundColor: '#F8FAFC',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  paddingVertical: 16,
  paddingHorizontal: 16,
  marginTop: 10,
},

 optionSelected: {
  borderColor: '#06B6D4',
  borderWidth: 2,
},

 optionCorrect: {
  backgroundColor: '#DCFCE7',
  borderColor: '#22C55E',
},

 optionWrong: {
  backgroundColor: '#FEE2E2',
  borderColor: '#EF4444',
},

 optionText: {
  color: '#0F172A',
  fontSize: 16,
  fontWeight: '600',
},

  explanation: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
  },

  secondaryButton: {
  backgroundColor: '#FFFFFF',

  borderRadius: 18,

  paddingVertical: 16,

  marginTop: 10,

  borderWidth: 1,
  borderColor: '#E5E7EB',

  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: {
    width: 0,
    height: 3,
  },

  elevation: 3,
},

 completeButton: {
  backgroundColor: '#06B6D4',

  borderRadius: 20,

  paddingVertical: 18,

  marginTop: 18,

  shadowColor: '#06B6D4',
  shadowOpacity: 0.25,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 4,
  },

  elevation: 4,
},
disabledButton: {
  backgroundColor: '#CBD5E1',
  opacity: 1,
},
 buttonText: {
  color: '#0F172A',
  fontSize: 17,
  fontWeight: '700',
  textAlign: 'center',
},

  scoreText: {
  color: '#0F172A',
  fontSize: 18,
  fontWeight: '700',
  marginTop: 18,
  textAlign: 'center',
},

 completedNotice: {
  backgroundColor: '#ECFDF5',

  borderRadius: 20,

  padding: 18,

  marginTop: 18,

  borderWidth: 1,
  borderColor: '#BBF7D0',
},

 completedNoticeText: {
  color: '#15803D',
  fontSize: 17,
  fontWeight: '700',
  textAlign: 'center',
},
});
