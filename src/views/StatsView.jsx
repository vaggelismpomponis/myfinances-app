import React, { useState, useMemo } from 'react';
import CategoryIcon from '../components/CategoryIcon';
import {
    AreaChart, Area,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { TrendingUp, TrendingDown, X, ChevronRight, ArrowDownLeft, BarChart2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

/* ─── Palette ─── */
const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#ef4444'];

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-surface-dark2 border border-gray-100 dark:border-transparent
                        rounded-2xl p-3 shadow-glass text-xs">
            <p className="font-bold text-gray-500 dark:text-gray-400 mb-1.5">{label}</p>
            {payload.map(p => (
                <div key={p.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-gray-600 dark:text-gray-300">{p.name}:</span>
                    <span className="font-bold text-gray-800 dark:text-white">{p.value.toFixed(2)}€</span>
                </div>
            ))}
        </div>
    );
};

/* ─── Time filter button ─── */
const TimeBtn = ({ value, label, active, onClick }) => (
    <button
        onClick={() => onClick(value)}
        className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200
                    ${active
                        ? 'bg-white dark:bg-white/10 text-violet-700 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
    >
        {label}
    </button>
);

const StatsView = ({ transactions }) => {
    const { t } = useSettings();
    const [timeRange, setTimeRange] = useState('thisMonth');
    const [selectedCategory, setSelectedCategory] = useState(null);

    /* ── Filter ── */
    const filteredTransactions = useMemo(() => {
        const now = new Date();
        return transactions.filter(tx => {
            const d = new Date(tx.date);
            if (timeRange === 'thisMonth')
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            if (timeRange === 'lastMonth') {
                const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
            }
            if (timeRange === 'year') return d.getFullYear() === now.getFullYear();
            return true;
        });
    }, [transactions, timeRange]);

    /* ── Trend data ── */
    const trendData = useMemo(() => {
        const daily = {};
        [...filteredTransactions]
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .forEach(t => {
                const key = new Date(t.date).toLocaleDateString('el-GR', { day: '2-digit', month: 'short' });
                if (!daily[key]) daily[key] = { date: key, income: 0, expense: 0 };
                if (t.type === 'income')  daily[key].income  += t.amount;
                if (t.type === 'expense') daily[key].expense += t.amount;
            });
        return Object.values(daily);
    }, [filteredTransactions]);

    /* ── Category data ── */
    const categoryData = useMemo(() => {
        const groups = {};
        filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
            groups[t.category] = (groups[t.category] || 0) + t.amount;
        });
        return Object.entries(groups)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions]);

    const totalIncome  = useMemo(() => filteredTransactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0), [filteredTransactions]);
    const totalExpense = useMemo(() => filteredTransactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0), [filteredTransactions]);
    const cashFlow     = totalIncome - totalExpense;

    const TIME_FILTERS = [
        { value: 'thisMonth', label: 'Αυτός ο μήνας' },
        { value: 'lastMonth', label: 'Προηγ. Μήνας' },
        { value: 'year',      label: 'Φέτος' },
        { value: 'all',       label: 'Όλα' },
    ];

    return (
        <div className="pb-28 animate-fade-in space-y-5">

            {/* ── Time Filter (segmented) ── */}
            <div className="flex gap-1 bg-gray-100 dark:bg-surface-dark3
                            rounded-2xl p-1 border border-gray-200 dark:border-transparent">
                {TIME_FILTERS.map(f => (
                    <TimeBtn key={f.value} value={f.value} label={f.label}
                             active={timeRange === f.value} onClick={setTimeRange} />
                ))}
            </div>

            {/* ── Summary cards ── */}
            <div className="grid grid-cols-3 gap-3">
                {/* Income */}
                <div className="col-span-1 bg-emerald-50 dark:bg-emerald-900/20
                                border border-emerald-100 dark:border-transparent
                                rounded-2xl p-3.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50
                                    flex items-center justify-center mb-2">
                        <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-0.5">Έσοδα</p>
                    <p className="text-sm font-black text-emerald-800 dark:text-emerald-100">
                        {totalIncome.toLocaleString('el-GR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                    </p>
                </div>
                {/* Expense */}
                <div className="col-span-1 bg-rose-50 dark:bg-rose-900/20
                                border border-rose-100 dark:border-transparent
                                rounded-2xl p-3.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50
                                    flex items-center justify-center mb-2">
                        <TrendingDown size={14} className="text-rose-600 dark:text-rose-400" />
                    </div>
                    <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide mb-0.5">Έξοδα</p>
                    <p className="text-sm font-black text-rose-800 dark:text-rose-100">
                        {totalExpense.toLocaleString('el-GR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                    </p>
                </div>
                {/* Cash flow */}
                <div className={`col-span-1 rounded-2xl p-3.5 border dark:border-transparent
                                 ${cashFlow >= 0
                                    ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-100'
                                    : 'bg-orange-50 dark:bg-orange-900/20 border-orange-100'
                                 }`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2
                                     ${cashFlow >= 0
                                        ? 'bg-violet-100 dark:bg-violet-900/50'
                                        : 'bg-orange-100 dark:bg-orange-900/50'
                                     }`}>
                        <BarChart2 size={14} className={cashFlow >= 0 ? 'text-violet-600 dark:text-violet-400' : 'text-orange-600 dark:text-orange-400'} />
                    </div>
                    <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5
                                   ${cashFlow >= 0 ? 'text-violet-600 dark:text-violet-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        Ροή
                    </p>
                    <p className={`text-sm font-black
                                   ${cashFlow >= 0 ? 'text-violet-800 dark:text-violet-100' : 'text-orange-800 dark:text-orange-100'}`}>
                        {cashFlow >= 0 ? '+' : ''}{cashFlow.toLocaleString('el-GR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                    </p>
                </div>
            </div>

            {/* ── Donut / Category Distribution ── */}
            <div className="bg-white dark:bg-surface-dark3
                            border border-gray-100 dark:border-transparent
                            rounded-3xl p-5 shadow-card dark:shadow-card-dark">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">
                    Κατανομή Εξόδων
                </h3>
                {categoryData.length > 0 ? (
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%" cy="50%"
                                    innerRadius={55} outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {categoryData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]}
                                              opacity={selectedCategory && categoryData[i].name !== selectedCategory ? 0.35 : 1} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-52 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                        Δεν υπάρχουν δεδομένα
                    </div>
                )}
                {/* Legend */}
                {categoryData.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 justify-center">
                        {categoryData.map((cat, i) => (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(prev => prev === cat.name ? null : cat.name)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold
                                            border transition-all duration-200
                                            ${selectedCategory === cat.name
                                                ? 'border-transparent text-white'
                                                : 'border-gray-200 dark:border-transparent text-gray-600 dark:text-gray-400'
                                            }`}
                                style={selectedCategory === cat.name ? { backgroundColor: COLORS[i % COLORS.length] } : {}}
                            >
                                <span className="w-1.5 h-1.5 rounded-full"
                                      style={{ background: COLORS[i % COLORS.length] }} />
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Top Categories ── */}
            <div>
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
                    Κορυφαίες Κατηγορίες
                </h3>
                {categoryData.length === 0 ? (
                    <p className="text-gray-400 text-center py-6 text-sm">Δεν υπάρχουν έξοδα.</p>
                ) : (
                    <div className="space-y-2.5">
                        {categoryData.map((cat, i) => {
                            const pct = totalExpense > 0 ? (cat.value / totalExpense) * 100 : 0;
                            return (
                                <button
                                    key={cat.name}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className="w-full bg-white dark:bg-surface-dark3
                                               border border-gray-100 dark:border-transparent
                                               rounded-2xl p-3.5
                                               shadow-card dark:shadow-none
                                               active:scale-[0.98] transition-all duration-200"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-8 rounded-full flex-shrink-0"
                                             style={{ background: COLORS[i % COLORS.length] }} />
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <CategoryIcon category={cat.name} type="expense" />
                                            <span className="font-semibold text-sm text-gray-700 dark:text-gray-200 capitalize truncate">
                                                {cat.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="font-black text-sm text-gray-900 dark:text-white">
                                                {cat.value.toFixed(2)}€
                                            </span>
                                            <ChevronRight size={13} className="text-gray-300 dark:text-gray-600" />
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="ml-5 h-1.5 bg-gray-100 dark:bg-white/8 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-500"
                                             style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} />
                                    </div>
                                    <p className="ml-5 mt-0.5 text-[10px] text-gray-400 dark:text-gray-600 font-medium">
                                        {pct.toFixed(1)}% των συνολικών εξόδων
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Cash Flow Chart ── */}
            <div className="bg-white dark:bg-surface-dark3
                            border border-gray-100 dark:border-transparent
                            rounded-3xl p-5 shadow-card dark:shadow-card-dark">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-4">Ροή Χρημάτων</h3>
                <div className="h-52">
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}
                                               stroke="currentColor" className="text-gray-100 dark:text-white/5" opacity={1} />
                                <XAxis dataKey="date" tickLine={false} axisLine={false}
                                       tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
                                <Bar dataKey="income"  name="Έσοδα"  fill="#10b981" radius={[5, 5, 0, 0]} />
                                <Bar dataKey="expense" name="Έξοδα" fill="#7c3aed" radius={[5, 5, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
                            Δεν υπάρχουν δεδομένα
                        </div>
                    )}
                </div>
            </div>

            {/* ── Category Drill-Down Bottom Sheet ── */}
            {selectedCategory && (() => {
                const catTxs = filteredTransactions
                    .filter(t => t.type === 'expense' && t.category === selectedCategory)
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
                const total = catTxs.reduce((s, t) => s + t.amount, 0);
                const color = COLORS[categoryData.findIndex(c => c.name === selectedCategory) % COLORS.length];

                return (
                    <div className="fixed inset-0 z-50 flex items-end animate-fade-in">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                             onClick={() => setSelectedCategory(null)} />
                        <div className="relative z-10 w-full
                                        bg-white dark:bg-surface-dark2
                                        rounded-t-[2rem] shadow-2xl
                                        border-t border-x border-gray-100 dark:border-transparent
                                        max-h-[82vh] flex flex-col animate-slide-up">

                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-3
                                            border-b border-gray-100 dark:border-white/8">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                         style={{ backgroundColor: color + '22' }}>
                                        <CategoryIcon category={selectedCategory} type="expense" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white capitalize">
                                            {selectedCategory}
                                        </h3>
                                        <p className="text-xs text-gray-400">{catTxs.length} συναλλαγές</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-lg" style={{ color }}>
                                        {total.toFixed(2)}€
                                    </span>
                                    <button onClick={() => setSelectedCategory(null)}
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10
                                                       text-gray-400 transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
                                {catTxs.length === 0 ? (
                                    <p className="text-center text-gray-400 py-10">Δεν βρέθηκαν εγγραφές.</p>
                                ) : catTxs.map(t => (
                                    <div key={t.id}
                                         className="flex justify-between items-center
                                                    bg-gray-50 dark:bg-surface-dark3
                                                    p-3.5 rounded-2xl border border-gray-100 dark:border-transparent">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                                 style={{ backgroundColor: color + '22' }}>
                                                <ArrowDownLeft size={15} style={{ color }} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                                                    {t.note || t.category}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {new Date(t.date).toLocaleDateString('el-GR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-rose-500">−{t.amount.toFixed(2)}€</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default StatsView;
