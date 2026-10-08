import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PlayStoreModal from '../PlayStoreModal';
import { PLAY_STORE_URL } from '../../utils/platform';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        t: (key) => key,
        language: 'el'
    })
}));

describe('PlayStoreModal Component', () => {
    it('does not render when isOpen is false', () => {
        const { container } = render(<PlayStoreModal isOpen={false} onClose={() => {}} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders with app branding and Google Play link when isOpen is true', () => {
        render(<PlayStoreModal isOpen={true} onClose={() => {}} />);

        expect(screen.getByText('SpendWise')).toBeInTheDocument();
        expect(screen.getByText('Google Play')).toBeInTheDocument();

        // Check Play Store CTA link
        const playStoreLink = screen.getByRole('link', { name: /Google Play/i });
        expect(playStoreLink).toHaveAttribute('href', PLAY_STORE_URL);
        expect(playStoreLink).toHaveAttribute('target', '_blank');
    });

    it('triggers onClose when close button is clicked', () => {
        const handleClose = vi.fn();
        render(<PlayStoreModal isOpen={true} onClose={handleClose} />);

        const closeBtn = screen.getByLabelText(/close/i);
        fireEvent.click(closeBtn);
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
