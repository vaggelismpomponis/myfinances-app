import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Sparkles, Crown, ArrowRight } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const PRO_FEATURES = [
    { emoji: '📊', label: 'Full Analytics & History' },
    { emoji: '🎯', label: 'Unlimited Budgets & Goals' },
    { emoji: '🔒', label: 'Biometric App Lock' },
    { emoji: '📷', label: 'Bulk Receipt Scanner' },
];

const PaymentSuccessView = ({ onContinue }) => {
    const { t } = useSettings();
    const hasAnimated = useRef(false);

    // Clean ?upgraded=true from the URL without a page reload
    useEffect(() => {
        if (!hasAnimated.current) {
            hasAnimated.current = true;
            const url = new URL(window.location.href);
            url.searchParams.delete('upgraded');
            window.history.replaceState({}, '', url.toString());
        }
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700 px-6 py-12 animate-fade-in">

            {/* Glow blobs */}
            <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-fuchsia-400/20 blur-3xl pointer-events-none" />

            {/* Badge */}
            <div className="relative mb-6 flex items-center justify-center w-28 h-28">
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping-pulse" />
                <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/30" />
                <Crown size={48} className="relative text-amber-300 drop-shadow-lg" />
            </div>

            {/* Headline */}
            <div className="text-center mb-2">
                <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/60 mb-3">
                    <Sparkles size={12} />
                    {t('payment_success_label', 'Welcome to the club')}
                    <Sparkles size={12} />
                </span>
                <h1 className="text-4xl font-black text-white mb-2 leading-tight">
                    {t('payment_success_title', "You're Pro!")}
                </h1>
                <p className="text-white/70 text-[15px] font-medium max-w-xs mx-auto leading-relaxed">
                    {t('payment_success_subtitle', 'Your subscription is active. All Pro features are now unlocked.')}
                </p>
            </div>

            {/* Divider */}
            <div className="w-16 h-px bg-white/20 my-6" />

            {/* Feature list */}
            <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-sm">
                {PRO_FEATURES.map(({ emoji, label }) => (
                    <div
                        key={label}
                        className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2.5"
                    >
                        <span className="text-lg">{emoji}</span>
                        <span className="text-white/90 text-[11px] font-semibold leading-tight">{label}</span>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <button
                onClick={onContinue}
                className="group flex items-center gap-3 bg-white text-violet-700 font-black text-[15px] px-8 py-4 rounded-2xl shadow-2xl shadow-black/30 active:scale-95 transition-all hover:shadow-white/20"
            >
                <CheckCircle2 size={20} className="text-violet-500" />
                {t('payment_success_cta', 'Start using Pro')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="mt-5 text-white/40 text-[11px] font-medium">
                {t('payment_success_manage', 'Manage your subscription anytime from your profile.')}
            </p>
        </div>
    );
};

export default PaymentSuccessView;
