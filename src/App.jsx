import React, { useState, useEffect, useMemo, useRef } from 'react'; // App Root
import {
    Plus,
    User,
    Sun,
    Moon
} from 'lucide-react';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithCredential,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'firebase/auth';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    getDocs,
    updateDoc
} from 'firebase/firestore';
import { auth, db, appId } from './firebase';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

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
import WalletView from './views/WalletView';
import CardsView from './views/CardsView';
import GoalsView from './views/GoalsView';
import BudgetsView from './views/BudgetsView';
import AddModal from './components/AddModal';
import Navbar from './components/Navbar';

import ConfirmationModal from './components/ConfirmationModal';
import ErrorBoundary from './components/ErrorBoundary';

function MainContent() {
    const { isLocked, theme, toggleTheme, t: translate } = useSettings();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('home');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imgError, setImgError] = useState(false);

    // Browser History Navigation Logic
    const isPopping = useRef(false);

    useEffect(() => {
        // Initialize history state on mount
        window.history.replaceState({ tab: 'home' }, '', '');

        const handlePopState = (event) => {
            if (event.state && event.state.tab) {
                isPopping.current = true;
                setActiveTab(event.state.tab);
            } else {
                // Fallback for empty state (e.g. initial load or weird entry)
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

        // Push new state only if not popping
        window.history.pushState({ tab: activeTab }, '', '');
    }, [activeTab]);

    // Reset image error when user photo changes
    useEffect(() => {
        setImgError(false);
    }, [user?.photoURL]);

    // Notification Listener
    useEffect(() => {
        const cleanup = setupNotificationListener((transactions) => {
            if (transactions && transactions.length > 0) {
                // Parse the newest transaction
                // Note: The native plugin returns raw strings in JSON, but our logic might have put full object in 'pending'
                // The Java code puts { title, text, date, raw }

                // We'll take the last one added (or the first in the list depending on Java logic)
                // Java logic: jsonArray.put(obj) -> appends to end. So last is newest.
                const tx = transactions[transactions.length - 1];

                let text = tx.text || "";
                console.log("[DEBUG] Parsing text:", text);

                // Very simple & robust extraction: Find any number like X.XX or X,XX
                const simpleMatch = text.match(/(\d+[.,]\d+)/);
                let amount = 0;

                if (simpleMatch) {
                    let amountStr = simpleMatch[1].replace(',', '.');
                    amount = parseFloat(amountStr);
                    console.log("[DEBUG] Parsed amount:", amount);
                } else {
                    console.log("[DEBUG] No match found");
                }

                setEditingTransaction({
                    amount: amount || 0,
                    note: (tx.title || "") + " - " + text,
                    type: 'expense',
                    category: 'shopping', // Default
                    date: new Date().toISOString()
                });
                console.log("[DEBUG] Setting editing transaction with amount:", amount);
                setShowAddModal(true);
                showToast("Εντοπίστηκε νέα συναλλαγή!", "info");
            }
        });
        return cleanup;
    }, []);

    // 1. Initialize Auth
    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                trackSession(currentUser);
            }
        });

        return () => unsubscribe();
    }, []);



    const handleGoogleLogin = async () => {
        try {
            if (Capacitor.isNativePlatform()) {
                const result = await FirebaseAuthentication.signInWithGoogle();
                // Sign in to Firebase with the credential from the native plugin
                if (result.credential?.idToken) {
                    const credential = GoogleAuthProvider.credential(result.credential.idToken);
                    await signInWithCredential(auth, credential);
                }
            } else {
                const provider = new GoogleAuthProvider();
                await signInWithPopup(auth, provider);
            }
        } catch (error) {
            console.error("Google Auth error:", error);
            showToast("Η σύνδεση με Google απέτυχε: " + (error.message || JSON.stringify(error)), 'error');
        }
    };

    const handleEmailLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Login error:", error);
            let msg = "Αποτυχία σύνδεσης.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                msg = "Λάθος email ή κωδικός πρόσβασης.";
            } else if (error.code === 'auth/too-many-requests') {
                msg = "Πολλές αποτυχημένες προσπάθειες. Δοκιμάστε αργότερα.";
            }
            showToast(msg, 'error');
            throw error; // Rethrow to let LoginView know
        }
    };

    const handleRegister = async (email, password) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            showToast("Ο λογαριασμός δημιουργήθηκε!", 'success');
        } catch (error) {
            console.error("Register error:", error);
            let msg = "Αποτυχία εγγραφής.";
            if (error.code === 'auth/email-already-in-use') {
                msg = "Το email χρησιμοποιείται ήδη.";
            } else if (error.code === 'auth/weak-password') {
                msg = "Ο κωδικός είναι πολύ αδύναμος.";
            }
            showToast(msg, 'error');
            throw error;
        }
    };

    // 2. Fetch Data from Firestore
    useEffect(() => {
        if (!user) {
            setTransactions([]);
            return;
        }

        // Path: artifacts/{appId}/users/{uid}/transactions
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort in JS (Rule: No complex Firestore queries)
            // Descending order (newest first)
            data.sort((a, b) => new Date(b.date) - new Date(a.date));

            setTransactions(data);
        }, (error) => {
            console.error("Firestore error:", error);
        });

        return () => unsubscribe();
    }, [user]);

    // 3. Process Recurring Transactions
    useEffect(() => {
        if (!user) return;

        const checkRecurring = async () => {
            const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'recurring_transactions'));
            const snapshot = await getDocs(q);
            const today = new Date(); // Current date

            snapshot.forEach(async (docSnap) => {
                const rule = { id: docSnap.id, ...docSnap.data() };
                const ruleDay = rule.day;

                // Determine if we should run it today
                // Simple logic: If it hasn't run this month (or ever), and today >= ruleDay
                const lastRun = rule.lastProcessed ? new Date(rule.lastProcessed) : null;
                const currentMonth = today.getMonth();
                const currentYear = today.getFullYear();

                let shouldRun = false;

                if (!lastRun) {
                    // Never run before. Run if today >= ruleDay
                    if (today.getDate() >= ruleDay) shouldRun = true;
                } else {
                    // Has run before. check if it ran this month
                    const lastRunMonth = lastRun.getMonth();
                    const lastRunYear = lastRun.getFullYear();

                    if (lastRunYear < currentYear || (lastRunYear === currentYear && lastRunMonth < currentMonth)) {
                        // Hasn't run this month
                        if (today.getDate() >= ruleDay) shouldRun = true;
                    }
                }

                if (shouldRun) {
                    // Add Transaction
                    try {
                        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
                            note: rule.title + ' (Αυτόματο)',
                            amount: rule.amount,
                            type: rule.type,
                            category: 'bills', // Default or add to rule
                            date: new Date().toISOString()
                        });

                        // Update Rule
                        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'recurring_transactions', rule.id), {
                            lastProcessed: new Date().toISOString()
                        });

                        // Notify user (optional, simple alert for now if they are looking)
                        console.log(`Auto-added ${rule.title}`);
                    } catch (e) {
                        console.error("Auto-add failed", e);
                    }
                }
            });
        };

        checkRecurring();
    }, [user]); // Runs once on user load/change

    // Derived State
    const balance = useMemo(() => {
        return transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
    }, [transactions]);

    const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0), [transactions]);
    const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), [transactions]);

    // Handlers
    const addTransaction = async (transaction) => {
        if (!user) return;

        try {
            if (editingTransaction && editingTransaction.id) {
                // Update existing
                const txRef = doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', editingTransaction.id);
                await updateDoc(txRef, transaction);
                setEditingTransaction(null);
            } else {
                // Add new (Regular add or from Notification/Scanner without ID)
                await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
                    ...transaction,
                    date: new Date().toISOString()
                });
            }
            setShowAddModal(false);
        } catch (e) {
            console.error("Error saving document: ", e);
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
            await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', transactionToDelete));
            setShowDeleteModal(false);
            setTransactionToDelete(null);
        } catch (e) {
            console.error("Error deleting:", e);
        }
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setShowAddModal(true);
    };

    const handleSignOut = () => {
        signOut(auth);
    };

    // --- Layout Render ---

    if (loading) return <LoadingView />;

    // Show Lock Screen if locked (only if accessed, but standard behavior is to block everything)
    // We check !user because LockScreen is usually for when you are ALREADY logged in locally.
    // If not logged in, LoginView takes precedence? Or LockScreen first?
    // Let's say LockScreen protects the session.

    if (user && isLocked) {
        return <LockScreen onSignOut={handleSignOut} user={user} />;
    }

    if (!user && !loading) return (
        <LoginView
            onGoogleLogin={handleGoogleLogin}
            onEmailLogin={handleEmailLogin}
            onRegister={handleRegister}
        />
    );

    return (
        <div className="min-h-screen bg-[#F9F9F9] dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 selection:bg-indigo-100 dark:selection:bg-indigo-900 flex justify-center transition-colors duration-300">

            {/* Mobile Container Simulator */}
            <div className="w-full max-w-md bg-[#F9F9F9] dark:bg-gray-900 h-[100dvh] overflow-hidden shadow-2xl relative flex flex-col transition-colors duration-300">

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-5">

                    {/* Top Bar */}
                    <div className="flex justify-between items-center mb-6 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
                        <div>
                            {activeTab === 'home' ? (
                                <>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium tracking-wider">{translate('welcome_message')}</p>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {user?.displayName || user?.email?.split('@')[0] || 'User'}!
                                    </h2>
                                </>
                            ) : (
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {activeTab === 'history' && translate('nav_history')}
                                    {activeTab === 'stats' && translate('nav_stats')}
                                    {activeTab === 'wallet' && translate('wallet')}
                                    {activeTab === 'cards' && translate('cards')}
                                    {activeTab === 'goals' && translate('goals')}
                                    {activeTab === 'budgets' && translate('budgets')}
                                </h2>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleTheme}
                                className="w-10 h-10 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-colors rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-500/30 overflow-hidden"
                                title={translate('nav_profile')}
                            >
                                {user?.photoURL && !imgError ? (
                                    <img
                                        src={user.photoURL}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <User size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* View Switcher */}
                    {activeTab === 'home' && (
                        <HomeView
                            balance={balance}
                            totalIncome={totalIncome}
                            totalExpense={totalExpense}
                            transactions={transactions}
                            onDelete={deleteTransaction}
                            onEdit={handleEdit}
                            setActiveTab={setActiveTab}
                        />
                    )}
                    {activeTab === 'stats' && <StatsView transactions={transactions} />}
                    {activeTab === 'history' && <HistoryView transactions={transactions} onDelete={deleteTransaction} onEdit={handleEdit} />}
                    {activeTab === 'wallet' && <WalletView onBack={() => setActiveTab('home')} user={user} />}
                    {activeTab === 'cards' && <CardsView onBack={() => setActiveTab('home')} />}
                    {activeTab === 'goals' && <GoalsView user={user} onBack={() => setActiveTab('home')} />}
                    {activeTab === 'budgets' && <BudgetsView user={user} transactions={transactions} onBack={() => setActiveTab('home')} />}

                </div>

                {/* Profile View Overlay */}
                {activeTab === 'profile' && (
                    <div className="absolute inset-0 z-50 bg-white dark:bg-gray-900">
                        <ProfileView
                            user={user}
                            onBack={() => setActiveTab('home')}
                            onSignOut={handleSignOut}
                            onRecurring={() => setActiveTab('recurring')}
                            onGeneral={() => setActiveTab('general')}
                            onSecurity={() => setActiveTab('security')}
                        />
                    </div>
                )}

                {/* Recurring View Overlay */}
                {activeTab === 'recurring' && (
                    <div className="absolute inset-0 z-50 bg-white dark:bg-gray-900">
                        <RecurringView
                            user={user}
                            onBack={() => setActiveTab('profile')}
                        />
                    </div>
                )}

                {/* General Settings Overlay */}
                {activeTab === 'general' && (
                    <div className="absolute inset-0 z-50 bg-white dark:bg-gray-900">
                        <GeneralSettingsView
                            user={user}
                            onBack={() => setActiveTab('profile')}
                        />
                    </div>
                )}

                {/* Security Settings Overlay */}
                {activeTab === 'security' && (
                    <div className="absolute inset-0 z-50 bg-white dark:bg-gray-900">
                        <SecuritySettingsView
                            user={user}
                            onBack={() => setActiveTab('profile')}
                        />
                    </div>
                )}

                {/* Floating Add Button (Center) */}
                <div className="absolute bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-20">
                    <button
                        onClick={() => { setEditingTransaction(null); setShowAddModal(true); }}
                        className="bg-gray-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white p-5 rounded-full shadow-xl shadow-indigo-200 dark:shadow-indigo-900/50 transition-transform active:scale-90 flex items-center justify-center"
                    >
                        <Plus size={32} />
                    </button>
                </div>

                {/* Bottom Navigation */}
                <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

                {/* Modals */}
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
