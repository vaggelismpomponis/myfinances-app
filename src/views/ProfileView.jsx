import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, LogOut, ChevronRight,
    ShieldAlert as Shield, ArrowLeft, Moon,
    Sparkles, Smartphone, HardDriveDownload,
    Languages, LayoutDashboard, MessageSquare, BookOpen,
    Settings, Info, Trash2, UserX,
    Camera, Mail, AlertTriangle, X, CheckCircle2, Pencil, Calendar, Eye, EyeOff,
    Zap
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import PasswordInput from '../components/PasswordInput';
import { supabase } from '../supabase';
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
   Setting Row — Skroutz style
 ───────────────────────────────────────── */
const SettingRow = ({
    icon: Icon,
    label,
    color = 'text-gray-800 dark:text-white/90',
    onClick,
    right,
    last = false,
    danger = false
}) => (
    <div
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        className={`group flex items-center gap-4 px-5 py-4 mb-3 rounded-[20px]
                    bg-[#f5f5f5] dark:bg-white/[0.04]
                    ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
                    transition-all duration-200`}
    >
        <Icon size={22} className={danger ? 'text-rose-500' : color} strokeWidth={1.75} />
        <span className={`flex-1 text-[16px] font-bold tracking-tight
                          ${danger ? 'text-rose-500' : 'text-gray-900 dark:text-white'}`}>
            {label}
        </span>
        <div className="flex-shrink-0 ml-1">
            {right !== undefined ? right : (
                <ChevronRight
                    size={20}
                    className="text-gray-900 dark:text-white/80 group-hover:translate-x-0.5 transition-transform"
                />
            )}
        </div>
    </div>
);

const InfoRow = ({ icon: Icon, label, value, last = false }) => (
    <div className={`flex items-center gap-4 px-5 py-4 mb-3 rounded-[20px] bg-[#f5f5f5] dark:bg-white/[0.04]`}>
        <Icon size={22} className="text-gray-800 dark:text-white/90" strokeWidth={1.75} />
        <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-gray-500 dark:text-white/60 mb-0.5">{label}</p>
            <p className="text-[15px] font-bold text-gray-900 dark:text-white truncate">{value}</p>
        </div>
    </div>
);

/* ─────────────────────────────────────────
   Card wrapper (No longer used for styling, just a pass-through)
 ───────────────────────────────────────── */
const Card = ({ children, className = '' }) => (
    <div className={`flex flex-col ${className}`}>
        {children}
    </div>
);

/* ─────────────────────────────────────────
   Section Label
 ───────────────────────────────────────── */
