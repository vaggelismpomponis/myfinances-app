import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddModal = ({ onClose, onAdd }) => {
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = type === 'expense'
        ? ['Σούπερ Μάρκετ', 'Φαγητό', 'Σπίτι', 'Μεταφορικά', 'Λογαριασμοί', 'Διασκέδαση', 'Άλλο']
        : ['Μισθός', 'Δώρο', 'Επενδύσεις', 'Άλλο'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || !category) return;

        setIsSubmitting(true);
        await onAdd({
            type,
            amount: parseFloat(amount),
            category,
            note
        });
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
            <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                {/* Modal Header */}
                <div className="p-4 flex justify-between items-center border-b border-gray-100">
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                        <X size={24} />
                    </button>
                    <h3 className="text-lg font-bold text-gray-800">Νέα Συναλλαγή</h3>
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
                    {/* Type Switcher */}
                    <div className="bg-gray-100 p-1 rounded-xl flex">
                        <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Έξοδο
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('income')}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Έσοδο
                        </button>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ποσό</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">€</span>
                            <input
                                type="number"
                                step="0.01"
                                inputMode="decimal"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-10 pr-4 text-3xl font-bold text-gray-800 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-gray-300"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Categories Grid */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Κατηγορία</label>
                        <div className="grid grid-cols-3 gap-3">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`py-3 px-2 rounded-xl text-sm font-medium border transition-all ${category === cat
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note Input */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Σημείωση (Προαιρετικό)</label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="π.χ. Καφές με φίλους"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="mt-auto pt-4">
                        <button
                            type="submit"
                            disabled={!amount || !category || isSubmitting}
                            className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex justify-center items-center ${!amount || !category ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : 'Αποθήκευση'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddModal;
