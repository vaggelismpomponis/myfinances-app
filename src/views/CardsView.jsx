import React from 'react';
import { ArrowLeft, CreditCard, Plus } from 'lucide-react';

const CardsView = ({ onBack }) => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-fade-in p-6 pb-24">


        {/* Card Mockup */}
        <div className="w-full aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl mb-8 border border-gray-700">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="relative z-10 flex flex-col justify-between h-full text-white">
                <div className="flex justify-between items-start">
                    <div className="w-12 h-8 bg-white/20 rounded-md backdrop-blur-md"></div>
                    <span className="font-mono text-xl tracking-widest">VISA</span>
                </div>
                <div>
                    <p className="font-mono text-lg tracking-widest mb-1">•••• •••• •••• 4242</p>
                    <div className="flex justify-between items-end">
                        <p className="text-xs text-gray-400 font-medium">CARD HOLDER</p>
                        <p className="text-xs text-gray-400 font-medium">EXP 12/28</p>
                    </div>
                </div>
            </div>
        </div>

        <button className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
            <Plus size={20} /> Προσθήκη νέας κάρτας
        </button>
    </div>
);

export default CardsView;
