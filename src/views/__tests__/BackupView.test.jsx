import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BackupView from '../BackupView';
import { useSettings } from '../../contexts/SettingsContext';
import { useToast } from '../../contexts/ToastContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { supabase } from '../../supabase';

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

vi.mock('../../contexts/ToastContext', () => ({
  useToast: vi.fn(),
}));

vi.mock('../../contexts/SubscriptionContext', () => ({
  useSubscription: vi.fn(),
}));

vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: [] }),
      })),
    })),
  },
}));

describe('BackupView', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@spendwise.app',
  };

  const mockOpenUpgradeModal = vi.fn();
  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    useSettings.mockReturnValue({
      t: () => undefined, // Allows default English fallback strings to render
      customCategories: [],
      language: 'en',
      currency: '€',
      theme: 'light',
    });
    useToast.mockReturnValue({
      showToast: mockShowToast,
    });
  });

  it('renders PRO badge on Export button and opens upgrade modal when non-pro user clicks Export', () => {
    useSubscription.mockReturnValue({
      isPro: false,
      openUpgradeModal: mockOpenUpgradeModal,
    });

    render(<BackupView user={mockUser} onBack={vi.fn()} hideHeader={false} />);

    // ProBadge text is PRO
    expect(screen.getByText('PRO')).toBeInTheDocument();

    const exportBtn = screen.getByRole('button', { name: /Export Full Backup/i });
    fireEvent.click(exportBtn);

    expect(mockOpenUpgradeModal).toHaveBeenCalledWith('export');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('does not render PRO badge and allows export for PRO users', async () => {
    useSubscription.mockReturnValue({
      isPro: true,
      openUpgradeModal: mockOpenUpgradeModal,
    });

    render(<BackupView user={mockUser} onBack={vi.fn()} hideHeader={false} />);

    expect(screen.queryByText('PRO')).not.toBeInTheDocument();

    const exportBtn = screen.getByRole('button', { name: /Export Full Backup/i });
    fireEvent.click(exportBtn);

    expect(mockOpenUpgradeModal).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('transactions');
    });
  });
});
