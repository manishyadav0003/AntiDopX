import { doc, getDoc, updateDoc } from 'firebase/firestore';

import {
  getErrorMessage,
  type ServiceResponse,
} from '../types/serviceResponse';
import { db } from './config';

type ScenarioOutcome = 'best' | 'good' | 'bad';

export type ScenarioChoice = {
  id: string;
  label: string;
  outcome: ScenarioOutcome;
  text: string;
};

export type Scenario = {
  id: string;
  title: string;
  subtitle: string;
  situationTitle: string;
  situationText: string;
  xpReward: number;
  choices: ScenarioChoice[];
};

export type ScenarioResult = {
  scenarioId: string;
  choiceId: string;
  outcome: ScenarioOutcome;
  xpEarned: number;
};

const SCENARIOS: Scenario[] = [
  {
    id: 'scenario-pre-competition-1',
    title: 'What Would You Do?',
    subtitle: 'Scenario 01 · Pre-Competition',
    situationTitle: 'Day before the meet',
    situationText:
      'Your coach hands you a new recovery supplement and insists it will improve your performance.',
    xpReward: 40,
    choices: [
      {
        id: 'a',
        label: 'Take it — coach knows best',
        outcome: 'bad',
        text: 'Risky. Even trusted coaches can suggest substances containing banned ingredients. Strict liability means YOU are responsible.',
      },
      {
        id: 'b',
        label: 'Verify on Global DRO first',
        outcome: 'good',
        text: "Smart move! Global DRO and WADA's Prohibited List tell you exactly what's allowed.",
      },
      {
        id: 'c',
        label: 'Ask medical / NADA support',
        outcome: 'best',
        text: 'Best answer. Your team doctor or NADA can verify ingredients and ensure compliance.',
      },
    ],
  },
  {
    id: 'scenario-cold-medicine-1',
    title: 'What Would You Do?',
    subtitle: 'Scenario 02 · Cold Medicine',
    situationTitle: 'Symptoms before a test',
    situationText:
      'You wake up with a cold the day before a competition. A teammate offers you their cold medicine.',
    xpReward: 40,
    choices: [
      {
        id: 'a',
        label: 'Take it — just a cold medicine',
        outcome: 'bad',
        text: 'Cold medicines often contain pseudoephedrine or other substances that can be restricted or prohibited. Never take another person medication.',
      },
      {
        id: 'b',
        label: 'Check the ingredients first',
        outcome: 'good',
        text: 'Good instinct. Always check every active ingredient against the WADA Prohibited List before taking anything.',
      },
      {
        id: 'c',
        label: 'See the team doctor and get a prescription',
        outcome: 'best',
        text: 'Best choice. A doctor can prescribe something safe and document it if you need a TUE later.',
      },
    ],
  },
  {
    id: 'scenario-supplement-claim',
    title: 'What Would You Do?',
    subtitle: 'Scenario 03 · Supplement Claims',
    situationTitle: 'Online supplement ad',
    situationText:
      'You see an ad for a supplement that promises rapid recovery and contains exotic herbal ingredients.',
    xpReward: 40,
    choices: [
      {
        id: 'a',
        label: 'Buy it — natural ingredients only',
        outcome: 'bad',
        text: '"Natural" does not mean safe or allowed. Many natural substances are prohibited and supplements can be contaminated.',
      },
      {
        id: 'b',
        label: 'Research the brand and ingredients',
        outcome: 'good',
        text: 'Responsible approach. Check for third-party testing, each ingredient against the Prohibited List, and company reputation.',
      },
      {
        id: 'c',
        label: 'Stick with food-first nutrition and avoid it',
        outcome: 'best',
        text: 'Best choice. A food-first approach avoids supplement risks entirely. Consult a sports nutritionist if needed.',
      },
    ],
  },
  {
    id: 'scenario-tue-1',
    title: 'What Would You Do?',
    subtitle: 'Scenario 04 · TUE Situation',
    situationTitle: 'Doctor prescribed medication',
    situationText:
      'Your doctor prescribes a medication that contains a prohibited substance for a genuine medical condition.',
    xpReward: 40,
    choices: [
      {
        id: 'a',
        label: 'Skip it — afraid of testing positive',
        outcome: 'bad',
        text: 'You should not risk your health. A TUE (Therapeutic Use Exemption) exists for exactly this situation if criteria are met.',
      },
      {
        id: 'b',
        label: 'Take it and hope for the best',
        outcome: 'bad',
        text: 'Risky. Without a TUE, you could face an anti-doping rule violation even with a prescription.',
      },
      {
        id: 'c',
        label: 'Apply for a TUE immediately',
        outcome: 'best',
        text: 'Correct. A TUE allows you to use necessary medication when strict medical criteria are satisfied.',
      },
    ],
  },
];

export const getScenarios = (): ServiceResponse<Scenario[]> => ({
  success: true,
  data: SCENARIOS,
});

export const getScenarioById = (id: string): ServiceResponse<Scenario> => {
  const scenario = SCENARIOS.find((s) => s.id === id);
  if (!scenario) {
    return { success: false, error: 'Scenario not found' };
  }
  return { success: true, data: scenario };
};

export const recordScenarioResult = async (
  uid: string,
  scenarioId: string
): Promise<ServiceResponse<ScenarioResult>> => {
  try {
    const scenarioResult = getScenarioById(scenarioId);
    if (!scenarioResult.success) {
      return scenarioResult;
    }

    const scenario = scenarioResult.data;

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userSnap.data();
    const completedScenarios: string[] = userData.completedScenarios || [];

    // Check if already completed to prevent XP farming
    if (completedScenarios.includes(scenarioId)) {
      return {
        success: true,
        data: {
          scenarioId,
          choiceId: '',
          outcome: 'bad',
          xpEarned: 0,
        },
      };
    }

    const currentXP = Number(userData.xp || 0);
    const newXP = currentXP + scenario.xpReward;

    let newLevel = userData.level || 'Rookie';
    if (newXP >= 1000) newLevel = 'Elite Athlete';
    else if (newXP >= 300) newLevel = 'Champion';
    else if (newXP >= 100) newLevel = 'Competitor';

    await updateDoc(userRef, {
      xp: newXP,
      level: newLevel,
      completedScenarios: [...completedScenarios, scenarioId],
    });

    return {
      success: true,
      data: {
        scenarioId,
        choiceId: '',
        outcome: 'best',
        xpEarned: scenario.xpReward,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

export const checkScenarioCompleted = async (
  uid: string,
  scenarioId: string
): Promise<ServiceResponse<boolean>> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'User not found' };
    }

    const completedScenarios: string[] =
      userSnap.data().completedScenarios || [];

    return {
      success: true,
      data: completedScenarios.includes(scenarioId),
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};
