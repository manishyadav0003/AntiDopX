import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LearningModuleScreen } from '../../src/components/learning/learning-module-screen';
import { getLearningModuleBySlug } from '../../src/learning/modules';

export default function DynamicModuleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const module = getLearningModuleBySlug(slug || '');

  if (!module) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Module Not Found</Text>
        <Text style={styles.errorSubtitle}>The requested learning module could not be loaded.</Text>
      </View>
    );
  }

  return <LearningModuleScreen module={module} />;
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});
