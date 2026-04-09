import React, { useState, useEffect } from 'react';
import {
    User, Settings, LogOut, ChevronRight,
    Cloud, Shield, ArrowLeft, Moon, Sun, Repeat,
    Sparkles, CheckCircle, Wifi, Smartphone
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';

/* ── Small reusable section label ── */
const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-white/30 mb-2 ml-1 px-1">
        {children}
    </p>
);

/* ── Individual setting row ── */
const SettingRow = ({ icon: Icon, label, sublabel, color, bg, onClick, right, last = false }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3.5 px-4 py-3.5 cursor-pointer
                    active:scale-[0.98] transition-all duration-150
                    hover:bg-black/[0.03] dark:hover:bg-white/[0.04]
                    ${!last ? 'border-b border-gray-100/80 dark:border-white/[0.05]' : ''}`}
    >
        <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0 ${bg}`}>
            <Icon size={16} className={color} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
            <span className="block font-semibold text-[13.5px] text-gray-800 dark:text-white/90 leading-tight">{label}</span>
            {sublabel && <span className="block text-[11px] text-gray-400 dark:text-white/35 mt-0.5 leading-tight">{sublabel}</span>}
        </div>
        {right !== undefined ? right : (
            <ChevronRight size={14} className="text-gray-300 dark:text-white/20 flex-shrink-0" />
        )}
    </div>
);

/* ── Toggle switch ── */
const Toggle = ({ enabled }) => (
    <div className={`w-[42px] h-[24px] rounded-full flex items-center p-[3px] transition-colors duration-300
                     ${enabled ? 'bg-violet-600' : 'bg-gray-200 dark:bg-white/10'}`}>
        <div className={`w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-300
                         ${enabled ? 'translate-x-[18px]' : 'translate-x-0'}`} />
    </div>
);

const ProfileView = ({ user, onBack, onSignOut, onRecurring, onGeneral, onSecurity }) => {
    const { theme, toggleTheme, t: translate } = useSettings();
    const isDark = theme === 'dark';
    const { showToast } = useToast();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [imgError, setImgError] = useState(false);

    useEffect(() => { setImgError(false); }, [user.photoURL]);

    const displayName = user.displayName || user.email?.split('@')[0] || translate('anonymous_user');

    return (
        <div className="h-full bg-gray-50 dark:bg-[#0f0f14] animate-fade-in flex flex-col transition-colors duration-300">

            {/* ───────── Hero Header ───────── */}
            <div className="relative overflow-hidden shrink-0"
                style={{
                    background: isDark
                        ? 'linear-gradient(145deg, #1e1030 0%, #160d28 40%, #0d1a2e 100%)'
                        : 'linear-gradient(145deg, #6d28d9 0%, #7c3aed 50%, #4f46e5 100%)',
                    paddingTop: 'calc(env(safe-area-inset-top) + 3.5rem)',
                    paddingBottom: '2.5rem',
                    paddingLeft: '1.25rem',
                    paddingRight: '1.25rem',
                }}
            >
                {/* Decorative orbs */}
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)' }} />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />

                {/* Back button */}
                <button
                    onClick={onBack}
                    className="absolute top-[calc(env(safe-area-inset-top)+1rem)] left-4
                               w-9 h-9 rounded-full glass flex items-center justify-center
                               text-white/70 hover:text-white active:scale-90 transition-all"
                >
                    <ArrowLeft size={17} strokeWidth={2.5} />
                </button>

                {/* Avatar + Info */}
                <div className="relative z-10 flex flex-col items-center">
                    {/* Avatar ring */}
                    <div className="relative mb-4">
                        <div className="w-[88px] h-[88px] rounded-[26px] overflow-hidden
                                        flex items-center justify-center
                                        shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
                            style={{ background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)' }}
                        >
                            {user.photoURL && !imgError ? (
                                <img src={user.photoURL} alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)} />
                            ) : (
                                <User size={40} strokeWidth={1.5} className="text-white/70" />
                            )}
                        </div>
                        {/* Active indicator */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full
                                        bg-emerald-400 border-2 border-white dark:border-[#0f0f14]
                                        flex items-center justify-center shadow-lg">
                            <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                    </div>

                    <h2 className="text-[19px] font-bold text-white mb-0.5 tracking-tight">{displayName}</h2>
                    <p className="text-white/50 text-[12px] mb-4 font-medium">{user.email}</p>

                    {/* Sync badge */}
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        <Wifi size={10} className="text-emerald-300" />
                        <span className="text-[11px] font-semibold text-white/80">{translate('sync_active')}</span>
                    </div>
                </div>
            </div>

            {/* ───────── Settings Sections ───────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-10">

                {/* Preferences */}
                <div>
                    <SectionLabel>{translate('settings_title')}</SectionLabel>
                    <div className="bg-white dark:bg-white/[0.04] rounded-2xl overflow-hidden
                                    shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-none
                                    border border-gray-100 dark:border-white/[0.06]">
                        <SettingRow
                            icon={isDark ? Moon : Sun}
                            label={translate('dark_theme')}
                            sublabel={isDark ? 'Dark mode active' : 'Light mode active'}
                            color={isDark ? 'text-violet-400' : 'text-amber-500'}
                            bg={isDark ? 'bg-violet-500/15' : 'bg-amber-50'}
                            onClick={toggleTheme}
                            right={<Toggle enabled={isDark} />}
                        />
                        <SettingRow
                            icon={Repeat}
                            label={translate('recurring_transactions')}
                            sublabel="Auto-scheduled payments"
                            color="text-cyan-500 dark:text-cyan-400"
                            bg="bg-cyan-50 dark:bg-cyan-500/10"
                            onClick={onRecurring}
                        />
                        <SettingRow
                            icon={Smartphone}
                            label={translate('install_android')}
                            sublabel={translate('install_android_desc')}
                            color="text-green-500 dark:text-green-400"
                            bg="bg-green-50 dark:bg-green-500/10"
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = '/SpendWise.apk';
                                link.download = 'SpendWise.apk';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                        />
                        <SettingRow
                            icon={Settings}
                            label={translate('general')}
                            sublabel="Language, data, notifications"
                            color="text-violet-600 dark:text-violet-400"
                            bg="bg-violet-50 dark:bg-violet-500/10"
                            onClick={onGeneral}
                        />
                        <SettingRow
                            icon={Shield}
                            label={translate('security')}
                            sublabel="PIN, biometrics, sessions"
                            color="text-emerald-600 dark:text-emerald-400"
                            bg="bg-emerald-50 dark:bg-emerald-500/10"
                            onClick={onSecurity}
                            last
                        />
                    </div>
                </div>

                {/* Account */}
                <div>
                    <SectionLabel>{translate('account')}</SectionLabel>
                    <div className="bg-white dark:bg-white/[0.04] rounded-2xl overflow-hidden
                                    shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-none
                                    border border-gray-100 dark:border-white/[0.06]">
                        <SettingRow
                            icon={LogOut}
                            label={translate('logout')}
                            color="text-rose-500"
                            bg="bg-rose-50 dark:bg-rose-500/10"
                            onClick={() => setShowLogoutModal(true)}
                            right={null}
                            last
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-3 pb-4">
                    <div className="flex items-center justify-center gap-1.5 mb-1.5">
                        <Sparkles size={11} className="text-violet-400" />
                        <span className="text-[12px] font-bold gradient-text">SpendWise</span>
                    </div>
                    <p className="text-[10px] text-gray-300 dark:text-white/20">
                        {translate('version')} • 2026
                    </p>
                </div>
            </div>

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
