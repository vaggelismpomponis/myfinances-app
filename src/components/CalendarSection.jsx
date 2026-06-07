import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
    X, TrendingDown, ArrowDownLeft, TrendingUp 
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import Amount from './Amount';
import CategoryIcon from './CategoryIcon';

const COLORS = [
    '#7c3aed', // Violet
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#ef4444'  // Red
];

const CalendarSection = ({ 
    transactions, 
    calendarYear: viewYear, 
    calendarMonth: viewMonth, 
    setCalendarYear: setViewYear, 
    setCalendarMonth: setViewMonth 
}) => {
    const { t, language, privacyMode } = useSettings();
    const locale = language === 'el' ? 'el-GR' : 'en-US';

    // Day detail sheet modal state
    const [selectedDay, setSelectedDay] = useState(null);

    const months = useMemo(() => [
        { id: 0, name: t('january') }, { id: 1, name: t('february') }, { id: 2, name: t('march') },
        { id: 3, name: t('april') }, { id: 4, name: t('may') }, { id: 5, name: t('june') },
        { id: 6, name: t('july') }, { id: 7, name: t('august') }, { id: 8, name: t('september') },
        { id: 9, name: t('october') }, { id: 10, name: t('november') }, { id: 11, name: t('december') }
    ], [t]);

    const weekdays = useMemo(() => [
        t('mon'), t('tue'), t('wed'), t('thu'), t('fri'), t('sat'), t('sun')
    ], [t]);

    // Go to previous month
    const handlePrevMonth = () => {
        setViewMonth(prev => {
            if (prev === 0) {
                setViewYear(y => y - 1);
                return 11;
            }
            return prev - 1;
        });
    };

    // Go to next month
    const handleNextMonth = () => {
        setViewMonth(prev => {
            if (prev === 11) {
                setViewYear(y => y + 1);
                return 0;
            }
            return prev + 1;
        });
    };

    // Calculate days of the current viewed month
    const daysInMonth = useMemo(() => {
        return new Date(viewYear, viewMonth + 1, 0).getDate();
    }, [viewYear, viewMonth]);

    // Calculate start offset (Monday-indexed start day)
    const startOffset = useMemo(() => {
        const firstDayVal = new Date(viewYear, viewMonth, 1).getDay();
        // firstDayVal is 0 (Sun) - 6 (Sat)
        // We want Monday (0) to Sunday (6)
        return (firstDayVal + 6) % 7;
    }, [viewYear, viewMonth]);

    // Map all expenses of the current viewed month by day number
    const dailyExpensesMap = useMemo(() => {
        const map = {};
        transactions.forEach(tx => {
            if (tx.type !== 'expense') return;
            const d = new Date(tx.date);
            if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
                const day = d.getDate();
                if (!map[day]) map[day] = [];
                map[day].push(tx);
            }
        });
        return map;
    }, [transactions, viewYear, viewMonth]);

    // Total monthly expenses viewed
    const totalMonthExpenses = useMemo(() => {
        let total = 0;
        Object.values(dailyExpensesMap).forEach(dayTxs => {
            dayTxs.forEach(tx => total += tx.amount);
        });
        return total;
    }, [dailyExpensesMap]);

    // Average daily expense
    const monthlyDailyAverage = useMemo(() => {
        return totalMonthExpenses / daysInMonth;
    }, [totalMonthExpenses, daysInMonth]);

    // Detailed transactions for selected day
    const dayTransactions = useMemo(() => {
        if (selectedDay === null) return [];
        return dailyExpensesMap[selectedDay] || [];
    }, [dailyExpensesMap, selectedDay]);

    // Total spent on the selected day
    const dayTotalSpent = useMemo(() => {
        return dayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    }, [dayTransactions]);

    // Categories spending breakdown for selected day
    const dayCategoriesBreakdown = useMemo(() => {
        const catMap = {};
        dayTransactions.forEach(tx => {
            catMap[tx.category] = (catMap[tx.category] || 0) + tx.amount;
        });
        return Object.entries(catMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [dayTransactions]);

    // Comparison text with average daily spent
    const comparisonInfo = useMemo(() => {
        if (selectedDay === null) return null;
        if (monthlyDailyAverage === 0) {
            return {
                text: t('daily_avg_compare_equal'),
                percentage: 0,
                type: 'equal'
            };
        }

        if (dayTotalSpent > monthlyDailyAverage) {
            const diffPct = ((dayTotalSpent - monthlyDailyAverage) / monthlyDailyAverage) * 100;
            return {
                text: t('daily_avg_compare_higher'),
                percentage: Math.round(diffPct),
                type: 'higher'
            };
        } else if (dayTotalSpent < monthlyDailyAverage) {
            const diffPct = ((monthlyDailyAverage - dayTotalSpent) / monthlyDailyAverage) * 100;
            return {
                text: t('daily_avg_compare_lower'),
                percentage: Math.round(diffPct),
                type: 'lower'
            };
        } else {
            return {
                text: t('daily_avg_compare_equal'),
                percentage: 0,
                type: 'equal'
            };
        }
    }, [selectedDay, dayTotalSpent, monthlyDailyAverage, t]);

    // Render calendar grid items
    const calendarCells = useMemo(() => {
        const cells = [];
        
        // Blank cells before the first day of the month
        for (let i = 0; i < startOffset; i++) {
            cells.push({ id: `empty-${i}`, isPlaceholder: true });
        }

        // Active days of the month
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;

        for (let day = 1; day <= daysInMonth; day++) {
            const dayTxs = dailyExpensesMap[day] || [];
            const dayTotal = dayTxs.reduce((sum, tx) => sum + tx.amount, 0);
            const isToday = isCurrentMonth && today.getDate() === day;

            cells.push({
                id: `day-${day}`,
                day,
                isPlaceholder: false,
                isToday,
                hasExpenses: dayTxs.length > 0,
                totalSpent: dayTotal,
                transactions: dayTxs
            });
        }

        return cells;
    }, [viewYear, viewMonth, daysInMonth, startOffset, dailyExpensesMap]);

    return (
        <div className="bg-white dark:bg-surface-dark3 rounded-[2.5rem] p-6 shadow-premium border border-gray-100 dark:border-white/5 space-y-6">
            {/* Header / Month Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/20 flex items-center justify-center text-violet-600 dark:text-violet-400">
                        <CalendarIcon size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-800 dark:text-white uppercase tracking-wider">
                            {t('calendar_title')}
                        </h3>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                            {months[viewMonth]?.name} {viewYear}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-xl border border-gray-100 dark:border-white/5">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 px-1 uppercase tracking-widest">
                        {t('navigate') || 'nav'}
                    </span>
                    <button
                        onClick={handleNextMonth}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-2">
                {/* Weekday Labels */}
                <div className="grid grid-cols-7 gap-2">
                    {weekdays.map(d => (
                        <div key={d} className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase py-1 select-none">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Day Cells Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {calendarCells.map((cell, idx) => {
                        if (cell.isPlaceholder) {
                            return <div key={cell.id} className="aspect-square" />;
                        }

                        // Styles based on expenses
                        let cellClass = "bg-gray-50 dark:bg-white/[0.02] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10";
                        if (cell.hasExpenses) {
                            cellClass = "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/15 dark:border-rose-500/25 hover:bg-rose-500/20 dark:hover:bg-rose-500/30";
                        }
                        if (cell.isToday) {
                            cellClass += " ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-surface-dark3";
                        }

                        return (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                key={cell.id}
                                onClick={() => setSelectedDay(cell.day)}
                                className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-1 font-bold text-xs relative transition-all ${cellClass}`}
                            >
                                <span>{cell.day}</span>
                                {cell.hasExpenses && (
                                    <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-rose-500" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Daily Expense Bottom Sheet/Modal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {selectedDay !== null && (
                        <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
                            {/* Backdrop */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
                                onClick={() => setSelectedDay(null)} 
                            />
                            
                            {/* Sliding Bottom Sheet */}
                            <motion.div 
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="relative z-10 w-full max-w-md
                                            bg-white dark:bg-surface-dark2
                                            rounded-t-[2.5rem] shadow-2xl
                                            border-t border-x border-gray-100 dark:border-white/5
                                            max-h-[85vh] flex flex-col pointer-events-auto"
                            >
                                {/* Drag handle indicator */}
                                <div className="flex justify-center pt-4 pb-2">
                                    <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full" />
                                </div>

                                {/* Modal Header */}
                                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500">
                                            <TrendingDown size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg text-gray-900 dark:text-white capitalize">
                                                {new Date(viewYear, viewMonth, selectedDay).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' })}
                                            </h4>
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">
                                                {t('daily_stats')}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedDay(null)}
                                        className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Bottom Sheet Body */}
                                <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6 pb-[calc(2rem+env(safe-area-inset-bottom))] custom-scrollbar">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Total spent today */}
                                        <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                {t('total_spent_today')}
                                            </span>
                                            <span className="text-xl font-black text-rose-500 mt-2">
                                                <Amount value={dayTotalSpent} />
                                            </span>
                                        </div>

                                        {/* Comparison to daily average */}
                                        <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                {t('comparison')}
                                            </span>
                                            <div className="flex flex-col mt-2">
                                                {comparisonInfo && comparisonInfo.type !== 'equal' ? (
                                                    <span className={`text-xs font-black flex items-center gap-1 ${comparisonInfo.type === 'higher' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                        {comparisonInfo.type === 'higher' ? <ArrowDownLeft size={14} className="rotate-180" /> : <ArrowDownLeft size={14} />}
                                                        {comparisonInfo.percentage}%
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-black text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                        =
                                                    </span>
                                                )}
                                                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase mt-0.5 leading-none">
                                                    {comparisonInfo ? comparisonInfo.text : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Distribution for today */}
                                    {dayCategoriesBreakdown.length > 0 && (
                                        <div className="space-y-3">
                                            <h5 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                                                {t('category_distribution')}
                                            </h5>
                                            <div className="space-y-2.5">
                                                {dayCategoriesBreakdown.map((cat, idx) => {
                                                    const pct = dayTotalSpent > 0 ? (cat.value / dayTotalSpent) * 100 : 0;
                                                    return (
                                                        <div key={cat.name} className="space-y-1">
                                                            <div className="flex justify-between items-baseline text-xs font-bold text-gray-700 dark:text-gray-300">
                                                                <span className="capitalize">
                                                                    {t('cat_' + cat.name.toLowerCase()) === 'cat_' + cat.name.toLowerCase() ? cat.name : t('cat_' + cat.name.toLowerCase())}
                                                                </span>
                                                                <span>
                                                                    <Amount value={cat.value} /> ({pct.toFixed(0)}%)
                                                                </span>
                                                            </div>
                                                            <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full rounded-full transition-all duration-700"
                                                                    style={{ width: `${pct}%`, background: COLORS[idx % COLORS.length] }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Transactions list */}
                                    <div className="space-y-3">
                                        <h5 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                                            {t('stats_transactions')}
                                        </h5>
                                        {dayTransactions.length === 0 ? (
                                            <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-xs font-bold bg-gray-50 dark:bg-white/[0.01] rounded-2xl border border-dashed border-gray-200 dark:border-white/5">
                                                {t('no_expenses_day_desc')}
                                            </div>
                                        ) : (
                                            <div className="space-y-2.5">
                                                {dayTransactions.map(tx => (
                                                    <div key={tx.id}
                                                         className="flex justify-between items-center bg-gray-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-500/30 transition-all group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-white/5 shadow-sm group-hover:scale-105 transition-transform">
                                                                <CategoryIcon category={tx.category} type="expense" size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-gray-800 dark:text-white capitalize">
                                                                    {tx.note || (t('cat_' + tx.category.toLowerCase()) === 'cat_' + tx.category.toLowerCase() ? tx.category : t('cat_' + tx.category.toLowerCase()))}
                                                                </p>
                                                                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                                                    {t('cat_' + tx.category.toLowerCase()) === 'cat_' + tx.category.toLowerCase() ? tx.category : t('cat_' + tx.category.toLowerCase())}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="font-black text-rose-500 text-sm">
                                                            <Amount value={tx.amount} prefix="−" />
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

export default CalendarSection;
