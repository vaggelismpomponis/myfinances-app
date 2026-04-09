import React, { useState, useEffect } from 'react';
import { Wallet, Delete, ScanFace, LogOut, X, Check } from 'lucide-react';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { useSettings } from '../contexts/SettingsContext';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const LockScreen = ({ onSignOut, user }) => {
    const { appPin, unlockApp, isBiometricsEnabled, removePin, toggleBiometrics } = useSettings();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetError, setResetError] = useState('');

    const handleBiometricAuth = async () => {
        setIsScanning(true);
        try {
            const result = await NativeBiometric.isAvailable();
            if (!result.isAvailable) { setIsScanning(false); return; }
            await NativeBiometric.verifyIdentity({
                reason: 'Identify yourself to unlock the app',
                title: 'Login',
                subtitle: 'Use Face ID or Fingerprint',
                description: 'Confirm your identity',
            });
            unlockApp();
            setPin('');
        } catch { /* cancelled */ }
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

    const handleForgotPinSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResetError('');
        try {
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);
            removePin();
            toggleBiometrics(false);
            unlockApp();
        } catch {
            setResetError('Λάθος κωδικός πρόσβασης.');
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
                    <div className="relative w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-700
                                    rounded-2xl flex items-center justify-center
                                    shadow-glow-violet border border-violet-400/30">
                        <div className="absolute top-1 left-1.5 w-8 h-3 bg-white/20 rounded-full blur-sm rotate-[-25deg]" />
                        <Wallet size={28} className="text-white relative z-10" />
                    </div>
                </div>
                <h1 className="text-2xl font-black text-white mb-1">Καλωσήρθατε</h1>
                <p className="text-sm text-gray-400 font-medium">Εισάγετε το PIN σας για είσοδο</p>
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
                    Ξέχασα το PIN μου
                </button>
                <button onClick={onSignOut}
                        className="flex items-center gap-2 text-xs font-medium
                                   text-gray-500 hover:text-rose-400 transition-colors">
                    <LogOut size={14} /> Αποσύνδεση
                </button>
            </div>

            {/* Forgot PIN modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-[110] flex items-end justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                         onClick={() => setShowForgotModal(false)} />
                    <div className="relative z-10 w-full max-w-md
                                    bg-surface-dark2 dark:bg-surface-dark2
                                    rounded-t-[2rem] p-7
                                    border-t border-x border-white/10
                                    shadow-2xl animate-slide-up">
                        <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-5" />
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Επαναφορά Πρόσβασης</h3>
                            <button onClick={() => setShowForgotModal(false)}
                                    className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 mb-5">
                            Εισάγετε τον κωδικό του λογαριασμού σας για να ξεκλειδώσετε και να επαναφέρετε τις ρυθμίσεις ασφαλείας.
                        </p>
                        <form onSubmit={handleForgotPinSubmit} className="space-y-4">
                            {resetError && (
                                <div className="bg-rose-900/30 text-rose-400 text-xs p-3 rounded-xl border border-rose-800/40">
                                    {resetError}
                                </div>
                            )}
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Κωδικός λογαριασμού"
                                required
                                className="input-glow w-full px-4 py-3 rounded-xl text-sm
                                           bg-white/8 border border-white/10
                                           text-white placeholder-gray-600
                                           transition-all duration-200"
                            />
                            <button type="submit" disabled={loading}
                                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white
                                               bg-gradient-to-r from-violet-600 to-violet-700
                                               shadow-glow-sm hover:from-violet-500
                                               active:scale-[0.98] disabled:opacity-60
                                               transition-all duration-200">
                                {loading ? 'Έλεγχος...' : 'Ξεκλείδωμα'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LockScreen;
