import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomeView from '../HomeView';
import { useSettings } from '../../contexts/SettingsContext';

// Mock context
vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

vi.mock('../../contexts/SubscriptionContext', () => ({
  useSubscription: vi.fn(() => ({
    isPro: false,
    openUpgradeModal: vi.fn(),
  })),
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
      { id: '1', name: 'Salary', amount: 2345.67, type: 'income', date: new Date().toISOString() },
      { id: '2', name: 'Rent', amount: 1111.11, type: 'expense', date: new Date().toISOString() },
    ],
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    setActiveTab: vi.fn(),
    onRecurring: vi.fn(),
  };

  const mockT = vi.fn((key) => key);

  it('renders spend information correctly', () => {
    useSettings.mockReturnValue({
      t: mockT,
      privacyMode: false,
      currency: '€',
      language: 'en',
    });

    render(<HomeView {...defaultProps} />);

    expect(screen.getByText('this_month_spend')).toBeInTheDocument();
    expect(screen.getByText(/1,111\.11/)).toBeInTheDocument();
  });

  it('renders AI Advisor CTA', () => {
    useSettings.mockReturnValue({
      t: mockT,
      privacyMode: false,
      currency: '€',
      language: 'en',
    });

    render(<HomeView {...defaultProps} />);

    expect(screen.getByText('advisor_title')).toBeInTheDocument();
    expect(screen.getByText('advisor_subtitle')).toBeInTheDocument();
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









