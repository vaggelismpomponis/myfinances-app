import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Calendar,
    Repeat,
    CreditCard,
    TrendingUp,
    TrendingDown,
    CheckCircle2,
    Pencil
} from 'lucide-react';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    updateDoc
} from 'firebase/firestore';
import { db, appId } from '../firebase';

const RecurringView = ({ user, onBack }) => {
    const [rules, setRules] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [frequency, setFrequency] = useState('monthly');
    const [day, setDay] = useState('1');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'recurring_transactions'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRules(data);
        });

        return () => unsubscribe();
    }, [user]);

    const handleAddRule = async (e) => {
        e.preventDefault();
        if (!title || !amount) return;

        try {
            if (editingId) {
                // Update
                await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'recurring_transactions', editingId), {
                    title,
                    amount: parseFloat(amount),
                    type,
                    frequency,
                    day: parseInt(day),
                });
            } else {
                // Add
                await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'recurring_transactions'), {
                    title,
                    amount: parseFloat(amount),
                    type,
                    frequency,
                    day: parseInt(day),
                    createdAt: new Date().toISOString(),
                    // Start tracking from yesterday so it triggers today if needed, or null to trigger immediately
                    lastProcessed: null
                });
            }
            setShowAddForm(false);
            setEditingId(null);
            setTitle('');
            setAmount('');
        } catch (error) {
            console.error("Error adding rule:", error);
            alert("Σφάλμα κατά την προσθήκη.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Διαγραφή επαναλαμβανόμενης συναλλαγής;')) {
            try {
                await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'recurring_transactions', id));
            } catch (error) {
                console.error("Error deleting rule:", error);
            }
        }
    };

    const handleEdit = (rule) => {
        setEditingId(rule.id);
        setTitle(rule.title);
        setAmount(rule.amount.toString());
        setType(rule.type);
        setFrequency(rule.frequency || 'monthly');
        setDay(rule.day.toString());
        setShowAddForm(true);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen animate-fade-in pb-24 relative z-50 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-6 pt-12 pb-6 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Επαναλαμβανόμενες Συναλλαγές</h2>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Intro Card */}
                {!showAddForm && rules.length === 0 && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl text-center border border-indigo-100 dark:border-indigo-800/30">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Repeat size={32} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-2">Αυτόματες Συναλλαγές</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Πρόσθεσε πάγια έξοδα (ενοίκιο, συνδρομές) και η εφαρμογή θα τα προσθέτει αυτόματα κάθε μήνα.
                        </p>
                    </div>
                )}

                {/* List of Rules */}
                <div className="space-y-4">
                    {rules.map(rule => (
                        <div key={rule.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${rule.type === 'income'
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                    }`}>
                                    {rule.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{rule.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <Calendar size={12} />
                                        <span>Κάθε {rule.day} του μήνα</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${rule.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                    }`}>
                                    {rule.type === 'income' ? '+' : '-'}{rule.amount.toFixed(2)}€
                                </p>
                                <div className="flex justify-end gap-1">
                                    <button
                                        onClick={() => handleEdit(rule)}
                                        className="p-2 text-gray-400 hover:text-indigo-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(rule.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Button / Form */}
                {showAddForm ? (
                    <form onSubmit={handleAddRule} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 space-y-4 animate-slide-up">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-900 dark:text-white">{editingId ? 'Επεξεργασία Κανόνα' : 'Νέος Κανόνας'}</h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingId(null);
                                    setTitle('');
                                    setAmount('');
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                Ακύρωση
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Τίτλος</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="π.χ. Netflix"
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ποσό (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Τύπος</label>
                                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                                    <button
                                        type="button"
                                        onClick={() => setType('expense')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'expense' ? 'bg-white dark:bg-gray-600 shadow text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}
                                    >
                                        Έξοδο
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('income')}
                                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'income' ? 'bg-white dark:bg-gray-600 shadow text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}
                                    >
                                        Έσοδο
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Συχνότητα</label>
                                <select
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all appearance-none"
                                >
                                    <option value="monthly">Μηνιαία</option>
                                    <option value="weekly" disabled>Εβδομαδιαία (Soon)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ημέρα του μήνα</label>
                                <select
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all appearance-none"
                                >
                                    {[...Array(31)].map((_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-gray-900 dark:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={18} />
                            Αποθήκευση
                        </button>

                    </form>
                ) : (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 dark:text-gray-400 font-medium hover:border-indigo-500 hover:text-indigo-500 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={20} />
                        Προσθήκη Επαναλαμβανόμενης
                    </button>
                )}

            </div>
        </div>
    );
};

export default RecurringView;
