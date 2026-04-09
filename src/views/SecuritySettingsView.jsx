import React, { useState, useEffect } from 'react';
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
    Clock
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, appId, auth } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';

/* ── Section Label ── */
const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-white/30 mb-2 ml-1 px-1">
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

/* ── Input field ── */
const PasswordInput = ({ label, value, onChange, placeholder, required }) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="block text-[11px] font-semibold text-gray-400 dark:text-white/40 uppercase tracking-wide mb-1.5">
                {label}
            </label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pr-11 bg-gray-50 dark:bg-white/[0.05]
                               border border-gray-200 dark:border-white/[0.08]
                               rounded-xl text-[14px] text-gray-900 dark:text-white
                               placeholder:text-gray-300 dark:placeholder:text-white/20
                               focus:outline-none focus:ring-2 focus:ring-violet-500/40
                               transition-all"
                    required={required}
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/30
                               hover:text-gray-600 dark:hover:text-white/60 transition-colors"
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    );
};

const SecuritySettingsView = ({ user, onBack }) => {
    const { isBiometricsEnabled, toggleBiometrics, isPinEnabled, setPin, removePin, appPin, t: translate } = useSettings();
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

    useEffect(() => {
        setCurrentSessionId(localStorage.getItem('myfinances_session_id'));
        if (!user) return;
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'sessions'), orderBy('lastActive', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
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
                alert("Please set an App PIN first as a fallback security method.");
                setShowPinModal(true);
                return;
            }
            try {
                const result = await NativeBiometric.isAvailable();
                if (!result.isAvailable) {
                    alert("Your device doesn't support biometric login or hasn't set it up.");
                    return;
                }
                await NativeBiometric.verifyIdentity({
                    reason: "Confirm to enable biometrics",
                    title: "Enable Biometrics",
                    subtitle: "",
                    description: "",
                });
                toggleBiometrics(true);
            } catch (error) {
                console.error("Biometric setup failed:", error);
            }
        } else {
            toggleBiometrics(false);
        }
    };

    const handleTogglePin = () => {
        if (isPinEnabled) {
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
        if (newPassword.length < 6) {
            setPasswordError(translate('password_length_error'));
            setLoading(false);
            return;
        }
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setPasswordSuccess(translate('password_changed_success'));
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            setTimeout(() => { setShowPasswordModal(false); setPasswordSuccess(''); }, 2000);
        } catch (error) {
            console.error("Password change error:", error);
            setPasswordError(error.code === 'auth/wrong-password' ? translate('current_password_error') : "Error: " + error.message);
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

    const isPasswordUser = user?.providerData?.some(p => p.providerId === 'password');

    return (
        <div className="h-full bg-gray-50 dark:bg-[#0f0f14] flex flex-col animate-fade-in transition-colors duration-300">

            {/* ───────── Header ───────── */}
            <div className="shrink-0 bg-white dark:bg-white/[0.03]
                            border-b border-gray-100 dark:border-white/[0.06]
                            shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:shadow-none
                            px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 sticky top-0 z-10
                            backdrop-blur-xl transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/[0.07]
                                   flex items-center justify-center
                                   text-gray-600 dark:text-white/60
                                   hover:bg-gray-200 dark:hover:bg-white/[0.12]
                                   active:scale-90 transition-all"
                    >
                        <ArrowLeft size={17} strokeWidth={2.5} />
                    </button>
                    <div>
                        <h2 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">
                            {translate('security_title')}
                        </h2>
                        <p className="text-[11px] text-gray-400 dark:text-white/35">Authentication & sessions</p>
                    </div>
                </div>
            </div>

            {/* ───────── Content ───────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-10">

                {/* Login Security */}
                <div>
                    <SectionLabel>{translate('login_auth')}</SectionLabel>
                    <div className="bg-white dark:bg-white/[0.04] rounded-2xl overflow-hidden
                                    shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-none
                                    border border-gray-100 dark:border-white/[0.06]">

                        {/* Change Password — only for email users */}
                        {isPasswordUser && (
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left
                                           border-b border-gray-100/80 dark:border-white/[0.05]
                                           hover:bg-black/[0.03] dark:hover:bg-white/[0.04]
                                           active:scale-[0.98] transition-all duration-150"
                            >
                                <div className="w-9 h-9 rounded-[11px] bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                    <KeyRound size={16} className="text-violet-600 dark:text-violet-400" strokeWidth={2.2} />
                                </div>
                                <div className="flex-1">
                                    <span className="block font-semibold text-[13.5px] text-gray-800 dark:text-white/90">{translate('change_password')}</span>
                                    <span className="text-[11px] text-gray-400 dark:text-white/35">Update your account password</span>
                                </div>
                                <ChevronRight size={14} className="text-gray-300 dark:text-white/20" />
                            </button>
                        )}

                        {/* PIN Toggle */}
                        <div className="flex items-center gap-3.5 px-4 py-3.5 border-b border-gray-100/80 dark:border-white/[0.05]">
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
                        <div className="flex items-center gap-3.5 px-4 py-3.5">
                            <div className="w-9 h-9 rounded-[11px] bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                                <Smartphone size={16} className="text-cyan-600 dark:text-cyan-400" strokeWidth={2.2} />
                            </div>
                            <div className="flex-1">
                                <span className="block font-semibold text-[13.5px] text-gray-800 dark:text-white/90">{translate('biometrics')}</span>
                                <span className="text-[11px] text-gray-400 dark:text-white/35">{translate('biometrics_desc')}</span>
                            </div>
                            <Toggle enabled={isBiometricsEnabled} onClick={handleToggleBiometrics} />
                        </div>
                    </div>
                </div>

                {/* Active Sessions */}
                <div>
                    <SectionLabel>{translate('active_sessions')}</SectionLabel>
                    <div className="bg-white dark:bg-white/[0.04] rounded-2xl overflow-hidden
                                    shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-none
                                    border border-gray-100 dark:border-white/[0.06]">
                        {sessions.length === 0 ? (
                            <div className="p-8 flex flex-col items-center justify-center gap-2">
                                <Monitor size={24} className="text-gray-200 dark:text-white/15" />
                                <p className="text-[13px] text-gray-400 dark:text-white/30">{translate('loading_sessions')}</p>
                            </div>
                        ) : (
                            sessions.map((session, index) => {
                                const isCurrent = session.id === currentSessionId;
                                const DeviceIcon = getDeviceIcon(session.device);
                                const dateStr = new Date(session.lastActive).toLocaleString('el-GR', {
                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                });
                                return (
                                    <div
                                        key={session.id}
                                        className={`flex items-center gap-3.5 px-4 py-3.5
                                                    ${index !== sessions.length - 1 ? 'border-b border-gray-100/80 dark:border-white/[0.05]' : ''}`}
                                    >
                                        <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0
                                                          ${isCurrent
                                                ? 'bg-violet-50 dark:bg-violet-500/10'
                                                : 'bg-gray-100 dark:bg-white/[0.05]'}`}>
                                            <DeviceIcon size={16}
                                                className={isCurrent ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 dark:text-white/40'}
                                                strokeWidth={2.2}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-[13.5px] text-gray-800 dark:text-white/90 truncate">
                                                    {session.device || 'Unknown device'}
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
                                    bg-white dark:bg-[#1a1a2e] rounded-3xl p-6
                                    shadow-2xl border border-gray-100 dark:border-white/[0.08]
                                    animate-slide-up">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">{translate('change_password')}</h3>
                                <p className="text-[12px] text-gray-400 dark:text-white/40">Update your security credentials</p>
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
                                    placeholder="Your current password"
                                    required
                                />
                                <div className="border-t border-gray-100 dark:border-white/[0.05] my-1" />
                                <PasswordInput
                                    label={translate('new_password')}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="New password (min 6 chars)"
                                    required
                                />
                                <PasswordInput
                                    label={translate('confirm_new_password')}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
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
                                            Updating...
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
                                    bg-white dark:bg-[#1a1a2e] rounded-3xl p-6
                                    shadow-2xl border border-gray-100 dark:border-white/[0.08]
                                    animate-slide-up text-center">
                        <div className="w-14 h-14 bg-violet-50 dark:bg-violet-500/15 rounded-2xl
                                        flex items-center justify-center mx-auto mb-4
                                        shadow-[0_0_24px_rgba(124,58,237,0.15)]">
                            <Lock size={24} className="text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-[18px] font-bold text-gray-900 dark:text-white mb-1">{translate('pin_setup')}</h3>
                        <p className="text-[13px] text-gray-500 dark:text-white/40 mb-6">{translate('pin_instruction')}</p>

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
                            <input
                                type="tel"
                                maxLength="4"
                                value={pinInput}
                                onChange={(e) => {
                                    const v = e.target.value.replace(/\D/g, '');
                                    if (v.length <= 4) setPinInput(v);
                                }}
                                className="sr-only"
                                autoFocus
                            />
                            {/* Visual numpad */}
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
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
                                    className="flex-1 py-3.5 bg-gray-100 dark:bg-white/[0.06]
                                               text-gray-700 dark:text-white/60 font-bold rounded-xl
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
        </div>
    );
};

export default SecuritySettingsView;
