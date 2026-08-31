import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
    TrendingUp, ShieldCheck, Zap, Info, Target, ChevronRight, ArrowLeft,
    Lightbulb, CheckCircle2, Trophy, Flame, Coffee, Wallet, TrendingDown,
    AlertTriangle, Star, Award, RefreshCw, ChevronLeft, Sparkles
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import { useSettings } from '../contexts/SettingsContext';

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
const GaugeRing = ({ score }) => {
    const radius = 56;
    const stroke = 10;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    const color = score >= 80 ? '#10b981' : score >= 60 ? '#7c3aed' : score >= 40 ? '#f59e0b' : '#ef4444';

    return (
        <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
            {/* Track */}
            <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
            {/* Progress */}
            <circle
                cx="70" cy="70" r={radius} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={`${progress} ${circumference}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 6px ${color}88)` }}
            />
        </svg>
    );
};

/* ──────────────────────────────────────────────────────────
   INSIGHT CARD (inside swipeable carousel)
────────────────────────────────────────────────────────── */
const InsightCard = ({ text, index, total }) => {
    const gradients = [
        'from-violet-600 to-indigo-600',
        'from-emerald-500 to-teal-600',
        'from-rose-500 to-pink-600',
    ];
    return (
        <div className={`flex-shrink-0 w-full bg-gradient-to-br ${gradients[index % gradients.length]} rounded-2xl p-4 text-white`}>
            <p className="text-sm font-semibold leading-relaxed">{text}</p>
            <div className="flex gap-1.5 mt-3">
                {Array.from({ length: total }).map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/30'}`} />
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
            <div className="bg-white dark:bg-surface-dark3 shadow-xl rounded-2xl px-4 py-3 border border-gray-100 dark:border-white/10 text-sm">
                <p className="font-bold text-gray-900 dark:text-white">{d.name}</p>
                <p className="text-gray-500 dark:text-gray-400">{Math.round(d.value)}%</p>
            </div>
        );
    }
    return null;
};

