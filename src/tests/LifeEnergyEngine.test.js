import { describe, it, expect } from 'vitest';
import { calculateLifeEnergy, formatLifeEnergy } from '../features/LifeEnergyEngine';

describe('Life-Energy Engine', () => {
    describe('calculateLifeEnergy', () => {
        it('calculates exact hours', () => {
            expect(calculateLifeEnergy(2000, 1000)).toEqual({ hours: 2, minutes: 0 });
        });

        it('calculates exact minutes (fractional hours)', () => {
            expect(calculateLifeEnergy(500, 1000)).toEqual({ hours: 0, minutes: 30 });
        });

        it('calculates hours and minutes', () => {
            expect(calculateLifeEnergy(1500, 1000)).toEqual({ hours: 1, minutes: 30 });
        });

        it('rounds minutes appropriately', () => {
            // 333 / 1000 = 0.333 hours * 60 = 19.98 minutes -> 20 minutes
            expect(calculateLifeEnergy(333, 1000)).toEqual({ hours: 0, minutes: 20 });
        });

        it('handles rounding overflow into next hour', () => {
            // 999 / 1000 = 0.999 hours * 60 = 59.94 minutes -> 60 minutes -> 1 hr 0 min
            expect(calculateLifeEnergy(999, 1000)).toEqual({ hours: 1, minutes: 0 });
        });

        it('handles zero or missing values gracefully', () => {
            expect(calculateLifeEnergy(0, 1000)).toEqual({ hours: 0, minutes: 0 });
            expect(calculateLifeEnergy(1000, 0)).toEqual({ hours: 0, minutes: 0 });
        });
    });

    describe('formatLifeEnergy', () => {
        it('formats hours only', () => {
            expect(formatLifeEnergy({ hours: 2, minutes: 0 })).toBe('2h');
        });

        it('formats minutes only', () => {
            expect(formatLifeEnergy({ hours: 0, minutes: 45 })).toBe('45m');
        });

        it('formats both', () => {
            expect(formatLifeEnergy({ hours: 1, minutes: 30 })).toBe('1h 30m');
        });

        it('formats zero', () => {
            expect(formatLifeEnergy({ hours: 0, minutes: 0 })).toBe('0m');
        });
    });
});
