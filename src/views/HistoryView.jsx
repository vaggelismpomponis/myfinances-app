import React, { useState, useMemo } from 'react';
import TransactionItem from '../components/TransactionItem';
import { Search, Filter, X } from 'lucide-react';

const HistoryView = ({ transactions, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch = t.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || t.type === filterType;

            return matchesSearch && matchesType;
        });
    }, [transactions, searchTerm, filterType]);

    // Grouping Logic
    const groupedTransactions = useMemo(() => {
        const groups = {};
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        filteredTransactions.forEach(t => {
            const date = new Date(t.date);
            let key = date.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' });

            if (date.toDateString() === today.toDateString()) {
                key = 'Σήμερα';
            } else if (date.toDateString() === yesterday.toDateString()) {
                key = 'Χθες';
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(t);
        });

        return groups;
    }, [filteredTransactions]);

    return (
        <div className="pb-24 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Ιστορικό</h2>

            {/* Search & Filters */}
            <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Αναζήτηση συναλλαγών..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-gray-700 dark:text-gray-200"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Filter Chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filterType === 'all'
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg'
                                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        Όλα
                    </button>
                    <button
                        onClick={() => setFilterType('income')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filterType === 'income'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none'
                                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        Έσοδα
                    </button>
                    <button
                        onClick={() => setFilterType('expense')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${filterType === 'expense'
                                ? 'bg-red-500 text-white shadow-lg shadow-red-200 dark:shadow-none'
                                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        Έξοδα
                    </button>
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-6">
                {Object.keys(groupedTransactions).length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <Filter className="mx-auto mb-3 text-gray-300" size={48} />
                        <p className="text-gray-500">Δεν βρέθηκαν συναλλαγές</p>
                    </div>
                ) : (
                    Object.entries(groupedTransactions).map(([date, txs]) => (
                        <div key={date}>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">{date}</h3>
                            <div className="space-y-3">
                                {txs.map(t => (
                                    <TransactionItem key={t.id} transaction={t} onDelete={onDelete} />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistoryView;
