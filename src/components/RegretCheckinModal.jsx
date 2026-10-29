import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, ThumbsDown } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const RegretCheckinModal = ({ isOpen, onClose, transactionId }) => {
    const updateTransaction = useAppStore(state => state.updateTransaction);
    const transaction = useAppStore(state => 
        state.transactions.find(tx => tx.id === transactionId)
    );

    const handleRate = (status) => {
        if (!transaction) return;
        updateTransaction({ id: transaction.id, regret_status: status });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && transaction && (
                <div key="regret-checkin-modal" className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pb-8 sm:p-0">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-sm bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl p-6 shadow-2xl border border-gray-300 dark:border-white/10 overflow-hidden"
                >
                    {/* Background Glow */}
                    

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">14-Day Check-in</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="text-center relative z-10 mb-8">
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            You spent <span className="font-bold text-gray-900 dark:text-white">€{(transaction.amount / 100).toFixed(2)}</span> on <span className="font-bold text-gray-900 dark:text-white capitalize">{transaction.category}{transaction.note ? ` (${transaction.note})` : ''}</span> two weeks ago.
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Was it worth it?</h3>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 relative z-10">
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleRate('worth_it')}
                            className="w-full py-3 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-sm shadow-sm flex items-center justify-center gap-2"
                        >
                            <Flame size={20} />
                            WORTH IT
                        </motion.button>
                        
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleRate('regret')}
                            className="w-full py-3 rounded-xl bg-gray-200/70 hover:bg-gray-200 text-gray-700 dark:text-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] border border-gray-300/60 dark:border-white/[0.1] font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <ThumbsDown size={20} />
                            REGRET IT
                        </motion.button>
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
    );
};

export default RegretCheckinModal;
