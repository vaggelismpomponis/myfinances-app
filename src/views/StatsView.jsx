import React, { useState, useMemo } from 'react';
import Card from '../components/Card';
import CategoryIcon from '../components/CategoryIcon';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import { Filter, Calendar } from 'lucide-react';

const StatsView = ({ transactions }) => {
    const [timeRange, setTimeRange] = useState('thisMonth'); // 'thisMonth', 'lastMonth', 'year', 'all'

    // 1. Filter Transactions based on Time Range
    const filteredTransactions = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return transactions.filter(t => {
            const tDate = new Date(t.date);

            if (timeRange === 'thisMonth') {
                return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
            }
            if (timeRange === 'lastMonth') {
                const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                return tDate.getMonth() === lastMonthDate.getMonth() && tDate.getFullYear() === lastMonthDate.getFullYear();
            }
            if (timeRange === 'year') {
                return tDate.getFullYear() === currentYear;
            }
            return true;
        });
    }, [transactions, timeRange]);

    // 2. Prepare Chart Data (Cumulative Spending Trend)
    const chartData = useMemo(() => {
        // Sort by date ascending
        const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Group by day and calculate cumulative
        const dailyData = {};
        let cumulative = 0;

        sorted.forEach(t => {
            if (t.type !== 'expense') return;

            const dateStr = new Date(t.date).toLocaleDateString('el-GR', { day: '2-digit', month: 'short' });
            cumulative += t.amount;

            // Just take the last value for the day if multiple exist, effectively updating the running total
            dailyData[dateStr] = cumulative;
        });

        // specific formatting for rechart
        return Object.entries(dailyData).map(([date, total]) => ({
            date,
            amount: total
        }));
    }, [filteredTransactions]);

    // 3. Group expenses by category (Existing Logic adapted)
    const expensesByCategory = useMemo(() => {
        const groups = {};
        filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
            groups[t.category] = (groups[t.category] || 0) + t.amount;
        });
        return Object.entries(groups).sort((a, b) => b[1] - a[1]);
    }, [filteredTransactions]);

    const totalExpense = useMemo(() => filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), [filteredTransactions]);
    const maxExpense = expensesByCategory.length > 0 ? expensesByCategory[0][1] : 1;

    const TimeFilterButton = ({ value, label }) => (
        <button
            onClick={() => setTimeRange(value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${timeRange === value
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="pb-24 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Ανάλυση</h2>
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl flex gap-1">
                    <Calendar size={16} className="text-gray-400 ml-2 my-auto" />
                </div>
            </div>

            {/* Date Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <TimeFilterButton value="thisMonth" label="Αυτός ο μήνας" />
                <TimeFilterButton value="lastMonth" label="Προηγ. Μήνας" />
                <TimeFilterButton value="year" label="Φέτος" />
                <TimeFilterButton value="all" label="Όλα" />
            </div>

            {/* Total Expense Card */}
            <Card className="mb-8 bg-gray-900 text-white border-gray-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-5 rounded-full blur-2xl"></div>
                <p className="text-gray-400 text-sm mb-1">Σύνολο Εξόδων</p>
                <h3 className="text-3xl font-bold">{totalExpense.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</h3>
            </Card>

            {/* Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 h-64">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Τάση Εξόδων</h3>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                minTickGap={30}
                            />
                            <YAxis
                                hide
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorAmount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                        Δεν υπάρχουν δεδομένα για εμφάνιση
                    </div>
                )}
            </div>

            {/* Categories Breakdown */}
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Κατηγορίες</h3>
            <div className="space-y-6">
                {expensesByCategory.length === 0 ? (
                    <p className="text-gray-500 text-center py-10 opacity-50">Δεν υπάρχουν έξοδα σε αυτή την περίοδο.</p>
                ) : (
                    expensesByCategory.map(([cat, amount]) => (
                        <div key={cat}>
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-2">
                                    <CategoryIcon category={cat} type="expense" />
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{cat}</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">{amount.toFixed(2)}€</span>
                            </div>
                            <div className="h-3 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
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
