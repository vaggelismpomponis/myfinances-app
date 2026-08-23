import React, { useMemo } from 'react';
import {
    Target, Wallet, RefreshCw, BarChart,
    ChevronRight, Sparkles, ArrowUpRight, ArrowDownRight, TrendingUp,
    ArrowRight, TrendingDown, Crown, Minus
} from 'lucide-react';
import TransactionItem from '../components/TransactionItem';
import Amount from '../components/Amount';
import CategoryIcon from '../components/CategoryIcon';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────
   Desktop Quick Action Chip
───────────────────────────────────────────── */
const DesktopQuickChip = ({ icon: Icon, label, onClick, isPro, userIsPro, delay }) => (
    <motion.button
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: parseFloat(delay) / 1000 }}
        onClick={onClick}
        className="flex items-center gap-3 px-5 py-3.5 rounded-2xl
                   bg-white dark:bg-surface-dark3
                   border-2 border-gray-100 dark:border-white/[0.07]
                   shadow-sm
                   hover:bg-violet-600 dark:hover:bg-violet-600
                   hover:border-violet-600 dark:hover:border-violet-500
                   hover:shadow-lg hover:shadow-violet-500/25
                   transition-all duration-200 group relative flex-1"
    >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
                        bg-violet-100 dark:bg-violet-900/50
                        group-hover:bg-white/20
                        transition-colors duration-200">
            <Icon size={17} className="text-violet-600 dark:text-violet-400 group-hover:text-white transition-colors duration-200" />
        </div>
        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-white transition-colors duration-200">{label}</span>
        {isPro && !userIsPro && (
            <Crown size={11} className="text-amber-400 group-hover:text-amber-300 ml-auto flex-shrink-0 transition-colors" />
        )}
    </motion.button>
);

