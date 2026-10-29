import React, { useState } from 'react';
import { Pencil, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryIcon, { CATEGORY_ACCENT } from './CategoryIcon';
import Amount from './Amount';
import { useSettings } from '../contexts/SettingsContext';
import { getCategoryTranslation } from '../utils/categoryTranslations';

const TransactionItem = ({ transaction, onDelete, onEdit }) => {
    const { t, language } = useSettings();
    const [showActions, setShowActions] = useState(false);
    
    const isIncome  = transaction?.type === 'income';
    const key       = transaction?.category?.trim()?.toLowerCase() || '';
    const accent    = CATEGORY_ACCENT[key] || '#9ca3af';

    const categoryTitle = getCategoryTranslation(transaction?.category, t) || transaction?.category || t('other');
    const dateLocale = language === 'el' ? 'el-GR' : 'en-GB';
    const formattedDate = transaction?.date 
        ? new Date(transaction.date).toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

    return (
        <motion.div 
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setShowActions(!showActions)}
            className="group relative flex items-center gap-3
                        bg-white dark:bg-surface-dark2
                        rounded-xl p-3 sm:p-3.5
                        cursor-pointer shadow-sm
                        border border-gray-200/80 dark:border-white/[0.08]
                        hover:border-gray-300 dark:hover:border-white/20
                        transition-all duration-200"
        >
            {/* Minimal Category Color Pillar */}
            <div
                className="w-1 h-8 rounded-full shrink-0 transition-opacity duration-200"
                style={{ backgroundColor: accent }}
            />

            {/* Category icon */}
            <div className="shrink-0">
                <CategoryIcon category={transaction?.category} type={transaction?.type} size={18} className="p-2 rounded-xl" />
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate capitalize flex items-center">
                    {categoryTitle}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate flex items-center gap-1.5 font-medium">
                    {transaction?.note ? (
                        <>
                            <span className="text-gray-700 dark:text-gray-300 truncate">{transaction.note}</span>
                            {formattedDate && (
                                <>
                                    <span className="text-gray-300 dark:text-gray-600 shrink-0">•</span>
                                    <span className="shrink-0">{formattedDate}</span>
                                </>
                            )}
                        </>
                    ) : (
                        <span>{formattedDate}</span>
                    )}
                </div>
            </div>

            {/* Amount and Chevron */}
            <motion.div 
                animate={{ 
                    opacity: showActions ? 0 : 1,
                    scale: showActions ? 0.9 : 1,
                    pointerEvents: showActions ? 'none' : 'auto',
                    x: showActions ? 10 : 0
                }}
                className="shrink-0 flex items-center gap-1.5"
            >
                <span className={`text-[15px] font-bold tabular-nums tracking-tight ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                    <Amount value={transaction?.amount} prefix={isIncome ? '+' : '-'} />
                </span>
                <ChevronRight size={15} className="text-gray-400 dark:text-gray-500 group-hover:translate-x-0.5 transition-transform" />
            </motion.div>

            {/* Slide-in Actions */}
            <AnimatePresence>
                {showActions && (
                    <motion.div 
                        key="tx-actions"
                        initial={{ opacity: 0, scale: 0.92, x: 15, y: '-50%' }}
                        animate={{ opacity: 1, scale: 1, x: 0, y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.92, x: 15, y: '-50%' }}
                        className="absolute right-3 top-1/2
                                    flex items-center gap-1
                                    bg-white dark:bg-surface-dark3
                                    rounded-lg px-2 py-1
                                    shadow-lg border border-gray-200 dark:border-white/10
                                    z-10"
                    >
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit && onEdit(transaction);
                                setShowActions(false);
                            }}
                            title={t('edit_tooltip')}
                            className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors"
                        >
                            <Pencil size={15} />
                        </button>
                        <div className="w-[1px] h-3.5 bg-gray-200 dark:bg-white/10 mx-0.5" />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete && onDelete(transaction?.id);
                                setShowActions(false);
                            }}
                            title={t('delete_tooltip')}
                            className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors"
                        >
                            <Trash2 size={15} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TransactionItem;
