import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, PieChart, AlertCircle, CheckCircle } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc } from 'firebase/firestore';
import { db, appId } from '../firebase';
import AddModal from '../components/AddModal'; // We might want a specific AddBudgetModal, but can reuse logic or create inline for now.
// Let's create a simple inline modal or form for budgets to keep it self-contained for now.

const BudgetsView = ({ user, transactions, onBack }) => {
    const [budgets, setBudgets] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form State
    const [newBudgetCategory, setNewBudgetCategory] = useState('');
    const [newBudgetAmount, setNewBudgetAmount] = useState('');

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'budgets'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setBudgets(data);
        });

        return () => unsubscribe();
    }, [user]);

    const handleAddBudget = async (e) => {
        e.preventDefault();
        if (!newBudgetCategory || !newBudgetAmount) return;

        try {
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'budgets'), {
                category: newBudgetCategory,
                amount: parseFloat(newBudgetAmount),
                createdAt: new Date().toISOString()
            });
            setShowAddModal(false);
            setNewBudgetCategory('');
            setNewBudgetAmount('');
        } catch (error) {
            console.error("Error adding budget:", error);
            alert("Σφάλμα κατά την προσθήκη.");
        }
    };

    const handleDeleteBudget = async (id) => {
        if (window.confirm('Διαγραφή αυτού του προϋπολογισμού;')) {
            try {
                await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'budgets', id));
            } catch (error) {
                console.error("Error deleting budget:", error);
            }
        }
    };

    // Calculate spent amount for a specific category in the current month
    const calculateSpent = (category) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return transactions
            .filter(t => {
                const tDate = new Date(t.date);
                // Filter by date (current month)
                const isSameMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
                // Filter by type (expense only)
                const isExpense = t.type === 'expense';
                // Filter by category (case insensitive partial match or exact match depending on requirement)
                // Let's do a simple includes or exact match. For better UX, we might want a dropdown of categories later.
                // Assuming user types the category exactly or we match broadly.
                const isCategory = t.category?.toLowerCase() === category.toLowerCase() ||
                    t.note?.toLowerCase().includes(category.toLowerCase());

                return isSameMonth && isExpense && isCategory;
            })
            .reduce((acc, t) => acc + t.amount, 0);
    };

    // Helper to get progress color
    const getProgressColor = (percentage) => {
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 80) return 'bg-orange-500';
        return 'bg-emerald-500';
    };

    const getTextColor = (percentage) => {
        if (percentage >= 100) return 'text-red-600';
        if (percentage >= 80) return 'text-orange-600';
        return 'text-emerald-600';
    };

    const getBgColor = (percentage) => {
        if (percentage >= 100) return 'bg-red-50 dark:bg-red-900/20';
        if (percentage >= 80) return 'bg-orange-50 dark:bg-orange-900/20';
        return 'bg-emerald-50 dark:bg-emerald-900/20';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in p-6 pb-24 transition-colors duration-300">
            {/* Budgets List */}
            <div className="space-y-4">
                {budgets.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <PieChart size={48} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">Δεν υπάρχουν ενεργοί προϋπολογισμοί</p>
                    </div>
                ) : (
                    budgets.map(budget => {
                        const spent = calculateSpent(budget.category);
                        const percentage = Math.min(100, (spent / budget.amount) * 100);
                        const isOver = spent > budget.amount;

                        return (
                            <div key={budget.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300 relative group">
                                <button
                                    onClick={() => handleDeleteBudget(budget.id)}
                                    className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${getBgColor(percentage)} ${getTextColor(percentage)}`}>
                                            {isOver ? <AlertCircle size={20} /> : <PieChart size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white capitalize">{budget.category}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Μηνιαίο Όριο</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold px-2 py-1 rounded-lg text-xs ${getBgColor(percentage)} ${getTextColor(percentage)}`}>
                                        {percentage.toFixed(0)}%
                                    </span>
                                </div>

                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>

                                <div className="flex justify-between items-center text-xs font-semibold">
                                    <span className={getTextColor(percentage)}>{spent.toFixed(2)}€</span>
                                    <span className="text-gray-400 dark:text-gray-500">Όριο: {budget.amount}€</span>
                                </div>
                            </div>
                        );
                    })
                )}

                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                    <Plus size={20} /> Προσθήκη Προϋπολογισμού
                </button>
            </div>

            {/* Add Budget Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Νέος Προϋπολογισμός</h3>
                        <form onSubmit={handleAddBudget} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Κατηγορία</label>
                                <input
                                    type="text"
                                    placeholder="π.χ. Supermarket"
                                    value={newBudgetCategory}
                                    onChange={(e) => setNewBudgetCategory(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Μηνιαίο Όριο (€)</label>
                                <input
                                    type="number"
                                    placeholder="300"
                                    value={newBudgetAmount}
                                    onChange={(e) => setNewBudgetAmount(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl"
                                >
                                    Ακύρωση
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none"
                                >
                                    Αποθήκευση
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetsView;
