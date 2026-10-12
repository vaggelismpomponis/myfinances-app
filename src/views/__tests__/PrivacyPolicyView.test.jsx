import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PrivacyPolicyView from '../PrivacyPolicyView';
import { useSettings } from '../../contexts/SettingsContext';

vi.mock('../../contexts/SettingsContext', () => ({
  useSettings: vi.fn(),
}));

describe('PrivacyPolicyView', () => {
  it('renders privacy policy content and does not contain third-party infrastructure section', () => {
    useSettings.mockReturnValue({ language: 'el' });
    const mockOnBack = vi.fn();

    render(<PrivacyPolicyView onBack={mockOnBack} />);

    // Renders header and core sections
    expect(screen.getByText('Πολιτική Απορρήτου')).toBeInTheDocument();
    expect(screen.getByText('Τι δεδομένα συλλέγουμε')).toBeInTheDocument();
    expect(screen.getByText('Ασφάλεια Δεδομένων & Κρυπτογράφηση')).toBeInTheDocument();
    expect(screen.getByText('Τα Δικαιώματά σας & Κυριαρχία Δεδομένων')).toBeInTheDocument();

    // Verify third-party infrastructure section is removed
    expect(screen.queryByText('Υπηρεσίες & Υποδομές Τρίτων')).not.toBeInTheDocument();
    expect(screen.queryByText(/Η εφαρμογή SpendWise βασίζεται στις εξής αξιόπιστες υπηρεσίες/i)).not.toBeInTheDocument();

    // Verify onBack navigation
    const backBtn = screen.getByText('Επιστροφή');
    fireEvent.click(backBtn);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('renders English content properly when language is en without third-party services', () => {
    useSettings.mockReturnValue({ language: 'en' });
    const mockOnBack = vi.fn();

    render(<PrivacyPolicyView onBack={mockOnBack} />);

    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('What Data We Collect')).toBeInTheDocument();
    expect(screen.queryByText('Third-Party Services')).not.toBeInTheDocument();
  });
});
