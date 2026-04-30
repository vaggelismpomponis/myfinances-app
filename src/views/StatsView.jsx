import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import CategoryIcon from '../components/CategoryIcon';
import {
    AreaChart, Area,
    BarChart, Bar,
    PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    Label
} from 'recharts';
import { 
    TrendingUp, TrendingDown, X, ChevronRight, 
    ArrowDownLeft, BarChart2, PieChart as PieIcon, 
    Calendar, ArrowUpRight, Activity, Filter
} from 'lucide-react';
import Amount from '../components/Amount';
import { useSettings } from '../contexts/SettingsContext';

/* ─── Premium Palette ─── */
const COLORS = [
    '#7c3aed', // Violet
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#ef4444'  // Red
];

/* ─── Custom Tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-gray-900 backdrop-blur-xl 
                        border border-gray-100 dark:border-white/10
                        rounded-2xl p-4 shadow-xl text-xs min-w-[150px] animate-pop">
            <p className="font-black text-gray-400 dark:text-gray-500 mb-2 border-b border-gray-50 dark:border-white/5 pb-2 uppercase tracking-widest">{label}</p>
            <div className="space-y-2">
                {payload.map(p => (
                    <div key={p.name} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: p.color || p.fill }} />
                            <span className="font-bold text-gray-600 dark:text-gray-300">{p.name}:</span>
                        </div>
                        <span className="font-black text-gray-900 dark:text-white">
                            <Amount value={p.value} />
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ─── Time filter button ─── */
const TimeBtn = ({ value, label, active, onClick }) => (
    <button
        onClick={() => onClick(value)}
        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300
                    ${active
                ? 'bg-white dark:bg-white/15 text-violet-700 dark:text-white shadow-sm scale-[1.02]'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-white/10'
            }`}
    >
        {label}
    </button>
);

const StatsView = ({ transactions }) => {
    const { t, language, privacyMode } = useSettings();
    const [timeRange, setTimeRange] = useState('thisMonth');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const locale = language === 'el' ? 'el-GR' : 'en-US';

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

    /* ── Filter Logic ── */
    const filteredTransactions = useMemo(() => {
        const now = new Date();
        return transactions.filter(tx => {
            const d = new Date(tx.date);
            if (timeRange === 'custom') {
                return d.getFullYear() === selectedYear && (selectedMonth === null || d.getMonth() === selectedMonth);
            }
            if (timeRange === 'thisMonth') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            if (timeRange === 'lastMonth') {
                const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
            }
            if (timeRange === 'year') return d.getFullYear() === now.getFullYear();
            return true;
        });
    }, [transactions, timeRange, selectedYear, selectedMonth]);

    /* ── Aggregations ── */
    const { totalIncome, totalExpense, categoryData, trendData } = useMemo(() => {
        let inc = 0, exp = 0;
        const catMap = {};
        const trendMap = {};
        const isYearly = timeRange === 'year' || (timeRange === 'custom' && selectedMonth === null) || timeRange === 'all';

        const sortedTxs = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedTxs.forEach(tx => {
            if (tx.type === 'income') inc += tx.amount;
            else {
                exp += tx.amount;
                catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
            }

            const d = new Date(tx.date);
            const key = isYearly 
                ? d.toLocaleDateString(locale, { month: 'short' })
                : d.toLocaleDateString(locale, { day: '2-digit', month: 'short' });
            
            if (!trendMap[key]) trendMap[key] = { date: key, income: 0, expense: 0 };
            trendMap[key][tx.type] += tx.amount;
        });

        const other1 = (t('other') || 'other').toLowerCase();
        const other2 = (t('cat_other') || 'other').toLowerCase();

        const catData = Object.entries(catMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => {
                const aName = (a.name || '').toLowerCase();
                const bName = (b.name || '').toLowerCase();
                const isOtherA = aName === 'other' || aName === 'άλλο' || aName === other1 || aName === other2;
                const isOtherB = bName === 'other' || bName === 'άλλο' || bName === other1 || bName === other2;
                
                if (isOtherA && !isOtherB) return 1;
                if (!isOtherA && isOtherB) return -1;
                return b.value - a.value;
            });

        return {
            totalIncome: inc,
            totalExpense: exp,
            categoryData: catData,
            trendData: Object.values(trendMap)
        };
    }, [filteredTransactions, timeRange, selectedMonth, t, locale]);

    const cashFlow = totalIncome - totalExpense;

    const TIME_FILTERS = [
        { value: 'thisMonth', label: t('stats_this_month') },
        { value: 'lastMonth', label: t('stats_last_month') },
        { value: 'year', label: t('stats_year') },
        { value: 'custom', label: t('stats_history') },
    ];

    return (
        <div className="pb-28 animate-fade-in space-y-6">
            
            {/* ── Period Header ── */}
            <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 to-indigo-700 dark:from-violet-600/20 dark:to-indigo-800/20 rounded-[2.5rem] p-6 text-white dark:text-violet-100 shadow-xl border border-white/10 dark:border-white/5">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl" />
                
                <div className="relative flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-white/70 dark:text-violet-300/60 text-xs font-bold uppercase tracking-widest mb-1">
                            {t('stats_portfolio_overview')}
                        </h2>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black tracking-tight text-white dark:text-white">
                                <Amount value={cashFlow} />
                            </span>
                            <span className="text-xs font-medium text-white/60 dark:text-violet-300/40">
                                {t('net_flow')}
                            </span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/15 dark:bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 dark:border-white/10">
                        <Activity className="text-white dark:text-violet-200" size={24} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative">
                    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 dark:border-white/5">
                        <p className="text-[10px] font-bold text-white/60 dark:text-violet-300/40 uppercase mb-1">{t('stats_income')}</p>
                        <div className="flex items-center gap-1.5 text-emerald-300 dark:text-emerald-400 font-bold">
                            <TrendingUp size={14} />
                            <Amount value={totalIncome} />
                        </div>
                    </div>
                    <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/10 dark:border-white/5">
                        <p className="text-[10px] font-bold text-white/60 dark:text-violet-300/40 uppercase mb-1">{t('stats_expense')}</p>
                        <div className="flex items-center gap-1.5 text-rose-300 dark:text-rose-400 font-bold">
                            <TrendingDown size={14} />
                            <Amount value={totalExpense} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Time Filter ── */}
            <div className="sticky top-2 z-40 px-1">
                <div className="glass-light dark:bg-surface-dark2/80 dark:backdrop-blur-xl rounded-2xl p-1.5 shadow-premium flex gap-1 border border-white/50 dark:border-white/5">
                    {TIME_FILTERS.map(f => (
                        <TimeBtn key={f.value} value={f.value} label={f.label}
                            active={timeRange === f.value} onClick={setTimeRange} />
                    ))}
                </div>
            </div>

            {/* ── Custom Picker ── */}
            {timeRange === 'custom' && (
                <div className="bg-white dark:bg-surface-dark3 p-5 rounded-[2rem] space-y-4 border border-gray-100 dark:border-white/5 shadow-premium animate-pop">
                    <div className="relative">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide pr-10">
                            {availableYears.map(year => (
                                <button
                                    key={year}
                                    onClick={() => setSelectedYear(year)}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all
                                                ${selectedYear === year 
                                                    ? 'bg-violet-600 text-white shadow-glow-sm' 
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
                            className={`col-span-4 py-2.5 rounded-xl text-xs font-black transition-all border
                                        ${selectedMonth === null 
                                            ? 'bg-violet-600 text-white border-transparent shadow-glow-sm' 
                                            : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400'}`}
                        >
                            {t('stats_year')} {selectedYear}
                        </button>
                        {months.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMonth(m.id)}
                                className={`py-2 rounded-xl text-[10px] font-bold transition-all
                                            ${selectedMonth === m.id 
                                                ? 'bg-violet-600 text-white shadow-glow-sm' 
                                                : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}
                            >
                                {m.name.substring(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Top Categories List ── */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest">
                        {t('stats_top_categories')}
                    </h3>
                </div>
                
                {categoryData.length === 0 ? (
                    <div className="bg-white dark:bg-surface-dark3 rounded-3xl p-8 text-center border border-dashed border-gray-200 dark:border-white/10">
                        <p className="text-gray-400 text-sm">{t('stats_no_expenses')}</p>
                    </div>
                ) : (
                    <div className="space-y-3 stagger-children">
                        {categoryData.slice(0, 5).map((cat, i) => {
                            const pct = totalExpense > 0 ? (cat.value / totalExpense) * 100 : 0;
                            return (
                                <button
                                    key={cat.name}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className="w-full bg-white dark:bg-surface-dark3
                                               border border-gray-100 dark:border-white/5
                                               rounded-[2rem] p-4 shadow-sm hover:shadow-md
                                               hover:bg-gray-50 dark:hover:bg-white/5
                                               active:scale-[0.98] transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110">
                                            <CategoryIcon category={cat.name} type="expense" size={24} />
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex justify-between items-baseline mb-1.5">
                                                <span className="font-bold text-sm text-gray-800 dark:text-white capitalize">
                                                    {t('cat_' + cat.name.toLowerCase()) === 'cat_' + cat.name.toLowerCase() ? cat.name : t('cat_' + cat.name.toLowerCase())}
                                                </span>
                                                <span className="font-black text-sm text-gray-900 dark:text-white">
                                                    <Amount value={cat.value} />
                                                </span>
                                            </div>
                                            {/* Advanced Progress Bar */}
                                            <div className="relative h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }} 
                                                />
                                                <div 
                                                    className="absolute inset-y-0 left-0 bg-white/30 animate-shimmer"
                                                    style={{ width: `${pct}%` }} 
                                                />
                                            </div>
                                            <div className="flex justify-between mt-2">
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tighter">
                                                    {pct.toFixed(1)}% {t('stats_pct_of_total')}
                                                </p>
                                                <ArrowUpRight size={12} className="text-gray-300 group-hover:text-violet-500 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Expense Distribution Donut ── */}
            <div className="bg-white dark:bg-surface-dark3 rounded-[2.5rem] p-6 shadow-premium border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-gray-800 dark:text-white flex items-center gap-2">
                        <PieIcon size={18} className="text-violet-500" />
                        {t('stats_expense_distribution')}
                    </h3>
                </div>
                
                {categoryData.length > 0 ? (
                    <div className="flex flex-col items-center">
                        <div className="h-64 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%" cy="50%"
                                        innerRadius={70} outerRadius={95}
                                        paddingAngle={5}
                                        dataKey="value"
                                        strokeWidth={0}
                                        animationBegin={0}
                                        animationDuration={1200}
                                    >
                                        {categoryData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} 
                                                  className="hover:opacity-80 transition-opacity cursor-pointer outline-none" />
                                        ))}
                                        <Label
                                            width={30}
                                            position="center"
                                            content={() => (
                                                <g>
                                                    <text x="50%" y="50%" dy="-10" textAnchor="middle" dominantBaseline="middle" className="fill-gray-400 dark:fill-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                                        {t('stats_total_spent')}
                                                    </text>
                                                    <text x="50%" y="50%" dy="15" textAnchor="middle" dominantBaseline="middle" className="fill-gray-900 dark:fill-white text-xl font-black">
                                                        {privacyMode ? '****' : new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalExpense)}
                                                    </text>
                                                </g>
                                            )}
                                        />
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Interactive Legend */}
                        <div className="flex flex-wrap gap-2 mt-4 justify-center max-w-sm">
                            {categoryData.map((cat, i) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 transition-all hover:scale-105 active:scale-95"
                                >
                                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ background: COLORS[i % COLORS.length] }} />
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tight">
                                        {t('cat_' + cat.name.toLowerCase()) === 'cat_' + cat.name.toLowerCase() ? cat.name : t('cat_' + cat.name.toLowerCase())}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-3">
                        <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center">
                            <PieIcon size={24} className="opacity-20" />
                        </div>
                        <p className="text-sm font-medium">{t('stats_no_data')}</p>
                    </div>
                )}
            </div>

            {/* ── Cash Flow Trend ── */}
            <div className="bg-white dark:bg-surface-dark3 rounded-[2.5rem] p-6 shadow-premium border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-gray-800 dark:text-white flex items-center gap-2">
                        <BarChart2 size={18} className="text-emerald-500" />
                        {t('stats_trend_analysis')}
                    </h3>
                </div>
                
                <div className="h-64 w-full">
                    {trendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-white/5" />
                                <XAxis 
                                    dataKey="date" 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} 
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8884d8', strokeWidth: 1, strokeDasharray: '5 5' }} />
                                <Area 
                                    type="monotone" 
                                    dataKey="income" 
                                    name={t('stats_income')} 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorInc)" 
                                    animationDuration={1500}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="expense" 
                                    name={t('stats_expense')} 
                                    stroke="#7c3aed" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorExp)" 
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                             <BarChart2 size={24} className="opacity-20" />
                            <p className="text-sm">{t('stats_no_data')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Category Drill-Down Bottom Sheet ── */}
            {selectedCategory && typeof document !== 'undefined' && createPortal((() => {
                const catTxs = filteredTransactions
                    .filter(t => t.type === 'expense' && t.category === selectedCategory)
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
                const total = catTxs.reduce((s, t) => s + t.amount, 0);
                const color = COLORS[categoryData.findIndex(c => c.name === selectedCategory) % COLORS.length] || '#7c3aed';

                return (
                    <div className="fixed inset-0 z-[100] flex items-end animate-fade-in">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                            onClick={() => setSelectedCategory(null)} />
                        <div className="relative z-10 w-full
                                        bg-white dark:bg-surface-dark2
                                        rounded-t-[3rem] shadow-2xl
                                        border-t border-x border-gray-100 dark:border-white/5
                                        max-h-[85vh] flex flex-col animate-slide-up">

                            {/* Handle */}
                            <div className="flex justify-center pt-4 pb-2">
                                <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50 dark:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-sm"
                                        style={{ backgroundColor: color + '15' }}>
                                        <CategoryIcon category={selectedCategory} type="expense" size={28} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-gray-900 dark:text-white capitalize">
                                            {t('cat_' + selectedCategory.toLowerCase()) === 'cat_' + selectedCategory.toLowerCase() ? selectedCategory : t('cat_' + selectedCategory.toLowerCase())}
                                        </h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            {catTxs.length} {t('stats_transactions')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black" style={{ color }}>
                                        <Amount value={total} />
                                    </div>
                                    <button onClick={() => setSelectedCategory(null)}
                                        className="mt-1 text-[10px] font-black text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 uppercase tracking-widest transition-colors">
                                        {t('close')}
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="overflow-y-auto flex-1 px-4 py-6 space-y-3 pb-[calc(2rem+env(safe-area-inset-bottom))] custom-scrollbar">
                                {catTxs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 opacity-50">
                                        <Activity size={48} className="mb-4" />
                                        <p className="font-bold">{t('stats_no_records')}</p>
                                    </div>
                                ) : catTxs.map(tx => (
                                    <div key={tx.id}
                                        className="flex justify-between items-center
                                                    bg-gray-50 dark:bg-white/[0.03]
                                                    p-4 rounded-3xl border border-gray-100 dark:border-white/5
                                                    hover:bg-gray-100 dark:hover:bg-white/10
                                                    hover:border-violet-200 dark:hover:border-violet-500/30 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-white/5 shadow-sm group-hover:scale-110 transition-transform">
                                                <ArrowDownLeft size={18} className="text-rose-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white">
                                                    {tx.note || (t('cat_' + tx.category.toLowerCase()) === 'cat_' + tx.category.toLowerCase() ? tx.category : t('cat_' + tx.category.toLowerCase()))}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                    {new Date(tx.date).toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-black text-rose-500 text-lg">
                                            <Amount value={tx.amount} prefix="−" />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })(), document.body)}
        </div>
    );
};

export default StatsView;









