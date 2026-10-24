import React from 'react';
import { LearningModuleScreen } from '../../src/components/learning/learning-module-screen';
import { getLearningModuleBySlug } from '../../src/learning/modules';

export default function TUEScreen() {
  const module = getLearningModuleBySlug('tue');

  if (!module) {
    return null;
  }

  return (
    <LearningModuleScreen
      module={module}
    />
  );
}
