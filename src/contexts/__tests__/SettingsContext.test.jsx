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

    it('edits an existing custom category and rejects invalid edits', async () => {
        const { result } = renderHook(() => useSettings(), {
            wrapper: SettingsProvider
        });

        await act(async () => {
            await Promise.resolve();
        });

        await act(async () => {
            result.current.addCustomCategory('expense', 'Pills');
            result.current.addCustomCategory('expense', 'Καύσιμα');
        });

        // Reject duplicate name
        let editRes;
        await act(async () => {
            editRes = result.current.editCustomCategory('expense', 'Pills', 'Καύσιμα');
        });
        expect(editRes.success).toBe(false);
        expect(editRes.error).toBe('already_exists');

        // Reject base category name
        await act(async () => {
            editRes = result.current.editCustomCategory('expense', 'Pills', 'Σούπερ Μάρκετ');
        });
        expect(editRes.success).toBe(false);
        expect(editRes.error).toBe('base_category');

        // Successful rename
        await act(async () => {
            editRes = result.current.editCustomCategory('expense', 'Pills', 'Βιταμίνες');
        });
        expect(editRes.success).toBe(true);
        expect(result.current.customCategories.expense).toContain('Βιταμίνες');
        expect(result.current.customCategories.expense).not.toContain('Pills');
    });

    it('deletes custom category and prevents syncCategoriesFromTransactions from resurrecting it', async () => {
        const { result } = renderHook(() => useSettings(), {
            wrapper: SettingsProvider
        });

        await act(async () => {
            await Promise.resolve();
        });

        await act(async () => {
            result.current.addCustomCategory('expense', 'OldCategory');
        });
        expect(result.current.customCategories.expense).toContain('OldCategory');

        await act(async () => {
            result.current.deleteCustomCategory('expense', 'OldCategory', 'Άλλο');
        });
        expect(result.current.customCategories.expense).not.toContain('OldCategory');

        // Verify syncCategoriesFromTransactions does not resurrect OldCategory
        await act(async () => {
            result.current.syncCategoriesFromTransactions([
                { category: 'OldCategory', type: 'expense' }
            ]);
        });
        expect(result.current.customCategories.expense).not.toContain('OldCategory');
    });
});
