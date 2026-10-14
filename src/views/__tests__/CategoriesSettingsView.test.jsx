import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CategoriesSettingsView from '../CategoriesSettingsView';

const mockAddCustomCategory = vi.fn();
const mockEditCustomCategory = vi.fn().mockReturnValue({ success: true });
const mockDeleteCustomCategory = vi.fn().mockReturnValue({ success: true });
const mockShowToast = vi.fn();

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        language: 'el',
        t: (k, params) => {
            if (params?.category) return `Delete ${params.category}?`;
            if (params?.count !== undefined) return `${params.count} transactions`;
            if (k === 'tx_count_singular') return '1 transaction';
            return k;
        },
        customCategories: {
            expense: ['Pills', 'Καύσιμα'],
            income: ['Freelance']
        },
        addCustomCategory: mockAddCustomCategory,
        editCustomCategory: mockEditCustomCategory,
        deleteCustomCategory: mockDeleteCustomCategory
    })
}));

vi.mock('../../contexts/ToastContext', () => ({
    useToast: () => ({
        showToast: mockShowToast
    })
}));

vi.mock('../../contexts/SubscriptionContext', () => ({
    useSubscription: () => ({
        isPro: true,
        openUpgradeModal: vi.fn()
    })
}));

describe('CategoriesSettingsView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders custom categories and transaction counts', () => {
        const transactions = [
            { category: 'Pills', type: 'expense' },
            { category: 'Pills', type: 'expense' },
            { category: 'Καύσιμα', type: 'expense' }
        ];

        render(<CategoriesSettingsView transactions={transactions} onBack={vi.fn()} />);

        expect(screen.getByText('Pills')).toBeInTheDocument();
        expect(screen.getByText('Καύσιμα')).toBeInTheDocument();
        expect(screen.getByText('2 transactions')).toBeInTheDocument();
        expect(screen.getByText('1 transaction')).toBeInTheDocument();
    });

    it('switches between expense and income tabs', () => {
        render(<CategoriesSettingsView transactions={[]} onBack={vi.fn()} />);

        expect(screen.getByText('Pills')).toBeInTheDocument();

        // Switch to Income tab
        const incomeTab = screen.getByText('categories_income_tab');
        fireEvent.click(incomeTab);

        expect(screen.getByText('Freelance')).toBeInTheDocument();
        expect(screen.queryByText('Pills')).not.toBeInTheDocument();
    });

    it('opens inline edit mode and saves renamed category', async () => {
        render(<CategoriesSettingsView transactions={[]} onBack={vi.fn()} />);

        // Click edit on Pills (first edit button)
        const editButtons = screen.getAllByTitle('edit_category');
        fireEvent.click(editButtons[0]);

        const input = screen.getByDisplayValue('Pills');
        fireEvent.change(input, { target: { value: 'Βιταμίνες' } });

        const saveButton = screen.getByTitle('save');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockEditCustomCategory).toHaveBeenCalledWith('expense', 'Pills', 'Βιταμίνες');
            expect(mockShowToast).toHaveBeenCalledWith('category_updated_success', 'success');
        });
    });

    it('prompts delete modal and calls deleteCustomCategory with reassign target', async () => {
        const transactions = [{ category: 'Pills', type: 'expense' }];
        render(<CategoriesSettingsView transactions={transactions} onBack={vi.fn()} />);

        // Click delete on Pills
        const deleteButtons = screen.getAllByTitle('delete_category');
        fireEvent.click(deleteButtons[0]);

        // Delete modal appears
        expect(screen.getByText(/delete_category/i)).toBeInTheDocument();

        // Click confirm delete
        const confirmBtn = screen.getByTestId('confirm-delete-category-btn');
        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(mockDeleteCustomCategory).toHaveBeenCalledWith('expense', 'Pills', 'Άλλο');
            expect(mockShowToast).toHaveBeenCalledWith('category_deleted_success', 'success');
        });
    });
});
