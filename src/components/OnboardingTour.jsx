import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    Plus,
    PieChart,
    BarChart2,
    ShieldCheck,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    X,
    Camera,
    Target,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

/* ─────────────────────────────────────────────
   Step definitions — icons, colors, gradient
───────────────────────────────────────────── */
const STEP_CONFIGS = [
    {
        titleKey: 'onboarding_welcome_title',
        descKey: 'onboarding_welcome_desc',
        Icon: Wallet,
        gradient: 'from-violet-600 via-indigo-600 to-purple-700',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        accent: '#7c3aed',
        orbColor: 'bg-violet-400',
    },
    {
        titleKey: 'onboarding_transactions_title',
        descKey: 'onboarding_transactions_desc',
        Icon: Plus,
        gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        accent: '#10b981',
        orbColor: 'bg-emerald-400',
    },
    {
        titleKey: 'onboarding_budgets_title',
        descKey: 'onboarding_budgets_desc',
        Icon: Target,
        gradient: 'from-amber-500 via-orange-500 to-rose-500',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        accent: '#f59e0b',
        orbColor: 'bg-amber-400',
    },
    {
        titleKey: 'onboarding_analytics_title',
        descKey: 'onboarding_analytics_desc',
        Icon: BarChart2,
        gradient: 'from-blue-600 via-indigo-500 to-violet-600',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        accent: '#3b82f6',
        orbColor: 'bg-blue-400',
    },
    {
        titleKey: 'onboarding_security_title',
        descKey: 'onboarding_security_desc',
        Icon: ShieldCheck,
        gradient: 'from-rose-500 via-pink-500 to-fuchsia-600',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        accent: '#f43f5e',
        orbColor: 'bg-rose-400',
    },
];

/* ─────────────────────────────────────────────
   Floating Orb decorations (pure CSS, no img)
───────────────────────────────────────────── */
const FloatingOrbs = ({ orbColor }) => (
    <>
        <div className={`absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-25 blur-2xl ${orbColor}`} />
        <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-20 blur-xl ${orbColor}`} />
        <div className={`absolute top-1/2 left-1/4 w-16 h-16 rounded-full opacity-15 blur-lg ${orbColor}`} />
    </>
);

/* ─────────────────────────────────────────────
   Step Indicator Dots
───────────────────────────────────────────── */
const StepDots = ({ total, current }) => (
    <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
            <motion.div
                key={i}
                animate={{
                    width: i === current ? 24 : 8,
                    opacity: i === current ? 1 : 0.35,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="h-2 rounded-full bg-white"
            />
        ))}
    </div>
);

/* ─────────────────────────────────────────────
   Main OnboardingTour
───────────────────────────────────────────── */
const OnboardingTour = ({ onComplete }) => {
    const { t } = useSettings();
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

    const config = STEP_CONFIGS[step];
    const isLast = step === STEP_CONFIGS.length - 1;
    const isFirst = step === 0;

    const goNext = () => {
        if (isLast) {
            onComplete();
            return;
        }
        setDirection(1);
        setStep(s => s + 1);
    };

    const goBack = () => {
        if (isFirst) return;
        setDirection(-1);
        setStep(s => s - 1);
    };

    // Slide variants — direction-aware
    const slideVariants = {
        enter: (dir) => ({
            x: dir > 0 ? 60 : -60,
            opacity: 0,
            scale: 0.96,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (dir) => ({
            x: dir > 0 ? -60 : 60,
            opacity: 0,
            scale: 0.96,
        }),
    };

    return (
        <AnimatePresence>
            {/* ── Backdrop ── */}
            <motion.div
                key="onboarding-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
            >
                {/* ── Card ── */}
                <motion.div
                    key="onboarding-card"
                    initial={{ y: 60, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 60, opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                    className="w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-[2rem] overflow-hidden shadow-2xl"
                    style={{ willChange: 'transform' }}
                >
                    {/* ── Gradient Header ── */}
                    <AnimatePresence custom={direction} mode="wait">
                        <motion.div
                            key={`header-${step}`}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                            className={`relative bg-gradient-to-br ${config.gradient} px-7 pt-8 pb-10 overflow-hidden`}
                        >
                            <FloatingOrbs orbColor={config.orbColor} />

                            {/* Skip button */}
                            <div className="relative z-10 flex justify-between items-start mb-8">
                                <StepDots total={STEP_CONFIGS.length} current={step} />
                                <button
                                    id="onboarding-skip-btn"
                                    onClick={onComplete}
                                    className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold
                                               bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5
                                               transition-all duration-150 active:scale-95"
                                >
                                    <X size={12} strokeWidth={2.5} />
                                    {t('onboarding_skip')}
                                </button>
                            </div>

                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.05, type: 'spring', stiffness: 300 }}
                                className={`relative z-10 w-20 h-20 rounded-[1.5rem] ${config.iconBg}
                                            flex items-center justify-center mb-5
                                            ring-2 ring-white/20 shadow-lg`}
                            >
                                <config.Icon size={38} className={config.iconColor} strokeWidth={1.8} />
                            </motion.div>

                            {/* Title */}
                            <motion.h2
                                initial={{ y: 8, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.08 }}
                                className="relative z-10 text-2xl font-black text-white leading-tight mb-2"
                            >
                                {t(config.titleKey)}
                            </motion.h2>

                            {/* Description */}
                            <motion.p
                                initial={{ y: 8, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.12 }}
                                className="relative z-10 text-sm text-white/80 font-medium leading-relaxed"
                            >
                                {t(config.descKey)}
                            </motion.p>
                        </motion.div>
                    </AnimatePresence>

                    {/* ── Bottom Controls ── */}
                    <div className="bg-white dark:bg-[#1a1a2e] px-6 py-5 flex items-center gap-3">
                        {/* Back button — hidden on first step */}
                        <AnimatePresence>
                            {!isFirst && (
                                <motion.button
                                    id="onboarding-back-btn"
                                    key="back-btn"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.15 }}
                                    onClick={goBack}
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                                               bg-gray-100 dark:bg-white/[0.08]
                                               text-gray-500 dark:text-white/50
                                               hover:bg-gray-200 dark:hover:bg-white/[0.14]
                                               active:scale-90 transition-all duration-150"
                                >
                                    <ArrowLeft size={20} strokeWidth={2} />
                                </motion.button>
                            )}
                        </AnimatePresence>

                        {/* Next / Finish button */}
                        <motion.button
                            id={isLast ? 'onboarding-finish-btn' : 'onboarding-next-btn'}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={goNext}
                            className={`flex-1 h-12 rounded-2xl flex items-center justify-center gap-2
                                       font-bold text-sm text-white shadow-lg
                                       bg-gradient-to-r ${config.gradient}
                                       transition-all duration-300`}
                            style={{ boxShadow: `0 4px 20px ${config.accent}55` }}
                        >
                            <span>{isLast ? t('onboarding_finish') : t('onboarding_next')}</span>
                            {!isLast && <ArrowRight size={16} strokeWidth={2.5} />}
                            {isLast && <Sparkles size={15} strokeWidth={2} />}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingTour;
