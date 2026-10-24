import React from 'react';
import { LearningModuleScreen } from '../../src/components/learning/learning-module-screen';
import { getLearningModuleBySlug } from '../../src/learning/modules';

export default function TestingProceduresScreen() {
  const module = getLearningModuleBySlug('testing-procedures');

  if (!module) {
    return null;
  }

  return (
    <LearningModuleScreen
      module={module}
    />
  );
}
