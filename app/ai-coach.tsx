import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBadge } from '../src/components/common/AppBadge';
import { auth } from '../src/firebase/config';
import { getUserProfile } from '../src/firebase/userService';
import { useTranslation } from '../src/localization';
import { askAICoach } from '../src/services/aiCoachService';
import type { AIChatMessage, AthleteLearningContext } from '../src/types/ai';

const createWelcomeMessage = (lang: string, t: any): AIChatMessage => {
  const isHi = lang === 'hi';
  return {
    id: 'welcome-msg',
    role: 'assistant',
    content: isHi
      ? 'नमस्ते एथलीट! मैं आपका **AntiDopX AI लर्निंग कोच** हूँ। मैं WADA और NADO नियमों पर आधारित प्रामाणिक जानकारी देता हूँ। आज आप किस विषय या दवा के बारे में जानना चाहते हैं?'
      : 'Welcome! I am your **AntiDopX AI Learning Coach**. Grounded in official WADA and National Anti-Doping guidelines, I am here to help you train hard, compete clean, and make safe medication choices. What can I clarify for you today?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedFollowUps: [
      t.ai.promptTUE,
      t.ai.promptSupplements,
      t.ai.promptTest,
      t.ai.promptMistakes,
    ],
    groundingSources: ['WADA Prohibited List 2026', 'World Anti-Doping Code'],
  };
};

export default function AICoachScreen() {
  const { t, language } = useTranslation();
  const params = useLocalSearchParams<{ initialQuestion?: string }>();
  const [messages, setMessages] = useState<AIChatMessage[]>(() => [createWelcomeMessage(language, t)]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [athleteContext, setAthleteContext] = useState<AthleteLearningContext | undefined>();
  const flatListRef = useRef<FlatList>(null);

  // Load athlete context for personalization
  useEffect(() => {
    const loadContext = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const profileRes = await getUserProfile(currentUser.uid);
      if (profileRes.success && profileRes.data) {
        const user = profileRes.data;
        const completed = Object.entries(user.progress || {})
          .filter(([, v]) => Boolean(v))
          .map(([k]) => k);

        const weak: string[] = [];
        Object.entries(user.quizScores || {}).forEach(([k, score]) => {
          if ((score ?? 0) < 80) weak.push(k);
        });

        setAthleteContext({
          name: user.name,
          sport: user.sport,
          level: user.level,
          xp: user.xp,
          streak: user.streak,
          completedModules: completed,
          weakTopics: weak,
          recentQuizScores: user.quizScores as Record<string, number> || {},
          language,
        });
      }
    };

    void loadContext();
  }, [language]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text || loading) return;

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await askAICoach({
        message: text,
        conversationHistory: messages.slice(-4).map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
        athleteContext,
        language,
      });

      const aiMessage: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: response.suggestedFollowUps,
        groundingSources: response.sourceReferences,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const errorMessage: AIChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: language === 'hi'
          ? 'माफ़ कीजिए, उत्तर प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।'
          : 'I apologize, but I encountered an issue retrieving the anti-doping reference. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // If an initial question was passed from Scanner or Dashboard, trigger it immediately
  useEffect(() => {
    if (params.initialQuestion) {
      const timer = setTimeout(() => {
        void handleSend(params.initialQuestion);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [params.initialQuestion]);

  const renderMessageItem = ({ item }: { item: AIChatMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
        {!isUser ? (
          <View style={styles.avatarCircle}>
            <MaterialCommunityIcons name="robot" size={20} color="#06B6D4" />
          </View>
        ) : null}

        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.content}
          </Text>

          {item.groundingSources && item.groundingSources.length > 0 ? (
            <View style={styles.sourcesBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Feather name="book-open" size={13} color="#0284C7" style={{ marginRight: 6 }} />
                <Text style={styles.sourcesTitle}>Official Reference:</Text>
              </View>
              {item.groundingSources.map((src, i) => (
                <Text key={i} style={styles.sourceItem}>
                  • {src}
                </Text>
              ))}
            </View>
          ) : null}

          {item.suggestedFollowUps && item.suggestedFollowUps.length > 0 ? (
            <View style={styles.followUpsBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Feather name="help-circle" size={13} color="#F59E0B" style={{ marginRight: 6 }} />
                <Text style={styles.followUpLabel}>Suggested Prompts:</Text>
              </View>
              {item.suggestedFollowUps.map((prompt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.promptChip}
                  onPress={() => void handleSend(prompt)}
                >
                  <Text style={styles.promptChipText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <Text style={[styles.timestamp, isUser ? styles.timestampUser : styles.timestampAi]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{t.ai.coachTitle}</Text>
          <Text style={styles.headerSubtitle}>{t.ai.coachSubtitle}</Text>
        </View>

        <AppBadge label="GROUNDED" variant="allowed" />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing indicator */}
      {loading ? (
        <View style={styles.typingContainer}>
          <ActivityIndicator size="small" color="#06B6D4" />
          <Text style={styles.typingText}>{t.ai.thinking}</Text>
        </View>
      ) : null}

      {/* Input bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t.ai.placeholder}
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => void handleSend()}
          />

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendDisabled]}
            disabled={!inputText.trim() || loading}
            onPress={() => void handleSend()}
          >
            <Feather name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 20,
    padding: 16,
  },
  userBubble: {
    backgroundColor: '#06B6D4',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  aiText: {
    color: '#F1F5F9',
  },
  sourcesBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  sourcesTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  sourceItem: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
  },
  followUpsBox: {
    marginTop: 12,
    gap: 6,
  },
  followUpLabel: {
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  promptChip: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.35)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  promptChipText: {
    color: '#E0F2FE',
    fontSize: 13,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  timestampUser: {
    color: 'rgba(255,255,255,0.7)',
  },
  timestampAi: {
    color: '#64748B',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  typingText: {
    color: '#94A3B8',
    fontSize: 13,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0F172A',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#06B6D4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
});
