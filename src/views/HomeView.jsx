import React from 'react';
import { Cloud, TrendingUp, TrendingDown, MoreHorizontal, Target } from 'lucide-react';
import TransactionItem from '../components/TransactionItem';
import { useSettings } from '../contexts/SettingsContext';



const HomeView = ({ balance, totalIncome, totalExpense, transactions, onDelete, onEdit, setActiveTab }) => {
    const { t } = useSettings();

    return (
        <div className="space-y-6 pb-24 animate-fade-in">
            {/* Header / Balance Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-32 h-32 bg-indigo-400 opacity-20 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-indigo-100 text-sm font-medium">{t('total_balance')}</p>
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
                                <span className="text-xs font-semibold">{t('income')}</span>
                            </div>
                            <p className="text-lg font-semibold text-white">
                                {totalIncome.toLocaleString('el-GR', { minimumFractionDigits: 0 })}€
                            </p>
                        </div>
                        <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                            <div className="flex items-center gap-2 mb-1 text-red-300">
                                <div className="p-1 bg-red-400/20 rounded-full"><TrendingDown size={14} /></div>
                                <span className="text-xs font-semibold">{t('expense')}</span>
                            </div>
                            <p className="text-lg font-semibold text-white">
                                {totalExpense.toLocaleString('el-GR', { minimumFractionDigits: 0 })}€
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: Target, label: t('budgets'), action: 'budgets' },
                    { icon: TrendingUp, label: t('goals'), action: 'goals' },
                    { icon: MoreHorizontal, label: t('more'), action: 'profile' }
                ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2">
                        <button
                            onClick={() => setActiveTab(item.action)}
                            className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-105 transition-all shadow-sm border border-gray-100 dark:border-slate-700"
                        >
                            <item.icon size={22} />
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.label}</span>
                    </div>
                ))}
            </div>

            {/* Recent Transactions */}
            <div>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">{t('recent')}</h2>
                    <button onClick={() => setActiveTab('history')} className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">{t('all')}</button>
                </div>

                <div className="space-y-3">
                    {transactions.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700">
                            <p className="text-gray-400 dark:text-gray-500">{t('no_transactions')}</p>
                        </div>
                    ) : (
                        transactions.slice(0, 5).map(transactionItem => (
                            <TransactionItem key={transactionItem.id} transaction={transactionItem} onDelete={onDelete} onEdit={onEdit} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeView;
