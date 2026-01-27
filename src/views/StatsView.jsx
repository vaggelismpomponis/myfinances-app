import React, { useState, useMemo } from 'react'; // Updated StatsView
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
    AreaChart,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { Filter, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

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

    // 2. Trend Data (Cumulative/Daily)
    const trendData = useMemo(() => {
        const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        const dailyData = {};

        sorted.forEach(t => {
            const dateStr = new Date(t.date).toLocaleDateString('el-GR', { day: '2-digit', month: 'short' });

            if (!dailyData[dateStr]) dailyData[dateStr] = { date: dateStr, income: 0, expense: 0 };

            if (t.type === 'income') dailyData[dateStr].income += t.amount;
            if (t.type === 'expense') dailyData[dateStr].expense += t.amount;
        });

        return Object.values(dailyData);
    }, [filteredTransactions]);

    // 3. Category Data for Pie Chart
    const categoryData = useMemo(() => {
        const groups = {};
        filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
            groups[t.category] = (groups[t.category] || 0) + t.amount;
        });

        return Object.entries(groups)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions]);

    // 4. Totals
    const totalIncome = useMemo(() => filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0), [filteredTransactions]);
    const totalExpense = useMemo(() => filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), [filteredTransactions]);
    const cashFlow = totalIncome - totalExpense;

    const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6'];

    const TimeFilterButton = ({ value, label }) => (
        <button
            onClick={() => setTimeRange(value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${timeRange === value
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="pb-24 animate-fade-in">


            {/* Date Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <TimeFilterButton value="thisMonth" label="Αυτός ο μήνας" />
                <TimeFilterButton value="lastMonth" label="Προηγ. Μήνας" />
                <TimeFilterButton value="year" label="Φέτος" />
                <TimeFilterButton value="all" label="Όλα" />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                            <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Έσοδα</p>
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{totalIncome.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</h3>
                </Card>
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-red-100 dark:bg-red-800 rounded-lg">
                            <TrendingDown size={14} className="text-red-600 dark:text-red-400" />
                        </div>
                        <p className="text-xs font-bold text-red-800 dark:text-red-300">Έξοδα</p>
                    </div>
                    <h3 className="text-xl font-bold text-red-900 dark:text-red-100">{totalExpense.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}</h3>
                </Card>
            </div>

            {/* Cash Flow Chart */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8 h-72">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Ροή Χρημάτων</h3>
                {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                            />
                            <Bar dataKey="income" name="Έσοδα" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expense" name="Έξοδα" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                        Δεν υπάρχουν δεδομένα
                    </div>
                )}
            </div>

            {/* Category Distribution (Donut) */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Κατανομή Εξόδων</h3>
                <div className="h-64 flex flex-col items-center">
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => value.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                            Δεν υπάρχουν δεδομένα
                        </div>
                    )}
                </div>
            </div>

            {/* Top Categories List */}
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Κορυφαίες Κατηγορίες</h3>
            <div className="space-y-4">
                {categoryData.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 opacity-50">Δεν υπάρχουν έξοδα.</p>
                ) : (
                    categoryData.map((cat, index) => (
                        <div key={cat.name} className="bg-white dark:bg-gray-800 p-3 rounded-2xl flex justify-between items-center shadow-sm border border-gray-50 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-2 h-8 rounded-full"
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></div>
                                <div className="flex items-center gap-2">
                                    <CategoryIcon category={cat.name} type="expense" />
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{cat.name}</span>
                                </div>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">{cat.value.toFixed(2)}€</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StatsView;
