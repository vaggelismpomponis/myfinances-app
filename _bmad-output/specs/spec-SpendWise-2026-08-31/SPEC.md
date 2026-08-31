---
id: SPEC-SpendWise-2026-08-31
companions: 
  - ../planning-artifacts/architecture/arch-SpendWise-2026-08-31/ARCHITECTURE-SPINE.md
  - ../planning-artifacts/ux-designs/ux-SpendWise-2026-08-31/DESIGN.md
  - ../planning-artifacts/ux-designs/ux-SpendWise-2026-08-31/EXPERIENCE.md
sources: 
  - c:\Projects\SpendWise\_bmad-output\planning-artifacts\prds\prd-SpendWise-2026-08-31\prd.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# SpendWise Zero-Friction Engine

## Why

Most personal finance apps fail due to the high cognitive overhead of manual categorization, rigid monthly budgeting, and the guilt-inducing friction of overspending. We are transforming personal finance into an intuitive, zero-friction psychological engine. By introducing a dynamic "Safe-to-Burn" allowance with Glide Window recovery and translating currency into "Life-Energy" labor hours, SpendWise helps users naturally avoid impulse purchases and recover gracefully from spikes, eliminating the anxiety that causes budget abandonment.

## Capabilities

- **CAP-1: Dynamic Daily Safe-to-Burn Engine**
  - **intent:** User sees their dynamically adjusted daily discretionary spending target.
  - **success:** System correctly calculates the daily allowance with Glide Window logic applied to any overspending over the past 3 days, updated in under 10ms.

- **CAP-2: Life-Energy Labor Cost Conversion**
  - **intent:** User configures their Net Hourly Rate and views all expenses translated into labor time.
  - **success:** Expenses display an accurate "X hrs Y mins" badge based on the configured net wage.

- **CAP-3: 14-Day Anti-Regret Verification Loop**
  - **intent:** User rates past discretionary purchases to build an Anti-Persona report.
  - **success:** A local notification fires 14 days after a purchase > €20, and rating it as Regret updates the aggregate report.

- **CAP-4: Resisted Impulse Willpower Ledger**
  - **intent:** User actively logs resisted purchases to visualize long-term financial compounding.
  - **success:** Tapping "Saved It!" adds to the Willpower Ledger and displays a simulated 10-year growth.

- **CAP-5: Dual-Language Speech & OCR parsing**
  - **intent:** Greek and English voice input and receipts are accurately parsed.
  - **success:** Tesseract extracts value from Greek receipts; speech recognition maps Greek commands to Amount/Category.

## Constraints

- Calculations must execute < 10ms client-side (Local-First Thick Client paradigm).
- Wage and transaction data must be secured via Supabase RLS.
- No direct Open-Banking/Plaid sync.
- Notifications must be scheduled locally via Capacitor/Web, avoiding server crons.

## Non-goals

- No direct bank feeds (PSD2/Plaid).
- No cryptocurrency wallet management.
- No shared multi-user joint accounts.
- No audio synthesis for the avatar (deferred to v2).
- No geofenced GPS spending temptation locks (deferred to v2).

## Success signal

Users maintain Day-14 retention of >45% and decrease their Regret Quotient by 20% by month 3, completing daily checks in under 15 seconds.
