import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Navbar from '../Navbar';
import { useSettings } from '../../contexts/SettingsContext';
import { useSubscription } from '../../contexts/SubscriptionContext';

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

vi.mock('../../contexts/SubscriptionContext', () => ({
  useSubscription: vi.fn(),
}));

describe('Navbar', () => {
  const mockSetActiveTab = vi.fn();
  const mockOpenUpgradeModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useSettings.mockReturnValue({
      t: (key) => {
        const translations = {
          nav_home: 'Αρχική',
          nav_stats: 'Ανάλυση',
          nav_history: 'Ιστορικό',
          settings: 'Ρυθμίσεις',
        };
        return translations[key] || key;
      },
    });
    useSubscription.mockReturnValue({
      isPro: true,
      openUpgradeModal: mockOpenUpgradeModal,
    });
  });

  it('renders all 4 navigation items with correct labels including Settings', () => {
    render(<Navbar activeTab="home" setActiveTab={mockSetActiveTab} />);

    expect(screen.getByText('Αρχική')).toBeInTheDocument();
    expect(screen.getByText('Ανάλυση')).toBeInTheDocument();
    expect(screen.getByText('Ιστορικό')).toBeInTheDocument();
    expect(screen.getByText('Ρυθμίσεις')).toBeInTheDocument();
    expect(screen.queryByText('Προφίλ')).not.toBeInTheDocument();
  });

  it('navigates to settings/profile tab when settings button is clicked', () => {
    render(<Navbar activeTab="home" setActiveTab={mockSetActiveTab} />);

    const settingsBtn = screen.getByRole('button', { name: 'Ρυθμίσεις' });
    fireEvent.click(settingsBtn);

    expect(mockSetActiveTab).toHaveBeenCalledWith('profile');
  });

  it('opens upgrade modal when non-pro user clicks stats tab', () => {
    useSubscription.mockReturnValue({
      isPro: false,
      openUpgradeModal: mockOpenUpgradeModal,
    });

    render(<Navbar activeTab="home" setActiveTab={mockSetActiveTab} />);

    const statsBtn = screen.getByRole('button', { name: 'Ανάλυση' });
    fireEvent.click(statsBtn);

    expect(mockOpenUpgradeModal).toHaveBeenCalledWith('stats');
    expect(mockSetActiveTab).not.toHaveBeenCalled();
  });
});
