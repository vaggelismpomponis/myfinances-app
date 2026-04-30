import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomeView from '../HomeView';
import { useSettings } from '../../contexts/SettingsContext';

// Mock context
vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

// Mock child components that might be complex
vi.mock('../../components/TransactionItem', () => ({
  default: ({ transaction }) => <div data-testid="transaction-item">{transaction.name}</div>,
}));

describe('HomeView', () => {
  const defaultProps = {
    balance: 1234.56,
    totalIncome: 2345.67,
    totalExpense: 1111.11,
    transactions: [
      { id: '1', name: 'Salary', amount: 2345.67, type: 'income' },
      { id: '2', name: 'Rent', amount: 1111.11, type: 'expense' },
    ],
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    setActiveTab: vi.fn(),
    onRecurring: vi.fn(),
  };

  const mockT = vi.fn((key) => key);

  it('renders balance information correctly', () => {
    useSettings.mockReturnValue({
      t: mockT,
      privacyMode: false,
      currency: '€',
      language: 'en',
    });

    render(<HomeView {...defaultProps} />);

    expect(screen.getByText('total_balance')).toBeInTheDocument();
    expect(screen.getByText(/1,234\.56/)).toBeInTheDocument();
  });

  it('renders income and expense totals', () => {
    useSettings.mockReturnValue({
      t: mockT,
      privacyMode: false,
      currency: '€',
      language: 'en',
    });

    render(<HomeView {...defaultProps} />);

    expect(screen.getByText('income')).toBeInTheDocument();
    expect(screen.getByText('expense')).toBeInTheDocument();
    expect(screen.getByText(/2,345/)).toBeInTheDocument();
    expect(screen.getByText(/1,111/)).toBeInTheDocument();
  });

  it('renders transaction list', () => {
    useSettings.mockReturnValue({
      t: mockT,
      privacyMode: false,
      currency: '€',
      language: 'en',
    });

    render(<HomeView {...defaultProps} />);

    const items = screen.getAllByTestId('transaction-item');
    expect(items).toHaveLength(2);
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });

  it('shows empty state when no transactions', () => {
    useSettings.mockReturnValue({
      t: mockT,
      privacyMode: false,
      currency: '€',
      language: 'en',
    });

    render(<HomeView {...defaultProps} transactions={[]} />);

    expect(screen.getByText('no_transactions')).toBeInTheDocument();
    expect(screen.getByText('tap_to_add')).toBeInTheDocument();
  });

  it('calls setActiveTab when quick actions are clicked', () => {
    useSettings.mockReturnValue({
      t: mockT,
      privacyMode: false,
      currency: '€',
      language: 'en',
    });

    const setActiveTab = vi.fn();
    render(<HomeView {...defaultProps} setActiveTab={setActiveTab} />);

    fireEvent.click(screen.getByText('goals'));
    expect(setActiveTab).toHaveBeenCalledWith('goals');

    fireEvent.click(screen.getByText('budgets'));
    expect(setActiveTab).toHaveBeenCalledWith('budgets');
  });
});









