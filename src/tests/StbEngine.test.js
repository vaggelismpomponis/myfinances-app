import { describe, it, expect } from 'vitest';
import { calculateStb } from '../features/StbEngine';

describe('Safe-to-Burn (StB) Engine', () => {
    it('Basic Calculation', () => {
        // Income: 2000, Fixed: 1000, Savings: 400, Spend: 0, Days left: 30 -> 20.00
        // Expect integer cents (20.00 -> returns 20 for logic, but formula is generic)
        // Wait, if it's stored in cents, income would be 200000, fixed 100000, etc.
        // But the formula itself doesn't care, it just does math. 
        // 2000 - 1000 - 400 - 0 = 600 / 30 = 20
        const stb = calculateStb({
            income: 2000,
            fixed: 1000,
            savings: 400,
            spend: 0,
            daysRemaining: 30
        });
        expect(stb).toBe(20);
    });

    it('High Spend Calculation', () => {
        // Spend: 500, Days left: 10 -> 10.00
        const stb = calculateStb({
            income: 2000,
            fixed: 1000,
            savings: 400,
            spend: 500,
            daysRemaining: 10
        });
        expect(stb).toBe(10);
    });

    it('Zero Days Left Calculation (End of month)', () => {
        // Days left: 0 -> should act as 1 day remaining
        const stb = calculateStb({
            income: 2000,
            fixed: 1000,
            savings: 400,
            spend: 500,
            daysRemaining: 0
        });
        expect(stb).toBe(100);
    });

    it('Negative StB Calculation', () => {
        // Spend > (Income - Fixed - Savings)
        // 2000 - 1000 - 400 - 800 = -200 / 10 = -20
        const stb = calculateStb({
            income: 2000,
            fixed: 1000,
            savings: 400,
            spend: 800,
            daysRemaining: 10
        });
        expect(stb).toBe(-20);
    });
});
