---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - c:\Projects\SpendWise\_bmad-output\planning-artifacts\prds\prd-SpendWise-2026-08-31\prd.md
  - c:\Projects\SpendWise\_bmad-output\planning-artifacts\architecture\arch-SpendWise-2026-08-31\ARCHITECTURE-SPINE.md
  - c:\Projects\SpendWise\_bmad-output\planning-artifacts\ux-designs\ux-SpendWise-2026-08-31\DESIGN.md
  - c:\Projects\SpendWise\_bmad-output\planning-artifacts\ux-designs\ux-SpendWise-2026-08-31\EXPERIENCE.md
---

# SpendWise - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for SpendWise, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Base Safe-to-Burn Calculation (StB = (Total Monthly Net Income - Fixed Monthly Obligations - Target Monthly Savings - Cumulative Month-to-Date Discretionary Spend) / Remaining Days in Cycle).
FR2: Glide Recovery for Overspending (Amortize deficit across 3-day Glide Window).
FR3: Streak & Combo Multiplier (Unspent daily amount rolls into remaining pool and increments Prudent Streak).
FR4: Hourly Wage Setup & Storage (User configures Net Hourly Rate; default fallback €10.00/hr).
FR5: Real-Time Life-Energy Display (All expense badges display "X hrs Y mins").
FR6: Automated 14-Day Check-in Scheduler (Notification 14 days after >€20 expense).
FR7: Regret Scoring & Anti-Persona Aggregation (Worth It vs Regret marking updates regret_status).
FR8: Quick-Log Resisted Impulse ("Saved It!" button logs avoided purchase without deducting from balances).
FR9: Willpower Compounding Calculator (Displays 10-year growth at 7% annual compounding rate).
FR10: Dual-Language Speech Parsing (Voice recognition in el-GR and en-US).
FR11: Greek & English Receipt OCR (Tesseract.js extracts totals using `eng+ell`).

### NonFunctional Requirements

NFR1: Performance (Safe-to-Burn and Life-Energy calculations must execute in < 10ms client-side).
NFR2: Privacy & Security (Salary data protected by Supabase RLS and encrypted local storage).
NFR3: Offline Resiliency (All StB and Life-Energy operations function offline, syncing to Supabase on reconnect).

### Additional Requirements

- AR1: Core Engine executes Client-Side.
- AR2: App reads exclusively from a local reactive store (Zustand/IndexedDB wrapper) as a write-through cache.
- AR3: Optimistic UI Updates (Mutate local state instantly, sync async).
- AR4: Device-Native Notification Scheduling (Capacitor/Web APIs).
- AR5: Naming conventions: PascalCase for components, snake_case for DB. Monetary amounts stored as cents in DB.

### UX Design Requirements

UX-DR1: Implement Sleek Dark Mode Glassmorphism with specific colors (Obsidian Dark, Electric Cyan, Emerald Mint, Brand Violet, Rose Coral).
UX-DR2: Implement 4px grid spacing, Glassmorphic Cards with blur(16px), Hero Glow (Cyan/Emerald drop shadow), and rounded borders (sm to full).
UX-DR3: Build `SafeToBurnCard` with circular SVG progress ring and Glide active sub-caption.
UX-DR4: Build `LifeEnergyBadge` as a glowing pill chip with hourglass/clock icon.
UX-DR5: Build `RegretCheckinModal` as a bottom-sheet modal with `[🔥 Worth It]` and `[👎 Regret]` buttons.
UX-DR6: Build `WillpowerLedgerCard` with Violet-to-emerald gradient shimmer border.
UX-DR7: Implement Instant Haptic / Spring Feedback using Framer Motion (`damping: 20, stiffness: 300`).
UX-DR8: Implement Swipe-to-Categorize / Edit on transaction list items.
UX-DR9: Ensure WCAG 2.1 AA contrast, Screen Reader support for Life-Energy badges, and 48x48px minimum touch targets.

### FR Coverage Map

- **FR1:** Epic 1 - Base Safe-to-Burn Calculation
- **FR2:** Epic 1 - Glide Recovery for Overspending
- **FR3:** Epic 1 - Streak & Combo Multiplier
- **FR4:** Epic 2 - Hourly Wage Setup & Storage
- **FR5:** Epic 2 - Real-Time Life-Energy Display
- **FR6:** Epic 3 - Automated 14-Day Check-in Scheduler
- **FR7:** Epic 3 - Regret Scoring & Anti-Persona Aggregation
- **FR8:** Epic 4 - Quick-Log Resisted Impulse
- **FR9:** Epic 4 - Willpower Compounding Calculator
- **FR10:** Epic 5 - Dual-Language Speech Parsing
- **FR11:** Epic 5 - Greek & English Receipt OCR

