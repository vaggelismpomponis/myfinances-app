import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Plus, Trash2, PieChart, AlertCircle, Bell, Pencil,
    Check, X, ArrowLeft, Target, TrendingUp, Wallet, ChevronRight,
    ShoppingCart, Utensils, Coffee, Home as HomeIcon, Receipt, Gamepad2, Package
} from 'lucide-react';
import { supabase } from '../supabase';
import Amount from '../components/Amount';
import { useSettings } from '../contexts/SettingsContext';

// These MUST match the categories in AddModal.jsx exactly
const EXPENSE_CATEGORIES = ['Σούπερ Μάρκετ', 'Φαγητό', 'Καφές', 'Σπίτι', 'Λογαριασμοί', 'Διασκέδαση', 'Άλλο'];

const CATEGORY_META = {
    'Σούπερ Μάρκετ': { icon: ShoppingCart, color: 'from-green-500 to-emerald-600' },
    'Φαγητό':        { icon: Utensils,     color: 'from-orange-500 to-amber-600' },
    'Καφές':         { icon: Coffee,       color: 'from-amber-600 to-yellow-700' },
    'Σπίτι':         { icon: HomeIcon,     color: 'from-blue-500 to-indigo-600' },
    'Λογαριασμοί':   { icon: Receipt,      color: 'from-yellow-500 to-orange-500' },
    'Διασκέδαση':    { icon: Gamepad2,     color: 'from-purple-500 to-violet-600' },
    'Άλλο':          { icon: Package,      color: 'from-gray-500 to-slate-600' },
};

