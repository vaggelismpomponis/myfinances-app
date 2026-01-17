import React from 'react';
import { Cloud, TrendingUp, TrendingDown, Wallet, CreditCard, MoreHorizontal } from 'lucide-react';
import TransactionItem from '../components/TransactionItem';

const HomeView = ({ balance, totalIncome, totalExpense, transactions, onDelete, setActiveTab }) => (
    <div className="space-y-6 pb-24 animate-fade-in">
        {/* Header / Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-32 h-32 bg-indigo-400 opacity-20 rounded-full blur-2xl"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-indigo-100 text-sm font-medium">Συνολικό Υπόλοιπο</p>
                    <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-medium text-indigo-50">
                        <Cloud size={10} /> Sync On
                    </div>
                </div>

                <h1 className="text-4xl font-bold tracking-tight mb-6">
                    {balance.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                </h1>

                <div className="flex gap-4">
                    <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1 text-emerald-300">
                            <div className="p-1 bg-emerald-400/20 rounded-full"><TrendingUp size={14} /></div>
                            <span className="text-xs font-semibold">Έσοδα</span>
                        </div>
                        <p className="text-lg font-semibold text-white">
                            {totalIncome.toLocaleString('el-GR', { minimumFractionDigits: 0 })}€
                        </p>
                    </div>
                    <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <div className="flex items-center gap-2 mb-1 text-red-300">
                            <div className="p-1 bg-red-400/20 rounded-full"><TrendingDown size={14} /></div>
                            <span className="text-xs font-semibold">Έξοδα</span>
                        </div>
                        <p className="text-lg font-semibold text-white">
                            {totalExpense.toLocaleString('el-GR', { minimumFractionDigits: 0 })}€
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4">
            {[
                { icon: Wallet, label: 'Πορτοφόλι' },
                { icon: CreditCard, label: 'Κάρτες' },
                { icon: TrendingUp, label: 'Στόχοι' },
                { icon: MoreHorizontal, label: 'Περισ.' }
            ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                    <button className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:scale-105 transition-all shadow-sm border border-gray-100">
                        <item.icon size={22} />
                    </button>
                    <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                </div>
            ))}
        </div>

        {/* Recent Transactions */}
        <div>
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="text-lg font-bold text-gray-800">Πρόσφατα</h2>
                <button onClick={() => setActiveTab('history')} className="text-sm text-indigo-600 font-semibold">Όλα</button>
            </div>

            <div className="space-y-3">
                {transactions.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400">Δεν υπάρχουν συναλλαγές ακόμη.</p>
                    </div>
                ) : (
                    transactions.slice(0, 5).map(t => (
                        <TransactionItem key={t.id} transaction={t} onDelete={onDelete} />
                    ))
                )}
            </div>
        </div>
    </div>
);

export default HomeView;
