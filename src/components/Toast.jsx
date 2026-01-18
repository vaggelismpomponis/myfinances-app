import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Auto close after 3s

        return () => clearTimeout(timer);
    }, [onClose]);

    const isSuccess = type === 'success';

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-slide-in-down">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md ${isSuccess
                    ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800 dark:bg-emerald-900/90 dark:border-emerald-800 dark:text-emerald-100'
                    : 'bg-red-50/90 border-red-100 text-red-800 dark:bg-red-900/90 dark:border-red-800 dark:text-red-100'
                }`}>
                {isSuccess ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <p className="text-sm font-medium">{message}</p>
                <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default Toast;
