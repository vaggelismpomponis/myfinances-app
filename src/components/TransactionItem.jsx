import React from 'react';
import { Trash2 } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

const TransactionItem = ({ transaction, onDelete }) => (
    <div className="group bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
            <CategoryIcon category={transaction.category} type={transaction.type} />
            <div>
                <p className="font-bold text-gray-800 dark:text-white">{transaction.category}</p>
                <p className="text-xs text-gray-400 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })} • {transaction.note || 'Χωρίς σημείωση'}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <span className={`font-bold ${transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)}€
            </span>
            <button
                onClick={() => onDelete(transaction.id)}
                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 dark:text-gray-600 dark:hover:text-red-400"
            >
                <Trash2 size={16} />
            </button>
        </div>
    </div>
);

export default TransactionItem;
