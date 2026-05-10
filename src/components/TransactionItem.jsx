import React, { useState } from 'react';
import { Pencil, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryIcon from './CategoryIcon';
import Amount from './Amount';
import { useSettings } from '../contexts/SettingsContext';

const CATEGORY_ACCENT = {
    food:        '#f59e0b',
    shopping:    '#ec4899',
    transport:   '#3b82f6',
    bills:       '#8b5cf6',
    health:      '#10b981',
    entertainment: '#06b6d4',
    education:   '#6366f1',
    salary:      '#10b981',
    investment:  '#f59e0b',
    gift:        '#ec4899',
    other:       '#9ca3af',
};

const TransactionItem = ({ transaction, onDelete, onEdit }) => {
    const { t } = useSettings();
    const [showActions, setShowActions] = useState(false);
    
    const isIncome  = transaction.type === 'income';
    const accent    = CATEGORY_ACCENT[transaction.category?.toLowerCase()] || '#9ca3af';

    return (
        <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowActions(!showActions)}
            className="group relative flex items-center gap-3.5
                        bg-white dark:bg-surface-dark3
                        border border-gray-100 dark:border-transparent
                        rounded-2xl p-3.5
                        shadow-card dark:shadow-card-dark
                        cursor-pointer
                        transition-all duration-200"
        >
            {/* Colored left accent line */}
            <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                 style={{ backgroundColor: accent }} />

            {/* Category icon */}
            <div className="shrink-0 ml-1.5">
                <CategoryIcon category={transaction.category} type={transaction.type} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 dark:text-white truncate capitalize">
                    {transaction.note || transaction.category}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                    {new Date(transaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* Amount and Arrow */}
            <motion.div 
                animate={{ 
                    opacity: showActions ? 0 : 1,
                    scale: showActions ? 0.9 : 1,
                    pointerEvents: showActions ? 'none' : 'auto'
                }}
                className="shrink-0 flex items-center gap-2"
            >
                <span className={`text-sm font-semibold tabular-nums ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <Amount value={transaction.amount} prefix={isIncome ? '+' : '-'} />
                </span>
                <ChevronRight size={18} className="text-gray-400" />
            </motion.div>

            {/* Click actions */}
            <AnimatePresence>
                {showActions && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, x: 20, y: '-50%' }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.9, x: 20, y: '-50%' }}
                        className="absolute right-4 top-1/2
                                    flex items-center gap-1
                                    bg-white dark:bg-surface-dark3
                                    rounded-xl px-2 py-1
                                    shadow-lg border border-gray-100 dark:border-transparent
                                    z-10"
                    >
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit && onEdit(transaction);
                                setShowActions(false);
                            }}
                            title={t('edit_tooltip')}
                            className="p-1 text-violet-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
                        >
                            <Pencil size={18} />
                        </motion.button>
                        <div className="w-[1px] h-4 bg-gray-200 dark:bg-surface-dark3 mx-1" />
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(transaction.id);
                                setShowActions(false);
                            }}
                            title={t('delete_tooltip')}
                            className="p-1 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                        >
                            <Trash2 size={18} />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TransactionItem;









