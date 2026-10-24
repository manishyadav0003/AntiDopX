import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { LocalizationProvider } from '../src/localization';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <LocalizationProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="role-selection" />
          <Stack.Screen name="sport-selection" />
          <Stack.Screen name="athlete-register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="ai-coach" />
          <Stack.Screen name="coach/dashboard" />
          <Stack.Screen name="coach/athletes" />
          <Stack.Screen name="coach/athlete-detail" />
          <Stack.Screen name="chat/[conversationId]" />
          <Stack.Screen name="parent/guide" />
          <Stack.Screen name="admin" />
        </Stack>

        <StatusBar style="auto" />
      </ThemeProvider>
    </LocalizationProvider>
  );
}
