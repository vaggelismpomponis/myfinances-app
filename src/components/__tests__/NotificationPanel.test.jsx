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

describe('NotificationPanel', () => {
  const mockOnClose = vi.fn();
  const mockClearAll = vi.fn();
  const mockDeleteNotification = vi.fn();
  const mockMarkAllRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useSettings.mockReturnValue({
      t: (key) => key,
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

    expect(screen.getByText('notifications')).toBeInTheDocument();
    expect(screen.getByText('no_notifications')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockMarkAllRead).toHaveBeenCalledTimes(1);
  });
});
