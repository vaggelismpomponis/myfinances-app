import React, { useState, useEffect, useMemo } from 'react';
import {
    Plus,
    User
} from 'lucide-react';
import {
    GoogleAuthProvider,
    signInWithPopup,
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
    query
} from 'firebase/firestore';
import { auth, db, appId } from './firebase';

// Components
import LoadingView from './views/LoadingView';
import LoginView from './views/LoginView';
import ProfileView from './views/ProfileView';
import HomeView from './views/HomeView';
import StatsView from './views/StatsView';
import HistoryView from './views/HistoryView';
import AddModal from './components/AddModal';
import Navbar from './components/Navbar';

export default function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [showAddModal, setShowAddModal] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Initialize Auth
    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google Auth error:", error);
            alert("Η σύνδεση με Google απέτυχε: " + error.message);
        }
    };

    const handleEmailLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Login error:", error);
            alert("Αποτυχία σύνδεσης: " + error.message);
            throw error;
        }
    };

    const handleRegister = async (email, password) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Register error:", error);
            alert("Αποτυχία εγγραφής: " + error.message);
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
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'transactions'), {
                ...transaction,
                date: new Date().toISOString()
            });
            setShowAddModal(false);
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Σφάλμα αποθήκευσης. Προσπάθησε ξανά.");
        }
    };

    const deleteTransaction = async (id) => {
        if (!user) return;
        if (window.confirm('Θέλεις σίγουρα να διαγράψεις αυτή τη συναλλαγή;')) {
            try {
                await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'transactions', id));
            } catch (e) {
                console.error("Error deleting:", e);
            }
        }
    };

    const handleSignOut = () => {
        if (window.confirm("Θέλεις να αποσυνδεθείς;")) {
            signOut(auth);
        }
    };

    // --- Layout Render ---

    if (loading) return <LoadingView />;
    if (!user && !loading) return (
        <LoginView
            onGoogleLogin={handleGoogleLogin}
            onEmailLogin={handleEmailLogin}
            onRegister={handleRegister}
        />
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 selection:bg-indigo-100 dark:selection:bg-indigo-900 flex justify-center transition-colors duration-300">

            {/* Mobile Container Simulator */}
            <div className="w-full max-w-md bg-white dark:bg-gray-900 min-h-screen shadow-2xl relative flex flex-col transition-colors duration-300">

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-5">

                    {/* Top Bar */}
                    <div className="flex justify-between items-center mb-6 pt-2">
                        <div>
                            <p className="text-gray-500 text-xs font-medium tracking-wider">Γεια σου,</p>
                            <h2 className="text-xl font-bold text-gray-900">
                                {user?.displayName || user?.email?.split('@')[0] || 'User'}!
                            </h2>
                        </div>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className="w-10 h-10 bg-indigo-50 hover:bg-indigo-100 transition-colors rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200"
                            title="Προφίλ"
                        >
                            <User size={20} />
                        </button>
                    </div>

                    {/* View Switcher */}
                    {activeTab === 'home' && (
                        <HomeView
                            balance={balance}
                            totalIncome={totalIncome}
                            totalExpense={totalExpense}
                            transactions={transactions}
                            onDelete={deleteTransaction}
                            setActiveTab={setActiveTab}
                        />
                    )}
                    {activeTab === 'stats' && <StatsView transactions={transactions} />}
                    {activeTab === 'history' && <HistoryView transactions={transactions} onDelete={deleteTransaction} />}

                </div>

                {/* Profile View Overlay */}
                {activeTab === 'profile' && (
                    <div className="absolute inset-0 z-50 bg-white">
                        <ProfileView
                            user={user}
                            onBack={() => setActiveTab('home')}
                            onSignOut={handleSignOut}
                        />
                    </div>
                )}

                {/* Floating Add Button (Center) */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-gray-900 hover:bg-black text-white p-4 rounded-full shadow-xl shadow-indigo-200 transition-transform active:scale-90 flex items-center justify-center"
                    >
                        <Plus size={28} />
                    </button>
                </div>

                {/* Bottom Navigation */}
                <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

                {/* Modals */}
                {showAddModal && <AddModal onClose={() => setShowAddModal(false)} onAdd={addTransaction} />}
            </div>
        </div>
    );
}
