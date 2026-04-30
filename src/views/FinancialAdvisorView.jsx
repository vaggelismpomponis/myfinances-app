import React, { useMemo } from 'react';
import {
    TrendingUp,
    ShieldCheck,
    Zap,
    Info,
    Target,
    ChevronRight,
    ArrowLeft,
    Lightbulb,
    CheckCircle2
} from 'lucide-react';
import {
    PieChart, Pie, Cell,
    ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    CartesianGrid
} from 'recharts';
import { useSettings } from '../contexts/SettingsContext';

const FinancialAdvisorView = ({ transactions, goals = [], onBack }) => {
    const { t } = useSettings();

    // Mapping categories to 50-30-20 buckets
    const CATEGORY_MAP = {
        'bills': 'needs',
        'home': 'needs',
        'supermarket': 'needs',
        'health': 'needs',
        'transport': 'needs',
        'education': 'needs',
        'food': 'wants', // Assuming 'food' is dining out/delivery
        'coffee': 'wants',
        'entertainment': 'wants',
        'shopping': 'wants',
        'travel': 'wants',
        'hobbies': 'wants',
        'investments': 'savings',
        'savings': 'savings',
        'debt': 'savings',
        // Greek support
        'λογαριασμοί': 'needs',
        'σπίτι': 'needs',
        'σούπερ μάρκετ': 'needs',
        'υγεια': 'needs',
        'μεταφορικα': 'needs',
        'εκπαιδευση': 'needs',
        'φαγητό': 'wants',
        'καφές': 'wants',
        'διασκέδαση': 'wants',
        'αγορές': 'wants',
        'ταξίδια': 'wants',
        'χόμπι': 'wants',
        'επενδύσεις': 'savings',
        'αποταμίευση': 'savings',
        'χρέη': 'savings'
    };

    const stats = useMemo(() => {
        const now = new Date();
        const thisMonth = transactions.filter(tx => {
            const d = new Date(tx.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const income = thisMonth.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + tx.amount, 0);
        const expenses = thisMonth.filter(tx => tx.type === 'expense');

        const buckets = {
            needs: 0,
            wants: 0,
            savings: 0,
            uncategorized: 0
        };

        expenses.forEach(tx => {
            const bucket = CATEGORY_MAP[tx.category?.toLowerCase()] || 'uncategorized';
            buckets[bucket] += tx.amount;
        });

        // Add goals contributions to savings bucket
        // (In this app, goals are tracked separately, but "deposit" transactions should ideally be tagged as savings)
        // If they are not in transactions but we want to show current progress as "savings" for the rule:
        // For the 50-30-20 rule, it's about the MONTHLY allocation.

        const totalExp = buckets.needs + buckets.wants + buckets.savings + buckets.uncategorized;

        // If total allocation is less than income, the remainder is implicitly potential savings
        const unallocated = Math.max(0, income - totalExp);
        buckets.savings += unallocated;

        const total = buckets.needs + buckets.wants + buckets.savings + buckets.uncategorized;

        return {
            income,
            total,
            needs: buckets.needs,
            wants: buckets.wants,
            savings: buckets.savings,
            uncategorized: buckets.uncategorized,
            needsPct: total > 0 ? (buckets.needs / total) * 100 : 0,
            wantsPct: total > 0 ? (buckets.wants / total) * 100 : 0,
            savingsPct: total > 0 ? (buckets.savings / total) * 100 : 0,
        };
    }, [transactions]);

    const wellnessScore = useMemo(() => {
        let score = 70; // Base score
        if (stats.needsPct > 50) score -= (stats.needsPct - 50);
        else score += (50 - stats.needsPct) * 0.5;

        if (stats.wantsPct > 30) score -= (stats.wantsPct - 30);
        else score += (30 - stats.wantsPct) * 0.2;

        if (stats.savingsPct < 20) score -= (20 - stats.savingsPct) * 2;
        else score += (stats.savingsPct - 20) * 1;

        return Math.min(100, Math.max(0, Math.round(score)));
    }, [stats]);

    const chartData = [
        { name: t('needs_label'), current: Math.round(stats.needsPct), recommended: 50 },
        { name: t('wants_label'), current: Math.round(stats.wantsPct), recommended: 30 },
        { name: t('savings_label'), current: Math.round(stats.savingsPct), recommended: 20 },
    ];

    const COLORS = ['#7c3aed', '#ec4899', '#10b981'];

    const getAdvice = () => {
        if (stats.needsPct > 55) return t('advisor_needs_high');
        if (stats.wantsPct > 35) return t('advisor_wants_high');
        if (stats.savingsPct < 15) return t('advisor_savings_low');
        return t('advisor_good_job');
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-surface-dark animate-fade-in">
            {/* Header */}
            <div className="px-5 pt-12 pb-4 bg-white dark:bg-surface-dark2 shadow-sm border-b border-gray-100 dark:border-transparent flex items-center justify-center relative sticky top-0 z-10 min-h-[70px]">
                <button
                    onClick={onBack}
                    className="absolute left-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.08]
                               flex items-center justify-center
                               text-gray-500 dark:text-white/50
                               hover:bg-gray-200 dark:hover:bg-white/[0.14]
                               active:scale-90 transition-all duration-150"
                >
                    <ArrowLeft size={15} strokeWidth={2.5} />
                </button>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none">{t('advisor_title')}</h2>
                    <p className="text-xs text-gray-400 mt-1">{t('advisor_subtitle')}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 pb-24">

                {/* Wellness Score Card */}
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-6 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShieldCheck size={120} />
                    </div>

                    <div className="relative">
                        <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1">{t('wellness_score')}</p>
                        <div className="flex items-end gap-3">
                            <h3 className="text-6xl font-black">{wellnessScore}</h3>
                            <div className="mb-2">
                                <div className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold">
                                    {wellnessScore > 80 ? 'EXCELLENT' : wellnessScore > 60 ? 'GOOD' : 'IMPROVABLE'}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-start gap-3 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                            <Zap size={18} className="text-yellow-300 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium leading-relaxed">
                                {getAdvice()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 50-30-20 Rule Section */}
                <div className="bg-white dark:bg-surface-dark3 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-transparent">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp size={18} className="text-violet-500" />
                            {t('rule_50_30_20')}
                        </h3>
                        <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center text-violet-500">
                            <Info size={14} />
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} unit="%" />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 600 }} />
                                <Bar name={t('current_allocation')} dataKey="current" fill="#7c3aed" radius={[6, 6, 0, 0]} barSize={24} />
                                <Bar name={t('recommended_allocation')} dataKey="recommended" fill="#9CA3AF" opacity={0.3} radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-6">
                        {[
                            { key: 'needs', label: t('needs_label'), desc: t('needs_desc'), pct: stats.needsPct, target: 50, color: 'bg-violet-500' },
                            { key: 'wants', label: t('wants_label'), desc: t('wants_desc'), pct: stats.wantsPct, target: 30, color: 'bg-pink-500' },
                            { key: 'savings', label: t('savings_label'), desc: t('savings_desc'), pct: stats.savingsPct, target: 20, color: 'bg-emerald-500' },
                        ].map(item => (
                            <div key={item.key} className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tight">{item.label}</h4>
                                        <p className="text-[10px] text-gray-400 font-medium">{item.desc}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-black text-gray-900 dark:text-white">{Math.round(item.pct)}%</span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Target: {item.target}%</p>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                                        style={{ width: `${Math.min(100, item.pct)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Smart Tips */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white px-1 flex items-center gap-2">
                        <Lightbulb size={18} className="text-amber-500" />
                        {t('tips_title')}
                    </h3>

                    <div className="space-y-3">
                        {[
                            { icon: <Target size={18} />, text: t('tip_emergency_fund') },
                            { icon: <Zap size={18} />, text: t('tip_automate_savings') },
                            { icon: <CheckCircle2 size={18} />, text: t('tip_review_subscriptions') },
                        ].map((tip, i) => (
                            <div key={i} className="bg-white dark:bg-surface-dark3 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-transparent flex items-center gap-4 active:scale-[0.98] transition-all">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-transparent">
                                    {tip.icon}
                                </div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-1">{tip.text}</p>
                                <ChevronRight size={16} className="text-gray-300" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Goal Suggestion Logic */}
                {goals.length > 0 && stats.savingsPct < 20 && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-transparent p-5 rounded-3xl">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <Target size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">{t('goal_suggestion')}</h4>
                                <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">{t('suggest_save_more').replace('{amount}', '50')}</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default FinancialAdvisorView;









