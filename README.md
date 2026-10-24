# AntiDopX — Youth Athlete Anti-Doping Education & Mentorship Platform

AntiDopX is an educational and athlete-support mobile application designed for young athletes, coaches, mentors, and administrators. It combines anti-doping curriculum learning, interactive scenario simulations, real-time medicine safety verification, grounded AI mentorship, coach-athlete messaging, and an administrative control panel with role-based access control.

Built with **React Native**, **Expo SDK 57**, **Expo Router**, **TypeScript**, and **Firebase** (Authentication & Cloud Firestore).

---

## 1. Project Overview & Architecture

AntiDopX is architected with a multi-role structure:
- **Athletes:** Interactive curriculum modules, adaptive quizzes, streak and XP gamification, medicine barcode scanner, AI anti-doping advisor, and coach messaging.
- **Coaches / Mentors:** Coach portal with athlete performance monitoring, curriculum compliance tracking, risk-area discovery, and real-time direct messaging.
- **Parents / Guardians:** Dedicated youth athlete anti-doping handbook explaining Strict Liability, supplement hazards, and testing protocols.
- **Administrators:** Centralized Admin Panel with real-time Firestore synchronization, user directory management, role-based assignment, curriculum overview, WADA reference database, and audit logging.

---

## 2. Main Features

### Curriculum & Interactive Learning
- **16 WADA Curriculum Modules:** Structured lessons covering Strict Liability, Prohibited Lists, Therapeutic Use Exemptions (TUE), Sample Collection Protocols, Supplements & Contamination, Whistleblowing, and Mental Health.
- **Adaptive Quiz Arena:** Timed question challenges, answer feedback, multi-tier difficulty scoring, and verified level progression.
- **Interactive Scenarios ("What Would You Do?"):** Decision-tree simulations teaching athletes how to respond to real-world doping control scenarios and supplement offers.
- **Supplement Risk Simulator:** Educational roulette simulator highlighting inadvertent supplement contamination hazards.

### Medicine Scanner & Safety Verification
- **Camera-Based Barcode Scanner:** Real-time barcode inspection using Expo Camera with visual reticle and processing state.
- **WADA Reference Engine:** Mapped database of active ingredients, administration routes, and anti-doping statuses (`ALLOWED`, `USE_WITH_CAUTION`, `PROHIBITED`).
- **Safety Disclaimers:** Mandatory medical advisories reminding athletes to verify all medications with official National Anti-Doping Organizations (NADOs) or Global DRO.

### Grounded AI Anti-Doping Coach
- **Bilingual Assistance (English & Hindi):** Guidance on anti-doping rules, prohibited classes, and testing protocols.
- **Safety Guardrails:** Grounded strictly in WADA standards. Does not fabricate medical clearance; directs athletes to official testing bodies for specific prescriptions.

### Coach Portal & Mentorship
- **Team Oversight:** Real-time visibility into assigned athletes, quiz score averages, active streaks, and modules needing revision.
- **Direct Messaging:** 1-on-1 athlete-coach communication powered by Cloud Firestore listeners with clean unsubscriptions.

### Centralized Admin Panel
- **Multi-Tier Authorization:** Access gatekeeper enforced via server-verified custom claims, designated administrator UID (`EXPO_PUBLIC_ADMIN_UID`), and protected Firestore collections.
- **System Metrics & Directory:** Real-time counters for users, athletes, coaches, modules, and audits.
- **Audit Logging:** Immutable record of administrative operations stored in `/auditLogs`.

### Localization
- Native in-app switching between **English (EN)** and **Hindi (HI)** with persistent preferences stored via `@react-native-async-storage/async-storage`.

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Mobile Framework | Expo SDK 57 (`~57.0.26`), React Native `0.86.3`, React `19.2.3` |
| Routing & Navigation | Expo Router (`~57.0.24`) file-based navigation |
| Programming Language | TypeScript (`~6.0.3`) in strict mode |
| Authentication | Firebase Authentication (Email/Password, Google OAuth) |
| Cloud Database | Cloud Firestore (with real-time snapshot listeners) |
| Vector Iconography | `@expo/vector-icons` (`Feather`, `MaterialCommunityIcons`, `FontAwesome5`, `Ionicons`), `lucide-react-native` |
| UI & Layout | React Native Safe Area Context, Flexbox responsive layout |
| Device Hardware | Expo Camera (`CameraView`), Expo Haptics |

