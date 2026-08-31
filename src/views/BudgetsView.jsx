import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
    Plus, Trash2, AlertCircle, Bell, Pencil,
    Check, X, ArrowLeft, Target, Wallet, ChevronRight, ChevronDown, ChevronUp,
    ShoppingCart, Utensils, Coffee, Home as HomeIcon, Receipt, Gamepad2, Package,
    TrendingUp, TrendingDown, Zap, Lightbulb, Flame
} from 'lucide-react';
import { supabase } from '../supabase';
import Amount from '../components/Amount';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';

// These MUST match the categories in AddModal.jsx exactly
const EXPENSE_CATEGORIES = ['Σούπερ Μάρκετ', 'Φαγητό', 'Καφές', 'Σπίτι', 'Λογαριασμοί', 'Διασκέδαση', 'Άλλο'];

const CATEGORY_META = {
    'Σούπερ Μάρκετ': { icon: ShoppingCart, color: 'from-green-500 to-emerald-600', solid: '#10b981' },
    'Φαγητό':        { icon: Utensils,     color: 'from-orange-500 to-amber-600',  solid: '#f97316' },
    'Καφές':         { icon: Coffee,       color: 'from-amber-600 to-yellow-700',  solid: '#d97706' },
    'Σπίτι':         { icon: HomeIcon,     color: 'from-blue-500 to-indigo-600',   solid: '#6366f1' },
    'Λογαριασμοί':   { icon: Receipt,      color: 'from-yellow-500 to-orange-500', solid: '#eab308' },
    'Διασκέδαση':    { icon: Gamepad2,     color: 'from-purple-500 to-violet-600', solid: '#8b5cf6' },
    'Άλλο':          { icon: Package,      color: 'from-gray-500 to-slate-600',    solid: '#6b7280' },
};

/* ──────────────────────────────────────────────────────────
   CIRCULAR GAUGE (SVG)
────────────────────────────────────────────────────────── */
const CircularGauge = ({ pct }) => {
    const r = 64;
    const stroke = 11;
    const circ = 2 * Math.PI * r;
    const fill = Math.min(100, pct) / 100 * circ;
    const color = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f97316' : '#10b981';

    return (
        <svg width="100%" height="100%" viewBox="0 0 160 160" className="transform -rotate-90">
            <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
            <circle
                cx="80" cy="80" r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={`${fill} ${circ}`}
                strokeLinecap="round"
                style={{
                    transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)',
                    filter: `drop-shadow(0 0 7px ${color}99)`
                }}
            />
        </svg>
    );
};

