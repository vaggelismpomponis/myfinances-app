import React from 'react';
import * as Sentry from '@sentry/react';
import { useSettings } from '../contexts/SettingsContext';
import { AlertCircle, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

class ErrorBoundaryClass extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
        // Report to Sentry with component stack as extra context
        Sentry.withScope((scope) => {
            scope.setTag('context', 'ErrorBoundary');
            scope.setExtra('componentStack', errorInfo?.componentStack);
            Sentry.captureException(error);
        });
    }

    componentDidMount() {
        this.handleGlobalError = (event) => {
            console.error("Global error caught:", event.error);
            this.setState({ hasError: true, error: event.error });
            Sentry.withScope((scope) => {
                scope.setTag('context', 'GlobalError');
                Sentry.captureException(event.error ?? new Error('Unknown global error'));
            });
        };
        this.handlePromiseRejection = (event) => {
            console.error("Unhandled promise rejection caught:", event.reason);
            this.setState({ hasError: true, error: event.reason });
            Sentry.withScope((scope) => {
                scope.setTag('context', 'UnhandledRejection');
                const err = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
                Sentry.captureException(err);
            });
        };

        window.addEventListener('error', this.handleGlobalError);
        window.addEventListener('unhandledrejection', this.handlePromiseRejection);
    }

    componentWillUnmount() {
        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener('unhandledrejection', this.handlePromiseRejection);
    }

    render() {
        const { t } = this.props.settings;

        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-surface-light dark:bg-surface-dark transition-colors duration-300">
                    <div className="max-w-md w-full bg-white dark:bg-surface-dark3 rounded-3xl shadow-premium p-8 flex flex-col items-center text-center border border-gray-100 dark:border-transparent">
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 text-red-500 shadow-glow-sm">
                            <AlertCircle size={40} />
                        </div>
                        
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {t('something_went_wrong')}
                        </h1>
                        
                        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                            {t('error_message_generic')}
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl transition-all duration-300 shadow-glow flex items-center justify-center gap-2 font-bold mb-6 active:scale-[0.98]"
                        >
                            <RefreshCw size={20} className={this.state.isReloading ? "animate-spin" : ""} />
                            {t('reload_app')}
                        </button>

                        {!import.meta.env.PROD && (
                            <div className="w-full text-left">
                                <button
                                    onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2"
                                >
                                    {this.state.showDetails ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    {t('error_details')}
                                </button>

                                {this.state.showDetails && (
                                    <div className="mt-3 p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-transparent overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        <p className="font-mono text-[11px] break-all text-red-500 dark:text-red-400 mb-2 font-medium">
                                            {this.state.error && this.state.error.toString()}
                                        </p>
                                        <div className="font-mono text-[10px] text-gray-400 dark:text-gray-500 whitespace-pre-wrap max-h-40 overflow-y-auto leading-tight custom-scrollbar">
                                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const ErrorBoundary = (props) => {
    let settings;
    try {
        settings = useSettings();
    } catch (e) {
        settings = null;
    }

    // Fallback translation if context is missing
    const t = (key) => {
        if (settings?.t) return settings.t(key);
        const lang = localStorage.getItem('language') || 'el';
        const trans = {
            el: {
                something_went_wrong: 'Κάτι πήγε στραβά',
                error_message_generic: 'Παρουσιάστηκε ένα απρόσμενο σφάλμα στην εφαρμογή. Παρακαλώ δοκιμάστε να την ανανεώσετε.',
                reload_app: 'Ανανέωση Εφαρμογής',
                error_details: 'Λεπτομέρειες Σφάλματος'
            },
            en: {
                something_went_wrong: 'Something went wrong',
                error_message_generic: 'An unexpected error occurred in the application. Please try reloading.',
                reload_app: 'Reload App',
                error_details: 'Error Details'
            }
        };
        return trans[lang]?.[key] || trans['el'][key] || key;
    };

    return <ErrorBoundaryClass {...props} settings={{ ...settings, t }} />;
};

export default ErrorBoundary;









