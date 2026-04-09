import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Calendar,
    Repeat,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    Pencil,
    X,
    ChevronRight,
    Zap
} from 'lucide-react';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    updateDoc
} from 'firebase/firestore';
import { db, appId } from '../firebase';
import { useSettings } from '../contexts/SettingsContext';

/* ─── Section Label ─── */
const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-white/30 mb-2 ml-1 px-1">
        {children}
    </p>
);

/* ── Type pill selector ── */
const TypeSelector = ({ value, onChange, translate }) => (
    <div className="flex bg-gray-100 dark:bg-white/[0.06] rounded-xl p-1">
        {['expense', 'income'].map(t => (
            <button
                key={t}
                type="button"
                onClick={() => onChange(t)}
                className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all duration-200
                            ${value === t
                        ? t === 'expense'
                            ? 'bg-white dark:bg-white/[0.12] shadow-sm text-rose-500'
                            : 'bg-white dark:bg-white/[0.12] shadow-sm text-emerald-500'
                        : 'text-gray-400 dark:text-white/30'}`}
            >
                {translate(t)}
            </button>
        ))}
    </div>
);

/* ── Styled select ── */
const StyledSelect = ({ label, value, onChange, children }) => (
    <div>
        <label className="block text-[11px] font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wide mb-1.5">
            {label}
        </label>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-white/[0.05]
                           border border-gray-200 dark:border-white/[0.08]
                           rounded-xl text-[14px] text-gray-800 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-violet-500/40
                           transition-all appearance-none pr-8 cursor-pointer"
            >
                {children}
            </select>
            <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 dark:text-white/30 pointer-events-none" />
        </div>
    </div>
);

/* ── Styled input ── */
const StyledInput = ({ label, ...props }) => (
    <div>
        <label className="block text-[11px] font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wide mb-1.5">
            {label}
        </label>
        <input
            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/[0.05]
                       border border-gray-200 dark:border-white/[0.08]
                       rounded-xl text-[14px] text-gray-800 dark:text-white
                       placeholder:text-gray-300 dark:placeholder:text-white/20
                       focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
            {...props}
        />
    </div>
);

const RecurringView = ({ user, onBack }) => {
    const { t: translate } = useSettings();
    const [rules, setRules] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);

    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [frequency, setFrequency] = useState('monthly');
    const [day, setDay] = useState('1');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'recurring_transactions'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setRules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const resetForm = () => {
        setShowAddForm(false);
        setEditingId(null);
        setTitle('');
        setAmount('');
        setType('expense');
        setFrequency('monthly');
        setDay('1');
    };

    const handleAddRule = async (e) => {
        e.preventDefault();
        if (!title || !amount) return;
        try {
            if (editingId) {
                await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'recurring_transactions', editingId), {
                    title, amount: parseFloat(amount), type, frequency, day: parseInt(day),
                });
            } else {
                await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'recurring_transactions'), {
                    title, amount: parseFloat(amount), type, frequency, day: parseInt(day),
                    createdAt: new Date().toISOString(), lastProcessed: null
                });
            }
            resetForm();
        } catch (error) {
            console.error("Error adding rule:", error);
            alert("Error saving rule.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(translate('delete_recurring_confirm') || 'Delete this recurring transaction?')) {
            try {
                await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'recurring_transactions', id));
            } catch (error) {
                console.error("Error deleting rule:", error);
            }
        }
    };

    const handleEdit = (rule) => {
        setEditingId(rule.id);
        setTitle(rule.title);
        setAmount(rule.amount.toString());
        setType(rule.type);
        setFrequency(rule.frequency || 'monthly');
        setDay(rule.day.toString());
        setShowAddForm(true);
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-[#0f0f14] flex flex-col animate-fade-in transition-colors duration-300">

            {/* ───────── Header ───────── */}
            <div className="shrink-0 bg-white dark:bg-white/[0.03]
                            border-b border-gray-100 dark:border-white/[0.06]
                            shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:shadow-none
                            px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 sticky top-0 z-10
                            backdrop-blur-xl transition-colors duration-300">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/[0.07]
                                       flex items-center justify-center
                                       text-gray-600 dark:text-white/60
                                       hover:bg-gray-200 dark:hover:bg-white/[0.12]
                                       active:scale-90 transition-all"
                        >
                            <ArrowLeft size={17} strokeWidth={2.5} />
                        </button>
                        <div>
                            <h2 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">
                                {translate('recurring_title')}
                            </h2>
                            <p className="text-[11px] text-gray-400 dark:text-white/35">Auto-scheduled payments</p>
                        </div>
                    </div>
                    {!showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                                       bg-violet-600 hover:bg-violet-700
                                       text-white text-[12px] font-bold
                                       shadow-[0_2px_12px_rgba(124,58,237,0.4)]
                                       active:scale-95 transition-all"
                        >
                            <Plus size={14} strokeWidth={2.5} />
                            {translate('add_recurring')}
                        </button>
                    )}
                </div>
            </div>

            {/* ───────── Content ───────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-10">

                {/* Empty State */}
                {!showAddForm && rules.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
                        <div className="w-20 h-20 rounded-[24px] bg-violet-50 dark:bg-violet-500/10
                                        flex items-center justify-center mb-5
                                        shadow-[0_0_32px_rgba(124,58,237,0.12)]">
                            <Repeat size={34} className="text-violet-500 dark:text-violet-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-bold text-[17px] text-gray-900 dark:text-white mb-2">
                            {translate('auto_transactions')}
                        </h3>
                        <p className="text-[13px] text-gray-400 dark:text-white/35 leading-relaxed max-w-xs">
                            {translate('auto_trans_desc')}
                        </p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="mt-6 flex items-center gap-2 px-5 py-3 rounded-2xl
                                       bg-violet-600 hover:bg-violet-700 text-white font-bold text-[13px]
                                       shadow-[0_4px_16px_rgba(124,58,237,0.35)]
                                       active:scale-95 transition-all"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            {translate('add_recurring')}
                        </button>
                    </div>
                )}

                {/* Rules List */}
                {rules.length > 0 && (
                    <div>
                        <SectionLabel>Active rules ({rules.length})</SectionLabel>
                        <div className="space-y-3">
                            {rules.map(rule => (
                                <div
                                    key={rule.id}
                                    className="bg-white dark:bg-white/[0.04] rounded-2xl
                                               border border-gray-100 dark:border-white/[0.06]
                                               shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-none
                                               overflow-hidden"
                                >
                                    <div className="flex items-center gap-3.5 p-4">
                                        {/* Icon */}
                                        <div className={`w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0
                                                          ${rule.type === 'income'
                                                ? 'bg-emerald-50 dark:bg-emerald-500/10'
                                                : 'bg-rose-50 dark:bg-rose-500/10'}`}>
                                            {rule.type === 'income'
                                                ? <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                                                : <TrendingDown size={18} className="text-rose-500" strokeWidth={2} />
                                            }
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-[14px] text-gray-900 dark:text-white truncate">{rule.title}</h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <Calendar size={10} className="text-gray-400 dark:text-white/30" />
                                                <span className="text-[11px] text-gray-400 dark:text-white/35">
                                                    {translate('every_month_day', { day: rule.day })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Amount + actions */}
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span className={`text-[15px] font-bold
                                                              ${rule.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                                                {rule.type === 'income' ? '+' : '-'}{rule.amount.toFixed(2)}€
                                            </span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEdit(rule)}
                                                    className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/[0.06]
                                                               flex items-center justify-center
                                                               text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10
                                                               active:scale-90 transition-all"
                                                >
                                                    <Pencil size={12} strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rule.id)}
                                                    className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/[0.06]
                                                               flex items-center justify-center
                                                               text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10
                                                               active:scale-90 transition-all"
                                                >
                                                    <Trash2 size={12} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add / Edit Form */}
                {showAddForm && (
                    <div className="bg-white dark:bg-white/[0.04] rounded-2xl overflow-hidden
                                    border border-gray-100 dark:border-white/[0.06]
                                    shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-none
                                    animate-slide-in-up">
                        {/* Form Header */}
                        <div className="flex items-center justify-between px-5 pt-5 pb-4
                                        border-b border-gray-100 dark:border-white/[0.06]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-[10px] bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                                    <Zap size={15} className="text-violet-600 dark:text-violet-400" strokeWidth={2.2} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[14px] text-gray-900 dark:text-white leading-tight">
                                        {editingId ? translate('edit_rule') : translate('new_rule')}
                                    </h3>
                                    <p className="text-[11px] text-gray-400 dark:text-white/35">Fill in the details below</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.07]
                                           flex items-center justify-center
                                           text-gray-400 hover:text-gray-600 dark:hover:text-white/60
                                           active:scale-90 transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleAddRule} className="p-5 space-y-4">
                            <StyledInput
                                label={translate('title')}
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Netflix, Rent..."
                                required
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <StyledInput
                                    label={`${translate('amount')} (€)`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                                <div>
                                    <label className="block text-[11px] font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wide mb-1.5">
                                        {translate('type')}
                                    </label>
                                    <TypeSelector value={type} onChange={setType} translate={translate} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <StyledSelect label={translate('frequency')} value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                                    <option value="monthly">{translate('monthly')}</option>
                                    <option value="weekly" disabled>{translate('weekly')} (Soon)</option>
                                </StyledSelect>
                                <StyledSelect label={translate('day_of_month')} value={day} onChange={(e) => setDay(e.target.value)}>
                                    {[...Array(31)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </StyledSelect>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 mt-1 rounded-xl font-bold text-[14px] text-white
                                           bg-violet-600 hover:bg-violet-700
                                           shadow-[0_4px_16px_rgba(124,58,237,0.35)]
                                           active:scale-[0.98] transition-all
                                           flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={17} strokeWidth={2.2} />
                                {translate('save')}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecurringView;
