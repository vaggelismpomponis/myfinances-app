import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // Auto close after 3s

        return () => clearTimeout(timer);
    }, [onClose]);

    const getStyles = () => {
        switch (type) {
            case 'error':
                return {
                    bg: 'bg-white/95 dark:bg-red-950/40',
                    border: 'border-red-100 dark:border-red-500/20',
                    text: 'text-red-800 dark:text-red-200',
                    icon: <AlertCircle className="text-red-500" size={20} />,
                    progress: 'bg-red-500'
                };
            case 'info':
                return {
                    bg: 'bg-white/95 dark:bg-blue-950/40',
                    border: 'border-blue-100 dark:border-blue-500/20',
                    text: 'text-blue-800 dark:text-blue-200',
                    icon: <Info className="text-blue-500" size={20} />,
                    progress: 'bg-blue-500'
                };
            case 'warning':
                return {
                    bg: 'bg-white/95 dark:bg-amber-950/40',
                    border: 'border-amber-100 dark:border-amber-500/20',
                    text: 'text-amber-800 dark:text-amber-200',
                    icon: <AlertCircle className="text-amber-500" size={20} />,
                    progress: 'bg-amber-500'
                };
            default: // success
                return {
                    bg: 'bg-white/95 dark:bg-emerald-950/40',
                    border: 'border-emerald-100 dark:border-emerald-500/20',
                    text: 'text-emerald-800 dark:text-emerald-200',
                    icon: <CheckCircle2 className="text-emerald-500" size={20} />,
                    progress: 'bg-emerald-500'
                };
        }
    };

    const styles = getStyles();

    return (
        <div className="fixed top-[calc(env(safe-area-inset-top)+1rem)] left-0 right-0 flex justify-center z-[100] pointer-events-none px-4">
            <div className="animate-slide-down pointer-events-auto w-full max-w-sm">
                <div className={`relative overflow-hidden flex items-center gap-3.5 px-4 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border backdrop-blur-xl transition-all ${styles.bg} ${styles.border}`}>
                    
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        {styles.icon}
                    </div>

                    {/* Message */}
                    <div className="flex-1 min-w-0">
                        <p className={`text-[14px] font-semibold leading-tight ${styles.text}`}>
                            {message}
                        </p>
                    </div>

                    {/* Close Button */}
                    <button 
                        onClick={onClose} 
                        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={16} className="text-gray-400 dark:text-gray-500" />
                    </button>

                    {/* Progress Bar (Depleting) */}
                    <div className="absolute bottom-0 left-0 h-[3px] w-full bg-black/5 dark:bg-white/5">
                        <div 
                            className={`h-full ${styles.progress} transition-all duration-[3000ms] linear`}
                            style={{ 
                                animation: 'toast-progress 3s linear forwards' 
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Toast;









