import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SetPasswordPromptModal from '../SetPasswordPromptModal';
import { supabase } from '../../supabase';

vi.mock('../../contexts/SettingsContext', () => ({
    useSettings: () => ({
        t: (key) => key,
        language: 'el'
    })
}));

describe('SetPasswordPromptModal Component', () => {
    const mockUser = {
        id: 'test-google-user',
        email: 'googleuser@gmail.com',
        app_metadata: { provider: 'google' }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('does not render when isOpen is false', () => {
        const { container } = render(
            <SetPasswordPromptModal isOpen={false} onClose={() => {}} onSuccess={() => {}} user={mockUser} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders with user email and inputs when isOpen is true', () => {
        render(
            <SetPasswordPromptModal isOpen={true} onClose={() => {}} onSuccess={() => {}} user={mockUser} />
        );

        expect(screen.getByText('googleuser@gmail.com')).toBeInTheDocument();
        expect(screen.getByText('set_password_title')).toBeInTheDocument();
        expect(screen.getByText('set_password_btn')).toBeInTheDocument();
        expect(screen.getByText('set_password_later')).toBeInTheDocument();
    });

    it('triggers onClose when close or later button is clicked', () => {
        const handleClose = vi.fn();
        render(
            <SetPasswordPromptModal isOpen={true} onClose={handleClose} onSuccess={() => {}} user={mockUser} />
        );

        const laterBtn = screen.getByText('set_password_later');
        fireEvent.click(laterBtn);
        expect(handleClose).toHaveBeenCalledTimes(1);

        const closeBtn = screen.getByLabelText(/close/i);
        fireEvent.click(closeBtn);
        expect(handleClose).toHaveBeenCalledTimes(2);
    });

    it('validates password mismatch and shows error', async () => {
        render(
            <SetPasswordPromptModal isOpen={true} onClose={() => {}} onSuccess={() => {}} user={mockUser} />
        );

        const pwdInput = screen.getByLabelText('new_password');
        const confirmInput = screen.getByLabelText('confirm_new_password');

        fireEvent.change(pwdInput, { target: { value: 'Secret123' } });
        fireEvent.change(confirmInput, { target: { value: 'Different123' } });

        const submitBtn = screen.getByRole('button', { name: /set_password_btn/i });
        fireEvent.click(submitBtn);

        expect(screen.getByText('password_mismatch')).toBeInTheDocument();
        expect(supabase.auth.updateUser).not.toHaveBeenCalled();
    });

    it('submits valid password, calls supabase.auth.updateUser, and triggers onSuccess', async () => {
        const handleSuccess = vi.fn();
        supabase.auth.updateUser.mockResolvedValueOnce({
            data: { user: { ...mockUser, user_metadata: { has_set_password: true } } },
            error: null
        });

        render(
            <SetPasswordPromptModal isOpen={true} onClose={() => {}} onSuccess={handleSuccess} user={mockUser} />
        );

        const pwdInput = screen.getByLabelText('new_password');
        const confirmInput = screen.getByLabelText('confirm_new_password');

        fireEvent.change(pwdInput, { target: { value: 'Secret123!' } });
        fireEvent.change(confirmInput, { target: { value: 'Secret123!' } });

        const submitBtn = screen.getByRole('button', { name: /set_password_btn/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(supabase.auth.updateUser).toHaveBeenCalledWith({
                password: 'Secret123!',
                data: expect.objectContaining({
                    has_set_password: true
                })
            });
            expect(handleSuccess).toHaveBeenCalledTimes(1);
        });
    });
});
