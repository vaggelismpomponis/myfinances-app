import React, { useMemo, useState } from 'react';
import {
    Target, Wallet, RefreshCw, BarChart,
    ChevronRight, Sparkles, ArrowUpRight, ArrowDownRight, TrendingUp,
    ArrowRight, TrendingDown, Minus, Eye, EyeOff, Zap,
    Plus, ShieldCheck, BarChart2, Bot, Calendar, PieChart, Search,
    Flame, CheckCircle2, Clock
} from 'lucide-react';
import TransactionItem from '../components/TransactionItem';
import Amount from '../components/Amount';
import CategoryIcon, { CATEGORY_ACCENT } from '../components/CategoryIcon';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import SafeToBurnCard from '../components/SafeToBurnCard';
import { getCategoryTranslation } from '../utils/categoryTranslations';
/* ─────────────────────────────────────────────
   Getting Started — onboarding step data
───────────────────────────────────────────── */
const GS_STEPS = [
    { titleKey: 'onboarding_welcome_title', descKey: 'onboarding_welcome_desc', Icon: Wallet, gradient: 'from-violet-600 via-indigo-600 to-purple-700', orb: 'bg-violet-400' },
    { titleKey: 'onboarding_transactions_title', descKey: 'onboarding_transactions_desc', Icon: Plus, gradient: 'from-emerald-500 via-teal-500 to-cyan-600', orb: 'bg-emerald-400' },
    { titleKey: 'onboarding_budgets_title', descKey: 'onboarding_budgets_desc', Icon: Target, gradient: 'from-amber-500 via-orange-500 to-rose-500', orb: 'bg-amber-400' },
    { titleKey: 'onboarding_analytics_title', descKey: 'onboarding_analytics_desc', Icon: BarChart2, gradient: 'from-blue-600 via-indigo-500 to-violet-600', orb: 'bg-blue-400' },
    { titleKey: 'onboarding_security_title', descKey: 'onboarding_security_desc', Icon: ShieldCheck, gradient: 'from-rose-500 via-pink-500 to-fuchsia-600', orb: 'bg-rose-400' },
];

/* ─────────────────────────────────────────────
   HomeGettingStarted — inline walkthrough for HomeView
───────────────────────────────────────────── */
const HomeGettingStarted = ({ t, onOpenGuide }) => {
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);
    const cfg = GS_STEPS[step];
    const isLast = step === GS_STEPS.length - 1;

    const goNext = () => { setDir(1); setStep(s => (s < GS_STEPS.length - 1 ? s + 1 : 0)); };
    const goPrev = () => { setDir(-1); setStep(s => Math.max(0, s - 1)); };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', damping: 22, stiffness: 200 }}
            className="rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 dark:border-white/[0.06]"
        >
            {/* Gradient header */}
            <div className={`relative bg-gradient-to-br ${cfg.gradient} px-5 pt-5 pb-6 overflow-hidden`}>
                {/* Orbs */}
                <div className={`absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-20 blur-2xl ${cfg.orb}`} />
                <div className={`absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-15 blur-xl ${cfg.orb}`} />

                {/* Top row: dots + step counter */}
                <div className="relative z-10 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                        {GS_STEPS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setDir(i > step ? 1 : -1); setStep(i); }}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-5 bg-white' : 'w-1.5 bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-white/50 tabular-nums">
                            {step + 1}/{GS_STEPS.length}
                        </span>
                        {onOpenGuide && (
                            <button
                                onClick={onOpenGuide}
                                className="text-[10px] font-bold text-white/60 hover:text-white
                                           bg-white/10 hover:bg-white/20 rounded-full px-2.5 py-1
                                           transition-all duration-150 active:scale-95"
                            >
                                {t('user_guide') || 'Full Guide'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Step content */}
                <AnimatePresence mode="wait" custom={dir}>
                    <motion.div
                        key={step}
                        custom={dir}
                        initial={{ x: dir > 0 ? 40 : -40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: dir > 0 ? -40 : 40, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="relative z-10"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white/20 ring-1 ring-white/20
                                        flex items-center justify-center mb-3">
                            <cfg.Icon size={24} className="text-white" strokeWidth={1.8} />
                        </div>
                        <h3 className="text-[17px] font-black text-white leading-tight mb-1.5">
                            {t(cfg.titleKey)}
                        </h3>
                        <p className="text-[12.5px] text-white/80 leading-relaxed font-medium">
                            {t(cfg.descKey)}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom controls */}
            <div className="bg-white dark:bg-surface-dark3 px-5 py-3.5 flex items-center gap-2.5">
                <button
                    onClick={goPrev}
                    disabled={step === 0}
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                               bg-gray-100 dark:bg-white/[0.07]
                               text-gray-500 dark:text-white/50
                               hover:bg-gray-200 dark:hover:bg-white/[0.12]
                               disabled:opacity-25 disabled:pointer-events-none
                               active:scale-90 transition-all duration-150"
                >
                    <ChevronRight size={14} strokeWidth={2.5} className="rotate-180" />
                </button>
                <button
                    onClick={goNext}
                    className={`flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5
                               font-bold text-[12px] text-white
                               bg-gradient-to-r ${cfg.gradient}
                               active:scale-[0.98] transition-all duration-150 shadow-sm`}
                >
                    <span>{isLast ? (t('guide_restart_tour') || 'Restart') : (t('onboarding_next') || 'Next')}</span>
                    <ArrowRight size={13} strokeWidth={2.5} />
                </button>
            </div>
        </motion.div>
    );
};


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
                    <Zap size={12} className="text-amber-400" fill="currentColor" />
                </div>
            )}
        </div>
        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{label}</span>
    </motion.button>
);

