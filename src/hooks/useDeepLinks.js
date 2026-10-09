import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import logger from '../utils/logger';

export function useDeepLinks({ setPendingShortcutAction, setShowPaymentSuccess, setShowPaymentCanceled }) {
    // Deep Link Listener for Stripe Redirection
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const handleDeepLink = (data) => {
            if (!data || !data.url) return;
            try {
                const rawUrl = data.url;
                const searchPart = rawUrl.includes('?') ? rawUrl.slice(rawUrl.indexOf('?')) : '';
                const searchParams = new URLSearchParams(searchPart);

                // Check for home screen app shortcuts (Add Expense / Add Income)
                const action = searchParams.get('action');
                if (action === 'add-expense') {
                    setPendingShortcutAction('expense');
                    return;
                }
                if (action === 'add-income') {
                    setPendingShortcutAction('income');
                    return;
                }

                // Check for payment success
                if (searchParams.get('upgraded') === 'true' || rawUrl.includes('payment-success')) {
                    setShowPaymentSuccess(true);
                    Browser.close().catch(() => { }); // Close the in-app browser if it's still open
                }

                // Check for payment cancellation
                if (searchParams.get('canceled') === 'true' || rawUrl.includes('payment-cancel')) {
                    setShowPaymentCanceled(true);
                    Browser.close().catch(() => { });
                }
            } catch (err) {
                logger.error('Error handling deep link', err, 'App');
            }
        };

        const listener = CapApp.addListener('appUrlOpen', handleDeepLink);

        // Also check if the app was started via a deep link
        CapApp.getLaunchUrl().then((launchUrl) => {
            if (launchUrl) {
                handleDeepLink(launchUrl);
            }
        });

        // Also check if returning from Stripe checkout in in-app browser
        const checkPendingCheckout = () => {
            if (sessionStorage.getItem('pending_stripe_checkout') === 'true') {
                sessionStorage.removeItem('pending_stripe_checkout');
                setShowPaymentSuccess(true);
            }
        };

        const browserFinishedPromise = Browser.addListener('browserFinished', checkPendingCheckout);
        const appStatePromise = CapApp.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
                checkPendingCheckout();
            }
        });

        return () => {
            Promise.resolve(listener).then(h => h?.remove?.()).catch(() => {});
            Promise.resolve(browserFinishedPromise).then(h => h?.remove?.()).catch(() => {});
            Promise.resolve(appStatePromise).then(h => h?.remove?.()).catch(() => {});
        };
    }, [setPendingShortcutAction, setShowPaymentCanceled, setShowPaymentSuccess]);

    // Check for PWA home screen shortcut launches (?action=add-expense or ?action=add-income)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const searchParams = new URLSearchParams(window.location.search);
            const action = searchParams.get('action');
            if (action === 'add-expense') {
                setPendingShortcutAction('expense');
                const url = new URL(window.location.href);
                url.searchParams.delete('action');
                window.history.replaceState({}, document.title, url.pathname + (url.search || '') + (url.hash || ''));
            } else if (action === 'add-income') {
                setPendingShortcutAction('income');
                const url = new URL(window.location.href);
                url.searchParams.delete('action');
                window.history.replaceState({}, document.title, url.pathname + (url.search || '') + (url.hash || ''));
            }
        } catch (e) {
            // ignore
        }
    }, [setPendingShortcutAction]);
}
