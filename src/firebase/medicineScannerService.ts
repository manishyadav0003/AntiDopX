import {
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

import {
  getErrorMessage,
  type ServiceResponse,
} from '../types/serviceResponse';
import type { SavedMedicine } from '../types/userProfile';
import { db } from './config';
import {
  lookupMedicineByBarcode,
  searchMedicinesByNameOrIngredient,
} from '../services/medicineReferenceService';
import type {
  AntiDopingStatus,
  MedicineScanResult as TrustedScanResult,
} from '../types/medicine';
import { calculateLevel } from './xpUtils';

export type MedicineStatus =
  | 'Allowed'
  | 'Use With Caution'
  | 'Prohibited'
  | 'Unknown';

export type MedicineLookupResult = {
  drugName: string;
  status: MedicineStatus;
  guidance: string;
  activeIngredients?: string[];
  disclaimer?: string;
  source?: string;
  lastVerified?: string;
};

export type MedicineScanResult = {
  rawText: string;
  detectedDrugName: string | null;
  lookup: MedicineLookupResult;
  cached?: boolean;
};

const mapStatusToLegacy = (status: AntiDopingStatus): MedicineStatus => {
  switch (status) {
    case 'ALLOWED':
      return 'Allowed';
    case 'USE_WITH_CAUTION':
      return 'Use With Caution';
    case 'PROHIBITED':
      return 'Prohibited';
    default:
      return 'Unknown';
  }
};

export const scanMedicineBarcode = async (
  barcode: string
): Promise<ServiceResponse<TrustedScanResult>> => {
  try {
    const result = lookupMedicineByBarcode(barcode);
    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

export const searchMedicines = async (
  query: string
): Promise<ServiceResponse<TrustedScanResult[]>> => {
  try {
    const results = searchMedicinesByNameOrIngredient(query);
    return {
      success: true,
      data: results,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

// Backward-compatible method
export const scanMedicineText = async (
  ocrText: string
): Promise<ServiceResponse<MedicineScanResult>> => {
  try {
    const matches = searchMedicinesByNameOrIngredient(ocrText);

    if (matches.length > 0) {
      const best = matches[0];
      return {
        success: true,
        data: {
          rawText: ocrText,
          detectedDrugName: best.title,
          lookup: {
            drugName: best.title,
            status: mapStatusToLegacy(best.status),
            guidance: best.guidance,
            activeIngredients: best.activeIngredients,
            disclaimer: best.disclaimer,
            source: best.source,
            lastVerified: best.lastVerified,
          },
        },
      };
    }

    return {
      success: true,
      data: {
        rawText: ocrText,
        detectedDrugName: null,
        lookup: {
          drugName: ocrText.trim(),
          status: 'Unknown',
          guidance:
            'No verified match was found in the AntiDopX reference database. Confirm every active ingredient with Global DRO or your NADO.',
        },
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

export const saveMedicineScan = async (
  uid: string,
  lookup: MedicineLookupResult
): Promise<ServiceResponse<{ xpAwarded: number; duplicate: boolean }>> => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const savedMedicines =
      (userSnap.data().savedMedicines as SavedMedicine[]) || [];
    const normalizedName = lookup.drugName.trim().toLowerCase();
    const isDuplicate = savedMedicines.some(
      (medicine) => medicine.drugName.trim().toLowerCase() === normalizedName
    );

    if (isDuplicate) {
      return {
        success: true,
        data: {
          xpAwarded: 0,
          duplicate: true,
        },
      };
    }

    const savedEntry: SavedMedicine = {
      drugName: lookup.drugName,
      status: lookup.status,
      guidance: lookup.guidance,
      scannedAt: new Date().toISOString(),
    };

    let xpAwarded = 0;
    const currentXP = Number(userSnap.data().xp || 0);
    const newXP = currentXP + 15;
    const newLevel = calculateLevel(newXP);

    await updateDoc(userRef, {
      savedMedicines: arrayUnion(savedEntry),
      xp: newXP,
      level: newLevel,
      recentActivity: arrayUnion({
        type: 'scan',
        description: `Verified ${lookup.drugName} (${lookup.status})`,
        timestamp: new Date().toISOString(),
      }),
    });

    xpAwarded = 15;

    return {
      success: true,
      data: {
        xpAwarded,
        duplicate: false,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};
