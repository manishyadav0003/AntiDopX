import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Transaction } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { CallableRequest, HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();

const db = getFirestore();
const REGION = 'asia-south1';
const QUIZ_XP_CAP = 180;

type QuizAnswer = {
  questionId: string;
  optionIndex: number;
};

const quizAnswers: Record<string, number> = {
  'arena-1': 1,
  'arena-2': 1,
  'arena-3': 1,
  'arena-4': 2,
  'arena-5': 1,
};

const getLevel = (xp: number): string => {
  if (xp >= 1000) return 'Elite Athlete';
  if (xp >= 300) return 'Champion';
  if (xp >= 100) return 'Competitor';
  return 'Rookie';
};

const getWeekKey = (): string => {
  const week = Math.min(7, Math.ceil(new Date().getUTCDate() / 7));
  return `w${week}`;
};

const requireAuth = (uid: string | undefined): string => {
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Sign in before using this feature.');
  }

  return uid;
};

export const submitQuizArena = onCall({ region: REGION }, async (request: CallableRequest<any>) => {
  const uid = requireAuth(request.auth?.uid);
  const answers = request.data?.answers;

  if (!Array.isArray(answers) || answers.length !== Object.keys(quizAnswers).length) {
    throw new HttpsError('invalid-argument', 'Submit one answer for every quiz question.');
  }

  const submitted = new Map<string, number>();
  for (const answer of answers as QuizAnswer[]) {
    if (
      !answer ||
      typeof answer.questionId !== 'string' ||
      !Number.isInteger(answer.optionIndex) ||
      answer.optionIndex < 0 ||
      answer.optionIndex > 3 ||
      !(answer.questionId in quizAnswers) ||
      submitted.has(answer.questionId)
    ) {
      throw new HttpsError('invalid-argument', 'The quiz submission is invalid.');
    }

    submitted.set(answer.questionId, answer.optionIndex);
  }

  const score = [...submitted.entries()].reduce(
    (total, [questionId, optionIndex]) => total + Number(quizAnswers[questionId] === optionIndex),
    0
  );
  const totalQuestions = Object.keys(quizAnswers).length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const xpEarned = Math.round((percentage / 100) * QUIZ_XP_CAP);
  const userRef = db.collection('users').doc(uid);
  const auditRef = db.collection('auditLogs').doc();
  const today = new Date().toISOString().slice(0, 10);

  const result = await db.runTransaction(async (transaction: Transaction) => {
    const user = await transaction.get(userRef);
    if (!user.exists) {
      throw new HttpsError('failed-precondition', 'Create your athlete profile first.');
    }

    const data = user.data() ?? {};
    const xp = Number(data.xp ?? 0) + xpEarned;
    const monthlyXP = { ...(data.monthlyXP ?? {}) } as Record<string, number>;
    const weekKey = getWeekKey();
    monthlyXP[weekKey] = Number(monthlyXP[weekKey] ?? 0) + xpEarned;
    const mission = data.dailyMission?.date === today
      ? data.dailyMission
      : { date: today, scenariosCompleted: 0, quizQuestionsAnswered: 0 };
    const activity = {
      type: 'quiz',
      description: `Quiz Arena score ${percentage}% (+${xpEarned} XP)`,
      timestamp: new Date().toISOString(),
    };
    const existingAchievements = data.achievements ?? {};
    const achievements = {
      firstModule: Boolean(existingAchievements.firstModule),
      threeModules: Boolean(existingAchievements.threeModules),
      fiveModules: Boolean(existingAchievements.fiveModules),
      xp100: Boolean(existingAchievements.xp100) || xp >= 100,
      streak7: Boolean(existingAchievements.streak7) || Number(data.streak ?? 0) >= 7,
    };

    transaction.update(userRef, {
      xp,
      level: getLevel(xp),
      monthlyXP,
      achievements,
      dailyMission: {
        ...mission,
        quizQuestionsAnswered: Number(mission.quizQuestionsAnswered ?? 0) + totalQuestions,
      },
      quizArenaScores: FieldValue.arrayUnion(percentage),
      recentActivity: [activity, ...(Array.isArray(data.recentActivity) ? data.recentActivity : [])].slice(0, 5),
    });
    transaction.set(auditRef, {
      userId: uid,
      action: 'QUIZ_COMPLETED',
      timestamp: FieldValue.serverTimestamp(),
      metadata: { score, totalQuestions, xpEarned },
    });

    return { score, percentage, xpEarned, level: getLevel(xp), totalXP: xp };
  });

  logger.info('Quiz Arena submitted', { uid, score, xpEarned });
  return result;
});

export const lookupMedicine = onCall({ region: REGION }, async (request: CallableRequest<any>) => {
  requireAuth(request.auth?.uid);
  const rawText = request.data?.rawText;

  if (typeof rawText !== 'string' || rawText.trim().length < 2 || rawText.length > 500) {
    throw new HttpsError('invalid-argument', 'Provide readable medicine-label text.');
  }

  const normalized = rawText.trim().toLowerCase();
  const entry = await db
    .collection('medicineEntries')
    .where('normalizedAliases', 'array-contains', normalized)
    .where('published', '==', true)
    .limit(1)
    .get();

  if (entry.empty) {
    return {
      drugName: rawText.trim(),
      status: 'Unknown',
      guidance: 'No verified reference entry was found. Confirm every active ingredient with Global DRO, your NADO, or a qualified healthcare professional.',
      source: null,
      lastVerified: null,
    };
  }

  const data = entry.docs[0].data();
  return {
    drugName: String(data.medicineName ?? rawText.trim()),
    status: String(data.referenceStatus ?? 'Unknown'),
    guidance: String(data.notes ?? 'Confirm this information with an official anti-doping source.'),
    source: data.source ?? null,
    lastVerified: data.lastVerified ?? null,
  };
});

