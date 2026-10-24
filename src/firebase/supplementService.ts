import { doc, getDoc, updateDoc } from 'firebase/firestore';

import {
  getErrorMessage,
  type ServiceResponse,
} from '../types/serviceResponse';
import { db } from './config';
import { calculateLevel } from './xpUtils';

export type SupplementCategory = 'Safe' | 'Risky' | 'Prohibited';

export type SupplementResult = {
  name: string;
  category: SupplementCategory;
  reason: string;
  guidance: string;
};

const supplements: SupplementResult[] = [
  {
    name: 'Creatine monohydrate',
    category: 'Safe',
    reason: 'Commonly used and not prohibited by itself.',
    guidance:
      'Use third-party tested products and keep batch details for your records.',
  },
  {
    name: 'Electrolyte tablets',
    category: 'Safe',
    reason: 'Usually used for hydration support.',
    guidance:
      'Check the full ingredient list and avoid products with stimulant blends.',
  },
  {
    name: 'Whey protein',
    category: 'Safe',
    reason: 'Protein powders are not prohibited by category.',
    guidance:
      'Choose tested products because contamination and mislabeling can still happen.',
  },
  {
    name: 'Pre-workout blend',
    category: 'Risky',
    reason: 'Blends may contain stimulants or unclear ingredient names.',
    guidance:
      'Avoid products with proprietary blends or aggressive performance claims.',
  },
  {
    name: 'Fat burner',
    category: 'Risky',
    reason: 'These products often contain stimulants and changing formulas.',
    guidance:
      'Check each ingredient before use and ask qualified support staff.',
  },
  {
    name: 'Testosterone booster',
    category: 'Risky',
    reason: 'Hormone-related claims can signal anti-doping risk.',
    guidance:
      'Do not use without specialist review and anti-doping guidance.',
  },
  {
    name: 'Stanozolol',
    category: 'Prohibited',
    reason: 'An anabolic agent prohibited in sport.',
    guidance:
      'Do not use. Speak to qualified medical and anti-doping professionals.',
  },
  {
    name: 'SARMs',
    category: 'Prohibited',
    reason: 'Selective androgen receptor modulators are prohibited in sport.',
    guidance:
      'Avoid products marketed with SARM ingredients or similar claims.',
  },
  {
    name: 'Clenbuterol',
    category: 'Prohibited',
    reason: 'A prohibited anabolic agent.',
    guidance:
      'Do not use and get professional advice if prescribed or exposed.',
  },
];

const getRandomItem = <T,>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)];

export const getSupplementCategories = async (): Promise<
  ServiceResponse<SupplementCategory[]>
> => ({
  success: true,
  data: ['Safe', 'Risky', 'Prohibited'],
});

export const getRandomSupplement = async (
  category?: SupplementCategory
): Promise<ServiceResponse<SupplementResult>> => {
  try {
    const matches = category
      ? supplements.filter(
          (supplement) => supplement.category === category
        )
      : supplements;

    if (matches.length === 0) {
      return {
        success: false,
        error: 'No supplements found for this category',
      };
    }

    return {
      success: true,
      data: getRandomItem(matches),
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

const DAILY_SPIN_XP = 10;

export const claimDailySpinXP = async (
  uid: string
): Promise<ServiceResponse<{ xpAwarded: number; alreadyClaimed: boolean }>> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false, error: 'User not found' };
    }

    const today = new Date().toISOString().split('T')[0];
    const lastSpinDate = userSnap.data().lastSpinDate
      ? userSnap.data().lastSpinDate.split('T')[0]
      : null;

    if (lastSpinDate === today) {
      return {
        success: true,
        data: { xpAwarded: 0, alreadyClaimed: true },
      };
    }

    const currentXP = Number(userSnap.data().xp || 0);
    const newXP = currentXP + DAILY_SPIN_XP;
    const newLevel = calculateLevel(newXP);

    await updateDoc(userRef, {
      lastSpinDate: new Date().toISOString(),
      xp: newXP,
      level: newLevel,
    });

    return {
      success: true,
      data: { xpAwarded: DAILY_SPIN_XP, alreadyClaimed: false },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};
