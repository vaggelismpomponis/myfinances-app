import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { translations } from '../utils/translations';
import { supabase } from '../supabase';

const SettingsContext = createContext();

export const useSettings = () => {
    return useContext(SettingsContext);
};

const BASE_EXPENSE_CATEGORIES = ['Σούπερ Μάρκετ', 'Φαγητό', 'Καφές', 'Σπίτι', 'Λογαριασμοί', 'Διασκέδαση', 'Βενζίνη', 'Υγεία', 'Άλλο'];
const BASE_INCOME_CATEGORIES = ['Μισθός', 'Δώρο', 'Επενδύσεις', 'Άλλα Έσοδα'];

const getStoredCategories = (uid) => {
    try {
        if (uid) {
            const userKey = localStorage.getItem(`spendwise_categories_${uid}`);
            if (userKey) return JSON.parse(userKey);
        }
        const legacy = localStorage.getItem('customCategories');
        return legacy ? JSON.parse(legacy) : { expense: [], income: [] };
    } catch {
        return { expense: [], income: [] };
    }
};

export const SettingsProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);

    // 1. Currency
    const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || '€');

    // 2. Language
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');

    // Custom Categories
    const [customCategories, setCustomCategories] = useState(() => getStoredCategories(null));

    const categoriesChannelRef = useRef(null);
    const cloudSyncTimeoutRef = useRef(null);

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

    // 4. Biometrics
    const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(() => localStorage.getItem('isBiometricsEnabled') === 'true');

    // 5a. Privacy Screen
    const [isPrivacyScreenEnabled, setIsPrivacyScreenEnabled] = useState(() => localStorage.getItem('isPrivacyScreenEnabled') === 'true');

    // 5b. Privacy Mode (Amount Masking)
    const [privacyMode, setPrivacyMode] = useState(() => localStorage.getItem('privacyMode') === 'true');

    // 5. Theme (Dark Mode)
    const [theme, setTheme] = useState(() => {
        if (localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            return 'dark';
        }
        return 'light';
    });

    // Cloud sync helper (debounced)
    const syncCategoriesToCloud = useCallback((updatedCategories) => {
        if (!userId) return;
        if (cloudSyncTimeoutRef.current) {
            clearTimeout(cloudSyncTimeoutRef.current);
        }
        cloudSyncTimeoutRef.current = setTimeout(async () => {
            try {
                await supabase.auth.updateUser({
                    data: { custom_categories: updatedCategories }
                });
            } catch (err) {
                console.warn('Failed to sync custom categories to Supabase user account:', err);
            }
        }, 500);
    }, [userId]);

    // Broadcast helper
    const broadcastCategories = useCallback((updatedCategories) => {
        if (categoriesChannelRef.current) {
            categoriesChannelRef.current.send({
                type: 'broadcast',
                event: 'categories-update',
                payload: updatedCategories
            }).catch(() => {});
        }
    }, []);

    // Listen to Supabase auth to scope settings by user
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserId(session?.user?.id || null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null);
        });

        return () => subscription?.unsubscribe();
    }, []);

    // When userId changes or is confirmed: load categories from account & setup Realtime Broadcast
    useEffect(() => {
        if (!userId) return;

        // 1. Rehydrate local cached categories for this user
        const localCached = getStoredCategories(userId);
        setCustomCategories(localCached);

        // 2. Fetch remote user metadata to sync categories across devices
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;
            const cloudCats = user.user_metadata?.custom_categories;
            if (cloudCats && (Array.isArray(cloudCats.expense) || Array.isArray(cloudCats.income))) {
                const mergedExpense = Array.from(new Set([...(localCached.expense || []), ...(cloudCats.expense || [])]));
                const mergedIncome = Array.from(new Set([...(localCached.income || []), ...(cloudCats.income || [])]));
                const merged = { expense: mergedExpense, income: mergedIncome };

                setCustomCategories(merged);
                localStorage.setItem(`spendwise_categories_${userId}`, JSON.stringify(merged));
                localStorage.setItem('customCategories', JSON.stringify(merged));

                // If local had categories that weren't in cloud yet, push merged back to cloud
                const hasLocalNew = mergedExpense.length > (cloudCats.expense?.length || 0) ||
                                    mergedIncome.length > (cloudCats.income?.length || 0);
                if (hasLocalNew) {
                    syncCategoriesToCloud(merged);
                }
            } else if ((localCached.expense && localCached.expense.length > 0) || (localCached.income && localCached.income.length > 0)) {
                // Cloud had nothing yet, push local categories to user account
                syncCategoriesToCloud(localCached);
            }
        }).catch(err => {
            console.warn('Could not fetch user metadata for categories sync:', err);
        });

        // 3. Realtime Broadcast Channel across devices for the same user
        const channel = supabase.channel(`categories-sync-${userId}`);
        categoriesChannelRef.current = channel;

        channel
            .on('broadcast', { event: 'categories-update' }, ({ payload }) => {
                if (payload && (Array.isArray(payload.expense) || Array.isArray(payload.income))) {
                    setCustomCategories(prev => {
                        const updated = {
                            expense: Array.from(new Set([...(prev.expense || []), ...(payload.expense || [])])),
                            income: Array.from(new Set([...(prev.income || []), ...(payload.income || [])]))
                        };
                        localStorage.setItem(`spendwise_categories_${userId}`, JSON.stringify(updated));
                        localStorage.setItem('customCategories', JSON.stringify(updated));
                        return updated;
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            categoriesChannelRef.current = null;
        };
    }, [userId, syncCategoriesToCloud]);

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
    }, [language]);

    useEffect(() => {
        if (userId) {
            localStorage.setItem(`spendwise_categories_${userId}`, JSON.stringify(customCategories));
        }
        localStorage.setItem('customCategories', JSON.stringify(customCategories));
    }, [customCategories, userId]);

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

    useEffect(() => {
        localStorage.setItem('isBiometricsEnabled', isBiometricsEnabled);
    }, [isBiometricsEnabled]);

    useEffect(() => {
        localStorage.setItem('isPrivacyScreenEnabled', isPrivacyScreenEnabled);
    }, [isPrivacyScreenEnabled]);

    useEffect(() => {
        localStorage.setItem('privacyMode', privacyMode);
    }, [privacyMode]);

    useEffect(() => {
        const themeColor = theme === 'dark' ? '#121212' : '#ffffff';
        const metaTags = document.querySelectorAll('meta[name="theme-color"]');
        metaTags.forEach(tag => tag.setAttribute('content', themeColor));

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    // Actions
    const updateCurrency = (newCurrency) => setCurrency(newCurrency);
    const updateLanguage = (newLang) => setLanguage(newLang);
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const togglePrivacyMode = () => setPrivacyMode(prev => !prev);

    const addCustomCategory = (type, categoryName) => {
        if (!categoryName || typeof categoryName !== 'string') return;
        const trimmed = categoryName.trim();
        if (!trimmed) return;

        setCustomCategories(prev => {
            const currentList = prev[type] || [];
            if (currentList.includes(trimmed)) return prev;

            const updated = {
                ...prev,
                [type]: [...currentList, trimmed]
            };
            if (userId) {
                localStorage.setItem(`spendwise_categories_${userId}`, JSON.stringify(updated));
                syncCategoriesToCloud(updated);
                broadcastCategories(updated);
            }
            localStorage.setItem('customCategories', JSON.stringify(updated));
            return updated;
        });
    };

    const removeCustomCategory = (type, categoryName) => {
        setCustomCategories(prev => {
            const currentList = prev[type] || [];
            if (!currentList.includes(categoryName)) return prev;

            const updated = {
                ...prev,
                [type]: currentList.filter(c => c !== categoryName)
            };
            if (userId) {
                localStorage.setItem(`spendwise_categories_${userId}`, JSON.stringify(updated));
                syncCategoriesToCloud(updated);
                broadcastCategories(updated);
            }
            localStorage.setItem('customCategories', JSON.stringify(updated));
            return updated;
        });
    };

    // Auto-discover and reconcile custom categories from transactions across devices
    const syncCategoriesFromTransactions = useCallback((txs) => {
        if (!Array.isArray(txs) || txs.length === 0) return;

        setCustomCategories(prev => {
            let changed = false;
            const newExp = [...(prev.expense || [])];
            const newInc = [...(prev.income || [])];

            txs.forEach(t => {
                const cat = t.category?.trim();
                if (!cat) return;
                if (t.type === 'income') {
                    if (!BASE_INCOME_CATEGORIES.includes(cat) && !newInc.includes(cat)) {
                        newInc.push(cat);
                        changed = true;
                    }
                } else {
                    if (!BASE_EXPENSE_CATEGORIES.includes(cat) && !newExp.includes(cat)) {
                        newExp.push(cat);
                        changed = true;
                    }
                }
            });

            if (!changed) return prev;

            const updated = { expense: newExp, income: newInc };
            if (userId) {
                localStorage.setItem(`spendwise_categories_${userId}`, JSON.stringify(updated));
                syncCategoriesToCloud(updated);
                broadcastCategories(updated);
            }
            localStorage.setItem('customCategories', JSON.stringify(updated));
            return updated;
        });
    }, [userId, syncCategoriesToCloud, broadcastCategories]);

    const t = (key, params = {}) => {
        let text = translations[language]?.[key] || key;
        if (params) {
            Object.keys(params).forEach(param => {
                text = text.replace(`{${param}}`, params[param]);
            });
        }
        return text;
    };

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
        t,
        theme,
        toggleTheme,
        isPinEnabled,
        isLocked,
        appPin,
        updateCurrency,
        updateLanguage,
        setPin,
        removePin,
        unlockApp,
        lockApp,
        isBiometricsEnabled,
        toggleBiometrics: (val) => setIsBiometricsEnabled(val),
        isPrivacyScreenEnabled,
        togglePrivacyScreen: (val) => setIsPrivacyScreenEnabled(val),
        customCategories,
        addCustomCategory,
        removeCustomCategory,
        syncCategoriesFromTransactions,
        privacyMode,
        togglePrivacyMode
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
                const lastActive = localStorage.getItem('appLastActive');
                if (lastActive) {
                    const diff = Date.now() - parseInt(lastActive, 10);
                    // Standard timeout: 2 minutes (120000ms)
                    if (diff > 2 * 60 * 1000) {
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
