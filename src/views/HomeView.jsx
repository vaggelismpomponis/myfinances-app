import React from 'react';
import {
    TrendingUp, TrendingDown, Target, Repeat,
    ChevronRight, Sparkles, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import TransactionItem from '../components/TransactionItem';
import { useSettings } from '../contexts/SettingsContext';

const QuickAction = ({ icon: Icon, label, color, bg, onClick }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-2 press-effect"
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center
                         shadow-sm
                         ${bg} transition-all duration-200 hover:scale-105`}>
            <Icon size={22} className={color} />
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
    </button>
);

const HomeView = ({ balance, totalIncome, totalExpense, transactions, onDelete, onEdit, setActiveTab }) => {
    const { t } = useSettings();
    const isPositive = balance >= 0;

    return (
        <div className="space-y-5 pb-28 animate-fade-in">

            {/* ── Hero Balance Card ── */}
            <div className="relative overflow-hidden rounded-3xl
                            bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700
                            p-6 text-white shadow-glow-violet">

                {/* Decorative background mesh */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                    <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full
                                    bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full
                                    bg-indigo-400/20 blur-xl" />
                    <div className="absolute top-4 left-1/2 w-24 h-24 rounded-full
                                    bg-violet-400/15 blur-xl" />
                    {/* Subtle grid */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.04]"
                         xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                <div className="relative z-10">
                    {/* Label & sync */}
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-violet-200 text-xs font-semibold tracking-widest uppercase">
                            {t('total_balance')}
                        </p>
                        <div className="flex items-center gap-1.5 glass
                                        px-2.5 py-1 rounded-full text-[10px] font-bold text-violet-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow-pulse" />
                            Cloud Sync
                        </div>
                    </div>

                    {/* Balance */}
                    <div className="flex items-end gap-3 mb-6">
                        <h1 className="text-5xl font-black tracking-tight leading-none">
                            {Math.abs(balance).toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h1>
                        <span className="text-xl font-bold text-violet-200 mb-1">€</span>
                        {!isPositive && (
                            <span className="mb-1 text-xs font-bold px-2 py-0.5 bg-rose-500/30 text-rose-200 rounded-full">
                                Αρνητικό
                            </span>
                        )}
                    </div>

                    {/* Income / Expense pills */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="glass rounded-2xl p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-6 h-6 rounded-lg bg-emerald-400/20 flex items-center justify-center">
                                    <ArrowUpRight size={13} className="text-emerald-300" />
                                </div>
                                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide">
                                    {t('income')}
                                </span>
                            </div>
                            <p className="text-lg font-black text-white leading-none">
                                {totalIncome.toLocaleString('el-GR', { minimumFractionDigits: 0 })}€
                            </p>
                        </div>
                        <div className="glass rounded-2xl p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="w-6 h-6 rounded-lg bg-rose-400/20 flex items-center justify-center">
                                    <ArrowDownRight size={13} className="text-rose-300" />
                                </div>
                                <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wide">
                                    {t('expense')}
                                </span>
                            </div>
                            <p className="text-lg font-black text-white leading-none">
                                {totalExpense.toLocaleString('el-GR', { minimumFractionDigits: 0 })}€
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-1">
                    Γρήγορη πρόσβαση
                </p>
                <div className="grid grid-cols-4 gap-3">
                    <QuickAction
                        icon={TrendingUp}
                        label={t('goals')}
                        color="text-violet-600 dark:text-violet-400"
                        bg="bg-violet-50 dark:bg-violet-900/30"
                        onClick={() => setActiveTab('goals')}
                    />
                    <QuickAction
                        icon={Target}
                        label={t('budgets')}
                        color="text-cyan-600 dark:text-cyan-400"
                        bg="bg-cyan-50 dark:bg-cyan-900/30"
                        onClick={() => setActiveTab('budgets')}
                    />
                    <QuickAction
                        icon={Repeat}
                        label="Επαναλ."
                        color="text-amber-600 dark:text-amber-400"
                        bg="bg-amber-50 dark:bg-amber-900/30"
                        onClick={() => setActiveTab('recurring')}
                    />
                    <QuickAction
                        icon={Sparkles}
                        label="Στατιστικά"
                        color="text-emerald-600 dark:text-emerald-400"
                        bg="bg-emerald-50 dark:bg-emerald-900/30"
                        onClick={() => setActiveTab('stats')}
                    />
                </div>
            </div>

            {/* ── Recent Transactions ── */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-base font-bold text-gray-800 dark:text-white">
                        {t('recent')}
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
                    <div className="text-center py-12
                                    bg-gray-50 dark:bg-surface-dark3
                                    rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-900/30
                                        flex items-center justify-center mx-auto mb-3">
                            <TrendingUp size={22} className="text-violet-400" />
                        </div>
                        <p className="font-semibold text-gray-400 dark:text-gray-500 text-sm">
                            {t('no_transactions')}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                            Πατήστε + για να προσθέσετε την πρώτη σας καταχώρηση
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5 stagger-children">
                        {transactions.slice(0, 5).map(tx => (
                            <TransactionItem key={tx.id} transaction={tx} onDelete={onDelete} onEdit={onEdit} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeView;
