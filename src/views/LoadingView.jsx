import React from 'react';
import { Wallet } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const LoadingView = () => {
    const { t } = useSettings();
    return (
    <div className="flex flex-col items-center justify-center min-h-screen
                    mesh-bg transition-colors duration-300 overflow-hidden">

        {/* Ambient blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-72 h-72 rounded-full
                        bg-violet-600/25 blur-[80px] animate-glow-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4
                        w-48 h-48 rounded-full
                        bg-cyan-500/15 blur-[60px] animate-float pointer-events-none" />

        {/* Logo */}
        <div className="relative mb-8 animate-float">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-3xl bg-violet-600/40 blur-xl scale-110
                            animate-glow-pulse" />

            {/* Logo image */}
            <div className="relative z-10 w-24 h-24
                            flex items-center justify-center">
                <img src="/spendwise-logo.png" alt="SpendWise Logo" className="w-24 h-24 drop-shadow-xl object-contain" />
            </div>
        </div>

        {/* App name */}
        <h1 className="text-3xl font-black tracking-tight mb-1.5 gradient-text animate-fade-in">
            SpendWise
        </h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 animate-fade-in mb-10">
            {t('loading_tagline')}
        </p>

        {/* Progress bar shimmer */}
        <div className="w-32 h-1 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-1/2 rounded-full
                            bg-gradient-to-r from-violet-600 via-cyan-400 to-violet-600
                            bg-[length:200%] animate-shimmer" />
        </div>
    </div>
    );
};

export default LoadingView;









