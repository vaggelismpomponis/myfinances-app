import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, ThumbsDown } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const RegretCheckinModal = ({ isOpen, onClose, transactionId }) => {
    const updateTransaction = useAppStore(state => state.updateTransaction);
    const transaction = useAppStore(state => 
        state.transactions.find(tx => tx.id === transactionId)
    );

    if (!isOpen || !transaction) return null;

    const handleRate = (status) => {
        updateTransaction({ id: transaction.id, regret_status: status });
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 pb-8 sm:p-0">
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
                    className="relative w-full max-w-sm bg-white dark:bg-surface-dark3 rounded-[2rem] p-6 shadow-2xl border border-gray-100 dark:border-white/[0.05] overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute -top-24 -left-12 w-48 h-48 bg-rose-500/10 dark:bg-rose-500/20 blur-[60px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-orange-500/10 dark:bg-orange-500/20 blur-[60px] rounded-full pointer-events-none" />

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
                            You spent <span className="font-bold text-gray-900 dark:text-white">€{(transaction.amount / 100).toFixed(2)}</span> on <span className="font-bold text-gray-900 dark:text-white capitalize">{transaction.note || transaction.category}</span> two weeks ago.
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Was it worth it?</h3>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 relative z-10">
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleRate('worth_it')}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-400 to-rose-400 text-white font-black text-lg tracking-wide shadow-[0_4px_14px_rgba(251,113,133,0.4)] flex items-center justify-center gap-2"
                        >
                            <Flame size={20} />
                            WORTH IT
                        </motion.button>
                        
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleRate('regret')}
                            className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 font-bold text-lg tracking-wide border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                        >
                            <ThumbsDown size={20} />
                            REGRET IT
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RegretCheckinModal;
