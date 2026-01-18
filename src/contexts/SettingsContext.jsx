import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
    return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }) => {
    // 1. Currency
    const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || '€');

    // 2. Language
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'el');

    // 3. Security (PIN)
    const [isPinEnabled, setIsPinEnabled] = useState(() => localStorage.getItem('isPinEnabled') === 'true');
    const [appPin, setAppPin] = useState(() => localStorage.getItem('appPin') || null);
    const [isLocked, setIsLocked] = useState(() => {
        // Start locked if either PIN or Biometrics is enabled
        const pinEnabled = localStorage.getItem('isPinEnabled') === 'true';
        const bioEnabled = localStorage.getItem('isBiometricsEnabled') === 'true';
        return pinEnabled || bioEnabled;
    });

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    useEffect(() => {
        localStorage.setItem('isPinEnabled', isPinEnabled);
        if (!isPinEnabled) {
            localStorage.removeItem('appPin');
            setAppPin(null);
        }
    }, [isPinEnabled]);

    useEffect(() => {
        if (appPin) {
            localStorage.setItem('appPin', appPin);
        }
    }, [appPin]);

    // 4. Biometrics
    const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(() => localStorage.getItem('isBiometricsEnabled') === 'true');

    useEffect(() => {
        localStorage.setItem('isBiometricsEnabled', isBiometricsEnabled);
    }, [isBiometricsEnabled]);

    // Actions
    const updateCurrency = (newCurrency) => setCurrency(newCurrency);
    const updateLanguage = (newLang) => setLanguage(newLang);

    const setPin = (pin) => {
        setAppPin(pin);
        setIsPinEnabled(true);
    };

    const removePin = () => {
        setIsPinEnabled(false);
        setAppPin(null);
    };

    const unlockApp = () => {
        setIsLocked(false);
    };

    const lockApp = () => {
        if (isPinEnabled || isBiometricsEnabled) {
            setIsLocked(true);
        }
    };

    const value = {
        currency,
        language,
        isPinEnabled,
        isLocked,
        appPin, // Ideally shouldn't expose this, but needed for specific checks 
        updateCurrency,
        updateLanguage,
        setPin,
        removePin,
        unlockApp,
        lockApp,
        isBiometricsEnabled,
        toggleBiometrics: (value) => setIsBiometricsEnabled(value)
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
