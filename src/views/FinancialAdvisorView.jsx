import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
    TrendingUp, TrendingDown, ShieldCheck, Zap, Info, Target, ChevronRight,
    ChevronLeft, ArrowLeft, Lightbulb, CheckCircle2, Trophy, Flame, Coffee,
    Wallet, AlertTriangle, Star, Award, Sparkles, Clock, PieChart as PieIcon,
    Calendar, ArrowUpRight
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import useIsDesktop from '../hooks/useIsDesktop';
import Amount from '../components/Amount';

/* ──────────────────────────────────────────────────────────
   CATEGORY → 50-30-20 BUCKET MAP
────────────────────────────────────────────────────────── */
const CATEGORY_MAP = {
    bills: 'needs', home: 'needs', supermarket: 'needs', health: 'needs',
    transport: 'needs', education: 'needs',
    food: 'wants', coffee: 'wants', entertainment: 'wants',
    shopping: 'wants', travel: 'wants', hobbies: 'wants',
    investments: 'savings', savings: 'savings', debt: 'savings',
    // Greek
    'λογαριασμοί': 'needs', 'σπίτι': 'needs', 'σούπερ μάρκετ': 'needs',
    'υγεια': 'needs', 'μεταφορικα': 'needs', 'εκπαιδευση': 'needs',
    'φαγητό': 'wants', 'καφές': 'wants', 'διασκέδαση': 'wants',
    'αγορές': 'wants', 'ταξίδια': 'wants', 'χόμπι': 'wants',
    'επενδύσεις': 'savings', 'αποταμίευση': 'savings', 'χρέη': 'savings',
};

/* ──────────────────────────────────────────────────────────
   ANIMATED GAUGE RING
────────────────────────────────────────────────────────── */
const GaugeRing = ({ score, size = 140, stroke = 10 }) => {
    const radius = (size - stroke * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (Math.min(100, Math.max(0, score)) / 100) * circumference;

    const color = score >= 80 ? '#10b981' : score >= 60 ? '#8b5cf6' : score >= 40 ? '#f59e0b' : '#ef4444';

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
            {/* Track */}
            <circle
                cx={size / 2} cy={size / 2} r={radius}
                fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke}
            />
            {/* Progress */}
            <circle
                cx={size / 2} cy={size / 2} r={radius}
                fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={`${progress} ${circumference}`}
                strokeLinecap="round"
                style={{
                    transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)',
                    filter: `drop-shadow(0 0 8px ${color}99)`
                }}
            />
        </svg>
    );
};

/* ──────────────────────────────────────────────────────────
   INSIGHT CARD (inside swipeable carousel)
────────────────────────────────────────────────────────── */
const InsightCard = ({ text, index, total }) => {
    const gradients = [
        'from-violet-600 via-indigo-600 to-purple-700',
        'from-indigo-600 via-violet-600 to-fuchsia-700',
        'from-purple-700 via-indigo-600 to-violet-800',
    ];
    return (
        <div className={`relative overflow-hidden w-full bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl p-5 text-white shadow-md`}>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                    <Sparkles size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-widest font-black text-white/75 mb-1">
                        AI Insight #{index + 1}
                    </p>
                    <p className="text-sm font-semibold leading-relaxed text-white">
                        {text}
                    </p>
                </div>
            </div>
            <div className="flex gap-1.5 mt-4 justify-end">
                {Array.from({ length: total }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/30'}`}
                    />
                ))}
            </div>
        </div>
    );
};

/* ──────────────────────────────────────────────────────────
   CUSTOM DONUT TOOLTIP
────────────────────────────────────────────────────────── */
const CustomDonutTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
            <div className="bg-white dark:bg-surface-dark3 shadow-xl rounded-2xl px-4 py-2.5 border border-gray-100 dark:border-white/10 text-xs z-50">
                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    {d.name}
                </p>
                <p className="text-gray-500 dark:text-gray-400 font-semibold mt-0.5">{Math.round(d.value)}%</p>
            </div>
        );
    }
    return null;
};

