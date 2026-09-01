import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Onboarding Tour Trigger Rules', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    const evaluateTourAutoLaunch = ({ user, loading, transactions }) => {
        if (loading || !user) return { shouldRun: false, reason: 'not_ready' };

        const hasSeenTour =
            user.user_metadata?.tour_seen === true ||
            localStorage.getItem(`sw_tour_seen_${user.id}`) === 'true' ||
            localStorage.getItem('sw_tour_seen') === 'true';

        const isNewSignup =
            sessionStorage.getItem('sw_is_new_signup') === 'true' ||
            localStorage.getItem('sw_is_new_signup') === 'true' ||
            (user.created_at && (Date.now() - new Date(user.created_at).getTime() < 90000) && !hasSeenTour && (!transactions || transactions.length === 0));

        // Consume markers
        sessionStorage.removeItem('sw_is_new_signup');
        localStorage.removeItem('sw_is_new_signup');

        if (isNewSignup && !hasSeenTour) {
            return { shouldRun: true, reason: 'new_signup' };
        } else {
            if (!hasSeenTour) {
                localStorage.setItem(`sw_tour_seen_${user.id}`, 'true');
            }
            return { shouldRun: false, reason: 'existing_or_seen' };
        }
    };

    it('does NOT auto-launch tour for existing users logging in (normal login)', () => {
        const existingUser = {
            id: 'user-123',
            email: 'existing@example.com',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            user_metadata: {}
        };

        const result = evaluateTourAutoLaunch({
            user: existingUser,
            loading: false,
            transactions: [{ id: 'tx-1', amount: 50 }]
        });

        expect(result.shouldRun).toBe(false);
        // Ensure flag is set so they are permanently considered seen on this device
        expect(localStorage.getItem('sw_tour_seen_user-123')).toBe('true');
    });

    it('does NOT auto-launch tour for existing users with 0 transactions logging in', () => {
        const existingUser = {
            id: 'user-456',
            email: 'zero_tx@example.com',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            user_metadata: {}
        };

        const result = evaluateTourAutoLaunch({
            user: existingUser,
            loading: false,
            transactions: []
        });

        expect(result.shouldRun).toBe(false);
        expect(localStorage.getItem('sw_tour_seen_user-456')).toBe('true');
    });

    it('does NOT auto-launch tour if user has already completed/seen the tour', () => {
        const user = {
            id: 'user-seen',
            email: 'seen@example.com',
            created_at: new Date().toISOString(),
            user_metadata: { tour_seen: true }
        };

        const result = evaluateTourAutoLaunch({
            user,
            loading: false,
            transactions: []
        });

        expect(result.shouldRun).toBe(false);
    });

    it('DOES auto-launch tour for a newly registered email user (OTP flow)', () => {
        // User registers and verifies OTP
        sessionStorage.setItem('sw_is_new_signup', 'true');
        localStorage.setItem('sw_is_new_signup', 'true');

        const newUser = {
            id: 'user-new-email',
            email: 'newbie@example.com',
            created_at: new Date().toISOString(),
            user_metadata: {}
        };

        const result = evaluateTourAutoLaunch({
            user: newUser,
            loading: false,
            transactions: []
        });

        expect(result.shouldRun).toBe(true);
        expect(result.reason).toBe('new_signup');
        // Transient flags must be consumed
        expect(sessionStorage.getItem('sw_is_new_signup')).toBeNull();
        expect(localStorage.getItem('sw_is_new_signup')).toBeNull();

        // Subsequent check (e.g. reload or next login) must NOT run again once tour finishes
        localStorage.setItem('sw_tour_seen_user-new-email', 'true');
        const nextResult = evaluateTourAutoLaunch({
            user: newUser,
            loading: false,
            transactions: []
        });
        expect(nextResult.shouldRun).toBe(false);
    });

    it('DOES auto-launch tour for a brand new Google user signed up within 90 seconds', () => {
        const brandNewGoogleUser = {
            id: 'user-new-google',
            email: 'googleuser@gmail.com',
            created_at: new Date(Date.now() - 5000).toISOString(), // 5 seconds ago
            user_metadata: {}
        };

        const result = evaluateTourAutoLaunch({
            user: brandNewGoogleUser,
            loading: false,
            transactions: []
        });

        expect(result.shouldRun).toBe(true);
    });
});
