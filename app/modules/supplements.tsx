import React from 'react';
import { LearningModuleScreen } from '../../src/components/learning/learning-module-screen';
import { getLearningModuleBySlug } from '../../src/learning/modules';

export default function SupplementsScreen() {
  const module = getLearningModuleBySlug('supplements');

  if (!module) {
    return null;
  }

  return (
    <LearningModuleScreen
      module={module}
    />
  );
}