/* ─────────────────────────────────────────────
   Mobile Quick Action Button (original style)
───────────────────────────────────────────── */
const QuickAction = ({ icon: Icon, label, color, bg, onClick, delay, isPro, userIsPro }) => (
    <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: parseFloat(delay) / 1000 }}
        onClick={onClick}
        className={`flex flex-col items-center gap-2 relative`}
    >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
                         shadow-sm ring-2 ring-offset-2 ring-violet-200 dark:ring-violet-900/50 dark:ring-offset-surface-dark
                         ${bg} transition-all duration-200 relative`}>
            <Icon size={24} className={color} />
            {isPro && !userIsPro && (
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white dark:bg-surface-dark shadow-md flex items-center justify-center border border-gray-100 dark:border-white/10">
                    <Crown size={12} className="text-amber-400" fill="currentColor" />
                </div>
            )}
        </div>
        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{label}</span>
    </motion.button>
);

/* ─────────────────────────────────────────────
   Desktop Financial Summary Card
───────────────────────────────────────────── */
const FinancialSummaryCard = ({ totalIncome, totalExpense, t }) => {
    const netFlow = totalIncome - totalExpense;
    const isPositive = netFlow >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white dark:bg-surface-dark3 rounded-[2rem]
                       border border-gray-100 dark:border-white/[0.05]
                       shadow-sm p-6 space-y-4"
        >
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {t('this_month_spend') || 'This Month'}
            </h3>

            {/* Income */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/70 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <ArrowUpRight size={17} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('stats_income')}</p>
                    <p className="text-base font-black text-gray-900 dark:text-white truncate tabular-nums">
                        <Amount value={totalIncome} />
                    </p>
                </div>
            </div>

            {/* Expense */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-900/20">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/70 dark:bg-white/10 text-rose-600 dark:text-rose-400 flex-shrink-0">
                    <ArrowDownRight size={17} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('stats_expense')}</p>
                    <p className="text-base font-black text-gray-900 dark:text-white truncate tabular-nums">
                        <Amount value={totalExpense} />
                    </p>
                </div>
            </div>

            {/* Net Flow */}
            <div className={`flex items-center justify-between px-4 py-3 rounded-2xl
                            ${isPositive
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
                            }`}>
                <div className="flex items-center gap-2">
                    {isPositive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                    <span className="text-xs font-black uppercase tracking-wider">Net Flow</span>
                </div>
                <span className="text-base font-black tabular-nums">
                    {isPositive ? '+' : '−'}<Amount value={Math.abs(netFlow)} showSign={false} />
                </span>
            </div>
        </motion.div>
    );
};

/* ─────────────────────────────────────────────
   Desktop Budget Progress Card
───────────────────────────────────────────── */
const BudgetProgressCard = ({ budgets, transactions, setActiveTab, t }) => {
    const activeBudgets = useMemo(() => budgets.slice(0, 5), [budgets]);

    if (activeBudgets.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white dark:bg-surface-dark3 rounded-[2rem]
                       border border-gray-100 dark:border-white/[0.05]
                       shadow-sm p-6 space-y-4"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    {t('budgets')}
                </h3>
                <button
                    onClick={() => setActiveTab('budgets')}
                    className="text-[10px] font-black text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors flex items-center gap-0.5"
                >
                    {t('all')} <ChevronRight size={11} />
                </button>
            </div>

            <div className="space-y-4">
                {activeBudgets.map(budget => (
                    <BudgetBar key={budget.id} budget={budget} transactions={transactions} t={t} />
                ))}
            </div>
        </motion.div>
    );
};

/* ─────────────────────────────────────────────
   Budget Bar (inline, no separate component needed)
───────────────────────────────────────────── */
const BudgetBar = ({ budget, transactions, t }) => {
    const spent = useMemo(() => {
        const now = new Date();
        return transactions
            .filter(tx =>
                tx.type === 'expense' &&
                tx.category?.toLowerCase() === budget.category?.toLowerCase() &&
                new Date(tx.date).getMonth() === now.getMonth() &&
                new Date(tx.date).getFullYear() === now.getFullYear()
            )
            .reduce((s, tx) => s + tx.amount, 0);
    }, [transactions, budget]);

    const pct = Math.min((spent / budget.amount) * 100, 100);
    const isWarning = pct >= 75;
    const isDanger = pct >= 100;

    const categoryLabel = t('cat_' + budget.category?.toLowerCase());
    const displayCategory = categoryLabel === 'cat_' + budget.category?.toLowerCase()
        ? budget.category
        : categoryLabel;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CategoryIcon category={budget.category} type="expense" size={14} />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">{displayCategory}</span>
                </div>
                <span className={`text-[10px] font-black ${isDanger ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    {pct.toFixed(0)}%
                </span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700
                                ${isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-violet-500'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-gray-400 dark:text-gray-600">
                <span><Amount value={spent} /></span>
                <span><Amount value={budget.amount} /></span>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main HomeView
───────────────────────────────────────────── */
const HomeView = ({ balance, totalIncome, totalExpense, transactions, budgets, onDelete, onEdit, setActiveTab, onRecurring, isDesktop }) => {
    const { t, privacyMode } = useSettings();
    const { isPro, openUpgradeModal } = useSubscription();

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

    const quickActions = [
        {
            icon: Target, label: t('goals'), delay: '0',
            onClick: () => setActiveTab('goals'),
            isPro: false, userIsPro: isPro,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-gradient-to-br from-violet-100/80 to-violet-200/40 dark:from-violet-900/40 dark:to-violet-800/20',
        },
        {
            icon: Wallet, label: t('budgets'), delay: '50',
            onClick: () => setActiveTab('budgets'),
            isPro: false, userIsPro: isPro,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-gradient-to-br from-violet-100/80 to-violet-200/40 dark:from-violet-900/40 dark:to-violet-800/20',
        },
        {
            icon: RefreshCw, label: t('recurring_short'), delay: '100',
            onClick: () => {
                if (!isPro) { openUpgradeModal('recurring'); }
                else { if (onRecurring) onRecurring(); else setActiveTab('recurring'); }
            },
            isPro: true, userIsPro: isPro,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-gradient-to-br from-violet-100/80 to-violet-200/40 dark:from-violet-900/40 dark:to-violet-800/20',
        },
        {
            icon: BarChart, label: t('stats_short'), delay: '150',
            onClick: () => setActiveTab('stats'),
            isPro: true, userIsPro: isPro,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-gradient-to-br from-violet-100/80 to-violet-200/40 dark:from-violet-900/40 dark:to-violet-800/20',
        },
    ];

    // ── Hero Card (shared between mobile & desktop) ──
    const heroCard = (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, type: 'spring' }}
            className="relative overflow-hidden rounded-[2.5rem]
                        bg-white dark:bg-surface-dark3 backdrop-blur-xl
                        p-8 pt-10 pb-8 text-center shadow-premium border border-slate-200/60 dark:border-white/5
                        transition-all duration-300"
        >
            {/* Subtle top glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-500/10 dark:bg-violet-500/5 blur-[80px] pointer-events-none rounded-full" />

            <div className="relative z-10 space-y-2">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-tight">
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
                                'text-gray-600 bg-gray-50 dark:bg-surface-dark2'}`}>
                        {stats.trend === 'below' && <TrendingDown size={14} />}
                        {stats.trend === 'above' && <TrendingUp size={14} />}
                        {stats.trend === 'neutral' && <Minus size={14} />}
                        <span>
                            {stats.diffPct}% {stats.trend === 'below' ? t('below_last_month') : stats.trend === 'above' ? t('above_last_month') : t('same_as_last_month')}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    // ── AI Advisor CTA (shared) ──
    const advisorCta = (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
                if (!isPro) { openUpgradeModal('advisor'); }
                else { setActiveTab('advisor'); }
            }}
            className="w-full relative overflow-hidden bg-violet-50 dark:bg-surface-dark3 backdrop-blur-md
                       p-4 rounded-[2rem] border border-violet-200/50 dark:border-violet-900/30
                       shadow-premium flex items-center gap-4 group transition-all"
        >
            {!isPro && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white dark:bg-surface-dark shadow-md flex items-center justify-center border border-gray-100 dark:border-white/10 z-10">
                    <Crown size={12} className="text-amber-400" fill="currentColor" />
                </div>
            )}
            <div className="absolute top-2 left-10 w-1.5 h-1.5 rounded-full bg-violet-400/30 animate-float" />
            <div className="absolute bottom-3 right-20 w-2 h-2 rounded-full bg-indigo-400/20 animate-float" style={{ animationDelay: '1s' }} />

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white
                            shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                <Sparkles size={22} fill="currentColor" className="animate-pulse" />
            </div>
            <div className="flex-1 text-left min-w-0">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{t('advisor_title')}</h4>
                <p className="text-[11px] text-gray-700 dark:text-gray-300 font-medium truncate italic mt-0.5">
                    {t('advisor_subtitle')}
                </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-500 group-hover:translate-x-1 transition-transform">
                <ArrowRight size={16} />
            </div>
        </motion.button>
    );

    // ── Recent Transactions (shared) ──
    const recentTransactions = (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    {t('recent')}
                    <span className="bg-gray-100 dark:bg-surface-dark3 text-gray-700 dark:text-gray-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
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
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 max-w-[200px] mx-auto">
                        {t('tap_to_add')}
                    </p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {transactions.slice(0, isDesktop ? 8 : 5).map((tx, idx) => (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (idx * 0.04) }}
                            layout
                        >
                            <TransactionItem transaction={tx} onDelete={onDelete} onEdit={onEdit} />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );

    // ── DESKTOP LAYOUT ──
    if (isDesktop) {
        return (
            <div className="space-y-5 pb-6">

                {/* ── Quick Actions Row ── */}
                <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-2.5 ml-1">
                        {t('quick_access')}
                    </p>
                    <div className="flex gap-3">
                        {quickActions.map((action) => (
                            <DesktopQuickChip
                                key={action.label}
                                icon={action.icon}
                                label={action.label}
                                onClick={action.onClick}
                                isPro={action.isPro}
                                userIsPro={action.userIsPro}
                                delay={action.delay}
                            />
                        ))}
                    </div>
                </div>

                {/* ── Premium Hero Card (wide) ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                    className="relative overflow-hidden rounded-[2rem] hero-gradient
                                p-8 shadow-premium border border-violet-200/40 dark:border-white/[0.06]"
                >
                    {/* Decorative background orbs */}
                    <div className="absolute -top-20 -right-20 w-56 h-56 bg-violet-400/[0.12] dark:bg-violet-500/[0.08] blur-[80px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-16 -left-12 w-44 h-44 bg-indigo-400/[0.08] dark:bg-indigo-500/[0.06] blur-[60px] rounded-full pointer-events-none" />
                    <div className="absolute top-10 right-1/3 w-32 h-32 bg-violet-300/[0.06] dark:bg-violet-400/[0.04] blur-[50px] rounded-full pointer-events-none" />

                    <div className="relative z-10 flex items-end justify-between gap-8">
                        {/* Left: Amount + Trend */}
                        <div>
                            <p className="text-violet-500/80 dark:text-violet-300/50 text-[10px] font-black uppercase tracking-[0.15em] mb-2">
                                {t('this_month_spend')}
                            </p>
                            <div className="flex items-start gap-1.5">
                                {!privacyMode && (
                                    <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 mt-2.5">€</span>
                                )}
                                <h1 className="text-[4rem] leading-none font-black text-gray-900 dark:text-white tracking-tighter tabular-nums">
                                    <Amount
                                        value={stats.curSpent}
                                        showCurrency={false}
                                        minimumFractionDigits={2}
                                        maximumFractionDigits={2}
                                    />
                                </h1>
                            </div>
                            <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[11px] font-bold
                                ${stats.trend === 'below'
                                    ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/[0.12]'
                                    : stats.trend === 'above'
                                        ? 'text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/[0.12]'
                                        : 'text-gray-500 bg-gray-200/60 dark:text-gray-400 dark:bg-white/[0.06]'}`}
                            >
                                {stats.trend === 'below' && <TrendingDown size={13} />}
                                {stats.trend === 'above' && <TrendingUp size={13} />}
                                {stats.trend === 'neutral' && <Minus size={13} />}
                                <span>
                                    {stats.diffPct}% {stats.trend === 'below' ? t('below_last_month') : stats.trend === 'above' ? t('above_last_month') : t('same_as_last_month')}
                                </span>
                            </div>
                        </div>

                        {/* Right: Income / Expense cards */}
                        <div className="flex gap-3 pb-1">
                            <div className="flex items-center gap-3 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm rounded-2xl px-4 py-3.5 border border-white/80 dark:border-white/[0.04] min-w-[170px]">
                                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                    <ArrowUpRight size={16} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{t('stats_income')}</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white truncate tabular-nums">
                                        <Amount value={totalIncome} />
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm rounded-2xl px-4 py-3.5 border border-white/80 dark:border-white/[0.04] min-w-[170px]">
                                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                                    <ArrowDownRight size={16} className="text-rose-600 dark:text-rose-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{t('stats_expense')}</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white truncate tabular-nums">
                                        <Amount value={totalExpense} />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── 2-Column Dashboard Grid ── */}
                <div className="grid grid-cols-5 gap-5 items-start">

                    {/* LEFT COLUMN — advisor + transactions (3/5 width) */}
                    <div className="col-span-3 space-y-5">
                        {/* AI Advisor CTA */}
                        <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                if (!isPro) { openUpgradeModal('advisor'); }
                                else { setActiveTab('advisor'); }
                            }}
                            className="w-full relative overflow-hidden glass-light dark:glass
                                       p-4 rounded-[1.75rem]
                                       shadow-sm hover:shadow-md
                                       flex items-center gap-3.5 group transition-all duration-300"
                        >
                            {!isPro && (
                                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center z-10 shadow-sm">
                                    <Crown size={10} className="text-white" fill="currentColor" />
                                </div>
                            )}
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white
                                            shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                                <Sparkles size={20} fill="currentColor" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{t('advisor_title')}</h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
                                    {t('advisor_subtitle')}
                                </p>
                            </div>
                            <div className="w-7 h-7 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-500 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                                <ArrowRight size={14} />
                            </div>
                        </motion.button>

                        {recentTransactions}
                    </div>

                    {/* RIGHT COLUMN — budgets (2/5 width) */}
                    <div className="col-span-2 space-y-5 sticky top-4">
                        <BudgetProgressCard
                            budgets={budgets}
                            transactions={transactions}
                            setActiveTab={setActiveTab}
                            t={t}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // ── MOBILE LAYOUT ──
    return (
        <div className="space-y-5 pb-28">

            {/* ── Premium Hero Card ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="relative overflow-hidden rounded-[2rem] hero-gradient
                            p-6 pb-5 shadow-premium border border-violet-200/40 dark:border-white/[0.06]"
            >
                {/* Decorative background orbs */}
                <div className="absolute -top-16 -right-16 w-44 h-44 bg-violet-400/[0.12] dark:bg-violet-500/[0.08] blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-12 -left-8 w-36 h-36 bg-indigo-400/[0.08] dark:bg-indigo-500/[0.06] blur-[50px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    {/* Section label */}
                    <p className="text-violet-500/80 dark:text-violet-300/50 text-[10px] font-black uppercase tracking-[0.15em] mb-1.5">
                        {t('this_month_spend')}
                    </p>

                    {/* Main amount */}
                    <div className="flex items-start gap-1">
                        {!privacyMode && (
                            <span className="text-xl font-bold text-gray-400 dark:text-gray-500 mt-2">€</span>
                        )}
                        <h1 className="text-[3.25rem] leading-none font-black text-gray-900 dark:text-white tracking-tighter tabular-nums">
                            <Amount
                                value={stats.curSpent}
                                showCurrency={false}
                                minimumFractionDigits={2}
                                maximumFractionDigits={2}
                            />
                        </h1>
                    </div>

                    {/* Trend indicator */}
                    <div className={`inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full text-[11px] font-bold
                        ${stats.trend === 'below'
                            ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/[0.12]'
                            : stats.trend === 'above'
                                ? 'text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/[0.12]'
                                : 'text-gray-500 bg-gray-200/60 dark:text-gray-400 dark:bg-white/[0.06]'}`}
                    >
                        {stats.trend === 'below' && <TrendingDown size={13} />}
                        {stats.trend === 'above' && <TrendingUp size={13} />}
                        {stats.trend === 'neutral' && <Minus size={13} />}
                        <span>
                            {stats.diffPct}% {stats.trend === 'below' ? t('below_last_month') : stats.trend === 'above' ? t('above_last_month') : t('same_as_last_month')}
                        </span>
                    </div>

                    {/* Inline Income / Expense */}
                    <div className="flex gap-2.5 mt-5">
                        <div className="flex-1 flex items-center gap-2.5 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm rounded-2xl px-3 py-2.5 border border-white/80 dark:border-white/[0.04]">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                <ArrowUpRight size={15} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{t('stats_income')}</p>
                                <p className="text-[13px] font-black text-gray-900 dark:text-white truncate tabular-nums">
                                    <Amount value={totalIncome} />
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center gap-2.5 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm rounded-2xl px-3 py-2.5 border border-white/80 dark:border-white/[0.04]">
                            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                                <ArrowDownRight size={15} className="text-rose-600 dark:text-rose-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{t('stats_expense')}</p>
                                <p className="text-[13px] font-black text-gray-900 dark:text-white truncate tabular-nums">
                                    <Amount value={totalExpense} />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── AI Advisor CTA ── */}
            <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                    if (!isPro) { openUpgradeModal('advisor'); }
                    else { setActiveTab('advisor'); }
                }}
                className="w-full relative overflow-hidden glass-light dark:glass
                           p-4 rounded-[1.75rem]
                           shadow-sm hover:shadow-md
                           flex items-center gap-3.5 group transition-all duration-300"
            >
                {!isPro && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center z-10 shadow-sm">
                        <Crown size={10} className="text-white" fill="currentColor" />
                    </div>
                )}
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white
                                shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                    <Sparkles size={20} fill="currentColor" />
                </div>
                <div className="flex-1 text-left min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{t('advisor_title')}</h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
                        {t('advisor_subtitle')}
                    </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-500 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                    <ArrowRight size={14} />
                </div>
            </motion.button>

            {/* ── Quick Actions (pill buttons) ── */}
            <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em] mb-2.5 ml-1">
                    {t('quick_access')}
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                    {quickActions.map((action) => {
                        const ActionIcon = action.icon;
                        return (
                            <motion.button
                                key={action.label}
                                whileHover={{ scale: 1.03, y: -1 }}
                                whileTap={{ scale: 0.96 }}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: parseFloat(action.delay) / 1000 }}
                                onClick={action.onClick}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl
                                           bg-white dark:bg-surface-dark3
                                           border border-gray-100 dark:border-white/[0.06]
                                           shadow-sm hover:shadow-md
                                           hover:border-violet-200 dark:hover:border-violet-800/50
                                           transition-all duration-200 whitespace-nowrap relative flex-shrink-0"
                            >
                                <div className="w-7 h-7 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                                    <ActionIcon size={14} className="text-violet-600 dark:text-violet-400" />
                                </div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{action.label}</span>
                                {action.isPro && !action.userIsPro && (
                                    <Crown size={10} className="text-amber-400 flex-shrink-0" fill="currentColor" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* ── Recent Transactions ── */}
            {recentTransactions}
        </div>
    );
};

export default HomeView;
