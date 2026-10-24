import type {
  InteractiveQuizQuestion,
  LearningModuleDefinition,
  LessonSection,
  ModuleKey,
  ModuleSlug,
} from '../types/learning';

export type {
  InteractiveQuizQuestion,
  LearningModuleDefinition,
  LessonSection,
  ModuleKey,
  ModuleSlug,
};

// Aliases for backward compatibility
export type LearningModule = LearningModuleDefinition;

export const learningModulesBySlug: Record<ModuleSlug, LearningModuleDefinition> = {
  'anti-doping-basics': {
    slug: 'anti-doping-basics',
    moduleKey: 'antiDopingBasics',
    route: '/modules/anti-doping-basics',
    title: 'Anti-Doping Fundamentals',
    shortTitle: 'Fundamentals',
    category: 'Fundamentals',
    xpReward: 30,
    badgeKey: 'firstModule',
    sections: [
      {
        title: 'What is Doping in Modern Sport?',
        content: [
          'Doping is defined by WADA as the occurrence of one or more Anti-Doping Rule Violations (ADRVs). It is not limited to testing positive for a banned substance; it also includes refusing a test, tampering with samples, possession, and trafficking.',
          'The fundamental purpose of anti-doping programs is to safeguard the athlete intrinsic value of sport — celebrated as the "spirit of sport" — while protecting the health of athletes worldwide.',
        ],
        keyTakeaway: 'Doping includes 11 specific rule violations under the World Anti-Doping Code, not just a positive laboratory test.',
        proTip: 'Always remember: anti-doping rules exist to protect clean competitors, not to trap honest athletes who ask questions.',
      },
      {
        title: 'The Golden Principle of Strict Liability',
        content: [
          'Strict liability is the cornerstone of the World Anti-Doping Code. It means that an athlete is strictly responsible for any prohibited substance found in their body specimen.',
          'It does not matter whether the substance entered intentionally, accidentally, or through negligence (such as a friend giving you a headache pill or an unlabeled drink). The presence of the substance itself constitutes a violation.',
        ],
        keyTakeaway: 'Under strict liability: You are 100% responsible for whatever enters your body.',
        proTip: 'Never accept open water bottles, decanted drink powders, or unverified home remedies at sports competitions.',
      },
      {
        title: 'The Athlete Clean Sport Mindset',
        content: [
          'Clean sport is a daily lifestyle choice. It involves checking all over-the-counter medications, consulting certified team medical staff, and verifying supplements before intake.',
          'When in doubt, stop and check before consuming. A few minutes of verification can protect years of hard training and athletic achievement.',
        ],
        keyTakeaway: 'Always verify before you consume.',
        proTip: 'Keep a digital photo log of every prescription and medicine packaging you receive.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'basics-1',
          moduleKey: 'antiDopingBasics',
          question: 'What is the main goal of anti-doping rules?',
          type: 'multiple_choice',
          difficulty: 'easy',
          options: [
            'To protect clean sport and athlete health',
            'To prevent athletes from training at peak intensity',
            'To replace sports governing bodies during matches',
            'To restrict athletes from receiving medical care',
          ],
          correctOptionIndex: 0,
          explanation: 'Anti-doping rules are designed to protect athlete health, fairness, and the intrinsic spirit of sport.',
        },
        {
          id: 'basics-2',
          moduleKey: 'antiDopingBasics',
          question: 'Under the principle of Strict Liability, who is responsible for substances in an athlete sample?',
          type: 'multiple_choice',
          difficulty: 'easy',
          options: [
            'Only the head coach',
            'The supplement store clerk',
            'The athlete themselves',
            'The event organizer',
          ],
          correctOptionIndex: 2,
          explanation: 'Strict liability dictates that each athlete is solely and strictly responsible for any substance found in their sample.',
        },
        {
          id: 'basics-3',
          moduleKey: 'antiDopingBasics',
          question: 'Does doping only mean testing positive for a banned chemical?',
          type: 'true_false',
          difficulty: 'medium',
          options: [
            'True: Only lab results count',
            'False: Doping includes 11 Anti-Doping Rule Violations like refusal and whereabouts failures',
          ],
          correctOptionIndex: 1,
          explanation: 'Doping encompasses 11 distinct violations, including tampering, refusal, possession, and complicity.',
        },
        {
          id: 'basics-4',
          moduleKey: 'antiDopingBasics',
          question: 'Scenario: Your gym buddy offers you an unlabeled pre-workout shaker. What is the safest action?',
          type: 'scenario',
          difficulty: 'medium',
          options: [
            'Drink it quickly so nobody notices',
            'Politely decline and only drink from your own sealed container',
            'Taste a little bit first to check',
            'Rely on your buddy promise that it is clean',
          ],
          correctOptionIndex: 1,
          explanation: 'Never consume unlabeled or shared drinks. Under strict liability, you carry the consequences if it is contaminated.',
        },
      ],
    },
  },

  'wada-rules': {
    slug: 'wada-rules',
    moduleKey: 'wadaRules',
    route: '/modules/wada-rules',
    title: 'WADA Code & 11 Violations',
    shortTitle: 'WADA Code',
    category: 'Regulations',
    xpReward: 30,
    sections: [
      {
        title: 'What is WADA and the Code?',
        content: [
          'The World Anti-Doping Agency (WADA) was established in 1999 to harmonize anti-doping policies across all sports and countries.',
          'The World Anti-Doping Code is the core universal document that synchronizes rules, testing procedures, and sanctions across International Federations (IFs) and National Anti-Doping Organizations (NADOs like NADA India, USADA, UKAD).',
        ],
        keyTakeaway: 'The Code ensures equal rules for athletes regardless of country or sport.',
      },
      {
        title: 'The 11 Anti-Doping Rule Violations (ADRVs)',
        content: [
          'Under the Code, violations include: 1. Presence of a prohibited substance; 2. Use or attempted use; 3. Evading, refusing, or failing to submit to sample collection; 4. Whereabouts failures (3 missed tests or filing failures in 12 months); 5. Tampering or attempted tampering.',
          'Additional violations include: 6. Possession; 7. Trafficking; 8. Administration or attempted administration to an athlete; 9. Complicity or attempted complicity; 10. Prohibited Association; and 11. Acts by an athlete to discourage or retaliate against reporting.',
        ],
        keyTakeaway: 'Support personnel (coaches, doctors) can also be sanctioned under the Code.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'wada-1',
          moduleKey: 'wadaRules',
          question: 'What is the primary document harmonizing anti-doping rules globally?',
          type: 'multiple_choice',
          difficulty: 'easy',
          options: [
            'The World Anti-Doping Code',
            'The Olympic Medal Standings',
            'The International Olympic Charter only',
            'The Global Supplement Registry',
          ],
          correctOptionIndex: 0,
          explanation: 'The World Anti-Doping Code is the universal document establishing consistent anti-doping standards.',
        },
        {
          id: 'wada-2',
          moduleKey: 'wadaRules',
          question: 'How many whereabouts failures within a 12-month period constitute an anti-doping violation?',
          type: 'multiple_choice',
          difficulty: 'medium',
          options: ['1 failure', '2 failures', '3 failures', '5 failures'],
          correctOptionIndex: 2,
          explanation: 'Any combination of 3 missed tests or filing failures within a 12-month window constitutes an ADRV.',
        },
        {
          id: 'wada-3',
          moduleKey: 'wadaRules',
          question: 'Can a coach or doctor be banned under the WADA Code?',
          type: 'true_false',
          difficulty: 'easy',
          options: [
            'Yes: Athlete support personnel can be sanctioned for trafficking, administration, or complicity',
            'No: Only athletes can be investigated and banned',
          ],
          correctOptionIndex: 0,
          explanation: 'Support personnel are subject to the Code and face severe sanctions for facilitating doping.',
        },
      ],
    },
  },

  'testing-procedures': {
    slug: 'testing-procedures',
    moduleKey: 'testingProcedures',
    route: '/modules/testing-procedures',
    title: 'Testing Procedures & Protocol',
    shortTitle: 'Testing Protocol',
    category: 'Regulations',
    xpReward: 35,
    sections: [
      {
        title: 'Notification & Continuous Chaperoning',
        content: [
          'Doping control can occur In-Competition or Out-of-Competition (anywhere, anytime, with no advance notice).',
          'A certified Doping Control Officer (DCO) or Chaperone notifies you and shows identification. From this exact second until sample collection is sealed, you must remain in continuous visual observation.',
        ],
        keyTakeaway: 'Never leave the chaperone sight after notification without explicit permission.',
      },
      {
        title: 'Sample Collection Step-by-Step',
        content: [
          '1. Selection: You select a sealed collection kit yourself (nobody chooses it for you). Check that packaging is intact.',
          '2. Provision: You provide a urine sample in private while the DCO of the same gender directly observes sample exit.',
          '3. Splitting & Sealing: You divide the sample into Bottle A and Bottle B, seal them tightly until they click, and check the bottle security codes match the box codes.',
          '4. Paperwork: Verify every code on the Doping Control Form (DCF), declare any medications taken in the past 7 days, note comments or irregularities, and sign.',
        ],
        keyTakeaway: 'Always verify that code numbers on the bottles match the codes on your form.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'test-1',
          moduleKey: 'testingProcedures',
          question: 'Who must select the sealed sample collection vessel kit?',
          type: 'multiple_choice',
          difficulty: 'easy',
          options: [
            'The athlete personally',
            'The DCO without athlete involvement',
            'The athlete coach',
            'The event referee',
          ],
          correctOptionIndex: 0,
          explanation: 'The athlete must always personally inspect and choose their own collection kit.',
        },
        {
          id: 'test-2',
          moduleKey: 'testingProcedures',
          question: 'If you believe there was an irregularity during sample collection, what should you do?',
          type: 'multiple_choice',
          difficulty: 'medium',
          options: [
            'Record your comments directly in the remarks section of the Doping Control Form before signing',
            'Refuse to sign and run away',
            'Post immediately on social media instead of telling the DCO',
            'Ignore it because officials never make mistakes',
          ],
          correctOptionIndex: 0,
          explanation: 'Athletes have the explicit right to document any procedural concerns on the official form before signing.',
        },
      ],
    },
  },

  tue: {
    slug: 'tue',
    moduleKey: 'tue',
    route: '/modules/tue',
    title: 'Therapeutic Use Exemptions',
    shortTitle: 'TUE',
    category: 'Health & Safety',
    xpReward: 35,
    sections: [
      {
        title: 'What is a Therapeutic Use Exemption (TUE)?',
        content: [
          'Athletes, like all human beings, get sick or have medical conditions requiring medication. If a necessary medication appears on the WADA Prohibited List, a TUE grants official medical permission to use it.',
          'A doctor prescription is NOT a TUE. You must receive written approval from your NADO or International Federation TUE Committee BEFORE taking the substance (except in documented medical emergencies).',
        ],
        keyTakeaway: 'A prescription is not enough — formal TUE approval is required before competition.',
      },
      {
        title: 'Criteria for TUE Approval',
        content: [
          'Four criteria must be met: 1. Athlete health would significantly worsen without the medication; 2. The substance will not produce significant performance enhancement beyond returning to normal health; 3. No reasonable permitted alternative exists; 4. The condition is not a consequence of prior non-approved substance use.',
        ],
        keyTakeaway: 'Full diagnostic medical documentation and doctor notes must accompany every TUE application.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'tue-1',
          moduleKey: 'tue',
          question: 'Is having a doctor prescription legally sufficient to take a banned medication in sport?',
          type: 'multiple_choice',
          difficulty: 'easy',
          options: [
            'No: You must apply for and receive an approved TUE from anti-doping authorities',
            'Yes: Any pharmacy slip automatically exempts athletes',
            'Only if the doctor is an Olympic physician',
            'Only during winter competitions',
          ],
          correctOptionIndex: 0,
          explanation: 'A prescription does not override anti-doping rules; an official TUE is legally mandatory.',
        },
        {
          id: 'tue-2',
          moduleKey: 'tue',
          question: 'When should an athlete apply for a planned TUE for a chronic medical condition?',
          type: 'multiple_choice',
          difficulty: 'medium',
          options: [
            'Well before competition (usually at least 30 days prior)',
            'Only after winning the tournament final',
            'Only after receiving a positive test notification',
            'At the weigh-in ceremony',
          ],
          correctOptionIndex: 0,
          explanation: 'Planned TUE applications must be submitted well in advance (typically 30 days prior) to allow thorough review.',
        },
      ],
    },
  },

  supplements: {
    slug: 'supplements',
    moduleKey: 'supplements',
    route: '/modules/supplements',
    title: 'Supplements & Contamination',
    shortTitle: 'Supplements',
    category: 'Health & Safety',
    xpReward: 35,
    sections: [
      {
        title: 'The Reality of Supplement Contamination',
        content: [
          'Dietary supplements are NOT regulated like prescription pharmaceuticals in most countries. Studies show that between 10% and 25% of commercial sports supplements contain unlisted or prohibited substances.',
          'Cross-contamination occurs during manufacturing when equipment is used for multiple products, and unscrupulous manufacturers sometimes lace products with steroids or stimulants to boost perceived potency.',
        ],
        keyTakeaway: 'The supplement industry does not guarantee zero risk. "All Natural" does not mean clean.',
      },
      {
        title: 'Food-First Strategy & Third-Party Batch Testing',
        content: [
          'Adopt a "Food-First" nutrition approach: real nutrient-dense food supplies carbohydrates, amino acids, vitamins, and minerals with zero doping risk.',
          'If a certified sports dietitian recommends a supplement, only use products verified by reputable third-party batch-testing programs (such as Informed Sport, NSF Certified for Sport, or Cologne List). Always retain the physical container, batch number, and purchase receipt.',
        ],
        keyTakeaway: 'Third-party testing minimizes risk, but can never reduce risk to absolute zero.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'supp-1',
          moduleKey: 'supplements',
          question: 'Why are dietary supplements a major cause of inadvertent doping violations?',
          type: 'multiple_choice',
          difficulty: 'easy',
          options: [
            'They may be contaminated or contain unlisted banned ingredients',
            'They are always illegal to purchase in pharmacies',
            'They show up on blood pressure tests',
            'They expire quickly in gym bags',
          ],
          correctOptionIndex: 0,
          explanation: 'Manufacturing contamination and deceptive labeling make supplements inherently risky for competitive athletes.',
        },
        {
          id: 'supp-2',
          moduleKey: 'supplements',
          question: 'What is the best risk-reduction practice if an athlete must take a nutritional supplement?',
          type: 'multiple_choice',
          difficulty: 'medium',
          options: [
            'Choose third-party batch-tested products (e.g. Informed Sport) and archive the batch receipt',
            'Buy whatever is cheapest online',
            'Trust social media fitness influencers',
            'Take twice the recommended dose to dilute impurities',
          ],
          correctOptionIndex: 0,
          explanation: 'Third-party batch testing and retaining batch records provides the highest level of risk mitigation.',
        },
      ],
    },
  },

  'prohibited-substances': {
    slug: 'prohibited-substances',
    moduleKey: 'prohibitedSubstances',
    route: '/modules/prohibited-substances',
    title: 'Prohibited Substances List',
    shortTitle: 'Banned Substances',
    category: 'Regulations',
    xpReward: 40,
    sections: [
      {
        title: 'How a Substance Becomes Prohibited',
        content: [
          'A substance or method is placed on WADA Prohibited List if it meets at least two of three criteria: 1. It has potential to enhance sports performance; 2. It represents an actual or potential health risk to the athlete; 3. It violates the spirit of sport.',
          'The Prohibited List is updated every year and comes into official effect on January 1st.',
        ],
        keyTakeaway: 'The Prohibited List is updated annually on January 1. Review changes before the new year starts.',
      },
      {
        title: 'Major Substance Classes (S0 to S9)',
        content: [
          'S0: Non-approved substances (experimental drugs)',
          'S1: Anabolic Agents (e.g. testosterone, stanozolol, nandrolone) — banned at ALL times',
          'S2: Peptide hormones & growth factors (e.g. EPO, hGH) — banned at ALL times',
          'S3: Beta-2 Agonists (e.g. asthma drugs above specified inhalation thresholds)',
          'S4: Hormone & metabolic modulators (e.g. aromatase inhibitors, insulin, meldonium)',
          'S5: Diuretics & masking agents (e.g. furosemide) — banned at ALL times',
          'S6: Stimulants (e.g. amphetamines, pseudoephedrine above threshold) — banned In-Competition',
          'S7: Narcotics (e.g. morphine, oxycodone, tramadol)',
          'S8: Cannabinoids (THC)',
          'S9: Glucocorticoids (oral, injectable, rectal administration banned In-Competition)',
        ],
        keyTakeaway: 'Some substances are banned at all times (In- and Out-of-Competition), while others are prohibited only In-Competition.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'sub-1',
          moduleKey: 'prohibitedSubstances',
          question: 'How many of WADA 3 criteria must be met for a substance to be banned?',
          type: 'multiple_choice',
          difficulty: 'medium',
          options: ['At least 2 out of 3', 'All 3 must always be met', 'Only 1 is sufficient', 'None, it is voted by fans'],
          correctOptionIndex: 0,
          explanation: 'Meeting 2 out of 3 criteria (Performance Enhancement, Health Risk, Spirit of Sport) qualifies a substance for prohibition.',
        },
        {
          id: 'sub-2',
          moduleKey: 'prohibitedSubstances',
          question: 'Are Anabolic Steroids and Diuretics prohibited only during competitions?',
          type: 'true_false',
          difficulty: 'easy',
          options: [
            'False: They are prohibited at ALL times, both in-competition and out-of-competition',
            'True: They are allowed during off-season training',
          ],
          correctOptionIndex: 0,
          explanation: 'Substances like anabolic agents and diuretics are banned at all times without exception.',
        },
      ],
    },
  },

  'prohibited-methods': {
    slug: 'prohibited-methods',
    moduleKey: 'prohibitedMethods',
    route: '/modules/prohibited-methods',
    title: 'Prohibited Methods in Sport',
    shortTitle: 'Banned Methods',
    category: 'Regulations',
    xpReward: 35,
    sections: [
      {
        title: 'M1: Manipulation of Blood and Blood Components',
        content: [
          'Blood doping involves the administration of autologous (your own), homologous (another person), or heterologous red blood cells to enhance oxygen delivery.',
          'Artificially enhancing oxygen uptake, transport, or delivery using modified hemoglobin or perfluorochemicals is strictly banned.',
        ],
        keyTakeaway: 'Blood transfusions and synthetic oxygen carriers are strictly prohibited at all times.',
      },
      {
        title: 'M2: Chemical and Physical Manipulation',
        content: [
          'Tampering or attempting to alter the integrity of collection samples is an anti-doping rule violation (e.g. catheterization, urine substitution, altering bottle security).',
          'Intravenous infusions and/or injections of more than 100 mL per 12-hour period are prohibited, except for treatments legitimately received during hospital treatments, surgical procedures, or clinical investigations.',
        ],
        keyTakeaway: 'IV drips exceeding 100 mL per 12 hours require legitimate clinical hospital indication or a TUE.',
      },
      {
        title: 'M3: Gene and Cell Doping',
        content: [
          'The use of nucleic acids, gene-editing agents (e.g. CRISPR), or normal/genetically modified cells with the potential to enhance athletic performance is completely prohibited.',
        ],
        keyTakeaway: 'Gene manipulation for athletic enhancement is dangerous, unethical, and prohibited.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'meth-1',
          moduleKey: 'prohibitedMethods',
          question: 'What is the standard WADA limit for intravenous (IV) infusions outside hospital admissions?',
          type: 'multiple_choice',
          difficulty: 'medium',
          options: [
            'Maximum 100 mL per 12-hour period',
            'Up to 1 liter per day',
            'Any amount as long as it is only saline water',
            'Unlimited if prescribed by a local gym coach',
          ],
          correctOptionIndex: 0,
          explanation: 'IV infusions over 100 mL per 12-hour interval are prohibited unless received during hospital admissions or clinical surgeries.',
        },
      ],
    },
  },

  'doping-control-process': {
    slug: 'doping-control-process',
    moduleKey: 'dopingControlProcess',
    route: '/modules/doping-control-process',
    title: 'Doping Control End-to-End',
    shortTitle: 'Doping Control',
    category: 'Regulations',
    xpReward: 35,
    sections: [
      {
        title: 'Chain of Custody and Lab Analysis',
        content: [
          'Once sealed, your A and B sample bottles are packaged in tamper-evident transit containers and dispatched to a WADA-accredited laboratory.',
          'The laboratory only receives anonymous barcode numbers. They have zero information on athlete identity, name, or country.',
        ],
        keyTakeaway: 'Laboratory testing is double-blind and completely anonymized via barcode codes.',
      },
      {
        title: 'B-Sample Confirmation Rights',
        content: [
          'Sample A is analyzed first. If an Adverse Analytical Finding (AAF) is detected, the athlete is notified immediately.',
          'The athlete has the legal right to request the opening and analysis of their B Sample, and may attend the laboratory opening in person or with a representative.',
        ],
        keyTakeaway: 'The B Sample acts as your scientific guarantee and verification shield.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'proc-1',
          moduleKey: 'dopingControlProcess',
          question: 'Does the testing laboratory know the athlete name or nationality when analyzing samples?',
          type: 'true_false',
          difficulty: 'easy',
          options: [
            'False: Laboratories receive only anonymized security barcode numbers',
            'True: Athlete identity is printed on the specimen tubes',
          ],
          correctOptionIndex: 0,
          explanation: 'Strict anonymization ensures impartial, unbiased scientific analysis.',
        },
      ],
    },
  },

  'athlete-rights-responsibilities': {
    slug: 'athlete-rights-responsibilities',
    moduleKey: 'athleteRightsResponsibilities',
    route: '/modules/athlete-rights-responsibilities',
    title: 'Athlete Rights & Duties',
    shortTitle: 'Rights & Duties',
    category: 'Fundamentals',
    xpReward: 30,
    sections: [
      {
        title: 'Your Fundamental Rights',
        content: [
          '1. Right to have a representative (coach, parent, teammate) and interpreter present during testing.',
          '2. Right to ask the DCO for identification and credentials.',
          '3. Right to request reasonable delays for valid reasons (e.g. medal ceremony, media commitments, medical treatment).',
          '4. Right to document any procedural concerns on the Doping Control Form.',
        ],
        keyTakeaway: 'Know your rights: always request a chaperone when taking a permissible delay.',
      },
      {
        title: 'Your Non-Negotiable Responsibilities',
        content: [
          '1. Comply with sample collection upon formal notification.',
          '2. Remain under direct observation by the chaperone at all times.',
          '3. Produce valid photo identification.',
          '4. Provide accurate whereabouts information if in a Registered Testing Pool (RTP).',
          '5. Educate medical staff about anti-doping status before receiving treatment.',
        ],
        keyTakeaway: 'Refusing or delaying a test without authorization is treated as equivalent to a positive test.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'rights-1',
          moduleKey: 'athleteRightsResponsibilities',
          question: 'Can an athlete request a representative (like a parent or coach) during sample collection?',
          type: 'true_false',
          difficulty: 'easy',
          options: [
            'True: Athletes have the right to have a representative accompany them to the station',
            'False: Athletes must always be isolated completely alone',
          ],
          correctOptionIndex: 0,
          explanation: 'Athletes have the explicit right to be accompanied by a chosen representative.',
        },
      ],
    },
  },

  'medication-awareness': {
    slug: 'medication-awareness',
    moduleKey: 'medicationAwareness',
    route: '/modules/medication-awareness',
    title: 'Medication Safety & Checks',
    shortTitle: 'Medication Safety',
    category: 'Health & Safety',
    xpReward: 35,
    sections: [
      {
        title: 'Common Over-The-Counter Traps',
        content: [
          'Over-the-counter (OTC) medicines for common illnesses like colds, coughs, and allergies frequently contain prohibited stimulants or decongestants (such as pseudoephedrine, ephedrine, or phenylephrine).',
          'Brand names vary by country: a medicine with the exact same commercial brand name in the UK or US may contain completely different active ingredients in India, Europe, or Australia.',
        ],
        keyTakeaway: 'Never judge a medicine by its brand name alone — verify every active chemical ingredient.',
      },
      {
        title: 'Checking via Global DRO and NADA',
        content: [
          'Use official databases like Global DRO (globaldro.com) or your NADO mobile database before buying or taking any medication.',
          'Inform every doctor, dentist, and pharmacist you visit: "I am a competitive athlete subject to anti-doping testing. Please prescribe only WADA-compliant treatments."',
        ],
        keyTakeaway: 'Always declare your athlete status to healthcare providers before accepting a prescription.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'med-1',
          moduleKey: 'medicationAwareness',
          question: 'Why is it dangerous to take a familiar brand-name cough syrup purchased abroad?',
          type: 'multiple_choice',
          difficulty: 'medium',
          options: [
            'Different countries use different active ingredients under the same brand name',
            'Foreign cough syrups always taste bad',
            'Customs authorities report all syrup buyers',
            'Syrups evaporate during airplane flights',
          ],
          correctOptionIndex: 0,
          explanation: 'Brand names are often shared across nations while containing completely distinct, potentially prohibited formulations.',
        },
      ],
    },
  },

  'nutrition-performance': {
    slug: 'nutrition-performance',
    moduleKey: 'nutritionPerformance',
    route: '/modules/nutrition-performance',
    title: 'Nutrition for Peak Performance',
    shortTitle: 'Sports Nutrition',
    category: 'Health & Safety',
    xpReward: 30,
    sections: [
      {
        title: 'Fueling Champions: The Food-First Foundation',
        content: [
          'No supplement can replace balanced nutrition, adequate sleep, and systematic physical training.',
          'Complex carbohydrates provide sustained glycogen reserves for endurance; high-quality lean proteins stimulate muscle protein synthesis; healthy fats support hormone production and cellular health.',
        ],
        keyTakeaway: 'Real food gives you micronutrients and bioactive compounds that no synthetic pill can copy.',
      },
      {
        title: 'Hydration and Recovery Protocols',
        content: [
          'Dehydration of just 2% of body mass significantly degrades aerobic endurance, cognitive decision-making, and power output.',
          'Consume water and natural electrolyte sources (coconut water, milk, or pinch of salt in fruit juice) instead of untested commercial stimulant-laden energy concoctions.',
        ],
        keyTakeaway: 'Plan your pre- and post-workout nutrition meals around whole foods.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'nut-1',
          moduleKey: 'nutritionPerformance',
          question: 'What is the most reliable and risk-free strategy for sports recovery and performance?',
          type: 'multiple_choice',
          difficulty: 'easy',
          options: [
            'A structured whole-food nutrition plan, proper sleep, and hydration',
            'Megadosing random internet supplements',
            'Energy drinks with proprietary blends',
            'Skipping post-workout meals entirely',
          ],
          correctOptionIndex: 0,
          explanation: 'Whole foods, sound sleep, and systematic hydration form the cornerstone of safe athletic excellence.',
        },
      ],
    },
  },

  'doping-risks': {
    slug: 'doping-risks',
    moduleKey: 'dopingRisks',
    route: '/modules/doping-risks',
    title: 'Health Risks & Consequences',
    shortTitle: 'Doping Risks',
    category: 'Health & Safety',
    xpReward: 35,
    sections: [
      {
        title: 'Physical and Mental Health Hazards',
        content: [
          'Anabolic steroids cause cardiovascular disease, severe liver damage, hormonal collapse, tendon rupture, and psychiatric mood disturbances ("roid rage").',
          'EPO and blood transfusions thicken blood into sludge, causing fatal strokes, heart attacks, and pulmonary embolisms during sleep when heart rate drops.',
          'Stimulants trigger cardiac arrhythmias, hyperthermia, heat stroke, and sudden cardiac arrest.',
        ],
        keyTakeaway: 'Doping destroys bodies. The biological costs are real, permanent, and sometimes fatal.',
      },
      {
        title: 'Social, Career, and Legal Fallout',
        content: [
          'A doping sanction brings mandatory multi-year bans, forfeiture of medals and prize money, public naming and shaming, loss of sponsorships, and expulsion from university or military athletic programs.',
          'The social stigma and psychological burden of being labeled a cheater follows individuals for life.',
        ],
        keyTakeaway: 'A short-term shortcut can permanently erase years of legitimate achievement.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'risk-1',
          moduleKey: 'dopingRisks',
          question: 'What severe medical danger is associated with EPO and blood doping?',
          type: 'multiple_choice',
          difficulty: 'medium',
          options: [
            'Increased blood viscosity causing fatal heart attacks and strokes',
            'Mild temporary tooth sensitivity',
            'Permanent loss of fingernails',
            'Inability to digest fruit',
          ],
          correctOptionIndex: 0,
          explanation: 'EPO thickens the blood by overproducing red cells, drastically elevating risks of fatal clotting, strokes, and cardiac arrest.',
        },
      ],
    },
  },

  'ethics-in-sport': {
    slug: 'ethics-in-sport',
    moduleKey: 'ethicsInSport',
    route: '/modules/ethics-in-sport',
    title: 'Ethics & The Spirit of Sport',
    shortTitle: 'Sports Ethics',
    category: 'Values & Ethics',
    xpReward: 30,
    sections: [
      {
        title: 'The Value of Fair Play',
        content: [
          'Sport is meaningful because rules create a fair playing field. When you compete fairly and triumph, your victory reflects authentic dedication, resilience, and human spirit.',
          'Doping steals moments that rightfully belong to clean athletes who dedicated their youth to honest competition.',
        ],
        keyTakeaway: 'A medal won through fraud is a hollow trophy.',
      },
      {
        title: 'Respect for Competitors, Self, and Sport',
        content: [
          'True champions embody integrity in victory and dignity in defeat. Ethical athletes hold themselves accountable to their teammates, opponents, and future generations.',
        ],
        keyTakeaway: 'Compete clean so that your victory can be celebrated with pride forever.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'eth-1',
          moduleKey: 'ethicsInSport',
          question: 'Why does clean competition matter more than winning at any cost?',
          type: 'multiple_choice',
          difficulty: 'easy',
          options: [
            'Because authentic victory reflects honest effort and inspires trust in sport',
            'Because rules only exist to generate paperwork',
            'Because fans only care about numbers',
            'Because medals can be purchased online anyway',
          ],
          correctOptionIndex: 0,
          explanation: 'Integrity and fairness give sport its true human and emotional value.',
        },
      ],
    },
  },

  'clean-sport': {
    slug: 'clean-sport',
    moduleKey: 'cleanSport',
    route: '/modules/clean-sport',
    title: 'Clean Sport Ambassador',
    shortTitle: 'Clean Sport',
    category: 'Values & Ethics',
    xpReward: 30,
    sections: [
      {
        title: 'Leading by Example in Your Club',
        content: [
          'Being a clean athlete means setting the standard in your academy, training camp, and locker room.',
          'Speak up when you see peers considering dangerous supplements or unauthorized injections. Encourage teammates to verify their medicines using AntiDopX and official NADO resources.',
        ],
        keyTakeaway: 'You have the power to create a clean culture in your sport.',
      },
      {
        title: 'Building a Clean Support Entourage',
        content: [
          'Surround yourself with ethical coaches, physios, and nutritionists who prioritize your lifelong health above short-term trophies.',
        ],
        keyTakeaway: 'If an entourage member suggests cheating, protect yourself and report it.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'clean-1',
          moduleKey: 'cleanSport',
          question: 'What should you do if a trainer suggests taking an unidentifiable injection before a tournament?',
          type: 'multiple_choice',
          difficulty: 'easy',
          options: [
            'Firmly refuse and report the incident to your NADO or anti-doping integrity unit',
            'Accept it silently if they have a medal',
            'Recommend it to your competitors',
            'Hide it in your locker',
          ],
          correctOptionIndex: 0,
          explanation: 'Never accept unidentifiable injections; refuse immediately and notify official anti-doping integrity channels.',
        },
      ],
    },
  },

  'where-to-get-help': {
    slug: 'where-to-get-help',
    moduleKey: 'whereToGetHelp',
    route: '/modules/where-to-get-help',
    title: 'Helplines & Official Resources',
    shortTitle: 'Get Help',
    category: 'Fundamentals',
    xpReward: 30,
    sections: [
      {
        title: 'National & Global Contact Channels',
        content: [
          'NADA India Hotline & Web Portal: official guidance for Indian athletes.',
          'WADA Speak Up! Platform: confidential reporting channel for doping violations, pressure, or suspicious activities.',
          'Global DRO (globaldro.com): Instant online medication status checker by country and brand.',
        ],
        keyTakeaway: 'Confidential reporting platforms protect whistleblowers and clean athletes.',
      },
      {
        title: 'Your Athlete Support Network',
        content: [
          'Use AntiDopX to message your assigned verified coach or ask the AI Learning Coach for immediate clarification on anti-doping definitions.',
        ],
        keyTakeaway: 'When in doubt, always ask before taking any substance.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'help-1',
          moduleKey: 'whereToGetHelp',
          question: 'What is the official WADA secure and confidential whistleblower platform?',
          type: 'multiple_choice',
          difficulty: 'medium',
          options: [
            'WADA Speak Up!',
            'Twitter Direct Messages',
            'Sports Fans Forum',
            'Telegram Group Chat',
          ],
          correctOptionIndex: 0,
          explanation: 'WADA Speak Up! is the official secure and confidential reporting platform for doping concerns.',
        },
      ],
    },
  },

  'young-athlete-awareness': {
    slug: 'young-athlete-awareness',
    moduleKey: 'youngAthleteAwareness',
    route: '/modules/young-athlete-awareness',
    title: 'Young Athlete Pressures & Protection',
    shortTitle: 'Youth Awareness',
    category: 'Values & Ethics',
    xpReward: 35,
    sections: [
      {
        title: 'Dealing with Pressure to Perform',
        content: [
          'Young athletes frequently face immense pressure from parents, coaches, peers, and social media to make teams and secure scholarships.',
          'Doping shortcuts never solve performance Plateaus — smart periodized training, adequate rest, recovery, and nutrition do.',
        ],
        keyTakeaway: 'A plateau in performance is normal. Talk to a certified mentor rather than seeking chemical fixes.',
      },
      {
        title: 'Special Protections for Minors in Anti-Doping',
        content: [
          'Under the 2021 WADA Code, athletes who are Minors (under 18) are classified as Protected Persons. This provides certain legal safeguards regarding public disclosure and sanction flexibility.',
          'However, testing can still take place, strict liability still applies, and sample collection rules must still be followed with parent/representative accompaniment.',
        ],
        keyTakeaway: 'Minors have legal protections, but strict liability for prohibited substances still applies.',
      },
    ],
    quiz: {
      passingScore: 80,
      questions: [
        {
          id: 'youth-1',
          moduleKey: 'youngAthleteAwareness',
          question: 'Are minor athletes (under 18) subject to sample collection and testing?',
          type: 'true_false',
          difficulty: 'easy',
          options: [
            'True: Minors can be tested anytime, with the right to have a parent or representative present',
            'False: Testing is forbidden until age 21',
          ],
          correctOptionIndex: 0,
          explanation: 'Minor athletes can be tested In- and Out-of-Competition with representative accompaniment rights.',
        },
      ],
    },
  },
};

export const learningModules: LearningModuleDefinition[] = Object.values(learningModulesBySlug);

export const getLearningModuleBySlug = (slug: string): LearningModuleDefinition | undefined => {
  return (learningModulesBySlug as Record<string, LearningModuleDefinition>)[slug];
};
