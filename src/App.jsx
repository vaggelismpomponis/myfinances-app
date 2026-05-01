import React, { useState, useEffect, useMemo, useRef } from 'react'; // App Root
import {
    Plus,
    User,
    Eye,
    EyeOff
} from 'lucide-react';
import { supabase } from './supabase';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PrivacyScreen } from '@capacitor/privacy-screen';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import logger from './utils/logger';

// Context
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { trackSession } from './utils/session';
import { setupNotificationListener } from './utils/notificationListener';

// Components
import LoadingView from './views/LoadingView';
import LoginView from './views/LoginView';
import ProfileView from './views/ProfileView';
import RecurringView from './views/RecurringView';
import GeneralSettingsView from './views/GeneralSettingsView';
import SecuritySettingsView from './views/SecuritySettingsView';
import LockScreen from './views/LockScreen';
import HomeView from './views/HomeView';
import StatsView from './views/StatsView';
import HistoryView from './views/HistoryView';
import GoalsView from './views/GoalsView';
import BudgetsView from './views/BudgetsView';
import BackupView from './views/BackupView';
import FeedbackView from './views/FeedbackView';
import AdminView from './views/AdminView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
import AddModal from './components/AddModal';
import WhatsNewModal from './components/WhatsNewModal';
import Navbar from './components/Navbar';
import FinancialAdvisorView from './views/FinancialAdvisorView';
import GuideView from './views/GuideView';
import UserProfileView from './views/UserProfileView';
import BroadcastModal from './components/BroadcastModal';


import ConfirmationModal from './components/ConfirmationModal';
import ErrorBoundary from './components/ErrorBoundary';

