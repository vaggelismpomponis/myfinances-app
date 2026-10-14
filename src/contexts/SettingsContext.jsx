import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { translations } from '../utils/translations';
import { isBaseCategory } from '../utils/categoryTranslations';
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

const getStoredDeletedCategories = (uid) => {
    try {
        if (uid) {
            const userKey = localStorage.getItem(`spendwise_deleted_categories_${uid}`);
            if (userKey) return JSON.parse(userKey);
        }
        const legacy = localStorage.getItem('spendwise_deleted_categories');
        return legacy ? JSON.parse(legacy) : [];
    } catch {
        return [];
    }
};

export const SettingsProvider = ({ children }) => {
    const [userId, setUserId] = useState(null);

    // 1. Currency
    const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || '€');

    // 2. Language
    const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');

    // Custom Categories & Deleted Categories
    const [customCategories, setCustomCategories] = useState(() => getStoredCategories(null));
    const [deletedCategories, setDeletedCategories] = useState(() => getStoredDeletedCategories(null));

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

    // Cloud sync helper (debounced) with session refresh retry
    const syncCategoriesToCloud = useCallback((updatedCategories, updatedDeleted) => {
        if (!userId) return;
        if (cloudSyncTimeoutRef.current) {
            clearTimeout(cloudSyncTimeoutRef.current);
        }
        cloudSyncTimeoutRef.current = setTimeout(async () => {
            try {
                const updatePayload = { custom_categories: updatedCategories };
                if (updatedDeleted !== undefined) {
                    updatePayload.deleted_categories = updatedDeleted;
                }
                let { error } = await supabase.auth.updateUser({
                    data: updatePayload
                });

                if (error && (error.status === 401 || error.message?.includes('JWT') || error.message?.includes('token') || error.message?.includes('session'))) {
                    const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
                    if (!refreshErr && refreshData?.session) {
                        const retry = await supabase.auth.updateUser({
                            data: updatePayload
                        });
                        error = retry.error;
                    }
                }

                if (error) {
                    console.error('Failed to sync custom categories to Supabase user account:', error);
                }
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

    // Category reconciliation helper
    const applyUserCategories = useCallback((uid, cloudCats, cloudDeleted) => {
        if (!uid) return;
        const localCached = getStoredCategories(uid);
        const localDeleted = getStoredDeletedCategories(uid);

        let mergedDeleted = localDeleted;
        if (Array.isArray(cloudDeleted)) {
            mergedDeleted = Array.from(new Set([...(localDeleted || []), ...cloudDeleted]));
            setDeletedCategories(mergedDeleted);
            localStorage.setItem(`spendwise_deleted_categories_${uid}`, JSON.stringify(mergedDeleted));
        }

        const isDeleted = (c) => mergedDeleted.some(d => d.toLowerCase() === c.toLowerCase());

        if (cloudCats && (Array.isArray(cloudCats.expense) || Array.isArray(cloudCats.income))) {
            const mergedExpense = Array.from(new Set([
                ...(localCached.expense || []),
                ...(cloudCats.expense || [])
            ])).filter(c => !isBaseCategory(c) && !isDeleted(c));

            const mergedIncome = Array.from(new Set([
                ...(localCached.income || []),
                ...(cloudCats.income || [])
            ])).filter(c => !isBaseCategory(c) && !isDeleted(c));

            const merged = { expense: mergedExpense, income: mergedIncome };
            setCustomCategories(merged);
            localStorage.setItem(`spendwise_categories_${uid}`, JSON.stringify(merged));
            localStorage.setItem('customCategories', JSON.stringify(merged));

            const hasLocalNew = mergedExpense.length > (cloudCats.expense?.length || 0) ||
                                mergedIncome.length > (cloudCats.income?.length || 0);
            if (hasLocalNew) {
                syncCategoriesToCloud(merged, mergedDeleted);
            }
        } else if ((localCached.expense && localCached.expense.length > 0) || (localCached.income && localCached.income.length > 0)) {
            const cleaned = {
                expense: (localCached.expense || []).filter(c => !isBaseCategory(c) && !isDeleted(c)),
                income: (localCached.income || []).filter(c => !isBaseCategory(c) && !isDeleted(c))
            };
            setCustomCategories(cleaned);
            syncCategoriesToCloud(cleaned, mergedDeleted);
        }
    }, [syncCategoriesToCloud]);

    // Remote metadata fetch and merge helper
    const fetchAndSyncCategories = useCallback(async () => {
        if (!userId) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            applyUserCategories(userId, user.user_metadata?.custom_categories, user.user_metadata?.deleted_categories);
        } catch (err) {
            console.warn('Could not fetch user metadata for categories sync:', err);
        }
    }, [userId, applyUserCategories]);

    // Listen to Supabase auth to scope settings by user and hydrate immediately
    useEffect(() => {
        const handleSession = (session) => {
            const uid = session?.user?.id || null;
            setUserId(uid);
            if (uid) {
                applyUserCategories(uid, session?.user?.user_metadata?.custom_categories, session?.user?.user_metadata?.deleted_categories);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session);
        });

        return () => subscription?.unsubscribe();
    }, [applyUserCategories]);

    // When userId changes or is confirmed: load categories from account & setup Realtime Broadcast
    useEffect(() => {
        if (!userId) return;

        // 1. Rehydrate local cached categories for this user
        fetchAndSyncCategories();

        // 2. Realtime Broadcast Channel across devices for the same user
        const channel = supabase.channel(`categories-sync-${userId}`);
        categoriesChannelRef.current = channel;

        channel
            .on('broadcast', { event: 'categories-update' }, ({ payload }) => {
                if (payload && (Array.isArray(payload.expense) || Array.isArray(payload.income))) {
                    const updated = {
                        expense: (payload.expense || []).filter(c => !isBaseCategory(c)),
                        income: (payload.income || []).filter(c => !isBaseCategory(c))
                    };
                    setCustomCategories(updated);
                    localStorage.setItem(`spendwise_categories_${userId}`, JSON.stringify(updated));
                    localStorage.setItem('customCategories', JSON.stringify(updated));
                }
            })
            .subscribe();

        // 3. Foreground resume re-sync
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchAndSyncCategories();
            }
        };

        const handleFocus = () => {
            fetchAndSyncCategories();
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        let appStateListener = null;
        if (Capacitor.isNativePlatform()) {
            try {
                const p = CapApp.addListener('appStateChange', ({ isActive }) => {
                    if (isActive) {
                        fetchAndSyncCategories();
                    }
                });
                Promise.resolve(p).then(handle => { appStateListener = handle; });
            } catch (e) {
                // ignore
            }
        }

        return () => {
            supabase.removeChannel(channel);
            categoriesChannelRef.current = null;
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            if (appStateListener?.remove) {
                appStateListener.remove();
            }
        };
    }, [userId, fetchAndSyncCategories]);

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
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
        if (!trimmed || isBaseCategory(trimmed)) return;

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

        // Un-delete if previously marked as deleted
        setDeletedCategories(prev => {
            const next = prev.filter(c => c.toLowerCase() !== trimmed.toLowerCase());
            if (userId) {
                localStorage.setItem(`spendwise_deleted_categories_${userId}`, JSON.stringify(next));
            }
            return next;
        });
    };

    const editCustomCategory = (type, oldName, newName) => {
        if (!oldName || !newName || typeof newName !== 'string') return { success: false, error: 'invalid_name' };
        const trimmedNew = newName.trim();
        const trimmedOld = oldName.trim();
        if (!trimmedNew) return { success: false, error: 'empty_name' };
        if (trimmedNew === trimmedOld) return { success: true };
        if (isBaseCategory(trimmedNew)) return { success: false, error: 'base_category' };

        const currentList = customCategories[type] || [];
        if (currentList.some(c => c.toLowerCase() === trimmedNew.toLowerCase() && c.toLowerCase() !== trimmedOld.toLowerCase())) {
            return { success: false, error: 'already_exists' };
        }

        setCustomCategories(prev => {
            const list = prev[type] || [];
            if (list.some(c => c.toLowerCase() === trimmedNew.toLowerCase() && c.toLowerCase() !== trimmedOld.toLowerCase())) {
                return prev;
            }

            const updated = {
                ...prev,
                [type]: list.map(c => c === trimmedOld ? trimmedNew : c)
            };
            if (userId) {
                localStorage.setItem(`spendwise_categories_${userId}`, JSON.stringify(updated));
                syncCategoriesToCloud(updated);
                broadcastCategories(updated);
            }
            localStorage.setItem('customCategories', JSON.stringify(updated));
            return updated;
        });

        // Un-delete trimmedNew if previously marked deleted
        setDeletedCategories(prev => {
            const next = prev.filter(c => c.toLowerCase() !== trimmedNew.toLowerCase());
            if (userId) {
                localStorage.setItem(`spendwise_deleted_categories_${userId}`, JSON.stringify(next));
            }
            return next;
        });

        if (userId) {
            (async () => {
                try {
                    await supabase
                        .from('transactions')
                        .update({ category: trimmedNew })
                        .eq('user_id', userId)
                        .eq('type', type)
                        .eq('category', trimmedOld);

                    await supabase
                        .from('budgets')
                        .update({ category: trimmedNew })
                        .eq('user_id', userId)
                        .eq('category', trimmedOld);

                    const txChannel = supabase.channel(`transactions-sync-${userId}`);
                    txChannel.send({
                        type: 'broadcast',
                        event: 'transactions-updated',
                        payload: {}
                    }).catch(() => {});
                } catch (err) {
                    console.warn('Error updating transactions for edited category:', err);
                }
            })();
        }

        return { success: true };
    };

    const deleteCustomCategory = (type, categoryName, reassignTo) => {
        if (!categoryName) return { success: false };
        const trimmed = categoryName.trim();

        const currentList = customCategories[type] || [];
        if (!currentList.includes(trimmed)) return { success: false };

        setCustomCategories(prev => {
            const list = prev[type] || [];
            const updated = {
                ...prev,
                [type]: list.filter(c => c !== trimmed)
            };
            if (userId) {
                localStorage.setItem(`spendwise_categories_${userId}`, JSON.stringify(updated));
            }
            localStorage.setItem('customCategories', JSON.stringify(updated));
            return updated;
        });

        const nextDeleted = Array.from(new Set([...(deletedCategories || []), trimmed.toLowerCase()]));
        setDeletedCategories(nextDeleted);

        if (userId) {
            localStorage.setItem(`spendwise_deleted_categories_${userId}`, JSON.stringify(nextDeleted));
            syncCategoriesToCloud(customCategories, nextDeleted);
            broadcastCategories(customCategories);

            const fallback = reassignTo || (type === 'income' ? 'Άλλα Έσοδα' : 'Άλλο');
            (async () => {
                try {
                    await supabase
                        .from('transactions')
                        .update({ category: fallback })
                        .eq('user_id', userId)
                        .eq('type', type)
                        .eq('category', trimmed);

                    await supabase
                        .from('budgets')
                        .delete()
                        .eq('user_id', userId)
                        .eq('category', trimmed);

                    const txChannel = supabase.channel(`transactions-sync-${userId}`);
                    txChannel.send({
                        type: 'broadcast',
                        event: 'transactions-updated',
                        payload: {}
                    }).catch(() => {});
                } catch (err) {
                    console.warn('Error updating transactions for deleted category:', err);
                }
            })();
        }

        return { success: true };
    };

    const removeCustomCategory = (type, categoryName) => {
        return deleteCustomCategory(type, categoryName);
    };

    // Auto-discover and reconcile custom categories from transactions across devices
    const syncCategoriesFromTransactions = useCallback((txs) => {
        if (!Array.isArray(txs) || txs.length === 0) return;

        setCustomCategories(prev => {
            let changed = false;
            const newExp = [...(prev.expense || [])];
            const newInc = [...(prev.income || [])];
            const deletedSet = new Set((deletedCategories || []).map(d => d.toLowerCase()));

            txs.forEach(t => {
                const cat = t.category?.trim();
                if (!cat || isBaseCategory(cat) || deletedSet.has(cat.toLowerCase())) return;
                if (t.type === 'income') {
                    if (!newInc.includes(cat)) {
                        newInc.push(cat);
                        changed = true;
                    }
                } else {
                    if (!newExp.includes(cat)) {
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
    }, [userId, deletedCategories, syncCategoriesToCloud, broadcastCategories]);

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
        editCustomCategory,
        deleteCustomCategory,
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
