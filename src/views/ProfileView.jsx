import React, { useState, useEffect } from 'react';
import {
    User, LogOut, ChevronRight,
    ShieldAlert as Shield, ArrowLeft, Moon,
    Sparkles, Smartphone, HardDriveDownload,
    Languages, LayoutDashboard, MessageSquare, BookOpen,
    Settings, Info, Trash2, UserX
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';

/* ─────────────────────────────────────────
   Toggle Switch — matches reference UI
 ───────────────────────────────────────── */
const Toggle = ({ enabled, onChange }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onChange(); }}
        className={`relative w-[46px] h-[26px] rounded-full transition-all duration-300 focus:outline-none flex-shrink-0
                    ${enabled
                ? 'bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.5)]'
                : 'bg-gray-200 dark:bg-white/[0.12]'}`}
        aria-pressed={enabled}
    >
        <div className={`absolute top-[3px] left-[3px] w-[20px] h-[20px] rounded-full bg-white
                          shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition-transform duration-300
                          ${enabled ? 'translate-x-[20px]' : 'translate-x-0'}`} />
    </button>
);

/* ─────────────────────────────────────────
   Setting Row — clean list item
 ───────────────────────────────────────── */
const SettingRow = ({
    icon: Icon,
    label,
    color = 'text-gray-600 dark:text-white/60',
    onClick,
    right,
    last = false,
    danger = false
}) => (
    <div
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        className={`group flex items-center gap-3.5 px-4 py-[14px]
                    ${onClick ? 'cursor-pointer active:bg-black/[0.04] dark:active:bg-white/[0.06]' : ''}
                    transition-all duration-150
                    hover:bg-black/[0.025] dark:hover:bg-white/[0.05]
                    ${!last ? 'border-b border-gray-100 dark:border-transparent' : ''}`}
    >
        {/* Icon */}
        <Icon
            size={18}
            className={danger ? 'text-rose-500' : color}
            strokeWidth={1.9}
        />

        {/* Label */}
        <span className={`flex-1 text-[14.5px] font-medium leading-snug
                          ${danger ? 'text-rose-500' : 'text-gray-800 dark:text-white/90'}`}>
            {label}
        </span>

        {/* Trailing */}
        <div className="flex-shrink-0 ml-1">
            {right !== undefined ? right : (
                <ChevronRight
                    size={16}
                    className="text-gray-300 dark:text-white/40
                               group-hover:text-gray-400 dark:group-hover:text-white/35
                               transition-colors duration-150"
                />
            )}
        </div>
    </div>
);

/* ─────────────────────────────────────────
   Card wrapper
 ───────────────────────────────────────── */