## Epic List

### Epic 1: Zero-Friction Daily Budgeting (The Safe-to-Burn Engine)
Users can instantly see their daily discretionary budget, automatically recover from overspending without guilt, and build prudent streaks.
**FRs covered:** FR1, FR2, FR3

### Epic 2: Life-Energy Labor Valuation
Users can configure their hourly wage and view the true labor cost of every purchase to reduce impulse buying.
**FRs covered:** FR4, FR5

### Epic 3: The 14-Day Anti-Regret Loop
Users are prompted to rate past purchases to discover their regret zones and build an "Anti-Persona" profile.
**FRs covered:** FR6, FR7

### Epic 4: The Willpower Ledger
Users can actively log resisted purchases and visualize how much wealth they are building over 10 years through willpower.
**FRs covered:** FR8, FR9

### Epic 5: Frictionless Multilingual Ingestion
Users can add expenses instantly by speaking in Greek/English or scanning receipts without manual data entry.
**FRs covered:** FR10, FR11

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic 1: Zero-Friction Daily Budgeting (The Safe-to-Burn Engine)

Users can instantly see their daily discretionary budget, automatically recover from overspending without guilt, and build prudent streaks.

### Story 1.1: Local Store & Base Safe-to-Burn Calculation

As a user,
I want my Safe-to-Burn daily budget calculated based on my income, fixed bills, savings, and remaining days,
So that I know exactly how much I can spend today.

**Acceptance Criteria:**

**Given** the user has entered their monthly income and fixed obligations,
**When** the app calculates the Safe-to-Burn allowance (using Zustand/IndexedDB),
**Then** the formula `(Income - Obligations - Savings - Spend) / Remaining Days` is applied,
**And** the calculation executes entirely on the client in under 10ms.

### Story 1.2: Glide Recovery for Overspending

As a user,
I want overspending to be amortized over a 3-day Glide Window,
So that my budget for the next day isn't immediately reduced to zero.

**Acceptance Criteria:**

**Given** the user spends more than their daily Safe-to-Burn allowance,
**When** calculating the next day's budget,
**Then** the deficit is divided evenly across the next 3 days,
**And** the UI state reflects that a "Glide Window" is active.

### Story 1.3: Prudent Streak & Combo Multiplier

As a user,
I want my unspent daily funds to roll over into my remaining pool and increase my Prudent Streak,
So that I feel positively rewarded for saving money.

**Acceptance Criteria:**

**Given** the user spends less than their Safe-to-Burn allowance by the end of the day,
**When** the new day begins,
**Then** the unspent amount is added to the remaining monthly pool,
**And** the user's "Prudent Streak" counter increments by 1.

### Story 1.4: SafeToBurnCard UI Component

As a user,
I want to see my daily budget in a glowing glassmorphic card with a circular progress ring,
So that I can understand my financial status at a glance.

**Acceptance Criteria:**

**Given** the Safe-to-Burn value is calculated,
**When** the dashboard renders,
**Then** it displays the `SafeToBurnCard` using Dark Mode Glassmorphism and a circular SVG progress ring,
**And** it uses Framer Motion spring physics for haptic feedback when tapped.

## Epic 2: Life-Energy Labor Valuation

Users can configure their hourly wage and view the true labor cost of every purchase to reduce impulse buying.

### Story 2.1: Hourly Wage Setup & Storage

As a user,
I want to configure my Net Hourly Rate or provide my monthly income and hours worked,
So that the app can accurately calculate the time value of my money.

**Acceptance Criteria:**

**Given** the user navigates to the Settings profile,
**When** they enter their wage details,
**Then** the rate is securely stored in Supabase with RLS policies,
**And** it defaults to `€10.00/hr` if left unconfigured.

### Story 2.2: Real-Time Life-Energy Calculation

As a user,
I want every expense amount dynamically divided by my hourly rate,
So that I know how many hours of work a purchase represents.

**Acceptance Criteria:**

