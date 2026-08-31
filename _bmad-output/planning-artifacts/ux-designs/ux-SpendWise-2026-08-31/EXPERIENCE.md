---
name: SpendWise
status: final
sources:
  - {planning_artifacts}/prds/prd-SpendWise-2026-08-31/prd.md
updated: 2026-08-31
---

# SpendWise — Experience Spine

## Foundation

Single-source-of-truth React 18 + Capacitor 8 architecture delivering equal fidelity across Web (PWA) and Android Native. Inherits platform conventions for navigation, native camera access for OCR (`tesseract.js`), and native speech recognition (`@capacitor-community/speech-recognition`) with web fallbacks (`webkitSpeechRecognition`).

`DESIGN.md` defines the visual tokens and component aesthetics; this spine defines the information architecture, behavioral rules, microcopy, and interactive flows.

---

## Information Architecture

| Surface | Reached from | Purpose |
|---|---|---|
| **Dashboard (Home)** | App launch / Bottom nav | Daily Safe-to-Burn hero, Prudent Streak, recent transactions with Life-Energy badges, and Quick Action buttons. |
| **Transaction Ingestion** | FAB (+) / Voice / OCR modal | Add expense/income with instant Life-Energy feedback in Greek (`el-GR`) or English (`en-US`). |
| **14-Day Regret Hub** | Notification tap / Profile insights | Review past purchases 14 days later, view Anti-Persona high-regret charts. |
| **Willpower Vault** | Dashboard card tap / FAB "Saved It!" | Track resisted impulse cash and see projected 10-year compounding future value. |
| **Settings & Wage Profile** | Top-right gear icon | Configure Net Hourly Rate, currency, language, biometrics, and notification thresholds. |

---

## Voice and Tone (Microcopy)

| Do | Don't |
|---|---|
| *"Safe-to-Burn today: €38.50"* | *"Daily Budget: €38.50 remaining"* |
| *"You're gliding overspend by €10/day over the next 3 days."* | *"Warning: Budget exceeded by €30!"* |
| *"This purchase equals 2 hrs 15 mins of your life."* | *"Cost: €45.00"* |
| *"14 days later: Was this dinner worth the 1.5 hrs of work?"* | *"Rate this transaction"* |
| *"You just saved €65 of your future freedom."* | *"Transaction canceled"* |

---

## Component Patterns (Behavioral)

| Component | Surface | Behavioral Rules |
|---|---|---|
| **SafeToBurnCard** | HomeView | Renders rolling daily burn allowance. Tapping opens a breakdown modal showing `Total Income - Bills - Savings / Days Remaining`. Re-computes instantly on transaction sync. |
| **LifeEnergyBadge** | TransactionItem, ScannerModal, AddModal | Dynamically divides amount by stored `hourly_rate`. If hourly rate is unconfigured, displays subtle prompt *"Set wage to unlock labor time"*. |
| **RegretCheckinModal** | Local Notification / HomeView banner | Opens when a 14-day check-in is pending. Features two one-tap actions `[Worth It]` and `[Regret]`. Dismissing snoozes for 24h. |
| **WillpowerFabAction** | Global Floating Action Menu | Opens quick-input for resisted purchases. Triggers a 2-second celebratory particle burst upon submission. |

---

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| **Cold Open (Online)** | Dashboard | Instantly loads cached Safe-to-Burn value while syncing with Supabase in background (< 150ms). |
| **Cold Open (Offline)** | Dashboard | Displays full dashboard with local SQLite/IndexedDB state. Shows subtle offline pill in header; all features remain fully interactive. |
| **Overspend Gliding Active** | SafeToBurnCard | Displays adjusted daily burn number with a gentle amber subtext: `Gliding +€30 overspend over 3 days`. |
| **Unset Hourly Rate** | LifeEnergyBadge | Displays default `€10/hr` fallback with a small dotted underline inviting the user to customize their wage. |
| **Zero Discretionary Funds** | Dashboard | Card displays `€0.00 Safe-to-Burn` with an option to draw emergency buffer or rebalance monthly goals. |

---

## Interaction Primitives

- **Instant Haptic / Spring Feedback:** Every button tap and toggle uses Framer Motion spring physics (`damping: 20, stiffness: 300`).
- **Single-Tap Ratings:** Regret check-ins require exactly one tap to resolve and dismiss.
- **Swipe-to-Categorize / Edit:** Transaction list items support swipe left to delete and swipe right to edit.
- **Voice Ingestion:** Tap mic → speak in Greek or English → auto-parses amount and category in `< 800ms`.

---

## Accessibility Floor

- **Contrast:** All text on dark glassmorphism surfaces satisfies WCAG 2.1 AA (minimum contrast ratio ≥ 4.5:1).
- **Screen Readers:** Screen readers announce Life-Energy badges as `"Cost: 45 euros, equivalent to 3 hours of labor"`.
- **Dynamic Type:** All numbers scale with Android / iOS system accessibility text size settings.
- **Touch Target Floor:** All interactive buttons and chips have a minimum touch target of `48 x 48 px`.

---

## Key User Flows

### Flow 1: Morning Safe-to-Burn Quick Check (Nikos)
1. Nikos unlocks his phone and opens SpendWise.
2. The app cold-starts in 120ms with cached state.
3. The central `SafeToBurnCard` glows cyan: `€42.00 Safe-to-Burn Today`.
4. Nikos smiles, knowing his exact discretionary budget for lunch and coffee.
5. He closes the app. Total time in app: **3.5 seconds**.

### Flow 2: 14-Day Regret Micro-Checkin (Elena)
1. Elena receives a notification: *"Was your €110 purchase at Zara 14 days ago worth 7 hours of work?"*
2. She taps the notification.
3. SpendWise opens directly to the `RegretCheckinModal`.
4. She taps `[👎 Regret]`.
5. **Climax:** The modal smoothly dissolves with a confirmation: *"Noted. We'll help you watch out for fast-fashion impulses."*
6. Her Anti-Persona chart updates in the background.

---

## Mocks Reference

- [Safe-to-Burn Interactive Mockup](file:///c:/Projects/SpendWise/_bmad-output/planning-artifacts/ux-designs/ux-SpendWise-2026-08-31/mockups/safe-to-burn-mockup.html)