export const setUserRole = onCall({ region: REGION }, async (request: CallableRequest<any>) => {
  const callerUid = requireAuth(request.auth?.uid);
  if (request.auth?.token.role !== 'ADMIN') {
    throw new HttpsError('permission-denied', 'Administrator access is required.');
  }

  const uid = request.data?.uid;
  const role = request.data?.role;
  if (typeof uid !== 'string' || !['ATHLETE', 'COACH', 'ADMIN'].includes(role)) {
    throw new HttpsError('invalid-argument', 'Provide a user ID and valid role.');
  }

  await db.collection('users').doc(uid).update({ role });
  await db.collection('auditLogs').add({
    userId: callerUid,
    action: 'ROLE_CHANGED',
    timestamp: FieldValue.serverTimestamp(),
    metadata: { targetUserId: uid, role },
  });
  return { uid, role };
});

export const askAICoach = onCall({ region: REGION }, async (request: CallableRequest<any>) => {
  requireAuth(request.auth?.uid);
  const question = request.data?.question;
  const language = request.data?.language === 'hi' ? 'hi' : 'en';

  if (typeof question !== 'string' || !question.trim()) {
    throw new HttpsError('invalid-argument', 'Please provide a valid question.');
  }

  const clean = question.trim().toLowerCase();
  const isHindi = language === 'hi';

  // Grounded anti-doping responses
  let answer = '';
  let citations: string[] = ['WADA World Anti-Doping Code', 'WADA 2026 Prohibited List'];

  if (clean.includes('tue') || clean.includes('exemption') || clean.includes('उपचार संबंधी')) {
    answer = isHindi
      ? 'टीयूई (चिकित्सीय उपयोग छूट) एक आधिकारिक अनुमति है जो एथलीट को वैध चिकित्सा कारणों से प्रतिबंधित पदार्थ या विधि का उपयोग करने की अनुमति देती है। इसे हमेशा प्रतियोगिता से पहले अपने राष्ट्रीय डोपिंग रोधी संगठन (NADO) से स्वीकृत कराना आवश्यक है।'
      : 'A TUE (Therapeutic Use Exemption) grants an athlete official medical authorization to use a prohibited substance or method for a legitimate medical condition. You must apply and obtain approval through your NADO or International Federation before participating in competition.';
    citations.push('International Standard for Therapeutic Use Exemptions (ISTUE)');
  } else if (clean.includes('strict liability') || clean.includes('जिम्मेदारी')) {
    answer = isHindi
      ? 'सख्त दायित्व (Strict Liability) का नियम कहता है कि एक एथलीट अपने शरीर में पाए जाने वाले किसी भी पदार्थ के लिए पूरी तरह व्यक्तिगत रूप से जिम्मेदार है। अनजाने में लिया गया पदार्थ भी डोपिंग उल्लंघन माना जा सकता है।'
      : 'Strict Liability means that as an athlete, you are solely and personally responsible for any substance found in your sample. Intent or negligence does not excuse an Anti-Doping Rule Violation.';
    citations.push('WADA Code Article 2.1');
  } else if (clean.includes('supplement') || clean.includes('protein') || clean.includes('सप्लीमेंट')) {
    answer = isHindi
      ? 'आहार सप्लीमेंट्स में क्रॉस-संदूषण (Contamination) और अघोषित प्रतिबंधित पदार्थों का अत्यधिक जोखिम होता है। वाडा कभी भी किसी भी सप्लीमेंट को प्रमाणित नहीं करता है। केवल स्वतंत्र रूप से बैच-परीक्षण (Informed Sport / NSF) उत्पादों का ही चयन करें।'
      : 'Dietary supplements carry a high risk of cross-contamination and undeclared banned stimulants. WADA does NOT certify any dietary supplement. Look for third-party batch-tested products (Informed Sport / NSF) and consult your sports physician.';
    citations.push('WADA Guidelines on Dietary Supplements & Contamination');
  } else {
    answer = isHindi
      ? `डोपिंग-रोधी नियम आपके स्वास्थ्य और खेल की निष्पक्षता की रक्षा के लिए बनाए गए हैं। हमेशा किसी भी दवा या पूरक आहार का उपयोग करने से पहले ग्लोबल डीआरओ (Global DRO) या अपने खेल चिकित्सक से पुष्टि करें।`
      : `Clean sport protects your health and fairness in athletic competition. Always verify your medications and active ingredients with Global DRO or your team physician before consumption.`;
  }

  return {
    answer,
    citations,
    safetyNotice: isHindi
      ? 'चेतावनी: यह एक शैक्षणिक सलाह है। चिकित्सीय या कानूनी निर्णयों के लिए हमेशा अपने खेल डॉक्टर या नाडा/वाडा से संपर्क करें।'
      : 'NOTICE: This response is for educational guidance only and does not replace medical or official anti-doping verification.',
    timestamp: new Date().toISOString(),
  };
});
