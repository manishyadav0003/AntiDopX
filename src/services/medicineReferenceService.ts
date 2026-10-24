import type {
  AntiDopingStatus,
  MedicineScanResult,
  VerifiedMedicineRecord,
} from '../types/medicine';

export const TRUSTED_MEDICINE_DATABASE: VerifiedMedicineRecord[] = [
  {
    id: 'med-paracetamol-500',
    barcode: '8901234567890',
    brandName: 'Crocin 500 / Calpol',
    genericName: 'Paracetamol / Acetaminophen',
    manufacturer: 'GSK Pharmaceuticals',
    activeIngredients: [
      {
        name: 'Paracetamol',
        wadaStatus: 'ALLOWED',
        thresholdNotes: 'Permitted in- and out-of-competition within standard medical dosages.',
      },
    ],
    dosageForm: 'Tablet (500mg)',
    route: 'Oral',
    overallStatus: 'ALLOWED',
    inCompetitionStatus: 'ALLOWED',
    outOfCompetitionStatus: 'ALLOWED',
    tueRequired: false,
    officialGuidance:
      'Paracetamol is permitted at all times under the WADA Prohibited List. However, always ensure combination products (e.g. cold & flu formulations) do not contain hidden decongestants or stimulants.',
    medicalDisclaimer:
      'This guidance applies strictly to pure Paracetamol. Multi-symptom cold syrups often add prohibited ingredients like Pseudoephedrine. Always verify combination products before use.',
    source: 'WADA Prohibited List',
    countryMarket: 'India / Global',
    lastVerifiedDate: '2026-01-01',
    searchAliases: ['paracetamol', 'crocin', 'calpol', 'dolo', 'dolo 650', 'tylenol', 'acetaminophen', 'panadol'],
  },
  {
    id: 'med-dolo-650',
    barcode: '8901148210355',
    brandName: 'Dolo 650',
    genericName: 'Paracetamol 650mg',
    manufacturer: 'Micro Labs Ltd',
    activeIngredients: [
      {
        name: 'Paracetamol',
        wadaStatus: 'ALLOWED',
        thresholdNotes: 'Standard oral antipyretic / analgesic. No anti-doping restriction.',
      },
    ],
    dosageForm: 'Tablet (650mg)',
    route: 'Oral',
    overallStatus: 'ALLOWED',
    inCompetitionStatus: 'ALLOWED',
    outOfCompetitionStatus: 'ALLOWED',
    tueRequired: false,
    officialGuidance:
      'Permitted at all times. Pure paracetamol does not trigger anti-doping violations.',
    medicalDisclaimer:
      'Follow medical instructions and recommended daily maximum dosages (do not exceed 4000mg/24h to avoid severe liver toxicity).',
    source: 'WADA Prohibited List',
    countryMarket: 'India',
    lastVerifiedDate: '2026-01-01',
    searchAliases: ['dolo 650', 'dolo', 'paracetamol 650'],
  },
  {
    id: 'med-ibuprofen-400',
    barcode: '8901234567893',
    brandName: 'Brufen 400 / Advil',
    genericName: 'Ibuprofen',
    manufacturer: 'Abbott Healthcare',
    activeIngredients: [
      {
        name: 'Ibuprofen',
        wadaStatus: 'ALLOWED',
        thresholdNotes: 'Non-steroidal anti-inflammatory drug (NSAID). Permitted in sport.',
      },
    ],
    dosageForm: 'Film-coated tablet (400mg)',
    route: 'Oral',
    overallStatus: 'ALLOWED',
    inCompetitionStatus: 'ALLOWED',
    outOfCompetitionStatus: 'ALLOWED',
    tueRequired: false,
    officialGuidance:
      'Ibuprofen is permitted under current WADA rules. Use only as medically indicated to avoid gastrointestinal ulceration and kidney stress during dehydration.',
    medicalDisclaimer:
      'Permitted, but excessive chronic use during strenuous endurance exercise carries physiological risks. Consult team physician.',
    source: 'WADA Prohibited List',
    countryMarket: 'India / Global',
    lastVerifiedDate: '2026-01-01',
    searchAliases: ['ibuprofen', 'brufen', 'advil', 'motrin', 'brufen 400'],
  },
  {
    id: 'med-ventolin-inhaler',
    barcode: '8901234567891',
    brandName: 'Ventolin Evohaler',
    genericName: 'Salbutamol Sulfate',
    manufacturer: 'GlaxoSmithKline',
    activeIngredients: [
      {
        name: 'Salbutamol',
        wadaStatus: 'USE_WITH_CAUTION',
        wadaClass: 'S3. Beta-2 Agonists',
        thresholdNotes:
          'Inhaled salbutamol: maximum 1600 micrograms over 24 hours in divided doses, not to exceed 600 micrograms over any 8-hour period starting from any dose. Oral ingestion is PROHIBITED.',
      },
    ],
    dosageForm: 'Metered Dose Inhaler (100mcg/puff)',
    route: 'Inhalation',
    overallStatus: 'USE_WITH_CAUTION',
    wadaClass: 'S3: Beta-2 Agonists',
    inCompetitionStatus: 'USE_WITH_CAUTION',
    outOfCompetitionStatus: 'USE_WITH_CAUTION',
    tueRequired: false,
    tueGuidance:
      'A TUE is required ONLY if medical condition requires exceeding the maximum permitted threshold (1600 mcg/24h or oral administration).',
    officialGuidance:
      'Permitted by inhalation only within strict dose limits (max 16 puffs/24h, max 6 puffs in any 8h window). A urinary concentration exceeding 1000 ng/mL is an Adverse Analytical Finding unless proven by pharmacokinetic study.',
    medicalDisclaimer:
      'Athletes using asthma inhalers must strictly count puffs. Do not exceed 6 puffs in an 8-hour period. Oral tablets or syrups of Salbutamol are strictly PROHIBITED.',
    source: 'WADA Prohibited List',
    countryMarket: 'India / UK / Global',
    lastVerifiedDate: '2026-01-01',
    searchAliases: ['ventolin', 'salbutamol', 'asthelin', 'albuterol', 'inhaler'],
  },
  {
    id: 'med-sudafed-pseudoephedrine',
    barcode: '8901234567894',
    brandName: 'Sudafed Decongestant',
    genericName: 'Pseudoephedrine Hydrochloride',
    manufacturer: 'Johnson & Johnson',
    activeIngredients: [
      {
        name: 'Pseudoephedrine',
        wadaStatus: 'USE_WITH_CAUTION',
        wadaClass: 'S6. Stimulants',
        thresholdNotes:
          'PROHIBITED In-Competition when urinary concentration exceeds 150 micrograms per milliliter. Permitted Out-of-Competition.',
      },
    ],
    dosageForm: 'Oral Tablet (60mg)',
    route: 'Oral',
    overallStatus: 'USE_WITH_CAUTION',
    wadaClass: 'S6: Specified Stimulants',
    inCompetitionStatus: 'PROHIBITED',
    outOfCompetitionStatus: 'ALLOWED',
    tueRequired: true,
    tueGuidance:
      'If needed in-competition for acute rhinovirus/sinusitis, a TUE is required unless an alternative non-prohibited decongestant is chosen.',
    officialGuidance:
      'PROHIBITED IN-COMPETITION above 150 mcg/mL urinary threshold. The clearance washout period is at least 24 hours after the last dose before competition begins.',
    medicalDisclaimer:
      'Commonly found in cold & sinus formulas. Stop using at least 24 to 48 hours prior to any in-competition testing window.',
    source: 'Global DRO',
    countryMarket: 'Global',
    lastVerifiedDate: '2026-01-01',
    searchAliases: ['pseudoephedrine', 'sudafed', 'sinarest', 'cold medicine', 'decongestant'],
  },
  {
    id: 'med-clenbuterol',
    barcode: '8901234567892',
    brandName: 'Spiropent / Clenbuterol',
    genericName: 'Clenbuterol Hydrochloride',
    manufacturer: 'Boehringer Ingelheim',
    activeIngredients: [
      {
        name: 'Clenbuterol',
        wadaStatus: 'PROHIBITED',
        wadaClass: 'S1.2 Other Anabolic Agents',
        thresholdNotes: 'Strictly prohibited at all times (in- and out-of-competition) with zero tolerance.',
      },
    ],
    dosageForm: 'Oral tablet (0.02mg)',
    route: 'Oral',
    overallStatus: 'PROHIBITED',
    wadaClass: 'S1: Anabolic Agents',
    inCompetitionStatus: 'PROHIBITED',
    outOfCompetitionStatus: 'PROHIBITED',
    tueRequired: true,
    tueGuidance: 'Extremely rare for athletic TUE approval. Approved almost exclusively in veterinary medicine.',
    officialGuidance:
      'STRICTLY PROHIBITED AT ALL TIMES. Anabolic agent that stimulates beta-2 receptors and promotes muscle hypertrophy. Zero tolerance detection limit in anti-doping laboratories.',
    medicalDisclaimer:
      'Severe health hazard: causes myocardial hypertrophy, dangerous tachycardias, hypokalemia, and cardiac arrest. Athletes must never consume this product.',
    source: 'WADA Prohibited List',
    countryMarket: 'Global',
    lastVerifiedDate: '2026-01-01',
    searchAliases: ['clenbuterol', 'spiropent', 'clen'],
  },
  {
    id: 'med-stanozolol-winstrol',
    barcode: '8901234567895',
    brandName: 'Winstrol / Stanozolol',
    genericName: 'Stanozolol',
    manufacturer: 'Winthrop Laboratories',
    activeIngredients: [
      {
        name: 'Stanozolol',
        wadaStatus: 'PROHIBITED',
        wadaClass: 'S1.1a Exogenous Anabolic Androgenic Steroids',
      },
    ],
    dosageForm: 'Injectable / Oral Tablet',
    route: 'Injectable',
    overallStatus: 'PROHIBITED',
    wadaClass: 'S1: Anabolic Steroids',
    inCompetitionStatus: 'PROHIBITED',
    outOfCompetitionStatus: 'PROHIBITED',
    tueRequired: false,
    officialGuidance:
      'STRICTLY PROHIBITED AT ALL TIMES. Synthetic derivative of dihydrotestosterone. Carries severe mandatory multi-year anti-doping sanctions.',
    medicalDisclaimer:
      'Causes irreversible hepatic toxicity, severe dyslipidemia, endocrine suppression, and severe cardiovascular morbidity.',
    source: 'WADA Prohibited List',
    countryMarket: 'Global',
    lastVerifiedDate: '2026-01-01',
    searchAliases: ['stanozolol', 'winstrol', 'stanazol'],
  },
  {
    id: 'med-lasix-furosemide',
    barcode: '8901234567896',
    brandName: 'Lasix',
    genericName: 'Furosemide',
    manufacturer: 'Sanofi India',
    activeIngredients: [
      {
        name: 'Furosemide',
        wadaStatus: 'PROHIBITED',
        wadaClass: 'S5. Diuretics and Masking Agents',
      },
    ],
    dosageForm: 'Oral tablet (40mg)',
    route: 'Oral',
    overallStatus: 'PROHIBITED',
    wadaClass: 'S5: Diuretics and Masking Agents',
    inCompetitionStatus: 'PROHIBITED',
    outOfCompetitionStatus: 'PROHIBITED',
    tueRequired: true,
    officialGuidance:
      'PROHIBITED AT ALL TIMES. Diuretics flush out water for rapid weight-cutting (e.g. wrestling/boxing) and dilute urine to mask presence of other banned substances.',
    medicalDisclaimer:
      'Never take water pills or diuretics to make weight before competition. Even with a medical prescription, a TUE is required in advance.',
    source: 'WADA Prohibited List',
    countryMarket: 'India / Global',
    lastVerifiedDate: '2026-01-01',
    searchAliases: ['lasix', 'furosemide', 'water pill', 'diuretic'],
  },
  {
    id: 'med-amoxicillin-500',
    barcode: '8901234567897',
    brandName: 'Augmentin / Mox 500',
    genericName: 'Amoxicillin',
    manufacturer: 'Ranbaxy / Sun Pharma',
    activeIngredients: [
      {
        name: 'Amoxicillin',
        wadaStatus: 'ALLOWED',
      },
    ],
    dosageForm: 'Capsule (500mg)',
    route: 'Oral',
    overallStatus: 'ALLOWED',
    inCompetitionStatus: 'ALLOWED',
    outOfCompetitionStatus: 'ALLOWED',
    tueRequired: false,
    officialGuidance:
      'Antibiotics like Amoxicillin are permitted in sport. They do not enhance athletic performance.',
    medicalDisclaimer:
      'Permitted in sport. Take only as prescribed by a licensed physician to treat bacterial infections.',
    source: 'WADA Prohibited List',
    countryMarket: 'India / Global',
    lastVerifiedDate: '2026-01-01',
    searchAliases: ['amoxicillin', 'augmentin', 'mox 500', 'antibiotic'],
  },
  {
    id: 'med-cetirizine-10',
    barcode: '8901234567898',
    brandName: 'Cetzine / Zyrtec',
    genericName: 'Cetirizine Hydrochloride',
    manufacturer: 'Dr. Reddy Laboratories',
    activeIngredients: [
      {
        name: 'Cetirizine',
        wadaStatus: 'ALLOWED',
      },
    ],
    dosageForm: 'Oral tablet (10mg)',
    route: 'Oral',
    overallStatus: 'ALLOWED',
    inCompetitionStatus: 'ALLOWED',
    outOfCompetitionStatus: 'ALLOWED',
    tueRequired: false,
    officialGuidance:
      'Antihistamines for allergies like pure cetirizine are permitted at all times.',
    medicalDisclaimer:
      'Be cautious of combination allergy pills with names like "Cetzine-D" which combine cetirizine with pseudoephedrine (a restricted stimulant).',
    source: 'WADA Prohibited List',
    countryMarket: 'India / Global',
    lastVerifiedDate: '2026-01-01',
    searchAliases: ['cetirizine', 'cetzine', 'zyrtec', 'allergy pill'],
  },
];

