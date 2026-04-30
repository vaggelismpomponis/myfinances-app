import React, { useState, useMemo } from 'react';
import TransactionItem from '../components/TransactionItem';
import { Search, X, ArrowUpRight, ArrowDownRight, LayoutList, ChevronRight } from 'lucide-react';
import Amount from '../components/Amount';
import { useSettings } from '../contexts/SettingsContext';

// Sums for a date group
const groupTotal = (txs) => txs.reduce((acc, t) =>
    t.type === 'income' ? { ...acc, inc: acc.inc + t.amount } : { ...acc, exp: acc.exp + t.amount },
    { inc: 0, exp: 0 });

const HistoryView = ({ transactions, onDelete, onEdit }) => {
    const { t } = useSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11 or null for whole year
    const [showFilters, setShowFilters] = useState(false);

    const availableYears = useMemo(() => {
        const years = [...new Set(transactions.map(tx => new Date(tx.date).getFullYear()))];
        const currentYear = new Date().getFullYear();
        if (!years.includes(currentYear)) years.push(currentYear);
        return years.sort((a, b) => b - a);
    }, [transactions]);

    const months = [
        { id: 0, name: t('january') }, { id: 1, name: t('february') }, { id: 2, name: t('march') },
        { id: 3, name: t('april') }, { id: 4, name: t('may') }, { id: 5, name: t('june') },
        { id: 6, name: t('july') }, { id: 7, name: t('august') }, { id: 8, name: t('september') },
        { id: 9, name: t('october') }, { id: 10, name: t('november') }, { id: 11, name: t('december') }
    ];

    const filteredTransactions = useMemo(() =>
        transactions.filter(t => {
            const date = new Date(t.date);
            const matchesSearch =
                t.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || t.type === filterType;
            
            const matchesYear = date.getFullYear() === selectedYear;
            const matchesMonth = selectedMonth === null || date.getMonth() === selectedMonth;
            
            return matchesSearch && matchesType && matchesYear && matchesMonth;
        }),
        [transactions, searchTerm, filterType, selectedYear, selectedMonth]
    );

    const totalIncome = useMemo(() => filteredTransactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0), [filteredTransactions]);
    const totalExpense = useMemo(() => filteredTransactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0), [filteredTransactions]);

    const groupedTransactions = useMemo(() => {
        const groups = {};
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        filteredTransactions.forEach(tx => {
            const date = new Date(tx.date);
            let key = date.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' });
            if (date.toDateString() === today.toDateString()) key = t('today');
            else if (date.toDateString() === yesterday.toDateString()) key = t('yesterday');
            if (!groups[key]) groups[key] = [];
            groups[key].push(tx);
        });
        return groups;
    }, [filteredTransactions]);

    const FILTERS = [
        { value: 'all', label: t('filter_all') },
        { value: 'income', label: t('filter_income') },
        { value: 'expense', label: t('filter_expense') },
    ];

    const filterColors = {
        all: { active: 'bg-violet-600 text-white shadow-glow-sm', inactive: '' },
        income: { active: 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]', inactive: '' },
        expense: { active: 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]', inactive: '' },
    };

    return (
        <div className="pb-28 animate-fade-in space-y-4">

            {/* ── Summary Strip ── */}
            {filteredTransactions.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20
                                    border border-emerald-100 dark:border-transparent
                                    rounded-2xl p-3 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40
                                        flex items-center justify-center">
                            <ArrowUpRight size={15} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">{t('stats_income')}</p>
                            <p className="text-sm font-black text-emerald-800 dark:text-emerald-200">
                                <Amount value={totalIncome} prefix="+" />
                            </p>
                        </div>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-900/20
                                    border border-rose-100 dark:border-transparent
                                    rounded-2xl p-3 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40
                                        flex items-center justify-center">
                            <ArrowDownRight size={15} className="text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">{t('stats_expense')}</p>
                            <p className="text-sm font-black text-rose-800 dark:text-rose-200">
                                <Amount value={totalExpense} prefix="−" />
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Search & Filter ── */}
            <div className="space-y-3">
                {/* Search */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="input-glow w-full pl-10 pr-10 py-3 rounded-xl text-sm
                                    bg-white dark:bg-surface-dark3
                                    border border-gray-150 dark:border-transparent
                                    text-gray-800 dark:text-white
                                    placeholder-gray-400 dark:placeholder-gray-600
                                    transition-all duration-200 shadow-card dark:shadow-none"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5
                                        text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                                        bg-gray-100 dark:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all
                                    ${showFilters 
                                        ? 'bg-violet-600 text-white shadow-glow-violet' 
                                        : 'bg-white dark:bg-surface-dark3 text-gray-500 dark:text-gray-400 border border-gray-150 dark:border-transparent shadow-card dark:shadow-none'}`}
                    >
                        <LayoutList size={20} />
                    </button>
                </div>

                {/* Date Filter Picker */}
                {showFilters && (
                    <div className="bg-white dark:bg-surface-dark3 p-4 rounded-3xl space-y-4 border border-gray-150 dark:border-transparent shadow-sm animate-slide-down">
                        <div className="relative">
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide pr-10">
                                {availableYears.map(year => (
                                    <button
                                        key={year}
                                        onClick={() => setSelectedYear(year)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all
                                                    ${selectedYear === year 
                                                        ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-none' 
                                                        : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white dark:from-surface-dark3 to-transparent pointer-events-none flex items-center justify-end pr-1 pb-2">
                                <ChevronRight size={14} className="text-gray-400 dark:text-gray-500 animate-pulse" />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <button
                                onClick={() => setSelectedMonth(null)}
                                className={`col-span-4 py-2 rounded-xl text-xs font-bold transition-all
                                            ${selectedMonth === null 
                                                ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-none' 
                                                : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}
                            >
                                {t('all')} ({selectedYear})
                            </button>
                            {months.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedMonth(m.id)}
                                    className={`py-2 rounded-xl text-[10px] font-bold transition-all
                                                ${selectedMonth === m.id 
                                                    ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-none' 
                                                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}
                                >
                                    {m.name.substring(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filter pills */}
                <div className="flex gap-2">
                    {FILTERS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilterType(f.value)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
                                        ${filterType === f.value
                                    ? filterColors[f.value].active
                                    : 'bg-gray-100 dark:bg-surface-dark3 text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Transaction List ── */}
            {Object.keys(groupedTransactions).length === 0 ? (
                <div className="text-center py-14">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-surface-dark3
                                    flex items-center justify-center mx-auto mb-3">
                        <LayoutList size={24} className="text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="font-semibold text-gray-400 dark:text-gray-500">{t('no_transactions_found')}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{t('try_different_filter')}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedTransactions).map(([date, txs]) => {
                        const { inc, exp } = groupTotal(txs);
                        return (
                            <div key={date}>
                                {/* Date group header */}
                                <div className="flex items-center justify-between mb-2.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-violet-500 to-violet-700" />
                                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            {date.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold">
                                        {inc > 0 && <span className="text-emerald-500"><Amount value={inc} prefix="+" minimumFractionDigits={0} /></span>}
                                        {exp > 0 && <span className="text-rose-400"><Amount value={exp} prefix="−" minimumFractionDigits={0} /></span>}
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    {txs.map(t => (
                                        <TransactionItem key={t.id} transaction={t} onDelete={onDelete} onEdit={onEdit} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default HistoryView;









