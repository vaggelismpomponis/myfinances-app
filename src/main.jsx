import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { registerSW } from 'virtual:pwa-register'
import './index.css'

// Suppress unhandled errors and rejections from third-party browser extensions (e.g. Urban VPN 200.js harvester scripts)
if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason;
        const stack = reason?.stack || '';
        const message = reason?.message || String(reason || '');
        if (
            stack.includes('200.js') ||
            stack.includes('chrome-extension://') ||
            stack.includes('moz-extension://') ||
            message.includes('200.js')
        ) {
            event.preventDefault();
        }
    });

    window.addEventListener('error', (event) => {
        const filename = event.filename || '';
        const message = event.message || '';
        if (
            filename.includes('200.js') ||
            filename.includes('chrome-extension://') ||
            filename.includes('moz-extension://') ||
            message.includes('200.js')
        ) {
            event.preventDefault();
            return true;
        }
    });
}

// Initialize Sentry (only when DSN is configured)
// Deferred behind requestIdleCallback to keep it off the critical render path
if (import.meta.env.VITE_SENTRY_DSN) {
    const initSentry = () => {
        Sentry.init({
            dsn: import.meta.env.VITE_SENTRY_DSN,
            environment: import.meta.env.MODE,           // 'development' | 'production'
            release: import.meta.env.VITE_APP_VERSION,  // optional — set in .env
            // Capture 100% of errors, 10% of performance traces
            tracesSampleRate: 0.1,
            integrations: [
                Sentry.browserTracingIntegration({
                    // Only attach trace headers to same-origin requests to avoid CORS issues with Supabase Edge Functions
                    tracePropagationTargets: [/^\//]
                }),
            ],
        });
    };
    if ('requestIdleCallback' in window) {
        requestIdleCallback(initSentry);
    } else {
        setTimeout(initSentry, 200);
    }
}

// Unregister any stale service workers in dev mode (prevents old cached index.html from showing)
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
    });
} else if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    // Manually register to catch unhandled promise rejections on unsupported browsers/crawlers
    registerSW({
        immediate: true,
        onRegisterError(error) {
            console.error('Service worker registration failed:', error);
        }
    });
}

// Suppress console logs in production (keep console.error for Sentry + browser error reporting)
if (import.meta.env.PROD) {
    console.log = () => { };
    console.debug = () => { };
    console.info = () => { };
    console.warn = () => { };
}

import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>,
)









