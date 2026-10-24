# AntiDopX AI Coach & Knowledge Grounding Architecture

AntiDopX implements an AI Learning Coach specifically tailored for young athletes, sports mentors, and coaches. It balances engaging, conversational learning assistance with strict regulatory safeguards to ensure athletes never receive inaccurate or dangerous medical advice.

---

## 1. System Prompt & Guardrails

The AI Coach operates under strict operational guardrails:

```markdown
You are the AntiDopX AI Learning Coach. You educate young athletes about anti-doping, WADA regulations, Prohibited Lists, Therapeutic Use Exemptions (TUEs), testing protocols, and dietary supplement risks.

CORE PRINCIPLES:
1. Promote clean sport, athlete health, and fair competition.
2. NEVER declare any medicine, dietary supplement, or batch unconditionally safe or free of banned substances.
3. Always instruct athletes to verify active pharmaceutical ingredients via Global DRO, their National Anti-Doping Organization (NADO), or their team medical staff.
4. Keep explanations motivational, accessible, and age-appropriate for youth athletes without sounding childish.
5. Provide specific citations to official anti-doping documents (WADA Code, Prohibited List, ISTUE).
```

---

## 2. Grounding Data Sources & Citations

Every AI response is mapped to official standards:
- **World Anti-Doping Code (Code)**: Core articles (e.g., Article 2.1 Strict Liability, Article 2.2 Use or Attempted Use).
- **2026 WADA Prohibited List**: Categories S0 (Non-approved substances) through S9 (Glucocorticoids), and Methods M1–M3.
- **International Standard for Therapeutic Use Exemptions (ISTUE)**: Mandatory criteria, retro-TUE applications, emergency treatments.
- **International Standard for Testing and Investigations (ISTI)**: Doping Control Officer (DCO) procedures, sample collection, Athlete Biological Passport (ABP).
- **WADA Guidelines on Dietary Supplements & Contamination**: Warnings on cross-contamination, unlisted ingredients, and synthetic stimulants.

---

## 3. Athlete Context Personalization

The AI subsystem enriches athlete queries with dynamic profile context:
- **Athlete Level**: Rookie / Competitor / Champion / Elite Athlete
- **Sport Discipline**: Sport-specific contextual advice (e.g., beta-blockers prohibited in certain precision sports like archery and shooting).
- **Recent Quiz Mistakes**: Weak areas identified from module assessments are prioritized for review and micro-revision.
- **Language**: English (`en`) and Hindi (`hi`) supported natively.

---

## 4. Multi-Tier Resolution & Offline Resilience

If external LLM connectivity is unavailable, the AI Coach falls back immediately to deterministic, rule-based knowledge banks (`aiCoachService.ts`), ensuring athletes receive instant, verified answers to critical anti-doping inquiries without network latency or hallucination risks.
