import {
  collection,
  getDocs,
  limit,
  query,
} from 'firebase/firestore';

import {
  getErrorMessage,
  type ServiceResponse,
} from '../types/serviceResponse';
import { db } from './config';
import { getLevelRank } from './xpUtils';

export type LeaderboardEntry = {
  uid: string;
  name: string;
  sport: string;
  xp: number;
  level: string;
  streak: number;
};

const sortLeaderboard = (
  entries: LeaderboardEntry[]
): LeaderboardEntry[] =>
  [...entries].sort((left, right) => {
    if (right.xp !== left.xp) return right.xp - left.xp;
    if (getLevelRank(right.level) !== getLevelRank(left.level)) {
      return getLevelRank(right.level) - getLevelRank(left.level);
    }
    return right.streak - left.streak;
  });

export const getLeaderboard = async (
  maxResults = 25
): Promise<ServiceResponse<LeaderboardEntry[]>> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      limit(Math.max(maxResults, 100))
    );

    const usersSnap = await getDocs(usersQuery);
    const leaderboard = usersSnap.docs.map((userDoc) => {
      const data = userDoc.data();

      return {
        uid: userDoc.id,
        name: String(data.name || 'Athlete'),
        sport: String(data.sport || 'Unknown sport'),
        xp: Number(data.xp || 0),
        level: String(data.level || 'Rookie'),
        streak: Number(data.streak || 0),
      };
    });

    return {
      success: true,
      data: sortLeaderboard(leaderboard).slice(0, maxResults),
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

export const getUserRank = async (
  uid: string
): Promise<ServiceResponse<{ position: number; totalUsers: number }>> => {
  try {
    const result = await getLeaderboard(100);

    if (!result.success) {
      return result;
    }

    const index = result.data.findIndex((entry) => entry.uid === uid);

    if (index < 0) {
      return {
        success: false,
        error: 'User not found on leaderboard',
      };
    }

    return {
      success: true,
      data: {
        position: index + 1,
        totalUsers: result.data.length,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};
