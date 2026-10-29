import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationPanel from '../NotificationPanel';
import { useNotifications } from '../../contexts/NotificationContext';
import { useSettings } from '../../contexts/SettingsContext';

vi.mock('../../contexts/NotificationContext', () => ({
  useNotifications: vi.fn(),
}));

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

vi.mock('../../utils/categoryTranslations', () => ({
  getCategoryTranslation: vi.fn((cat) => cat),
}));

describe('NotificationPanel', () => {
  const mockOnClose = vi.fn();
  const mockClearAll = vi.fn();
  const mockDeleteNotification = vi.fn();
  const mockMarkAllRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useSettings.mockReturnValue({
      t: (key) => `t_${key}`,
    });
    useNotifications.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      clearAll: mockClearAll,
      deleteNotification: mockDeleteNotification,
      markAllRead: mockMarkAllRead,
    });
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<NotificationPanel isOpen={false} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders centered modal wrapper when isOpen is true', () => {
    render(<NotificationPanel isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('t_notifications')).toBeInTheDocument();
    expect(screen.getByText('t_no_notifications')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockMarkAllRead).toHaveBeenCalledTimes(1);
  });

  it('renders notification items and opens confirmation modal on delete action', () => {
    const mockNotifications = [
      {
        id: 'n1',
        type: 'add',
        message: 'New expense recorded',
        read: true,
        timestamp: new Date().toISOString(),
        metadata: {
          amount: 7.94,
          txType: 'expense',
          category: 'Food',
          note: 'Dinner',
        },
      },
    ];

    useNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 0,
      clearAll: mockClearAll,
      deleteNotification: mockDeleteNotification,
      markAllRead: mockMarkAllRead,
    });

    render(<NotificationPanel isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('t_notification_added_expense')).toBeInTheDocument();
    expect(screen.getByText('-7,94 €')).toBeInTheDocument();
    expect(screen.getByText('"Dinner"')).toBeInTheDocument();

    // The delete button is rendered in the DOM for swiping
    const deleteBtn = screen.getByRole('button', { name: 't_delete' });
    expect(deleteBtn).toBeInTheDocument();

    // Clicking delete opens the confirmation modal
    fireEvent.click(deleteBtn);
    expect(screen.getByText('t_delete_notification')).toBeInTheDocument();
    expect(screen.getByText('t_delete_notification_confirm')).toBeInTheDocument();

    // Confirming deletion calls deleteNotification
    const confirmBtn = screen.getAllByRole('button', { name: 't_delete' })[1];
    fireEvent.click(confirmBtn);
    expect(mockDeleteNotification).toHaveBeenCalledWith('n1');
  });

  it('opens confirmation modal when clear all button is clicked', () => {
    const mockNotifications = [
      {
        id: 'n1',
        type: 'info',
        message: 'Test notification',
        read: true,
        timestamp: new Date().toISOString(),
      },
    ];

    useNotifications.mockReturnValue({
      notifications: mockNotifications,
      unreadCount: 0,
      clearAll: mockClearAll,
      deleteNotification: mockDeleteNotification,
      markAllRead: mockMarkAllRead,
    });

    render(<NotificationPanel isOpen={true} onClose={mockOnClose} />);

    const clearAllBtn = screen.getByTitle('t_clear_all');
    fireEvent.click(clearAllBtn);

    expect(screen.getByText('t_clear_all_notifications')).toBeInTheDocument();
    expect(screen.getByText('t_clear_all_notifications_confirm')).toBeInTheDocument();

    const confirmClearBtn = screen.getAllByRole('button', { name: 't_clear_all' })[1];
    fireEvent.click(confirmClearBtn);
    expect(mockClearAll).toHaveBeenCalledTimes(1);
  });
});
