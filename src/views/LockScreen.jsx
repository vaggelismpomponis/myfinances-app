import React, { useState, useEffect } from 'react';
import { Wallet, Delete, ScanFace, LogOut, X, Check } from 'lucide-react';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { verifyWebBiometric, hasWebBiometricRegistered, clearWebBiometric } from '../utils/webBiometric';
import { Capacitor } from '@capacitor/core';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../supabase';
import PromptModal from '../components/PromptModal';

const BIOMETRIC_SERVER = 'app.myfinances.lock';

const LockScreen = ({ onSignOut, user }) => {
    const { appPin, unlockApp, isBiometricsEnabled, removePin, toggleBiometrics, t } = useSettings();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetError, setResetError] = useState('');
    const [bioToast, setBioToast] = useState(false);

    // Migration guard: if biometrics is flagged as enabled on web but no real
    // WebAuthn credential was ever registered (old fake-enrollment state),
    // silently reset the flag so the user sees just the PIN pad.
    useEffect(() => {
        if (isBiometricsEnabled && !Capacitor.isNativePlatform()) {
            if (!hasWebBiometricRegistered()) {
                clearWebBiometric();
                toggleBiometrics(false);
                // Show a brief nudge so the user knows what happened
                setBioToast(true);
                setTimeout(() => setBioToast(false), 5000);
            }
        }
    }, []);

    const handleBiometricAuth = async () => {
        setIsScanning(true);
        try {
            if (Capacitor.isNativePlatform()) {
                // Native: check plugin availability, show OS prompt, then retrieve keychain token.
                const result = await NativeBiometric.isAvailable();
                if (!result.isAvailable) { setIsScanning(false); return; }

                await NativeBiometric.verifyIdentity({
                    reason: t('biometric_reason'),
                    title: t('biometric_title'),
                    subtitle: t('biometric_subtitle'),
                    description: '',
                });
                const credentials = await NativeBiometric.getCredentials({
                    server: BIOMETRIC_SERVER,
                });
                if (credentials.password === appPin) {
                    unlockApp();
                    setPin('');
                }
            } else {
                // Web/PWA: use the real WebAuthn API.
                // verifyWebBiometric() calls navigator.credentials.get(), which
                // shows the actual OS biometric dialog (Touch ID, Windows Hello, etc.).
                // It throws if the user cancels or fails — the catch below keeps the lock.
                if (!hasWebBiometricRegistered()) {
                    // Stale state — clear it and prompt to re-enroll
                    clearWebBiometric();
                    toggleBiometrics(false);
                    setBioToast(true);
                    setTimeout(() => setBioToast(false), 5000);
                    return;
                }
                await verifyWebBiometric();
                unlockApp();
                setPin('');
            }
        } catch { /* cancelled or failed — stay locked */ }
        finally { setIsScanning(false); }
    };

    useEffect(() => {
        // Auto-trigger biometric prompt only on native platforms.
        // On web/PWA, WebAuthn requires a real user gesture (button tap) to show
        // the OS biometric dialog — auto-triggering on mount resolves silently
        // without actually authenticating the user.
        if (isBiometricsEnabled && Capacitor.isNativePlatform()) {
            const timer = setTimeout(handleBiometricAuth, 300);
            return () => clearTimeout(timer);
        }
    }, [isBiometricsEnabled]);

    const handleNumberClick = (num) => {
        if (pin.length < 4) { setPin(p => p + num); setError(false); }
    };

    useEffect(() => {
        if (pin.length === 4) {
            if (pin === appPin) {
                setTimeout(() => { unlockApp(); setPin(''); }, 180);
            } else {
                setError(true);
                setTimeout(() => setPin(''), 480);
            }
        }
    }, [pin, appPin, unlockApp]);

    const handleForgotPinSubmit = async (submittedPassword) => {
        setLoading(true);
        setResetError('');
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: submittedPassword
            });
            if (error) throw error;
            removePin();
            toggleBiometrics(false);
            unlockApp();
        } catch {
            setResetError(t('wrong_password'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] mesh-bg flex flex-col items-center justify-center
                        animate-fade-in transition-colors duration-300 overflow-hidden">

            {/* Ambient glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2
                            w-80 h-80 rounded-full bg-violet-600/20 blur-[100px] pointer-events-none" />

            {/* Biometrics re-enrollment toast */}
            {bioToast && (
                <div className="absolute top-6 left-4 right-4 z-10
                                bg-amber-500/90 backdrop-blur-sm
                                text-white text-xs font-semibold
                                px-4 py-3 rounded-2xl shadow-lg
                                animate-slide-in-up text-center leading-relaxed">
                    {t('biometric_reenroll_notice') || 'Face/Touch ID needs to be re-enabled in Settings → Security.'}
                </div>
            )}

            {/* Logo */}
            <div className="flex flex-col items-center mb-10 animate-slide-in-up">
                <div className="relative mb-4">
                    <div className="absolute inset-0 rounded-2xl bg-violet-600/40 blur-lg scale-110 animate-glow-pulse" />
                    <div className="relative w-16 h-16 flex items-center justify-center z-10 animate-glow-pulse">
                        <img src="/spendwise-logo.png" alt="App Logo" className="w-16 h-16 drop-shadow-md object-contain" />
                    </div>
                </div>
                <h1 className="text-2xl font-black text-white mb-1">{t('lock_welcome')}</h1>
                <p className="text-sm text-gray-400 font-medium">{t('lock_enter_pin')}</p>
            </div>

            {/* PIN dots */}
            <div className="flex gap-5 mb-10">
                {[0, 1, 2, 3].map(i => (
                    <div key={i}
                         className={`relative w-4 h-4 rounded-full transition-all duration-250
                                     ${pin.length > i
                                        ? 'bg-violet-500 scale-110 shadow-glow-sm'
                                        : error
                                            ? 'bg-rose-500'
                                            : 'bg-white/15 border border-white/20'
                                     }
                                     ${error ? 'animate-shake' : ''}`} />
                ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-x-7 gap-y-4 mb-8">
                {[1,2,3,4,5,6,7,8,9].map(num => (
                    <button key={num}
                            onClick={() => handleNumberClick(num.toString())}
                            className="w-18 h-18 w-[72px] h-[72px] rounded-2xl
                                       glass text-white
                                       hover:bg-white/15 active:scale-95 active:bg-white/20
                                       flex items-center justify-center
                                       text-2xl font-bold
                                       transition-all duration-150 press-effect">
                        {num}
                    </button>
                ))}

                {/* Biometric / empty */}
                <div className="flex items-center justify-center">
                    {isBiometricsEnabled && (
                        <button onClick={handleBiometricAuth}
                                className={`w-[72px] h-[72px] rounded-2xl flex items-center justify-center
                                            transition-all duration-200 press-effect
                                            ${isScanning
                                                ? 'glass bg-violet-500/30 text-violet-300 animate-glow-pulse'
                                                : 'glass text-violet-300 hover:bg-white/15'
                                            }`}>
                            <ScanFace size={30} />
                        </button>
                    )}
                </div>

                <button onClick={() => handleNumberClick('0')}
                        className="w-[72px] h-[72px] rounded-2xl glass text-white
                                   hover:bg-white/15 active:scale-95
                                   flex items-center justify-center
                                   text-2xl font-bold transition-all duration-150 press-effect">
                    0
                </button>

                <button onClick={() => setPin(p => p.slice(0, -1))}
                        className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center
                                   text-gray-400 hover:text-white hover:bg-white/10
                                   transition-all duration-200 press-effect">
                    <Delete size={26} />
                </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-3">
                <button onClick={() => setShowForgotModal(true)}
                        className="text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors">
                    {t('forgot_pin')}
                </button>
                <button onClick={onSignOut}
                        className="flex items-center gap-2 text-xs font-medium
                                   text-gray-500 hover:text-rose-400 transition-colors">
                    <LogOut size={14} /> {t('sign_out')}
                </button>
            </div>

            {/* Forgot PIN modal */}
            <PromptModal
                isOpen={showForgotModal}
                onClose={() => setShowForgotModal(false)}
                onSubmit={(val) => {
                    handleForgotPinSubmit(val);
                }}
                title={t('reset_access')}
                description={t('reset_access_desc')}
                placeholder={t('account_password')}
                submitText={loading ? t('checking') : t('unlock')}
                inputType="password"
                error={resetError}
                isLoading={loading}
            />
        </div>
    );
};

export default LockScreen;









