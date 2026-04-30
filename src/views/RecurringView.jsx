import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Calendar,
    Repeat,
    TrendingUp,
    TrendingDown,
    Pencil,
    X,
    Check,
    Zap,
    RefreshCw,
    ArrowUpCircle,
    ArrowDownCircle,
    ChevronRight
} from 'lucide-react';
import { supabase } from '../supabase';
import Amount from '../components/Amount';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';

/* ─────────────────────────────────────────────────────────────
   Small helpers
───────────────────────────────────────────────────────────── */
const FREQ_COLORS = {
    monthly: { from: 'from-violet-500', to: 'to-purple-600', bar: '#a78bfa', badge: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
    weekly:  { from: 'from-cyan-500',   to: 'to-blue-600',   bar: '#38bdf8', badge: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' },
};

const getFreqMeta = (freq) => FREQ_COLORS[freq] || FREQ_COLORS.monthly;

/* ── Styled input ── */
const Field = ({ label, ...props }) => (
    <div>
        <label className="block text-[11px] font-bold text-gray-400 dark:text-white/60 mb-1.5 uppercase tracking-widest">
            {label}
        </label>
        <input
            {...props}
            className="w-full p-3.5 bg-gray-50 dark:bg-white/5
                       border border-gray-200 dark:border-transparent
                       rounded-2xl text-sm font-medium text-gray-900 dark:text-white
                       placeholder:text-gray-300 dark:placeholder:text-gray-600
                       focus:outline-none focus:ring-2 focus:ring-violet-500
                       dark:focus:ring-violet-400 transition-all"
        />
    </div>
);

/* ── Styled select ── */
const SelectField = ({ label, value, onChange, children }) => (
    <div>
        <label className="block text-[11px] font-bold text-gray-400 dark:text-white/60 mb-1.5 uppercase tracking-widest">
            {label}
        </label>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className="w-full p-3.5 bg-gray-50 dark:bg-white/5
                           border border-gray-200 dark:border-transparent
                           rounded-2xl text-sm font-medium text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-violet-500
                           dark:focus:ring-violet-400 transition-all
                           appearance-none pr-8 cursor-pointer"
            >
                {children}
            </select>
            <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 dark:text-white/50 pointer-events-none" />
        </div>
    </div>
);

/* ──────────────────────────────────────────────────────────────
   Main Component
─────────────────────────────────────────────────────────────── */
const RecurringView = ({ user, onBack }) => {
    const { t: translate, currency, privacyMode } = useSettings();
    const { showToast } = useToast();
    const [rules, setRules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    /* ── modal state ── */
    const [showModal, setShowModal]     = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [deletingRule, setDeletingRule] = useState(null);

    /* ── form state ── */
    const [title,     setTitle]     = useState('');
    const [amount,    setAmount]    = useState('');
    const [type,      setType]      = useState('expense');
    const [frequency, setFrequency] = useState('monthly');
    const [day,       setDay]       = useState('1');

    /* ── data fetching ── */
    useEffect(() => {
        if (!user) return;
        const fetchRules = async () => {
            const { data, error } = await supabase
                .from('recurring_transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (!error) setRules(data || []);
            setIsLoading(false);
        };
        fetchRules();
        const channel = supabase
            .channel('recurring-changes-v2')
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'recurring_transactions',
                filter: `user_id=eq.${user.id}`
            }, fetchRules)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [user]);

    /* ── handlers ── */
    const openAdd = () => {
        setEditingRule(null);
        setTitle(''); setAmount(''); setType('expense');
        setFrequency('monthly'); setDay('1');
        setShowModal(true);
    };

    const openEdit = (rule) => {
        setEditingRule(rule);
        setTitle(rule.title);
        setAmount(rule.amount.toString());
        setType(rule.type);
        setFrequency(rule.frequency || 'monthly');
        setDay(rule.day.toString());
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingRule(null); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!title || !amount) return;
        try {
            if (editingRule) {
                const updatedRule = { ...editingRule, title, amount: parseFloat(amount), type, frequency, day: parseInt(day) };
                // Optimistic update
                setRules(prev => prev.map(r => r.id === editingRule.id ? updatedRule : r));
                closeModal();

                const { error } = await supabase.from('recurring_transactions')
                    .update({ title, amount: parseFloat(amount), type, frequency, day: parseInt(day) })
                    .eq('id', editingRule.id);
                if (error) {
                    // Rollback
                    setRules(prev => prev.map(r => r.id === editingRule.id ? editingRule : r));
                    throw error;
                }
            } else {
                const { data, error } = await supabase.from('recurring_transactions')
                    .insert({
                        user_id: user.id,
                        title, amount: parseFloat(amount), type, frequency, day: parseInt(day),
                        last_processed: null
                    })
                    .select().single();
                if (error) throw error;
                // Optimistic add
                setRules(prev => [data, ...prev]);
                closeModal();
            }
        } catch (err) {
            console.error('Error saving rule:', err);
            showToast(translate('save_error') || 'Error saving. Please try again.', 'error');
        }
    };

    const handleDelete = async () => {
        if (!deletingRule) return;
        const ruleToDelete = deletingRule;
        // Optimistic remove
        setRules(prev => prev.filter(r => r.id !== ruleToDelete.id));
        setDeletingRule(null);
        try {
            const { error } = await supabase.from('recurring_transactions')
                .delete().eq('id', ruleToDelete.id);
            if (error) {
                // Rollback
                setRules(prev => [...prev, ruleToDelete].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
                throw error;
            }
        } catch (err) {
            console.error('Error deleting rule:', err);
            showToast(translate('delete_error') || 'Error deleting. Please try again.', 'error');
        }
    };

    /* ── summary stats ── */
    const totalExpense = rules.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
    const totalIncome  = rules.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
    const net          = totalIncome - totalExpense;
    const sym          = currency || '€';

    /* ────────────────────────────────────────────────────────
       Render
    ──────────────────────────────────────────────────────── */
    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-surface-dark animate-fade-in transition-colors duration-300">

            <div className="bg-gray-50 dark:bg-surface-dark px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4
                            border-b border-gray-100 dark:border-transparent
                            flex items-center sticky top-0 z-10 min-h-[70px] relative backdrop-blur-xl transition-colors duration-300">
                <button
                    onClick={onBack}
                    className="absolute left-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.08]
                               flex items-center justify-center
                               text-gray-500 dark:text-white/50
                               hover:bg-gray-200 dark:hover:bg-white/[0.14]
                               active:scale-90 transition-all duration-150"
                >
                    <ArrowLeft size={15} strokeWidth={2.5} />
                </button>

                {/* Title — takes all available space, truncates if needed */}
                <div className="flex-1 min-w-0 pl-10">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">
                        {translate('recurring_title')}
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-1 truncate">
                        {rules.length} {translate('active_rules') || 'active rules'}
                    </p>
                </div>

                {/* Add button — fixed size, never shrinks */}
                <button
                    onClick={openAdd}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5
                               bg-violet-600 hover:bg-violet-700 text-white
                               text-sm font-bold rounded-xl
                               shadow-lg shadow-violet-500/25
                               transition-all active:scale-95"
                >
                    <Plus size={16} /> {translate('add_recurring') || 'New'}
                </button>
            </div>

            {/* ── Scrollable Content ── */}
            <div className="flex-1 overflow-y-auto">

                {/* ── Hero Summary Card (when rules exist) ── */}
                {rules.length > 0 && (
                    <div className="px-5 pt-5">
                        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700
                                        rounded-3xl p-5 text-white overflow-hidden
                                        shadow-xl shadow-violet-500/20">
                            {/* Decorative orbs */}
                            <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-indigo-900/30 rounded-full blur-2xl" />

                            <div className="relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-violet-200 text-xs font-medium mb-1 flex items-center gap-1.5">
                                            <RefreshCw size={11} /> {translate('monthly_recurring') || 'Monthly Recurring'}
                                        </p>
                                        <p className={`text-4xl font-extrabold tracking-tight ${net >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                                            <Amount value={net} prefix={net >= 0 ? '+' : ''} />
                                        </p>
                                        <p className="text-violet-200 text-xs mt-1">
                                            {translate('net_cash_flow') || 'Net cash flow / month'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold px-3 py-1.5 rounded-2xl bg-white/20">
                                            {rules.length} {translate('rules') || 'rules'}
                                        </span>
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="flex gap-3 mt-4">
                                    <div className="flex-1 bg-white/10 rounded-2xl py-2 px-3 text-center">
                                        <p className="text-violet-200 text-[10px] font-medium flex items-center justify-center gap-1">
                                            <ArrowDownCircle size={9} /> {translate('expenses') || 'Expenses'}
                                        </p>
                                        <p className="text-rose-300 font-bold text-sm mt-0.5">
                                            <Amount value={totalExpense} prefix="-" />
                                        </p>
                                    </div>
                                    <div className="flex-1 bg-white/10 rounded-2xl py-2 px-3 text-center">
                                        <p className="text-violet-200 text-[10px] font-medium flex items-center justify-center gap-1">
                                            <ArrowUpCircle size={9} /> {translate('income') || 'Income'}
                                        </p>
                                        <p className="text-emerald-300 font-bold text-sm mt-0.5">
                                            <Amount value={totalIncome} prefix="+" />
                                        </p>
                                    </div>
                                    <div className="flex-1 bg-white/10 rounded-2xl py-2 px-3 text-center">
                                        <p className="text-violet-200 text-[10px] font-medium flex items-center justify-center gap-1">
                                            <Zap size={9} /> {translate('active') || 'Active'}
                                        </p>
                                        <p className="text-white font-bold text-sm mt-0.5">{rules.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Empty State ── */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                    </div>
                ) : rules.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center px-8">
                        <div className="w-24 h-24 bg-violet-50 dark:bg-violet-900/20 rounded-3xl
                                        flex items-center justify-center mb-5 shadow-inner">
                            <Repeat size={44} className="text-violet-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                            {translate('auto_transactions') || 'No recurring rules yet'}
                        </h3>
                        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-[220px] mb-6 leading-relaxed">
                            {translate('auto_trans_desc') || 'Add your subscriptions, salary, and recurring bills to track them automatically.'}
                        </p>
                        <button
                            onClick={openAdd}
                            className="flex items-center gap-2 px-6 py-3
                                       bg-violet-600 hover:bg-violet-700 text-white
                                       font-bold rounded-2xl shadow-lg shadow-violet-500/25
                                       transition-all active:scale-95"
                        >
                            <Plus size={18} /> {translate('add_recurring') || 'Add Rule'}
                        </button>
                    </div>
                )}

                {/* ── Rule Cards ── */}
                {rules.length > 0 && (
                    <div className="px-5 py-5 space-y-3 pb-10 stagger-children">
                        {rules.map((rule, idx) => {
                            const isIncome = rule.type === 'income';
                            const freq = rule.frequency || 'monthly';
                            const meta = getFreqMeta(freq);

                            return (
                                <div
                                    key={rule.id}
                                    className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden
                                               shadow-sm ring-1 ring-inset ring-gray-100/80 dark:ring-white/5
                                               transition-all duration-300"
                                    style={{ animationDelay: `${idx * 60}ms` }}
                                >
                                    {/* Colour stripe — violet for monthly, cyan for weekly */}
                                    <div className={`h-1 w-full bg-gradient-to-r ${meta.from} ${meta.to}`} />

                                    <div className="p-4">
                                        {/* Top row */}
                                        <div className="flex items-center gap-3 mb-3">
                                            {/* Icon */}
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm
                                                             ${isIncome
                                                    ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
                                                    : 'bg-gradient-to-br from-rose-400 to-red-600'}`}>
                                                {isIncome
                                                    ? <TrendingUp size={18} className="text-white" strokeWidth={2.2} />
                                                    : <TrendingDown size={18} className="text-white" strokeWidth={2.2} />
                                                }
                                            </div>

                                            {/* Title + meta */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-bold text-[14.5px] text-gray-900 dark:text-white truncate">
                                                        {rule.title}
                                                    </h3>
                                                    <span className={`ml-2 flex-shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-lg ${meta.badge}`}>
                                                        {translate(freq) || freq}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Calendar size={10} className="text-gray-400 dark:text-white/50 flex-shrink-0" />
                                                    <span className="text-[11px] text-gray-400 dark:text-white/60 font-medium">
                                                        {translate('every_month_day', { day: rule.day }) || `Day ${rule.day} of each month`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Amount + actions */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-transparent">
                                            <span className={`text-[18px] font-extrabold tracking-tight
                                                             ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                                <Amount value={rule.amount} prefix={isIncome ? '+' : '-'} />
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(rule)}
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                                                               text-indigo-600 dark:text-indigo-400
                                                               bg-indigo-50 dark:bg-indigo-900/20
                                                               hover:bg-indigo-100 dark:hover:bg-indigo-900/40
                                                               transition-colors active:scale-95"
                                                >
                                                    <Pencil size={12} /> {translate('edit') || 'Edit'}
                                                </button>
                                                <button
                                                    onClick={() => setDeletingRule(rule)}
                                                    className="flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold
                                                               text-red-500 bg-red-50 dark:bg-red-900/20
                                                               hover:bg-red-100 dark:hover:bg-red-900/40
                                                               transition-colors active:scale-95"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════
                Add / Edit Modal — portal
            ═══════════════════════════════════════════ */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeModal} />
                    <div className="bg-white dark:bg-surface-dark3 rounded-3xl w-full max-w-sm relative z-10 shadow-2xl overflow-hidden animate-pop">

                        {/* Accent stripe */}
                        <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {editingRule ? (translate('edit_rule') || 'Edit Rule') : (translate('new_rule') || 'New Rule')}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {editingRule ? (translate('edit_rule_desc') || 'Modify the details below') : (translate('new_rule_desc') || 'Set up your recurring transaction')}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-gray-400 dark:text-black rounded-xl bg-gray-100 dark:bg-white hover:bg-gray-200 dark:hover:bg-gray-100 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                {/* Title */}
                                <Field
                                    label={translate('title') || 'Title'}
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Netflix, Rent, Salary…"
                                    required
                                    autoFocus={!editingRule}
                                />

                                {/* Amount */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                        {translate('amount') || 'Amount'} ({sym})
                                    </label>
                                    <div className="relative">
                                        {!privacyMode && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">{sym}</span>}
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            required
                                            className="w-full pl-10 pr-4 p-3.5 bg-gray-50 dark:bg-white/5
                                                       border border-gray-200 dark:border-transparent
                                                       rounded-2xl text-sm font-medium text-gray-900 dark:text-white
                                                       placeholder:text-gray-300 dark:placeholder:text-gray-600
                                                       focus:outline-none focus:ring-2 focus:ring-violet-500
                                                       dark:focus:ring-violet-400 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Type pill selector */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 dark:text-white/60 mb-1.5 uppercase tracking-widest">
                                        {translate('type') || 'Type'}
                                    </label>
                                    <div className="flex bg-gray-100 dark:bg-white/[0.06] rounded-xl p-1">
                                        {['expense', 'income'].map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setType(t)}
                                                className={`flex-1 py-2.5 text-[12px] font-bold rounded-lg transition-all duration-200
                                                            ${type === t
                                                        ? t === 'expense'
                                                            ? 'bg-white dark:bg-white/[0.12] shadow-sm text-rose-500'
                                                            : 'bg-white dark:bg-white/[0.12] shadow-sm text-emerald-500'
                                                        : 'text-gray-400 dark:text-white/50'}`}
                                            >
                                                {translate(t) || t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Frequency + Day */}
                                <div className="grid grid-cols-2 gap-3">
                                    <SelectField
                                        label={translate('frequency') || 'Frequency'}
                                        value={frequency}
                                        onChange={e => setFrequency(e.target.value)}
                                    >
                                        <option value="monthly">{translate('monthly') || 'Monthly'}</option>
                                        <option value="weekly" disabled>{translate('weekly') || 'Weekly'} (Soon)</option>
                                    </SelectField>
                                    <SelectField
                                        label={translate('day_of_month') || 'Day of month'}
                                        value={day}
                                        onChange={e => setDay(e.target.value)}
                                    >
                                        {[...Array(31)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </SelectField>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-3.5 bg-gray-100 dark:bg-white
                                                   text-gray-600 dark:text-black font-bold
                                                   rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-100
                                                   transition-colors active:scale-95 text-sm"
                                    >
                                        {translate('cancel') || 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3.5 bg-violet-600 text-white font-bold
                                                   rounded-2xl shadow-lg shadow-violet-500/25
                                                   hover:bg-violet-700 transition-all active:scale-95
                                                   flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Check size={16} />
                                        {editingRule ? (translate('update') || 'Update') : (translate('save') || 'Save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ═══════════════════════════════════════════
                Delete Confirmation Modal
            ═══════════════════════════════════════════ */}
            <ConfirmationModal
                isOpen={!!deletingRule}
                onClose={() => setDeletingRule(null)}
                onConfirm={handleDelete}
                title={translate('delete_recurring_title') || 'Delete Rule'}
                message={deletingRule
                    ? (translate('delete_recurring_confirm') || `Delete "${deletingRule.title}"? This cannot be undone.`)
                    : ''}
                confirmText={translate('delete') || 'Delete'}
                type="danger"
            />
        </div>
    );
};

export default RecurringView;









