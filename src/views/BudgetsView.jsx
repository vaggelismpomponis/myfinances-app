import React, { useState, useEffect } from 'react';
import { Plus, Trash2, PieChart, AlertCircle, Bell, Pencil, Check, X } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';

// These MUST match the categories in AddModal.jsx exactly
const EXPENSE_CATEGORIES = ['Σούπερ Μάρκετ', 'Φαγητό', 'Καφές', 'Σπίτι', 'Λογαριασμοί', 'Διασκέδαση', 'Άλλο'];

const BudgetsView = ({ user, transactions }) => {
    const [budgets, setBudgets] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null); // null = add mode, obj = edit mode

    // Form State
    const [formCategory, setFormCategory] = useState('');
    const [formAmount, setFormAmount] = useState('');
    const [formThreshold, setFormThreshold] = useState('80');

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'budgets'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setBudgets(data);
        });
        return () => unsubscribe();
    }, [user]);

    const openAddModal = () => {
        setEditingBudget(null);
        setFormCategory('');
        setFormAmount('');
        setFormThreshold('80');
        setShowModal(true);
    };

    const openEditModal = (budget) => {
        setEditingBudget(budget);
        setFormCategory(budget.category);
        setFormAmount(budget.amount.toString());
        setFormThreshold((budget.notificationThreshold || 80).toString());
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingBudget(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formCategory || !formAmount) return;
        const payload = {
            category: formCategory,
            amount: parseFloat(formAmount),
            notificationThreshold: parseFloat(formThreshold) || 100,
        };

        try {
            if (editingBudget) {
                await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'budgets', editingBudget.id), payload);
            } else {
                await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'budgets'), {
                    ...payload,
                    createdAt: new Date().toISOString()
                });
            }
            closeModal();
        } catch (error) {
            console.error('Error saving budget:', error);
            alert('Σφάλμα κατά την αποθήκευση.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Διαγραφή αυτού του προϋπολογισμού;')) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'budgets', id));
        } catch (error) {
            console.error('Error deleting budget:', error);
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
                const isSameMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
                const isCategory = t.category?.toLowerCase() === category.toLowerCase();
                return t.type === 'expense' && isSameMonth && isCategory;
            })
            .reduce((acc, t) => acc + t.amount, 0);
    };

    const getProgressColor = (pct) => pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-orange-500' : 'bg-emerald-500';
    const getTextColor = (pct) => pct >= 100 ? 'text-red-600 dark:text-red-400' : pct >= 80 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400';
    const getBgColor = (pct) => pct >= 100 ? 'bg-red-50 dark:bg-red-900/20' : pct >= 80 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in p-6 pb-24 transition-colors duration-300">

            {/* ── Summary Preview Card ── */}
            {budgets.length > 0 && (() => {
                const totalLimit = budgets.reduce((s, b) => s + b.amount, 0);
                const totalSpent = budgets.reduce((s, b) => s + calculateSpent(b.category), 0);
                const totalPct = Math.min(100, (totalSpent / totalLimit) * 100);
                const overCount = budgets.filter(b => calculateSpent(b.category) > b.amount).length;
                return (
                    <div className="mb-5 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-5 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
                        <div className="flex justify-between items-start mb-1">
                            <div>
                                <p className="text-indigo-200 text-xs font-medium mb-0.5">Συνολικά Έξοδα</p>
                                <p className="text-3xl font-extrabold">{totalSpent.toFixed(2)}€</p>
                                <p className="text-indigo-200 text-xs mt-0.5">από {totalLimit.toFixed(0)}€ συνολικό όριο</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-lg font-bold px-3 py-1 rounded-xl ${totalPct >= 100 ? 'bg-red-500/30' : totalPct >= 80 ? 'bg-orange-400/30' : 'bg-white/20'}`}>
                                    {totalPct.toFixed(0)}%
                                </span>
                                {overCount > 0 && (
                                    <p className="text-red-300 text-xs mt-1">{overCount} υπερβάσεις</p>
                                )}
                            </div>
                        </div>
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden my-4">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${totalPct >= 100 ? 'bg-red-400' : totalPct >= 80 ? 'bg-orange-300' : 'bg-emerald-300'}`}
                                style={{ width: `${totalPct}%` }}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {budgets.map(b => {
                                const sp = calculateSpent(b.category);
                                const pct = Math.min(100, (sp / b.amount) * 100);
                                const color = pct >= 100 ? 'bg-red-500/40' : pct >= 80 ? 'bg-orange-400/40' : 'bg-white/20';
                                return (
                                    <div key={b.id} className={`${color} rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${pct >= 100 ? 'bg-red-300' : pct >= 80 ? 'bg-orange-300' : 'bg-emerald-300'}`} />
                                        {b.category}
                                        <span className="opacity-80">{pct.toFixed(0)}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* ── Budget Cards ── */}
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
                            <div key={budget.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">

                                {/* Top row: icon + name + % badge */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl ${getBgColor(percentage)} ${getTextColor(percentage)}`}>
                                            {isOver ? <AlertCircle size={20} /> : <PieChart size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{budget.category}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Μηνιαίο Όριο</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold px-2 py-1 rounded-lg text-xs ${getBgColor(percentage)} ${getTextColor(percentage)}`}>
                                        {percentage.toFixed(0)}%
                                    </span>
                                </div>

                                {/* Progress bar */}
                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>

                                {/* Amounts row */}
                                <div className="flex justify-between items-center text-xs font-semibold mb-4">
                                    <span className={getTextColor(percentage)}>{spent.toFixed(2)}€ ξοδεμένα</span>
                                    <span className="text-gray-400 dark:text-gray-500">Όριο: {budget.amount}€</span>
                                </div>

                                {/* Notification threshold label */}
                                {budget.notificationThreshold && (
                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 mb-4">
                                        <Bell size={11} />
                                        <span>Ειδοποίηση στο {budget.notificationThreshold}%</span>
                                    </div>
                                )}

                                {/* Action Row: Edit | Delete */}
                                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={() => openEditModal(budget)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors active:scale-95"
                                    >
                                        <Pencil size={13} /> Επεξεργασία
                                    </button>
                                    <button
                                        onClick={() => handleDelete(budget.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors active:scale-95"
                                    >
                                        <Trash2 size={13} /> Διαγραφή
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}

                <button
                    onClick={openAddModal}
                    className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                    <Plus size={20} /> Προσθήκη Προϋπολογισμού
                </button>
            </div>

            {/* ── Add / Edit Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl border border-gray-100 dark:border-gray-700">
                        {/* Modal header */}
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingBudget ? 'Επεξεργασία Προϋπολογισμού' : 'Νέος Προϋπολογισμός'}
                            </h3>
                            <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Κατηγορία</label>
                                <select
                                    value={formCategory}
                                    onChange={(e) => setFormCategory(e.target.value)}
                                    disabled={!!editingBudget} // Can't change category when editing (would break matching)
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white disabled:opacity-60"
                                    required
                                >
                                    <option value="">-- Επέλεξε κατηγορία --</option>
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {editingBudget && <p className="text-[10px] text-gray-400 mt-1">Η κατηγορία δεν μπορεί να αλλάξει.</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Μηνιαίο Όριο (€)</label>
                                <input
                                    type="number"
                                    placeholder="300"
                                    value={formAmount}
                                    onChange={(e) => setFormAmount(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                                    Ειδοποίηση στο (%) — τώρα: {formThreshold}%
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="5"
                                    value={formThreshold}
                                    onChange={(e) => setFormThreshold(e.target.value)}
                                    className="w-full h-2 appearance-none rounded-full bg-gray-200 dark:bg-gray-600 accent-indigo-600"
                                />
                                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                    <span>10%</span><span>50%</span><span>100%</span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Ειδοποίηση όταν τα έξοδα φτάσουν αυτό το % του ορίου.</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Ακύρωση
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Check size={16} />
                                    {editingBudget ? 'Ενημέρωση' : 'Αποθήκευση'}
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
