import React, { useState, useEffect } from 'react';
import { Lock, Delete } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const LockScreen = () => {
    const { appPin, unlockApp } = useSettings();
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

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
        <div className="fixed inset-0 z-[100] bg-gray-900 text-white flex flex-col items-center justify-center animate-fade-in">
            <div className="mb-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/50">
                    <Lock size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold">MyFinances Locked</h2>
                <p className="text-gray-400 text-sm mt-2">Enter PIN to unlock</p>
            </div>

            {/* PIN Dots */}
            <div className="flex gap-4 mb-12">
                {[0, 1, 2, 3].map(i => (
                    <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length > i
                                ? 'bg-indigo-500 scale-110'
                                : error
                                    ? 'bg-red-500 animate-shake'
                                    : 'bg-gray-700'
                            }`}
                    />
                ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-[280px]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num.toString())}
                        className="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-indigo-600 transition-colors flex items-center justify-center text-2xl font-bold mx-auto"
                    >
                        {num}
                    </button>
                ))}

                {/* Empty placeholder for alignment */}
                <div />

                <button
                    onClick={() => handleNumberClick('0')}
                    className="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 active:bg-indigo-600 transition-colors flex items-center justify-center text-2xl font-bold mx-auto"
                >
                    0
                </button>

                <button
                    onClick={handleDelete}
                    className="w-16 h-16 rounded-full bg-transparent hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex items-center justify-center mx-auto"
                >
                    <Delete size={24} />
                </button>
            </div>
        </div>
    );
};

export default LockScreen;
