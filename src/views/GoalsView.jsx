import React, { useState, useEffect } from 'react';
import { ArrowLeft, Target, Plus, Trash2, PiggyBank, Pencil } from 'lucide-react';
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

    // Edit Goal state
    const [editingGoal, setEditingGoal] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editTarget, setEditTarget] = useState('');

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
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'goals', id));
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    const openEditModal = (goal) => {
        setEditingGoal(goal);
        setEditTitle(goal.title);
        setEditTarget(String(goal.targetAmount));
    };

    const handleEditGoal = async (e) => {
        e.preventDefault();
        if (!editingGoal || !editTitle || !editTarget) return;
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'goals', editingGoal.id), {
                title: editTitle,
                targetAmount: parseFloat(editTarget)
            });
            setEditingGoal(null);
        } catch (error) {
            console.error('Error editing goal:', error);
        }
    };

    const openAddMoneyModal = (goal) => {
        setSelectedGoal(goal);
        setShowMoneyModal(true);
        setAddMoneyAmount('');
    };

    const handleAddMoney = async () => {
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
        <div className="flex flex-col h-full bg-[#F9F9F9] dark:bg-gray-900 animate-fade-in transition-colors duration-300">

            {/* Sticky Header */}
            <div className="bg-white dark:bg-gray-800 px-5 pt-12 pb-4 shadow-sm border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-300"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Στόχοι</h2>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-colors"
                >
                    <Plus size={16} /> Νέος Στόχος
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 pb-8">
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
                                <div key={goal.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
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
                                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                                    </div>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-4">
                                        {(goal.currentAmount || 0).toLocaleString('el-GR', { minimumFractionDigits: 0 })}€ / {goal.targetAmount.toLocaleString('el-GR', { minimumFractionDigits: 0 })}€
                                    </p>

                                    {/* Action Row */}
                                    <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <button
                                            onClick={() => openEditModal(goal)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors active:scale-95"
                                        >
                                            <Pencil size={13} /> Επεξεργασία
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors active:scale-95"
                                        >
                                            <Trash2 size={13} /> Διαγραφή
                                        </button>
                                        <button
                                            onClick={() => openAddMoneyModal(goal)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors active:scale-95"
                                        >
                                            <Plus size={13} /> Προσθήκη
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Add Goal Modal */}
            {
                showAddModal && (
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
                )
            }

            {/* Edit Goal Modal */}
            {editingGoal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingGoal(null)} />
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Επεξεργασία Στόχου</h3>
                        <form onSubmit={handleEditGoal} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Τίτλος</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ποσό Στόχος (€)</label>
                                <input
                                    type="number"
                                    value={editTarget}
                                    onChange={(e) => setEditTarget(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setEditingGoal(null)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold rounded-xl">
                                    Ακύρωση
                                </button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                                    Αποθήκευση
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Money Modal */}
            {showMoneyModal && selectedGoal && (() => {
                const handleNumpad = (key) => {
                    if (key === '⌫') {
                        setAddMoneyAmount(prev => prev.slice(0, -1));
                    } else if (key === '.') {
                        if (!addMoneyAmount.includes('.')) setAddMoneyAmount(prev => prev + '.');
                    } else {
                        if (addMoneyAmount === '0') setAddMoneyAmount(key);
                        else setAddMoneyAmount(prev => prev + key);
                    }
                };
                const numKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];
                return (
                    <div className="fixed inset-0 z-[60] flex items-end justify-center animate-fade-in">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMoneyModal(false)} />
                        <div className="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-sm relative z-10 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                            {/* Handle */}
                            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" /></div>

                            {/* Header */}
                            <div className="flex items-center gap-3 px-6 pb-2 pt-2">
                                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                                    <PiggyBank size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Προσθήκη Χρημάτων</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedGoal.title}</p>
                                </div>
                            </div>

                            {/* Amount Display */}
                            <div className="px-6 py-4 text-center">
                                <p className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                    {addMoneyAmount || '0'}<span className="text-2xl text-gray-400 ml-1">€</span>
                                </p>
                            </div>

                            {/* Numpad */}
                            <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700">
                                {numKeys.map(key => (
                                    <button
                                        key={key}
                                        onClick={() => handleNumpad(key)}
                                        className={`py-4 text-xl font-semibold bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors
                                            ${key === '⌫' ? 'text-red-500' : 'text-gray-800 dark:text-gray-100'}`}
                                    >
                                        {key}
                                    </button>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 p-4 pb-8">
                                <button
                                    onClick={() => { setShowMoneyModal(false); setAddMoneyAmount(''); }}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl"
                                >
                                    Ακύρωση
                                </button>
                                <button
                                    onClick={handleAddMoney}
                                    disabled={!addMoneyAmount || addMoneyAmount === '0'}
                                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none transition-colors"
                                >
                                    Προσθήκη
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div >
    );
};

export default GoalsView;