/* ──────────────────────────────────────────────────────────
   COMPACT BUDGET ROW (expandable)
────────────────────────────────────────────────────────── */
const BudgetRow = ({ budget, spent, onEdit, onDelete, t, getCategoryTranslation, daysLeft }) => {
    const [expanded, setExpanded] = useState(false);
    const pct = budget.amount > 0 ? Math.min(100, (spent / budget.amount) * 100) : 0;
    const isOver = spent > budget.amount;
    const isWarn = pct >= (budget.notification_threshold || 80) && !isOver;
    const leftover = Math.max(0, budget.amount - spent);
    const meta = CATEGORY_META[budget.category] || { icon: Package, color: 'from-gray-500 to-slate-600', solid: '#6b7280' };
    const Icon = meta.icon;

    // Projected end-of-month spend
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const dailyRate = daysPassed > 0 ? spent / daysPassed : 0;
    const projectedTotal = dailyRate * daysInMonth;
    const projectedPct = budget.amount > 0 ? Math.round((projectedTotal / budget.amount) * 100) : 0;

    const barColor = isOver ? '#ef4444' : isWarn ? '#f97316' : '#10b981';
    const badgeCls = isOver
        ? 'bg-red-500/15 text-red-500 dark:text-red-400'
        : isWarn
            ? 'bg-orange-500/15 text-orange-500 dark:text-orange-400'
            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';

    return (
        <div className="bg-[#f5f5f5] dark:bg-white/[0.04] rounded-[20px] overflow-hidden transition-all duration-300">

            {/* Main compact row */}
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors active:scale-[0.99]"
            >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <Icon size={17} className="text-white" />
                </div>

                {/* Name + progress bar */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate pr-2">
                            {getCategoryTranslation(budget.category)}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0 ${badgeCls}`}>
                            {pct.toFixed(0)}%
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-white/[0.07] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: barColor }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            <Amount value={spent} /> {t('spent')}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            {t('limit')} <Amount value={budget.amount} />
                        </span>
                    </div>
                </div>

                {/* Expand chevron */}
                <div className="flex-shrink-0 text-gray-300 dark:text-white/20 ml-1">
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </button>

            {/* Expanded detail panel */}
            {expanded && (
                <div className="px-4 pb-4 border-t border-gray-50 dark:border-white/5 animate-fade-in">
                    <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
                        {/* Remaining */}
                        <div className={`rounded-xl p-2.5 text-center ${isOver ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                                {isOver ? t('over_budget_short') : t('remaining_short')}
                            </p>
                            <p className={`text-sm font-black ${isOver ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {isOver ? '+' : ''}<Amount value={isOver ? spent - budget.amount : leftover} />
                            </p>
                        </div>
                        {/* Days left */}
                        <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-2.5 text-center">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                                {t('budget_projection')}
                            </p>
                            <p className={`text-sm font-black ${projectedPct > 100 ? 'text-red-500' : 'text-violet-600 dark:text-violet-400'}`}>
                                {projectedPct}%
                            </p>
                        </div>
                        {/* Alert threshold */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-2.5 text-center">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                                <Bell size={8} className="inline mr-0.5" />{t('alert_label')}
                            </p>
                            <p className="text-sm font-black text-amber-600 dark:text-amber-400">
                                {budget.notification_threshold || 80}%
                            </p>
                        </div>
                    </div>

                    {/* Projection bar */}
                    {spent > 0 && (
                        <div className="mb-3">
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span className="font-medium">{t('budget_projection')}</span>
                                <span className={`font-bold ${projectedPct > 100 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {projectedPct > 100 ? t('budget_proj_over') : t('budget_proj_on_track')} ({projectedPct}%)
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/[0.07] rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700 opacity-60"
                                    style={{
                                        width: `${Math.min(100, projectedPct)}%`,
                                        backgroundColor: projectedPct > 100 ? '#ef4444' : '#8b5cf6'
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEdit(budget)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors active:scale-95"
                        >
                            <Pencil size={13} /> {t('edit')}
                        </button>
                        <button
                            onClick={() => onDelete(budget)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors active:scale-95"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════
   MAIN VIEW
══════════════════════════════════════════════════════════ */
const BudgetsView = ({ user, transactions, onBack, hideHeader }) => {
    const { t, privacyMode } = useSettings();
    const { isPro, openUpgradeModal } = useSubscription();

    const getCategoryTranslation = (catName) => {
        const mapping = {
            'Σούπερ Μάρκετ': 'cat_supermarket',
            'Φαγητό': 'cat_food',
            'Καφές': 'cat_coffee',
            'Σπίτι': 'cat_home',
            'Λογαριασμοί': 'cat_bills',
            'Διασκέδαση': 'cat_entertainment',
            'Μισθός': 'cat_salary',
            'Δώρο': 'cat_gift',
            'Επενδύσεις': 'cat_investments',
            'Άλλο': 'cat_other'
        };
        const key = mapping[catName];
        if (key && t(key) !== key) return t(key);
        return catName;
    };

    const [budgets, setBudgets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [deletingBudget, setDeletingBudget] = useState(null);

    // Form State
    const [formCategory, setFormCategory] = useState('');
    const [formAmount, setFormAmount] = useState('');
    const [formThreshold, setFormThreshold] = useState('80');

    useEffect(() => {
        if (!user) return;
        const fetchBudgets = async () => {
            const { data, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('user_id', user.id);
            if (!error) setBudgets(data || []);
            setIsLoading(false);
        };
        fetchBudgets();
        const channel = supabase
            .channel('budgets-local-changes')
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'budgets',
                filter: `user_id=eq.${user.id}`
            }, fetchBudgets)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [user]);

    const openAddModal = () => {
        if (!isPro && budgets.length >= 3) {
            openUpgradeModal('budgets');
            return;
        }
        setEditingBudget(null);
        setFormCategory('');
        setFormAmount('');
        setFormThreshold('80');
        setShowModal(true);
    };

    const openEditModal = (budget) => {
        setEditingBudget(budget);
        setFormCategory(budget.category);
        setFormAmount(budget.amount.toString());
        setFormThreshold((budget.notification_threshold || 80).toString());
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingBudget(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formCategory || !formAmount) return;
        const payload = {
            category: formCategory,
            amount: parseFloat(formAmount),
            notification_threshold: parseFloat(formThreshold) || 100,
        };
        try {
            if (editingBudget) {
                const optimisticBudget = { ...editingBudget, ...payload };
                setBudgets(prev => prev.map(b => b.id === editingBudget.id ? optimisticBudget : b));
                closeModal();
                const { error } = await supabase.from('budgets')
                    .update(payload)
                    .eq('id', editingBudget.id);
                if (error) {
                    setBudgets(prev => prev.map(b => b.id === editingBudget.id ? editingBudget : b));
                    throw error;
                }
            } else {
                const { data, error } = await supabase.from('budgets')
                    .insert({ ...payload, user_id: user.id })
                    .select().single();
                if (error) throw error;
                setBudgets(prev => [...prev, data]);
                closeModal();
            }
        } catch (error) {
            console.error('Error saving budget:', error);
            alert('Σφάλμα κατά την αποθήκευση.');
        }
    };

    const handleDelete = (budget) => setDeletingBudget(budget);

    const confirmDelete = async () => {
        if (!deletingBudget) return;
        const budgetToDelete = deletingBudget;
        setBudgets(prev => prev.filter(b => b.id !== budgetToDelete.id));
        setDeletingBudget(null);
        try {
            const { error } = await supabase.from('budgets').delete().eq('id', budgetToDelete.id);
            if (error) {
                setBudgets(prev => [...prev, budgetToDelete]);
                throw error;
            }
        } catch (error) {
            console.error('Error deleting budget:', error);
        }
    };

    const calculateSpent = useCallback((category) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return (
                    t.type === 'expense' &&
                    tDate.getMonth() === currentMonth &&
                    tDate.getFullYear() === currentYear &&
                    t.category?.toLowerCase() === category.toLowerCase()
                );
            })
            .reduce((acc, t) => acc + t.amount, 0);
    }, [transactions]);

    /* ── Summary stats ── */
    const totalLimit = budgets.reduce((s, b) => s + b.amount, 0);
    const totalSpent = useMemo(() => budgets.reduce((s, b) => s + calculateSpent(b.category), 0), [budgets, calculateSpent]);
    const totalPct = totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0;
    const overCount = useMemo(() => budgets.filter(b => calculateSpent(b.category) > b.amount).length, [budgets, calculateSpent]);
    const remaining = Math.max(0, totalLimit - totalSpent);

    /* ── Days left in month ── */
    const daysLeft = useMemo(() => {
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        return lastDay - now.getDate();
    }, []);

    /* ── Daily pace & projection ── */
    const paceInfo = useMemo(() => {
        if (totalSpent === 0) return null;
        const now = new Date();
        const daysPassed = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dailyRate = totalSpent / daysPassed;
        const projectedTotal = dailyRate * daysInMonth;
        const projectedPct = totalLimit > 0 ? Math.round((projectedTotal / totalLimit) * 100) : 0;
        return {
            dailyRate: Math.round(dailyRate * 10) / 10,
            projectedPct,
            isGood: projectedPct <= 100,
            isWarn: projectedPct > 100 && projectedPct <= 130,
            isOver: projectedPct > 130,
        };
    }, [totalSpent, totalLimit]);

    /* ── Smart tips ── */
    const tips = useMemo(() => {
        const list = [];
        budgets.forEach(b => {
            const sp = calculateSpent(b.category);
            const pct = b.amount > 0 ? Math.round((sp / b.amount) * 100) : 0;
            const catName = getCategoryTranslation(b.category);
            if (pct > 100) {
                list.push({ icon: Flame, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', text: t('budget_tip_over').replace('{category}', catName).replace('{pct}', pct - 100) });
            } else if (pct >= 75) {
                list.push({ icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', text: t('budget_tip_close').replace('{category}', catName).replace('{pct}', pct).replace('{days}', daysLeft) });
            } else if (pct < 30 && pct > 0) {
                list.push({ icon: TrendingDown, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: t('budget_tip_great').replace('{category}', catName).replace('{pct}', pct) });
            }
        });
        return list.slice(0, 3);
    }, [budgets, calculateSpent, daysLeft, t, getCategoryTranslation]);

    /* ── Status label ── */
    const statusLabel = totalPct >= 100 ? t('budget_critical') : totalPct >= 80 ? t('budget_caution') : t('budget_on_track');
    const statusColor = totalPct >= 100 ? 'text-red-300' : totalPct >= 80 ? 'text-orange-300' : 'text-emerald-300';

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-surface-dark animate-fade-in transition-colors duration-300">

            {/* ── Sticky Header ── */}
            <div className={`shrink-0 transition-colors duration-300 sticky top-0 z-10
                            ${hideHeader
                                ? 'bg-transparent border-none px-5 pt-4 pb-2'
                                : 'bg-white dark:bg-surface-dark px-5 pt-4 pb-4 shadow-sm border-b border-gray-100 dark:border-transparent'}`}
            >
                <div className="flex items-center justify-between min-h-[40px] gap-4 relative">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={onBack}
                            className="absolute left-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.08]
                                       flex items-center justify-center
                                       text-gray-500 dark:text-white/50
                                       hover:bg-gray-200 dark:hover:bg-white/[0.14]
                                       active:scale-90 transition-all duration-150"
                        >
                            <ArrowLeft size={15} strokeWidth={2.5} />
                        </button>
                        {!hideHeader && (
                            <div className="pl-10 min-w-0">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none truncate">{t('budgets')}</h2>
                                <p className="text-xs text-gray-400 mt-1 truncate">
                                    {!isPro ? <span>{budgets.length}/3 {t('active').toLowerCase()} <Zap size={11} className="inline-block text-amber-500 relative -top-[1px] ml-1" fill="currentColor" /></span> : `${budgets.length} ` + t('active').toLowerCase()} · {new Date().toLocaleString('el-GR', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={openAddModal}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                    >
                        {(!isPro && budgets.length >= 3) ? <Zap size={14} className="inline-block text-amber-500 mr-1" fill="currentColor" /> : <Plus size={16} />} {t('add_budget')}
                    </button>
                </div>
            </div>

            {/* ── Scrollable Content ── */}
            <div className="flex-1 overflow-y-auto pb-28">

                {budgets.length > 0 && (
                    <>
                        {/* ═══ SECTION A: Hero — Circular Gauge ═══ */}
                        <div className="px-5 pt-5">
                            <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-5 text-white overflow-hidden shadow-xl shadow-indigo-500/20">
                                {/* Decorative orbs */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
                                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-violet-900/30 rounded-full blur-xl" />

                                <div className="relative">
                                    {/* Top row: gauge left + main spend right */}
                                    <div className="flex items-center gap-4 mb-4">
                                        {/* Circular gauge */}
                                        <div className="relative flex-shrink-0 w-[110px] h-[110px]">
                                            <CircularGauge pct={totalPct} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-black leading-none">{Math.round(totalPct)}%</span>
                                                <span className="text-[9px] text-indigo-200 font-bold uppercase tracking-wide mt-0.5">{t('budget_used')}</span>
                                            </div>
                                        </div>

                                        {/* Main spend info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest mb-1">{t('monthly_expenses')}</p>
                                            <p className="text-3xl font-black leading-none truncate"><Amount value={totalSpent} /></p>
                                            <p className="text-indigo-200 text-xs mt-1">{t('of_total_limit')} <Amount value={totalLimit} /></p>
                                            <span className={`inline-block text-[11px] font-bold mt-2 px-2.5 py-0.5 rounded-full bg-white/10 ${statusColor}`}>
                                                {statusLabel}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-white/10 mb-3" />

                                    {/* Bottom stats row */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white/10 rounded-xl py-2.5 px-3">
                                            <p className="text-indigo-200 text-[9px] font-bold uppercase tracking-wide mb-0.5">{t('remaining_short')}</p>
                                            <p className="text-white font-black text-base"><Amount value={remaining} maximumFractionDigits={0} /></p>
                                        </div>
                                        <div className="bg-white/10 rounded-xl py-2.5 px-3">
                                            <p className="text-indigo-200 text-[9px] font-bold uppercase tracking-wide mb-0.5">{t('over_budget_short')}</p>
                                            <p className={`font-black text-base ${overCount > 0 ? 'text-red-300' : 'text-emerald-300'}`}>
                                                {overCount > 0
                                                    ? <span className="flex items-center gap-1"><AlertCircle size={13} />{overCount}</span>
                                                    : '—'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ═══ SECTION B: Spending Velocity ═══ */}
                        {paceInfo && (
                            <div className="px-5 mt-4">
                                <div className={`rounded-2xl p-4 border flex items-center gap-3 ${
                                    paceInfo.isOver
                                        ? 'bg-red-50 dark:bg-red-900/15 border-red-100 dark:border-red-900/30'
                                        : paceInfo.isWarn
                                            ? 'bg-orange-50 dark:bg-orange-900/15 border-orange-100 dark:border-orange-900/30'
                                            : 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-100 dark:border-emerald-900/30'
                                }`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        paceInfo.isOver ? 'bg-red-500' : paceInfo.isWarn ? 'bg-orange-500' : 'bg-emerald-500'
                                    }`}>
                                        {paceInfo.isOver
                                            ? <TrendingUp size={18} className="text-white" />
                                            : paceInfo.isWarn
                                                ? <Zap size={18} className="text-white" />
                                                : <TrendingDown size={18} className="text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                                            paceInfo.isOver ? 'text-red-500' : paceInfo.isWarn ? 'text-orange-500' : 'text-emerald-600 dark:text-emerald-400'
                                        }`}>{t('budget_daily_pace_title')}</p>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-snug">
                                            {paceInfo.isOver
                                                ? t('budget_daily_pace_over').replace('{amount}', paceInfo.dailyRate).replace('{pct}', paceInfo.projectedPct - 100)
                                                : paceInfo.isWarn
                                                    ? t('budget_daily_pace_warn').replace('{amount}', paceInfo.dailyRate).replace('{pct}', paceInfo.projectedPct)
                                                    : t('budget_daily_pace_good').replace('{amount}', paceInfo.dailyRate).replace('{pct}', 100 - paceInfo.projectedPct)
                                            }
                                        </p>
                                    </div>
                                    <div className={`text-right flex-shrink-0 text-xs font-black ${
                                        paceInfo.isOver ? 'text-red-500' : paceInfo.isWarn ? 'text-orange-500' : 'text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                        {paceInfo.projectedPct}%<br />
                                        <span className="text-[10px] font-medium text-gray-400">{t('budget_projection')}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══ SECTION C: Category horizontal chips ═══ */}
                        <div className="relative mt-4">
                            <div className="px-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide pr-10">
                                {budgets.map(b => {
                                    const sp = calculateSpent(b.category);
                                    const pct = b.amount > 0 ? Math.min(100, (sp / b.amount) * 100) : 0;
                                    const { icon: Icon } = CATEGORY_META[b.category] || { icon: Package };
                                    const badgeCls = pct >= 100
                                        ? 'bg-red-500/15 text-red-500 ring-red-200 dark:ring-red-800/40'
                                        : pct >= 80
                                            ? 'bg-orange-500/15 text-orange-500 ring-orange-200 dark:ring-orange-800/40'
                                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-emerald-200 dark:ring-emerald-800/40';
                                    return (
                                        <div
                                            key={b.id}
                                            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ring-inset ${badgeCls}`}
                                        >
                                            <Icon size={11} />
                                            <span>{getCategoryTranslation(b.category)}</span>
                                            <span className="opacity-70">{pct.toFixed(0)}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-gray-50 dark:from-surface-dark to-transparent pointer-events-none flex items-center justify-end pr-2 pb-1">
                                <ChevronRight size={14} className="text-gray-400 dark:text-gray-500 animate-pulse" />
                            </div>
                        </div>
                    </>
                )}

                {/* ═══ SECTION D: Budget Rows ═══ */}
                <div className="px-5 py-4 space-y-2.5">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        </div>
                    ) : budgets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mb-4">
                                <Target size={36} className="text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">{t('no_budgets')}</h3>
                            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-[220px] mb-6">
                                {t('create_first_budget')}
                            </p>
                            <button
                                onClick={openAddModal}
                                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                            >
                                <Plus size={18} /> {t('create_budget')}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {budgets.map((budget, idx) => {
                                const spent = calculateSpent(budget.category);
                                return (
                                    <div key={budget.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-fade-in">
                                        <BudgetRow
                                            budget={budget}
                                            spent={spent}
                                            onEdit={openEditModal}
                                            onDelete={handleDelete}
                                            t={t}
                                            getCategoryTranslation={getCategoryTranslation}
                                            daysLeft={daysLeft}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ═══ SECTION E: Smart Tips ═══ */}
                {tips.length > 0 && (
                    <div className="px-5 pb-5">
                        <div className="bg-[#f5f5f5] dark:bg-white/[0.04] rounded-[20px] p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                    <Lightbulb size={14} className="text-amber-600 dark:text-amber-400" />
                                </span>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('budget_tips_title')}</h3>
                            </div>
                            <div className="space-y-2">
                                {tips.map((tip, i) => {
                                    const TipIcon = tip.icon;
                                    return (
                                        <div key={i} className={`${tip.bg} rounded-xl px-3 py-2.5 flex items-center gap-2.5`}>
                                            <TipIcon size={14} className={`flex-shrink-0 ${tip.color}`} />
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-snug">{tip.text}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Add / Edit Modal — rendered via portal ── */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeModal} />
                    <div className="bg-white dark:bg-surface-dark3 rounded-3xl w-full max-w-sm relative z-10 shadow-2xl overflow-hidden animate-pop">
                        {/* Gradient top accent */}


                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {editingBudget ? t('edit') : t('new_budget')}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {editingBudget ? t('edit_rule_desc') : t('select_category')}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 dark:text-white/50 hover:text-gray-600 dark:hover:text-white/80 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Category Select */}
                                <div>
                                    <label htmlFor="budget-category" className="block text-xs font-bold text-gray-500 dark:text-white/60 mb-2 uppercase tracking-wide">{t('category_label')}</label>
                                    <div className="relative">
                                        <select
                                            id="budget-category"
                                            value={formCategory}
                                            onChange={(e) => setFormCategory(e.target.value)}
                                            disabled={!!editingBudget}
                                            className={`w-full py-3.5 pr-3.5 ${formCategory ? 'pl-10' : 'pl-3.5'} bg-white dark:bg-surface-dark2 border border-slate-200/60 dark:border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white shadow-premium disabled:opacity-50 appearance-none text-sm font-medium`}
                                            required
                                        >
                                            <option value="" disabled>{t('select_category')}</option>
                                            {EXPENSE_CATEGORIES.filter(c => !budgets.find(b => b.category === c && (!editingBudget || editingBudget.category !== c))).map(c => (
                                                <option key={c} value={c}>
                                                    {getCategoryTranslation(c)}
                                                </option>
                                            ))}
                                        </select>
                                        {formCategory && CATEGORY_META[formCategory] && (
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                                {React.createElement(CATEGORY_META[formCategory].icon, { size: 18 })}
                                            </div>
                                        )}
                                    </div>
                                    {editingBudget && (
                                        <p className="text-[10px] text-gray-400 mt-1.5"></p>
                                    )}
                                </div>

                                {/* Amount Input */}
                                <div>
                                    <label htmlFor="budget-limit" className="block text-xs font-bold text-gray-500 dark:text-white/60 mb-2 uppercase tracking-wide">
                                        {t('monthly_limit')} {!privacyMode && '(€)'}
                                    </label>
                                    <div className="relative">
                                        {!privacyMode && (
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 font-bold">
                                                €
                                            </div>
                                        )}
                                        <input
                                            id="budget-limit"
                                            type="number"
                                            placeholder="300"
                                            value={formAmount}
                                            onChange={(e) => setFormAmount(e.target.value)}
                                            className={`w-full ${!privacyMode ? 'pl-10' : 'pl-4'} pr-4 py-3.5 bg-white dark:bg-surface-dark2 border border-slate-200/60 dark:border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white text-sm font-medium shadow-premium placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-medium`}
                                            required
                                            min="1"
                                        />
                                    </div>
                                </div>

                                {/* Threshold Slider */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label htmlFor="budget-threshold" className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('alert_label')}</label>
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 rounded-lg">
                                            {formThreshold}%
                                        </span>
                                    </div>
                                    <input
                                        id="budget-threshold"
                                        type="range"
                                        min="10"
                                        max="100"
                                        step="5"
                                        value={formThreshold}
                                        onChange={(e) => setFormThreshold(e.target.value)}
                                        className="w-full h-2 appearance-none rounded-full bg-gray-200 dark:bg-white/10 accent-indigo-600 cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
                                        <span>10%</span><span>50%</span><span>100%</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                                        <Bell size={9} /> {t('alert_desc')}
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-3.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/80 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-white/15 transition-colors active:scale-95 text-sm"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Check size={16} />
                                        {editingBudget ? t('update') : t('save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ── Delete Confirmation Modal — via portal ── */}
            {deletingBudget && createPortal(
                <div className="fixed inset-0 z-[200] flex items-end justify-center p-5 pb-8 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setDeletingBudget(null)} />
                    <div className="bg-white dark:bg-surface-dark3 rounded-t-[2rem] w-full max-w-sm lg:max-w-[1000px] relative z-10 shadow-2xl overflow-hidden animate-slide-up">

                        <div className="p-6">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center text-red-500 dark:text-red-400 mb-4">
                                    <Trash2 size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('delete_budget')}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                                    {t('delete_budget_confirm')}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingBudget(null)}
                                    className="flex-1 py-3.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/80 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-white/15 transition-colors active:scale-95 text-sm"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                                >
                                    <Trash2 size={15} /> {t('delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default BudgetsView;