---

## 4. Prerequisites

Before setting up the project, ensure you have:
- **Node.js**: LTS version (v20.x or v22.x recommended)
- **npm** or **yarn** package manager
- **Git** version control
- **Expo Go** app on your physical mobile device (iOS/Android), or an Android Studio / Xcode emulator.

---

## 5. Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/manas67-droid/athlete-training-academy-v2.git
   cd athlete-training-academy-v2
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Firebase project identifiers and configuration:
   ```env
   # Designated single administrator UID
   EXPO_PUBLIC_ADMIN_UID=your_admin_firebase_uid

   # Firebase Client Credentials
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google OAuth Client ID (Optional)
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_oauth_client_id.apps.googleusercontent.com
   ```

---

## 6. Running the Application

### Start Development Server
```bash
npx expo start
```
Options available from the terminal:
- Press `a` to launch on Android emulator / connected device.
- Press `i` to launch on iOS simulator (macOS only).
- Press `w` to open web preview.
- Scan the printed QR code using the **Expo Go** mobile app.

### Run Verification & Type Checks
```bash
# Verify TypeScript strict type-safety across all routes and services
npx tsc --noEmit

# Run ESLint linter
npm run lint
```

---

## 7. Security & Access Control

AntiDopX follows strict defense-in-depth principles:

1. **Admin Authorization Gatekeeper (`AdminGuard`):**
   - Client routes under `/admin/*` verify that the active user's authentication token possesses either administrative custom claims or matches the designated `EXPO_PUBLIC_ADMIN_UID`.
   - Access attempts by unauthorized users display an Access Denied barrier and prevent rendering or execution of administrative operations.

2. **Firestore Security Rules (`firestore.rules`):**
   - The client UI is never trusted as the sole authorizer.
   - All mutations to `/users/{uid}`, `/auditLogs`, `/curriculumModules`, `/medicineEntries`, and `/systemSettings` are validated on the Firebase backend using `isAdmin()`, `isOwner()`, and `notEscalatingToAdmin()` functions.
   - Normal athletes or coaches cannot mutate role fields or access administrative data collections even if client-side code is altered.

3. **Secret Protection:**
   - Client-prefixed variables (`EXPO_PUBLIC_`) are bundled into client code. Never place server-side private keys or service account credentials in variables with this prefix.
   - All private keys, `.env` files, certificates, and credentials are listed in `.gitignore`.
   - Never commit `.env` or personal data (PII) to version control.

---

## 8. Hardware & Platform Compatibility

| Feature | Expo Go | Development Build (`npx expo run:*`) |
|---|---|---|
| Camera & Barcode Scanner | Fully Supported via `CameraView` | Fully Supported |
| Real-time Firestore Listeners | Fully Supported | Fully Supported |
| Vector Icon System | Fully Supported | Fully Supported |
| Haptic Feedback | Fully Supported | Fully Supported |
| Native Notifications | In-app / Simulated | Full APNs & FCM support |

---

## 9. Development & Contribution Guidelines

When building and testing this repository:
1. **Branching Strategy:**
   - `main`: Production-ready code.
   - `feature/<feature-name>`: New capabilities and screens.
   - `fix/<bug-name>`: Bug fixes and performance adjustments.
2. **Pre-Commit Checklist:**
   - Confirm TypeScript check passes: `npx tsc --noEmit`
   - Confirm no `.env` or credential files are staged: `git status`
   - Confirm no emojis are used as UI icons (use `@expo/vector-icons`).
3. **Submitting Changes:**
   - Create a pull request targeting `main` with a clear description of changes and testing steps.

---

## 10. Author & Developer

- **Creator & Lead Developer:** **Manish Yadav**
- **Project:** AntiDopX — Youth Athlete Anti-Doping Education & Mentorship Platform
- **Architecture:** Full-Stack Architecture, UI/UX Design System, Cloud Firestore Backend, Admin Panel, and Grounded AI Engine


