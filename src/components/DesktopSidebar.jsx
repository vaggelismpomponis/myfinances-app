import React, { useState } from 'react';
import {
    Home, BarChart2, Wallet, Settings, Target,
    RefreshCw, Shield, Database, MessageSquare, Sparkles,
    LogOut, Moon, Sun, Eye, EyeOff, BookOpen,
    Bell, Crown, User, LayoutDashboard
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import Amount from './Amount';

const NavItem = ({ icon: Icon, label, active, onClick, badge, showCrown }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left
                    transition-all duration-200 group relative
                    ${active
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white'
                    }`}
    >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200
                        ${active
                            ? 'bg-white/20'
                            : 'bg-gray-100 dark:bg-white/[0.06] group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30'
                        }`}>
            <Icon size={18} className={active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400'} />
        </div>
        <span className={`font-semibold text-sm flex-1 ${active ? 'text-white' : ''}`}>{label}</span>
        {badge && (
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full
                            ${active ? 'bg-white/25 text-white' : 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400'}`}>
                {badge}
            </span>
        )}
        {showCrown && !active && (
            <Crown size={12} className="text-amber-400" />
        )}
    </button>
);

const SectionLabel = ({ label }) => (
    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-gray-600 px-4 mb-1 mt-4">
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

    const hour = new Date().getHours();
    const greeting = hour < 12 ? t('good_morning') : hour < 18 ? t('good_afternoon') : t('good_evening');

    const navTo = (tab) => {
        if ((tab === 'advisor' || tab === 'recurring') && !isPro) {
            openUpgradeModal(tab);
            return;
        }
        setActiveTab(tab);
    };

    return (
        <aside className="
            h-full flex flex-col bg-white dark:bg-surface-dark2
            border-r border-gray-100 dark:border-white/[0.05]
            overflow-y-auto custom-scrollbar
            w-[260px] flex-shrink-0
        ">
            {/* ── Brand ── */}
            <div className="px-5 pt-7 pb-4">
                <button
                    onClick={() => navTo('home')}
                    className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none transition-all"
                >
                    <img
                        src="/spendwise-logo.png"
                        alt="SpendWise"
                        className="w-9 h-9 rounded-2xl object-contain transition-transform duration-200 group-hover:scale-110"
                    />
                    <div>
                        <h1 className="text-base font-black text-gray-900 dark:text-white tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">SpendWise</h1>
                        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 -mt-0.5">Personal Finance</p>
                    </div>
                </button>
            </div>


            {/* ── Balance Summary ── */}
            <div className="mx-4 mb-3">
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700
                                rounded-2xl p-4 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">
                        {t('balance')}
                    </p>
                    <p className="text-2xl font-black text-white tracking-tight tabular-nums">
                        <Amount value={balance} />
                    </p>
                    <div className="flex gap-3 mt-3">
                        <div className="flex-1">
                            <p className="text-[9px] font-bold text-emerald-300/70 uppercase">In</p>
                            <p className="text-xs font-black text-emerald-300">
                                <Amount value={totalIncome} />
                            </p>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div className="flex-1">
                            <p className="text-[9px] font-bold text-rose-300/70 uppercase">Out</p>
                            <p className="text-xs font-black text-rose-300">
                                <Amount value={totalExpense} />
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Primary Navigation ── */}
            <div className="flex-1 px-3 space-y-0.5">
                <SectionLabel label={t('nav_main') || 'Main'} />

                <NavItem icon={Home} label={t('nav_home')} active={activeTab === 'home'} onClick={() => navTo('home')} />
                <NavItem icon={BarChart2} label={t('nav_stats')} active={activeTab === 'stats'} onClick={() => navTo('stats')} />
                <NavItem icon={Wallet} label={t('nav_history')} active={activeTab === 'history'} onClick={() => navTo('history')} />

                <SectionLabel label={t('quick_access') || 'Tools'} />

                <NavItem icon={Target} label={t('goals')} active={activeTab === 'goals'} onClick={() => navTo('goals')} />
                <NavItem icon={Wallet} label={t('budgets')} active={activeTab === 'budgets'} onClick={() => navTo('budgets')} />
                <NavItem icon={RefreshCw} label={t('recurring')} active={activeTab === 'recurring'} onClick={() => { setPreviousTab('home'); navTo('recurring'); }} />
                <NavItem icon={Sparkles} label={t('advisor_title')} active={activeTab === 'advisor'} onClick={() => navTo('advisor')} />

                <SectionLabel label={t('settings') || 'Settings'} />

                <NavItem icon={User} label={t('nav_profile')} active={activeTab === 'profile'} onClick={() => navTo('profile')} />
                <NavItem icon={Settings} label={t('general_settings')} active={activeTab === 'general'} onClick={() => navTo('general')} />
                <NavItem icon={Shield} label={t('security')} active={activeTab === 'security'} onClick={() => navTo('security')} />
                <NavItem icon={Database} label={t('backup')} active={activeTab === 'backup'} onClick={() => navTo('backup')} />
                <NavItem icon={MessageSquare} label={t('feedback')} active={activeTab === 'feedback'} onClick={() => navTo('feedback')} />
                <NavItem icon={BookOpen} label={t('guide')} active={activeTab === 'guide'} onClick={() => navTo('guide')} />

                {user?.id === '86177767-e1f2-4356-b98b-e43503cab0da' && (
                    <NavItem icon={LayoutDashboard} label={t('admin_panel')} active={activeTab === 'admin'} onClick={() => navTo('admin')} />
                )}
            </div>

            {/* ── Bottom Controls ── */}
            <div className="px-3 py-4 space-y-1 border-t border-gray-100 dark:border-white/[0.05] mt-2">
                <div className="flex gap-1">
                    <button
                        onClick={toggleTheme}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                                   text-xs font-semibold
                                   bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400
                                   hover:bg-violet-100 dark:hover:bg-violet-900/30
                                   hover:text-violet-700 dark:hover:text-violet-400
                                   transition-all duration-200"
                        title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                    >
                        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                        <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                    </button>
                    <button
                        onClick={togglePrivacyMode}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                                    text-xs font-semibold transition-all duration-200
                                    ${privacyMode
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-400'
                                    }`}
                        title={privacyMode ? 'Show amounts' : 'Hide amounts'}
                    >
                        {privacyMode ? <EyeOff size={15} /> : <Eye size={15} />}
                        <span>{privacyMode ? 'Visible' : 'Private'}</span>
                    </button>
                </div>

                <button
                    onClick={onSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                               text-xs font-semibold text-rose-500 dark:text-rose-400
                               bg-rose-50 dark:bg-rose-900/10
                               hover:bg-rose-100 dark:hover:bg-rose-900/20
                               transition-all duration-200"
                >
                    <LogOut size={15} />
                    <span>{t('sign_out')}</span>
                </button>
            </div>
        </aside>
    );
};

export default DesktopSidebar;