const normalizeText = (text: string): string => {
  return text.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const lookupMedicineByBarcode = (
  barcode: string
): MedicineScanResult => {
  const cleanBarcode = barcode.trim();
  const matched = TRUSTED_MEDICINE_DATABASE.find(
    (item) => item.barcode && item.barcode.trim() === cleanBarcode
  );

  if (matched) {
    return {
      matchedRecord: matched,
      rawQuery: barcode,
      queryType: 'BARCODE',
      status: matched.overallStatus,
      title: `${matched.brandName} (${matched.genericName})`,
      guidance: matched.officialGuidance,
      activeIngredients: matched.activeIngredients.map((i) => `${i.name} [${i.wadaStatus}]`),
      disclaimer: matched.medicalDisclaimer,
      isVerified: true,
      source: matched.source,
      lastVerified: matched.lastVerifiedDate,
    };
  }

  return {
    matchedRecord: null,
    rawQuery: barcode,
    queryType: 'BARCODE',
    status: 'UNKNOWN',
    title: `Barcode ${barcode}`,
    guidance:
      'No verified reference entry was found for this specific barcode in the AntiDopX database. Do not assume the medicine is safe.',
    activeIngredients: [],
    disclaimer:
      'IMPORTANT: Lack of a barcode match does NOT mean a medication is permitted. Check the physical packaging label, extract the active generic ingredients, and search by ingredient name or consult Global DRO.',
    isVerified: false,
  };
};

export const searchMedicinesByNameOrIngredient = (
  queryText: string
): MedicineScanResult[] => {
  const cleanQuery = queryText.trim().toLowerCase();
  if (cleanQuery.length < 2) return [];

  const normalizedQuery = normalizeText(cleanQuery);

  const results = TRUSTED_MEDICINE_DATABASE.filter((item) => {
    // Check brand name or generic name
    if (item.brandName.toLowerCase().includes(cleanQuery)) return true;
    if (item.genericName.toLowerCase().includes(cleanQuery)) return true;

    // Check active ingredients
    if (item.activeIngredients.some((i) => i.name.toLowerCase().includes(cleanQuery))) {
      return true;
    }

    // Check aliases
    if (item.searchAliases.some((alias) => normalizeText(alias).includes(normalizedQuery))) {
      return true;
    }

    return false;
  });

  return results.map((item) => ({
    matchedRecord: item,
    rawQuery: queryText,
    queryType: 'NAME',
    status: item.overallStatus,
    title: `${item.brandName} (${item.genericName})`,
    guidance: item.officialGuidance,
    activeIngredients: item.activeIngredients.map((i) => `${i.name} [${i.wadaStatus}]`),
    disclaimer: item.medicalDisclaimer,
    isVerified: true,
    source: item.source,
    lastVerified: item.lastVerifiedDate,
  }));
};
