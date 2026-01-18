import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Wallet, Plus, CreditCard } from 'lucide-react';
import { collection, query, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, appId } from '../firebase';
import AccountCard from '../components/AccountCard';
import AddAccountModal from '../components/AddAccountModal';
import { useSettings } from '../contexts/SettingsContext';

const WalletView = ({ onBack, user }) => {
    const { currency } = useSettings();
    const [accounts, setAccounts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'accounts'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            data.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));
            setAccounts(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const totalBalance = useMemo(() => {
        return accounts.reduce((acc, account) => acc + (account.balance || 0), 0);
    }, [accounts]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in pb-24 relative">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-6 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={onBack}
                        className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Πορτοφόλι</h2>
                </div>

                {/* Total Balance Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-indigo-100 text-sm font-medium mb-1">Συνολικό Υπόλοιπο</p>
                        <h1 className="text-3xl font-bold font-mono">
                            {currency} {totalBalance.toLocaleString('el-GR', { minimumFractionDigits: 2 })}
                        </h1>
                    </div>
                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-12 -mb-12"></div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Οι Λογαριασμοί μου</h3>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                    >
                        <Plus size={16} />
                        Προσθήκη
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                        ))}
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-300 dark:text-gray-600">
                            <Wallet size={32} />
                        </div>
                        <p>Δεν υπάρχουν λογαριασμοί.</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="text-indigo-600 font-bold mt-2"
                        >
                            Δημιούργησε τον πρώτο σου!
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {accounts.map(account => (
                            <AccountCard key={account.id} account={account} />
                        ))}
                    </div>
                )}
            </div>

            {showAddModal && <AddAccountModal onClose={() => setShowAddModal(false)} user={user} />}
        </div>
    );
};

export default WalletView;
