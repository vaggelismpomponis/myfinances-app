import React, { useMemo } from 'react';
import {
    Target, Wallet, RefreshCw, BarChart,
    ChevronRight, Sparkles, ArrowUpRight, ArrowDownRight, TrendingUp,
    ArrowRight, TrendingDown
} from 'lucide-react';
import TransactionItem from '../components/TransactionItem';
import Amount from '../components/Amount';
import { useSettings } from '../contexts/SettingsContext';

const QuickAction = ({ icon: Icon, label, color, bg, onClick, delay }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-2 press-effect animate-fade-in`}
        style={{ animationDelay: delay }}
    >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
                         shadow-sm ring-2 ring-offset-2 ring-violet-200 dark:ring-violet-900/50 dark:ring-offset-surface-dark
                         ${bg} transition-all duration-200 hover:scale-105`}>
            <Icon size={24} className={color} />
        </div>
        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{label}</span>
    </button>
);

const HomeView = ({ balance, totalIncome, totalExpense, transactions, budgets, onDelete, onEdit, setActiveTab, onRecurring }) => {
    const { t, privacyMode } = useSettings();

    // ── Data Calculations ──
    const stats = useMemo(() => {
        const now = new Date();
        const curMonth = now.getMonth();
        const curYear = now.getFullYear();

        const firstDayThisMonth = new Date(curYear, curMonth, 1);
        const firstDayLastMonth = new Date(curYear, curMonth - 1, 1);
        const lastDayLastMonth = new Date(curYear, curMonth, 0);

        const thisMonthTxs = transactions.filter(t => {
            const d = new Date(t.date);
            return t.type === 'expense' && d >= firstDayThisMonth;
        });

        const lastMonthTxs = transactions.filter(t => {
            const d = new Date(t.date);
            return t.type === 'expense' && d >= firstDayLastMonth && d <= lastDayLastMonth;
        });

        const curSpent = thisMonthTxs.reduce((acc, t) => acc + t.amount, 0);
        const lastSpent = lastMonthTxs.reduce((acc, t) => acc + t.amount, 0);

        let diffPct = 0;
        let trend = 'neutral';
        if (lastSpent > 0) {
            if (curSpent < lastSpent) {
                diffPct = Math.round(((lastSpent - curSpent) / lastSpent) * 100);
                trend = 'below';
            } else if (curSpent > lastSpent) {
                diffPct = Math.round(((curSpent - lastSpent) / lastSpent) * 100);
                trend = 'above';
            }
        } else if (curSpent > 0) {
            trend = 'above';
            diffPct = 100;
        }

        return { curSpent, lastSpent, diffPct, trend };
    }, [transactions]);



    return (
        <div className="space-y-6 pb-28 animate-fade-in">

            {/* ── ① Redesigned Hero Card (Minimalist Centered) ── */}
            <div className="relative overflow-hidden rounded-[2.5rem]
                            bg-white dark:bg-surface-dark3
                            p-8 pt-12 pb-10 text-center shadow-sm border border-gray-100 dark:border-transparent
                            transition-all duration-300">

                {/* Subtle top glow */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-500/10 dark:bg-violet-500/5 blur-[80px] pointer-events-none rounded-full" />

                <div className="relative z-10 space-y-2">
                    <p className="text-gray-400 dark:text-gray-500 text-sm font-medium tracking-tight">
                        {t('this_month_spend')}
                    </p>

                    <div className="flex flex-col items-center">
                        <div className="flex items-start justify-center gap-1">
                            {!privacyMode && <span className="text-3xl font-bold text-gray-900 dark:text-white mt-1">€</span>}
                            <h1 className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums">
                                <Amount
                                    value={stats.curSpent}
                                    showCurrency={false}
                                    minimumFractionDigits={2}
                                    maximumFractionDigits={2}
                                />
                            </h1>
                        </div>

                        {/* Trend Indicator */}
                        <div className={`flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-bold
                                       ${stats.trend === 'below' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' :
                                stats.trend === 'above' ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' :
                                    'text-gray-400 bg-gray-50 dark:bg-surface-dark2'}`}>
                            {stats.trend === 'below' && <TrendingDown size={14} />}
                            {stats.trend === 'above' && <TrendingUp size={14} />}
                            <span>
                                {stats.diffPct}% {stats.trend === 'below' ? t('below_last_month') : stats.trend === 'above' ? t('above_last_month') : t('same_as_last_month')}
                            </span>
                        </div>
                    </div>

                </div>
            </div>


            {/* ── ③ AI Advisor CTA ── */}
            <button
                onClick={() => setActiveTab('advisor')}
                className="w-full relative overflow-hidden bg-gray-100 dark:bg-surface-dark3
                           p-4 rounded-[2rem] border border-violet-100/80 dark:border-violet-900/30
                           shadow-sm flex items-center gap-4 group active:scale-[0.98] transition-all"
            >
                <div className="absolute top-2 left-10 w-1.5 h-1.5 rounded-full bg-violet-400/30 animate-float" />
                <div className="absolute bottom-3 right-20 w-2 h-2 rounded-full bg-indigo-400/20 animate-float" style={{ animationDelay: '1s' }} />

                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white
                                shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles size={22} fill="currentColor" className="animate-pulse" />
                </div>
                <div className="flex-1 text-left min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{t('advisor_title')}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate italic mt-0.5">
                        {t('advisor_subtitle')}
                    </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-500 group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={16} />
                </div>
            </button>

            {/* ── ④ Quick Actions ── */}
            <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-2">
                    {t('quick_access')}
                </p>
                <div className="grid grid-cols-4 gap-3">
                    <QuickAction
                        icon={Target}
                        label={t('goals')}
                        color="text-violet-600 dark:text-violet-400"
                        bg="bg-gradient-to-br from-violet-100/80 to-violet-200/40 dark:from-violet-900/40 dark:to-violet-800/20"
                        onClick={() => setActiveTab('goals')}
                        delay="0ms"
                    />
                    <QuickAction
                        icon={Wallet}
                        label={t('budgets')}
                        color="text-violet-600 dark:text-violet-400"
                        bg="bg-gradient-to-br from-violet-100/80 to-violet-200/40 dark:from-violet-900/40 dark:to-violet-800/20"
                        onClick={() => setActiveTab('budgets')}
                        delay="50ms"
                    />
                    <QuickAction
                        icon={RefreshCw}
                        label={t('recurring_short')}
                        color="text-violet-600 dark:text-violet-400"
                        bg="bg-gradient-to-br from-violet-100/80 to-violet-200/40 dark:from-violet-900/40 dark:to-violet-800/20"
                        onClick={onRecurring || (() => setActiveTab('recurring'))}
                        delay="100ms"
                    />
                    <QuickAction
                        icon={BarChart}
                        label={t('stats_short')}
                        color="text-violet-600 dark:text-violet-400"
                        bg="bg-gradient-to-br from-violet-100/80 to-violet-200/40 dark:from-violet-900/40 dark:to-violet-800/20"
                        onClick={() => setActiveTab('stats')}
                        delay="150ms"
                    />
                </div>
            </div>

            {/* ── ⑤ Recent Transactions ── */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        {t('recent')}
                        <span className="bg-gray-100 dark:bg-surface-dark3 text-gray-500 dark:text-gray-400 text-[10px] px-2 py-0.5 rounded-full">
                            {transactions.length}
                        </span>
                    </h2>
                    <button
                        onClick={() => setActiveTab('history')}
                        className="flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400
                                   hover:text-violet-500 transition-colors"
                    >
                        {t('all')} <ChevronRight size={13} />
                    </button>
                </div>

                {transactions.length === 0 ? (
                    <div className="text-center py-14
                                    bg-white dark:bg-surface-dark3
                                    rounded-[2rem] border border-gray-100 dark:border-transparent shadow-sm">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-violet-50 dark:bg-violet-900/30
                                        flex items-center justify-center mx-auto mb-4">
                            <TrendingUp size={28} className="text-violet-400" />
                        </div>
                        <p className="font-bold text-gray-700 dark:text-white/90 text-sm">
                            {t('no_transactions')}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 max-w-[200px] mx-auto">
                            {t('tap_to_add')}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5 stagger-children">
                        {transactions.slice(0, 5).map(tx => (
                            <TransactionItem key={tx.id} transaction={tx} onDelete={onDelete} onEdit={onEdit} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeView;