const SectionLabel = ({ children, className = '' }) => (
    <p className={`text-[16px] font-bold text-gray-900 dark:text-white mb-3 px-1 mt-6 ${className}`}>
        {children}
    </p>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
 ═══════════════════════════════════════════════════════════ */
const ProfileView = ({ user, onBack, onSignOut, onRecurring, onAccount, onGeneral, onSecurity, onBackup, onAdmin, onFeedback, onGuide, hideHeader }) => {
    const { theme, toggleTheme, language, updateLanguage, t: translate } = useSettings();
    const { isPro, openUpgradeModal, openBillingPortal } = useSubscription();
    const isDark = theme === 'dark';
    const { showToast } = useToast();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showApkModal, setShowApkModal] = useState(false);
    const [imgRetries, setImgRetries] = useState(0);
    const MAX_IMG_RETRIES = 3;

    const photoURL = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.photoURL;
    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name
        || user?.displayName || user?.email?.split('@')[0]
        || translate('anonymous_user');
    const isGoogle = user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google') || user?.identities?.some(i => i.provider === 'google');
    const provider = isGoogle ? 'Google' : 'Email / Password';
    const createdAt = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—';

    // Delete account
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDangerZone, setShowDangerZone] = useState(false);

    const isPasswordUser = user?.app_metadata?.provider === 'email'
        || user?.identities?.some(i => i.provider === 'email');

    useEffect(() => { setImgRetries(0); }, [photoURL]);

    const handleDeleteAccount = async (e) => {
        if (e) e.preventDefault();
        setIsDeleting(true);
        try {
            if (isPasswordUser) {
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: deletePassword
                });
                if (authError) throw new Error('wrong_password');
            }

            // 1. Delete all user data from public tables first
            const tables = ['transactions', 'recurring_transactions', 'goals', 'budgets', 'sessions'];
            for (const table of tables) {
                try {
                    await supabase.from(table).delete().eq('user_id', user.id);
                } catch (e) {
                    console.warn(`Failed to delete from ${table}:`, e);
                }
            }

            // 2. Call RPC to delete the auth user
            const { error: rpcError } = await supabase.rpc('delete_user');
            if (rpcError) throw rpcError;

            // 3. Clear session and local data
            await supabase.auth.signOut();
            localStorage.clear();

            showToast(translate('account_deleted_successfully') || 'Account deleted', 'success');

            // 4. Force reload to landing page
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } catch (error) {
            console.error('Delete error:', error);
            if (error.message === 'wrong_password') {
                showToast(translate('current_password_error') || 'Wrong password', 'error');
            } else {
                showToast(translate('error_message_generic') || 'Error during deletion', 'error');
            }
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <motion.div
            className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden"
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 36, mass: 0.8 }}
        >
            {/* ─────── Sticky Header ─────── */}
            <div
                className={`shrink-0 sticky top-0 z-20 transition-colors duration-300
                            ${hideHeader
                        ? 'bg-transparent border-none px-4 pt-4 pb-2'
                        : 'bg-gray-50 dark:bg-surface-dark backdrop-blur-xl border-b border-gray-100 dark:border-transparent px-4 pb-3'}`}
                style={!hideHeader ? { paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' } : {}}
            >
                <div className="flex items-center justify-center relative min-h-[32px]">
                    {/* Back button */}
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

                    {/* Page title */}
                    {!hideHeader && (
                        <h1 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight text-center truncate px-20">
                            {translate('settings_title') || 'Settings'}
                        </h1>
                    )}

                    {/* Upgrade CTA — only for free users */}
                    {!isPro && (
                        <motion.button
                            onClick={() => openUpgradeModal('profile_header')}
                            whileTap={{ scale: 0.93 }}
                            className="absolute right-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                                       bg-gradient-to-r from-amber-400 to-orange-500
                                       text-white text-[11px] font-extrabold tracking-wide
                                       shadow-[0_2px_12px_rgba(251,146,60,0.45)]
                                       hover:shadow-[0_4px_20px_rgba(251,146,60,0.55)] transition-shadow"
                        >
                            <Zap size={11} strokeWidth={2.5} className="fill-white" />
                            {translate('go_pro') || 'Upgrade to Pro'}
                        </motion.button>
                    )}
                    {/* Pro badge for subscribers */}
                    {isPro && (
                        <div className="absolute right-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full
                                        bg-gradient-to-r from-violet-500 to-purple-600
                                        text-white text-[11px] font-extrabold tracking-wide
                                        shadow-[0_2px_10px_rgba(139,92,246,0.35)]">
                            <Zap size={11} strokeWidth={2.5} className="fill-white" />
                            You're Pro!
                        </div>
                    )}
                </div>
            </div>

            {/* ─────── Scrollable Content ─────── */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 pb-12 space-y-5">

                    {/* ════ Avatar + Name Hero — centered ════ */}
                    <div className="flex flex-col items-center pt-6 pb-6 gap-3">
                        {/* Avatar */}
                        <motion.div
                            className="relative"
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28, delay: 0.08 }}
                        >
                            <div className="w-[96px] h-[96px] rounded-full overflow-hidden
                                            bg-gray-100 dark:bg-white/10
                                            ring-4 ring-white dark:ring-surface-dark2 shadow-xl">
                                {photoURL && imgRetries < MAX_IMG_RETRIES ? (
                                    <img
                                        src={imgRetries > 0 ? `${photoURL}${photoURL.includes('?') ? '&' : '?'}retry=${imgRetries}` : photoURL}
                                        alt="Profile"
                                        referrerPolicy="no-referrer"
                                        crossOrigin="anonymous"
                                        className="w-full h-full object-cover"
                                        onError={() => setTimeout(() => setImgRetries(prev => prev + 1), 500 * imgRetries)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User size={40} strokeWidth={1.5} className="text-gray-400 dark:text-white/40" />
                                    </div>
                                )}
                            </div>
                            {/* Online dot */}
                            <div className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full
                                            bg-emerald-400 border-2 border-gray-50 dark:border-surface-dark shadow-sm" />
                        </motion.div>

                        {/* Name */}
                        <motion.h2
                            className="text-[22px] leading-tight font-extrabold text-gray-900 dark:text-white text-center px-4"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.14, duration: 0.3 }}
                        >
                            {displayName}
                        </motion.h2>

                        {/* Edit profile button */}
                        <motion.button
                            onClick={onAccount}
                            whileTap={{ scale: 0.94 }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            className="inline-flex items-center px-5 py-2 rounded-full
                                       border border-gray-200 dark:border-white/10
                                       bg-white dark:bg-white/5
                                       text-[13px] font-bold text-gray-700 dark:text-white/80
                                       shadow-sm hover:bg-gray-50 dark:hover:bg-white/10
                                       active:scale-95 transition-all"
                        >
                            {translate('edit_profile') === 'edit_profile' ? 'Επεξεργασία προφίλ' : translate('edit_profile')}
                        </motion.button>
                    </div>

                    {/* ════ Top Action Cards ════ */}
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {/* Card 1: Subscription */}
                        <div
                            onClick={() => isPro ? openBillingPortal() : openUpgradeModal('profile')}
                            className="flex-1 min-w-[105px] h-[75px] rounded-[20px] p-3 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-sm text-center gap-1"
                            style={!isPro ? {
                                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                                boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
                            } : {
                                background: 'white',
                                border: '1px solid rgba(124,58,237,0.15)',
                            }}
                        >
                            {!isPro
                                ? (
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Zap size={16} fill="#fff" strokeWidth={0} className="text-white" />
                                        <p className="text-[12px] font-extrabold text-white">{translate('go_pro') || 'Upgrade to Pro'}</p>
                                    </div>
                                )
                                : <p className={`text-[13px] font-extrabold text-violet-600 dark:text-violet-400`}>{translate('manage') || 'Manage Pro'}</p>
                            }
                        </div>

                        {/* Card 2: Guide */}
                        <div
                            onClick={onGuide}
                            className="flex-1 min-w-[105px] h-[75px] rounded-[20px] bg-white dark:bg-surface-dark2 border border-gray-100 dark:border-white/5 p-3 flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-sm text-center"
                        >
                            <p className="text-[14px] font-extrabold text-blue-600 dark:text-blue-400">
                                {translate('user_guide') || 'Οδηγός'}
                            </p>
                        </div>

                        {/* Card 3: Feedback */}
                        <div
                            onClick={onFeedback}
                            className="flex-1 min-w-[105px] h-[75px] rounded-[20px] bg-white dark:bg-surface-dark2 border border-gray-100 dark:border-white/5 p-3 flex items-center justify-center cursor-pointer active:scale-95 transition-transform shadow-sm text-center"
                        >
                            <p className="text-[14px] font-extrabold text-gray-900 dark:text-white">
                                {translate('feedback') || 'Support'}
                            </p>
                        </div>
                    </div>

                    {/* ════ Account Info ════ */}
                    <div className="mt-4">
                        <SectionLabel>{translate('account_info') || 'Account info'}</SectionLabel>
                        <Card>
                            <InfoRow icon={Mail} label={translate('email') || 'Email'} value={user?.email || '—'} />
                            <InfoRow icon={Shield} label={translate('login_method') || 'Login method'} value={provider} />
                            <InfoRow icon={Calendar} label={translate('member_since') || 'Member since'} value={createdAt} last />
                        </Card>
                    </div>

                    {/* ════ Settings List ════ */}
                    <div className="mt-2">
                        <SectionLabel>{translate('other_settings') || 'Settings'}</SectionLabel>
                        <Card>
                            <SettingRow icon={Shield} label={translate('security') || 'Security'} onClick={onSecurity} />
                            <SettingRow icon={Settings} label={translate('general') || 'General'} onClick={onGeneral} />
                            <SettingRow
                                icon={Languages}
                                label={translate('language') || 'Language'}
                                right={
                                    <div className="flex gap-1 bg-white dark:bg-surface-dark p-0.5 rounded-lg shadow-sm border border-gray-200 dark:border-white/10">
                                        {['el', 'en'].map(lang => (
                                            <button
                                                key={lang}
                                                onClick={(e) => { e.stopPropagation(); updateLanguage(lang); }}
                                                className={`px-3 py-1.5 rounded-[10px] text-[11px] font-extrabold transition-all duration-200
                                                            ${language === lang
                                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                                        : 'text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                                            >
                                                {lang.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                }
                            />
                            <SettingRow icon={Moon} label={translate('dark_mode') || 'Dark mode'} onClick={toggleTheme} right={<Toggle enabled={isDark} onChange={toggleTheme} />} last />
                            <SettingRow icon={HardDriveDownload} label={translate('backup_restore') || 'Backup & Restore'} onClick={onBackup} />
                            <SettingRow icon={Smartphone} label={translate('install_android') || 'Install App (Android)'} onClick={() => setShowApkModal(true)} />
                            {user?.id === '86177767-e1f2-4356-b98b-e43503cab0da' && (
                                <SettingRow icon={LayoutDashboard} label={translate('control_panel') || 'Control Panel'} onClick={onAdmin} />
                            )}
                            <SettingRow icon={LogOut} label={translate('logout') || 'Sign out'} danger onClick={() => setShowLogoutModal(true)} last />
                        </Card>
                    </div>

                    {/* ════ Danger Zone ════ */}
                    <div className="mt-2">
                        <div
                            onClick={() => setShowDangerZone(!showDangerZone)}
                            className="flex items-center justify-between cursor-pointer group px-1 mb-3 mt-4"
                        >
                            <SectionLabel className="!mt-0 !mb-0 group-hover:text-rose-500 transition-colors">
                                {translate('danger_zone') || 'Danger zone'}
                            </SectionLabel>
                            <div className={`text-gray-400 dark:text-white/40 transition-transform duration-300 ${showDangerZone ? 'rotate-90' : ''}`}>
                                <ChevronRight size={20} />
                            </div>
                        </div>
                        {showDangerZone && (
                            <div className="animate-fade-in">
                                <Card>
                                    <button
                                        onClick={() => setShowDeleteModal(true)}
                                        className="w-full flex items-center gap-4 px-5 py-4 rounded-[20px] mb-3 text-left
                                                   bg-rose-50 dark:bg-rose-500/10
                                                   active:scale-[0.98] transition-all duration-150"
                                    >
                                        <Trash2 size={22} className="text-rose-500 flex-shrink-0" strokeWidth={1.75} />
                                        <span className="flex-1 text-[16px] font-bold text-rose-500 tracking-tight">
                                            {translate('deactivate_account') || 'Deactivate my account'}
                                        </span>
                                        <ChevronRight size={20} className="text-rose-400 dark:text-rose-500/60 flex-shrink-0" />
                                    </button>
                                </Card>
                                <p className="text-[12px] text-gray-500 dark:text-white/40 mt-1 px-3">
                                    {translate('data_deletion_warning') || 'Data deletion is irreversible.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ════ Footer ════ */}
                    <div className="flex flex-col items-center gap-1.5 pt-1 pb-2 mt-4">
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

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0
                                    bg-white dark:bg-surface-dark2 rounded-3xl p-6
                                    shadow-2xl border border-gray-100 dark:border-transparent
                                    animate-slide-up">
                        <div className="flex flex-col items-center mb-6 text-center">
                            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/15 rounded-2xl
                                            flex items-center justify-center mb-4
                                            shadow-[0_0_24px_rgba(239,68,68,0.15)]">
                                <AlertTriangle size={28} className="text-rose-500" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-[18px] font-bold text-gray-900 dark:text-white mb-2">
                                {translate('delete_account') || 'Delete Account'}
                            </h3>
                            <p className="text-[13px] text-gray-500 dark:text-white/60 leading-relaxed">
                                {translate('delete_account_confirm_message') || 'Are you sure you want to delete your account?'}
                            </p>
                        </div>

                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                            {isPasswordUser ? (
                                <PasswordInput
                                    label={translate('confirm_password_instruction')}
                                    value={deletePassword}
                                    onChange={e => setDeletePassword(e.target.value)}
                                    placeholder={translate('password_input_placeholder')}
                                    required
                                />
                            ) : (
                                <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4
                                                border border-gray-100 dark:border-transparent
                                                text-[13px] text-gray-600 dark:text-white/50">
                                    {translate('google_reauth_instruction')}
                                </div>
                            )}
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3.5 bg-gray-100 dark:bg-white/[0.06]
                                               text-gray-700 dark:text-white/60 font-bold rounded-xl
                                               hover:bg-gray-200 dark:hover:bg-white/[0.1]
                                               active:scale-95 transition-all text-[14px]"
                                >
                                    {translate('cancel') || 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isDeleting}
                                    className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600
                                               text-white font-bold rounded-xl
                                               shadow-[0_4px_16px_rgba(239,68,68,0.35)]
                                               active:scale-95 transition-all disabled:opacity-50 text-[14px]"
                                >
                                    {isDeleting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            {translate('deleting') || 'Deleting...'}
                                        </span>
                                    ) : (translate('delete_btn') || 'Delete')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ProfileView;
