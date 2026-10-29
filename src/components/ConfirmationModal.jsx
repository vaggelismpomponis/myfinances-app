import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, type = 'danger' }) => {
    const { t } = useSettings();
    const resolvedConfirmText = confirmText || t('confirm_default');
    if (!isOpen) return null;

    const isDanger = type === 'danger';

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-scale-in border border-gray-300 dark:border-white/10">
                <div className="p-6 text-center">
                    <div className="flex justify-center mb-4">{isDanger ? <AlertTriangle size={36} className="text-rose-500 shrink-0" /> : <CheckCircle2 size={36} className="text-emerald-500 shrink-0" />}</div>

                    <h3 id="confirm-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 bg-gray-200/70 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-gray-300/60 dark:border-white/[0.1] rounded-xl font-bold transition-all active:scale-95 text-sm"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-2.5 px-4 font-bold rounded-xl shadow-sm transition-all active:scale-95 text-sm ${isDanger
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : 'bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900'
                                }`}
                        >
                            {resolvedConfirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;









