import React from 'react';
import * as Sentry from '@sentry/react';
import { useSettings } from '../contexts/SettingsContext';
import { AlertCircle, RefreshCw, RotateCcw, ChevronDown, ChevronRight, Copy, CheckCircle2 } from 'lucide-react';

const removeInlineLoaderSafely = () => {
    if (typeof document !== 'undefined') {
        const loader = document.getElementById('inline-loader');
        if (loader) {
            try {
                loader.remove();
            } catch {
                loader.style.display = 'none';
            }
        }
    }
};

class ErrorBoundaryClass extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false,
            isReloading: false,
            copied: false,
        };
        removeInlineLoaderSafely();
    }

    static getDerivedStateFromError(error) {
        removeInlineLoaderSafely();
        return { hasError: true, error };
    }

    componentDidMount() {
        if (this.state.hasError) {
            removeInlineLoaderSafely();
        }
    }

    componentDidCatch(error, errorInfo) {
        removeInlineLoaderSafely();
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
        // Report to Sentry with component stack as extra context
        Sentry.withScope((scope) => {
            scope.setTag('context', 'ErrorBoundary');
            scope.setExtra('componentStack', errorInfo?.componentStack);
            Sentry.captureException(error);
        });
    }

    handleReload = () => {
        removeInlineLoaderSafely();
        this.setState({ isReloading: true });
        window.location.reload();
    };

    handleResetAndRestart = () => {
        removeInlineLoaderSafely();
        this.setState({ isReloading: true });
        try {
            localStorage.removeItem('lastActiveTab');
            localStorage.removeItem('lastPreviousTab');
            localStorage.removeItem('customCategories');
            localStorage.removeItem('notifications');
            sessionStorage.clear();
        } catch (e) {
            console.error('Storage clear error:', e);
        }
        window.location.href = '/';
    };

    handleCopyError = () => {
        const details = `${this.state.error?.toString() || 'Unknown error'}\n\nStack:\n${this.state.errorInfo?.componentStack || ''}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(details).then(() => {
                this.setState({ copied: true });
                setTimeout(() => this.setState({ copied: false }), 2500);
            }).catch(() => {});
        }
    };

    render() {
        const { t } = this.props.settings;

        if (this.state.hasError) {
            removeInlineLoaderSafely();
            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-surface-light dark:bg-surface-dark transition-colors duration-300 relative z-[10001] select-none">
                    <div className="max-w-md w-full bg-white dark:bg-surface-dark3 rounded-3xl shadow-premium p-8 flex flex-col items-center text-center border border-gray-100 dark:border-white/10">
                        {/* Red Icon Badge */}
                        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 text-rose-500 shadow-glow-sm shrink-0">
                            <AlertCircle size={40} strokeWidth={2} />
                        </div>
                        
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                            {t('something_went_wrong')}
                        </h1>
                        
                        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed text-sm">
                            {t('error_message_generic')}
                        </p>

                        {/* Action Buttons */}
                        <div className="w-full space-y-3 mb-6">
                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl transition-all duration-300 shadow-glow flex items-center justify-center gap-2.5 font-bold cursor-pointer active:scale-[0.98]"
                            >
                                <RefreshCw size={18} className={this.state.isReloading ? "animate-spin" : ""} strokeWidth={2.2} />
                                {t('reload_app')}
                            </button>

                            <button
                                type="button"
                                onClick={this.handleResetAndRestart}
                                className="w-full py-3 px-4 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold text-xs cursor-pointer active:scale-[0.98] border border-gray-200/60 dark:border-white/5"
                            >
                                <RotateCcw size={15} strokeWidth={2} />
                                {t('clear_cache_restart') || 'Εκκαθάριση & Επανεκκίνηση'}
                            </button>
                        </div>

                        {/* Expandable Technical Details */}
                        <div className="w-full text-left pt-2 border-t border-gray-100 dark:border-white/5">
                            <button
                                type="button"
                                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                                className="flex items-center justify-between w-full text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-2 cursor-pointer"
                            >
                                <span className="flex items-center gap-1.5">
                                    {this.state.showDetails ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                    {t('error_details')}
                                </span>
                                {this.state.showDetails && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            this.handleCopyError();
                                        }}
                                        className="flex items-center gap-1 text-[11px] text-violet-600 dark:text-violet-400 font-bold hover:underline"
                                    >
                                        {this.state.copied ? (
                                            <>
                                                <CheckCircle2 size={13} />
                                                <span>{t('copied') || 'Αντιγράφηκε'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={13} />
                                                <span>{t('copy_error') || 'Αντιγραφή'}</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </button>

                            {this.state.showDetails && (
                                <div className="mt-2.5 p-3.5 bg-gray-50 dark:bg-black/30 rounded-xl border border-gray-200/80 dark:border-white/5 overflow-hidden text-left">
                                    <p className="font-mono text-[11px] break-all text-rose-500 dark:text-rose-400 mb-2 font-semibold">
                                        {this.state.error && this.state.error.toString()}
                                    </p>
                                    <div className="font-mono text-[10px] text-gray-500 dark:text-gray-400 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed custom-scrollbar">
                                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                                    </div>
                                </div>
                            )}
                        </div>
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
        const lang = (typeof localStorage !== 'undefined' && localStorage.getItem('language')) || 'el';
        const trans = {
            el: {
                something_went_wrong: 'Κάτι πήγε στραβά',
                error_message_generic: 'Παρουσιάστηκε ένα μη αναμενόμενο σφάλμα στην εφαρμογή. Παρακαλούμε δοκιμάστε να την ανανεώσετε.',
                reload_app: 'Ανανέωση Εφαρμογής',
                clear_cache_restart: 'Εκκαθάριση & Επανεκκίνηση',
                error_details: 'Λεπτομέρειες Σφάλματος',
                copy_error: 'Αντιγραφή',
                copied: 'Αντιγράφηκε',
            },
            en: {
                something_went_wrong: 'Something went wrong',
                error_message_generic: 'An unexpected error occurred in the application. Please try reloading.',
                reload_app: 'Reload App',
                clear_cache_restart: 'Clear Cache & Restart',
                error_details: 'Error Details',
                copy_error: 'Copy',
                copied: 'Copied',
            }
        };
        return trans[lang]?.[key] || trans['el'][key] || key;
    };

    return <ErrorBoundaryClass {...props} settings={{ ...settings, t }} />;
};

export default ErrorBoundary;









