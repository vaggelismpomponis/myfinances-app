import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminUsersList from '../admin/AdminUsersList';

describe('AdminUsersList Component', () => {
    const mockProfiles = [
        {
            id: 'user-1',
            email: 'alice@example.com',
            display_name: 'Alice User',
            subscription_status: 'free',
            created_at: '2026-01-01T00:00:00Z',
            latest_session: { last_active: new Date().toISOString(), device: 'Windows PC' }
        },
        {
            id: 'user-2',
            email: 'bob@example.com',
            display_name: 'Bob Admin',
            subscription_status: 'pro',
            created_at: '2026-02-01T00:00:00Z',
            latest_session: { last_active: new Date().toISOString(), device: 'iPhone' }
        }
    ];

    const mockSessions = [
        { id: 'sess-1', user_id: 'user-1' },
        { id: 'sess-2', user_id: 'user-2' }
    ];

    const translate = (key) => {
        const dict = {
            admin_view_on_stripe: 'View on Stripe',
            admin_send_email: 'Send Email',
            admin_copy_user_id: 'Copy User ID',
            admin_notes: 'Notes',
            admin_grant_pro: 'Grant Pro',
            admin_revoke_pro: 'Revoke Pro'
        };
        return dict[key] || key;
    };

    it('renders user rows without card overflow-hidden', () => {
        const { container } = render(
            <AdminUsersList
                profiles={mockProfiles}
                sessions={mockSessions}
                onProfileClick={vi.fn()}
                onSubClick={vi.fn()}
                onDropdownAction={vi.fn()}
                activeDropdown={null}
                setActiveDropdown={vi.fn()}
                translate={translate}
            />
        );

        expect(screen.getByText('Alice User')).toBeInTheDocument();
        expect(screen.getByText('Bob Admin')).toBeInTheDocument();

        // Ensure user row card doesn't have overflow-hidden which clips dropdown menus
        const cards = container.querySelectorAll('.cursor-pointer');
        expect(cards.length).toBe(2);
        expect(cards[0].className).not.toContain('overflow-hidden');
    });

    it('applies z-30 stacking and reveals actions when dropdown is opened', () => {
        const setActiveDropdown = vi.fn();
        const { container } = render(
            <AdminUsersList
                profiles={mockProfiles}
                sessions={mockSessions}
                onProfileClick={vi.fn()}
                onSubClick={vi.fn()}
                onDropdownAction={vi.fn()}
                activeDropdown="user-1"
                setActiveDropdown={setActiveDropdown}
                translate={translate}
            />
        );

        // user-2 joined later so it is first (desc), user-1 is cards[1] with active dropdown
        const cards = container.querySelectorAll('.cursor-pointer');
        expect(cards[1].className).toContain('z-30');
        expect(cards[0].className).toContain('z-0');

        // Dropdown menu items should be in document
        expect(screen.getByText('View on Stripe')).toBeInTheDocument();
        expect(screen.getByText('Send Email')).toBeInTheDocument();
        expect(screen.getByText('Copy User ID')).toBeInTheDocument();
        expect(screen.getByText('Notes')).toBeInTheDocument();
    });

    it('closes dropdown when Escape key is pressed', () => {
        const setActiveDropdown = vi.fn();
        render(
            <AdminUsersList
                profiles={mockProfiles}
                sessions={mockSessions}
                onProfileClick={vi.fn()}
                onSubClick={vi.fn()}
                onDropdownAction={vi.fn()}
                activeDropdown="user-1"
                setActiveDropdown={setActiveDropdown}
                translate={translate}
            />
        );

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(setActiveDropdown).toHaveBeenCalledWith(null);
    });
});
