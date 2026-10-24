import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase/config';
import type {
  AIChatMessage,
  AICoachRequest,
  AICoachResponse,
  AthleteLearningContext,
} from '../types/ai';
import { learningModules } from '../learning/modules';
import { TRUSTED_MEDICINE_DATABASE } from './medicineReferenceService';

const functions = getFunctions(app, 'asia-south1');

const KNOWLEDGE_HANDBOOK = [
  {
    topic: 'TUE',
    keywords: ['tue', 'therapeutic', 'exemption', 'asthma', 'doctor', 'prescription', 'medical condition'],
    summary:
      'A Therapeutic Use Exemption (TUE) allows an athlete to use a prohibited substance or method for a legitimate medical condition. A doctor prescription is NOT sufficient; formal advance approval from a NADO or International Federation TUE committee is legally mandatory before competing.',
    criteria:
      'Criteria: 1. Athlete health would significantly impair without it; 2. No significant performance enhancement beyond restoring health; 3. No reasonable permitted alternative exists; 4. Not caused by prior non-approved use.',
    moduleSlug: 'tue',
  },
  {
    topic: 'Strict Liability',
    keywords: ['strict liability', 'responsible', 'accidental', 'mistake', 'who is responsible', 'friend gave me'],
    summary:
      'Strict Liability is the golden rule of anti-doping: each athlete is 100% strictly responsible for any prohibited substance found in their biological sample. It does not matter whether exposure was intentional, accidental, or negligent.',
    criteria:
      'Never take shared drinks, unverified home remedies, or supplements given by teammates without official batch verification.',
    moduleSlug: 'anti-doping-basics',
  },
  {
    topic: 'Supplements',
    keywords: ['supplement', 'protein', 'creatine', 'pre workout', 'fat burner', 'contamination', 'herbal'],
    summary:
      'Between 10% and 25% of commercial supplements have been found to contain undeclared steroids, stimulants, or prohibited cross-contaminants. The supplement industry is not strictly regulated like prescription medicines.',
    criteria:
      'Practice a Food-First nutrition strategy. If supplements are medically necessary, only use third-party batch-tested products (Informed Sport, NSF Certified for Sport) and archive the batch receipt.',
    moduleSlug: 'supplements',
  },
  {
    topic: 'Testing Procedures',
    keywords: ['test', 'testing', 'urine', 'sample', 'dco', 'chaperone', 'rights', 'bottle a', 'bottle b'],
    summary:
      'Doping control can occur In-Competition or Out-of-Competition with zero advance notice. You must remain in continuous visual contact with the chaperone from notification until sample sealing. You personally select the sealed collection kit, verify bottle codes, and sign the Doping Control Form.',
    criteria:
      'You have the right to have a representative present, ask for DCO credentials, and document any procedural irregularity directly on the form before signing.',
    moduleSlug: 'testing-procedures',
  },
  {
    topic: 'Whereabouts',
    keywords: ['whereabouts', 'adams', 'rtp', 'location', 'missed test', 'filing failure'],
    summary:
      'Athletes in Registered Testing Pools (RTP) must submit accurate daily location information in ADAMS. Any combination of 3 missed tests or filing failures within a rolling 12-month period constitutes an Anti-Doping Rule Violation carrying a 1 to 2-year ban.',
    criteria: 'Update your 60-minute testing window promptly whenever your travel or training schedule changes.',
    moduleSlug: 'wada-rules',
  },
];

