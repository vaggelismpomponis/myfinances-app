import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, type = 'danger' }) => {
    const { t } = useSettings();
    const resolvedConfirmText = confirmText || t('confirm_default');
    if (!isOpen) return null;

    const isDanger = type === 'danger';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="bg-white dark:bg-surface-dark2 rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-scale-in border border-gray-100">
                <div className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDanger ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500'}`}>
                        {isDanger ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-100 dark:bg-white text-gray-700 dark:text-black rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-100 transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-3 px-4 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 ${isDanger
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-none'
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
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









