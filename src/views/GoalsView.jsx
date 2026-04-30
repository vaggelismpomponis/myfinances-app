import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    ArrowLeft, Target, Plus, Trash2, PiggyBank, Pencil,
    Check, X, Sparkles, TrendingUp, Trophy, Star
} from 'lucide-react';
import { supabase } from '../supabase';
import Amount from '../components/Amount';
import { useSettings } from '../contexts/SettingsContext';

/* ─────────────────────────────────────────────────────────────
   Goal icon / colour presets
───────────────────────────────────────────────────────────── */
const GOAL_PRESETS = [
    { emoji: '✈️',  label: 'Ταξίδι',       color: 'from-sky-500 to-blue-600',        bar: '#38bdf8' },
    { emoji: '🏠',  label: 'Σπίτι',         color: 'from-emerald-500 to-teal-600',    bar: '#34d399' },
    { emoji: '🚗',  label: 'Αυτοκίνητο',   color: 'from-orange-500 to-amber-600',    bar: '#fb923c' },
    { emoji: '💻',  label: 'Τεχνολογία',   color: 'from-violet-500 to-purple-600',   bar: '#a78bfa' },
    { emoji: '🎓',  label: 'Εκπαίδευση',   color: 'from-indigo-500 to-blue-600',     bar: '#818cf8' },
    { emoji: '💍',  label: 'Γάμος',         color: 'from-rose-500 to-pink-600',       bar: '#fb7185' },
    { emoji: '🏥',  label: 'Υγεία',         color: 'from-red-500 to-rose-600',        bar: '#f87171' },
    { emoji: '🎮',  label: 'Ψυχαγωγία',    color: 'from-fuchsia-500 to-violet-600',  bar: '#e879f9' },
    { emoji: '🐾',  label: 'Κατοικίδιο',   color: 'from-yellow-500 to-amber-500',    bar: '#fbbf24' },
    { emoji: '🎯',  label: 'Άλλο',          color: 'from-gray-500 to-slate-600',      bar: '#94a3b8' },
];

const getPreset = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('ταξ') || t.includes('trav')) return GOAL_PRESETS[0];
    if (t.includes('σπίτ') || t.includes('home')) return GOAL_PRESETS[1];
    if (t.includes('αυτ') || t.includes('car'))  return GOAL_PRESETS[2];
    if (t.includes('τεχ') || t.includes('laptop') || t.includes('phone')) return GOAL_PRESETS[3];
    if (t.includes('εκπ') || t.includes('study')) return GOAL_PRESETS[4];
    if (t.includes('γάμ') || t.includes('wed'))  return GOAL_PRESETS[5];
    if (t.includes('υγ') || t.includes('health')) return GOAL_PRESETS[6];
    if (t.includes('παιχ') || t.includes('game')) return GOAL_PRESETS[7];
    if (t.includes('σκύλ') || t.includes('γάτ'))  return GOAL_PRESETS[8];
    return GOAL_PRESETS[9];
};

/* ─────────────────────────────────────────────────────────────
   Circular SVG progress ring
───────────────────────────────────────────────────────────── */
const Ring = ({ pct, color, size = 72, stroke = 7, children }) => {
    const r   = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    const completed = pct >= 100;

    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke="currentColor"
                    strokeWidth={stroke}
                    className="text-gray-100 dark:text-white/8"
                />
                <circle
                    cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke={completed ? '#10b981' : color}
                    strokeWidth={stroke}
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1)' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   Styled input
───────────────────────────────────────────────────────────── */
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