const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-surface-dark3 rounded-2xl overflow-hidden
                     border border-gray-100 dark:border-transparent
                     shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_12px_rgba(0,0,0,0.3)]
                     ${className}`}>
        {children}
    </div>
);

/* ─────────────────────────────────────────
   Section Label
 ───────────────────────────────────────── */
const SectionLabel = ({ children }) => (
    <p className="text-[12px] font-semibold text-gray-400 dark:text-white/50 mb-2 px-1">
        {children}
    </p>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
 ═══════════════════════════════════════════════════════════ */
const ProfileView = ({ user, onBack, onSignOut, onRecurring, onGeneral, onSecurity, onBackup, onAdmin, onFeedback, onGuide, onProfileDetails }) => {
    const { theme, toggleTheme, language, updateLanguage, t: translate } = useSettings();
    const { isPro, openUpgradeModal, openBillingPortal } = useSubscription();
    const isDark = theme === 'dark';
    const { showToast } = useToast();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showApkModal, setShowApkModal] = useState(false);
    const [imgError, setImgError] = useState(false);

    const photoURL = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.photoURL;
    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name
        || user?.displayName || user?.email?.split('@')[0]
        || translate('anonymous_user');

    useEffect(() => { setImgError(false); }, [photoURL]);

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark animate-fade-in flex flex-col transition-colors duration-300 overflow-hidden">

            {/* ─────── Sticky Header ─────── */}
            <div
                className="shrink-0 sticky top-0 z-20
                            bg-gray-50 dark:bg-surface-dark
                            backdrop-blur-xl
                            border-b border-gray-100 dark:border-transparent
                            px-4 pb-3 transition-colors duration-300"
                style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
            >
                <div className="flex items-center justify-center relative min-h-[32px]">
                    <button
                        id="settings-back-btn"
                        onClick={onBack}
                        className="absolute left-0 w-8 h-8 rounded-full
                                   bg-gray-100 dark:bg-white/[0.08]
                                   flex items-center justify-center
                                   text-gray-500 dark:text-white/50
                                   hover:bg-gray-200 dark:hover:bg-white/[0.14]
                                   active:scale-90 transition-all duration-150"
                    >
                        <ArrowLeft size={15} strokeWidth={2.5} />
                    </button>
                    <h1 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight text-center">
                        {translate('settings_title') || 'Settings'}
                    </h1>
                </div>
            </div>

            {/* ─────── Scrollable Content ─────── */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 pb-12 space-y-5">

                    {/* ════ Profile Row Card ════ */}
                    <Card>
                        <div
                            role="button"
                            onClick={onProfileDetails}
                            className="flex items-center gap-3.5 px-4 py-4 cursor-pointer
                                       hover:bg-black/[0.025] dark:hover:bg-white/[0.03]
                                       active:bg-black/[0.04] dark:active:bg-white/[0.05]
                                       transition-all duration-150"
                        >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="w-[52px] h-[52px] rounded-full overflow-hidden
                                                bg-violet-100 dark:bg-violet-500/20
                                                border-2 border-violet-200 dark:border-violet-500/30
                                                shadow-[0_2px_12px_rgba(109,40,217,0.2)]">
                                    {photoURL && !imgError ? (
                                        <img
                                            src={photoURL}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User size={22} strokeWidth={1.5} className="text-violet-500 dark:text-violet-400" />
                                        </div>
                                    )}
                                </div>
                                {/* Online dot */}
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full
                                                bg-emerald-400 border-2 border-white dark:border-surface-dark
                                                shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                            </div>

                            {/* Name & email */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[15px] text-gray-900 dark:text-white leading-tight truncate">
                                    {displayName}
                                </p>
                                <p className="text-[12px] text-gray-400 dark:text-white/60 truncate mt-0.5">
                                    {user?.email}
                                </p>
                            </div>

                            <ChevronRight size={16} className="text-gray-300 dark:text-white/40 flex-shrink-0" />
                        </div>
                    </Card>

                    {/* ════ Subscription Card — Premium Redesign ════ */}
                    {!isPro ? (
                        /* ── Upgrade to Pro ── */
                        <div
                            className="relative overflow-hidden rounded-2xl border-none"
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 40%, #4f46e5 100%)',
                                boxShadow: '0 8px 32px rgba(109, 40, 217, 0.45), 0 2px 8px rgba(0,0,0,0.2)'
                            }}
                        >
                            {/* Animated shine sweep */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)',
                                    animation: 'shine-sweep 3.5s ease-in-out infinite'
                                }}
                            />
                            {/* Glow orbs */}
                            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-indigo-400/30 blur-2xl pointer-events-none" />
                            <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-violet-300/20 blur-xl pointer-events-none" />

                            <div className="relative px-5 pt-5 pb-4">
                                {/* Header row */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
                                                style={{ background: 'rgba(255,255,255,0.18)', color: '#e9d5ff', letterSpacing: '0.1em' }}
                                            >
                                                SpendWise Pro
                                            </span>
                                        </div>
                                        <h3 className="text-white font-extrabold text-[17px] leading-tight flex items-center gap-2">
                                            {translate('upgrade_to_pro') || 'Αναβάθμιση σε Pro'}
                                            <span className="text-[16px] drop-shadow-sm">👑</span>
                                        </h3>
                                        <p className="text-violet-200 text-[12px] mt-0.5 leading-snug">
                                            {translate('unlock_all_features') || 'Ξεκλείδωσε απεριόριστα budgets, στόχους & άλλα'}
                                        </p>
                                    </div>
                                </div>

                                {/* Feature pills */}
                                <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
                                    {[
                                        { icon: '∞', label: translate('unlimited_budgets') || 'Απεριόριστα Budgets' },
                                        { icon: '🎯', label: translate('unlimited_goals') || 'Απεριόριστοι Στόχοι' },
                                        { icon: '🤖', label: translate('ai_advisor') || 'AI Σύμβουλος' },
                                    ].map((f, i) => (
                                        <span
                                            key={i}
                                            className="flex items-center gap-1 text-[11px] font-semibold text-white/90 px-2.5 py-1 rounded-full"
                                            style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(8px)' }}
                                        >
                                            <span className="text-[10px]">{f.icon}</span>
                                            {f.label}
                                        </span>
                                    ))}
                                </div>

                                {/* CTA row */}
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-violet-200/80 text-[11px] font-medium">
                                        {translate('pro_price_hint') || 'από €2.99 / μήνα'}
                                    </p>
                                    <button
                                        onClick={() => openUpgradeModal('profile')}
                                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-extrabold transition-all duration-200 active:scale-95 hover:scale-105"
                                        style={{
                                            background: '#ffffff',
                                            color: '#5b21b6',
                                            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                                        }}
                                    >
                                        {translate('go_pro') || 'Αναβάθμιση'}
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M12 5l7 7-7 7"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ── Pro Active ── */
                        <div
                            className="relative overflow-hidden rounded-2xl border-none"
                            style={{
                                background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                                boxShadow: '0 8px 32px rgba(5, 150, 105, 0.4), 0 2px 8px rgba(0,0,0,0.15)'
                            }}
                        >
                            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-teal-300/20 blur-2xl pointer-events-none" />
                            <div className="relative px-5 py-5 flex items-center justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
                                            style={{ background: 'rgba(255,255,255,0.2)', color: '#d1fae5' }}>
                                            ✓ Ενεργό
                                        </span>
                                    </div>
                                    <h3 className="text-white font-extrabold text-[16px] flex items-center gap-2">
                                        {translate('pro_plan_active') || 'Pro Plan Active'}
                                        <span className="text-[15px]">👑</span>
                                    </h3>
                                    <p className="text-emerald-100/80 text-[12px] mt-0.5">
                                        {translate('manage_billing') || 'Διαχειρίσου τη συνδρομή σου'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => openBillingPortal()}
                                    className="shrink-0 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-200 active:scale-95 hover:scale-105"
                                    style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
                                >
                                    {translate('manage') || 'Διαχείριση'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ════ Other Settings ════ */}
                    <div>
                        <SectionLabel>{translate('other_settings') || 'Other settings'}</SectionLabel>
                        <Card>
                            <SettingRow
                                icon={User}
                                label={translate('profile_details') || 'Profile details'}
                                onClick={onProfileDetails}
                            />
                            <SettingRow
                                icon={Shield}
                                label={translate('security') || 'Security'}
                                onClick={onSecurity}
                            />
                            <SettingRow
                                icon={Settings}
                                label={translate('general') || 'General'}
                                onClick={onGeneral}
                            />
                            <SettingRow
                                icon={Languages}
                                label={translate('language') || 'Language'}
                                right={
                                    <div className="flex gap-1 bg-gray-100 dark:bg-white/[0.07] p-0.5 rounded-lg">
                                        {['el', 'en'].map(lang => (
                                            <button
                                                key={lang}
                                                onClick={(e) => { e.stopPropagation(); updateLanguage(lang); }}
                                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all duration-200
                                                            ${language === lang
                                                        ? 'bg-white dark:bg-white/15 text-violet-600 dark:text-violet-400 shadow-sm'
                                                        : 'text-gray-400 dark:text-white/50'}`}
                                            >
                                                {lang.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                }
                            />
                            <SettingRow
                                icon={Moon}
                                label={translate('dark_mode') || 'Dark mode'}
                                onClick={toggleTheme}
                                right={<Toggle enabled={isDark} onChange={toggleTheme} />}
                                last
                            />
                        </Card>
                    </div>

                    {/* ════ More ════ */}
                    <div>
                        <Card>
                            <SettingRow
                                icon={HardDriveDownload}
                                label={translate('backup_restore') || 'Backup & Restore'}
                                onClick={onBackup}
                            />
                            <SettingRow
                                icon={BookOpen}
                                label={translate('user_guide') || 'User Guide'}
                                onClick={onGuide}
                            />
                            <SettingRow
                                icon={MessageSquare}
                                label={translate('feedback') || 'Feedback & Ideas'}
                                onClick={onFeedback}
                            />
                            <SettingRow
                                icon={Smartphone}
                                label={translate('install_android') || 'Install App (Android)'}
                                onClick={() => setShowApkModal(true)}
                            />


                            {/* Admin — only for admin user */}
                            {user?.id === '86177767-e1f2-4356-b98b-e43503cab0da' && (
                                <SettingRow
                                    icon={LayoutDashboard}
                                    label={translate('control_panel') || 'Control Panel'}
                                    onClick={onAdmin}
                                />
                            )}

                            <SettingRow
                                icon={LogOut}
                                label={translate('logout') || 'Sign out'}
                                danger
                                onClick={() => setShowLogoutModal(true)}
                                last
                            />
                        </Card>
                    </div>

                    {/* ════ Footer ════ */}
                    <div className="flex flex-col items-center gap-1.5 pt-1 pb-2">
                        <div className="flex items-center gap-1.5">
                            <Sparkles size={10} className="text-violet-400" />
                            <span className="text-[11px] font-bold gradient-text">SpendWise</span>
                        </div>
                        <p className="text-[10px] text-gray-300 dark:text-white/60 tracking-wide">
                            {translate('version') || 'v1.0.0'} · 2026
                        </p>
                    </div>

                </div>
            </div>

            {/* ─── Modals ─── */}
            <ConfirmationModal
                isOpen={showApkModal}
                onClose={() => setShowApkModal(false)}
                onConfirm={() => {
                    const link = document.createElement('a');
                    link.href = '/SpendWise.apk';
                    link.download = 'SpendWise.apk';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }}
                title={translate('apk_install_title')}
                message={translate('apk_install_instructions')}
                confirmText={translate('download_apk')}
                type="primary"
            />

            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={onSignOut}
                title={translate('logout_confirm_title')}
                message={translate('logout_confirm_message')}
                confirmText={translate('logout')}
                type="danger"
            />
        </div>
    );
};

export default ProfileView;









