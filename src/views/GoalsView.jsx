import React, { useState, useEffect } from 'react';
import { ArrowLeft, Target, TrendingUp, Plus, Trash2, PiggyBank } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';

const GoalsView = ({ user, onBack }) => {
    const [goals, setGoals] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showMoneyModal, setShowMoneyModal] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    // Form State for New Goal
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');
    const [newGoalCurrent, setNewGoalCurrent] = useState('');

    // Form State for Add Money
    const [addMoneyAmount, setAddMoneyAmount] = useState('');

    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'goals'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setGoals(data);
        });

        return () => unsubscribe();
    }, [user]);

    const handleAddGoal = async (e) => {
        e.preventDefault();
        if (!newGoalTitle || !newGoalTarget) return;

        try {
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'goals'), {
                title: newGoalTitle,
                targetAmount: parseFloat(newGoalTarget),
                currentAmount: parseFloat(newGoalCurrent) || 0,
                createdAt: new Date().toISOString()
            });
            setShowAddModal(false);
            setNewGoalTitle('');
            setNewGoalTarget('');
            setNewGoalCurrent('');
        } catch (error) {
            console.error("Error adding goal:", error);
        }
    };

    const handleDeleteGoal = async (id) => {
        if (window.confirm('Διαγραφή αυτού του στόχου;')) {
            try {
                await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'goals', id));
            } catch (error) {
                console.error("Error deleting goal:", error);
            }
        }
    };

    const openAddMoneyModal = (goal) => {
        setSelectedGoal(goal);
        setShowMoneyModal(true);
        setAddMoneyAmount('');
    };

    const handleAddMoney = async (e) => {
        e.preventDefault();
        if (!selectedGoal || !addMoneyAmount) return;

        try {
            const newAmount = (selectedGoal.currentAmount || 0) + parseFloat(addMoneyAmount);
            await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'goals', selectedGoal.id), {
                currentAmount: newAmount
            });
            setShowMoneyModal(false);
            setSelectedGoal(null);
            setAddMoneyAmount('');
        } catch (error) {
            console.error("Error adding money:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in p-6 pb-24 transition-colors duration-300">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Οικονομικοί Στόχοι</h2>
                </div>
            </div>

            <div className="space-y-4">
                {goals.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <Target size={48} className="mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">Κανένας στόχος ακόμα</p>
                    </div>
                ) : (
                    goals.map(goal => {
                        const percentage = Math.min(100, ((goal.currentAmount || 0) / goal.targetAmount) * 100);

                        return (
                            <div key={goal.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative group transition-colors duration-300">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteGoal(goal.id); }}
                                    className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 z-10"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                            <Target size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">{goal.title}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Στόχος: {goal.targetAmount}€</p>
                                        </div>
                                    </div>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg text-xs">{percentage.toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        {(goal.currentAmount || 0).toLocaleString('el-GR', { minimumFractionDigits: 0 })}€ / {goal.targetAmount.toLocaleString('el-GR', { minimumFractionDigits: 0 })}€
                                    </p>
                                    <button
                                        onClick={() => openAddMoneyModal(goal)}
                                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                    >
                                        + Προσθήκη
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}

                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all gap-2"
                >
                    <Plus size={32} />
                    <span className="font-medium">Δημιουργία νέου στόχου</span>
                </button>
            </div>

            {/* Add Goal Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Νέος Στόχος</h3>
                        <form onSubmit={handleAddGoal} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Τίτλος Στόχου</label>
                                <input
                                    type="text"
                                    placeholder="π.χ. Ταξίδι στο Παρίσι"
                                    value={newGoalTitle}
                                    onChange={(e) => setNewGoalTitle(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ποσό Στόχος (€)</label>
                                <input
                                    type="number"
                                    placeholder="1500"
                                    value={newGoalTarget}
                                    onChange={(e) => setNewGoalTarget(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Αρχικό Ποσό (€) (Προαιρετικό)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={newGoalCurrent}
                                    onChange={(e) => setNewGoalCurrent(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
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

            {/* Add Money Modal */}
            {showMoneyModal && selectedGoal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMoneyModal(false)} />
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                                <PiggyBank size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Προσθήκη Χρημάτων</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedGoal.title}</p>
                            </div>
                        </div>

                        <form onSubmit={handleAddMoney} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ποσό (€)</label>
                                <input
                                    type="number"
                                    placeholder="50"
                                    value={addMoneyAmount}
                                    onChange={(e) => setAddMoneyAmount(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-lg font-bold text-center"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowMoneyModal(false)}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl"
                                >
                                    Ακύρωση
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none"
                                >
                                    Προσθήκη
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalsView;