const BudgetsView = ({ user, transactions, onBack }) => {
    const { t, privacyMode } = useSettings();

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
                // Optimistic update
                const optimisticBudget = { ...editingBudget, ...payload };
                setBudgets(prev => prev.map(b => b.id === editingBudget.id ? optimisticBudget : b));
                closeModal();

                const { error } = await supabase.from('budgets')
                    .update(payload)
                    .eq('id', editingBudget.id);
                if (error) {
                    // Rollback
                    setBudgets(prev => prev.map(b => b.id === editingBudget.id ? editingBudget : b));
                    throw error;
                }
            } else {
                const { data, error } = await supabase.from('budgets')
                    .insert({ ...payload, user_id: user.id })
                    .select().single();
                if (error) throw error;
                // Optimistic add
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
        // Optimistic remove
        setBudgets(prev => prev.filter(b => b.id !== budgetToDelete.id));
        setDeletingBudget(null);
        try {
            const { error } = await supabase.from('budgets').delete().eq('id', budgetToDelete.id);
            if (error) {
                // Rollback
                setBudgets(prev => [...prev, budgetToDelete]);
                throw error;
            }
        } catch (error) {
            console.error('Error deleting budget:', error);
        }
    };

    const calculateSpent = (category) => {
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
    };

    const getStatusColor = (pct) => {
        if (pct >= 100) return { bar: '#ef4444', badge: 'bg-red-500/15 text-red-500', ring: 'ring-red-500/30' };
        if (pct >= 80)  return { bar: '#f97316', badge: 'bg-orange-500/15 text-orange-500', ring: 'ring-orange-500/30' };
        return { bar: '#10b981', badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/30' };
    };

    // ── Summary stats ──────────────────────────────────────────────────
    const totalLimit = budgets.reduce((s, b) => s + b.amount, 0);
    const totalSpent = budgets.reduce((s, b) => s + calculateSpent(b.category), 0);
    const totalPct   = totalLimit > 0 ? Math.min(100, (totalSpent / totalLimit) * 100) : 0;
    const overCount  = budgets.filter(b => calculateSpent(b.category) > b.amount).length;
    const remaining  = Math.max(0, totalLimit - totalSpent);

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-surface-dark animate-fade-in transition-colors duration-300">

            {/* ── Sticky Header ── */}
            <div className="bg-white dark:bg-surface-dark px-5 pt-12 pb-4 shadow-sm border-b border-gray-100 dark:border-transparent flex items-center justify-between sticky top-0 z-10 min-h-[70px] relative">
                <div className="flex items-center gap-3">
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
                    <div className="pl-10">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none">{t('budgets')}</h2>
                        <p className="text-xs text-gray-400 mt-1">{budgets.length} {t('active').toLowerCase()} · {new Date().toLocaleString('el-GR', { month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                >
                    <Plus size={16} /> {t('add_recurring')}
                </button>
            </div>

            {/* ── Scrollable Content ── */}
            <div className="flex-1 overflow-y-auto">

                {budgets.length > 0 && (
                    <>
                        {/* ── Hero Summary Card ── */}
                        <div className="px-5 pt-5">
                            <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-5 text-white overflow-hidden shadow-xl shadow-indigo-500/20">
                                {/* Decorative orbs */}
                                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-violet-900/30 rounded-full blur-2xl" />

                                <div className="relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-indigo-200 text-xs font-medium mb-1 flex items-center gap-1.5">
                                                <Wallet size={11} /> {t('monthly_expenses')}
                                            </p>
                                            <p className="text-4xl font-extrabold tracking-tight">
                                                <Amount value={totalSpent} />
                                            </p>
                                            <p className="text-indigo-200 text-xs mt-1">
                                                {t('of_total_limit').replace('{totalLimit}', '')} <Amount value={totalLimit} minimumFractionDigits={0} />
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xl font-bold px-3.5 py-1.5 rounded-2xl ${totalPct >= 100 ? 'bg-red-500/30 text-red-200' : totalPct >= 80 ? 'bg-orange-400/30 text-orange-200' : 'bg-white/20'}`}>
                                                {totalPct.toFixed(0)}%
                                            </span>
                                            {overCount > 0 && (
                                                <p className="text-red-300 text-xs mt-1.5 flex items-center gap-1 justify-end">
                                                    <AlertCircle size={10} /> {overCount} {t('over_budget_short')}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-3">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${totalPct}%`,
                                                background: totalPct >= 100 ? '#f87171' : totalPct >= 80 ? '#fb923c' : '#34d399'
                                            }}
                                        />
                                    </div>

                                    {/* Stats row */}
                                    <div className="flex gap-3 mt-4">
                                        <div className="flex-1 bg-white/10 rounded-2xl py-2 px-3 text-center">
                                            <p className="text-indigo-200 text-[10px] font-medium">{t('remaining_short')}</p>
                                            <p className="text-white font-bold text-sm"><Amount value={remaining} maximumFractionDigits={0} /></p>
                                        </div>
                                        <div className="flex-1 bg-white/10 rounded-2xl py-2 px-3 text-center">
                                            <p className="text-indigo-200 text-[10px] font-medium">{t('categories')}</p>
                                            <p className="text-white font-bold text-sm">{budgets.length}</p>
                                        </div>
                                        <div className="flex-1 bg-white/10 rounded-2xl py-2 px-3 text-center">
                                            <p className="text-indigo-200 text-[10px] font-medium">{t('over_budget_short')}</p>
                                            <p className={`font-bold text-sm ${overCount > 0 ? 'text-red-300' : 'text-emerald-300'}`}>{overCount}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Category Chips ── */}
                        <div className="relative mt-4">
                            <div className="px-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide pr-10">
                                {budgets.map(b => {
                                    const sp  = calculateSpent(b.category);
                                    const pct = Math.min(100, (sp / b.amount) * 100);
                                    const { icon: Icon } = CATEGORY_META[b.category] || { icon: Package };
                                    const { badge } = getStatusColor(pct);
                                    return (
                                        <button
                                            key={b.id}
                                            onClick={() => openEditModal(b)}
                                            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-1 ring-inset ${badge} transition-all active:scale-95`}
                                        >
                                            <Icon size={12} />
                                            <span>{b.category}</span>
                                            <span className="opacity-70">{pct.toFixed(0)}%</span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 dark:from-surface-dark to-transparent pointer-events-none flex items-center justify-end pr-2 pb-1">
                                <ChevronRight size={14} className="text-gray-400 dark:text-gray-500 animate-pulse" />
                            </div>
                        </div>
                    </>
                )}

                {/* ── Budget Cards ── */}
                <div className="px-5 py-5 space-y-3 pb-8">
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
                        <div className="space-y-3 stagger-children">
                            {budgets.map((budget, idx) => {
                                const spent      = calculateSpent(budget.category);
                                const percentage = Math.min(100, (spent / budget.amount) * 100);
                                const isOver     = spent > budget.amount;
                                const { bar, badge, ring } = getStatusColor(percentage);
                                const meta       = CATEGORY_META[budget.category] || { emoji: '📦', color: 'from-gray-500 to-slate-600' };
                                const leftover   = Math.max(0, budget.amount - spent);

                                return (
                                    <div
                                        key={budget.id}
                                        className={`bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm ring-1 ring-inset ${ring} transition-all duration-300`}
                                        style={{ animationDelay: `${idx * 60}ms` }}
                                    >
                                        {/* Colored top stripe */}
                                        <div className={`h-1 w-full bg-gradient-to-r ${meta.color}`} />

                                        <div className="p-4">
                                            {/* Top row */}
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-sm`}>
                                                        {meta.icon && <meta.icon size={20} className="text-white" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">{getCategoryTranslation(budget.category)}</h3>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">{t('monthly_limit')}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${badge}`}>
                                                        {percentage.toFixed(0)}%
                                                    </span>
                                                    {isOver && (
                                                        <p className="text-[10px] text-red-500 mt-1 font-semibold">{t('over_budget_exclamation')}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/8 rounded-full overflow-hidden mb-3">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{ width: `${percentage}%`, backgroundColor: bar }}
                                                />
                                            </div>

                                            {/* Amounts */}
                                            <div className="flex justify-between items-center text-xs font-semibold mb-3">
                                                <span className="text-gray-600 dark:text-gray-300"><Amount value={spent} /> <span className="text-gray-400 font-normal">{t('spent')}</span></span>
                                                <span className="text-gray-400">{t('limit')} <span className="text-gray-600 dark:text-white/90 font-bold"><Amount value={budget.amount} /></span></span>
                                            </div>

                                            {/* Notification + remaining row */}
                                            <div className="flex items-center justify-between mb-3">
                                                {budget.notification_threshold && (
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 dark:bg-white/5 rounded-lg px-2 py-1">
                                                        <Bell size={9} />
                                                        <span>{t('alert_at').replace('{pct}', budget.notification_threshold)}</span>
                                                    </div>
                                                )}
                                                <div className={`ml-auto text-[10px] font-semibold px-2 py-1 rounded-lg ${isOver ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>
                                                    {isOver ? (
                                                        <>{t('over_amount').replace('{amount}', '')} <Amount value={spent - budget.amount} /></>
                                                    ) : (
                                                        <>{t('remaining_amount_budget').replace('{amount}', '')} <Amount value={leftover} /></>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Row */}
                                            <div className="flex gap-2 pt-3 border-t border-gray-50 dark:border-transparent">
                                                <button
                                                    onClick={() => openEditModal(budget)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors active:scale-95"
                                                >
                                                    <Pencil size={12} /> {t('edit')}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(budget)}
                                                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors active:scale-95"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Add / Edit Modal — rendered via portal so it escapes overflow:hidden ── */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeModal} />
                    <div className="bg-white dark:bg-surface-dark3 rounded-3xl w-full max-w-sm relative z-10 shadow-2xl overflow-hidden animate-pop">
                        {/* Gradient top accent */}
                        <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

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
                                    className="p-2 text-gray-400 dark:text-black hover:text-gray-600 rounded-xl bg-gray-100 dark:bg-white hover:bg-gray-200 dark:hover:bg-gray-100 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Category Select */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-white/60 mb-2 uppercase tracking-wide">{t('category_label')}</label>
                                    <div className="relative">
                                        <select
                                            value={formCategory}
                                            onChange={(e) => setFormCategory(e.target.value)}
                                            disabled={!!editingBudget}
                                            className={`w-full py-3.5 pr-3.5 ${formCategory ? 'pl-10' : 'pl-3.5'} bg-gray-50 dark:bg-surface-dark2 border border-gray-200 dark:border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white disabled:opacity-50 appearance-none text-sm font-medium`}
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
                                    <label className="block text-xs font-bold text-gray-500 dark:text-white/60 mb-2 uppercase tracking-wide">
                                        {t('monthly_limit')} {!privacyMode && '(€)'}
                                    </label>
                                    <div className="relative">
                                        {!privacyMode && (
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 font-bold">
                                                €
                                            </div>
                                        )}
                                        <input
                                            type="number"
                                            placeholder="300"
                                            value={formAmount}
                                            onChange={(e) => setFormAmount(e.target.value)}
                                            className={`w-full ${!privacyMode ? 'pl-10' : 'pl-4'} pr-4 py-3.5 bg-gray-50 dark:bg-surface-dark2 border border-gray-200 dark:border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm font-medium`}
                                            required
                                            min="1"
                                        />
                                    </div>
                                </div>

                                {/* Threshold Slider */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('alert_label')}</label>
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 rounded-lg">
                                            {formThreshold}%
                                        </span>
                                    </div>
                                    <input
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
                                        className="flex-1 py-3.5 bg-gray-100 dark:bg-white text-gray-600 dark:text-black font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-100 transition-colors active:scale-95 text-sm"
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
                <div className="fixed inset-0 z-[200] flex items-end justify-center p-5 pb-8 animate-fade-in sm:items-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setDeletingBudget(null)} />
                    <div className="bg-white dark:bg-surface-dark3 rounded-3xl w-full max-w-sm relative z-10 shadow-2xl overflow-hidden animate-slide-up">
                        <div className="h-1 bg-gradient-to-r from-red-500 to-rose-500" />
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
                                    className="flex-1 py-3.5 bg-gray-100 dark:bg-white text-gray-700 dark:text-black font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-100 transition-colors active:scale-95 text-sm"
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