/* ─────────────────────────────────────────────
   Desktop Mini Widgets (Budgets & Goals)
───────────────────────────────────────────── */
const getGoalEmoji = (goal) => {
    if (goal?.emoji) return goal.emoji;
    const title = (goal?.title || '').toLowerCase();
    if (title.includes('ταξ') || title.includes('trav')) return '✈️';
    if (title.includes('σπίτ') || title.includes('home')) return '🏠';
    if (title.includes('αυτ') || title.includes('car')) return '🚗';
    if (title.includes('τεχ') || title.includes('laptop') || title.includes('tech') || title.includes('phone')) return '💻';
    if (title.includes('γάμ') || title.includes('wed')) return '💍';
    if (title.includes('υγ') || title.includes('health')) return '🏥';
    if (title.includes('παιχ') || title.includes('game')) return '🎮';
    if (title.includes('σκύλ') || title.includes('γάτ') || title.includes('pet')) return '🐾';
    return '🎯';
};

const DesktopGoalMiniCard = ({ goal }) => {
    const current = goal.current_amount || 0;
    const target = goal.target_amount || 1;
    const pct = Math.min(100, Math.round((current / target) * 100));
    const emoji = getGoalEmoji(goal);

    return (
        <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100/80 dark:border-white/[0.04] space-y-2.5 hover:border-violet-200 dark:hover:border-violet-800/40 transition-colors">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base flex-shrink-0">{emoji}</span>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{goal.title}</span>
                </div>
                <span className="text-[10px] font-black text-violet-600 dark:text-violet-400 tabular-nums bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-full border border-violet-100 dark:border-violet-900/30">
                    {pct}%
                </span>
            </div>
            <div className="h-1.5 bg-gray-200/70 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 tabular-nums">
                <span><Amount value={current} /></span>
                <span><Amount value={target} /></span>
            </div>
        </div>
    );
};

