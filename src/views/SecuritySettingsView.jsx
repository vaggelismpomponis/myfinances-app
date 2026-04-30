import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import {
    ArrowLeft,
    Smartphone,
    ShieldCheck,
    ChevronRight,
    KeyRound,
    X,
    Laptop,
    Monitor,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    MapPin,
    Clock,
    AlertTriangle
} from 'lucide-react';
import PasswordInput from '../components/PasswordInput';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../supabase';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

const BIOMETRIC_SERVER = 'app.myfinances.lock';

/* ── Section Label ── */
const SectionLabel = ({ children }) => (
    <p className="text-[12px] font-semibold text-gray-400 dark:text-white/50 mb-2 px-1">
        {children}
    </p>
);

/* ── Toggle switch ── */
const Toggle = ({ enabled, onClick }) => (
    <button
        onClick={onClick}
        className={`w-[42px] h-[24px] rounded-full flex items-center p-[3px] transition-colors duration-300
                     ${enabled ? 'bg-violet-600 shadow-[0_2px_8px_rgba(124,58,237,0.4)]' : 'bg-gray-200 dark:bg-white/10'}`}
    >
        <div className={`w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-300
                         ${enabled ? 'translate-x-[18px]' : 'translate-x-0'}`} />
    </button>
);


const SecuritySettingsView = ({ user, onBack }) => {
    const { isBiometricsEnabled, toggleBiometrics, isPinEnabled, setPin, removePin, appPin,
        isPrivacyScreenEnabled, togglePrivacyScreen, t: translate } = useSettings();
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [loading, setLoading] = useState(false);

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
        if (!isBiometricsEnabled) {
            if (!isPinEnabled || !appPin) {
                setShowNoPinModal(true);
                return;
            }
            try {
                const result = await NativeBiometric.isAvailable();
                if (!result.isAvailable) {
                    setShowBioUnavailableModal(true);
                    return;
                }

                if (Capacitor.isNativePlatform()) {
                    // Native: Store the PIN as a secure token in the device keychain.
                    // On unlock, we call verifyIdentity() first, then getCredentials() —
                    // so the token is only accessible after the OS confirms biometric identity.
                    await NativeBiometric.setCredentials({
                        username: 'myfinances_user',
                        password: appPin, // PIN is the secure token
                        server: BIOMETRIC_SERVER,
                    });
                } else {
                    // Web fallback: just verify identity
                    await NativeBiometric.verifyIdentity({
                        reason: translate('biometric_enable_reason'),
                        title: translate('biometric_enable_title'),
                        subtitle: "",
                        description: "",
                    });
                }
                toggleBiometrics(true);
            } catch (error) {
                console.error("Biometric setup failed:", error);
            }
        } else {
            // Remove stored credentials from keychain
            if (Capacitor.isNativePlatform()) {
                try {
                    await NativeBiometric.deleteCredentials({ server: BIOMETRIC_SERVER });
                } catch { /* ignore if not found */ }
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
            setPasswordError(translate('password_mismatch'));
            setLoading(false);
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError(translate('password_length_error'));
            setLoading(false);
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            setPasswordError(translate('password_uppercase_error'));
            setLoading(false);
            return;
        }
        if (!/[0-9]/.test(newPassword)) {
            setPasswordError(translate('password_digit_error'));
            setLoading(false);
            return;
        }
        try {
            // Verify current password first
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            });
            if (signInError) throw new Error('wrong_password');
            // Update password
            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
            if (updateError) throw updateError;
            setPasswordSuccess(translate('password_changed_success'));
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            setTimeout(() => { setShowPasswordModal(false); setPasswordSuccess(''); }, 2000);
        } catch (error) {
            console.error("Password change error:", error);
            setPasswordError(error.message === 'wrong_password' ? translate('current_password_error') : translate('error_message_generic'));
        } finally {
            setLoading(false);
        }
    };

    const getDeviceIcon = (deviceStr) => {
        if (!deviceStr) return ShieldCheck;
        if (deviceStr.includes('iPhone') || deviceStr.includes('Android')) return Smartphone;
        if (deviceStr.includes('Mac') || deviceStr.includes('Windows') || deviceStr.includes('Linux')) return Laptop;
        return Monitor;
    };

    const isPasswordUser = user?.app_metadata?.provider === 'email' || user?.identities?.some(i => i.provider === 'email');

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col animate-fade-in transition-colors duration-300">

            {/* ───────── Header ───────── */}
            <div
                className="shrink-0 bg-gray-50 dark:bg-surface-dark
                            border-b border-gray-100 dark:border-transparent
                            px-4 pb-3 sticky top-0 z-10
                            backdrop-blur-xl transition-colors duration-300"
                style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
            >
                <div className="flex items-center justify-center relative min-h-[32px]">
                    <button
                        onClick={onBack}
                        className="absolute left-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.08]
                                   flex items-center justify-center
                                   text-gray-500 dark:text-white/50
                                   hover:bg-gray-200 dark:hover:bg-white/[0.14]
                                   active:scale-90 transition-all"
                    >
                        <ArrowLeft size={15} strokeWidth={2.5} />
                    </button>
                    <h2 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight text-center">
                        {translate('security_title')}
                    </h2>
                </div>
            </div>

            {/* ───────── Content ───────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-10">

                {/* Login Security */}
                <div>
                    <SectionLabel>{translate('login_auth')}</SectionLabel>
                    <div className="bg-white dark:bg-surface-dark3 rounded-2xl overflow-hidden
                                    shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)]
                                    border border-gray-100 dark:border-transparent">

                        {/* Change Password — only for email users */}
                        {isPasswordUser && (
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left
                                           border-b border-gray-100/80 dark:border-transparent
                                           hover:bg-black/[0.03] dark:hover:bg-white/[0.04]
                                           active:scale-[0.98] transition-all duration-150"
                            >
                                <div className="w-9 h-9 rounded-[11px] bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                    <KeyRound size={16} className="text-violet-600 dark:text-violet-400" strokeWidth={2.2} />
                                </div>
                                <div className="flex-1">
                                    <span className="block font-semibold text-[13.5px] text-gray-800 dark:text-white/90">{translate('change_password')}</span>
                                    <span className="text-[11px] text-gray-400 dark:text-white/35">{translate('change_password_desc') || "Update your account password"}</span>
                                </div>
                                <ChevronRight size={14} className="text-gray-300 dark:text-white/40" />
                            </button>
                        )}

                        {/* PIN Toggle */}
                        <div className="flex items-center gap-3.5 px-4 py-3.5 border-b border-gray-100/80 dark:border-transparent">
                            <div className="w-9 h-9 rounded-[11px] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <Lock size={16} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.2} />
                            </div>
                            <div className="flex-1">
                                <span className="block font-semibold text-[13.5px] text-gray-800 dark:text-white/90">{translate('app_pin')}</span>
                                <span className="text-[11px] text-gray-400 dark:text-white/35">{translate('lock_screen')}</span>
                            </div>
                            <Toggle enabled={isPinEnabled} onClick={handleTogglePin} />
                        </div>

                        {/* Biometrics Toggle */}
                        <div className="flex items-center gap-3.5 px-4 py-3.5 border-b border-gray-100/80 dark:border-transparent">
                            <div className="w-9 h-9 rounded-[11px] bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                                <Smartphone size={16} className="text-cyan-600 dark:text-cyan-400" strokeWidth={2.2} />
                            </div>
                            <div className="flex-1">
                                <span className="block font-semibold text-[13.5px] text-gray-800 dark:text-white/90">{translate('biometrics')}</span>
                                <span className="text-[11px] text-gray-400 dark:text-white/35">{translate('biometrics_desc')}</span>
                            </div>
                            <Toggle enabled={isBiometricsEnabled} onClick={handleToggleBiometrics} />
                        </div>

                        {/* Privacy Screen Toggle */}
                        <div className="flex items-center gap-3.5 px-4 py-3.5">
                            <div className="w-9 h-9 rounded-[11px] bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                <EyeOff size={16} className="text-orange-600 dark:text-orange-400" strokeWidth={2.2} />
                            </div>
                            <div className="flex-1">
                                <span className="block font-semibold text-[13.5px] text-gray-800 dark:text-white/90">{translate('privacy_screen')}</span>
                                <span className="text-[11px] text-gray-400 dark:text-white/35">{translate('privacy_screen_desc')}</span>
                            </div>
                            <Toggle enabled={isPrivacyScreenEnabled} onClick={() => togglePrivacyScreen(!isPrivacyScreenEnabled)} />
                        </div>
                    </div>
                </div>

                {/* Active Sessions */}
                <div>
                    <SectionLabel>{translate('active_sessions')}</SectionLabel>
                    <div className="bg-white dark:bg-surface-dark3 rounded-2xl overflow-hidden
                                    shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)]
                                    border border-gray-100 dark:border-transparent">
                        {sessions.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center gap-2">
                                <Monitor size={24} className="text-gray-200 dark:text-white/15" />
                                <p className="text-[13px] text-gray-400 dark:text-white/50">{translate('loading_sessions')}</p>
                            </div>
                        ) : (
                            sessions.map((session, index) => {
                                const isCurrent = session.id === currentSessionId;
                                const DeviceIcon = getDeviceIcon(session.device);
                                const dateStr = new Date(session.last_active).toLocaleString('el-GR', {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                });
                                return (
                                    <div
                                        key={session.id}
                                        className={`flex items-center gap-3.5 px-4 py-3.5
                                                    ${index !== sessions.length - 1 ? 'border-b border-gray-100/80 dark:border-transparent' : ''}`}
                                    >
                                        <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0
                                                          ${isCurrent
                                                ? 'bg-violet-50 dark:bg-violet-500/10'
                                                : 'bg-gray-100 dark:bg-white/[0.05]'}`}>
                                            <DeviceIcon size={16}
                                                className={isCurrent ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 dark:text-white/60'}
                                                strokeWidth={2.2}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-[13.5px] text-gray-800 dark:text-white/90 truncate">
                                                    {session.device || translate('unknown_device')}
                                                </span>
                                                {isCurrent && (
                                                    <span className="shrink-0 px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/15
                                                                     text-emerald-700 dark:text-emerald-400 text-[9px] uppercase font-bold rounded-md">
                                                        {translate('this_device')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {session.location && (
                                                    <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-white/35">
                                                        <MapPin size={9} />
                                                        {session.location}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-white/35">
                                                    <Clock size={9} />
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
            </div>

            {/* ── Change Password Modal ── */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
                    <div className="relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0
                                    bg-white dark:bg-surface-dark2 rounded-3xl p-6
                                    shadow-2xl border border-gray-100 dark:border-transparent
                                    animate-slide-up">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">{translate('change_password')}</h3>
                                <p className="text-[12px] text-gray-400 dark:text-white/60">{translate('change_password_desc')}</p>
                            </div>
                            <button
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
                                    label={translate('current_password')}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder={translate('current_password_placeholder')}
                                    required
                                />
                                <div className="border-t border-gray-100 dark:border-transparent my-1" />
                                <PasswordInput
                                    label={translate('new_password')}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={translate('new_password_placeholder')}
                                    required
                                />
                                {/* Password Strength Meter */}
                                {newPassword.length > 0 && (() => {
                                    const strength = getPasswordStrength(newPassword);
                                    const bars = { weak: 1, fair: 2, strong: 3 }[strength] || 0;
                                    const colors = { weak: 'bg-rose-500', fair: 'bg-amber-400', strong: 'bg-emerald-500' };
                                    const labels = {
                                        weak: translate('password_strength_weak'),
                                        fair: translate('password_strength_fair'),
                                        strong: translate('password_strength_strong')
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
                                    label={translate('confirm_new_password')}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={translate('confirm_new_password_placeholder')}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 mt-2 bg-violet-600 hover:bg-violet-700
                                               text-white font-bold rounded-xl text-[14px]
                                               shadow-[0_4px_16px_rgba(124,58,237,0.35)]
                                               active:scale-95 transition-all disabled:opacity-50
                                               flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {translate('updating')}
                                        </>
                                    ) : translate('change_password')}
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
                                    shadow-2xl border border-gray-100 dark:border-transparent
                                    animate-slide-up text-center">
                        <div className="w-14 h-14 bg-violet-50 dark:bg-violet-500/15 rounded-2xl
                                        flex items-center justify-center mx-auto mb-4
                                        shadow-[0_0_24px_rgba(124,58,237,0.15)]">
                            <Lock size={24} className="text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[18px] font-bold text-gray-900 dark:text-white mb-1">{translate('pin_setup')}</h3>
                        <p className="text-[13px] text-gray-500 dark:text-white/60 mb-6">{translate('pin_instruction')}</p>

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
                                    className="flex-1 py-3.5 bg-gray-100 dark:bg-white
                                               text-gray-700 dark:text-black font-bold rounded-xl
                                               active:scale-95 transition-all text-[14px]"
                                >
                                    {translate('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={pinInput.length !== 4}
                                    className="flex-1 py-3.5 bg-violet-600 text-white font-bold rounded-xl
                                               shadow-[0_4px_16px_rgba(124,58,237,0.35)]
                                               active:scale-95 transition-all disabled:opacity-40 text-[14px]"
                                >
                                    {translate('save')}
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
                                    shadow-2xl border border-gray-100 dark:border-transparent
                                    animate-slide-in-up">

                        {/* Icon */}
                        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/15 rounded-2xl
                                        flex items-center justify-center mx-auto mb-4
                                        shadow-[0_0_24px_rgba(245,158,11,0.15)]">
                            <AlertTriangle size={26} className="text-amber-500 dark:text-amber-400" strokeWidth={1.8} />
                        </div>

                        {/* Text */}
                        <h3 className="text-[17px] font-bold text-gray-900 dark:text-white text-center mb-2">
                            {translate('cannot_disable_pin_title') || 'Δεν επιτρέπεται'}
                        </h3>
                        <p className="text-[13px] text-gray-500 dark:text-white/45 text-center leading-relaxed mb-6">
                            {translate('cannot_disable_pin_desc') || 'Το FaceID / TouchID χρησιμοποιεί το PIN ως εφεδρική μέθοδο ασφαλείας. Απενεργοποιήστε πρώτα το FaceID / TouchID για να αφαιρέσετε το PIN.'}
                        </p>

                        {/* Action */}
                        <button
                            onClick={() => setShowPinBlockedModal(false)}
                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400
                                       text-white font-bold rounded-xl text-[14px]
                                       shadow-[0_4px_16px_rgba(245,158,11,0.35)]
                                       active:scale-95 transition-all duration-200"
                        >
                            {translate('got_it')}
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
                                    shadow-2xl border border-gray-100 dark:border-transparent
                                    animate-slide-in-up">

                        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/15 rounded-2xl
                                        flex items-center justify-center mx-auto mb-4
                                        shadow-[0_0_24px_rgba(245,158,11,0.15)]">
                            <AlertTriangle size={26} className="text-amber-500 dark:text-amber-400" strokeWidth={1.8} />
                        </div>

                        <h3 className="text-[17px] font-bold text-gray-900 dark:text-white text-center mb-2">
                            {translate('pin_required_title')}
                        </h3>
                        <p className="text-[13px] text-gray-500 dark:text-white/45 text-center leading-relaxed mb-6">
                            {translate('pin_required_desc')}
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowNoPinModal(false)}
                                className="flex-1 py-3.5 bg-gray-100 dark:bg-white
                                           text-gray-700 dark:text-black font-bold rounded-xl
                                           active:scale-95 transition-all text-[14px]"
                            >
                                {translate('cancel')}
                            </button>
                            <button
                                onClick={() => { setShowNoPinModal(false); setPinInput(''); setShowPinModal(true); }}
                                className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-400
                                           text-white font-bold rounded-xl text-[14px]
                                           shadow-[0_4px_16px_rgba(245,158,11,0.35)]
                                           active:scale-95 transition-all duration-200"
                            >
                                {translate('set_pin')}
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
                                    shadow-2xl border border-gray-100 dark:border-transparent
                                    animate-slide-in-up">

                        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/15 rounded-2xl
                                        flex items-center justify-center mx-auto mb-4
                                        shadow-[0_0_24px_rgba(244,63,94,0.15)]">
                            <AlertTriangle size={26} className="text-rose-500 dark:text-rose-400" strokeWidth={1.8} />
                        </div>

                        <h3 className="text-[17px] font-bold text-gray-900 dark:text-white text-center mb-2">
                            {translate('biometric_unavailable_title')}
                        </h3>
                        <p className="text-[13px] text-gray-500 dark:text-white/45 text-center leading-relaxed mb-6">
                            {translate('biometric_unavailable_desc')}
                        </p>

                        <button
                            onClick={() => setShowBioUnavailableModal(false)}
                            className="w-full py-3.5 bg-rose-500 hover:bg-rose-400
                                       text-white font-bold rounded-xl text-[14px]
                                       shadow-[0_4px_16px_rgba(244,63,94,0.35)]
                                       active:scale-95 transition-all duration-200"
                        >
                            {translate('got_it')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecuritySettingsView;









