import React, { useState } from 'react';
import {
    Home, BarChart2, History, Settings, Target,
    RefreshCw, Sparkles, LogOut, Moon, Sun, Eye, EyeOff, Zap,
    PiggyBank, User
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const NavItem = ({ icon: Icon, label, active, onClick, badge, showCrown, id }) => (
    <button
        id={id}
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left
                    transition-all duration-200 group relative select-none
                    ${active
                        ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25 font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white font-medium'
                    }`}
    >
        <Icon
            size={18}
            className={`shrink-0 transition-transform duration-200 ${
                active
                    ? 'text-white'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:scale-110'
            }`}
        />
        <span className="text-sm flex-1 truncate">{label}</span>
        {badge && (
            <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    active
                        ? 'bg-white/20 text-white'
                        : 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/30'
                }`}
            >
                {badge}
            </span>
        )}
        {showCrown && !active && (
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-0.5 shrink-0">
                <Zap size={9} fill="currentColor" />
                <span>PRO</span>
            </span>
        )}
    </button>
);

const SectionLabel = ({ label }) => (
    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400/80 dark:text-gray-500/80 px-3.5 mb-1 mt-4 select-none">
        {label}
    </p>
);

const DesktopSidebar = ({
    activeTab, setActiveTab,
    user, displayName, photoURL,
    balance, totalIncome, totalExpense,
    onSignOut,
    setPreviousTab,
}) => {
    const { t, theme, toggleTheme, privacyMode, togglePrivacyMode } = useSettings();
    const { isPro, openUpgradeModal } = useSubscription();
    const [imgError, setImgError] = useState(false);

    const effectiveName = displayName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('user') || 'User';

    const navTo = (tab) => {
        if ((tab === 'advisor' || tab === 'recurring' || tab === 'stats') && !isPro) {
            openUpgradeModal(tab);
            return;
        }
        setActiveTab(tab);
    };

    return (
        <aside className="
            h-full flex flex-col bg-white dark:bg-surface-dark2
            border-r border-gray-100 dark:border-white/[0.06]
            overflow-y-auto custom-scrollbar
            w-[260px] flex-shrink-0 select-none
        ">
            {/* ── Brand Header ── */}
            <div className="px-5 pt-6 pb-3">
                <button
                    onClick={() => navTo('home')}
                    className="flex items-center gap-3 group cursor-pointer text-left focus:outline-none transition-all w-full"
                >
                    <div className="relative shrink-0">
                        <img
                            src="/spendwise-logo.webp"
                            alt="SpendWise"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/spendwise-logo.png';
                            }}
                            className="w-9 h-9 rounded-2xl object-contain shadow-xs transition-transform duration-200 group-hover:scale-105"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-base font-black text-gray-900 dark:text-white tracking-tight font-display group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                                SpendWise
                            </h1>
                            {isPro && (
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/30 shrink-0">
                                    PRO
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 truncate -mt-0.5">
                            Personal Finance
                        </p>
                    </div>
                </button>
            </div>

            {/* ── Primary Navigation ── */}
            <div className="flex-1 px-3 space-y-1">
                <SectionLabel label={t('nav_main') || 'Main'} />

                <NavItem id="nav-home" icon={Home} label={t('nav_home')} active={activeTab === 'home'} onClick={() => navTo('home')} />
                <NavItem id="nav-stats" icon={BarChart2} label={t('nav_stats')} active={activeTab === 'stats'} onClick={() => navTo('stats')} showCrown={!isPro} />
                <NavItem id="nav-history" icon={History} label={t('nav_history')} active={activeTab === 'history'} onClick={() => navTo('history')} />

                <SectionLabel label={t('quick_access') || 'Tools'} />

                <NavItem icon={Target} label={t('goals')} active={activeTab === 'goals'} onClick={() => navTo('goals')} />
                <NavItem icon={PiggyBank} label={t('budgets')} active={activeTab === 'budgets'} onClick={() => navTo('budgets')} />
                <NavItem icon={RefreshCw} label={t('recurring')} active={activeTab === 'recurring'} onClick={() => { setPreviousTab('home'); navTo('recurring'); }} />
                <NavItem icon={Sparkles} label={t('advisor_title')} active={activeTab === 'advisor'} onClick={() => navTo('advisor')} />

                <SectionLabel label={t('settings') || 'Settings'} />

                <NavItem
                    id="nav-profile"
                    icon={User}
                    label={t('nav_profile') || 'Προφίλ'}
                    active={['profile', 'account', 'general', 'security', 'backup', 'feedback', 'guide', 'admin', 'profile-details'].includes(activeTab)}
                    onClick={() => navTo('profile')}
                />
            </div>

            {/* ── User Profile & Quick Controls Footer ── */}
            <div className="p-3 border-t border-gray-100 dark:border-white/[0.06] space-y-2 mt-auto bg-gray-50/50 dark:bg-white/[0.01]">
                {/* User Profile Mini Capsule */}
                <div
                    onClick={() => navTo('profile')}
                    className={`flex items-center gap-2.5 p-2 rounded-xl transition-all cursor-pointer group ${
                        activeTab === 'profile'
                            ? 'bg-violet-50 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-800/30'
                            : 'hover:bg-gray-100/80 dark:hover:bg-white/[0.05]'
                    }`}
                >
                    <div className="relative shrink-0">
                        {photoURL && !imgError ? (
                            <img
                                src={photoURL}
                                alt={effectiveName}
                                onError={() => setImgError(true)}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/20"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                {effectiveName.charAt(0).toUpperCase() || 'U'}
                            </div>
                        )}
                        {isPro && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center text-slate-950 shadow-2xs">
                                <Zap size={8} fill="currentColor" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {effectiveName}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                            {isPro ? (t('pro_member') || 'Pro Member') : (user?.email || 'SpendWise')}
                        </p>
                    </div>
                </div>

                {/* Compact Utility Action Row (Theme, Privacy, Logout) */}
                <div className="flex items-center justify-between gap-1 pt-0.5">
                    <button
                        onClick={toggleTheme}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100/80 dark:bg-white/[0.05] hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-400 transition-all"
                        title={theme === 'dark' ? t('switch_to_light') || 'Light mode' : t('switch_to_dark') || 'Dark mode'}
                    >
                        {theme === 'dark' ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
                        <span className="text-[11px] font-bold">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                    </button>

                    <button
                        onClick={togglePrivacyMode}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                            privacyMode
                                ? 'bg-violet-600 text-white shadow-xs font-bold'
                                : 'text-gray-600 dark:text-gray-400 bg-gray-100/80 dark:bg-white/[0.05] hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-400'
                        }`}
                        title={privacyMode ? t('show_amounts') || 'Show amounts' : t('hide_amounts') || 'Hide amounts'}
                    >
                        {privacyMode ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span className="text-[11px] font-bold">{privacyMode ? 'Private' : 'Visible'}</span>
                    </button>

                    <button
                        onClick={onSignOut}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shrink-0"
                        title={t('sign_out') || 'Sign out'}
                        aria-label="Sign out"
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default DesktopSidebar;
