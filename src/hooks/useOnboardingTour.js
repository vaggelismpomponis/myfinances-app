import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import logger from '../utils/logger';

export function useOnboardingTour({ loading, user, transactions, setActiveTab }) {
    const [tourKey, setTourKey] = useState(0);
    const [runTour, setRunTour] = useState(false);

    // Auto-launch tour ONLY the 1st time a user signs in after sign up as on-boarding.
    // Existing users signing in or refreshing will NEVER be auto-shown the tour.
    useEffect(() => {
        if (loading || !user) return;

        const hasSeenTour =
            user.user_metadata?.tour_seen === true ||
            localStorage.getItem(`sw_tour_seen_${user.id}`) === 'true' ||
            localStorage.getItem('sw_tour_seen') === 'true';

        const isNewSignup =
            sessionStorage.getItem('sw_is_new_signup') === 'true' ||
            localStorage.getItem('sw_is_new_signup') === 'true' ||
            (user.created_at && (Date.now() - new Date(user.created_at).getTime() < 90000) && !hasSeenTour && (!transactions || transactions.length === 0));

        // Consume and clean up transient registration markers
        sessionStorage.removeItem('sw_is_new_signup');
        localStorage.removeItem('sw_is_new_signup');

        if (isNewSignup && !hasSeenTour) {
            // Auto-launch once for newly registered users after app finishes loading.
            // 900ms delay avoids conflicting with WhatsNew / Broadcast modals.
            const timer = setTimeout(() => {
                setTourKey(k => k + 1);
                setRunTour(true);
            }, 900);
            return () => clearTimeout(timer);
        } else {
            // Returning / existing user: ensure user-scoped tour_seen flag is saved so it never auto-runs
            if (!hasSeenTour) {
                localStorage.setItem(`sw_tour_seen_${user.id}`, 'true');
            }
        }
    }, [loading, user, transactions]);

    const handleTourFinish = () => {
        setRunTour(false);
        sessionStorage.removeItem('sw_is_new_signup');
        localStorage.removeItem('sw_is_new_signup');
        localStorage.setItem('sw_tour_seen', 'true');
        if (user?.id) {
            localStorage.setItem(`sw_tour_seen_${user.id}`, 'true');
            supabase.auth.updateUser({ data: { tour_seen: true } }).catch(err => {
                logger.warn('Failed to update tour_seen in user_metadata', err, 'App');
            });
        }
    };

    const handleStartTour = () => {
        // Navigate to home first so all tour targets are visible
        setActiveTab('home');
        setRunTour(false);
        setTourKey(k => k + 1);
        setTimeout(() => setRunTour(true), 300);
    };

    return { tourKey, runTour, handleTourFinish, handleStartTour };
}