/* ═══════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════ */
const GoalsView = ({ user, onBack }) => {
    const { t, privacyMode } = useSettings();
    const [goals, setGoals] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ── modal state ───────────────────────────────────────
    const [showAddModal,   setShowAddModal]   = useState(false);
    const [editingGoal,    setEditingGoal]    = useState(null);
    const [deletingGoal,   setDeletingGoal]   = useState(null);
    const [showMoneyModal, setShowMoneyModal] = useState(false);
    const [selectedGoal,   setSelectedGoal]   = useState(null);

    // ── add / edit form ───────────────────────────────────
    const [formTitle,   setFormTitle]   = useState('');
    const [formTarget,  setFormTarget]  = useState('');
    const [formCurrent, setFormCurrent] = useState('');

    // ── numpad ────────────────────────────────────────────
    const [addMoneyAmount, setAddMoneyAmount] = useState('');

    /* ── data ── */
    useEffect(() => {
        if (!user) return;
        const fetch = async () => {
            const { data, error } = await supabase
                .from('goals').select('*').eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (!error) setGoals(data || []);
            setIsLoading(false);
        };
        fetch();
        const ch = supabase.channel('goals-v2')
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'goals',
                filter: `user_id=eq.${user.id}`
            }, fetch)
            .subscribe();
        return () => supabase.removeChannel(ch);
    }, [user]);

    /* ── handlers ── */
    const openAdd = () => {
        setFormTitle(''); setFormTarget(''); setFormCurrent('');
        setShowAddModal(true);
    };

    const openEdit = (g) => {
        setEditingGoal(g);
        setFormTitle(g.title);
        setFormTarget(String(g.target_amount));
        setFormCurrent(String(g.current_amount || 0));
    };

    const closeAdd  = () => { setShowAddModal(false);  setEditingGoal(null); };
    const closeMoney = () => { setShowMoneyModal(false); setSelectedGoal(null); setAddMoneyAmount(''); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formTitle || !formTarget) return;
        const payload = {
            title: formTitle,
            target_amount:   parseFloat(formTarget),
            current_amount:  parseFloat(formCurrent) || 0,
        };
        try {
            if (editingGoal) {
                // Optimistic update
                const optimisticGoal = { ...editingGoal, ...payload };
                setGoals(prev => prev.map(g => g.id === editingGoal.id ? optimisticGoal : g));
                closeAdd();

                const { error } = await supabase.from('goals')
                    .update(payload).eq('id', editingGoal.id);
                if (error) {
                    // Rollback
                    setGoals(prev => prev.map(g => g.id === editingGoal.id ? editingGoal : g));
                    throw error;
                }
            } else {
                const { data, error } = await supabase.from('goals')
                    .insert({ ...payload, user_id: user.id })
                    .select().single();
                if (error) throw error;
                // Optimistic add
                setGoals(prev => [data, ...prev]);
                closeAdd();
            }
        } catch (err) { console.error(err); }
    };

    const handleDelete = async () => {
        if (!deletingGoal) return;
        const goalToDelete = deletingGoal;
        // Optimistic remove
        setGoals(prev => prev.filter(g => g.id !== goalToDelete.id));
        setDeletingGoal(null);
        try {
            const { error } = await supabase.from('goals').delete().eq('id', goalToDelete.id);
            if (error) {
                // Rollback
                setGoals(prev => [...prev, goalToDelete].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
                throw error;
            }
        } catch (err) { console.error(err); }
    };

    const handleAddMoney = async () => {
        if (!selectedGoal || !addMoneyAmount) return;
        const newAmt = (selectedGoal.current_amount || 0) + parseFloat(addMoneyAmount);
        const prevGoal = selectedGoal;
        // Optimistic update
        setGoals(prev => prev.map(g => g.id === selectedGoal.id ? { ...g, current_amount: newAmt } : g));
        closeMoney();
        try {
            const { error } = await supabase.from('goals')
                .update({ current_amount: newAmt }).eq('id', selectedGoal.id);
            if (error) {
                // Rollback
                setGoals(prev => prev.map(g => g.id === prevGoal.id ? prevGoal : g));
                throw error;
            }
        } catch (err) { console.error(err); }
    };

    const handleNumpad = (key) => {
        if (key === '⌫') {
            setAddMoneyAmount(p => p.slice(0, -1));
        } else if (key === '.') {
            if (!addMoneyAmount.includes('.')) setAddMoneyAmount(p => p + '.');
        } else {
            if (addMoneyAmount === '0') setAddMoneyAmount(key);
            else setAddMoneyAmount(p => p + key);
        }
    };

    /* ── summary stats ── */
    const totalTarget  = goals.reduce((s, g) => s + g.target_amount, 0);
    const totalSaved   = goals.reduce((s, g) => s + (g.current_amount || 0), 0);
    const totalPct     = totalTarget > 0 ? Math.min(100, (totalSaved / totalTarget) * 100) : 0;
    const completedCnt = goals.filter(g => (g.current_amount || 0) >= g.target_amount).length;

    /* ─────────────────────────────────────────────────────
       Render
    ───────────────────────────────────────────────────── */
    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-surface-dark animate-fade-in transition-colors duration-300">

            {/* ── Sticky Header ── */}
            <div className="bg-white dark:bg-surface-dark px-5 pt-12 pb-4
                            shadow-sm border-b border-gray-100 dark:border-transparent
                            flex items-center justify-between sticky top-0 z-10 min-h-[70px] relative">
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
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none">{t('goals')}</h2>
                        <p className="text-xs text-gray-400 mt-1">
                            {goals.length} {t('active').toLowerCase()} · {completedCnt} {t('completed_short')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-4 py-2.5
                               bg-violet-600 hover:bg-violet-700 text-white
                               text-sm font-bold rounded-xl
                               shadow-lg shadow-violet-500/25
                               transition-all active:scale-95"
                >
                    <Plus size={16} /> {t('add_recurring')}
                </button>
            </div>

            {/* ── Scrollable Content ── */}
            <div className="flex-1 overflow-y-auto">

                {/* ── Hero Summary Card (when goals exist) ── */}
                {goals.length > 0 && (
                    <div className="px-5 pt-5">
                        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700
                                        rounded-3xl p-5 text-white overflow-hidden
                                        shadow-xl shadow-violet-500/20">
                            {/* Decorative orbs */}
                            <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-indigo-900/30 rounded-full blur-2xl" />

                            <div className="relative flex items-center gap-5">
                                {/* Circular progress */}
                                <Ring pct={totalPct} color="#c4b5fd" size={88} stroke={8}>
                                    <div className="text-center">
                                        <p className="text-[15px] font-extrabold leading-none">{totalPct.toFixed(0)}%</p>
                                        <p className="text-[9px] text-white/60 mt-0.5 font-medium">{t('progress')}</p>
                                    </div>
                                </Ring>

                                <div className="flex-1 min-w-0">
                                    <p className="text-violet-200 text-[11px] font-semibold mb-1 flex items-center gap-1.5 uppercase tracking-wide">
                                        <Sparkles size={10} /> {t('total_savings')}
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-tight">
                                        <Amount value={totalSaved} minimumFractionDigits={0} />
                                    </p>
                                    <p className="text-violet-200 text-xs mt-0.5">
                                        {t('of_goal')} <Amount value={totalTarget} minimumFractionDigits={0} />
                                    </p>

                                    <div className="flex gap-2 mt-3">
                                        <div className="flex-1 bg-white/10 rounded-xl py-1.5 px-2 text-center">
                                            <p className="text-violet-200 text-[9px] font-medium">{t('goals')}</p>
                                            <p className="text-white font-bold text-sm">{goals.length}</p>
                                        </div>
                                        <div className="flex-1 bg-white/10 rounded-xl py-1.5 px-2 text-center">
                                            <p className="text-violet-200 text-[9px] font-medium">{t('completed_short')}</p>
                                            <p className={`font-bold text-sm ${completedCnt > 0 ? 'text-emerald-300' : 'text-white'}`}>
                                                {completedCnt}
                                            </p>
                                        </div>
                                        <div className="flex-1 bg-white/10 rounded-xl py-1.5 px-2 text-center">
                                            <p className="text-violet-200 text-[9px] font-medium">{t('remaining_short')}</p>
                                            <p className="text-white font-bold text-sm">
                                                <Amount value={Math.max(0, totalTarget - totalSaved)} maximumFractionDigits={0} />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Goal Cards ── */}
                <div className="px-5 py-5 space-y-3 pb-10">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                        </div>
                    ) : goals.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-24 h-24 bg-violet-50 dark:bg-violet-900/20
                                            rounded-3xl flex items-center justify-center mb-5
                                            shadow-inner">
                                <Target size={44} className="text-violet-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {t('no_goals')}
                            </h3>
                            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-[220px] mb-6 leading-relaxed">
                                {t('create_first_goal')}
                            </p>
                            <button
                                onClick={openAdd}
                                className="flex items-center gap-2 px-6 py-3
                                           bg-violet-600 hover:bg-violet-700 text-white
                                           font-bold rounded-2xl shadow-lg shadow-violet-500/25
                                           transition-all active:scale-95"
                            >
                                <Plus size={18} /> {t('create_goal')}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 stagger-children">
                            {goals.map((goal, idx) => {
                                const pct       = Math.min(100, ((goal.current_amount || 0) / goal.target_amount) * 100);
                                const done      = pct >= 100;
                                const preset    = getPreset(goal.title);
                                const remaining = Math.max(0, goal.target_amount - (goal.current_amount || 0));

                                return (
                                    <div
                                        key={goal.id}
                                        className={`bg-white dark:bg-surface-dark rounded-2xl overflow-hidden
                                                    shadow-sm ring-1 ring-inset transition-all duration-300
                                                    ${done ? 'ring-emerald-500/30' : 'ring-gray-100/80 dark:ring-white/5'}`}
                                        style={{ animationDelay: `${idx * 60}ms` }}
                                    >
                                        {/* Colour stripe */}
                                        <div className={`h-1 w-full bg-gradient-to-r ${done ? 'from-emerald-400 to-teal-500' : preset.color}`} />

                                        <div className="p-4">
                                            {/* Top row */}
                                            <div className="flex items-center gap-3 mb-3">
                                                {/* Ring + emoji */}
                                                <Ring pct={pct} color={preset.bar} size={56} stroke={5}>
                                                    <span className="text-xl leading-none">
                                                        {done ? '🏆' : preset.emoji}
                                                    </span>
                                                </Ring>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-bold text-[14.5px] text-gray-900 dark:text-white truncate">
                                                            {goal.title}
                                                        </h3>
                                                        <span className={`ml-2 flex-shrink-0 text-xs font-bold px-2.5 py-0.5 rounded-lg
                                                            ${done
                                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400'
                                                            }`}>
                                                            {pct.toFixed(0)}%
                                                        </span>
                                                    </div>

                                                    {/* Amount row */}
                                                    <div className="flex items-center justify-between mt-0.5">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                            <span className="text-gray-700 dark:text-white/90 font-bold">
                                                                <Amount value={goal.current_amount || 0} minimumFractionDigits={0} />
                                                            </span>
                                                            {' / '}
                                                            <Amount value={goal.target_amount} minimumFractionDigits={0} />
                                                        </p>
                                                        {done ? (
                                                            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                                                                <Star size={9} fill="currentColor" /> {t('completed_exclamation')}
                                                            </span>
                                                        ) : (
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                                                {t('remaining_amount_goal').replace('{amount}', '')} <Amount value={remaining} maximumFractionDigits={0} />
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/8 rounded-full overflow-hidden mb-3">
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${pct}%`,
                                                        background: done ? '#10b981' : preset.bar
                                                    }}
                                                />
                                            </div>

                                            {/* Action Row */}
                                            <div className="flex gap-2 pt-3 border-t border-gray-50 dark:border-transparent">
                                                <button
                                                    onClick={() => openEdit(goal)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2
                                                               rounded-xl text-xs font-semibold
                                                               text-indigo-600 dark:text-indigo-400
                                                               bg-indigo-50 dark:bg-indigo-900/20
                                                               hover:bg-indigo-100 dark:hover:bg-indigo-900/40
                                                               transition-colors active:scale-95"
                                                >
                                                    <Pencil size={12} /> {t('edit')}
                                                </button>
                                                {!done && (
                                                    <button
                                                        onClick={() => { setSelectedGoal(goal); setShowMoneyModal(true); }}
                                                        className="flex-1 flex items-center justify-center gap-1.5 py-2
                                                                   rounded-xl text-xs font-semibold
                                                                   text-emerald-600 dark:text-emerald-400
                                                                   bg-emerald-50 dark:bg-emerald-900/20
                                                                   hover:bg-emerald-100 dark:hover:bg-emerald-900/40
                                                                   transition-colors active:scale-95"
                                                    >
                                                        <PiggyBank size={12} /> {t('deposit')}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => setDeletingGoal(goal)}
                                                    className="flex items-center justify-center gap-1.5 px-4 py-2
                                                               rounded-xl text-xs font-semibold
                                                               text-red-500 bg-red-50 dark:bg-red-900/20
                                                               hover:bg-red-100 dark:hover:bg-red-900/40
                                                               transition-colors active:scale-95"
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

            {/* ═══════════════════════════════════════════
                Add / Edit Modal  — portal
            ═══════════════════════════════════════════ */}
            {(showAddModal || editingGoal) && createPortal(
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md"
                         onClick={closeAdd} />
                    <div className="bg-white dark:bg-surface-dark3 rounded-3xl w-full max-w-sm
                                    relative z-10 shadow-2xl overflow-hidden animate-pop">

                        {/* Accent stripe */}
                        <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {editingGoal ? t('edit_goal') : t('new_goal')}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {editingGoal ? t('edit_rule_desc') : t('new_rule_desc')}
                                    </p>
                                </div>
                                <button
                                    onClick={closeAdd}
                                    className="p-2 text-gray-400 dark:text-black rounded-xl bg-gray-100 dark:bg-white hover:bg-gray-200 dark:hover:bg-gray-100 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                <Field
                                    label={t('goal_title')}
                                    type="text"
                                    placeholder="π.χ. Ταξίδι στο Παρίσι ✈️"
                                    value={formTitle}
                                    onChange={e => setFormTitle(e.target.value)}
                                    required
                                    autoFocus={!editingGoal}
                                />
                                <Field
                                    label={t('goal_amount')}
                                    type="number"
                                    placeholder="1 500"
                                    value={formTarget}
                                    onChange={e => setFormTarget(e.target.value)}
                                    required
                                    min="1"
                                />
                                <Field
                                    label={t('initial_amount')}
                                    type="number"
                                    placeholder="0"
                                    value={formCurrent}
                                    onChange={e => setFormCurrent(e.target.value)}
                                    min="0"
                                />

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={closeAdd}
                                        className="flex-1 py-3.5 bg-gray-100 dark:bg-white
                                                   text-gray-600 dark:text-black font-bold
                                                   rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-100
                                                   transition-colors active:scale-95 text-sm"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3.5 bg-violet-600 text-white font-bold
                                                   rounded-2xl shadow-lg shadow-violet-500/25
                                                   hover:bg-violet-700 transition-all active:scale-95
                                                   flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Check size={16} />
                                        {editingGoal ? t('update') : t('save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ═══════════════════════════════════════════
                Delete Confirmation Modal — portal
            ═══════════════════════════════════════════ */}
            {deletingGoal && createPortal(
                <div className="fixed inset-0 z-[200] flex items-end justify-center p-5 pb-8 animate-fade-in sm:items-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md"
                         onClick={() => setDeletingGoal(null)} />
                    <div className="bg-white dark:bg-surface-dark3 rounded-3xl w-full max-w-sm
                                    relative z-10 shadow-2xl overflow-hidden animate-slide-up">
                        <div className="h-1 bg-gradient-to-r from-red-500 to-rose-500" />
                        <div className="p-6">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-3xl
                                                flex items-center justify-center text-red-500 dark:text-red-400 mb-4">
                                    <Trash2 size={28} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {t('delete_goal')}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                                    {t('delete_goal_confirm')}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeletingGoal(null)}
                                    className="flex-1 py-3.5 bg-gray-100 dark:bg-white
                                               text-gray-700 dark:text-black font-bold
                                               rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-100
                                               transition-colors active:scale-95 text-sm"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white
                                               font-bold rounded-2xl shadow-lg shadow-red-500/25
                                               transition-all active:scale-95
                                               flex items-center justify-center gap-2 text-sm"
                                >
                                    <Trash2 size={15} /> {t('delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ═══════════════════════════════════════════
                Add Money Bottom-Sheet — portal
            ═══════════════════════════════════════════ */}
            {showMoneyModal && selectedGoal && createPortal(
                <div className="fixed inset-0 z-[200] flex items-end justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md"
                         onClick={closeMoney} />
                    <div className="bg-white dark:bg-surface-dark3 rounded-t-3xl w-full max-w-sm
                                    relative z-10 shadow-2xl overflow-hidden animate-slide-up">

                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-gray-300 dark:bg-white/20 rounded-full" />
                        </div>

                        {/* Modal Header */}
                        <div className="flex items-center gap-3 px-6 py-3">
                            <div className="p-2.5 bg-violet-100 dark:bg-violet-900/30
                                            text-violet-600 dark:text-violet-400 rounded-2xl">
                                <PiggyBank size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{t('deposit')}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                    {selectedGoal.title}
                                </p>
                            </div>
                            <button onClick={closeMoney}
                                    className="ml-auto p-2 text-gray-400 dark:text-black rounded-xl bg-gray-100 dark:bg-white hover:bg-gray-200 dark:hover:bg-gray-100 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Progress mini-preview */}
                        {(() => {
                            const cur = selectedGoal.current_amount || 0;
                            const added = parseFloat(addMoneyAmount) || 0;
                            const newCur = Math.min(selectedGoal.target_amount, cur + added);
                            const newPct = (newCur / selectedGoal.target_amount) * 100;
                            const preset = getPreset(selectedGoal.title);
                            return (
                                <div className="mx-6 mb-3 p-3 bg-gray-50 dark:bg-white/5 rounded-2xl">
                                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                                        <span className="text-gray-500 dark:text-gray-400">
                                            <Amount value={cur} /> → <span className="text-violet-600 dark:text-violet-400"><Amount value={newCur} /></span>
                                        </span>
                                        <span className="text-gray-400"><Amount value={selectedGoal.target_amount} /></span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${newPct}%`, background: preset.bar }}
                                        />
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Amount Display */}
                        <div className="px-6 py-3 text-center">
                            <p className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                 {addMoneyAmount || '0'}
                                {!privacyMode && <span className="text-2xl text-gray-400 dark:text-gray-500 ml-1.5">€</span>}
                            </p>
                        </div>

                        {/* Numpad */}
                        <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-white/5
                                        border-t border-gray-100 dark:border-transparent">
                            {['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(key => (
                                <button
                                    key={key}
                                    onClick={() => handleNumpad(key)}
                                    className={`py-4 text-xl font-semibold
                                                bg-white dark:bg-surface-dark3
                                                hover:bg-gray-50 dark:hover:bg-white/5
                                                active:bg-gray-100 dark:active:bg-white/10
                                                transition-colors
                                                ${key === '⌫' ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 p-4 pb-8">
                            <button
                                onClick={closeMoney}
                                className="flex-1 py-3.5 bg-gray-100 dark:bg-white text-gray-700 dark:text-black font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-100 transition-colors active:scale-95 text-sm"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                onClick={handleAddMoney}
                                disabled={!addMoneyAmount || addMoneyAmount === '0'}
                                className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600
                                           disabled:opacity-40 text-white font-bold
                                           rounded-2xl shadow-lg shadow-emerald-500/25
                                           transition-all active:scale-95
                                           flex items-center justify-center gap-2 text-sm"
                            >
                                <TrendingUp size={16} /> {t('deposit')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default GoalsView;









