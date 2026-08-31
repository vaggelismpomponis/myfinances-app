import React from 'react';
import { Shield, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';

const WillpowerLedgerCard = ({ totalSaved, futureValue }) => {
    const { privacyMode, language } = useSettings();
    const locale = language === 'el' ? 'el-GR' : 'en-US';

    const formatMoney = (cents) => {
        if (privacyMode) return '****';
        return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(cents / 100);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2rem] p-[2px] bg-gradient-to-r from-violet-500/50 via-emerald-500/50 to-violet-500/50 animate-gradient-xy shadow-premium"
        >
            <div className="relative bg-white dark:bg-surface-dark2 rounded-[2rem] p-6 h-full border border-transparent">
                {/* Background ambient glow */}
                <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-400/[0.12] dark:bg-emerald-500/[0.08] blur-[60px] rounded-full pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                        <Shield size={20} className="fill-emerald-600/20" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-tight">Willpower Ledger</h2>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Resisted Impulses</p>
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 relative z-10">
                    {/* Current Saved */}
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Total Saved</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">
                            {formatMoney(totalSaved)}
                        </p>
                    </div>

                    {/* Arrow / Multiplier */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">
                            <ArrowRight size={14} />
                        </div>
                        <span className="text-[9px] font-bold text-emerald-500 mt-1 uppercase">10 Yrs</span>
                    </div>

                    {/* Future Value */}
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 flex justify-end items-center gap-1">
                            <TrendingUp size={10} /> Future Value
                        </p>
                        <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-emerald-400 dark:to-emerald-600 tabular-nums tracking-tighter">
                            {formatMoney(futureValue)}
                        </p>
                    </div>
                </div>

                {/* Subtext */}
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5 relative z-10">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                        Assuming a <strong className="text-gray-700 dark:text-gray-300">7%</strong> annual compounding return, your resisted impulses will grow massively.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default WillpowerLedgerCard;
