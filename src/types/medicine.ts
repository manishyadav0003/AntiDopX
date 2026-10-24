export type AntiDopingStatus =
  | 'ALLOWED'
  | 'USE_WITH_CAUTION'
  | 'PROHIBITED'
  | 'INSUFFICIENT_INFO'
  | 'UNKNOWN';

export type AdministrationRoute =
  | 'Oral'
  | 'Inhalation'
  | 'Topical'
  | 'Nasal'
  | 'Ophthalmic'
  | 'Injectable'
  | 'Any';

export type VerifiedMedicineRecord = {
  id: string;
  barcode?: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  activeIngredients: {
    name: string;
    wadaStatus: AntiDopingStatus;
    wadaClass?: string;
    thresholdNotes?: string;
  }[];
  dosageForm: string;
  route: AdministrationRoute;
  overallStatus: AntiDopingStatus;
  wadaClass?: string;
  inCompetitionStatus: AntiDopingStatus;
  outOfCompetitionStatus: AntiDopingStatus;
  tueRequired: boolean;
  tueGuidance?: string;
  officialGuidance: string;
  medicalDisclaimer: string;
  source: 'WADA Prohibited List' | 'Global DRO' | 'NADA India' | 'FDA/CDSCO Approved Reference';
  countryMarket: string;
  lastVerifiedDate: string;
  searchAliases: string[];
};

export type MedicineScanResult = {
  matchedRecord: VerifiedMedicineRecord | null;
  rawQuery: string;
  queryType: 'BARCODE' | 'NAME' | 'INGREDIENT';
  status: AntiDopingStatus;
  title: string;
  guidance: string;
  activeIngredients: string[];
  disclaimer: string;
  isVerified: boolean;
  source?: string;
  lastVerified?: string;
};

export type SavedMedicineItem = {
  id: string;
  drugName: string;
  barcode?: string;
  status: AntiDopingStatus;
  guidance: string;
  activeIngredients: string[];
  scannedAt: string;
};