/* ──────────────────────────────────────────────────────────
   MOBILE HEADER
────────────────────────────────────────────────────────── */
const MobileHeader = ({ onBack, hideHeader, t }) => (
    <div className={`shrink-0 transition-colors duration-300 sticky top-0 z-10
        ${hideHeader
            ? 'bg-transparent border-none px-4 pt-4 pb-2'
            : 'px-4 pt-4 pb-4 bg-white dark:bg-surface-dark2 shadow-sm border-b border-gray-100 dark:border-transparent'}`}
        style={!hideHeader ? { paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' } : {}}
    >
        <div className="flex items-center justify-center min-h-[40px] relative">
            <button
                onClick={onBack}
                className="absolute left-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.08]
                           flex items-center justify-center text-gray-500 dark:text-white/50
                           hover:bg-gray-200 dark:hover:bg-white/[0.14] active:scale-90 transition-all duration-150"
            >
                <ArrowLeft size={15} strokeWidth={2.5} />
            </button>
            {!hideHeader && (
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none">{t('advisor_title')}</h2>
                    <p className="text-xs text-gray-400 mt-1">{t('advisor_subtitle')}</p>
                </div>
            )}
        </div>
    </div>
);

/* ══════════════════════════════════════════════════════════
   MAIN FINANCIAL ADVISOR VIEW
══════════════════════════════════════════════════════════ */
const FinancialAdvisorView = ({ transactions = [], goals = [], onBack, hideHeader }) => {
    const { t } = useSettings();
    const isDesktop = useIsDesktop();
    const [activeInsight, setActiveInsight] = useState(0);
    const [activePieSlice, setActivePieSlice] = useState(null);
    const [completedChallenges, setCompletedChallenges] = useState(() => {
        try { return JSON.parse(localStorage.getItem('sw_challenges') || '{}'); }
        catch { return {}; }
    });

    /* ── 1. Core Stats ── */
    const stats = useMemo(() => {
        const now = new Date();
        const thisMonth = transactions.filter(tx => {
            const d = new Date(tx.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        const lastMonth = transactions.filter(tx => {
            const d = new Date(tx.date);
            const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
        });

        const income = thisMonth.filter(tx => tx.type === 'income').reduce((a, tx) => a + tx.amount, 0);
        const expenses = thisMonth.filter(tx => tx.type === 'expense');
        const lastExpenses = lastMonth.filter(tx => tx.type === 'expense');

        const buckets = { needs: 0, wants: 0, savings: 0, uncategorized: 0 };
        expenses.forEach(tx => {
            const bucket = CATEGORY_MAP[tx.category?.toLowerCase()] || 'uncategorized';
            buckets[bucket] += tx.amount;
        });

        const totalExp = buckets.needs + buckets.wants + buckets.savings + buckets.uncategorized;
        const unallocated = Math.max(0, income - totalExp);
        buckets.savings += unallocated;

        const total = buckets.needs + buckets.wants + buckets.savings + buckets.uncategorized || 1;

        // Last month totals
        const lastTotal = lastExpenses.reduce((a, tx) => a + tx.amount, 0);
        const thisTotal = expenses.reduce((a, tx) => a + tx.amount, 0);

        // Category sums
        const catTotals = {};
        expenses.forEach(tx => {
            const cat = tx.category || 'other';
            catTotals[cat] = (catTotals[cat] || 0) + tx.amount;
        });
        const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

        // Last month by category
        const lastCatTotals = {};
        lastExpenses.forEach(tx => {
            const cat = tx.category || 'other';
            lastCatTotals[cat] = (lastCatTotals[cat] || 0) + tx.amount;
        });

        // This week coffee
        const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
        const coffeeThisWeek = transactions
            .filter(tx => tx.type === 'expense' && (tx.category?.toLowerCase() === 'coffee' || tx.category?.toLowerCase() === 'καφές') && new Date(tx.date) >= weekStart)
            .reduce((a, tx) => a + tx.amount, 0);

        // This week vs last week total spending
        const lastWeekStart = new Date(); lastWeekStart.setDate(lastWeekStart.getDate() - 14);
        const thisWeekSpend = transactions.filter(tx => tx.type === 'expense' && new Date(tx.date) >= weekStart).reduce((a, tx) => a + tx.amount, 0);
        const lastWeekSpend = transactions.filter(tx => tx.type === 'expense' && new Date(tx.date) >= lastWeekStart && new Date(tx.date) < weekStart).reduce((a, tx) => a + tx.amount, 0);

        // Today's expenses
        const todayStr = now.toDateString();
        const todayExpenses = transactions.filter(tx => tx.type === 'expense' && new Date(tx.date).toDateString() === todayStr);

        return {
            income, total, totalExp: thisTotal,
            needs: buckets.needs, wants: buckets.wants, savings: buckets.savings,
            needsPct: (buckets.needs / total) * 100,
            wantsPct: (buckets.wants / total) * 100,
            savingsPct: (buckets.savings / total) * 100,
            topCat, catTotals,
            lastTotal, lastCatTotals,
            coffeeThisWeek,
            thisWeekSpend, lastWeekSpend,
            todayExpenses,
            hasData: transactions.length > 0,
        };
    }, [transactions]);

    /* ── 2. Wellness Score ── */
    const wellnessScore = useMemo(() => {
        let score = 70;
        if (stats.needsPct > 50) score -= (stats.needsPct - 50);
        else score += (50 - stats.needsPct) * 0.5;
        if (stats.wantsPct > 30) score -= (stats.wantsPct - 30);
        else score += (30 - stats.wantsPct) * 0.2;
        if (stats.savingsPct < 20) score -= (20 - stats.savingsPct) * 2;
        else score += (stats.savingsPct - 20) * 1;
        return Math.min(100, Math.max(0, Math.round(score)));
    }, [stats]);

    /* ── 3. Previous month wellness score estimate ── */
    const prevMonthScore = useMemo(() => {
        const now = new Date();
        const lastMonth = transactions.filter(tx => {
            const d = new Date(tx.date);
            const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
        });
        if (!lastMonth.length) return null;
        const income = lastMonth.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
        const buckets = { needs: 0, wants: 0, savings: 0, uncategorized: 0 };
        lastMonth.filter(t => t.type === 'expense').forEach(t => {
            const b = CATEGORY_MAP[t.category?.toLowerCase()] || 'uncategorized';
            buckets[b] += t.amount;
        });
        const totalExp = buckets.needs + buckets.wants + buckets.savings + buckets.uncategorized;
        const unallocated = Math.max(0, income - totalExp);
        buckets.savings += unallocated;
        const total = buckets.needs + buckets.wants + buckets.savings + buckets.uncategorized || 1;
        const nPct = (buckets.needs / total) * 100;
        const wPct = (buckets.wants / total) * 100;
        const sPct = (buckets.savings / total) * 100;
        let score = 70;
        if (nPct > 50) score -= (nPct - 50); else score += (50 - nPct) * 0.5;
        if (wPct > 30) score -= (wPct - 30); else score += (30 - wPct) * 0.2;
        if (sPct < 20) score -= (20 - sPct) * 2; else score += (sPct - 20);
        return Math.min(100, Math.max(0, Math.round(score)));
    }, [transactions]);

    const scoreTrend = prevMonthScore !== null ? wellnessScore - prevMonthScore : 0;

    /* ── 4. Score labels ── */
    const getScoreLabel = (s) => {
        if (s >= 85) return t('score_label_pro');
        if (s >= 70) return t('score_label_great');
        if (s >= 55) return t('score_label_good');
        if (s >= 35) return t('score_label_building');
        return t('score_label_starter');
    };

    /* ── 5. Daily Insights ── */
    const insights = useMemo(() => {
        if (!stats.hasData) return [t('insight_no_data')];
        const list = [];
        if (stats.todayExpenses.length === 0) list.push(t('insight_no_expenses_today'));
        if (stats.coffeeThisWeek > 0) list.push(t('insight_coffee_up').replace('{amount}', stats.coffeeThisWeek.toFixed(0)));
        if (stats.topCat) list.push(t('insight_top_category').replace('{category}', stats.topCat[0]));
        if (stats.lastWeekSpend > 0 && stats.thisWeekSpend > 0) {
            const pct = Math.round(Math.abs((stats.thisWeekSpend - stats.lastWeekSpend) / stats.lastWeekSpend) * 100);
            if (stats.thisWeekSpend < stats.lastWeekSpend) list.push(t('insight_spending_down').replace('{pct}', pct));
            else if (pct > 10) list.push(t('insight_spending_up').replace('{pct}', pct));
        }
        if (stats.savingsPct > 20) list.push(t('insight_savings_improved').replace('{pct}', Math.round(stats.savingsPct - 20)));
        if (list.length === 0) list.push(t('insight_good_pace'));
        return list.slice(0, 3);
    }, [stats, t]);

    /* ── 6. 50/30/20 Breakdown & Donut data ── */
    const DONUT_COLORS = ['#7c3aed', '#ec4899', '#10b981', '#9CA3AF'];
    const breakdownCategories = useMemo(() => [
        {
            key: 'needs',
            label: t('needs_label'),
            pct: stats.needsPct,
            target: 50,
            targetRate: 0.5,
            amt: stats.needs,
            color: DONUT_COLORS[0],
            isSavings: false,
        },
        {
            key: 'wants',
            label: t('wants_label'),
            pct: stats.wantsPct,
            target: 30,
            targetRate: 0.3,
            amt: stats.wants,
            color: DONUT_COLORS[1],
            isSavings: false,
        },
        {
            key: 'savings',
            label: t('savings_label'),
            pct: stats.savingsPct,
            target: 20,
            targetRate: 0.2,
            amt: stats.savings,
            color: DONUT_COLORS[2],
            isSavings: true,
        },
    ], [stats, t]);

    const donutData = useMemo(() => {
        const activeItems = breakdownCategories
            .filter(d => d.pct > 0)
            .map(d => ({
                key: d.key,
                name: d.label,
                value: d.pct,
                target: d.target,
                color: d.color,
                amount: d.amt,
                isSavings: d.isSavings,
                targetRate: d.targetRate,
            }));
        return activeItems.length ? activeItems : [{ key: 'empty', name: t('breakdown_no_expenses'), value: 100, color: '#E5E7EB', amount: 0, target: 0, isSavings: false, targetRate: 0 }];
    }, [breakdownCategories, t]);

    const selectedCategory = useMemo(() => {
        if (!activePieSlice) return null;
        return breakdownCategories.find(c => c.key === activePieSlice) || null;
    }, [activePieSlice, breakdownCategories]);

    /* ── 7. Challenges ── */
    const weekKey = useMemo(() => {
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        return `${monday.getFullYear()}-W${monday.getMonth()}-${monday.getDate()}`;
    }, []);

    const daysLeftInWeek = 7 - ((new Date().getDay() + 6) % 7);

    const challenges = useMemo(() => [
        {
            id: 'no_spend', icon: Trophy, color: 'bg-amber-500', light: 'bg-amber-50/80 dark:bg-amber-950/20',
            border: 'border-amber-200/60 dark:border-amber-900/40', textColor: 'text-amber-700 dark:text-amber-400',
            title: t('challenge_no_spend_title'), desc: t('challenge_no_spend_desc'),
            progress: stats.todayExpenses.length === 0 ? 100 : 0,
        },
        {
            id: 'coffee', icon: Coffee, color: 'bg-orange-500', light: 'bg-orange-50/80 dark:bg-orange-950/20',
            border: 'border-orange-200/60 dark:border-orange-900/40', textColor: 'text-orange-700 dark:text-orange-400',
            title: t('challenge_coffee_title'), desc: t('challenge_coffee_desc'),
            progress: Math.min(100, Math.max(0, 100 - (stats.coffeeThisWeek / 15) * 100)),
        },
        {
            id: 'savings', icon: Target, color: 'bg-emerald-500', light: 'bg-emerald-50/80 dark:bg-emerald-950/20',
            border: 'border-emerald-200/60 dark:border-emerald-900/40', textColor: 'text-emerald-700 dark:text-emerald-400',
            title: t('challenge_savings_title'), desc: t('challenge_savings_desc'),
            progress: Math.min(100, (stats.savings / 50) * 100),
        },
    ], [stats, t]);

    const toggleChallenge = useCallback((id) => {
        setCompletedChallenges(prev => {
            const key = `${weekKey}_${id}`;
            const updated = { ...prev, [key]: !prev[key] };
            try { localStorage.setItem('sw_challenges', JSON.stringify(updated)); } catch {}
            return updated;
        });
    }, [weekKey]);

    const isChallengeCompleted = (id) => !!completedChallenges[`${weekKey}_${id}`];

    /* ── 8. Personalized tips ── */
    const tips = useMemo(() => {
        const list = [];
        if (stats.coffeeThisWeek > 10)
            list.push({ icon: Coffee, text: t('tip_coffee_budget'), action: t('tip_action_set_budget'), color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50/80 dark:bg-orange-950/20' });
        if (stats.savingsPct < 5)
            list.push({ icon: Target, text: t('tip_emergency_fund_action'), action: t('tip_action_create_goal'), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/80 dark:bg-emerald-950/20' });
        if (stats.wantsPct > 30)
            list.push({ icon: AlertTriangle, text: t('tip_wants_high_action').replace('{pct}', Math.round(stats.wantsPct)), action: t('tip_action_review_now'), color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/80 dark:bg-rose-950/20' });
        if (stats.savingsPct > 25)
            list.push({ icon: TrendingUp, text: t('tip_great_savings'), action: t('tip_action_see_details'), color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50/80 dark:bg-violet-950/20' });
        list.push({ icon: Zap, text: t('tip_subscriptions'), action: t('tip_action_review_now'), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/80 dark:bg-amber-950/20' });
        return list.slice(0, 3);
    }, [stats, t]);

    /* ── 9. Monthly progress ── */
    const monthlyProgress = useMemo(() => {
        if (!stats.lastTotal) return null;
        const thisTotal = stats.totalExp;
        const diff = thisTotal - stats.lastTotal;
        const pct = stats.lastTotal > 0 ? Math.abs(Math.round((diff / stats.lastTotal) * 100)) : 0;
        const improved = diff < 0;

        let bestCat = null, bestDiff = 0;
        Object.entries(stats.catTotals).forEach(([cat, amt]) => {
            const lastAmt = stats.lastCatTotals[cat] || 0;
            const d = lastAmt - amt;
            if (d > bestDiff) { bestDiff = d; bestCat = cat; }
        });
        let worstCat = null, worstDiff = 0;
        Object.entries(stats.catTotals).forEach(([cat, amt]) => {
            const lastAmt = stats.lastCatTotals[cat] || 0;
            const d = amt - lastAmt;
            if (d > worstDiff) { worstDiff = d; worstCat = cat; }
        });

        return { improved, pct, bestCat, worstCat };
    }, [stats]);

    /* ── 10. Insight carousel navigation ── */
    const nextInsight = () => setActiveInsight(i => (i + 1) % insights.length);
    const prevInsight = () => setActiveInsight(i => (i - 1 + insights.length) % insights.length);

    /* ── Empty State ── */
    if (!stats.hasData) {
        return (
            <div className="flex flex-col h-full bg-gray-50 dark:bg-surface-dark animate-fade-in">
                {!isDesktop && <MobileHeader onBack={onBack} hideHeader={hideHeader} t={t} />}
                <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6 max-w-lg mx-auto">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                        <Lightbulb size={44} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 font-display">{t('advisor_empty_title')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('advisor_empty_desc')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-surface-dark overflow-y-auto custom-scrollbar">
            {/* Mobile Header */}
            {!isDesktop && <MobileHeader onBack={onBack} hideHeader={hideHeader} t={t} />}

            <div className={`flex-1 ${isDesktop ? 'max-w-[1400px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6 pb-16' : 'px-4 py-4 space-y-5 pb-28'}`}>

                {/* ── Desktop Executive Header ── */}
                {isDesktop && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1"
                    >
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-bold text-xs border border-violet-200/50 dark:border-violet-900/40 mb-2">
                                <Sparkles size={13} className="shrink-0" />
                                <span>{t('advisor_header_badge') || 'AI Financial Intelligence'}</span>
                                <span className="text-violet-300 dark:text-violet-700">•</span>
                                <span className="uppercase text-[10px] tracking-wider text-violet-600 dark:text-violet-400 font-black">Pro</span>
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">
                                {t('advisor_title')}
                            </h1>
                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
                                {t('advisor_header_desc') || 'Real-time financial wellness scoring, 50/30/20 budget analysis, and tailored habits.'}
                            </p>
                        </div>

                        {/* Executive Status Pills */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-surface-dark3 border border-gray-100 dark:border-white/5 shadow-sm">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-500 shrink-0">
                                    <ShieldCheck size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Wellness Score</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{wellnessScore} <span className="text-xs text-gray-400 font-medium">/ 100</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-surface-dark3 border border-gray-100 dark:border-white/5 shadow-sm">
                                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-500 shrink-0">
                                    <Target size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Savings Rate</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white leading-tight">{Math.round(stats.savingsPct)}%</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Main Bento Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* ════════════ LEFT COLUMN (7 cols) ════════════ */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* ─── SECTION B: Wellness Score Hero Card ─── */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 rounded-[2.25rem] p-6 lg:p-7 text-white shadow-xl shadow-violet-500/20 border border-white/15 relative overflow-hidden flex flex-col justify-between"
                        >
                            {/* Decorative ambient glowing blobs */}
                            <div className="absolute -top-16 -right-16 w-52 h-52 bg-white/10 blur-[50px] rounded-full pointer-events-none" />
                            <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-indigo-400/20 blur-[50px] rounded-full pointer-events-none" />

                            <div className="relative z-10">
                                {/* Top Header within Hero */}
                                <div className="flex items-center justify-between gap-2 mb-4">
                                    <div>
                                        <p className="text-violet-200 text-[10px] font-black uppercase tracking-[0.18em]">
                                            {t('wellness_score')}
                                        </p>
                                        <h2 className="text-2xl lg:text-3xl font-black font-display tracking-tight text-white mt-0.5">
                                            {getScoreLabel(wellnessScore)}
                                        </h2>
                                    </div>
                                    {prevMonthScore !== null && (
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black backdrop-blur-md border ${
                                            scoreTrend > 0
                                                ? 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30'
                                                : scoreTrend < 0
                                                    ? 'bg-rose-400/25 text-rose-100 border-rose-400/30'
                                                    : 'bg-white/10 text-violet-200 border-white/10'
                                        }`}>
                                            {scoreTrend > 0 ? <TrendingUp size={13} className="shrink-0" /> : scoreTrend < 0 ? <TrendingDown size={13} className="shrink-0" /> : null}
                                            <span>
                                                {scoreTrend > 0
                                                    ? t('score_trend_up').replace('{pts}', scoreTrend)
                                                    : scoreTrend < 0
                                                        ? t('score_trend_down').replace('{pts}', Math.abs(scoreTrend))
                                                        : t('score_trend_same')
                                                }
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Core Gauge & Diagnostic Matrix */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 mt-4">
                                    {/* Gauge ring */}
                                    <div className="relative shrink-0 w-[140px] h-[140px] flex items-center justify-center">
                                        <GaugeRing score={wellnessScore} />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black font-display leading-none text-white tracking-tight">
                                                {wellnessScore}
                                            </span>
                                            <span className="text-[10px] text-violet-200 font-bold uppercase tracking-wider mt-0.5">
                                                / 100
                                            </span>
                                        </div>
                                    </div>

                                    {/* Health Diagnostic Details */}
                                    <div className="flex-1 flex flex-col justify-between space-y-3 w-full">
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 text-xs text-white/95 leading-relaxed font-medium">
                                            {wellnessScore >= 80 ? (
                                                t('advisor_good_job')
                                            ) : stats.needsPct > 50 ? (
                                                t('advisor_needs_high')
                                            ) : stats.wantsPct > 30 ? (
                                                t('advisor_wants_high')
                                            ) : (
                                                t('advisor_savings_low')
                                            )}
                                        </div>

                                        {/* Diagnostic Factor Badges */}
                                        <div className="flex flex-wrap gap-2">
                                            {stats.savingsPct >= 20 ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full text-[11px] font-bold">
                                                    <CheckCircle2 size={13} className="shrink-0 text-emerald-300" />
                                                    {t('score_positive_factor')} ({Math.round(stats.savingsPct)}%)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-200 border border-rose-400/30 rounded-full text-[11px] font-bold">
                                                    <AlertTriangle size={13} className="shrink-0 text-rose-300" />
                                                    {t('advisor_savings_low').slice(0, 24)}...
                                                </span>
                                            )}

                                            {stats.needsPct <= 50 ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full text-[11px] font-bold">
                                                    <CheckCircle2 size={13} className="shrink-0 text-emerald-300" />
                                                    {t('needs_label')} {t('breakdown_on_track')} ({Math.round(stats.needsPct)}%)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-200 border border-rose-400/30 rounded-full text-[11px] font-bold">
                                                    <AlertTriangle size={13} className="shrink-0 text-rose-300" />
                                                    {t('needs_label')} {t('breakdown_over_target')} ({Math.round(stats.needsPct)}%)
                                                </span>
                                            )}

                                            {stats.wantsPct > 30 && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 text-rose-200 border border-rose-400/30 rounded-full text-[11px] font-bold">
                                                    <AlertTriangle size={13} className="shrink-0 text-rose-300" />
                                                    {t('score_negative_factor')} ({Math.round(stats.wantsPct)}%)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* ─── SECTION C: Spending Breakdown (50/30/20 Rule) ─── */}
                        <div className="bg-white dark:bg-surface-dark3 rounded-[2.25rem] p-6 lg:p-7 shadow-card border border-gray-100/80 dark:border-white/5">
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/30">
                                        <TrendingUp size={18} />
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
                                            {t('spending_breakdown_title')}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">
                                            {t('rule_50_30_20')} • 50% {t('needs_label')}, 30% {t('wants_label')}, 20% {t('savings_label')}
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 text-[11px] font-medium self-start sm:self-auto">
                                    <Info size={12} className="shrink-0" />
                                    {t('breakdown_tap_hint')}
                                </span>
                            </div>

                            {/* Donut Chart + Breakdown Rows */}
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                {/* Donut graphic */}
                                <div className="relative w-[150px] h-[150px] shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={donutData}
                                                cx="50%" cy="50%"
                                                innerRadius={46} outerRadius={68}
                                                dataKey="value"
                                                stroke="none"
                                                paddingAngle={3}
                                                onClick={(entry, idx) => {
                                                    const item = entry?.key ? entry : (donutData[idx] || entry?.payload);
                                                    const key = item?.key;
                                                    if (key && key !== 'empty') {
                                                        setActivePieSlice(activePieSlice === key ? null : key);
                                                    }
                                                }}
                                            >
                                                {donutData.map((entry) => (
                                                    <Cell
                                                        key={entry.key || entry.name}
                                                        fill={entry.color}
                                                        opacity={activePieSlice === null || activePieSlice === entry.key ? 1 : 0.3}
                                                        style={{ cursor: entry.key !== 'empty' ? 'pointer' : 'default', transition: 'opacity 0.2s' }}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomDonutTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        {selectedCategory ? (
                                            <>
                                                <span className="text-sm font-black text-gray-900 dark:text-white leading-tight font-display">
                                                    {Math.round(selectedCategory.pct)}%
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    {selectedCategory.label}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xs font-black text-gray-900 dark:text-white leading-tight font-display">
                                                    50/30/20
                                                </span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                                    {t('rule_50_30_20')}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Category Rows */}
                                <div className="flex-1 w-full space-y-3">
                                    {breakdownCategories.map(item => {
                                        const isGood = item.isSavings ? item.pct >= item.target : item.pct <= item.target;
                                        const isSelected = activePieSlice === item.key;
                                        return (
                                            <button
                                                key={item.key}
                                                onClick={() => setActivePieSlice(activePieSlice === item.key ? null : item.key)}
                                                className={`w-full text-left transition-all duration-200 rounded-2xl p-3 border ${
                                                    isSelected
                                                        ? 'bg-violet-50/70 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900/50 shadow-sm'
                                                        : 'bg-gray-50/70 dark:bg-white/[0.03] border-transparent hover:bg-gray-100/80 dark:hover:bg-white/[0.06]'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{item.label}</span>
                                                        <span className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold shrink-0">
                                                            (<Amount value={item.amt} />)
                                                        </span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1 text-right shrink-0">
                                                        <span className={`text-xs font-black ${isGood ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {Math.round(item.pct)}%
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-medium">
                                                            / {item.target}%
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Progress track */}
                                                <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-1000"
                                                        style={{ width: `${Math.min(100, item.pct)}%`, backgroundColor: item.color }}
                                                    />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Drilldown Drawer on Tap */}
                            <AnimatePresence>
                                {selectedCategory && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-5 p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/10 grid grid-cols-3 gap-3 text-center sm:text-left">
                                            <div>
                                                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                                                    {selectedCategory.isSavings ? (t('allocation_amount_saved') || 'Saved') : t('allocation_amount_spent')}
                                                </p>
                                                <p className="text-base font-black text-gray-900 dark:text-white mt-0.5">
                                                    <Amount value={selectedCategory.amt} />
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                                                    {t('target_allocation') || 'Target Budget'}
                                                </p>
                                                <p className="text-base font-black text-gray-900 dark:text-white mt-0.5">
                                                    <Amount value={(stats.income > 0 ? stats.income : stats.total) * selectedCategory.targetRate} />
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                                                    Status
                                                </p>
                                                {(() => {
                                                    const isGood = selectedCategory.isSavings
                                                        ? selectedCategory.pct >= selectedCategory.target
                                                        : selectedCategory.pct <= selectedCategory.target;
                                                    const statusText = selectedCategory.isSavings
                                                        ? (selectedCategory.pct >= selectedCategory.target
                                                            ? `↑ ${t('breakdown_over_target') || 'Over Target'}`
                                                            : `↓ ${t('breakdown_under_target') || 'Under Target'}`)
                                                        : (selectedCategory.pct <= selectedCategory.target
                                                            ? (t('breakdown_on_track') || 'On Track')
                                                            : `↑ ${t('breakdown_over_target') || 'Over Target'}`);
                                                    return (
                                                        <span className={`text-xs font-black mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${
                                                            isGood
                                                                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                                                        }`}>
                                                            {statusText}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ─── SECTION F: Monthly Progress (Month-over-Month) ─── */}
                        <div className="bg-white dark:bg-surface-dark3 rounded-[2.25rem] p-6 lg:p-7 shadow-card border border-gray-100/80 dark:border-white/5">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/30">
                                    <Award size={18} />
                                </span>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                        {t('monthly_progress_title')}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-medium">
                                        {t('breakdown_vs_last_month')}
                                    </p>
                                </div>
                            </div>

                            {!monthlyProgress ? (
                                <div className="py-6 text-center text-gray-400 dark:text-gray-500 text-xs font-medium bg-gray-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                    {t('monthly_no_history')}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Overall trend banner */}
                                    <div className={`flex items-center justify-between p-4 rounded-2xl ${
                                        monthlyProgress.improved
                                            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30'
                                            : 'bg-rose-50/80 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
                                                monthlyProgress.improved ? 'bg-emerald-500' : 'bg-rose-500'
                                            }`}>
                                                {monthlyProgress.improved ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                    {monthlyProgress.improved ? t('monthly_improved') : t('monthly_increased')}
                                                </p>
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                                    {t('breakdown_vs_last_month')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xl font-black font-display ${
                                            monthlyProgress.improved ? 'text-emerald-500' : 'text-rose-500'
                                        }`}>
                                            {monthlyProgress.improved ? '-' : '+'}{monthlyProgress.pct}%
                                        </span>
                                    </div>

                                    {/* Best & Watch-out categories */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {monthlyProgress.bestCat && (
                                            <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4">
                                                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                                    {t('monthly_best_category')}
                                                </p>
                                                <p className="text-sm font-black text-gray-900 dark:text-white mt-1 capitalize truncate">
                                                    {monthlyProgress.bestCat}
                                                </p>
                                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                                                    ↓ {t('monthly_improved')}
                                                </p>
                                            </div>
                                        )}
                                        {monthlyProgress.worstCat && (
                                            <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-4">
                                                <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                                                    {t('monthly_watch_out')}
                                                </p>
                                                <p className="text-sm font-black text-gray-900 dark:text-white mt-1 capitalize truncate">
                                                    {monthlyProgress.worstCat}
                                                </p>
                                                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                                                    ↑ {t('monthly_increased')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* ════════════ RIGHT COLUMN (5 cols) ════════════ */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* ─── SECTION A: Daily Insights Carousel ─── */}
                        <div className="bg-white dark:bg-surface-dark3 rounded-[2.25rem] p-6 lg:p-7 shadow-card border border-gray-100/80 dark:border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-100 dark:border-violet-900/30">
                                        <Lightbulb size={18} />
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                            {t('daily_insights_title')}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium">
                                            AI-powered financial feed
                                        </p>
                                    </div>
                                </div>
                                {insights.length > 1 && (
                                    <div className="flex gap-1.5">
                                        <button
                                            onClick={prevInsight}
                                            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-white/60 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
                                            aria-label="Previous insight"
                                        >
                                            <ChevronLeft size={15} />
                                        </button>
                                        <button
                                            onClick={nextInsight}
                                            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-white/60 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
                                            aria-label="Next insight"
                                        >
                                            <ChevronRight size={15} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="overflow-hidden">
                                <div
                                    className="flex transition-transform duration-500 ease-in-out"
                                    style={{ transform: `translateX(-${activeInsight * 100}%)` }}
                                >
                                    {insights.map((insight, i) => (
                                        <InsightCard key={i} text={insight} index={i} total={insights.length} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ─── SECTION D: Weekly Challenges ─── */}
                        <div className="bg-white dark:bg-surface-dark3 rounded-[2.25rem] p-6 lg:p-7 shadow-card border border-gray-100/80 dark:border-white/5">
                            <div className="flex items-center justify-between gap-2 mb-5">
                                <div className="flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/30">
                                        <Flame size={18} />
                                    </span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                            {t('challenges_title')}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium">
                                            Weekly habit builder
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-200/50 dark:border-amber-900/30">
                                    <Clock size={12} className="shrink-0" />
                                    {t('challenge_days_left').replace('{days}', daysLeftInWeek)}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {challenges.map((ch) => {
                                    const done = isChallengeCompleted(ch.id);
                                    const Icon = ch.icon;
                                    return (
                                        <div
                                            key={ch.id}
                                            className={`rounded-2xl border p-4 transition-all duration-300 ${ch.light} ${ch.border} ${done ? 'opacity-75' : ''}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-9 h-9 rounded-xl ${ch.color} flex items-center justify-center shrink-0 shadow-sm text-white`}>
                                                    <Icon size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h4 className={`text-sm font-bold ${ch.textColor} ${done ? 'line-through' : ''}`}>
                                                            {ch.title}
                                                        </h4>
                                                        {done && (
                                                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-black">
                                                                <CheckCircle2 size={13} className="shrink-0" />
                                                                {t('challenge_completed').replace(' 🎉', '')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {ch.desc}
                                                    </p>
                                                    {/* Progress bar */}
                                                    <div className="mt-3 w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${ch.color}`}
                                                            style={{ width: `${done ? 100 : Math.round(ch.progress)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className={`text-[11px] font-bold ${ch.textColor}`}>
                                                            {done ? '100%' : `${Math.round(ch.progress)}%`}
                                                        </span>
                                                        <button
                                                            onClick={() => toggleChallenge(ch.id)}
                                                            className={`text-xs font-bold ${ch.textColor} hover:underline transition-all flex items-center gap-1`}
                                                        >
                                                            {done ? t('challenge_completed').replace(' 🎉', '') : t('challenge_complete_btn')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ─── SECTION E: Personalized Tips ─── */}
                        <div className="bg-white dark:bg-surface-dark3 rounded-[2.25rem] p-6 lg:p-7 shadow-card border border-gray-100/80 dark:border-white/5">
                            <div className="flex items-center gap-3 mb-5">
                                <span className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-100 dark:border-violet-900/30">
                                    <Zap size={18} />
                                </span>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                                        {t('tips_personalized_title')}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-medium">
                                        Tailored financial recommendations
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {tips.map((tip, i) => {
                                    const Icon = tip.icon;
                                    return (
                                        <div
                                            key={i}
                                            className={`${tip.bg} border border-transparent rounded-2xl p-4 flex items-center gap-3.5 transition-all hover:scale-[1.01]`}
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-white dark:bg-black/20 flex items-center justify-center shrink-0 shadow-sm">
                                                <Icon size={16} className={tip.color} />
                                            </div>
                                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1 leading-relaxed">
                                                {tip.text}
                                            </p>
                                            <button className={`text-xs font-bold ${tip.color} shrink-0 hover:underline flex items-center gap-1`}>
                                                {tip.action}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default FinancialAdvisorView;