function MainContent() {
    const { isLocked, theme, toggleTheme, t: translate, isPrivacyScreenEnabled, privacyMode, togglePrivacyMode } = useSettings();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('home');
    const [previousTab, setPreviousTab] = useState('home');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [goals, setGoals] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imgError, setImgError] = useState(false);

    // Whats New Modal
    const [latestUpdate, setLatestUpdate] = useState(null);
    const [showWhatsNew, setShowWhatsNew] = useState(false);

    // Broadcasts State
    const [currentBroadcast, setCurrentBroadcast] = useState(null);
    const [showBroadcast, setShowBroadcast] = useState(false);

    // Browser History Navigation Logic
    const isPopping = useRef(false);
    const gsiInitialized = useRef(false);

    useEffect(() => {
        window.history.replaceState({ tab: 'home' }, '', '');

        const handlePopState = (event) => {
            if (event.state && event.state.tab) {
                isPopping.current = true;
                setActiveTab(event.state.tab);
            } else {
                isPopping.current = true;
                setActiveTab('home');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        if (isPopping.current) {
            isPopping.current = false;
            return;
        }
        window.history.pushState({ tab: activeTab }, '', '');
    }, [activeTab]);

    // Reset image error when user photo changes
    useEffect(() => {
        setImgError(false);
    }, [user?.user_metadata?.avatar_url]);

    // Notification Listener
    useEffect(() => {
        const cleanup = setupNotificationListener((transactions) => {
            if (transactions && transactions.length > 0) {
                const tx = transactions[transactions.length - 1];
                let text = tx.text || "";
                // console.log("[DEBUG] Parsing text:", text);
                const simpleMatch = text.match(/(\d+[.,]\d+)/);
                let amount = 0;
                if (simpleMatch) {
                    let amountStr = simpleMatch[1].replace(',', '.');
                    amount = parseFloat(amountStr);
                } else {
                    logger.debug('No amount match found in notification text', 'NotificationListener');
                }
                setEditingTransaction({
                    amount: amount || 0,
                    note: (tx.title || "") + " - " + text,
                    type: 'expense',
                    category: 'shopping',
                    date: new Date().toISOString()
                });
                // console.log("[DEBUG] Setting editing transaction with amount:", amount);
                setShowAddModal(true);
                showToast("Εντοπίστηκε νέα συναλλαγή!", "info");
            }
        });
        return cleanup;
    }, []);

    // Privacy Screen — enable/disable based on setting
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;
        const apply = async () => {
            try {
                if (isPrivacyScreenEnabled) {
                    await PrivacyScreen.enable();
                } else {
                    await PrivacyScreen.disable();
                }
            } catch (e) {
                logger.warn('PrivacyScreen toggle failed', 'App');
            }
        };
        apply();
    }, [isPrivacyScreenEnabled]);

    // 1. Initialize Auth via Supabase
    useEffect(() => {
        const checkWhatsNew = async () => {
            if (user && !loading && !isLocked) {
                try {
                    const { data, error } = await supabase
                        .from('app_updates')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (error) throw error;
                    if (data && data.length > 0) {
                        const update = data[0];
                        const hasSeen = localStorage.getItem(`whatsnew_seen_${update.version}_${user.id}`);
                        if (!hasSeen) {
                            setLatestUpdate(update);
                            setShowWhatsNew(true);
                        }
                    }
                } catch (e) {
                    logger.error('Error fetching latest update', e, 'App');
                }
            }
        };
        checkWhatsNew();
    }, [user, loading, isLocked]);

    useEffect(() => {
        const checkBroadcasts = async () => {
            if (user && !loading && !isLocked) {
                try {
                    const { data, error } = await supabase
                        .from('broadcasts')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (error) {
                        console.error('[Broadcast] Fetch error:', error);
                        return;
                    }
                    
                    if (data && data.length > 0) {
                        const broadcast = data[0];
                        const lastSeenId = localStorage.getItem(`broadcast_seen_${user.id}`);
                        
                        console.log('[Broadcast] Latest:', broadcast.id, 'Last Seen:', lastSeenId);
                        
                        if (lastSeenId !== broadcast.id.toString()) {
                            setCurrentBroadcast(broadcast);
                            setShowBroadcast(true);
                        }
                    }
                } catch (e) {
                    console.error('[Broadcast] Exception:', e);
                }
            }
        };
        checkBroadcasts();
    }, [user, loading, isLocked]);

    const lastTrackedUser = useRef(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setLoading(false);
            if (currentUser && lastTrackedUser.current !== currentUser.id) {
                lastTrackedUser.current = currentUser.id;
                trackSession(currentUser);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setLoading(false);
            
            if (currentUser && lastTrackedUser.current !== currentUser.id) {
                lastTrackedUser.current = currentUser.id;
                trackSession(currentUser);
            } else if (event === 'SIGNED_OUT') {
                lastTrackedUser.current = null;
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const GOOGLE_CLIENT_ID = '345124628478-9dfooug409in2o115t5fdcolhfl9ojnk.apps.googleusercontent.com';

    const [gsiNonce, setGsiNonce] = useState(null);

    useEffect(() => {
        const raw = Array.from(window.crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw)).then(hashBuffer => {
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashed = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            setGsiNonce({ raw, hashed });
        }).catch(err => {
            logger.error('Error generating GSI nonce', err, 'App');
            // Fallback to raw if subtle crypto fails
            setGsiNonce({ raw, hashed: raw });
        });
    }, []);

    // 1.5. Google Sign-In Init (Web)
    useEffect(() => {
        if (!user && !loading && !Capacitor.isNativePlatform() && gsiNonce) {
            // Reset the guard so a fresh mount always re-initializes the button
            gsiInitialized.current = false;
            let initialized = false;

            const initGSI = () => {
                if (!window.google) return;
                if (initialized) return;
                initialized = true;
                gsiInitialized.current = true;

                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: async (response) => {
                        try {
                            const { error } = await supabase.auth.signInWithIdToken({
                                provider: 'google',
                                token: response.credential,
                                nonce: gsiNonce.raw
                            });
                            if (error) throw error;
                        } catch (err) {
                            logger.error('GSI login failed', err, 'App');
                            showToast("Η σύνδεση απέτυχε.", "error");
                        }
                    },
                    itp_support: true,
                    ux_mode: 'popup',
                    context: 'signin',
                    nonce: gsiNonce.hashed
                });

                // Render the native Google button — shows "SpendWise" in the popup
                // renderButton manages its own click/FedCM flow independently from prompt()
                const btnContainer = document.getElementById('google-signin-button');
                if (btnContainer) {
                    btnContainer.innerHTML = ''; // clear any stale render
                    window.google.accounts.id.renderButton(btnContainer, {
                        type: 'standard',
                        shape: 'rectangular',
                        theme: 'outline',
                        text: 'continue_with',
                        size: 'large',
                        logo_alignment: 'left',
                        width: btnContainer.offsetWidth || 320
                    });
                }

                // One Tap auto-prompt overlay (separate from button, no conflict)
                window.google.accounts.id.prompt();
            };

            if (window.google) {
                initGSI();
            } else {
                const interval = setInterval(() => {
                    if (window.google) {
                        clearInterval(interval);
                        initGSI();
                    }
                }, 100);
                setTimeout(() => clearInterval(interval), 5000);
            }
        }
    }, [user, loading, gsiNonce]);

    // OAuth popup fallback — bypasses FedCM entirely
    const handleGoogleOAuthPopup = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    skipBrowserRedirect: true,
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
            if (!data?.url) throw new Error('No OAuth URL returned');

            const popup = window.open(
                data.url,
                'google-oauth',
                'width=500,height=620,left=' + (window.screen.width / 2 - 250) +
                ',top=' + (window.screen.height / 2 - 310) +
                ',scrollbars=yes,resizable=yes'
            );

            if (!popup) {
                // Popup was blocked — redirect instead
                window.location.href = data.url;
            }
        } catch (err) {
            logger.error('OAuth popup error', err, 'App');
            showToast('Η σύνδεση με Google απέτυχε.', 'error');
        }
    };

    // Expose OAuth popup handler for LoginView (avoids prop drilling through native button)
    useEffect(() => {
        window.__googleOAuthPopup = handleGoogleOAuthPopup;
        return () => { delete window.__googleOAuthPopup; };
    }, [gsiNonce]);

    const handleGoogleLogin = async () => {
        try {
            if (Capacitor.isNativePlatform()) {
                await GoogleAuth.initialize({
                    clientId: GOOGLE_CLIENT_ID,
                    scopes: ['profile', 'email'],
                    grantOfflineAccess: true,
                });
                const googleUser = await GoogleAuth.signIn();
                const idToken = googleUser?.authentication?.idToken;
                if (!idToken) throw new Error('Δεν ελήφθη Google ID token.');

                const { error } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: idToken,
                });
                if (error) throw error;
            } else {
                // Web: Re-initialize and show Google One Tap as a popup
                return new Promise((resolve, reject) => {
                    if (!window.google || !gsiNonce) {
                        reject(new Error('Google Sign-In not ready. Please try again.'));
                        return;
                    }

                    // Re-initialize with the same hashed nonce to get a fresh prompt
                    window.google.accounts.id.initialize({
                        client_id: GOOGLE_CLIENT_ID,
                        callback: async (response) => {
                            try {
                                const { error } = await supabase.auth.signInWithIdToken({
                                    provider: 'google',
                                    token: response.credential,
                                    nonce: gsiNonce.raw
                                });
                                if (error) { reject(error); return; }
                                resolve();
                            } catch (err) {
                                reject(err);
                            }
                        },
                        itp_support: true,
                        ux_mode: 'popup',
                        context: 'signin',
                        nonce: gsiNonce.hashed
                    });

                    window.google.accounts.id.prompt((notification) => {
                        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                            reject(new Error('Το Google Sign-In δεν εμφανίστηκε. Δοκιμάστε ξανά.'));
                        }
                    });
                });
            }
        } catch (error) {
            logger.error('Google auth failed', error, 'App');
            showToast("Η σύνδεση με Google απέτυχε.", 'error');
            throw error;
        }
    };

    const handleEmailLogin = async (email, password) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } catch (error) {
            const isCredentialError = error.message?.includes('Invalid login credentials') || error.message?.includes('invalid_credentials');
            const isRateLimit = error.message?.includes('too many requests') || error.status === 429;

            if (isCredentialError || isRateLimit) {
                logger.warn(`Email login attempt failed: ${error.message}`, 'App');
            } else {
                logger.error('Email login failed', error, 'App');
            }

            let msg = translate('error_prefix') + (error.message || translate('something_went_wrong'));
            if (isCredentialError) {
                msg = translate('wrong_password');
            } else if (isRateLimit) {
                msg = translate('rate_limit_error');
            }
            showToast(msg, 'error');
            throw error;
        }
    };

    const handleRegister = async (email, password) => {
        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            showToast("Ο λογαριασμός δημιουργήθηκε!", 'success');
        } catch (error) {
            const isAlreadyRegistered = error.message?.includes('already registered') || error.message?.includes('User already registered');
            
            if (isAlreadyRegistered) {
                logger.warn(`Registration attempt for existing user: ${error.message}`, 'App');
            } else {
                logger.error('Registration failed', error, 'App');
            }

            let msg = translate('error_prefix') + (error.message || translate('something_went_wrong'));
            if (isAlreadyRegistered) {
                msg = translate('email_in_use');
            } else if (error.message?.includes('Password should be at least')) {
                msg = translate('password_length_error');
            }
            showToast(msg, 'error');
            throw error;
        }
    };

    // 2. Fetch Transactions from Supabase
    useEffect(() => {
        if (!user) {
            setTransactions([]);
            return;
        }

        const fetchTransactions = async () => {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });
            if (error) {
                logger.error('Failed to fetch transactions', error, 'App');
            } else {
                setTransactions(data || []);
            }
        };

        fetchTransactions();

        // Realtime subscription
        const channel = supabase
            .channel('transactions-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'transactions',
                filter: `user_id=eq.${user.id}`
            }, () => {
                fetchTransactions();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [user]);

    // 2.5 Fetch Budgets from Supabase
    useEffect(() => {
        if (!user) {
            setBudgets([]);
            return;
        }

        const fetchBudgets = async () => {
            const { data, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('user_id', user.id);
            if (error) {
                logger.error('Failed to fetch budgets', error, 'App');
            } else {
                setBudgets(data || []);
            }
        };

        fetchBudgets();

        const requestPermissions = async () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    let permStatus = await LocalNotifications.checkPermissions();
                    if (permStatus.display === 'prompt') {
                        permStatus = await LocalNotifications.requestPermissions();
                    }
                } catch (e) {
                    console.error("Local Notifications not available", e);
                }
            }
        };
        requestPermissions();

        const channel = supabase
            .channel('budgets-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'budgets',
                filter: `user_id=eq.${user.id}`
            }, () => {
                fetchBudgets();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [user]);

    // 2.6 Fetch Goals from Supabase
    useEffect(() => {
        if (!user) {
            setGoals([]);
            return;
        }

        const fetchGoals = async () => {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id);
            if (error) {
                logger.error('Failed to fetch goals', error, 'App');
            } else {
                setGoals(data || []);
            }
        };

        fetchGoals();

        const channel = supabase
            .channel('goals-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'goals',
                filter: `user_id=eq.${user.id}`
            }, () => {
                fetchGoals();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [user]);

    // 3. Process Recurring Transactions
    useEffect(() => {
        if (!user) return;

        const checkRecurring = async () => {
            const { data: rules, error } = await supabase
                .from('recurring_transactions')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                logger.error('Failed to fetch recurring transactions', error, 'App');
                return;
            }

            const today = new Date();

            for (const rule of (rules || [])) {
                const ruleDay = rule.day;
                const lastRun = rule.last_processed ? new Date(rule.last_processed) : null;
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();

                let shouldRun = false;
                if (!lastRun) {
                    if (today.getDate() >= ruleDay) shouldRun = true;
                } else {
                    const lastRunMonth = lastRun.getMonth();
                    const lastRunYear = lastRun.getFullYear();
                    if (lastRunYear < currentYear || (lastRunYear === currentYear && lastRunMonth < currentMonth)) {
                        if (today.getDate() >= ruleDay) shouldRun = true;
                    }
                }

                if (shouldRun) {
                    try {
                        await supabase.from('transactions').insert({
                            user_id: user.id,
                            note: rule.title + ' (Αυτόματο)',
                            amount: rule.amount,
                            type: rule.type,
                            category: 'bills',
                            date: new Date().toISOString()
                        });

                        await supabase.from('recurring_transactions')
                            .update({ last_processed: new Date().toISOString() })
                            .eq('id', rule.id);

                        logger.info('Auto-added recurring transaction', 'App');
                    } catch (e) {
                        logger.error('Auto-add recurring transaction failed', e, 'App');
                    }
                }
            }
        };

        checkRecurring();
    }, [user]);

    // Derived State
    const balance = useMemo(() => {
        return transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
    }, [transactions]);

    const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0), [transactions]);
    const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), [transactions]);

    const checkBudgetThresholds = async (transaction) => {
        if (transaction.type !== 'expense' || !transaction.category) return;

        const budget = budgets.find(b =>
            b.category.toLowerCase() === transaction.category.toLowerCase()
        );

        if (!budget || !budget.notification_threshold) return;

        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${now.getMonth() + 1}`;

        const alreadyNotified =
            budget.last_notified_month === currentMonthStr &&
            (budget.last_notified_pct || 0) >= budget.notification_threshold;
        if (alreadyNotified) return;

        let totalSpent = transaction.amount;
        transactions.forEach(t => {
            const tDate = new Date(t.date);
            if (t.type === 'expense' &&
                t.id !== transaction.id &&
                tDate.getMonth() === now.getMonth() &&
                tDate.getFullYear() === now.getFullYear() &&
                t.category?.toLowerCase() === budget.category.toLowerCase()) {
                totalSpent += t.amount;
            }
        });

        const percentage = (totalSpent / budget.amount) * 100;

        if (percentage >= budget.notification_threshold) {
            showToast(`⚠️ ${budget.category}: ${percentage.toFixed(0)}% του budget!`, 'warning');

            if (Capacitor.isNativePlatform()) {
                try {
                    await LocalNotifications.schedule({
                        notifications: [{
                            title: '⚠️ Budget Alert',
                            body: `${budget.category}: έφτασες το ${percentage.toFixed(0)}% του ορίου!`,
                            id: Math.floor(Math.random() * 100000),
                            schedule: { at: new Date(Date.now() + 500) },
                            actionTypeId: '',
                            extra: null
                        }]
                    });
                } catch (e) {
                    logger.error('Local Notification Error', e, 'App');
                }
            }

            try {
                await supabase.from('budgets')
                    .update({
                        last_notified_month: currentMonthStr,
                        last_notified_pct: Math.floor(percentage)
                    })
                    .eq('id', budget.id);
            } catch (e) {
                logger.error('Error updating budget notification state', e, 'App');
            }
        }
    };

    // Handlers
    const addTransaction = async (transaction) => {
        if (!user) return;

        try {
            let txId = editingTransaction?.id;
            const newTx = {
                ...transaction,
                date: editingTransaction && editingTransaction.id ? transaction.date : new Date().toISOString()
            };

            if (editingTransaction && editingTransaction.id) {
                // Optimistic update: update in local state immediately
                const updatedTx = { ...editingTransaction, ...transaction };
                setTransactions(prev =>
                    prev.map(t => t.id === editingTransaction.id ? updatedTx : t)
                );
                setShowAddModal(false);
                setEditingTransaction(null);

                const { error } = await supabase.from('transactions')
                    .update(transaction)
                    .eq('id', editingTransaction.id);
                if (error) {
                    // Rollback on failure
                    setTransactions(prev =>
                        prev.map(t => t.id === editingTransaction.id ? editingTransaction : t)
                    );
                    throw error;
                }
            } else {
                const { data, error } = await supabase.from('transactions')
                    .insert({ ...newTx, user_id: user.id })
                    .select()
                    .single();
                if (error) throw error;
                txId = data.id;
                // Optimistic add: insert at the top immediately
                setTransactions(prev => [{ ...newTx, id: txId, user_id: user.id }, ...prev]);
                setShowAddModal(false);

                await checkBudgetThresholds({ ...newTx, id: txId });
            }
        } catch (e) {
            logger.error('Error saving transaction', e, 'App');
            showToast("Σφάλμα αποθήκευσης. Προσπάθησε ξανά.", 'error');
        }
    };

    const deleteTransaction = (id) => {
        setTransactionToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!user || !transactionToDelete) return;
        try {
            const deletedTx = transactions.find(t => t.id === transactionToDelete);

            // Optimistic update: αφαίρεσε αμέσως από το UI
            setTransactions(prev => prev.filter(t => t.id !== transactionToDelete));
            setShowDeleteModal(false);
            setTransactionToDelete(null);

            const { error } = await supabase.from('transactions')
                .delete()
                .eq('id', transactionToDelete);
            if (error) {
                // Rollback αν αποτύχει
                setTransactions(prev => [...prev, deletedTx].sort((a, b) => new Date(b.date) - new Date(a.date)));
                showToast('Σφάλμα διαγραφής. Προσπάθησε ξανά.', 'error');
                throw error;
            }

            if (deletedTx?.type === 'expense' && deletedTx.category) {
                const affectedBudget = budgets.find(b =>
                    b.category.toLowerCase() === deletedTx.category.toLowerCase()
                );
                if (affectedBudget && affectedBudget.last_notified_month) {
                    const now = new Date();
                    const remainingSpent = transactions
                        .filter(t =>
                            t.id !== transactionToDelete &&
                            t.type === 'expense' &&
                            t.category?.toLowerCase() === affectedBudget.category.toLowerCase() &&
                            new Date(t.date).getMonth() === now.getMonth() &&
                            new Date(t.date).getFullYear() === now.getFullYear()
                        )
                        .reduce((s, t) => s + t.amount, 0);

                    const remainingPct = (remainingSpent / affectedBudget.amount) * 100;

                    if (remainingPct < affectedBudget.notification_threshold) {
                        await supabase.from('budgets')
                            .update({ last_notified_month: null, last_notified_pct: 0 })
                            .eq('id', affectedBudget.id);
                    }
                }
            }
        } catch (e) {
            logger.error('Error deleting transaction', e, 'App');
        }
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setShowAddModal(true);
    };

    const handleSignOut = () => {
        supabase.auth.signOut();
    };

    // --- Layout Render ---

    if (loading) return <LoadingView />;

    if (user && isLocked) {
        return <LockScreen onSignOut={handleSignOut} user={user} />;
    }

    if (!user && !loading) return (
        <LoginView
            onEmailLogin={handleEmailLogin}
            onRegister={handleRegister}
            onGoogleLogin={handleGoogleLogin}
        />
    );

    // Derive display name and photo from Supabase user_metadata
    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
    const photoURL = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

    return (
        <div className="h-full w-full bg-surface-light dark:bg-surface-dark
                        font-sans text-gray-900 dark:text-white
                        selection:bg-violet-100 dark:selection:bg-violet-900
                        flex justify-center items-start transition-colors duration-300">

            {/* Mobile container */}
            <div className="w-full max-w-md bg-gray-50 dark:bg-surface-dark
                            h-full overflow-hidden
                            shadow-2xl relative flex flex-col
                            transition-colors duration-300">

                {/* ── Main Scroll Area ── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4">

                    {/* ── Top Bar ── */}
                    <div className="shrink-0 sticky top-0 z-20
                                    bg-gray-50 dark:bg-surface-dark backdrop-blur-md
                                    border-b border-gray-100 dark:border-white/5
                                    px-4 pb-3 -mx-4 transition-all duration-300"
                         style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
                        
                        <div className="flex items-center justify-center relative min-h-[40px]">
                            {activeTab === 'home' ? (
                                <>
                                    <div className="absolute left-4 flex items-center gap-3">
                                        {/* Avatar */}
                                        <button
                                            onClick={() => setActiveTab('profile')}
                                            className="w-10 h-10 rounded-full overflow-hidden
                                                       bg-gradient-to-br from-violet-500 to-violet-700
                                                       border-2 border-violet-200 dark:border-violet-900/50
                                                       flex items-center justify-center flex-shrink-0
                                                       text-white shadow-md
                                                       hover:scale-105 active:scale-95 transition-all duration-200"
                                            title={translate('nav_profile')}
                                        >
                                            {photoURL && !imgError ? (
                                                <img src={photoURL} alt="Profile"
                                                    className="w-full h-full object-cover"
                                                    onError={() => setImgError(true)} />
                                            ) : (
                                                <User size={18} />
                                            )}
                                        </button>

                                        <div className="flex flex-col">
                                            <h2 className="text-[14px] font-bold text-gray-700 dark:text-gray-300 leading-tight flex items-center gap-1.5">
                                                {(() => {
                                                    const hour = new Date().getHours();
                                                    if (hour < 12) return translate('good_morning');
                                                    if (hour < 18) return translate('good_afternoon');
                                                    return translate('good_evening');
                                                })()}, {displayName.split(' ')[0]} <span className="animate-wave origin-bottom-right">👋</span>
                                            </h2>
                                        </div>
                                    </div>

                                    {/* Privacy toggle */}
                                    <button
                                        onClick={togglePrivacyMode}
                                        className="absolute right-4 w-9 h-9 rounded-full
                                                   bg-gray-100 dark:bg-white/[0.08]
                                                   flex items-center justify-center flex-shrink-0
                                                   text-gray-500 dark:text-white/50
                                                   hover:bg-gray-200 dark:hover:bg-white/[0.14]
                                                   active:scale-90 transition-all duration-150"
                                        title={privacyMode ? "Disable Privacy Mode" : "Enable Privacy Mode"}
                                    >
                                        {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-center">
                                        <h2 className="text-[16px] font-bold text-gray-900 dark:text-white">
                                            {activeTab === 'history' && translate('nav_history')}
                                            {activeTab === 'stats' && translate('nav_stats')}
                                            {activeTab === 'goals' && translate('goals')}
                                            {activeTab === 'budgets' && translate('budgets')}
                                            {activeTab === 'feedback' && translate('feedback')}
                                            {activeTab === 'admin' && 'Admin Panel'}
                                        </h2>
                                    </div>
                                    <div className="absolute right-4 flex items-center">
                                        <button
                                            onClick={togglePrivacyMode}
                                            className="w-9 h-9 rounded-full
                                                       bg-gray-100 dark:bg-white/[0.08]
                                                       flex items-center justify-center
                                                       text-gray-500 dark:text-white/50
                                                       hover:bg-gray-200 dark:hover:bg-white/[0.14]
                                                       active:scale-90 transition-all duration-150"
                                            title={privacyMode ? "Disable Privacy Mode" : "Enable Privacy Mode"}
                                        >
                                            {privacyMode ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Spacer to replace the previous mb-5 */}
                    <div className="h-4 shrink-0" />

                    {/* ── View Switcher ── */}
                    {activeTab === 'home' && (
                        <HomeView
                            balance={balance}
                            totalIncome={totalIncome}
                            totalExpense={totalExpense}
                            transactions={transactions}
                            budgets={budgets}
                            onDelete={deleteTransaction}
                            onEdit={handleEdit}
                            setActiveTab={setActiveTab}
                            onRecurring={() => { setPreviousTab('home'); setActiveTab('recurring'); }}
                        />
                    )}
                    {activeTab === 'stats' && <StatsView transactions={transactions} />}
                    {activeTab === 'history' && <HistoryView transactions={transactions} onDelete={deleteTransaction} onEdit={handleEdit} />}
                </div>

                {/* ── Overlays ── */}
                {activeTab === 'profile' && (
                    <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                        <ProfileView user={user} onBack={() => setActiveTab('home')} onSignOut={handleSignOut}
                            onRecurring={() => { setPreviousTab('profile'); setActiveTab('recurring'); }}
                            onGeneral={() => setActiveTab('general')}
                            onSecurity={() => setActiveTab('security')}
                            onBackup={() => setActiveTab('backup')}
                            onAdmin={() => setActiveTab('admin')}
                            onFeedback={() => setActiveTab('feedback')}
                            onGuide={() => setActiveTab('guide')}
                            onProfileDetails={() => setActiveTab('profile-details')}
                        />
                    </div>
                )}
                {activeTab === 'profile-details' && (
                    <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                        <UserProfileView user={user} onBack={() => setActiveTab('profile')} onSignOut={handleSignOut} />
                    </div>
                )}

                {activeTab === 'guide' && (
                    <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                        <GuideView onBack={() => setActiveTab('profile')} />
                    </div>
                )}
                {activeTab === 'recurring' && (
                    <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                        <RecurringView user={user} onBack={() => setActiveTab(previousTab)} />
                    </div>
                )}
                {activeTab === 'general' && (
                    <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                        <GeneralSettingsView user={user} onBack={() => setActiveTab('profile')} onPrivacy={() => setActiveTab('privacy')} />
                    </div>
                )}
                {activeTab === 'privacy' && (
                    <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                        <PrivacyPolicyView onBack={() => setActiveTab('general')} />
                    </div>
                )}
                {activeTab === 'feedback' && (
                    <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                        <FeedbackView user={user} onBack={() => setActiveTab('profile')} />
                    </div>
                )}
                {activeTab === 'security' && (
                    <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                        <SecuritySettingsView user={user} onBack={() => setActiveTab('profile')} />
                    </div>
                )}
                {activeTab === 'backup' && (
                    <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                        <BackupView user={user} onBack={() => setActiveTab('profile')} />
                    </div>
                )}
                {activeTab === 'admin' && user?.id === '86177767-e1f2-4356-b98b-e43503cab0da' && (
                    <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark">
                        <AdminView onBack={() => setActiveTab('profile')} />
                    </div>
                )}
                {activeTab === 'goals' && (
                    <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark flex flex-col">
                        <GoalsView user={user} onBack={() => setActiveTab('home')} />
                    </div>
                )}
                {activeTab === 'budgets' && (
                    <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark flex flex-col">
                        <BudgetsView user={user} transactions={transactions} onBack={() => setActiveTab('home')} />
                    </div>
                )}
                {activeTab === 'advisor' && (
                    <div className="absolute inset-0 z-50 bg-gray-50 dark:bg-surface-dark flex flex-col">
                        <FinancialAdvisorView transactions={transactions} goals={goals} onBack={() => setActiveTab('home')} />
                    </div>
                )}



                {/* ── Navbar + FAB wrapper ── */}
                {!['goals', 'budgets', 'profile', 'profile-details', 'recurring', 'general', 'security', 'backup', 'feedback', 'admin', 'privacy', 'advisor', 'guide'].includes(activeTab) && (

                    <div className="relative z-[45]">
                        {/* FAB — floats above the navbar */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                            {/* Pulse ring */}
                            <div className="absolute inset-0 rounded-full bg-violet-600/30 animate-ping-pulse scale-110" />
                            <button
                                onClick={() => { setEditingTransaction(null); setShowAddModal(true); }}
                                className="relative w-16 h-16 rounded-full
                                           bg-violet-500
                                           hover:bg-violet-600
                                           text-white shadow-lg shadow-violet-500/40
                                           active:scale-90 hover:scale-105
                                           flex items-center justify-center
                                           transition-all duration-200"
                            >
                                <Plus size={32} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* ── Navbar ── */}
                        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                )}

                {/* ── Modals ── */}
                {showAddModal && (
                    <AddModal
                        onClose={() => { setShowAddModal(false); setEditingTransaction(null); }}
                        onAdd={addTransaction}
                        initialData={editingTransaction}
                    />
                )}
                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={confirmDelete}
                    title="Διαγραφή Συναλλαγής"
                    message="Θέλεις σίγουρα να διαγράψεις αυτή τη συναλλαγή;"
                    confirmText="Διαγραφή"
                    type="danger"
                />
            </div>

            <WhatsNewModal
                isOpen={showWhatsNew}
                onClose={() => {
                    if (latestUpdate) {
                        localStorage.setItem(`whatsnew_seen_${latestUpdate.version}_${user?.id}`, 'true');
                    }
                    setShowWhatsNew(false);
                }}
                data={latestUpdate}
            />

            <BroadcastModal
                isOpen={showBroadcast}
                onClose={() => {
                    if (currentBroadcast) {
                        localStorage.setItem(`broadcast_seen_${user?.id}`, currentBroadcast.id);
                    }
                    setShowBroadcast(false);
                }}
                data={currentBroadcast}
            />
        </div>
    );
}

export default function App() {
    return (
        <SettingsProvider>
            <ToastProvider>
                <ErrorBoundary>
                    <MainContent />
                </ErrorBoundary>
            </ToastProvider>
        </SettingsProvider>
    );
}