export const askAICoach = async (
  request: AICoachRequest
): Promise<AICoachResponse> => {
  const isHindi = request.language === 'hi';
  const query = request.message.trim().toLowerCase();

  // Try secure Cloud Function first
  try {
    const askCoachCallable = httpsCallable<AICoachRequest, AICoachResponse>(
      functions,
      'askAICoach'
    );
    const result = await askCoachCallable(request);
    if (result.data && result.data.reply) {
      return result.data;
    }
  } catch (backendError) {
    // Cloud function unavailable or API key not yet configured in production;
    // Fall back to authoritative AntiDopX knowledge-grounded reasoning engine
  }

  // Knowledge Grounded Fallback Engine
  let matchedTopic = KNOWLEDGE_HANDBOOK.find((item) =>
    item.keywords.some((kw) => query.includes(kw))
  );

  // Check if athlete is asking about a specific medicine in our database
  const matchedMedicine = TRUSTED_MEDICINE_DATABASE.find(
    (med) =>
      query.includes(med.brandName.toLowerCase()) ||
      query.includes(med.genericName.toLowerCase()) ||
      med.searchAliases.some((alias) => query.includes(alias))
  );

  let reply = '';
  const followUps: string[] = [];
  let relevantSlug = matchedTopic?.moduleSlug;
  const references: string[] = ['World Anti-Doping Code (WADA)', 'WADA International Standard Prohibited List'];

  if (matchedMedicine) {
    references.push(matchedMedicine.source);
    if (isHindi) {
      reply = `**${matchedMedicine.brandName} (${matchedMedicine.genericName})** की स्थिति:\n\n` +
        `• **एंटी-डोपिंग स्थिति:** ${matchedMedicine.overallStatus}\n` +
        `• **सक्रिय घटक:** ${matchedMedicine.activeIngredients.map((i) => `${i.name} [${i.wadaStatus}]`).join(', ')}\n` +
        `• **मार्गदर्शन:** ${matchedMedicine.officialGuidance}\n\n` +
        `**महत्वपूर्ण चेतावनी:** ${matchedMedicine.medicalDisclaimer}\n` +
        `प्रतिस्पर्धा से पहले हमेशा अपने खेल चिकित्सक या NADA से पुष्टि करें।`;
      followUps.push('TUE क्या है और इसके लिए कैसे आवेदन करें?');
      followUps.push('सप्लीमेंट्स में संदूषण (Contamination) का क्या जोखिम है?');
    } else {
      reply = `**${matchedMedicine.brandName} (${matchedMedicine.genericName})** Status Assessment:\n\n` +
        `• **Anti-Doping Status:** ${matchedMedicine.overallStatus}\n` +
        `• **Active Ingredients:** ${matchedMedicine.activeIngredients.map((i) => `${i.name} [${i.wadaStatus}]`).join(', ')}\n` +
        `• **Official Guidance:** ${matchedMedicine.officialGuidance}\n\n` +
        `**Safety Notice:** ${matchedMedicine.medicalDisclaimer}\n` +
        `Always verify prescription treatments with your certified sports doctor or official NADO portal prior to competition.`;
      followUps.push('What is a TUE and when do I need one?');
      followUps.push('How do I check combination cold medicines?');
    }
    relevantSlug = 'medication-awareness';
  } else if (matchedTopic) {
    references.push(`AntiDopX Learning Module: ${matchedTopic.topic}`);
    if (isHindi) {
      reply = `**${matchedTopic.topic} पर आधिकारिक जानकारी:**\n\n` +
        `${matchedTopic.summary}\n\n` +
        `**मुख्य नियम व सुझाव:**\n${matchedTopic.criteria}\n\n` +
        (request.athleteContext?.sport
          ? `आपके खेल (${request.athleteContext.sport}) में इन नियमों का पालन करना आपके करियर की सुरक्षा के लिए अत्यंत आवश्यक है।`
          : '');
      followUps.push('कठोर दायित्व (Strict Liability) क्या है?');
      followUps.push('सप्लीमेंट्स क्यों जोखिम भरे होते हैं?');
      followUps.push('क्विज में मेरा ज्ञान परखें');
    } else {
      reply = `**Anti-Doping Guidance on ${matchedTopic.topic}:**\n\n` +
        `${matchedTopic.summary}\n\n` +
        `**Key Protocol & Rules:**\n${matchedTopic.criteria}\n\n` +
        (request.athleteContext?.sport
          ? `In your sport of ${request.athleteContext.sport}, adhering to these standards ensures your medals and athletic reputation remain protected.`
          : '');
      followUps.push('Explain strict liability in simple words');
      followUps.push('Why are dietary supplements high risk?');
      followUps.push('What should I study next on AntiDopX?');
    }
  } else if (query.includes('mistake') || query.includes('study next') || query.includes('weak')) {
    const weakList = request.athleteContext?.weakTopics || [];
    if (isHindi) {
      reply = `**आपकी व्यक्तिगत अध्ययन सिफारिश:**\n\n` +
        `आपकी प्रोफ़ाइल के अनुसार, ${weakList.length > 0 ? `कमजोर विषय (${weakList.join(', ')})` : 'नए मॉड्यूल्स'} पर ध्यान केंद्रित करने की सलाह दी जाती है।\n\n` +
        `1. 'Therapeutic Use Exemptions (TUE)' मॉड्यूल पढ़ें\n` +
        `2. 5 प्रश्नों का क्विज एरेना अभ्यास पूरा करें\n` +
        `3. अपने कोच को यदि कोई संदेह हो तो संदेश भेजें`;
      followUps.push('TUE क्या होता है?');
      followUps.push('क्विज एरेना शुरू करें');
    } else {
      reply = `**Personalized Study Recommendation:**\n\n` +
        `Based on your athlete profile (Level: ${request.athleteContext?.level || 'Athlete'}, ${request.athleteContext?.streak || 0} day streak):\n\n` +
        `1. **Focus Area:** ${weakList.length > 0 ? weakList.join(', ') : 'Anti-Doping Regulations & TUE'}\n` +
        `2. **Recommended Action:** Complete the **Therapeutic Use Exemptions (TUE)** and **Supplements & Contamination** lessons.\n` +
        `3. Take a 5-question Rapid-Fire Quiz to cement your understanding!`;
      followUps.push('What is a Therapeutic Use Exemption (TUE)?');
      followUps.push('Why are supplements risky for athletes?');
      followUps.push('How does urine sample collection work?');
    }
    relevantSlug = 'tue';
  } else {
    if (isHindi) {
      reply = `नमस्कार एथलीट! मैं आपका **AntiDopX AI लर्निंग कोच** हूँ।\n\n` +
        `मैं आधिकारिक WADA और NADO नियमों पर प्रशिक्षित हूँ। आप मुझसे पूछ सकते हैं:\n` +
        `• किसी दवा या सक्रिय घटक की डोपिंग स्थिति\n` +
        `• TUE (चिकित्सीय उपयोग छूट) के नियम\n` +
        `• सप्लीमेंट्स और संदूषण के जोखिम\n` +
        `• सैंपल टेस्टिंग प्रक्रिया और आपके कानूनी अधिकार\n\n` +
        `आप आज क्या सीखना चाहते हैं?`;
      followUps.push('TUE क्या है और इसके नियम क्या हैं?');
      followUps.push('सप्लीमेंट्स सुरक्षित क्यों नहीं होते?');
      followUps.push('डोपिंग टेस्ट में एथलीट के क्या अधिकार हैं?');
    } else {
      reply = `Hello athlete! I am your **AntiDopX AI Learning Coach**.\n\n` +
        `I am grounded in official WADA and National Anti-Doping guidelines to help you compete clean and protect your sports career.\n\n` +
        `You can ask me about:\n` +
        `• Medicine & active ingredient prohibited status\n` +
        `• Therapeutic Use Exemptions (TUE)\n` +
        `• Supplement contamination risks & food-first nutrition\n` +
        `• Doping control sample collection & athlete rights\n` +
        `• Personalized revision recommendations\n\n` +
        `What topic would you like to explore today?`;
      followUps.push('What is a Therapeutic Use Exemption (TUE)?');
      followUps.push('Why are dietary supplements high risk?');
      followUps.push('What happens during a urine sample test?');
    }
  }

  return {
    reply,
    suggestedFollowUps: followUps,
    relevantModuleSlug: relevantSlug,
    sourceReferences: references,
    language: request.language || 'en',
  };
};
