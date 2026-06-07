import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CalendarSection from '../CalendarSection';
import { useSettings } from '../../contexts/SettingsContext';

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

vi.mock('../Amount', () => ({
  default: ({ value }) => <span>{value}</span>,
}));

vi.mock('../CategoryIcon', () => ({
  default: () => <span>Icon</span>,
}));

describe('CalendarSection', () => {
  const defaultProps = {
    transactions: [
      { id: '1', amount: 50, type: 'expense', category: 'Food', date: '2026-06-07', note: 'Dinner' },
      { id: '2', amount: 100, type: 'income', category: 'Salary', date: '2026-06-07', note: 'Paycheck' }
    ],
    calendarYear: 2026,
    calendarMonth: 5, // June (0-indexed)
    setCalendarYear: vi.fn(),
    setCalendarMonth: vi.fn()
  };

  const mockT = vi.fn((key) => key);

  it('renders Calendar component correctly', () => {
    useSettings.mockReturnValue({
      t: mockT,
      privacyMode: false,
      language: 'en',
    });

    render(<CalendarSection {...defaultProps} />);

    expect(screen.getByText('calendar_title')).toBeInTheDocument();
  });
});
