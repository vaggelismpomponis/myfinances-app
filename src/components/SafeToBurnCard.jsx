import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import Amount from './Amount';

const SafeToBurnCard = ({ 
    stb, 
    todayStartingBudget, 
    isGlideActive, 
    streak, 
    privacyMode, 
    t, 
    stats 
}) => {
    // Calculate percentage for the ring
    // Clamp between 0 and 100 for the SVG dash offset
    const clampedStb = Math.max(0, Math.min(stb, Math.max(todayStartingBudget, 1)));
    const percentage = todayStartingBudget > 0 ? (clampedStb / todayStartingBudget) * 100 : 0;
    
    // Determine ring color
    let ringColor = 'text-emerald-500';
    if (percentage <= 20 || stb <= 0) {
        ringColor = 'text-rose-500';
    } else if (percentage <= 50) {
        ringColor = 'text-amber-500';
    }

    const radius = 80; // smaller radius to fit inside the 56x56 container comfortably
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.45, type: 'spring' }}
            className="relative overflow-hidden rounded-[2.5rem]
                        bg-white/80 dark:bg-surface-dark3/90 backdrop-blur-xl
                        p-6 pt-8 pb-6 text-center shadow-premium border border-slate-200/80 dark:border-white/10
                        transition-all duration-300 cursor-pointer"
        >
            {/* Subtle top glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-500/20 dark:bg-violet-500/10 blur-[80px] pointer-events-none rounded-full" />

            {/* Streak Indicator */}
            {streak > 0 && !isGlideActive && (
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-5 right-5 flex items-center gap-1 bg-gradient-to-r from-orange-400 to-rose-400 text-white px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-black shadow-md z-20"
                >
                    <span>🔥 {streak} Streak</span>
                </motion.div>
            )}

            <div className="relative z-10 flex flex-col items-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-bold tracking-wide uppercase mb-2">
                    Safe-to-Burn
                </p>

                {/* Circular Progress & Amount */}
                <div className="relative flex items-center justify-center w-52 h-52">
                    {/* SVG Progress Ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                        {/* Background Ring */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            className="text-gray-100 dark:text-white/5"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                        />
                        {/* Foreground Progress Ring */}
                        <motion.circle
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            cx="100"
                            cy="100"
                            r={radius}
                            className={`${ringColor} transition-colors duration-500 drop-shadow-sm`}
                            strokeWidth="10"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            strokeDasharray={circumference}
                        />
                    </svg>

                    {/* Inner Amount Text */}
                    <div className="flex flex-col items-center justify-center z-10">
                        <div className="flex items-start justify-center gap-1">
                            {!privacyMode && <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1.5">€</span>}
                            <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums">
                                <Amount
                                    value={stb}
                                    showCurrency={false}
                                    minimumFractionDigits={2}
                                    maximumFractionDigits={2}
                                />
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Trend / Glide Indicator */}
                <div className="mt-2 h-8 flex items-center justify-center">
                    {isGlideActive ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 shadow-sm animate-pulse">
                            <Sparkles size={14} className="text-amber-500" />
                            <span>Glide Active</span>
                        </div>
                    ) : (
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                                       ${stats.trend === 'below' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' :
                                stats.trend === 'above' ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' :
                                    'text-gray-600 bg-gray-50 dark:bg-surface-dark2'}`}>
                            {stats.trend === 'below' && <TrendingDown size={14} />}
                            {stats.trend === 'above' && <TrendingUp size={14} />}
                            {stats.trend === 'neutral' && <Minus size={14} />}
                            <span>
                                {stats.diffPct}% {stats.trend === 'below' ? t('below_last_month') : stats.trend === 'above' ? t('above_last_month') : t('same_as_last_month')}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default SafeToBurnCard;
