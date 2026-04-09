import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

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
    const isIncome  = transaction.type === 'income';
    const accent    = CATEGORY_ACCENT[transaction.category?.toLowerCase()] || '#9ca3af';

    return (
        <div className="group relative flex items-center gap-3.5
                        bg-white dark:bg-surface-dark3
                        border border-gray-100 dark:border-transparent
                        rounded-2xl p-3.5
                        shadow-card dark:shadow-card-dark
                        hover:shadow-md dark:hover:shadow-card-dark
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
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate capitalize">
                    {transaction.note || transaction.category}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                    <span className="capitalize">{transaction.category}</span>
                    {' · '}
                    {new Date(transaction.date).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })}
                </p>
            </div>

            {/* Amount */}
            <div className="shrink-0 flex flex-col items-end gap-1">
                <span className={`text-sm font-bold tabular-nums ${isIncome ? 'text-emerald-500' : 'text-gray-800 dark:text-gray-100'}`}>
                    {isIncome ? '+' : '−'}{transaction.amount.toFixed(2)}€
                </span>
                {/* Type badge */}
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                                  ${isIncome
                                    ? 'bg-emerald-50 dark:bg-emerald-900/25 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-rose-50 dark:bg-rose-900/25 text-rose-500 dark:text-rose-400'
                                  }`}>
                    {isIncome ? 'Έσοδο' : 'Έξοδο'}
                </span>
            </div>

            {/* Hover actions */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2
                            flex items-center gap-1
                            opacity-0 group-hover:opacity-100
                            bg-white dark:bg-surface-dark3
                            rounded-xl px-1.5 py-1
                            shadow-sm border border-gray-100 dark:border-transparent
                            transition-opacity duration-200 z-10">
                <button
                    onClick={() => onEdit && onEdit(transaction)}
                    title="Επεξεργασία"
                    className="p-1.5 text-violet-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition-colors"
                >
                    <Pencil size={13} />
                </button>
                <button
                    onClick={() => onDelete(transaction.id)}
                    title="Διαγραφή"
                    className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                >
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
};

export default TransactionItem;
