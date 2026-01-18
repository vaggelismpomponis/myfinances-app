import React, { useState } from 'react';
import { X, Check, Wallet, CreditCard, Banknote, Landmark } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';

const COLORS = [
    { bg: 'bg-blue-500', text: 'text-blue-500', hex: '#3B82F6' },
    { bg: 'bg-emerald-500', text: 'text-emerald-500', hex: '#10B981' },
    { bg: 'bg-indigo-500', text: 'text-indigo-500', hex: '#6366F1' },
    { bg: 'bg-violet-500', text: 'text-violet-500', hex: '#8B5CF6' },
    { bg: 'bg-rose-500', text: 'text-rose-500', hex: '#F43F5E' },
    { bg: 'bg-amber-500', text: 'text-amber-500', hex: '#F59E0B' },
];

const ICONS = [
    { id: 'wallet', icon: Wallet, label: 'Πορτοφόλι' },
    { id: 'bank', icon: Landmark, label: 'Τράπεζα' },
    { id: 'cash', icon: Banknote, label: 'Μετρητά' },
    { id: 'card', icon: CreditCard, label: 'Κάρτα' },
];

const AddAccountModal = ({ onClose, user }) => {
    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [selectedType, setSelectedType] = useState(ICONS[0]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !balance) return;

        setLoading(true);
        try {
            await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'accounts'), {
                name,
                balance: parseFloat(balance),
                type: selectedType.id,
                color: selectedColor.hex,
                dateCreated: new Date().toISOString()
            });
            onClose();
        } catch (error) {
            console.error("Error adding account:", error);
            alert("Σφάλμα κατά την προσθήκη.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl transform transition-all animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Νέος Λογαριασμός</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Όνομα</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="π.χ. Τράπεζα Πειραιώς"
                            className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white text-lg placeholder-gray-400"
                            required
                        />
                    </div>

                    {/* Balance Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Αρχικό Υπόλοιπο</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={balance}
                                onChange={(e) => setBalance(e.target.value)}
                                placeholder="0.00"
                                step="0.01"
                                className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white text-2xl font-bold placeholder-gray-400"
                                required
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">€</span>
                        </div>
                    </div>

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Τύπος</label>
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {ICONS.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSelectedType(item)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all min-w-[80px] ${selectedType.id === item.id
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                                            : 'border-transparent bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    <item.icon size={24} />
                                    <span className="text-xs font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Χρώμα</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {COLORS.map((color) => (
                                <button
                                    key={color.hex}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${color.bg} ${selectedColor.hex === color.hex ? 'scale-110 ring-2 ring-offset-2 ring-gray-300 dark:ring-gray-600' : ''
                                        }`}
                                >
                                    {selectedColor.hex === color.hex && <Check size={16} className="text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {loading ? 'Αποθήκευση...' : 'Δημιουργία'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddAccountModal;
