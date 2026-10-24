# AntiDopX Security & Compliance Guide

AntiDopX handles sensitive athlete training data, anti-doping educational evaluations, medicine inquiries, and coach-athlete communications. Security, confidentiality, and data integrity are core architectural priorities.

---

## 1. Authentication & Identity

- AntiDopX integrates **Firebase Authentication** supporting email/password and token-based credentials.
- Upon successful login, the user's role (`ATHLETE`, `COACH`, or `ADMIN`) is validated from both custom auth claims and the `/users/{uid}` document.
- Unauthenticated requests to restricted collections or Cloud Functions are rejected with HTTP 401 (`unauthenticated`).

---

## 2. Role-Based Access Control (RBAC) Matrix

| Resource Collection | Athlete Access | Coach Access | Admin Access |
|---|---|---|---|
| `users/{uid}` (Own Profile) | Read / Partial Update | Read / Partial Update | Full CRUD |
| `users/{uid}` (Other Athletes) | Read-only (Leaderboard safe) | Read (Assigned athletes) | Full CRUD |
| `conversations/{convId}` | Read / Write if Participant | Read / Write if Participant | Full CRUD |
| `messages/{msgId}` | Read / Create if Participant | Read / Create if Participant | Full CRUD |
| `coachAssignments` | Read (Own assignment) | Read / Create for Roster | Full CRUD |
| `medicineEntries` | Read-only | Read-only | Full CRUD |
| `challenges` | Read-only | Read-only | Full CRUD |
| `leaderboard` | Read-only | Read-only | Write / Manage |
| `auditLogs` | No Access | No Access | Read-only (Write via Cloud Functions) |

---

## 3. Firestore Security Rules

Firestore rules enforce strict validation at the database layer:

1. **Profile Data Tampering Prevention**:
   Athletes cannot directly modify their XP, streak, or levels outside of validated transaction routes.
2. **Conversation Confidentiality**:
   Messages within a conversation subcollection can ONLY be read or written by users present in `conversations/{convId}.participants`.
3. **Immutable Audit Logging**:
   The `/auditLogs` collection is write-protected from all clients; records can only be created by server-side Firebase Cloud Functions using the Admin SDK.

---

## 4. Anti-Doping Medical Safety Standards

1. **No False-Safety Guarantees**:
   Software must never issue a guarantee that an over-the-counter medicine or dietary supplement is 100% free of prohibited substances.
2. **Batch Contamination Risk**:
   Athletes are repeatedly educated that dietary supplements carry high risks of cross-contamination during manufacturing.
3. **Strict Liability (WADA Code Article 2.1)**:
   Under anti-doping regulations, athletes bear personal responsibility for any prohibited substance found in their biological sample. The application prominently displays warnings to consult qualified team physicians or official NADO databases (e.g., Global DRO).

---

## 5. Vulnerability Reporting

If you identify a security or privacy vulnerability in AntiDopX, please submit a report immediately to `security@antidopx.org`.
