import React, { useState } from 'react';
import { Pencil, Trash2, ChevronRight } from 'lucide-react';
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
        <div 
            onClick={() => setShowActions(!showActions)}
            className="group relative flex items-center gap-3.5
                        bg-white dark:bg-surface-dark3
                        border border-gray-100 dark:border-transparent
                        rounded-2xl p-3.5
                        shadow-card dark:shadow-card-dark
                        hover:shadow-md dark:hover:shadow-card-dark
                        cursor-pointer
                        active:scale-[0.98] transition-all duration-200"
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
            <div className="shrink-0 flex items-center gap-2">
                <span className={`text-sm font-semibold tabular-nums ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                    <Amount value={transaction.amount} prefix={isIncome ? '+' : '-'} />
                </span>
                <ChevronRight size={18} className="text-gray-400" />
            </div>

            {/* Click actions */}
            <div className={`absolute right-4 top-1/2 -translate-y-1/2
                            flex items-center gap-1
                            bg-white dark:bg-surface-dark3
                            rounded-xl px-2 py-1.5
                            shadow-lg border border-gray-100 dark:border-transparent
                            transition-all duration-200 z-10
                            ${showActions ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit && onEdit(transaction);
                        setShowActions(false);
                    }}
                    title={t('edit_tooltip')}
                    className="p-1.5 text-violet-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
                >
                    <Pencil size={18} />
                </button>
                <div className="w-[1px] h-4 bg-gray-200 dark:bg-surface-dark3 mx-1" />
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(transaction.id);
                        setShowActions(false);
                    }}
                    title={t('delete_tooltip')}
                    className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default TransactionItem;









