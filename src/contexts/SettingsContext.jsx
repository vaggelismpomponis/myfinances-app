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
        // AND validation passes (e.g., PIN actually exists)
        const pinEnabled = localStorage.getItem('isPinEnabled') === 'true';
        const storedPin = localStorage.getItem('appPin');
        const bioEnabled = localStorage.getItem('isBiometricsEnabled') === 'true';

        // Only lock if Bio is enabled OR (Pin is enabled AND Pin exists)
        return bioEnabled || (pinEnabled && storedPin !== null);
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

    // Track Activity for Grace Period
    useEffect(() => {
        const updateLastActive = () => {
            if (!isLocked) {
                localStorage.setItem('appLastActive', Date.now().toString());
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                updateLastActive();
            } else if (document.visibilityState === 'visible') {
                // Check if we should lock based on timeout
                const lastActive = localStorage.getItem('appLastActive');
                if (lastActive) {
                    const diff = Date.now() - parseInt(lastActive, 10);
                    // Standard timeout: 2 minutes (120000ms)
                    if (diff > 2 * 60 * 1000) {
                        // Only lock if security is actually enabled
                        // We check the refs/state directly if possible, or use the values from closure if strict enough
                        // But closure 'isPinEnabled' might be stale? No, it's in dependency array [isLocked], wait...
                        // If isLocked is false, we are here.

                        // Let's read directly from localStorage to be safe against stale closures
                        // or just rely on state if we add them to dep array of useEffect.
                        const pinEnabled = localStorage.getItem('isPinEnabled') === 'true';
                        const storedPin = localStorage.getItem('appPin');
                        const bioEnabled = localStorage.getItem('isBiometricsEnabled') === 'true';

                        const securityActive = bioEnabled || (pinEnabled && storedPin !== null);

                        if (securityActive) {
                            setIsLocked(true);
                        }
                    }
                }
            }
        };

        // Update when app is hidden or closed
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', updateLastActive);

        // Also update immediately if unlocked (to start the timer only when leaving)
        if (!isLocked) {
            updateLastActive();
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', updateLastActive);
        };
    }, [isLocked]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
