---
title: SpendWise - Zero-Friction Life-Energy Financial Engine
status: final
created: 2026-08-31
updated: 2026-08-31
---

# PRD: SpendWise (Zero-Friction Life-Energy Financial Engine)

## 0. Document Purpose

This Product Requirement Document (PRD) establishes the functional and psychological specification for the flagship differentiation of SpendWise. It is authored for developers, designers, and system architects transitioning from ideation to implementation. It builds directly upon the existing SpendWise architecture (`React 18`, `Vite`, `TailwindCSS`, `Capacitor 8`, `Supabase PostgreSQL/Auth`, `Vercel Serverless`) as documented in [AGENTS.md](file:///c:/Projects/SpendWise/AGENTS.md) and [ARCHITECTURE.md](file:///c:/Projects/SpendWise/ARCHITECTURE.md).

---

## 1. Vision

Most personal finance applications fail because they demand unsustainable cognitive overhead: users are forced into manual receipt categorization, rigid monthly envelope accounting, and punitive red alerts when life happens. 

**SpendWise transforms personal finance from administrative friction into intuitive psychological clarity.**

SpendWise merges two breakthrough paradigms:
1. **Zero-Friction Daily "Safe-to-Burn" Allowance:** A single dynamic number presented every morning. If an overspending spike occurs, the engine automatically contracts and "glides" the allowance over the next 3–4 days without guilt or budget breakdown.
2. **Life-Energy Labor Valuation & Regret Feedback:** Reframing currency into finite hours and minutes of life worked based on the user's net wage, accompanied by a 14-day post-purchase feedback loop that builds a personal "Anti-Persona" profile to eliminate recurring impulse waste.

---

## 2. Target User & Journeys

### 2.1 Jobs To Be Done (JTBD)
- **Functional:** *"When I open my phone in the morning, I want to know exactly how much I can spend today without checking five bank accounts or spreadsheet rows."*
- **Emotional:** *"When I buy something on impulse, I want a meaningful reality-check that stops me from wasting hard-earned hours of my life, without shaming me."*
- **Psychological:** *"When I overspend on a Friday night, I want my app to adjust gracefully so I don't feel like a financial failure and abandon my budget."*
- **Motivational:** *"When I choose not to buy something frivolous, I want immediate positive reinforcement showing what that willpower is building for my future."*

### 2.2 Non-Users (v1)
- Corporate expense accounting teams requiring complex multi-currency ledger reconciliation.
- Day traders or active stock portfolio managers looking for live stock ticker integrations.

### 2.3 Key User Journeys

#### UJ-1: Nikos checks his Morning Safe-to-Burn
- **Persona & Context:** Nikos (29, software designer in Athens) wants to know what he can spend on lunch and leisure today.
- **Entry State:** Authenticated via Biometric on PWA/Android.
- **Path:** Nikos unlocks his phone. The SpendWise home screen displays a glowing central ring: `Safe-to-Burn Today: €38.50`. He taps the ring to see that recurring rent and bills are already factored in.
- **Climax:** He instantly knows his daily discretionary boundary without looking at a single receipt or spreadsheet.
- **Resolution:** He closes the app in under 4 seconds, confident in his daily spending limit.

#### UJ-2: Elena scans a receipt and sees Life-Energy Cost
- **Persona & Context:** Elena (34, architect) is considering buying a €140 designer lamp while shopping.
- **Entry State:** Mobile app open, camera permission active.
- **Path:** Elena opens the SpendWise scanner modal. She takes a photo of the price tag. `Tesseract.js` extracts `€140.00`.
- **Climax:** Beside the price, the app renders a glowing badge: `⏳ 9 hrs 20 mins of life energy`.
- **Resolution:** Elena evaluates whether the lamp is worth a full working day at her desk. She decides to buy it and logs it, knowing its true labor cost.

#### UJ-3: Nikos completes a 14-Day Regret Micro-Checkin
- **Persona & Context:** Nikos bought an expensive pair of sunglasses two weeks ago for €120 (8 hours of labor).
- **Entry State:** Background local notification triggered on Android/PWA.
- **Path:** A quiet notification asks: *"14 days ago you spent 8 hrs of life energy on Sunglasses. Was it worth it?"* Nikos taps the prompt.
- **Climax:** A two-button modal pops up: `[🔥 Worth It]` or `[👎 Regret]`. He taps `[👎 Regret]`.
- **Resolution:** SpendWise flags "Fashion/Accessories" as an impulsive high-regret zone and saves it to his Anti-Persona insights.

#### UJ-4: Elena logs a Resisted Impulse Willpower Win
- **Persona & Context:** Elena is browsing an online store and almost buys a €65 sweater she doesn't need.
- **Entry State:** Opens SpendWise quick-action FAB.
- **Path:** Elena taps the *"Saved It!"* willpower button, enters `€65`, and tags it "Online Shopping".
- **Climax:** The screen bursts with a subtle particle animation. Her **Willpower Portfolio** updates: `Total Impulse Cash Resisted: €480` → `Projected 10-Yr Compounded Value: €942`.
- **Resolution:** Elena feels a dopamine hit for saving rather than spending.

---

## 3. Glossary

- **Safe-to-Burn (StB):** The calculated daily discretionary allowance available to the user after accounting for fixed monthly commitments (rent, utilities, debt), savings targets, and remaining days in the billing cycle.
- **Net Hourly Rate (NHR):** The user's actual hourly labor value, calculated from monthly net income divided by monthly work hours, or inputted directly.
- **Life-Energy Cost (LEC):** The cost of any transaction expressed in Hours and Minutes of work (`LEC = Transaction Amount / NHR`).
- **Glide Window:** A rolling 3 to 4-day recovery window over which daily deficits from overspending are amortized without failing the monthly budget.
- **Regret Quotient (RQ):** The percentage of discretionary transactions tagged as `Regret` during 14-day micro-checkins within a given category.
- **Resisted Impulse (RI):** An unspent amount logged intentionally by the user when walking away from an unnecessary purchase.
- **Anti-Persona:** An aggregated behavioral summary showing the user's top high-regret merchants and categories.

---

## 4. Features & Functional Requirements

### 4.1 Dynamic Daily Safe-to-Burn Engine
**Description:** Calculates, displays, and dynamically adjusts the daily discretionary spending target. Handles smooth recovery over overspend days without requiring manual category balancing. Realizes UJ-1.

#### FR-1: Base Safe-to-Burn Calculation
The system shall calculate the daily discretionary allowance using the formula:
`StB = (Total Monthly Net Income - Fixed Monthly Obligations - Target Monthly Savings - Cumulative Month-to-Date Discretionary Spend) / Remaining Days in Cycle`.
- **Consequences (Testable):**
  - If Monthly Income = €2000, Fixed Obligations = €1000, Target Savings = €400, Month-to-Date Discretionary Spend = €0 on Day 1 of a 30-day month, `StB` equals exactly `€20.00`.
  - Recalculates in real time upon any transaction insertion, update, or deletion.

#### FR-2: Glide Recovery for Overspending
When daily discretionary spend exceeds the current day's `StB`, the engine shall amortize the deficit across a configurable Glide Window (default: 3 days) rather than dropping tomorrow's budget to zero.
- **Consequences (Testable):**
  - If today's `StB` is €20 and user spends €50 (deficit of €30), the next 3 days' baseline allowances are contracted by €10/day rather than penalizing tomorrow with -€10.
  - If total remaining cycle allowance reaches €0, `StB` displays `€0.00` with an emergency alert.

#### FR-3: Streak & Combo Multiplier
When daily spend is less than `StB`, the unspent amount automatically rolls into the remaining monthly pool and increments the user's "Prudent Streak" counter.
- **Consequences (Testable):**
  - Displays a visual streak indicator on the main dashboard (`HomeView.jsx`).

---

### 4.2 Life-Energy Labor Cost Conversion
**Description:** Automatically converts every expense, OCR-scanned receipt, and voice input into hours and minutes of work. Realizes UJ-2.

#### FR-4: Hourly Wage Setup & Storage
The user can configure their `Net Hourly Rate` either by entering their exact hourly wage or by providing Monthly Net Income and Weekly Working Hours.
- **Consequences (Testable):**
  - Stored securely in `user_settings` table in Supabase.
  - Default fallback rate is set to `[ASSUMPTION: Default fallback hourly wage = €10.00/hr if unconfigured]`.

#### FR-5: Real-Time Life-Energy Display
Every transaction list item, receipt scan result, and expense entry modal must display the Life-Energy Cost badge formatted as `X hrs Y mins`.
- **Consequences (Testable):**
  - For `NHR = €15.00/hr`, a transaction of `€45.00` displays `3 hrs 0 mins`.
  - For `NHR = €20.00/hr`, a transaction of `€5.00` displays `15 mins`.

---

### 4.3 14-Day Anti-Regret Verification Loop
**Description:** Prompts the user 14 days after discretionary purchases to score their satisfaction, building an actionable Anti-Persona report. Realizes UJ-3.

#### FR-6: Automated 14-Day Check-in Scheduler
The system schedules a verification check-in exactly 14 days after any discretionary expense greater than a user-defined threshold `[ASSUMPTION: Default threshold = €20.00]`.
- **Consequences (Testable):**
  - Fixed recurring bills (e.g. rent, electricity) are exempt from regret check-ins.
  - Uses `@capacitor/local-notifications` on native Android and Web Notifications on PWA.

#### FR-7: Regret Scoring & Anti-Persona Aggregation
The user can mark a transaction as either `Worth It` or `Regret` via a single-tap interface.
- **Consequences (Testable):**
  - Updates the `regret_status` column in the Supabase `transactions` table.
  - Computes category-level Regret Quotient (`Total Regret Purchases / Total Rated Purchases`).
  - Displays an "Anti-Persona Insights" card highlighting the top 2 highest-regret categories.

---

### 4.4 Resisted Impulse Willpower Ledger
**Description:** Provides an immediate positive feedback loop when users resist impulse spending, projecting long-term compounded growth. Realizes UJ-4.

#### FR-8: Quick-Log Resisted Impulse
The user can log an avoided purchase by tapping the *"Saved It!"* action button, specifying the amount and category.
- **Consequences (Testable):**
  - Records the entry in a dedicated `resisted_impulses` table without deducting from bank balances or `StB`.

#### FR-9: Willpower Compounding Calculator
Calculates and displays the simulated 10-year growth of all resisted impulse funds assuming a standard conservative annual return `[ASSUMPTION: Default annual compounding rate = 7.0%]`.
- **Consequences (Testable):**
  - Displays `Total Saved: €X` alongside `10-Year Future Value: €Y`.

---

### 4.5 Multilingual & Voice Integration (Greek & English)
**Description:** Ensures seamless operation across Greek and English language contexts for voice parsing and OCR extraction.

#### FR-10: Dual-Language Speech Parsing
Voice recognition (`@capacitor-community/speech-recognition` and `webkitSpeechRecognition`) must support `el-GR` and `en-US`, extracting amount and category accurately.
- **Consequences (Testable):**
  - "50 ευρώ στο σούπερ μάρκετ" resolves to `Amount: 50`, `Category: Supermarket`, `Type: Expense`.

#### FR-11: Greek & English Receipt OCR
`Tesseract.js` must initialize with `eng+ell` language models to extract total sums from Greek and international merchant receipts.

---

## 5. Non-Goals (Explicit for v1)

- **Direct Open-Banking Bank Feeds:** We will not build direct PSD2/Plaid live bank syncing in v1 to avoid high regulatory and subscription costs. Fast manual entry, OCR, and voice input remain the primary ingestion channels.
- **Cryptocurrency Wallet Management:** No native crypto wallet connections or live blockchain tracking in v1.
- **Shared Multi-User Joint Accounts:** Multi-user shared vaults and joint budgets are deferred to v2.

---

## 6. MVP Scope

### 6.1 In Scope (v1)
- Safe-to-Burn calculation engine with 3-day Glide Window.
- Net Hourly Rate configuration & Life-Energy Cost badges on all transactions.
- 14-day local notification check-ins with single-tap `[Worth It / Regret]` ratings.
- "Saved It!" Willpower Ledger with compounding future-value visualizer.
- Full offline-first support via local caching and Supabase sync.
- Dual language support (English & Greek) for UI, OCR (`eng+ell`), and Voice (`el-GR`).

### 6.2 Out of Scope for MVP (Deferred to v2)
- Audio synthesis for the Future-Self avatar (deferred due to mobile TTS latency and API costs).
- Geofenced GPS spending temptation locks.
- Grocery receipt nutritional analysis.

---

## 7. Success Metrics & Counter-Metrics

### Primary Metrics
- **SM-1 (D14 App Retention):** Reach ≥ 45% Day-14 retention rate driven by the zero-friction Safe-to-Burn morning check. Validates FR-1, FR-2.
- **SM-2 (Regret Reduction):** Average user Regret Quotient decreases by ≥ 20% between Month 1 and Month 3 of app usage. Validates FR-6, FR-7.
- **SM-3 (Willpower Engagement):** ≥ 30% of active users log at least one "Saved It!" resisted impulse per week. Validates FR-8, FR-9.

### Counter-Metrics (What NOT to optimize)
- **SM-C1 (Avoid Time-in-App Bloat):** Average time spent per logging session must remain under 15 seconds. We do not want users spending hours micromanaging categories.
- **SM-C2 (Avoid Financial Guilt Abandonment):** Overspending event churn rate should be < 5%. The glide algorithm must prevent users from deleting the app after budget blowouts.

---

## 8. Cross-Cutting Non-Functional Requirements (NFRs)

- **NFR-1 (Performance):** Safe-to-Burn and Life-Energy calculations must execute in `< 10ms` client-side without network roundtrips.
- **NFR-2 (Privacy & Security):** Salary and income data used for Net Hourly Rate must be protected by PostgreSQL Row Level Security (RLS) and stored in encrypted local storage.
- **NFR-3 (Offline Resiliency):** All Safe-to-Burn and Life-Energy operations must function seamlessly when offline, syncing mutations to Supabase upon reconnect.

---

## 9. Open Questions & Assumptions Index

### Assumptions
1. `[ASSUMPTION: Default fallback hourly wage = €10.00/hr]` if user skips income onboarding.
2. `[ASSUMPTION: Default regret notification threshold = €20.00]` to avoid spamming micro-purchases like chewing gum.
3. `[ASSUMPTION: Default Glide Window = 3 days]` for amortizing overspending deficits.
4. `[ASSUMPTION: Compounding annual interest rate for Willpower Portfolio = 7.0%]`.

### Open Questions
1. Should the user be allowed to customize the 14-day regret check-in duration (e.g. 7 days vs 30 days)? *(Recommended: Default to 14 days, add setting in v1.1).*
2. Should unspent Safe-to-Burn automatically increase the monthly savings vault balance at the end of each billing cycle? *(Recommended: Yes, prompt on last day of cycle).*
