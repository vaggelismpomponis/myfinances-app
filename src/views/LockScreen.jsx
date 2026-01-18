import React, { useState, useEffect } from 'react';
import { Wallet, Delete, Fingerprint, ScanFace } from 'lucide-react'; // Changed ScanFace for better visual
import { useSettings } from '../contexts/SettingsContext';

const LockScreen = () => {
    const { appPin, unlockApp, isBiometricsEnabled } = useSettings();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const handleBiometricAuth = async () => {
        setIsScanning(true);
        try {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            await navigator.credentials.get({
                publicKey: {
                    challenge,
                    timeout: 60000,
                    userVerification: "required"
                }
            });

            // If successful
            unlockApp();
            setPin('');
        } catch (error) {
            console.error("Biometric auth failed or cancelled", error);
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

    return (
        <div className="fixed inset-0 z-[100] bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center animate-fade-in transition-colors duration-300">

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

            {/* Status Text */}
            {isScanning && (
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 animate-pulse">
                    Αναγνώριση προσώπου...
                </p>
            )}
        </div>
    );
};

export default LockScreen;