/* ══════════════════════════════════════════════════════════
   MAIN VIEW
══════════════════════════════════════════════════════════ */
const FinancialAdvisorView = ({ transactions, goals = [], onBack, hideHeader }) => {
    const { t } = useSettings();
    const [activeInsight, setActiveInsight] = useState(0);
    const [activePieSlice, setActivePieSlice] = useState(null);
    const [completedChallenges, setCompletedChallenges] = useState(() => {
        try { return JSON.parse(localStorage.getItem('sw_challenges') || '{}'); }
        catch { return {}; }
    });
    const insightRef = useRef(null);

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

    /* ── 6. Donut chart data ── */
    const DONUT_COLORS = ['#7c3aed', '#ec4899', '#10b981', '#9CA3AF'];
    const donutData = useMemo(() => {
        const items = [
            { name: t('needs_label'), value: stats.needsPct, target: 50, color: DONUT_COLORS[0], amount: stats.needs },
            { name: t('wants_label'), value: stats.wantsPct, target: 30, color: DONUT_COLORS[1], amount: stats.wants },
            { name: t('savings_label'), value: stats.savingsPct, target: 20, color: DONUT_COLORS[2], amount: stats.savings },
        ].filter(d => d.value > 0);
        return items.length ? items : [{ name: t('breakdown_no_expenses'), value: 100, color: '#E5E7EB', amount: 0 }];
    }, [stats, t]);

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
            id: 'no_spend', icon: Trophy, color: 'bg-amber-500', light: 'bg-amber-50 dark:bg-amber-900/20',
            border: 'border-amber-100 dark:border-amber-900/30', textColor: 'text-amber-600 dark:text-amber-400',
            title: t('challenge_no_spend_title'), desc: t('challenge_no_spend_desc'),
            progress: stats.todayExpenses.length === 0 ? 100 : 0,
        },
        {
            id: 'coffee', icon: Coffee, color: 'bg-orange-500', light: 'bg-orange-50 dark:bg-orange-900/20',
            border: 'border-orange-100 dark:border-orange-900/30', textColor: 'text-orange-600 dark:text-orange-400',
            title: t('challenge_coffee_title'), desc: t('challenge_coffee_desc'),
            progress: Math.min(100, Math.max(0, 100 - (stats.coffeeThisWeek / 15) * 100)),
        },
        {
            id: 'savings', icon: Target, color: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-900/20',
            border: 'border-emerald-100 dark:border-emerald-900/30', textColor: 'text-emerald-600 dark:text-emerald-400',
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
            list.push({ icon: Coffee, text: t('tip_coffee_budget'), action: t('tip_action_set_budget'), color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' });
        if (stats.savingsPct < 5)
            list.push({ icon: Target, text: t('tip_emergency_fund_action'), action: t('tip_action_create_goal'), color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' });
        if (stats.wantsPct > 30)
            list.push({ icon: AlertTriangle, text: t('tip_wants_high_action').replace('{pct}', Math.round(stats.wantsPct)), action: t('tip_action_review_now'), color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' });
        if (stats.savingsPct > 25)
            list.push({ icon: TrendingUp, text: t('tip_great_savings'), action: t('tip_action_see_details'), color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' });
        list.push({ icon: Zap, text: t('tip_subscriptions'), action: t('tip_action_review_now'), color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' });
        return list.slice(0, 3);
    }, [stats, t]);

    /* ── 9. Monthly progress ── */
    const monthlyProgress = useMemo(() => {
        if (!stats.lastTotal) return null;
        const thisTotal = stats.totalExp;
        const diff = thisTotal - stats.lastTotal;
        const pct = stats.lastTotal > 0 ? Math.abs(Math.round((diff / stats.lastTotal) * 100)) : 0;
        const improved = diff < 0;

        // Best improved category
        let bestCat = null, bestDiff = 0;
        Object.entries(stats.catTotals).forEach(([cat, amt]) => {
            const lastAmt = stats.lastCatTotals[cat] || 0;
            const d = lastAmt - amt;
            if (d > bestDiff) { bestDiff = d; bestCat = cat; }
        });
        // Worst increased category
        let worstCat = null, worstDiff = 0;
        Object.entries(stats.catTotals).forEach(([cat, amt]) => {
            const lastAmt = stats.lastCatTotals[cat] || 0;
            const d = amt - lastAmt;
            if (d > worstDiff) { worstDiff = d; worstCat = cat; }
        });

        return { improved, pct, bestCat, worstCat };
    }, [stats]);

    /* ── 10. Insight carousel ── */
    const nextInsight = () => setActiveInsight(i => (i + 1) % insights.length);
    const prevInsight = () => setActiveInsight(i => (i - 1 + insights.length) % insights.length);

    /* ── Empty state ── */
    if (!stats.hasData) {
        return (
            <div className="flex flex-col h-full bg-gray-50 dark:bg-surface-dark animate-fade-in">
                <Header onBack={onBack} hideHeader={hideHeader} t={t} />
                <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                        <Sparkles size={44} className="text-white" fill="currentColor" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{t('advisor_empty_title')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t('advisor_empty_desc')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-surface-dark animate-fade-in">
            <Header onBack={onBack} hideHeader={hideHeader} t={t} />

            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-28">

                {/* ─── SECTION B: Wellness Score ─── */}
                <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 rounded-3xl p-5 text-white shadow-xl shadow-violet-500/25 relative overflow-hidden">
                    {/* Decorative blur blobs */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl" />

                    <div className="relative flex items-center gap-5">
                        {/* Gauge */}
                        <div className="relative flex-shrink-0 w-[140px] h-[140px]">
                            <GaugeRing score={wellnessScore} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black leading-none">{wellnessScore}</span>
                                <span className="text-[10px] text-violet-200 font-bold uppercase tracking-wider mt-0.5">/100</span>
                            </div>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-violet-200 text-[10px] font-bold uppercase tracking-widest mb-1">{t('wellness_score')}</p>
                            <h3 className="text-xl font-black leading-tight mb-2">{getScoreLabel(wellnessScore)}</h3>
                            {/* Trend badge */}
                            {prevMonthScore !== null && (
                                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold mb-3 ${scoreTrend > 0 ? 'bg-emerald-500/20 text-emerald-300' : scoreTrend < 0 ? 'bg-rose-500/20 text-rose-300' : 'bg-white/10 text-violet-200'}`}>
                                    {scoreTrend > 0 ? <TrendingUp size={11} /> : scoreTrend < 0 ? <TrendingDown size={11} /> : null}
                                    {scoreTrend > 0
                                        ? t('score_trend_up').replace('{pts}', scoreTrend)
                                        : scoreTrend < 0
                                            ? t('score_trend_down').replace('{pts}', Math.abs(scoreTrend))
                                            : t('score_trend_same')
                                    }
                                </div>
                            )}
                            {/* Factor chips */}
                            <div className="flex flex-wrap gap-1.5">
                                {stats.savingsPct >= 20 && (
                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-bold">
                                        ✓ {t('score_positive_factor')}
                                    </span>
                                )}
                                {stats.wantsPct > 30 && (
                                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-full text-[10px] font-bold">
                                        ⚠ {t('score_negative_factor')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── SECTION A: Daily Insights ─── */}
                <SectionCard>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                            <span className="w-7 h-7 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                                <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
                            </span>
                            {t('daily_insights_title')}
                        </h3>
                        {insights.length > 1 && (
                            <div className="flex gap-1.5">
                                <button onClick={prevInsight} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-white/60 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors">
                                    <ChevronLeft size={14} />
                                </button>
                                <button onClick={nextInsight} className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-white/60 hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors">
                                    <ChevronRight size={14} />
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
                </SectionCard>

                {/* ─── SECTION C: Spending Breakdown (Donut) ─── */}
                <SectionCard>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                            <span className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                                <TrendingUp size={14} className="text-indigo-600 dark:text-indigo-400" />
                            </span>
                            {t('spending_breakdown_title')}
                        </h3>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{t('breakdown_tap_hint')}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Donut */}
                        <div className="relative w-[130px] h-[130px] flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={donutData}
                                        cx="50%" cy="50%"
                                        innerRadius={40} outerRadius={60}
                                        dataKey="value"
                                        stroke="none"
                                        paddingAngle={3}
                                        onClick={(_, idx) => setActivePieSlice(activePieSlice === idx ? null : idx)}
                                    >
                                        {donutData.map((entry, i) => (
                                            <Cell
                                                key={i}
                                                fill={entry.color}
                                                opacity={activePieSlice === null || activePieSlice === i ? 1 : 0.3}
                                                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomDonutTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                {activePieSlice !== null && donutData[activePieSlice] ? (
                                    <>
                                        <span className="text-xs font-black text-gray-900 dark:text-white">{Math.round(donutData[activePieSlice].value)}%</span>
                                        <span className="text-[9px] text-gray-400 font-medium">{donutData[activePieSlice].name}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xs font-black text-gray-900 dark:text-white">50/30/20</span>
                                        <span className="text-[9px] text-gray-400 font-medium">{t('rule_50_30_20')}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Legend / detail */}
                        <div className="flex-1 space-y-2.5">
                            {[
                                { label: t('needs_label'), pct: stats.needsPct, target: 50, amt: stats.needs, color: '#7c3aed', idx: 0 },
                                { label: t('wants_label'), pct: stats.wantsPct, target: 30, amt: stats.wants, color: '#ec4899', idx: 1 },
                                { label: t('savings_label'), pct: stats.savingsPct, target: 20, amt: stats.savings, color: '#10b981', idx: 2 },
                            ].map(item => (
                                <button
                                    key={item.label}
                                    onClick={() => setActivePieSlice(activePieSlice === item.idx ? null : item.idx)}
                                    className={`w-full text-left transition-all duration-200 rounded-xl p-2 ${activePieSlice === item.idx ? 'bg-gray-100 dark:bg-white/10 shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                            <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{item.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[11px] font-black ${item.pct > item.target ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {Math.round(item.pct)}%
                                            </span>
                                            <span className="text-[9px] text-gray-400 ml-1">/ {item.target}%</span>
                                        </div>
                                    </div>
                                    <div className="mt-1.5 w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${Math.min(100, item.pct)}%`, backgroundColor: item.color }}
                                        />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Expanded detail on tap */}
                    {activePieSlice !== null && donutData[activePieSlice] && donutData[activePieSlice].amount !== undefined && (
                        <div className="mt-4 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 animate-fade-in">
                            <div className="flex justify-between text-xs">
                                <div>
                                    <p className="text-gray-400 font-medium">{t('allocation_amount_spent')}</p>
                                    <p className="text-gray-900 dark:text-white font-black text-base">€{donutData[activePieSlice].amount?.toFixed(2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 font-medium">{t('target_label')}</p>
                                    {[{target:50},{target:30},{target:20}][activePieSlice] && (
                                        <p className="text-gray-900 dark:text-white font-black text-base">
                                            €{(stats.income * [0.5,0.3,0.2][activePieSlice]).toFixed(2)}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 font-medium">Status</p>
                                    <p className={`font-bold text-xs mt-0.5 ${
                                        activePieSlice === 2
                                            ? (Math.round(donutData[activePieSlice].value) >= 20 ? 'text-emerald-500' : 'text-rose-500')
                                            : (Math.round(donutData[activePieSlice].value) <= [50,30,20][activePieSlice] ? 'text-emerald-500' : 'text-rose-500')
                                    }`}>
                                        {activePieSlice === 2
                                            ? (Math.round(donutData[activePieSlice].value) >= 20 ? `↑ ${t('breakdown_over_target') || 'Πάνω από τον στόχο'}` : `↓ ${t('breakdown_under_target') || 'Κάτω από τον στόχο'}`)
                                            : (Math.round(donutData[activePieSlice].value) <= [50,30,20][activePieSlice] ? t('breakdown_on_track') : `↑ ${t('breakdown_over_target')}`)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* ─── SECTION D: Challenges ─── */}
                <SectionCard>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                            <Flame size={14} className="text-amber-600 dark:text-amber-400" />
                        </span>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm flex-1">{t('challenges_title')}</h3>
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full">
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
                                    className={`rounded-2xl border p-4 transition-all duration-300 ${ch.light} ${ch.border} ${done ? 'opacity-70' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-9 h-9 rounded-xl ${ch.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                            <Icon size={16} className="text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-sm font-bold ${ch.textColor} ${done ? 'line-through' : ''}`}>{ch.title}</h4>
                                                {done && <span className="text-xs text-emerald-500 font-bold">{t('challenge_completed')}</span>}
                                            </div>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{ch.desc}</p>
                                            {/* Progress bar */}
                                            <div className="mt-2.5 w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ${ch.color}`}
                                                    style={{ width: `${done ? 100 : Math.round(ch.progress)}%` }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className={`text-[10px] font-bold ${ch.textColor}`}>
                                                    {done ? '100%' : `${Math.round(ch.progress)}%`}
                                                </span>
                                                {!done && (
                                                    <button
                                                        onClick={() => toggleChallenge(ch.id)}
                                                        className={`text-[10px] font-bold ${ch.textColor} hover:underline transition-all`}
                                                    >
                                                        {t('challenge_complete_btn')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionCard>

                {/* ─── SECTION E: Personalized Tips ─── */}
                <SectionCard>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                            <Lightbulb size={14} className="text-amber-600 dark:text-amber-400" />
                        </span>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t('tips_personalized_title')}</h3>
                    </div>
                    <div className="space-y-3">
                        {tips.map((tip, i) => {
                            const Icon = tip.icon;
                            return (
                                <div key={i} className={`${tip.bg} border border-transparent rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-all`}>
                                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-black/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <Icon size={16} className={tip.color} />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-1 leading-snug">{tip.text}</p>
                                    <button className={`text-[11px] font-bold ${tip.color} flex-shrink-0`}>
                                        {tip.action}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </SectionCard>

                {/* ─── SECTION F: Monthly Progress ─── */}
                <SectionCard>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-7 h-7 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                            <Award size={14} className="text-violet-600 dark:text-violet-400" />
                        </span>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t('monthly_progress_title')}</h3>
                    </div>

                    {!monthlyProgress ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">{t('monthly_no_history')}</p>
                    ) : (
                        <div className="space-y-3">
                            {/* Overall trend */}
                            <div className={`flex items-center justify-between p-4 rounded-2xl ${monthlyProgress.improved ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30' : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${monthlyProgress.improved ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                        {monthlyProgress.improved ? <TrendingDown size={16} className="text-white" /> : <TrendingUp size={16} className="text-white" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                            {monthlyProgress.improved ? t('monthly_improved') : t('monthly_increased')}
                                        </p>
                                        <p className="text-[10px] text-gray-400">{t('breakdown_vs_last_month')}</p>
                                    </div>
                                </div>
                                <span className={`text-xl font-black ${monthlyProgress.improved ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {monthlyProgress.improved ? '-' : '+'}{monthlyProgress.pct}%
                                </span>
                            </div>

                            {/* Best + Worst categories */}
                            <div className="grid grid-cols-2 gap-2">
                                {monthlyProgress.bestCat && (
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-3">
                                        <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t('monthly_best_category')}</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white mt-1 capitalize">{monthlyProgress.bestCat}</p>
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">↓ {t('monthly_improved')}</p>
                                    </div>
                                )}
                                {monthlyProgress.worstCat && (
                                    <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl p-3">
                                        <p className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">{t('monthly_watch_out')}</p>
                                        <p className="text-sm font-black text-gray-900 dark:text-white mt-1 capitalize">{monthlyProgress.worstCat}</p>
                                        <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">↑ {t('monthly_increased')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </SectionCard>

            </div>
        </div>
    );
};

/* ──────────────────────────────────────────────────────────
   SUB-COMPONENTS
────────────────────────────────────────────────────────── */
const Header = ({ onBack, hideHeader, t }) => (
    <div className={`shrink-0 transition-colors duration-300 sticky top-0 z-10
        ${hideHeader
            ? 'bg-transparent border-none px-4 pt-4 pb-2'
            : 'px-4 pt-4 pb-4 bg-white dark:bg-surface-dark2 shadow-sm border-b border-gray-100 dark:border-transparent'}`}
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

const SectionCard = ({ children }) => (
    <div className="bg-white dark:bg-surface-dark3 rounded-3xl p-5 shadow-card border border-gray-200/50 dark:border-transparent">
        {children}
    </div>
);

export default FinancialAdvisorView;
