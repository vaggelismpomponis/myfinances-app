import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import {
    ArrowLeft,
    Smartphone,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    KeyRound,
    X,
    Laptop,
    Monitor,
    Lock,
    EyeOff,
    CheckCircle2,
    MapPin,
    Clock,
    AlertTriangle,
    Shield,
    Sparkles,
    Check
} from 'lucide-react';
import PasswordInput from '../components/PasswordInput';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../supabase';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { isWebBiometricAvailable, registerWebBiometric, clearWebBiometric } from '../utils/webBiometric';
import { useSubscription } from '../contexts/SubscriptionContext';
import ProBadge from '../components/ProBadge';

const BIOMETRIC_SERVER = 'app.myfinances.lock';

/* ── Toggle switch ── */
const Toggle = ({ enabled, onClick, disabled }) => (
    <button
        type="button"
        onClick={disabled ? null : onClick}
        disabled={disabled}
        aria-pressed={enabled}
        className={`w-[44px] h-[26px] rounded-full flex items-center p-[3px] transition-colors duration-300 shrink-0
                     ${enabled ? 'bg-violet-600 shadow-[0_2px_8px_rgba(124,58,237,0.4)]' : 'bg-gray-200 dark:bg-white/10'}
                     ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
    >
        <div className={`w-[20px] h-[20px] rounded-full bg-white shadow-sm transition-transform duration-300
                         ${enabled ? 'translate-x-[18px]' : 'translate-x-0'}`} />
    </button>
);

const SecuritySettingsView = ({ user, onBack, hideHeader }) => {
    const { isBiometricsEnabled, toggleBiometrics, isPinEnabled, setPin, removePin, appPin,
        isPrivacyScreenEnabled, togglePrivacyScreen, t: translate } = useSettings();
    const { isPro, openUpgradeModal } = useSubscription();
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const SESSIONS_PER_PAGE = 5;

    const [showPinModal, setShowPinModal] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [pinDots, setPinDots] = useState([false, false, false, false]);
    const [showPinBlockedModal, setShowPinBlockedModal] = useState(false);
    const [showNoPinModal, setShowNoPinModal] = useState(false);
    const [showBioUnavailableModal, setShowBioUnavailableModal] = useState(false);

    useEffect(() => {
        setCurrentSessionId(localStorage.getItem('myfinances_session_id'));
        if (!user) return;
        const fetchSessions = async () => {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('user_id', user.id)
                .order('last_active', { ascending: false });
            if (!error) setSessions(data || []);
        };
        fetchSessions();
        const channel = supabase
            .channel('sessions-changes')
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'sessions',
                filter: `user_id=eq.${user.id}`
            }, fetchSessions)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [user]);

    // Sync PIN dots with input
    useEffect(() => {
        setPinDots([
            pinInput.length > 0,
            pinInput.length > 1,
            pinInput.length > 2,
            pinInput.length > 3,
        ]);
    }, [pinInput]);

    const handleToggleBiometrics = async () => {
        if (!isBiometricsEnabled && !isPro) {
            openUpgradeModal('biometrics');
            return;
        }
        if (!isBiometricsEnabled) {
            if (!isPinEnabled || !appPin) {
                setShowNoPinModal(true);
                return;
            }
            try {
                if (Capacitor.isNativePlatform()) {
                    // Native: check availability via plugin, then store PIN in keychain.
                    const result = await NativeBiometric.isAvailable();
                    if (!result.isAvailable) {
                        setShowBioUnavailableModal(true);
                        return;
                    }
                    await NativeBiometric.setCredentials({
                        username: 'myfinances_user',
                        password: appPin,
                        server: BIOMETRIC_SERVER,
                    });
                } else {
                    // Web/PWA: use WebAuthn API (Windows Hello / Touch ID)
                    const available = await isWebBiometricAvailable();
                    if (!available) {
                        setShowBioUnavailableModal(true);
                        return;
                    }
                    await registerWebBiometric(user?.id ?? 'spendwise_user');
                }
                toggleBiometrics(true);
            } catch (error) {
                console.warn('Biometric setup cancelled or failed:', error);
            }
        } else {
            // Disable: clean up stored credentials
            if (Capacitor.isNativePlatform()) {
                try {
                    await NativeBiometric.deleteCredentials({ server: BIOMETRIC_SERVER });
                } catch { /* ignore if not found */ }
            } else {
                clearWebBiometric();
            }
            toggleBiometrics(false);
        }
    };

    const handleTogglePin = () => {
        if (isPinEnabled) {
            // Block removal if biometrics depend on the PIN
            if (isBiometricsEnabled) {
                setShowPinBlockedModal(true);
                return;
            }
            removePin();
        } else {
            setPinInput('');
            setShowPinModal(true);
        }
    };

    const handleSavePin = (e) => {
        e.preventDefault();
        if (pinInput.length === 4) {
            setPin(pinInput);
            setShowPinModal(false);
        }
    };

    const getPasswordStrength = (pwd) => {
        if (!pwd) return null;
        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score <= 1) return 'weak';
        if (score <= 3) return 'fair';
        return 'strong';
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        setLoading(true);
        if (newPassword !== confirmPassword) {
            setPasswordError(translate('password_mismatch') || 'Passwords do not match');
            setLoading(false);
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError(translate('password_length_error') || 'Password must be at least 8 characters');
            setLoading(false);
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            setPasswordError(translate('password_uppercase_error') || 'Password must contain an uppercase letter');
            setLoading(false);
            return;
        }
        if (!/[0-9]/.test(newPassword)) {
            setPasswordError(translate('password_digit_error') || 'Password must contain a number');
            setLoading(false);
            return;
        }
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            });
            if (signInError) throw new Error('wrong_password');

            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
            if (updateError) throw updateError;

            setPasswordSuccess(translate('password_changed_success') || 'Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordSuccess('');
            }, 2000);
        } catch (error) {
            console.error("Password change error:", error);
            setPasswordError(error.message === 'wrong_password'
                ? (translate('current_password_error') || 'Current password is incorrect.')
                : (translate('error_message_generic') || 'Failed to update password.'));
        } finally {
            setLoading(false);
        }
    };

    const getDeviceIcon = (deviceStr) => {
        if (!deviceStr) return Monitor;
        if (deviceStr.includes('iPhone') || deviceStr.includes('Android')) return Smartphone;
        if (deviceStr.includes('Mac') || deviceStr.includes('Windows') || deviceStr.includes('Linux')) return Laptop;
        return Monitor;
    };

    const isPasswordUser = user?.app_metadata?.provider === 'email' || user?.identities?.some(i => i.provider === 'email');

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden">

            {/* ─────── Mobile Sticky Header ─────── */}
            {!hideHeader && (
                <div
                    className="shrink-0 transition-colors duration-300 sticky top-0 z-20 bg-gray-50/90 dark:bg-surface-dark/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06] px-4 pb-3"
                    style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
                >
                    <div className="flex items-center justify-between min-h-[36px]">
                        <button
                            onClick={onBack}
                            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center text-gray-700 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/[0.14] active:scale-90 transition-all duration-150"
                            aria-label="Back"
                        >
                            <ArrowLeft size={16} strokeWidth={2.5} />
                        </button>
                        <div className="text-center">
                            <h2 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight">
                                {translate('security_title') || 'Security'}
                            </h2>
                            <p className="text-[11px] font-medium text-gray-500 dark:text-white/50 leading-none mt-0.5">
                                {translate('auth_sessions_desc') || 'Protection & sessions'}
                            </p>
                        </div>
                        <div className="w-9" />
                    </div>
                </div>
            )}

            {/* ─────── Main Scroll Container ─────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-6">

                    {/* Desktop Navigation Breadcrumb Bar */}
                    {hideHeader && (
                        <div className="flex items-center justify-between pb-1">
                            <button
                                onClick={onBack}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.05] border border-gray-200/80 dark:border-white/[0.08] text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.1] active:scale-95 shadow-sm transition-all"
                            >
                                <ArrowLeft size={14} strokeWidth={2.5} />
                                <span>{translate('guide_back_to_settings') || 'Back to Settings'}</span>
                            </button>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-200/60 dark:border-violet-500/20 text-xs font-semibold text-violet-700 dark:text-violet-300">
                                <ShieldCheck size={13} className="shrink-0 text-violet-600 dark:text-violet-400" />
                                <span>SpendWise Vault & Security</span>
                            </div>
                        </div>
                    )}

                    {/* ─────── Executive Hero Hub ─────── */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 dark:from-violet-950 dark:via-indigo-950 dark:to-surface-dark3 border border-violet-400/30 dark:border-white/10 shadow-xl shadow-violet-500/15 text-white p-6 sm:p-8">
                        {/* Ambient decorative glowing backdrops */}
                        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
                        <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
                            <ShieldCheck size={160} strokeWidth={1} />
                        </div>

                        <div className="relative z-10 max-w-2xl space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-violet-100 tracking-wide uppercase">
                                <Shield size={13} />
                                <span>Security Vault</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                                {translate('security_title') || 'Account Security'}
                            </h2>
                            <p className="text-sm sm:text-base text-violet-100/90 leading-relaxed font-medium">
                                {translate('security_desc') || 'Protect your financial records with hardware biometrics, encrypted PIN locks, and real-time monitoring of all active devices.'}
                            </p>

                            {/* Live Security Status Badges */}
                            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                                <span className={`px-2.5 py-1 rounded-lg backdrop-blur-sm border flex items-center gap-1.5 ${
                                    isPinEnabled
                                        ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200'
                                        : 'bg-white/10 border-white/15 text-violet-100/80'
                                }`}>
                                    <Lock size={12} strokeWidth={2.5} />
                                    <span>PIN: {isPinEnabled ? 'Active' : 'Not Set'}</span>
                                </span>

                                <span className={`px-2.5 py-1 rounded-lg backdrop-blur-sm border flex items-center gap-1.5 ${
                                    isBiometricsEnabled
                                        ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200'
                                        : 'bg-white/10 border-white/15 text-violet-100/80'
                                }`}>
                                    <Smartphone size={12} strokeWidth={2.5} />
                                    <span>Biometrics: {isBiometricsEnabled ? 'Enabled' : 'Off'}</span>
                                </span>

                                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-violet-100/90 flex items-center gap-1.5">
                                    <Laptop size={12} strokeWidth={2.5} />
                                    <span>{sessions.length || 1} Active {sessions.length === 1 ? 'Device' : 'Devices'}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Bento Grid: Authentication & Sessions ─────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

                        {/* ── Column 1: Login & Authentication ── */}
                        <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-500/20 flex items-center justify-center shrink-0">
                                    <Lock size={20} strokeWidth={2.3} />
                                </div>
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 border border-violet-200/60 dark:border-violet-500/20">
                                        Protection
                                    </span>
                                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight mt-1">
                                        {translate('login_auth') || 'Login & Authentication'}
                                    </h3>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                {translate('auth_sessions_desc') || 'Configure app locks, biometric unlock mechanisms, and privacy shields.'}
                            </p>

                            <div className="space-y-3 pt-1">
                                {/* Change Password — only for email users */}
                                {isPasswordUser && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(true)}
                                        className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] hover:bg-violet-50/60 dark:hover:bg-violet-500/[0.08] hover:border-violet-300 dark:hover:border-violet-500/30 active:scale-[0.99] transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-violet-100/70 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <KeyRound size={18} strokeWidth={2.2} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="block font-bold text-sm text-gray-900 dark:text-white truncate">
                                                {translate('change_password') || 'Change Password'}
                                            </span>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                {translate('change_password_desc') || 'Update your account password'}
                                            </span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-400 dark:text-white/40 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                                    </button>
                                )}

                                {/* PIN Toggle */}
                                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06]">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                        <Lock size={18} strokeWidth={2.2} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                                                {translate('app_pin') || 'App PIN'}
                                            </span>
                                            {isPinEnabled && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 uppercase">
                                                    On
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                            {translate('lock_screen') || 'Lock screen with 4-digit PIN'}
                                        </span>
                                    </div>
                                    <Toggle enabled={isPinEnabled} onClick={handleTogglePin} />
                                </div>

                                {/* Biometrics Toggle */}
                                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06]">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-100/70 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                                        <Smartphone size={18} strokeWidth={2.2} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                                                {translate('biometrics') || 'FaceID / TouchID'}
                                            </span>
                                            {!isPro && <ProBadge />}
                                        </div>
                                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                            {translate('biometrics_desc') || 'Fast biometric login & hardware unlock'}
                                        </span>
                                    </div>
                                    <Toggle enabled={isBiometricsEnabled} onClick={handleToggleBiometrics} disabled={!isPro} />
                                </div>

                                {/* Privacy Screen Toggle */}
                                <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06]">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100/70 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                        <EyeOff size={18} strokeWidth={2.2} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                                                {translate('privacy_screen') || 'Privacy Screen'}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                            {translate('privacy_screen_desc') || 'Hide app balance & preview in recent apps'}
                                        </span>
                                    </div>
                                    <Toggle enabled={isPrivacyScreenEnabled} onClick={() => togglePrivacyScreen(!isPrivacyScreenEnabled)} />
                                </div>
                            </div>
                        </div>

                        {/* ── Column 2: Connected Devices & Active Sessions ── */}
                        <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                            <Laptop size={20} strokeWidth={2.3} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/20">
                                                Sessions
                                            </span>
                                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight mt-1">
                                                {translate('active_sessions') || 'Active Sessions'}
                                            </h3>
                                        </div>
                                    </div>

                                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300">
                                        {sessions.length} {sessions.length === 1 ? 'device' : 'devices'}
                                    </span>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    All browsers and native devices currently signed in to your account.
                                </p>

                                {/* Sessions List */}
                                <div className="space-y-2.5 pt-1">
                                    {sessions.length === 0 ? (
                                        <div className="p-8 flex flex-col items-center justify-center text-center gap-2 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                            <Monitor size={28} className="text-gray-300 dark:text-white/20" />
                                            <p className="text-xs text-gray-400 dark:text-white/50">{translate('loading_sessions') || 'Loading sessions...'}</p>
                                        </div>
                                    ) : (
                                        sessions
                                            .slice((currentPage - 1) * SESSIONS_PER_PAGE, currentPage * SESSIONS_PER_PAGE)
                                            .map((session) => {
                                                const isCurrent = session.id === currentSessionId;
                                                const DeviceIcon = getDeviceIcon(session.device);
                                                const dateStr = new Date(session.last_active).toLocaleString('el-GR', {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                });
                                                return (
                                                    <div
                                                        key={session.id}
                                                        className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all ${
                                                            isCurrent
                                                                ? 'bg-violet-50/50 dark:bg-violet-500/[0.08] border-violet-200/80 dark:border-violet-500/25'
                                                                : 'bg-gray-50/80 dark:bg-white/[0.03] border-gray-200/60 dark:border-white/[0.06]'
                                                        }`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                            isCurrent
                                                                ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
                                                                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/60'
                                                        }`}>
                                                            <DeviceIcon size={18} strokeWidth={2.2} />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                                                    {session.device && !session.device.includes('Unknown') ? session.device : (translate('unknown_device') || 'Unknown Device')}
                                                                </span>
                                                                {isCurrent && (
                                                                    <span className="shrink-0 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold uppercase rounded-md flex items-center gap-1">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                        {translate('this_device') || 'This Device'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-0.5">
                                                                {session.location && !session.location.includes('Unknown') && (
                                                                    <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-white/40 truncate">
                                                                        <MapPin size={10} className="shrink-0" />
                                                                        {session.location}
                                                                    </span>
                                                                )}
                                                                <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-white/40 shrink-0">
                                                                    <Clock size={10} className="shrink-0" />
                                                                    {dateStr}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            {sessions.length > SESSIONS_PER_PAGE && (
                                <div className="pt-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
                                    <p className="text-[11px] text-gray-400 dark:text-white/40 font-medium">
                                        {translate('showing') || 'Showing'} <span className="font-bold text-gray-700 dark:text-gray-300">{(currentPage - 1) * SESSIONS_PER_PAGE + 1}</span> - <span className="font-bold text-gray-700 dark:text-gray-300">{Math.min(currentPage * SESSIONS_PER_PAGE, sessions.length)}</span> of <span className="font-bold text-gray-700 dark:text-gray-300">{sessions.length}</span>
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            aria-label="Previous page"
                                            className="w-8 h-8 rounded-lg bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-600 dark:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.1] active:scale-95 transition-all shadow-sm"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {[...Array(Math.ceil(sessions.length / SESSIONS_PER_PAGE))].map((_, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                                        currentPage === i + 1 ? 'w-4 bg-violet-600' : 'w-1.5 bg-gray-200 dark:bg-white/10'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(sessions.length / SESSIONS_PER_PAGE), prev + 1))}
                                            disabled={currentPage === Math.ceil(sessions.length / SESSIONS_PER_PAGE)}
                                            aria-label="Next page"
                                            className="w-8 h-8 rounded-lg bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-600 dark:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/[0.1] active:scale-95 transition-all shadow-sm"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─────── Bottom Bento: Trust & Safety ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                <ShieldCheck size={20} strokeWidth={2.3} />
                            </div>
                            <div>
                                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                    Hardware Security & Encryption Architecture
                                </h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Multi-layer protection designed for privacy and resilience
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-violet-600 dark:text-violet-400">
                                    <CheckCircle2 size={13} strokeWidth={2.5} />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                                    Biometric templates stay isolated inside Apple Secure Enclave & Android Keystore.
                                </p>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-violet-600 dark:text-violet-400">
                                    <CheckCircle2 size={13} strokeWidth={2.5} />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                                    Authenticated tokens rotate continuously with encrypted HTTPS session handshakes.
                                </p>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-violet-600 dark:text-violet-400">
                                    <Sparkles size={13} strokeWidth={2.5} />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                                    Zero-knowledge data privacy — your passwords and raw PINs are never stored plain-text.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Signature */}
                    <div className="text-center pt-2 pb-8">
                        <p className="text-[11px] font-medium text-gray-400 dark:text-white/40">
                            SpendWise &bull; Enterprise Grade Cryptographic Protection &bull; Version 2.0
                        </p>
                    </div>

                </div>
            </div>

            {/* ── Change Password Modal ── */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
                    <div className="relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0
                                    bg-white dark:bg-surface-dark2 rounded-3xl p-6
                                    shadow-2xl border border-gray-100 dark:border-white/10
                                    animate-slide-up">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">{translate('change_password') || 'Change Password'}</h3>
                                <p className="text-[12px] text-gray-400 dark:text-white/60">{translate('change_password_desc') || 'Update your account password'}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPasswordModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.07]
                                           flex items-center justify-center
                                           text-gray-400 hover:text-gray-600 dark:hover:text-white/60
                                           active:scale-90 transition-all"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {passwordSuccess ? (
                            <div className="py-8 flex flex-col items-center gap-3">
                                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/15 rounded-2xl flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-emerald-500" strokeWidth={1.5} />
                                </div>
                                <p className="text-[15px] font-bold text-emerald-600 dark:text-emerald-400">{passwordSuccess}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleChangePassword} className="space-y-3.5">
                                {passwordError && (
                                    <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400
                                                    text-[12px] px-4 py-3 rounded-xl border border-rose-100 dark:border-rose-500/20">
                                        {passwordError}
                                    </div>
                                )}
                                <PasswordInput
                                    label={translate('current_password') || 'Current Password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder={translate('current_password_placeholder') || '••••••••'}
                                    required
                                />
                                <div className="border-t border-gray-100 dark:border-white/10 my-1" />
                                <PasswordInput
                                    label={translate('new_password') || 'New Password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={translate('new_password_placeholder') || '••••••••'}
                                    required
                                />
                                {/* Password Strength Meter */}
                                {newPassword.length > 0 && (() => {
                                    const strength = getPasswordStrength(newPassword);
                                    const bars = { weak: 1, fair: 2, strong: 3 }[strength] || 0;
                                    const colors = { weak: 'bg-rose-500', fair: 'bg-amber-400', strong: 'bg-emerald-500' };
                                    const labels = {
                                        weak: translate('password_strength_weak') || 'Weak',
                                        fair: translate('password_strength_fair') || 'Fair',
                                        strong: translate('password_strength_strong') || 'Strong'
                                    };
                                    return (
                                        <div className="space-y-1.5">
                                            <div className="flex gap-1.5">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                                        i <= bars ? colors[strength] : 'bg-gray-200 dark:bg-white/10'
                                                    }`} />
                                                ))}
                                            </div>
                                            <p className={`text-[11px] font-semibold ${
                                                strength === 'weak' ? 'text-rose-500' :
                                                strength === 'fair' ? 'text-amber-500' :
                                                'text-emerald-600 dark:text-emerald-400'
                                            }`}>
                                                {labels[strength]}
                                            </p>
                                        </div>
                                    );
                                })()}
                                <PasswordInput
                                    label={translate('confirm_new_password') || 'Confirm New Password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={translate('confirm_new_password_placeholder') || '••••••••'}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 mt-2 bg-violet-600 hover:bg-violet-700
                                               text-white font-bold rounded-xl text-[14px]
                                               shadow-[0_4px_16px_rgba(124,58,237,0.35)]
                                               active:scale-95 transition-all disabled:opacity-50
                                               flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {translate('updating') || 'Updating...'}
                                        </>
                                    ) : (translate('change_password') || 'Change Password')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ── PIN Setup Modal ── */}
            {showPinModal && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPinModal(false)} />
                    <div className="relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0
                                    bg-white dark:bg-surface-dark2 rounded-3xl p-6
                                    shadow-2xl border border-gray-100 dark:border-white/10
                                    animate-slide-up text-center">
                        <div className="w-14 h-14 bg-violet-50 dark:bg-violet-500/15 rounded-2xl
                                        flex items-center justify-center mx-auto mb-4
                                        shadow-[0_0_24px_rgba(124,58,237,0.15)]">
                            <Lock size={24} className="text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[18px] font-bold text-gray-900 dark:text-white mb-1">{translate('pin_setup') || 'Set PIN'}</h3>
                        <p className="text-[13px] text-gray-500 dark:text-white/60 mb-6">{translate('pin_instruction') || 'Enter a 4-digit code to lock the app.'}</p>

                        {/* PIN dots */}
                        <div className="flex justify-center gap-4 mb-6">
                            {pinDots.map((filled, i) => (
                                <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-200
                                                          ${filled
                                        ? 'bg-violet-600 border-violet-600 scale-110'
                                        : 'border-gray-300 dark:border-white/20 bg-transparent'}`}
                                />
                            ))}
                        </div>

                        <form onSubmit={handleSavePin}>
                            {/* Visual numpad */}
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((k, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                            if (k === '⌫') setPinInput(p => p.slice(0, -1));
                                            else if (k !== '' && pinInput.length < 4) setPinInput(p => p + k);
                                        }}
                                        className={`py-3 rounded-xl font-bold text-[17px] transition-all active:scale-90
                                                    ${k === ''
                                                ? 'bg-transparent cursor-default'
                                                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-white/[0.1]'}`}
                                    >
                                        {k}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPinModal(false)}
                                    className="flex-1 py-3.5 bg-gray-100 dark:bg-white/[0.08]
                                               text-gray-700 dark:text-white font-bold rounded-xl
                                               active:scale-95 transition-all text-[14px]"
                                >
                                    {translate('cancel') || 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={pinInput.length !== 4}
                                    className="flex-1 py-3.5 bg-violet-600 text-white font-bold rounded-xl
                                               shadow-[0_4px_16px_rgba(124,58,237,0.35)]
                                               active:scale-95 transition-all disabled:opacity-40 text-[14px]"
                                >
                                    {translate('save') || 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── PIN Blocked Warning Modal ── */}
            {showPinBlockedModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center animate-fade-in px-5">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowPinBlockedModal(false)}
                    />
                    <div className="relative z-10 w-full max-w-sm
                                    bg-white dark:bg-surface-dark2 rounded-3xl p-6
                                    shadow-2xl border border-gray-100 dark:border-white/10
                                    animate-slide-in-up">

                        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/15 rounded-2xl
                                        flex items-center justify-center mx-auto mb-4
                                        shadow-[0_0_24px_rgba(245,158,11,0.15)]">
                            <AlertTriangle size={26} className="text-amber-500 dark:text-amber-400" strokeWidth={1.8} />
                        </div>

                        <h3 className="text-[17px] font-bold text-gray-900 dark:text-white text-center mb-2">
                            {translate('cannot_disable_pin_title') || 'Not Allowed'}
                        </h3>
                        <p className="text-[13px] text-gray-500 dark:text-white/45 text-center leading-relaxed mb-6">
                            {translate('cannot_disable_pin_desc') || 'FaceID / TouchID uses the PIN as a fallback security method. Disable FaceID / TouchID first before removing the PIN.'}
                        </p>

                        <button
                            type="button"
                            onClick={() => setShowPinBlockedModal(false)}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400
                                       text-white font-bold rounded-xl text-[14px]
                                       shadow-[0_4px_16px_rgba(245,158,11,0.35)]
                                       active:scale-95 transition-all duration-200"
                        >
                            {translate('got_it') || 'Got it'}
                        </button>
                    </div>
                </div>
            )}

            {/* ── No PIN Set Warning Modal ── */}
            {showNoPinModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center animate-fade-in px-5">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowNoPinModal(false)}
                    />
                    <div className="relative z-10 w-full max-w-sm
                                    bg-white dark:bg-surface-dark2 rounded-3xl p-6
                                    shadow-2xl border border-gray-100 dark:border-white/10
                                    animate-slide-in-up">

                        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/15 rounded-2xl
                                        flex items-center justify-center mx-auto mb-4
                                        shadow-[0_0_24px_rgba(245,158,11,0.15)]">
                            <AlertTriangle size={26} className="text-amber-500 dark:text-amber-400" strokeWidth={1.8} />
                        </div>

                        <h3 className="text-[17px] font-bold text-gray-900 dark:text-white text-center mb-2">
                            {translate('pin_required_title') || 'PIN Required'}
                        </h3>
                        <p className="text-[13px] text-gray-500 dark:text-white/45 text-center leading-relaxed mb-6">
                            {translate('pin_required_desc') || 'Please set a 4-digit PIN first before enabling biometric authentication.'}
                        </p>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowNoPinModal(false)}
                                className="flex-1 py-3.5 bg-gray-100 dark:bg-white/[0.08]
                                           text-gray-700 dark:text-white font-bold rounded-xl
                                           active:scale-95 transition-all text-[14px]"
                            >
                                {translate('cancel') || 'Cancel'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowNoPinModal(false); setPinInput(''); setShowPinModal(true); }}
                                className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400
                                           text-white font-bold rounded-xl text-[14px]
                                           shadow-[0_4px_16px_rgba(245,158,11,0.35)]
                                           active:scale-95 transition-all duration-200"
                            >
                                {translate('set_pin') || 'Set PIN'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Biometrics Unavailable Modal ── */}
            {showBioUnavailableModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center animate-fade-in px-5">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowBioUnavailableModal(false)}
                    />
                    <div className="relative z-10 w-full max-w-sm
                                    bg-white dark:bg-surface-dark2 rounded-3xl p-6
                                    shadow-2xl border border-gray-100 dark:border-white/10
                                    animate-slide-in-up">

                        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/15 rounded-2xl
                                        flex items-center justify-center mx-auto mb-4
                                        shadow-[0_0_24px_rgba(244,63,94,0.15)]">
                            <AlertTriangle size={26} className="text-rose-500 dark:text-rose-400" strokeWidth={1.8} />
                        </div>

                        <h3 className="text-[17px] font-bold text-gray-900 dark:text-white text-center mb-2">
                            {translate('biometric_unavailable_title') || 'Biometrics Unavailable'}
                        </h3>
                        <p className="text-[13px] text-gray-500 dark:text-white/45 text-center leading-relaxed mb-6">
                            {translate('biometric_unavailable_desc') || 'Biometric hardware is not available or not configured on this device.'}
                        </p>

                        <button
                            type="button"
                            onClick={() => setShowBioUnavailableModal(false)}
                            className="w-full py-3.5 bg-rose-500 hover:bg-rose-400
                                       text-white font-bold rounded-xl text-[14px]
                                       shadow-[0_4px_16px_rgba(244,63,94,0.35)]
                                       active:scale-95 transition-all duration-200"
                        >
                            {translate('got_it') || 'Got it'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecuritySettingsView;
