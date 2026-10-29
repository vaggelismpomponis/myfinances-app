import React from 'react';
import { X, Bell, Radio, CheckCircle2 } from 'lucide-react';

const BroadcastModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="broadcast-modal-title"
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" 
                onClick={onClose} 
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white dark:bg-surface-dark2 rounded-2xl overflow-hidden shadow-xl animate-scale-in border border-gray-200 dark:border-white/10">
                
                {/* Executive Header */}
                <div className="h-24 bg-gray-100/90 dark:bg-surface-dark2 border-b border-gray-200 dark:border-white/10 relative overflow-hidden flex items-center justify-center">
                    <Radio size={32} strokeWidth={2.2} className="text-gray-900 dark:text-white" />
                    
                    <button 
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-gray-200/60 dark:bg-white/[0.08] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-8 text-center space-y-4">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.2em]">Ανακοίνωση</span>
                        <h3 id="broadcast-modal-title" className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                            {data.title}
                        </h3>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-white/[0.03] p-5 rounded-2xl border border-gray-100 dark:border-transparent">
                        <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                            {data.message}
                        </p>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                        <CheckCircle2 size={18} className="text-violet-500" />
                        Κατάλαβα
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BroadcastModal;
