import React from 'react';
import { ArrowLeft, Target, TrendingUp } from 'lucide-react';

const GoalsView = ({ onBack }) => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in p-6 pb-24">
        <div className="flex items-center gap-4 mb-8">
            <button
                onClick={onBack}
                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-600 dark:text-gray-300"
            >
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Οικονομικοί Στόχοι</h2>
        </div>

        <div className="grid gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                            <Target size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Διακοπές</h3>
                            <p className="text-xs text-gray-500">Στόχος: 1.500€</p>
                        </div>
                    </div>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg text-xs">45%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[45%] rounded-full"></div>
                </div>
                <p className="text-right text-xs font-semibold text-gray-500 mt-2">675€ / 1.500€</p>
            </div>

            <button className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-400 hover:text-indigo-500 hover:border-indigo-300 transition-colors gap-2">
                <TrendingUp size={32} />
                <span className="font-medium">Δημιουργία νέου στόχου</span>
            </button>
        </div>
    </div>
);

export default GoalsView;
