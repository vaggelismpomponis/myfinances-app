import React from 'react';
import { Trash2 } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

const TransactionItem = ({ transaction, onDelete }) => (
    <div className="group bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
            <CategoryIcon category={transaction.category} type={transaction.type} />
            <div>
                <p className="font-bold text-gray-800">{transaction.category}</p>
                <p className="text-xs text-gray-400">
                    {new Date(transaction.date).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' })} • {transaction.note || 'Χωρίς σημείωση'}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <span className={`font-bold ${transaction.type === 'income' ? 'text-emerald-600' : 'text-gray-900'}`}>
                {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)}€
            </span>
            <button
                onClick={() => onDelete(transaction.id)}
                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={16} />
            </button>
        </div>
    </div>
);

export default TransactionItem;
