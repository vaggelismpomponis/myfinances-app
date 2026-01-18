import React from 'react';
import { ArrowLeft, Wallet } from 'lucide-react';

const WalletView = ({ onBack }) => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in p-6 pb-24">
        <div className="flex items-center gap-4 mb-8">
            <button
                onClick={onBack}
                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-600 dark:text-gray-300"
            >
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Πορτοφόλι</h2>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <Wallet size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Το Πορτοφόλι μου</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                Εδώ θα μπορείς να διαχειριστείς τους τραπεζικούς λογαριασμούς και τα μετρητά σου.
            </p>
            <button className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors">
                Προσθήκη Λογαριασμού
            </button>
        </div>
    </div>
);

export default WalletView;
