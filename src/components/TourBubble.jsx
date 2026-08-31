import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const FloatingOrbs = ({ orbColor }) => (
    <>
        <div className={`absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-25 blur-2xl pointer-events-none ${orbColor}`} />
        <div className={`absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-20 blur-xl pointer-events-none ${orbColor}`} />
        <div className={`absolute top-1/2 left-1/4 w-16 h-16 rounded-full opacity-15 blur-lg pointer-events-none ${orbColor}`} />
    </>
);

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

const TourBubble = ({
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    tooltipProps,
    isLastStep,
    size,
}) => {
    const { t } = useSettings();
    const config = step.data || {};

    const Icon = config.Icon || (() => null);
    
    return (
        <motion.div
            {...tooltipProps}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`w-[320px] max-w-[90vw] rounded-[2rem] overflow-hidden relative shadow-2xl bg-gradient-to-br ${config.gradient || 'from-violet-600 via-indigo-600 to-purple-700'}`}
        >
            <FloatingOrbs orbColor={config.orbColor || 'bg-white'} />

            {/* Header / Progress */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
                <StepDots total={size} current={index} />
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-full">
                        {index + 1}/{size} {t('guide_getting_started') || 'Guide'}
                    </span>
                    {step.hideCloseButton !== true && (
                        <button
                            {...closeProps}
                            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 px-6 pb-6 pt-4">
                <div className={`w-12 h-12 rounded-2xl ${config.iconBg || 'bg-white/20'} flex items-center justify-center ${config.iconColor || 'text-white'} mb-5 shadow-inner`}>
                    <Icon size={24} />
                </div>
                <h3 className="text-xl font-black text-white mb-2 leading-tight">
                    {t(config.titleKey) || step.title}
                </h3>
                <p className="text-sm font-medium text-white/80 leading-relaxed">
                    {t(config.descKey) || step.content}
                </p>
            </div>

            {/* Actions */}
            <div className="relative z-10 p-2 bg-white dark:bg-surface-dark flex items-center gap-2">
                {index > 0 && (
                    <button
                        {...backProps}
                        className="w-12 h-12 rounded-[1.25rem] bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 flex flex-shrink-0 items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                )}
                
                <button
                    {...primaryProps}
                    className="flex-1 h-12 rounded-[1.25rem] bg-violet-600 hover:bg-violet-700 text-white font-bold flex items-center justify-center gap-2 transition-colors"
                    style={{ backgroundColor: config.accent }}
                >
                    {isLastStep ? t('onboarding_finish') || "Let's Go!" : t('onboarding_next') || 'Next'}
                    {!isLastStep && <ArrowRight size={16} />}
                </button>
            </div>
        </motion.div>
    );
};

export default TourBubble;
