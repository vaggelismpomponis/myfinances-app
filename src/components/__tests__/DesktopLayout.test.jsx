import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DesktopLayout from '../DesktopLayout';
import { useSettings } from '../../contexts/SettingsContext';

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

vi.mock('../DesktopSidebar', () => ({
  default: () => <div data-testid="desktop-sidebar" />,
}));

vi.mock('../DesktopRightPanel', () => ({
  default: () => <div data-testid="desktop-right-panel" />,
}));

describe('DesktopLayout', () => {
  const defaultProps = {
    activeTab: 'home',
    setActiveTab: vi.fn(),
    setPreviousTab: vi.fn(),
    user: { id: 'test-user', email: 'test@example.com' },
    displayName: 'Test User',
    photoURL: null,
    balance: 1000,
    totalIncome: 2000,
    totalExpense: 1000,
    transactions: [],
    budgets: [],
    onSignOut: vi.fn(),
    onAdd: vi.fn(),
    unreadCount: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSettings.mockReturnValue({
      t: (key) => key,
    });
  });

  it('triggers onToggleNotifications when the bell button is clicked', () => {
    const mockToggle = vi.fn();
    render(
      <DesktopLayout {...defaultProps} onToggleNotifications={mockToggle}>
        <div>Content</div>
      </DesktopLayout>
    );

    const bellBtn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellBtn);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('triggers setShowNotificationPanel when onToggleNotifications is not provided', () => {
    const mockSetShow = vi.fn();
    render(
      <DesktopLayout {...defaultProps} setShowNotificationPanel={mockSetShow}>
        <div>Content</div>
      </DesktopLayout>
    );

    const bellBtn = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(bellBtn);

    expect(mockSetShow).toHaveBeenCalledTimes(1);
    // Verify it passes an updater function that toggles state
    const updater = mockSetShow.mock.calls[0][0];
    expect(typeof updater).toBe('function');
    expect(updater(false)).toBe(true);
    expect(updater(true)).toBe(false);
  });

  it('renders unread count badge when unreadCount > 0', () => {
    render(
      <DesktopLayout {...defaultProps} unreadCount={5}>
        <div>Content</div>
      </DesktopLayout>
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('triggers onAdd without event arguments when add button is clicked', () => {
    const mockOnAdd = vi.fn();
    render(
      <DesktopLayout {...defaultProps} onAdd={mockOnAdd}>
        <div>Content</div>
      </DesktopLayout>
    );

    const addBtn = screen.getByRole('button', { name: /add_transaction/i });
    fireEvent.click(addBtn);

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
    expect(mockOnAdd).toHaveBeenCalledWith();
  });
});
