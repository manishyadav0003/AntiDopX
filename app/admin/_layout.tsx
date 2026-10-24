import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="users" />
      <Stack.Screen name="modules" />
      <Stack.Screen name="medicines" />
      <Stack.Screen name="audit" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
