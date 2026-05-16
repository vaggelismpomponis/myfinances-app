import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { registerSW } from 'virtual:pwa-register'
import './index.css'

// Initialize Sentry (only when DSN is configured)
if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,           // 'development' | 'production'
        release: import.meta.env.VITE_APP_VERSION,  // optional — set in .env
        // Capture 100% of errors, 10% of performance traces
        tracesSampleRate: 0.1,
        // Automatically capture unhandled promise rejections & global errors
        integrations: [
            Sentry.browserTracingIntegration(),
        ],
    });
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

// Suppress console logs in production
if (import.meta.env.PROD) {
    console.log = () => { };
    console.debug = () => { };
    console.info = () => { };
    console.warn = () => { };
    console.error = () => { };
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
)









