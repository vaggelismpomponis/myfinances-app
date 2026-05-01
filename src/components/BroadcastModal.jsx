import React from 'react';
import { X, Bell, Radio, CheckCircle2 } from 'lucide-react';

const BroadcastModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" 
                onClick={onClose} 
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white dark:bg-surface-dark2 rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-in border border-gray-100 dark:border-white/5">
                
                {/* Decorative Top */}
                <div className="h-32 bg-gradient-to-br from-violet-600 to-indigo-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl" />
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/30 animate-float">
                            <Radio size={32} strokeWidth={2.5} />
                        </div>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-8 text-center space-y-4">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.2em]">Ανακοίνωση</span>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
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
