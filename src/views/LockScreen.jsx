import React, { useState, useEffect } from 'react';
import { Wallet, Delete, ScanFace, LogOut, X, Check } from 'lucide-react';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
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

    const handleBiometricAuth = async () => {
        setIsScanning(true);
        try {
            const result = await NativeBiometric.isAvailable();
            if (!result.isAvailable) { setIsScanning(false); return; }

            if (Capacitor.isNativePlatform()) {
                // Native: first show the OS biometric prompt, then retrieve the keychain token.
                // The token (PIN) is only accessible after the OS confirms biometric identity.
                await NativeBiometric.verifyIdentity({
                    reason: t('biometric_reason'),
                    title: t('biometric_title'),
                    subtitle: t('biometric_subtitle'),
                    description: '',
                });
                // If verifyIdentity resolves, biometrics succeeded — retrieve the secure token
                const credentials = await NativeBiometric.getCredentials({
                    server: BIOMETRIC_SERVER,
                });
                // Verify the returned token matches our stored PIN as a sanity check
                if (credentials.password === appPin) {
                    unlockApp();
                    setPin('');
                }
            } else {
                // Web fallback: verify identity then trust local PIN
                await NativeBiometric.verifyIdentity({
                    reason: ' ',
                    title: t('biometric_title'),
                    subtitle: t('biometric_subtitle'),
                    description: '',
                });
                unlockApp();
                setPin('');
            }
        } catch { /* cancelled or failed */ }
        finally { setIsScanning(false); }
    };

    useEffect(() => {
        if (isBiometricsEnabled) {
            const t = setTimeout(handleBiometricAuth, 300);
            return () => clearTimeout(t);
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









