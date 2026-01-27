import React, { useState, useEffect } from 'react';
import { Wallet, Delete, Fingerprint, ScanFace, LogOut, KeyRound, X, Check } from 'lucide-react';
import { NativeBiometric } from '@capgo/capacitor-native-biometric';
import { useSettings } from '../contexts/SettingsContext';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

const LockScreen = ({ onSignOut, user }) => {
    const { appPin, unlockApp, isBiometricsEnabled, removePin, toggleBiometrics } = useSettings();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    // Forgot PIN State
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetError, setResetError] = useState('');

    const handleBiometricAuth = async () => {
        setIsScanning(true);
        try {
            const result = await NativeBiometric.isAvailable();

            if (!result.isAvailable) {
                alert("Biometrics not available");
                setIsScanning(false);
                return;
            }

            await NativeBiometric.verifyIdentity({
                reason: "Identify yourself to unlock the app",
                title: "Login",
                subtitle: "Use Face ID or Fingerprint",
                description: "Confirm your identity",
            });

            // If successful (no error thrown)
            unlockApp();
            setPin('');
        } catch (error) {
            console.error("Biometric auth failed or cancelled", error);
            // Don't alert on simple cancellation
        } finally {
            setIsScanning(false);
        }
    };

    useEffect(() => {
        if (isBiometricsEnabled) {
            // Trigger immediately but safely
            const timer = setTimeout(() => {
                handleBiometricAuth();
            }, 300); // 300ms delay for smooth transition
            return () => clearTimeout(timer);
        }
    }, [isBiometricsEnabled]);

    const handleNumberClick = (num) => {
        if (pin.length < 4) {
            setPin(prev => prev + num);
            setError(false);
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    useEffect(() => {
        if (pin.length === 4) {
            if (pin === appPin) {
                // Success
                setTimeout(() => {
                    unlockApp();
                    setPin('');
                }, 200);
            } else {
                // Fail
                setError(true);
                setTimeout(() => setPin(''), 500);
            }
        }
    }, [pin, appPin, unlockApp]);

    const handleForgotPinSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResetError('');

        try {
            // Validating with account password
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);

            // Success: Reset Security Settings locally
            removePin(); // This clears PIN state
            toggleBiometrics(false); // Disable biometrics

            // Unlock
            unlockApp();
        } catch (error) {
            console.error("Reset PIN error:", error);
            setResetError('Λάθος κωδικός πρόσβασης.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#F9F9F9] dark:bg-gray-900 flex flex-col items-center justify-center animate-fade-in transition-colors duration-300">

            {/* Header / Branding - Matching LoginView */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200 dark:shadow-none rotate-3">
                    <Wallet size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Καλωσήρθατε</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Επιβεβαίωση στοιχείων για είσοδο.</p>
            </div>

            {/* PIN Dots */}
            <div className="flex gap-4 mb-10">
                {[0, 1, 2, 3].map(i => (
                    <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length > i
                            ? 'bg-indigo-600 scale-110'
                            : error
                                ? 'bg-red-500 animate-shake'
                                : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                    />
                ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-x-8 gap-y-6 mb-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num.toString())}
                        className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white"
                    >
                        {num}
                    </button>
                ))}

                <div className="flex items-center justify-center">
                    {/* Empty or Biometric Icon if enabled */}
                    {isBiometricsEnabled && (
                        <button
                            onClick={handleBiometricAuth}
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isScanning
                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 animate-pulse'
                                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <ScanFace size={32} />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => handleNumberClick('0')}
                    className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white"
                >
                    0
                </button>

                <button
                    onClick={handleDelete}
                    className="w-16 h-16 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <Delete size={28} />
                </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-4 mt-4">
                <button
                    onClick={() => setShowForgotModal(true)}
                    className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline"
                >
                    Ξέχασα το PIN μου
                </button>

                <button
                    onClick={onSignOut}
                    className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 text-sm font-medium"
                >
                    <LogOut size={16} />
                    <span>Αποσύνδεση</span>
                </button>
            </div>

            {/* Forgot PIN Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForgotModal(false)} />
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Επαναφορά Πρόσβασης</h3>
                            <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Για την ασφάλειά σας, εισάγετε τον κωδικό πρόσβασης του λογαριασμού σας για να ξεκλειδώσετε την εφαρμογή και να επαναφέρετε τις ρυθμίσεις ασφαλείας.
                        </p>

                        <form onSubmit={handleForgotPinSubmit} className="space-y-4">
                            {resetError && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs p-3 rounded-xl">
                                    {resetError}
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Κωδικός Λογαριασμού</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
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
