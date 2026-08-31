---
title: 'Story 1.1: Local Store & Base Safe-to-Burn Calculation'
type: 'feature'
created: '2026-08-31'
status: 'done'
baseline_commit: '471c54f11e9abd5a5b9f7b8b604038bbc6aa0ef5'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The app currently fetches financial state directly via Supabase into React component state (`App.jsx`), violating the local-first thick client architecture. It lacks the core Safe-to-Burn (StB) calculation required to give users their daily discretionary budget.

**Approach:** Implement a local reactive store using Zustand with IndexedDB persistence (`idb-keyval`) as the single source of truth. Move core state (`transactions`, `budgets`, `goals`, `user_settings`) into this store. Implement the base StB calculation engine that executes instantly on the client based on this local state.

## Boundaries & Constraints

**Always:** 
- The app must read exclusively from the local store; Supabase acts only as a sync target/source.
- StB calculation must execute client-side in under 10ms.
- Use `zustand` and `idb-keyval` for the local store.

**Ask First:** 
- Changes to the core StB formula.
- Any network requests introduced in the synchronous render path.

**Never:** 
- Do not block the UI waiting for Supabase to return data.
- Do not store sensitive auth tokens in IndexedDB (use secure storage or keep in memory).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Basic Calculation | Income: 2000, Fixed: 1000, Savings: 400, Spend: 0, Days left: 30 | StB = (2000-1000-400-0)/30 = 20.00 | N/A |
| High Spend | Spend: 500, Days left: 10 | StB = (2000-1000-400-500)/10 = 10.00 | N/A |
| Zero Days Left | Days left: 0 (Last day of cycle) | StB = (Income - Fixed - Savings - Spend) / 1 | Protect against divide by zero |
| Negative StB | Spend > (Income - Fixed - Savings) | StB calculation returns the negative amount (Glide will handle this in Story 1.2) | N/A |

</frozen-after-approval>

## Code Map

- `package.json` -- Add `zustand` and `idb-keyval` dependencies.
- `src/store/useAppStore.js` -- [NEW] The Zustand store that holds financial state and persists to IndexedDB.
- `src/features/StbEngine.js` -- [NEW] Pure functions for calculating the Safe-to-Burn budget to ensure testability.
- `src/App.jsx` -- Currently holds `useState` for transactions, budgets, etc. Needs refactoring to bind to the Zustand store and handle Supabase sync as a background effect.
- `src/tests/StbEngine.test.js` -- [NEW] Unit tests for the StB formula.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- Add `zustand` and `idb-keyval` dependencies -- Required for local reactive store and IndexedDB persistence.
- [x] `src/features/StbEngine.js` -- Implement `calculateStb({ income, fixed, savings, spend, daysRemaining })` pure function -- Encapsulate core logic for testability and <10ms execution.
- [x] `src/store/useAppStore.js` -- Create Zustand store with `persist` middleware using a custom `idb-keyval` storage engine. Include state for `transactions`, `userSettings`, etc., and a derived `safeToBurn` property -- Establish the local write-through cache.
- [x] `src/App.jsx` -- Refactor to remove local `useState` for financial data, replacing it with `useAppStore` subscriptions. Update Supabase data fetching to populate the store instead of local state -- Wire up the store to the app and sync layer.
- [x] `src/tests/StbEngine.test.js` -- Write unit tests covering the I/O & Edge-Case matrix scenarios -- Verify formula correctness.

**Acceptance Criteria:**
- Given the user has entered their monthly income and fixed obligations, when the app calculates the Safe-to-Burn allowance, then the formula `(Income - Obligations - Savings - Spend) / Remaining Days` is applied.
- Given a large dataset of transactions, when the StB calculation runs, then it executes entirely on the client in under 10ms.

## Verification

**Commands:**
- `npm run test` -- expected: StbEngine tests pass for all edge cases.

**Manual checks (if no CLI):**
- Verify that `zustand` state persists across page reloads by checking IndexedDB in browser DevTools.
- Verify that adding a transaction updates the StB budget instantly without waiting for a network request.

## Suggested Review Order

**Store Configuration & Calculation Engine**

- Implementation of the pure Safe-to-Burn calculation logic
  [`StbEngine.js:1`](../../src/features/StbEngine.js#L1)

- Creation of the local reactive store using Zustand with IndexedDB persistence
  [`useAppStore.js:1`](../../src/store/useAppStore.js#L1)

**Application Integration**

- Refactoring UI state out of components to rely on the local store
  [`App.jsx:22`](../../src/App.jsx#L22)

**Testing**

- Unit tests for the Safe-to-Burn calculation edge cases
  [`StbEngine.test.js:1`](../../src/tests/StbEngine.test.js#L1)