**Given** the user views any transaction or expense,
**When** the amount is processed by the Life-Energy engine,
**Then** it is accurately converted to an "X hrs Y mins" format based on the stored hourly rate,
**And** the calculation executes instantly on the client.

### Story 2.3: LifeEnergyBadge UI Component

As a user,
I want to see the labor time cost displayed as a distinct visual badge,
So that it stands out immediately when I am reviewing prices.

**Acceptance Criteria:**

**Given** an expense is displayed on screen,
**When** rendering the `LifeEnergyBadge`,
**Then** it renders as a glowing pill chip with an hourglass/clock icon,
**And** screen readers properly announce it meeting WCAG 2.1 AA standards.

## Epic 3: The 14-Day Anti-Regret Loop

Users are prompted to rate past purchases to discover their regret zones and build an "Anti-Persona" profile.

### Story 3.1: Regret Check-in Notification Scheduler

As a user,
I want the system to schedule a check-in 14 days after a discretionary purchase,
So that I can honestly evaluate if it was worth the money.

**Acceptance Criteria:**

**Given** the user logs a discretionary purchase > €20,
**When** the transaction is saved,
**Then** the app schedules a local device notification for exactly 14 days later using `@capacitor/local-notifications`.

### Story 3.2: RegretCheckinModal Component & Logging

As a user,
I want to easily mark a past purchase as "Worth It" or "Regret" via a single tap,
So that tracking my feelings about past spending feels effortless.

**Acceptance Criteria:**

**Given** the 14-day check-in is triggered,
**When** the user opens the `RegretCheckinModal`,
**Then** they see two large buttons `[🔥 Worth It]` and `[👎 Regret]`,
**And** tapping either instantly updates the `regret_status` in Supabase and dismisses the modal.

### Story 3.3: Anti-Persona Aggregation

As a user,
I want the app to summarize my highest-regret categories,
So that I know where my financial blind spots are.

**Acceptance Criteria:**

**Given** the user has rated several past purchases,
**When** they view their profile insights,
**Then** the app calculates the Regret Quotient (Regret / Total) per category,
**And** displays the top 2 highest-regret categories as an "Anti-Persona".

## Epic 4: The Willpower Ledger

Users can actively log resisted purchases and visualize how much wealth they are building over 10 years through willpower.

### Story 4.1: Quick-Log Resisted Impulse

As a user,
I want to actively log a purchase I walked away from using a "Saved It!" button,
So that I get immediate positive reinforcement for not spending.

**Acceptance Criteria:**

**Given** the user clicks the "Saved It!" FAB action,
**When** they enter the amount they avoided spending,
**Then** the entry is recorded in the `resisted_impulses` table without affecting their bank balance or Safe-to-Burn allowance.

### Story 4.2: Willpower Compounding Calculator

As a user,
I want the app to project the long-term value of my saved impulses,
So that I understand the massive future impact of small daily decisions.

**Acceptance Criteria:**

**Given** the user has resisted impulses recorded,
**When** calculating the willpower totals,
**Then** the system calculates a simulated 10-year growth assuming a 7.0% annual compounding rate.

### Story 4.3: WillpowerLedgerCard Component

As a user,
I want to see my resisted impulse achievements in a beautifully designed card,
So that I feel a sense of pride in my financial discipline.

**Acceptance Criteria:**

**Given** the user views the Willpower Vault,
**When** the `WillpowerLedgerCard` renders,
**Then** it displays the Total Saved and 10-Year Future Value using a violet-to-emerald gradient shimmer border.

## Epic 5: Frictionless Multilingual Ingestion

Users can add expenses instantly by speaking in Greek/English or scanning receipts without manual data entry.

### Story 5.1: Dual-Language Speech Parsing

As a user,
I want to dictate expenses in either Greek or English,
So that I don't have to type them out manually.

**Acceptance Criteria:**

**Given** the user activates the microphone via the FAB,
**When** they speak an expense in Greek (e.g., "50 ευρώ στο σούπερ μάρκετ") or English,
**Then** `@capacitor-community/speech-recognition` accurately extracts the Amount and Category in under 800ms.

### Story 5.2: Greek & English Receipt OCR

As a user,
I want to scan a receipt with my camera to extract the total amount automatically,
So that logging physical purchases takes zero effort.

**Acceptance Criteria:**

**Given** the user takes a photo of a receipt,
**When** the image is processed,
**Then** `Tesseract.js` initialized with `eng+ell` language models accurately extracts the total sum.
