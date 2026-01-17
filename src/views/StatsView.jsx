import React, { useMemo } from 'react';
import Card from '../components/Card';
import CategoryIcon from '../components/CategoryIcon';

const StatsView = ({ transactions }) => {
    // Group expenses by category
    const expensesByCategory = useMemo(() => {
        const groups = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            groups[t.category] = (groups[t.category] || 0) + t.amount;
        });
        return Object.entries(groups).sort((a, b) => b[1] - a[1]);
    }, [transactions]);

    const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), [transactions]);
    const maxExpense = expensesByCategory.length > 0 ? expensesByCategory[0][1] : 1;

    return (
        <div className="pb-24 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ανάλυση Εξόδων</h2>

            {/* Total Expense Card */}
            <Card className="mb-8 bg-gray-900 text-white border-gray-800">
                <p className="text-gray-400 text-sm mb-1">Σύνολο Εξόδων</p>
                <h3 className="text-3xl font-bold">{totalExpense.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</h3>
            </Card>

            <div className="space-y-6">
                {expensesByCategory.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">Δεν υπάρχουν έξοδα για ανάλυση.</p>
                ) : (
                    expensesByCategory.map(([cat, amount]) => (
                        <div key={cat}>
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2">
                                    <CategoryIcon category={cat} type="expense" />
                                    <span className="font-semibold text-gray-700">{cat}</span>
                                </div>
                                <span className="font-bold text-gray-900">{amount.toFixed(2)}€</span>
                            </div>
                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${(amount / maxExpense) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StatsView;
