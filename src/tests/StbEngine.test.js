import { describe, it, expect } from 'vitest';
import { calculateStb } from '../features/StbEngine';

describe('Safe-to-Burn (StB) Engine with Glide Recovery', () => {
    it('Basic Calculation (No past spend)', () => {
        // Income 2000, Fixed 1000, Savings 400 = 600 Pool
        // 30 days = 20/day
        const { stb, isGlideActive, streak } = calculateStb({
            income: 2000,
            fixed: 1000,
            savings: 400,
            pastDailySpends: [],
            todaySpend: 0,
            daysInMonth: 30
        });
        expect(stb).toBe(20);
        expect(isGlideActive).toBe(false);
        expect(streak).toBe(0);
    });

    it('Streak Calculation (Underspend)', () => {
        // Day 1 spent 5, Day 2 spent 10
        // Base = 20. 
        // Day 1: budget 20, spend 5. Rollover 15. Streak 1.
        // Day 2: budget 35, spend 10. Rollover 25. Streak 2.
        // Today (Day 3): budget 20 + 25 = 45.
        const { stb, isGlideActive, streak } = calculateStb({
            income: 2000,
            fixed: 1000,
            savings: 400,
            pastDailySpends: [5, 10],
            todaySpend: 0,
            daysInMonth: 30
        });
        expect(stb).toBe(45);
        expect(isGlideActive).toBe(false);
        expect(streak).toBe(2);
    });

    it('Glide Recovery Calculation (Overspend)', () => {
        // Base = 20.
        // Day 1: spent 50. Deficit = 30. Glide = 10/day for 3 days.
        // Today (Day 2): budget 20 - 10 = 10.
        const { stb, isGlideActive, streak } = calculateStb({
            income: 2000,
            fixed: 1000,
            savings: 400,
            pastDailySpends: [50],
            todaySpend: 0,
            daysInMonth: 30
        });
        expect(stb).toBe(10);
        expect(isGlideActive).toBe(true);
        expect(streak).toBe(0);
    });

    it('Glide Amortization wears off after 3 days', () => {
        // Base = 20.
        // Day 1: spent 50. Deficit = 30. Glide = 10/day for 3 days.
        // Day 2: spent 0. Budget = 10. Rollover = 10.
        // Day 3: spent 0. Budget = 20 + 10 - 10 = 20. Rollover = 20.
        // Day 4: spent 0. Budget = 20 + 20 - 10 = 30. Rollover = 30.
        // Today (Day 5): Glide should be gone! Budget = 20 + 30 = 50.
        const { stb, isGlideActive, streak } = calculateStb({
            income: 2000,
            fixed: 1000,
            savings: 400,
            pastDailySpends: [50, 0, 0, 0],
            todaySpend: 0,
            daysInMonth: 30
        });
        expect(stb).toBe(50);
        expect(isGlideActive).toBe(false); // worn off!
        expect(streak).toBe(3); // Day 2, 3, 4 were underspent
    });
});
