---
name: SpendWise
description: Zero-Friction Life-Energy Financial Engine. Rich dark-mode luxury fintech aesthetic with emerald, cyan, and violet accents.
colors:
  surface-base: '#F9F9F9'
  surface-raised: '#FFFFFF'
  surface-dark: '#0D1117'
  surface-dark2: '#161B22'
  surface-dark3: '#21262D'
  surface-dark4: '#30363D'
  ink-primary: '#0F172A'
  ink-secondary: '#64748B'
  ink-primary-dark: '#F8FAFC'
  ink-secondary-dark: '#94A3B8'
  brand-violet: '#8B5CF6'
  accent-cyan: '#06B6D4'
  accent-emerald: '#10B981'
  accent-amber: '#F59E0B'
  accent-rose: '#F43F5E'
  border-subtle: 'rgba(255, 255, 255, 0.08)'
  border-glow: 'rgba(6, 182, 212, 0.3)'
typography:
  headline:
    note: 'Inter / Plus Jakarta Sans — 2rem (32px), Bold / ExtraBold, letter-spacing -0.02em'
  title:
    note: 'Inter — 1.25rem (20px), SemiBold, letter-spacing -0.01em'
  body:
    note: 'Inter — 0.9375rem (15px), Regular / Medium, line-height 1.5'
  meta:
    note: 'Inter — 0.75rem (12px), Medium / SemiBold, uppercase tracking 0.04em'
rounded:
  sm: 8px
  md: 14px
  lg: 24px
  xl: 32px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
---

# SpendWise — Visual Design Spine

## Brand & Style

SpendWise combines the precision of high-end financial instruments with the warmth and emotional relief of stress-free daily life. It departs completely from boring spreadsheet software, sterile banking interfaces, and punitive budgeting apps that yell at users in red.

The visual language is anchored in **Sleek Dark Mode Glassmorphism**:
- Deep obsidian and charcoal surfaces layered with subtle translucent gradients.
- Vibrant, intentional status indicators: **Cyan / Emerald** for safe daily allowance and labor savings; **Violet** for wisdom, goals, and analytics; **Amber / Rose** for attention and overspend recovery.
- Micro-delight: Smooth Framer Motion spring curves, glowing progress rings, and tactile feedback on taps.

---

## Colors

- **Obsidian Dark (`#0D1117`) & Dark Slate (`#161B22`):** The primary foundations in dark mode. Eliminates eye fatigue and lets bright financial metrics pop without visual noise.
- **Electric Cyan (`#06B6D4`):** The hero color for **Safe-to-Burn Today**. Signals clean clarity, dynamic cashflow, and active liquidity.
- **Emerald Mint (`#10B981`):** Represents wealth accumulation, resisted impulses, and `[Worth It]` ratings.
- **Brand Violet (`#8B5CF6`):** Used for primary action buttons, AI insights, and settings.
- **Rose Coral (`#F43F5E`):** Used strictly for high-regret categories and glide-window deficit alerts. Never used to shame the user.

---

## Typography

- **Headlines (`headline`):** Clean, geometric sans (`Inter` / `Plus Jakarta Sans`) with tight tracking for hero financial figures (e.g. `€42.50`).
- **Section Titles (`title`):** SemiBold headers for cards and modules.
- **Body (`body`):** High-legibility regular weight for descriptions, transaction titles, and breakdown notes.
- **Meta / Badges (`meta`):** Small, crisp uppercase text for category tags and Life-Energy chips (`⏳ 1 HR 20 MINS`).

---

## Layout & Spacing

Scale follows a strict 4px grid: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 px`.
- Mobile canvas padding: `16px` on phone screens, `24px` on tablet / desktop viewports.
- Card padding: `20px` internally to give financial data room to breathe.
- Single-column vertical scroll on mobile; maximum modal depth is exactly 1 level.

---

## Elevation & Depth

- **Glassmorphic Cards:** `background: rgba(22, 27, 34, 0.85)`, `backdrop-filter: blur(16px)`, with a hairline border `border: 1px solid rgba(255, 255, 255, 0.08)`.
- **Hero Glow:** Subtle cyan/emerald drop shadow on the central Safe-to-Burn widget (`box-shadow: 0 10px 30px -10px rgba(6, 182, 212, 0.25)`).
- **Z-Index Layering:**
  - Base View: `0`
  - Floating Quick-Action Button (FAB): `40`
  - Modals & Bottom Sheets: `50`
  - Toast & Micro-Notifications: `60`

---

## Shapes

- `rounded/sm` (`8px`) for chips, badges, and inline buttons.
- `rounded/md` (`14px`) for inputs and list rows.
- `rounded/lg` (`24px`) for cards and dialog containers.
- `rounded/xl` (`32px`) for the hero Safe-to-Burn widget.
- `rounded/full` for pills, avatars, and circular progress rings.

---

## Components

### 1. Safe-to-Burn Hero Card (`SafeToBurnCard`)
- **Visuals:** Large glassmorphic card with a circular SVG progress ring or radial glow.
- **Data:** Today's discretionary allowance (e.g. `€38.50`), with a sub-caption `Glide active: €10/day adjusted` when recovering from overspend.
- **Action:** Tap to reveal the monthly balance breakdown modal.

### 2. Life-Energy Badge (`LifeEnergyBadge`)
- **Visuals:** A subtle glowing pill chip beside currency amounts.
- **Icon:** Hourglass `⏳` or Clock icon.
- **Text:** e.g., `⏳ 2 hrs 15 mins`. Inverted contrast pill with emerald or cyan tint.

### 3. 14-Day Regret Micro-Checkin Sheet (`RegretCheckinModal`)
- **Visuals:** Centered bottom-sheet modal.
- **Content:** Item name, original price, date, and life-energy labor cost.
- **Controls:** Two large, thumb-friendly buttons: `[🔥 Worth It]` (Emerald) and `[👎 Regret]` (Rose/Slate).

### 4. "Saved It!" Willpower Card (`WillpowerLedgerCard`)
- **Visuals:** Violet-to-emerald gradient shimmer border.
- **Data:** Total impulse money resisted (`€380`) alongside 10-year compounding wealth projection (`€748`).

---

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use positive, encouraging terminology (`Glide Window`, `Safe-to-Burn`, `Life Energy`) | Use punitive financial words (`Budget Failed`, `Overspent!`, `In the Red`) |
| Show labor time (`2 hrs 10 mins`) alongside currency on all expense items | Force users to calculate their own wage formulas |
| Keep the morning dashboard glanceable in < 3 seconds | Overload the home screen with 15 tiny line-item graphs |
| Use smooth framer-motion micro-animations for feedback | Use abrupt layout shifts or aggressive popups |
