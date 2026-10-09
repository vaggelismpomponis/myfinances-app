import React, { useState, useEffect } from 'react';
import {
    Home, BarChart2, History, Settings, Target,
    RefreshCw, Lightbulb, LogOut, Moon, Sun, Eye, EyeOff,
    PiggyBank, User, ShieldCheck
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const NavItem = ({ icon: Icon, label, active, onClick, badge, showCrown, id }) => (
    <button
        id={id}
        onClick={onClick}
        style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left
                    outline-none focus:outline-none focus-visible:outline-none active:outline-none focus:ring-0 active:ring-0
                    transition-all duration-200 group relative select-none border
                    ${active
                        ? 'bg-violet-50/90 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 font-bold border-violet-200/90 dark:border-violet-500/30 shadow-xs shadow-violet-500/5 hover:bg-violet-100/70 dark:hover:bg-violet-500/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/90 dark:hover:bg-white/[0.06] hover:text-gray-950 dark:hover:text-white font-medium border-transparent'
                    }`}
    >
        <Icon
            size={18}
            className={`shrink-0 transition-transform duration-200 ${
                active
                    ? 'text-violet-600 dark:text-violet-400 scale-105'
                    : 'text-gray-500 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:scale-110'
            }`}
        />
        <span className="text-sm flex-1 truncate">{label}</span>
        {badge && (
            <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    active
                        ? 'bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700/50'
                        : 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/30'
                }`}
            >
                {badge}
            </span>
        )}
        {showCrown && !active && (
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-0.5 shrink-0">
                <ShieldCheck size={10} className="shrink-0" />
                <span>PRO</span>
            </span>
        )}
    </button>
);

const SectionLabel = ({ label }) => (
    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500 px-3.5 mb-1.5 mt-5 select-none">
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
    const [imgRetries, setImgRetries] = useState(0);
    const MAX_IMG_RETRIES = 3;

    const effectiveName = displayName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('user') || 'User';
    const effectivePhoto = photoURL || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.photoURL;

    useEffect(() => {
        setImgRetries(0);
    }, [effectivePhoto]);

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
            border-r border-gray-200 dark:border-white/10
            shadow-[4px_0_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_24px_-4px_rgba(0,0,0,0.4)]
            overflow-y-auto custom-scrollbar
            w-[264px] xl:w-[272px] flex-shrink-0 select-none z-20 relative
        ">
            {/* ── Brand Header ── */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                <button
                    onClick={() => navTo('home')}
                    style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
                    className="flex items-center gap-3 group cursor-pointer text-left outline-none focus:outline-none focus-visible:outline-none active:outline-none focus:ring-0 active:ring-0 transition-all w-full select-none"
                >
                    <div className="relative shrink-0">
                        <img
                            src="/spendwise-logo.webp"
                            alt="SpendWise"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/spendwise-logo.png';
                            }}
                            className="w-9 h-9 rounded-2xl object-contain shadow-xs transition-transform duration-200 group-hover:scale-105 select-none pointer-events-none"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-base font-black text-gray-900 dark:text-white tracking-tight font-display group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                                SpendWise
                            </h1>
                            {isPro && (
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/30 shrink-0">
                                    PRO
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 truncate -mt-0.5">
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
                <NavItem icon={Lightbulb} label={t('advisor_title')} active={activeTab === 'advisor'} onClick={() => navTo('advisor')} />

                <SectionLabel label={t('settings') || 'Settings'} />

                <NavItem
                    id="nav-profile"
                    icon={Settings}
                    label={t('settings') || 'Ρυθμίσεις'}
                    active={['profile', 'account', 'general', 'security', 'backup', 'feedback', 'guide', 'admin', 'profile-details'].includes(activeTab)}
                    onClick={() => navTo('profile')}
                />
            </div>

            {/* ── User Profile & Quick Controls Footer ── */}
            <div className="p-3.5 border-t border-gray-200/90 dark:border-white/[0.08] space-y-2.5 mt-auto bg-gray-50/70 dark:bg-white/[0.02]">
                {/* User Profile Mini Capsule */}
                <div
                    onClick={() => navTo('profile')}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer group border ${
                        activeTab === 'profile'
                            ? 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/40'
                            : 'bg-white dark:bg-surface-dark3 border-gray-200/70 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-800/30 hover:shadow-xs'
                    }`}
                >
                    <div className="relative shrink-0">
                        {effectivePhoto && imgRetries < MAX_IMG_RETRIES ? (
                            <img
                                src={imgRetries > 0 ? `${effectivePhoto}${effectivePhoto.includes('?') ? '&' : '?'}retry=${imgRetries}` : effectivePhoto}
                                alt={effectiveName}
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                onError={() => setTimeout(() => setImgRetries(prev => prev + 1), 500 * imgRetries)}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-violet-500/30"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                {effectiveName.charAt(0).toUpperCase() || 'U'}
                            </div>
                        )}
                        {isPro && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center text-slate-950 shadow-2xs">
                                <ShieldCheck size={9} className="shrink-0 text-slate-950" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {effectiveName}
                        </p>
                        <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 truncate">
                            {isPro ? (t('pro_member') || 'Pro Member') : (user?.email || 'SpendWise')}
                        </p>
                    </div>
                </div>

                {/* Compact Utility Action Row (Theme, Privacy, Logout) */}
                <div className="flex items-center justify-between gap-1.5 pt-0.5">
                    <button
                        onClick={toggleTheme}
                        style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-surface-dark3 border border-gray-200/70 dark:border-white/10 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-800/40 outline-none focus:outline-none active:scale-95 transition-all shadow-2xs"
                        title={theme === 'dark' ? t('switch_to_light') || 'Light mode' : t('switch_to_dark') || 'Dark mode'}
                    >
                        {theme === 'dark' ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} />}
                        <span className="text-[11px] font-bold">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                    </button>

                    <button
                        onClick={togglePrivacyMode}
                        style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-semibold outline-none focus:outline-none active:scale-95 transition-all border ${
                            privacyMode
                                ? 'bg-violet-600 text-white border-violet-600 shadow-xs font-bold'
                                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-surface-dark3 border-gray-200/70 dark:border-white/10 hover:bg-violet-50 dark:hover:bg-violet-950/40 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-800/40 shadow-2xs'
                        }`}
                        title={privacyMode ? t('show_amounts') || 'Show amounts' : t('hide_amounts') || 'Hide amounts'}
                    >
                        {privacyMode ? <EyeOff size={13} /> : <Eye size={13} />}
                        <span className="text-[11px] font-bold">{privacyMode ? 'Private' : 'Visible'}</span>
                    </button>

                    <button
                        onClick={onSignOut}
                        style={{ outline: 'none', border: 'none', WebkitTapHighlightColor: 'transparent' }}
                        className="p-2 rounded-xl text-rose-500 hover:text-rose-600 bg-white dark:bg-surface-dark3 border border-gray-200/70 dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-900/40 outline-none focus:outline-none active:scale-95 transition-all shrink-0 shadow-2xs"
                        title={t('sign_out') || 'Sign out'}
                        aria-label="Sign out"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default DesktopSidebar;
