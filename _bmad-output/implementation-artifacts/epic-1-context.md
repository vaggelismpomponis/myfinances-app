# Epic 1 Context: Zero-Friction Daily Budgeting (The Safe-to-Burn Engine)

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Users can instantly see their daily discretionary budget, automatically recover from overspending without guilt, and build prudent streaks. This reduces the cognitive overhead of daily budgeting.

## Stories

- Story 1.1: Local Store & Base Safe-to-Burn Calculation
- Story 1.2: Glide Recovery for Overspending
- Story 1.3: Prudent Streak & Combo Multiplier
- Story 1.4: SafeToBurnCard UI Component

## Requirements & Constraints

- **Safe-to-Burn (StB) Formula**: `(Total Monthly Net Income - Fixed Monthly Obligations - Target Monthly Savings - Cumulative Month-to-Date Discretionary Spend) / Remaining Days in Cycle`.
- **Glide Recovery**: Deficits from overspending are amortized evenly across a 3-day Glide Window rather than dropping the next day's budget to zero. If the total remaining cycle allowance reaches €0, StB displays €0.00 with an emergency alert.
- **Streak Multiplier**: Unspent daily funds are added to the remaining monthly pool at the start of a new day, and the user's "Prudent Streak" counter increments by 1.
- **Performance**: StB calculations must execute client-side in `< 10ms`.
- **Offline Resiliency**: Must function seamlessly offline, syncing mutations to Supabase upon reconnect.

## Technical Decisions

- **Local-First Architecture**: The app reads exclusively from a local reactive store (Zustand/IndexedDB wrapper) as a write-through cache. Computations must run locally to meet performance goals.
- **Optimistic UI**: User actions mutate local state instantly; network sync resolves eventual consistency in the background.
- **Data Formats**: ISO-8601 for dates; monetary amounts stored as integers (cents) in the DB and local store, converted to decimals only for the UI.
- **Conventions**: PascalCase for React components, snake_case for DB columns. All user-facing state is fetched exclusively from the local store.

## UX & Interaction Patterns

- **Aesthetics**: Sleek Dark Mode Glassmorphism using colors like Obsidian Dark, Electric Cyan, Emerald Mint, Brand Violet, Rose Coral.
- **Components**: `SafeToBurnCard` uses Dark Mode Glassmorphism (blur 16px, rounded borders), a circular SVG progress ring, and a Hero Glow (Cyan/Emerald drop shadow). It includes a "Glide active" sub-caption when applicable.
- **Animations/Haptics**: Instant haptic/spring feedback using Framer Motion (`damping: 20, stiffness: 300`).
- **Accessibility**: 48x48px minimum touch targets and WCAG 2.1 AA contrast.

## Cross-Story Dependencies

- **Story 1.1** builds the base data store and calculation, which are prerequisites for **Story 1.2** (Glide Recovery) and **Story 1.3** (Streak Multiplier).
- **Story 1.4** (UI Component) depends on the state computed by the first three stories to render correctly.
