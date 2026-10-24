# AntiDopX Architecture Documentation

AntiDopX is an athlete-support and anti-doping education platform designed for young athletes, sports mentors, and coaches. It is built with React Native, Expo SDK 57, TypeScript, Expo Router, and Firebase (Authentication, Cloud Firestore, Cloud Functions).

---

## 1. System Topology & Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AntiDopX Mobile Client                          │
│                (Expo SDK 57 • React Native • TypeScript)               │
├────────────────────────────────────────────────────────────────────────┤
│  Tabs & Navigation     Learning Engine        Medicine Scanner        │
│  - Dashboard           - 16 WADA Modules       - CameraView Barcode   │
│  - Learning Journey    - Adaptive Quiz Engine  - Reference DB Match   │
│  - Play & Roulette     - Mistake Revision      - Active Ingredients   │
│  - Ranks & Leaderboard - Gamification Engine   - Multi-Tier Status    │
│  - Athlete Profile     - Localization Provider - Strict Liability     │
├────────────────────────┬───────────────────────┬──────────────────────┤
│    Coach Portal        │      AI Coach         │ Athlete-Coach Chat   │
│  - Athlete Roster      │  - Grounded Responses │ - 1-on-1 Firestore   │
│  - KPIs & Weak Topics  │  - Context Injection  │ - Real-Time Listeners│
│  - Compliance Status   │  - Multilingual (EN/HI│ - Read Status / Unread│
└───────────┬────────────┴───────────┬───────────┴──────────┬───────────┘
            │                        │                      │
            ▼                        ▼                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Firebase Cloud Backend                          │
├────────────────────────────────────────────────────────────────────────┤
│  Authentication     Cloud Firestore         Cloud Functions (v2)       │
│  - Email/Password   - users                 - submitQuizArena (Tx)     │
│  - Token Auth       - conversations         - lookupMedicine           │
│  - Custom Claims    - messages              - askAICoach               │
│                     - coachAssignments      - setUserRole              │
│                     - medicineEntries                                  │
│                     - auditLogs (Immutable)                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
athlete-training-academy-v2/
├── app/                              # Expo Router file-based routes
│   ├── _layout.tsx                   # Root Stack with LocalizationProvider
│   ├── index.tsx                     # Entrypoint & auth redirect
│   ├── login.tsx                     # Authentication screen
│   ├── register.tsx                  # Registration screen
│   ├── role-selection.tsx            # Role selection (Athlete / Coach / Admin)
│   ├── quiz.tsx                      # Interactive Adaptive Quiz Engine
│   ├── roulette.tsx                  # Supplement Risk Simulator & Library
│   ├── achievements.tsx              # Badge Matrix & Trophy Room
│   ├── analytics.tsx                 # Athlete Knowledge Growth Charts
│   ├── learning-journey.tsx          # 16-Module Curriculum Navigator
│   ├── medicinescanner.tsx           # CameraView Barcode & Medicine Lookup
│   ├── ai-coach.tsx                  # AI Doping Coach & Chat Interface
│   ├── (tabs)/                       # Bottom Tab Navigation
│   │   ├── _layout.tsx               # Tab bar layout
│   │   ├── dashboard.tsx             # Athlete Dashboard & Daily Missions
│   │   ├── learn.tsx                 # Learning center
│   │   ├── play.tsx                  # Games & simulations
│   │   ├── ranks.tsx                 # National & Global Leaderboard
│   │   └── profile.tsx               # Athlete Profile, Settings & Language
│   ├── modules/                      # Dynamic Curriculum Lessons
│   │   └── [slug].tsx                # Dynamic renderer for all 16 modules
│   ├── coach/                        # Coach & Mentor Portal
│   │   ├── dashboard.tsx             # Coach KPIs & High-Risk Athlete Roster
│   │   ├── athletes.tsx              # Searchable Athlete Directory
│   │   └── athlete-detail.tsx        # In-depth module checklist & weak areas
│   └── chat/                         # Secure Communication
│       └── [conversationId].tsx      # Real-time 1-on-1 athlete-coach messaging
├── src/
│   ├── components/common/            # Reusable Design System Components
│   │   ├── AppButton.tsx             # Haptic-enabled primary/secondary buttons
│   │   ├── AppCard.tsx               # Elevated sports-modern cards
│   │   ├── AppBadge.tsx              # Anti-doping status & difficulty tags
│   │   ├── ProgressBar.tsx           # Reanimated animated progress bar
│   │   ├── HeaderBar.tsx             # Standard header with back navigation
│   │   ├── FeedbackCard.tsx          # Quiz explanation reveal card
│   │   └── index.ts                  # Component barrel export
│   ├── learning/
│   │   └── modules.ts                # Full 16-module curriculum & question bank
│   ├── localization/                 # Multilingual Architecture
│   │   ├── index.tsx                 # LocalizationProvider & useTranslation()
│   │   └── translations/
│   │       ├── en.ts                 # Complete English dictionary
│   │       └── hi.ts                 # Complete Hindi dictionary
│   ├── services/
│   │   ├── medicineReferenceService.ts # Verified medicine reference database
│   │   ├── adaptiveQuizService.ts      # Adaptive quiz algorithm & question pool
│   │   ├── aiCoachService.ts           # Grounded AI service & WADA citations
│   │   ├── coachService.ts             # Coach metrics, roster & summaries
│   │   └── chatService.ts              # Real-time messaging service
│   ├── types/                        # Strict TypeScript Type Definitions
│   │   ├── roles.ts                  # ATHLETE, COACH, ADMIN & permissions
│   │   ├── learning.ts               # 16 module keys, question types & quizzes
│   │   ├── medicine.ts               # Verified medicine record & WADA status
│   │   ├── ai.ts                     # AI message schema & learning context
│   │   ├── chat.ts                   # Conversation & message interfaces
│   │   ├── gamification.ts           # Badges, missions, milestones
│   │   └── userProfile.ts            # Expanded athlete profile type
│   └── firebase/                     # Firebase Client SDK Integrations
│       ├── config.ts                 # Firebase app, auth, db initialization
│       ├── userService.ts            # Profile retrieval & creation
│       ├── moduleService.ts          # Module progress tracking
│       ├── quizService.ts            # Server-side quiz arena submission
│       ├── medicineScannerService.ts # Scanner lookup & medicine saving
│       └── logoutservices.ts         # Secure auth sign-out
├── functions/                        # Firebase Cloud Functions (v2)
│   ├── src/index.ts                  # submitQuizArena, lookupMedicine, askAICoach, setUserRole
│   └── tsconfig.json                 # Cloud Functions TypeScript config
└── firestore.rules                   # Granular RBAC Firestore Security Rules
```

---

## 3. Anti-Doping Safety & Medicine Verification Pipeline

AntiDopX adheres to the strict ethical mandate that **no software should ever declare a medicine or supplement unconditionally "safe"** without proper anti-doping verification.

### Verification Flow:
1. **Barcode Capture**: Uses Expo 57 `CameraView` with `onBarcodeScanned` listener.
2. **Barcode Resolution**: Resolves against `medicineReferenceService` which indexes verified pharmaceutical barcodes (GS1 / EAN-13).
3. **Active Ingredient Decomposition**: Each medicine record includes an itemized breakdown of active pharmaceutical ingredients (APIs).
4. **WADA Classification**:
   - `ALLOWED`: Permitted under current WADA Prohibited List (with route restrictions noted).
   - `CAUTION`: Allowed with thresholds or restrictions (e.g., salbutamol inhaler dosage limits).
   - `PROHIBITED_IN_COMPETITION`: Banned in-competition (e.g., pseudoephedrine above 150 µg/mL).
   - `PROHIBITED_ALWAYS`: Banned at all times in and out of competition (e.g., anabolic agents, EPO).
   - `VERIFICATION_REQUIRED`: Insufficient data; athlete must consult team physician or Global DRO.
5. **Strict Liability Disclaimer**: Mandatory notice displayed on every scan reminding the athlete that under Article 2.1 of the World Anti-Doping Code, the athlete is strictly liable for any prohibited substance found in their sample.

---

## 4. Gamification & Progression Subsystem

- **16 Modules**: Covers everything from Anti-Doping Fundamentals to DCO Interactions and Whistleblowing.
- **Dynamic XP & Levels**:
  - Rookie (0 - 99 XP)
  - Competitor (100 - 299 XP)
  - Champion (300 - 999 XP)
  - Elite Athlete (1000+ XP)
- **Daily Missions**:
  - Daily login streak
  - Answer 5 quiz questions
  - Review 1 educational scenario
- **Anti-Cheat Validation**:
  - Quiz completions can be validated through Cloud Function `submitQuizArena` inside a Firestore transaction.
  - Capped maximum XP gains per day to prevent artificial score tampering.

---

## 5. Grounded AI Learning Coach Subsystem

The AI Coach assists athletes 24/7 with anti-doping regulations, lesson clarification, and exam revision without hallucinating medical safety.

- **Grounding**: All responses cite authoritative anti-doping references:
  - WADA World Anti-Doping Code (Code)
  - 2026 WADA Prohibited List
  - International Standard for Therapeutic Use Exemptions (ISTUE)
  - International Standard for Testing and Investigations (ISTI)
- **Personalized Context**: Athlete level, sport, current XP, and recent quiz mistakes are injected into the coach context.
- **Multilingual**: Supports seamless interaction in both English and Hindi.
- **Cloud Endpoint**: `askAICoach` Cloud Function allows plugging in Gemini Pro or OpenAI models with strict system instructions and automatic fallback.

---

## 6. Coach & Mentor Portal

- **Role-Based Access Control**:
  - Athletes access educational content, personal progress, scanner, and direct coach chat.
  - Coaches access roster metrics, aggregate quiz performance, weak topic identification, and individual athlete module checklists.
  - Admins retain system configuration rights and role assignments.
- **Real-Time 1-on-1 Chat**:
  - Subscribes to Firestore `conversations/{id}/messages` via `onSnapshot`.
  - Automatically updates `unreadCount` and timestamp on message delivery.
