import React, { useMemo, useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, User, ChevronRight } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import DesktopSidebar from './DesktopSidebar';
import TransactionItem from './TransactionItem';
import Amount from './Amount';
import CategoryIcon from './CategoryIcon';

/* ─────────────────────────────────────────────
   Right Panel Widget: Mini Stats Card
───────────────────────────────────────────── */
const RightStatCard = ({ label, value, icon: Icon, color, bgColor }) => (
    <div className={`flex items-center gap-3 p-3.5 rounded-2xl ${bgColor} border border-transparent`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} bg-white/60 dark:bg-white/10 flex-shrink-0`}>
            <Icon size={16} />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                <Amount value={value} />
            </p>
        </div>
    </div>
);

/* ─────────────────────────────────────────────
   Right Panel Widget: Budget Mini Bar
───────────────────────────────────────────── */
const BudgetMiniBar = ({ budget, transactions }) => {
    const { t } = useSettings();

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

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CategoryIcon category={budget.category} type="expense" size={14} />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">
                        {t('cat_' + budget.category?.toLowerCase()) === 'cat_' + budget.category?.toLowerCase()
                            ? budget.category
                            : t('cat_' + budget.category?.toLowerCase())}
                    </span>
                </div>
                <span className={`text-[10px] font-black ${isDanger ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    {pct.toFixed(0)}%
                </span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700
                                ${isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-violet-500'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-gray-400 dark:text-gray-600">
                <span><Amount value={spent} /></span>
                <span><Amount value={budget.amount} /></span>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Right Info Panel
───────────────────────────────────────────── */
const DesktopRightPanel = ({ transactions, budgets, totalIncome, totalExpense, setActiveTab }) => {
    const { t } = useSettings();

    const recentTxs = useMemo(() => transactions.slice(0, 6), [transactions]);
    const activeBudgets = useMemo(() => budgets.slice(0, 4), [budgets]);

    const cashFlow = totalIncome - totalExpense;

    return (
        <aside className="
            h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar
            w-[280px] flex-shrink-0 py-6 pr-4 pl-2
        ">
            {/* ── Cash Flow ── */}
            <div className="bg-white dark:bg-surface-dark3
                            border border-gray-100 dark:border-white/[0.05]
                            rounded-[1.75rem] p-4 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">
                    {t('this_month_spend') || 'This Month'}
                </h3>
                <div className="space-y-2">
                    <RightStatCard
                        label={t('stats_income')}
                        value={totalIncome}
                        icon={ArrowUpRight}
                        color="text-emerald-600 dark:text-emerald-400"
                        bgColor="bg-emerald-50 dark:bg-emerald-900/20"
                    />
                    <RightStatCard
                        label={t('stats_expense')}
                        value={totalExpense}
                        icon={ArrowDownRight}
                        color="text-rose-600 dark:text-rose-400"
                        bgColor="bg-rose-50 dark:bg-rose-900/20"
                    />
                </div>
                <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl
                                ${cashFlow >= 0
                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
                                }`}>
                    <span className="text-[10px] font-black uppercase tracking-wider">Net Flow</span>
                    <span className="text-sm font-black">
                        {cashFlow >= 0 ? '+' : '−'}<Amount value={Math.abs(cashFlow)} showSign={false} />
                    </span>
                </div>
            </div>

            {/* ── Budgets ── */}
            {activeBudgets.length > 0 && (
                <div className="bg-white dark:bg-surface-dark3
                                border border-gray-100 dark:border-white/[0.05]
                                rounded-[1.75rem] p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">
                            {t('budgets')}
                        </h3>
                        <button
                            onClick={() => setActiveTab('budgets')}
                            className="text-[10px] font-black text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
                        >
                            {t('all')} →
                        </button>
                    </div>
                    <div className="space-y-4">
                        {activeBudgets.map(b => (
                            <BudgetMiniBar key={b.id} budget={b} transactions={transactions} />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Recent Transactions ── */}
            {recentTxs.length > 0 && (
                <div className="bg-white dark:bg-surface-dark3
                                border border-gray-100 dark:border-white/[0.05]
                                rounded-[1.75rem] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">
                            {t('recent')}
                        </h3>
                        <button
                            onClick={() => setActiveTab('history')}
                            className="text-[10px] font-black text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
                        >
                            {t('all')} →
                        </button>
                    </div>
                    <div className="space-y-1.5">
                        {recentTxs.map(tx => (
                            <div
                                key={tx.id}
                                className="flex items-center gap-2.5 py-2 px-1 border-b border-gray-50 dark:border-white/[0.03] last:border-0"
                            >
                                <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                                    <CategoryIcon category={tx.category} type={tx.type} size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                                        {tx.note || tx.category}
                                    </p>
                                    <p className="text-[9px] text-gray-400 dark:text-gray-600">
                                        {new Date(tx.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                                <span className={`text-xs font-black flex-shrink-0
                                                ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {tx.type === 'income' ? '+' : '−'}<Amount value={tx.amount} showSign={false} />
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
};

/* ─────────────────────────────────────────────
   Desktop Top Header
───────────────────────────────────────────── */
const DesktopTopBar = ({ activeTab, t, onAdd, displayName, photoURL, setActiveTab }) => {
    const [imgError, setImgError] = useState(false);

    const tabTitles = {
        home: t('nav_home'),
        stats: t('nav_stats'),
        history: t('nav_history'),
        goals: t('goals'),
        budgets: t('budgets'),
        recurring: t('recurring'),
        profile: t('nav_profile'),
        general: t('general_settings'),
        security: t('security'),
        backup: t('backup'),
        feedback: t('feedback'),
        advisor: t('advisor_title'),
        guide: t('guide'),
        'profile-details': t('nav_profile'),
        admin: 'Admin Panel',
        privacy: 'Privacy Policy',
    };

    const hour = new Date().getHours();
    const greeting = hour < 12 ? t('good_morning') : hour < 18 ? t('good_afternoon') : t('good_evening');

    return (
        <div className="flex-shrink-0 grid grid-cols-3 items-center
                        px-6 py-3
                        bg-white dark:bg-surface-dark2
                        border-b border-gray-100 dark:border-white/[0.05]
                        sticky top-0 z-30">

            {/* ── Left: User Profile Card ── */}
            <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2.5 group w-fit
                           px-2.5 py-1.5 -ml-1 rounded-2xl
                           hover:bg-gray-100 dark:hover:bg-white/[0.06]
                           transition-all duration-200"
            >
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0
                                bg-gradient-to-br from-violet-500 to-violet-700
                                border-2 border-violet-200 dark:border-violet-900/60
                                flex items-center justify-center text-white shadow-sm">
                    {photoURL && !imgError ? (
                        <img src={photoURL} alt="Profile"
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)} />
                    ) : (
                        <User size={14} />
                    )}
                </div>
                <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-gray-800 dark:text-white leading-tight truncate max-w-[120px]">
                        {displayName}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
                        {greeting}! 👋
                    </p>
                </div>
                <ChevronRight size={13} className="text-gray-300 dark:text-gray-600 group-hover:text-violet-500 transition-colors flex-shrink-0 hidden xl:block" />
            </button>

            {/* ── Center: Page Title ── */}
            <div className="text-center">
                <h2 className="text-base font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                    {tabTitles[activeTab] || ''}
                </h2>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium leading-tight">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* ── Right: Add Button ── */}
            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={onAdd}
                    className="flex items-center gap-2 px-5 py-2.5
                               bg-violet-600 hover:bg-violet-700
                               text-white text-sm font-bold
                               rounded-2xl shadow-lg shadow-violet-500/30
                               hover:shadow-violet-500/40
                               active:scale-95 transition-all duration-200"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    {t('add_transaction') || 'Add'}
                </button>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   Main Desktop Layout
───────────────────────────────────────────── */
const DesktopLayout = ({
    activeTab, setActiveTab, setPreviousTab,
    user, displayName, photoURL,
    balance, totalIncome, totalExpense,
    transactions, budgets,
    onSignOut, onAdd,
    children,
}) => {
    const { t } = useSettings();

    // Tabs that should NOT show the right panel (full-width sub-pages)
    const hideRightPanel = ['profile', 'profile-details', 'general', 'security', 'backup',
        'feedback', 'guide', 'admin', 'privacy', 'recurring'].includes(activeTab);

    return (
        <div className="h-full w-full flex bg-gray-50 dark:bg-surface-dark overflow-hidden">

            {/* ── LEFT SIDEBAR ── */}
            <DesktopSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setPreviousTab={setPreviousTab}
                user={user}
                displayName={displayName}
                photoURL={photoURL}
                balance={balance}
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                onSignOut={onSignOut}
            />

            {/* ── MAIN CONTENT + TOPBAR ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <DesktopTopBar
                    activeTab={activeTab}
                    t={t}
                    onAdd={onAdd}
                    displayName={displayName}
                    photoURL={photoURL}
                    setActiveTab={setActiveTab}
                />

                <div className="flex-1 flex overflow-hidden">
                    {/* Main scrollable area */}
                    <main className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className={hideRightPanel ? 'h-full' : 'py-6 px-6'}>
                            {children}
                        </div>
                    </main>

                    {/* ── RIGHT PANEL ── */}
                    {!hideRightPanel && (
                        <DesktopRightPanel
                            transactions={transactions}
                            budgets={budgets}
                            totalIncome={totalIncome}
                            totalExpense={totalExpense}
                            setActiveTab={setActiveTab}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DesktopLayout;
