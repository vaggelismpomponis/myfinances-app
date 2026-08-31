import { describe, it, expect } from 'vitest';
import { calculateCompoundedValue, aggregateWillpower } from '../features/WillpowerEngine';

describe('WillpowerEngine', () => {
    describe('calculateCompoundedValue', () => {
        it('calculates 10-year compounding correctly for €100 at 7%', () => {
            // 10000 cents * (1.07)^10 = 19671.51...
            const result = calculateCompoundedValue(10000, 10, 0.07);
            expect(result).toBe(19672);
        });

        it('handles zero or negative amounts', () => {
            expect(calculateCompoundedValue(0)).toBe(0);
            expect(calculateCompoundedValue(-500)).toBe(0);
        });

        it('uses defaults properly (10 years, 7%)', () => {
            const result = calculateCompoundedValue(10000);
            expect(result).toBe(19672);
        });
    });

    describe('aggregateWillpower', () => {
        it('returns zero for empty or invalid input', () => {
            expect(aggregateWillpower([])).toEqual({ totalSaved: 0, futureValue: 0 });
            expect(aggregateWillpower(null)).toEqual({ totalSaved: 0, futureValue: 0 });
        });

        it('aggregates multiple impulses correctly', () => {
            const impulses = [
                { amount: 5000 },  // €50
                { amount: 10000 }  // €100
            ];
            
            const result = aggregateWillpower(impulses);
            
            // totalSaved = 15000
            expect(result.totalSaved).toBe(15000);
            
            // futureValue = calculateCompoundedValue(5000) + calculateCompoundedValue(10000)
            // = 9836 + 19672 = 29508
            expect(result.futureValue).toBe(29508);
        });
    });
});
