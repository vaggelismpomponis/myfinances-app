import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsProvider, useSettings } from '../SettingsContext';

describe('SettingsContext - Custom Categories Sync', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('initializes with default empty custom categories', async () => {
        const { result } = renderHook(() => useSettings(), {
            wrapper: SettingsProvider
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.customCategories).toEqual({
            expense: [],
            income: []
        });
    });

    it('adds and prevents duplicate custom categories', async () => {
        const { result } = renderHook(() => useSettings(), {
            wrapper: SettingsProvider
        });

        await act(async () => {
            await Promise.resolve();
        });

        await act(async () => {
            result.current.addCustomCategory('expense', 'Τσιγάρα');
        });

        expect(result.current.customCategories.expense).toContain('Τσιγάρα');

        await act(async () => {
            result.current.addCustomCategory('expense', 'Τσιγάρα');
        });

        expect(result.current.customCategories.expense.filter(c => c === 'Τσιγάρα')).toHaveLength(1);
    });

    it('removes a custom category', async () => {
        const { result } = renderHook(() => useSettings(), {
            wrapper: SettingsProvider
        });

        await act(async () => {
            await Promise.resolve();
        });

        await act(async () => {
            result.current.addCustomCategory('expense', 'Τσιγάρα');
            result.current.addCustomCategory('expense', 'Καύσιμα');
        });

        expect(result.current.customCategories.expense).toEqual(['Τσιγάρα', 'Καύσιμα']);

        await act(async () => {
            result.current.removeCustomCategory('expense', 'Τσιγάρα');
        });

        expect(result.current.customCategories.expense).toEqual(['Καύσιμα']);
    });

    it('syncCategoriesFromTransactions auto-discovers categories from transactions', async () => {
        const { result } = renderHook(() => useSettings(), {
            wrapper: SettingsProvider
        });

        await act(async () => {
            await Promise.resolve();
        });

        const mockTransactions = [
            { category: 'Σούπερ Μάρκετ', type: 'expense' }, // base category, should not be in custom
            { category: 'Τσιγάρα', type: 'expense' },        // custom expense
            { category: 'Μισθός', type: 'income' },          // base category, should not be in custom
            { category: 'Freelance', type: 'income' },       // custom income
        ];

        await act(async () => {
            result.current.syncCategoriesFromTransactions(mockTransactions);
        });

        expect(result.current.customCategories.expense).toContain('Τσιγάρα');
        expect(result.current.customCategories.expense).not.toContain('Σούπερ Μάρκετ');
        expect(result.current.customCategories.income).toContain('Freelance');
        expect(result.current.customCategories.income).not.toContain('Μισθός');
    });
});