const DesktopBudgetMiniCard = ({ budget, transactions, t }) => {
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
    const catName = getCategoryTranslation(budget.category, t);

    return (
        <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100/80 dark:border-white/[0.04] space-y-2.5 hover:border-violet-200 dark:hover:border-violet-800/40 transition-colors">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center flex-shrink-0 shadow-2xs">
                        <CategoryIcon category={budget.category} type="expense" size={13} />
                    </div>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate capitalize">{catName}</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isDanger ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' :
                    isWarning ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' :
                    'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400'
                }`}>
                    {pct.toFixed(0)}%
                </span>
            </div>
            <div className="h-1.5 bg-gray-200/70 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${
                        isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-violet-500'
                    }`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 tabular-nums">
                <span><Amount value={spent} /></span>
                <span><Amount value={budget.amount} /></span>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main HomeView
───────────────────────────────────────────── */
const HomeView = ({ balance = 0, totalIncome = 0, totalExpense = 0, transactions = [], budgets = [], onDelete, onEdit, setActiveTab, onRecurring, isDesktop, user, displayName, onAdd }) => {
    const { t, privacyMode, togglePrivacyMode, language } = useSettings();
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
            onClick: () => {
                if (!isPro) { openUpgradeModal('stats'); }
                else { setActiveTab('stats'); }
            },
            isPro: true, userIsPro: isPro,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-gradient-to-br from-violet-100/80 to-violet-200/40 dark:from-violet-900/40 dark:to-violet-800/20',
        },
    ];

    // ── Hero Card (shared between mobile & desktop) ──
    const { stb, todayStartingBudget, isGlideActive, streak } = useAppStore.getState().getSafeToBurn();

    const heroCard = (
        <SafeToBurnCard
            stb={stb}
            todayStartingBudget={todayStartingBudget}
            isGlideActive={isGlideActive}
            streak={streak}
            privacyMode={privacyMode}
            t={t}
            stats={stats}
        />
    );

    // ── AI Advisor CTA (shared) ──
    const advisorLiveInsight = useMemo(() => {
        const now = new Date();
        const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
        const thisMonthTxs = transactions.filter(tx => {
            const d = new Date(tx.date);
            return tx.type === 'expense' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const coffeeSpend = transactions
            .filter(tx => tx.type === 'expense' && (tx.category?.toLowerCase() === 'coffee' || tx.category?.toLowerCase() === 'καφές') && new Date(tx.date) >= weekStart)
            .reduce((a, tx) => a + tx.amount, 0);
        const todayStr = now.toDateString();
        const noExpToday = !transactions.some(tx => tx.type === 'expense' && new Date(tx.date).toDateString() === todayStr);
        const catTotals = {};
        thisMonthTxs.forEach(tx => { catTotals[tx.category || 'other'] = (catTotals[tx.category || 'other'] || 0) + tx.amount; });
        const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
        if (transactions.length === 0) return t('insight_no_data') || 'Πρόσθεσε έξοδα για συμβουλές';
        if (noExpToday && transactions.length > 0) return `${t('insight_no_expenses_today')}`;
        if (coffeeSpend > 8) return `${t('insight_coffee_up').replace('{amount}', coffeeSpend.toFixed(0))}`;
        if (topCat) return `${t('insight_top_category').replace('{category}', topCat[0])}`;
        return t('advisor_subtitle');
    }, [transactions, t]);

    const advisorCta = (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
                if (!isPro) { openUpgradeModal('advisor'); }
                else { setActiveTab('advisor'); }
            }}
            className="w-full relative overflow-hidden bg-gradient-to-br from-violet-50 to-indigo-50 dark:bg-surface-dark3 dark:from-transparent dark:to-transparent
                       p-4 rounded-[2rem] border border-violet-200/60 dark:border-violet-900/30
                       shadow-sm hover:shadow-md flex items-center gap-4 group transition-all duration-200"
        >
            {!isPro && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white dark:bg-surface-dark shadow-md flex items-center justify-center border border-gray-100 dark:border-white/10 z-10">
                    <Zap size={12} className="text-amber-400" fill="currentColor" />
                </div>
            )}
            {/* Gentle pulse animation for the whole card */}
            <motion.div 
                className="absolute inset-0 rounded-[2rem] pointer-events-none"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                style={{ boxShadow: 'inset 0 0 20px rgba(139,92,246,0.15)' }}
            />

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white
                            shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <Sparkles size={22} fill="currentColor" />
            </div>
            <div className="flex-1 text-left min-w-0 pr-6">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{t('advisor_title')}</h4>
                <p className="text-[11px] text-violet-600 dark:text-violet-300 font-semibold truncate mt-0.5 leading-snug">
                    {advisorLiveInsight}
                </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform flex-shrink-0">
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
                <div className="bg-white dark:bg-surface-dark2 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center mt-2">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                        <span className="text-xl">📝</span>
                    </div>
                    <h4 className="font-bold text-[14px] text-gray-800 dark:text-white mb-1">
                        {t('no_transactions') || 'No transactions yet'}
                    </h4>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium max-w-[200px]">
                        {t('no_transactions_desc') || 'Your recent income and expenses will appear here.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
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

    // ── Desktop Specific Calculations & State ──
    const [desktopFilter, setDesktopFilter] = useState('all');
    const [desktopSearch, setDesktopSearch] = useState('');

    const netFlow = totalIncome - totalExpense;
    const isNetPositive = netFlow >= 0;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

    const stbData = useMemo(() => {
        try {
            return useAppStore.getState().getSafeToBurn();
        } catch {
            return { stb: 0, todayStartingBudget: 0, isGlideActive: false, streak: 0 };
        }
    }, [transactions]);

    const storeGoals = useAppStore(state => state.goals || []);
    const activeGoals = useMemo(() => (storeGoals || []).slice(0, 3), [storeGoals]);
    const activeBudgets = useMemo(() => (budgets || []).slice(0, 4), [budgets]);

    const categoryBreakdown = useMemo(() => {
        const now = new Date();
        const curMonth = now.getMonth();
        const curYear = now.getFullYear();

        const monthExpenseTxs = transactions.filter(tx => {
            const d = new Date(tx.date);
            return tx.type === 'expense' && d.getMonth() === curMonth && d.getFullYear() === curYear;
        });

        const totalMonthSpent = monthExpenseTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0);

        const catMap = {};
        monthExpenseTxs.forEach(tx => {
            const cat = tx.category || 'other';
            catMap[cat] = (catMap[cat] || 0) + (tx.amount || 0);
        });

        const sortedCats = Object.entries(catMap)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: totalMonthSpent > 0 ? Math.round((amount / totalMonthSpent) * 100) : 0,
                accent: CATEGORY_ACCENT[category.toLowerCase()] || '#8b5cf6'
            }))
            .sort((a, b) => b.amount - a.amount);

        return {
            totalMonthSpent,
            topCats: sortedCats.slice(0, 4),
            allCats: sortedCats
        };
    }, [transactions]);

    const filteredDesktopTransactions = useMemo(() => {
        return transactions.filter(tx => {
            if (desktopFilter === 'expense' && tx.type !== 'expense') return false;
            if (desktopFilter === 'income' && tx.type !== 'income') return false;
            if (desktopSearch.trim()) {
                const q = desktopSearch.toLowerCase();
                const cat = (tx.category || '').toLowerCase();
                const note = (tx.note || '').toLowerCase();
                const tr = getCategoryTranslation(tx.category, t).toLowerCase();
                return cat.includes(q) || note.includes(q) || tr.includes(q);
            }
            return true;
        }).slice(0, 8);
    }, [transactions, desktopFilter, desktopSearch, t]);

    const dateLocale = language === 'el' ? 'el-GR' : 'en-US';
    const nowDate = new Date();
    const currentDateStr = nowDate.toLocaleDateString(dateLocale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const greeting = nowDate.getHours() < 12 ? (t('good_morning') || 'Καλημέρα') : nowDate.getHours() < 18 ? (t('good_afternoon') || 'Καλό απόγευμα') : (t('good_evening') || 'Καλησπέρα');
    const effectiveName = displayName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

    // ── DESKTOP LAYOUT ──
    if (isDesktop) {
        return (
            <div className="space-y-7 pb-10">
                {/* ── 1. Top Executive Greeting & Toolbar ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight font-display flex items-center gap-2">
                            <span>{greeting}{effectiveName ? `, ${effectiveName}` : ''}</span>
                            <span className="text-2xl">👋</span>
                        </h1>
                        <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100/70 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold text-xs border border-violet-200/60 dark:border-violet-900/40 capitalize">
                                <Calendar size={13} />
                                {currentDateStr}
                            </span>
                            <span className="text-gray-300 dark:text-gray-700">•</span>
                            <span>{t('financial_overview') || 'Οικονομική Επισκόπηση'}</span>
                            {stbData?.streak > 0 && (
                                <>
                                    <span className="text-gray-300 dark:text-gray-700">•</span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 font-bold text-xs">
                                        <Flame size={13} />
                                        {stbData.streak} {t('streak_days') || 'μέρες σερί'}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>

                    {/* Right Toolbar */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={togglePrivacyMode}
                            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 border ${
                                privacyMode
                                    ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-500/25'
                                    : 'bg-white dark:bg-surface-dark3 text-gray-600 dark:text-gray-300 border-gray-200/80 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-700/50 shadow-sm'
                            }`}
                            title={privacyMode ? 'Εμφάνιση ποσών' : 'Απόκρυψη ποσών'}
                        >
                            {privacyMode ? <EyeOff size={15} /> : <Eye size={15} />}
                            <span>{privacyMode ? 'Private Mode' : 'Public'}</span>
                        </button>

                        {onAdd && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onAdd}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold
                                           bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500
                                           text-white shadow-lg shadow-violet-500/25 transition-all duration-200"
                            >
                                <Plus size={16} strokeWidth={2.5} />
                                <span>{t('add_transaction') || 'Νέα Συναλλαγή'}</span>
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* ── 2. Top Bento KPI Cards Row ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Card 1: Balance */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="relative overflow-hidden rounded-[1.75rem] p-5.5
                                   bg-gradient-to-br from-violet-600/10 via-white to-white dark:from-violet-950/30 dark:via-surface-dark3 dark:to-surface-dark3
                                   border border-violet-200/80 dark:border-white/10 shadow-card hover:shadow-md transition-all duration-300 group"
                    >
                        <div className="flex items-center justify-between mb-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-500/25 group-hover:scale-110 transition-transform duration-200">
                                <Wallet size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                                {t('balance') || 'Υπόλοιπο'}
                            </span>
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            {t('balance')}
                        </p>
                        <div className="text-2xl xl:text-3xl font-black text-gray-900 dark:text-white tracking-tight tabular-nums mt-0.5 font-display">
                            <Amount value={balance} />
                        </div>
                        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                            <span>{t('total_liquidity') || 'Διαθέσιμο κεφάλαιο'}</span>
                        </p>
                    </motion.div>

                    {/* Card 2: This Month Expense */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.05 }}
                        className="rounded-[1.75rem] p-5.5 bg-white dark:bg-surface-dark3
                                   border border-gray-100 dark:border-white/10 shadow-card hover:shadow-md transition-all duration-300 group"
                    >
                        <div className="flex items-center justify-between mb-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <ArrowDownRight size={22} />
                            </div>
                            {stats.diffPct > 0 ? (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                                    stats.trend === 'below'
                                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                                        : stats.trend === 'above'
                                            ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400'
                                            : 'bg-gray-100 dark:bg-white/10 text-gray-500'
                                }`}>
                                    {stats.trend === 'below' && <TrendingDown size={11} />}
                                    {stats.trend === 'above' && <TrendingUp size={11} />}
                                    {stats.diffPct}% {stats.trend === 'below' ? (t('below_last_month') || 'κάτω') : (t('above_last_month') || 'πάνω')}
                                </span>
                            ) : null}
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            {t('this_month_spend')}
                        </p>
                        <div className="text-2xl xl:text-3xl font-black text-gray-900 dark:text-white tracking-tight tabular-nums mt-0.5 font-display">
                            <Amount value={stats.curSpent} />
                        </div>
                        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 mt-2 truncate">
                            {t('prev_month') || 'Προηγούμενος'}: <span className="font-bold text-gray-700 dark:text-gray-300"><Amount value={stats.lastSpent} /></span>
                        </p>
                    </motion.div>

                    {/* Card 3: Total Income */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.1 }}
                        className="rounded-[1.75rem] p-5.5 bg-white dark:bg-surface-dark3
                                   border border-gray-100 dark:border-white/10 shadow-card hover:shadow-md transition-all duration-300 group"
                    >
                        <div className="flex items-center justify-between mb-3.5">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                <ArrowUpRight size={22} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                                + {t('stats_income') || 'Έσοδα'}
                            </span>
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            {t('stats_income')}
                        </p>
                        <div className="text-2xl xl:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums mt-0.5 font-display">
                            <Amount value={totalIncome} />
                        </div>
                        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{t('income_inflows') || 'Συνολικές εισροές μήνα'}</span>
                        </p>
                    </motion.div>

                    {/* Card 4: Net Flow */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.15 }}
                        className="rounded-[1.75rem] p-5.5 bg-white dark:bg-surface-dark3
                                   border border-gray-100 dark:border-white/10 shadow-card hover:shadow-md transition-all duration-300 group"
                    >
                        <div className="flex items-center justify-between mb-3.5">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 ${
                                isNetPositive
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                            }`}>
                                {isNetPositive ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                            </div>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                                isNetPositive
                                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400'
                            }`}>
                                {savingsRate > 0 ? `${savingsRate}% ${t('savings_rate') || 'Αποταμίευση'}` : isNetPositive ? (t('net_surplus') || 'Πλεόνασμα') : (t('net_deficit') || 'Έλλειμμα')}
                            </span>
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            Net Flow
                        </p>
                        <div className={`text-2xl xl:text-3xl font-black tracking-tight tabular-nums mt-0.5 font-display ${
                            isNetPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                            {isNetPositive ? '+' : '−'}<Amount value={Math.abs(netFlow)} showSign={false} />
                        </div>
                        <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-2 truncate">
                            {isNetPositive ? 'Θετικό μηνιαίο ισοζύγιο' : 'Αρνητικό μηνιαίο ισοζύγιο'}
                        </p>
                    </motion.div>
                </div>

                {/* ── 3. Main Dashboard Bento Grid (Two Columns) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* ──── LEFT COLUMN (8 cols): Breakdown + Transactions ──── */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-6">

                        {/* ── Monthly Category Breakdown ── */}
                        <div className="bg-white dark:bg-surface-dark3 border border-gray-100 dark:border-white/10 rounded-[1.75rem] p-6 shadow-card">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                        <PieChart size={17} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                            {t('monthly_category_breakdown') || 'Κατανομή Εξόδων Μήνα'}
                                        </h3>
                                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                                            {t('top_categories_desc') || 'Κορυφαίες κατηγορίες αυτού του μήνα'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTab('stats')}
                                    className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 flex items-center gap-1 transition-colors"
                                >
                                    <span>{t('nav_stats') || 'Ανάλυση'}</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>

                            {categoryBreakdown.topCats.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Multi-segment progress bar */}
                                    <div className="h-3 w-full bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden flex gap-1 p-0.5">
                                        {categoryBreakdown.topCats.map(cat => (
                                            <div
                                                key={cat.category}
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${Math.max(cat.percentage, 3)}%`,
                                                    backgroundColor: cat.accent
                                                }}
                                                title={`${getCategoryTranslation(cat.category, t)}: ${cat.percentage}%`}
                                            />
                                        ))}
                                    </div>

                                    {/* Category Pills Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                                        {categoryBreakdown.topCats.map(cat => (
                                            <div
                                                key={cat.category}
                                                className="p-3 rounded-2xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-100/70 dark:border-white/[0.04] space-y-1.5"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <CategoryIcon category={cat.category} type="expense" size={13} />
                                                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate capitalize">
                                                            {getCategoryTranslation(cat.category, t)}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full tabular-nums" style={{ color: cat.accent, backgroundColor: `${cat.accent}18` }}>
                                                        {cat.percentage}%
                                                    </span>
                                                </div>
                                                <div className="text-xs font-black text-gray-900 dark:text-white tabular-nums">
                                                    <Amount value={cat.amount} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 text-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                                    {t('no_expenses_month') || 'Δεν υπάρχουν ακόμη καταγεγραμμένα έξοδα για αυτόν τον μήνα.'}
                                </div>
                            )}
                        </div>

                        {/* ── Recent Transactions Feed ── */}
                        <div className="bg-white dark:bg-surface-dark3 border border-gray-100 dark:border-white/10 rounded-[1.75rem] p-6 shadow-card space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-50 dark:border-white/[0.04]">
                                <div className="flex items-center gap-2.5">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span>{t('recent') || 'Πρόσφατες Συναλλαγές'}</span>
                                        <span className="bg-gray-100 dark:bg-surface-dark4 text-gray-600 dark:text-gray-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                            {transactions.length}
                                        </span>
                                    </h3>
                                </div>

                                {/* Filters + Live Search + View All */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Filter Pills */}
                                    <div className="flex items-center bg-gray-100/80 dark:bg-white/[0.06] p-0.5 rounded-xl text-[11px] font-bold">
                                        <button
                                            onClick={() => setDesktopFilter('all')}
                                            className={`px-2.5 py-1 rounded-lg transition-all ${
                                                desktopFilter === 'all'
                                                    ? 'bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white shadow-2xs font-extrabold'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {t('all') || 'Όλες'}
                                        </button>
                                        <button
                                            onClick={() => setDesktopFilter('expense')}
                                            className={`px-2.5 py-1 rounded-lg transition-all ${
                                                desktopFilter === 'expense'
                                                    ? 'bg-white dark:bg-surface-dark3 text-rose-600 dark:text-rose-400 shadow-2xs font-extrabold'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {t('stats_expense') || 'Έξοδα'}
                                        </button>
                                        <button
                                            onClick={() => setDesktopFilter('income')}
                                            className={`px-2.5 py-1 rounded-lg transition-all ${
                                                desktopFilter === 'income'
                                                    ? 'bg-white dark:bg-surface-dark3 text-emerald-600 dark:text-emerald-400 shadow-2xs font-extrabold'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {t('stats_income') || 'Έσοδα'}
                                        </button>
                                    </div>

                                    {/* Search input */}
                                    <div className="relative">
                                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={desktopSearch}
                                            onChange={e => setDesktopSearch(e.target.value)}
                                            placeholder={t('search_placeholder') || 'Αναζήτηση...'}
                                            className="w-32 sm:w-40 pl-7 pr-2.5 py-1 text-xs rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200/60 dark:border-white/10 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                                        />
                                    </div>

                                    {/* View All button */}
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 flex items-center gap-0.5 ml-1 transition-colors"
                                    >
                                        <span>{t('all') || 'Όλα'}</span>
                                        <ChevronRight size={13} />
                                    </button>
                                </div>
                            </div>

                            {/* Transactions List */}
                            {filteredDesktopTransactions.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-500 flex items-center justify-center mb-2.5">
                                        <TrendingUp size={22} />
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-800 dark:text-white mb-1">
                                        {t('no_transactions') || 'Δεν βρέθηκαν συναλλαγές'}
                                    </h4>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mb-3">
                                        {t('no_transactions_desc') || 'Πρόσθεσε συναλλαγές για να εμφανιστούν εδώ.'}
                                    </p>
                                    {onAdd && (
                                        <button
                                            onClick={onAdd}
                                            className="px-4 py-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 rounded-xl transition-colors"
                                        >
                                            + {t('add_transaction') || 'Προσθήκη'}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3 pt-1">
                                    {filteredDesktopTransactions.map((tx, idx) => (
                                        <motion.div
                                            key={tx.id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 + (idx * 0.03) }}
                                        >
                                            <TransactionItem transaction={tx} onDelete={onDelete} onEdit={onEdit} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ──── RIGHT COLUMN (4 cols): AI Advisor + Budgets + Goals + Shortcuts ──── */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-6">

                        {/* ── AI Advisor Spotlight Card ── */}
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="relative overflow-hidden rounded-[1.75rem] p-6
                                       bg-gradient-to-br from-violet-600 via-indigo-700 to-purple-800
                                       text-white shadow-lg shadow-violet-500/25 border border-white/20 group"
                        >
                            {/* Animated background glow */}
                            <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 blur-2xl rounded-full pointer-events-none" />
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-400/20 blur-2xl rounded-full pointer-events-none" />

                            <div className="relative z-10 space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm">
                                            <Bot size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black tracking-tight leading-tight">
                                                SpendWise AI
                                            </h4>
                                            <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">
                                                {t('advisor_title') || 'Σύμβουλος'}
                                            </p>
                                        </div>
                                    </div>
                                    {!isPro && (
                                        <div className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-sm">
                                            <Zap size={12} fill="currentColor" />
                                        </div>
                                    )}
                                </div>

                                {/* Insight Quote Bubble */}
                                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-xs text-white/90 font-medium leading-relaxed">
                                    "{advisorLiveInsight}"
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => {
                                        if (!isPro) { openUpgradeModal('advisor'); }
                                        else { setActiveTab('advisor'); }
                                    }}
                                    className="w-full py-2.5 px-4 rounded-xl bg-white text-violet-700 text-xs font-extrabold flex items-center justify-center gap-2 hover:bg-white/90 active:scale-98 transition-all shadow-sm"
                                >
                                    <Sparkles size={14} fill="currentColor" />
                                    <span>{t('open_advisor') || 'Συνομιλία με τον AI Σύμβουλο'}</span>
                                    <ArrowRight size={13} strokeWidth={2.5} />
                                </button>
                            </div>
                        </motion.div>

                        {/* ── Safe-to-Burn Pace Card ── */}
                        {stbData && (
                            <div className="bg-white dark:bg-surface-dark3 border border-gray-100 dark:border-white/10 rounded-[1.75rem] p-5.5 shadow-card space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                                            <Flame size={17} />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                                Safe-to-Burn
                                            </h3>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                                {t('safe_to_burn_daily') || 'Ημερήσιο Όριο'}
                                            </p>
                                        </div>
                                    </div>
                                    {stbData.streak > 0 && (
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                                            🔥 {stbData.streak} Streak
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-baseline justify-between pt-1">
                                    <div className="text-2xl font-black text-gray-900 dark:text-white tabular-nums font-display">
                                        <Amount value={stbData.stb} />
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
                                        {t('today') || 'Σήμερα'}
                                    </span>
                                </div>

                                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                                    {t('safe_to_burn_desc') || 'Ημερήσιο ποσό που μπορείς να ξοδέψεις με ασφάλεια σήμερα.'}
                                </p>
                            </div>
                        )}

                        {/* ── Budgets Progress Widget ── */}
                        <div className="bg-white dark:bg-surface-dark3 border border-gray-100 dark:border-white/10 rounded-[1.75rem] p-6 shadow-card space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                                    <span>{t('budgets') || 'Προϋπολογισμοί'}</span>
                                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300">
                                        {activeBudgets.length}
                                    </span>
                                </h3>
                                <button
                                    onClick={() => setActiveTab('budgets')}
                                    className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 flex items-center gap-0.5 transition-colors"
                                >
                                    <span>{t('all') || 'Όλοι'}</span>
                                    <ChevronRight size={13} />
                                </button>
                            </div>

                            {activeBudgets.length > 0 ? (
                                <div className="space-y-3">
                                    {activeBudgets.map(b => (
                                        <DesktopBudgetMiniCard key={b.id} budget={b} transactions={transactions} t={t} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2.5">
                                        {t('no_budgets_set') || 'Δεν έχεις ορίσει προϋπολογισμούς.'}
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('budgets')}
                                        className="px-3.5 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 text-xs font-bold hover:bg-violet-100 transition-colors"
                                    >
                                        + {t('create_budget') || 'Ορισμός Προϋπολογισμού'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Savings Goals Widget ── */}
                        <div className="bg-white dark:bg-surface-dark3 border border-gray-100 dark:border-white/10 rounded-[1.75rem] p-6 shadow-card space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                                    <span>{t('goals') || 'Στόχοι'}</span>
                                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300">
                                        {activeGoals.length}
                                    </span>
                                </h3>
                                <button
                                    onClick={() => setActiveTab('goals')}
                                    className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-500 flex items-center gap-0.5 transition-colors"
                                >
                                    <span>{t('all') || 'Όλοι'}</span>
                                    <ChevronRight size={13} />
                                </button>
                            </div>

                            {activeGoals.length > 0 ? (
                                <div className="space-y-3">
                                    {activeGoals.map(g => (
                                        <DesktopGoalMiniCard key={g.id} goal={g} t={t} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2.5">
                                        {t('no_goals_set') || 'Δεν έχεις ενεργούς στόχους.'}
                                    </p>
                                    <button
                                        onClick={() => setActiveTab('goals')}
                                        className="px-3.5 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 text-xs font-bold hover:bg-violet-100 transition-colors"
                                    >
                                        + {t('create_goal') || 'Νέος Στόχος'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Quick Tools Grid ── */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                            {quickActions.map(action => {
                                const ActionIcon = action.icon;
                                return (
                                    <button
                                        key={action.label}
                                        onClick={action.onClick}
                                        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-surface-dark3 border border-gray-100 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-700/50 hover:shadow-card transition-all duration-200 group"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <ActionIcon size={16} />
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate w-full text-center">
                                            {action.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
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
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
                className="relative overflow-hidden rounded-[2.5rem]
                           bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 dark:from-surface-dark3 dark:via-surface-dark4 dark:to-black
                           p-7 pb-6 shadow-premium border border-white/20 dark:border-white/10"
            >
                <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl pointer-events-none" />
                {/* Decorative background orbs */}
                <div className="absolute -top-16 -right-16 w-44 h-44 bg-violet-400/[0.12] dark:bg-violet-500/[0.08] blur-[60px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-12 -left-8 w-36 h-36 bg-indigo-400/[0.08] dark:bg-indigo-500/[0.06] blur-[50px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    {/* Privacy toggle — top right of hero card */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePrivacyMode}
                        aria-label={privacyMode ? 'Disable Privacy Mode' : 'Enable Privacy Mode'}
                        className="absolute -top-1 right-0 w-8 h-8 rounded-full
                                   bg-white/25 dark:bg-white/[0.12] backdrop-blur-sm
                                   flex items-center justify-center
                                   text-white/80 dark:text-white/60
                                   hover:bg-white/40 dark:hover:bg-white/[0.20]
                                   transition-all duration-150 z-20"
                        title={privacyMode ? 'Show amounts' : 'Hide amounts'}
                    >
                        {privacyMode ? <EyeOff size={14} /> : <Eye size={14} />}
                    </motion.button>

                    {/* Section label */}
                    <p className="text-white/80 dark:text-violet-300/50 text-[10px] font-black uppercase tracking-[0.2em] mb-2 font-display">
                        {t('this_month_spend')}
                    </p>

                    {/* Main amount */}
                    <div className="flex items-start gap-1">
                        {!privacyMode && (
                            <span className="text-2xl font-bold text-white/60 dark:text-gray-500 mt-2">€</span>
                        )}
                        <h1 className="text-[3.75rem] leading-[0.9] font-black text-white tracking-tighter tabular-nums drop-shadow-md font-display">
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
                            ? 'text-emerald-300 bg-emerald-400/20'
                            : stats.trend === 'above'
                                ? 'text-rose-300 bg-rose-400/20'
                                : 'text-white/60 bg-white/[0.10]'}`}
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
                        <div className="flex-1 flex items-center gap-2.5 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm rounded-2xl px-3 py-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                                <ArrowUpRight size={15} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">{t('stats_income')}</p>
                                <p className="text-[13px] font-black text-gray-900 dark:text-white truncate tabular-nums">
                                    <Amount value={totalIncome} />
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center gap-2.5 bg-white/60 dark:bg-white/[0.05] backdrop-blur-sm rounded-2xl px-3 py-2.5">
                            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                                <ArrowDownRight size={15} className="text-rose-600 dark:text-rose-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">{t('stats_expense')}</p>
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
                className="w-full relative overflow-hidden bg-gradient-to-br from-violet-50 to-indigo-50 dark:bg-surface-dark3 dark:from-transparent dark:to-transparent border border-violet-200/60 dark:border-violet-900/30
                           p-4 rounded-[1.75rem]
                           shadow-sm hover:shadow-md
                           flex items-center gap-3.5 group transition-all duration-300"
            >
                {!isPro && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center z-10 shadow-sm">
                        <Zap size={10} className="text-white" fill="currentColor" />
                    </div>
                )}
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white
                                shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                    <Bot size={20} />
                </div>
                <div className="flex-1 text-left min-w-0 pr-5">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{t('advisor_title')}</h4>
                    <p className="text-[11px] text-violet-600 dark:text-violet-300 font-semibold truncate mt-0.5">
                        {advisorLiveInsight}
                    </p>
                </div>
                {/* Gentle pulse animation for the whole card */}
                <motion.div 
                    className="absolute inset-0 rounded-[1.75rem] pointer-events-none"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    style={{ boxShadow: 'inset 0 0 15px rgba(139,92,246,0.15)' }}
                />
                <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
                    <ArrowRight size={14} />
                </div>
            </motion.button>

            {/* ── Quick Actions (pill buttons) ── */}
            <div id="tour-quick-access">
                <div className="flex items-center justify-between mb-2.5 ml-1 mr-2">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">
                        {t('quick_access')}
                    </p>
                    <ArrowRight size={12} className="text-gray-300 dark:text-gray-600 animate-pulse" />
                </div>
                <div className="grid grid-cols-4 gap-3 pb-1">
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
                                className="w-full flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-[1.25rem]
                                           bg-white dark:bg-surface-dark3
                                           border border-gray-100/80 dark:border-white/5
                                           shadow-card hover:shadow-premium
                                           hover:border-violet-200 dark:hover:border-violet-800/50
                                           transition-all duration-300 relative"
                            >
                                <ActionIcon size={22} className="text-violet-600 dark:text-violet-400 mb-0.5" />
                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-200 uppercase tracking-normal text-center leading-tight whitespace-normal break-words w-full">{action.label}</span>
                                {action.isPro && !action.userIsPro && (
                                    <Zap size={10} className="text-amber-400 flex-shrink-0" fill="currentColor" />
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
