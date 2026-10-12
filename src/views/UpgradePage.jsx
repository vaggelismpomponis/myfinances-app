import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Infinity, TrendingUp, ScanLine, Bell,
    Tags, Fingerprint, Download, Headphones, Repeat,
    Check, ShieldCheck, CheckCircle2,
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../supabase';
import { isNative } from '../utils/platform';
import { Browser } from '@capacitor/browser';

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const MONTHLY_PRICE = 2.99;
const YEARLY_PRICE = 29.99;
const YEARLY_PER_MO = (YEARLY_PRICE / 12).toFixed(2);

/* ─────────────────────────────────────────────────────────────
   FEATURES DATA
───────────────────────────────────────────────────────────── */
const getFeatures = (t) => [
    {
        icon: Infinity,
        title: t('pro_feature_1') || 'Απεριόριστα budgets & στόχοι',
        desc: t('pro_feature_1_desc') || 'Χωρίς όρια στις κατηγορίες και τους στόχους σου',
    },
    {
        icon: Bell,
        title: t('pro_feature_bank_sms') || t('auto_bank_sms') || 'Αυτόματη καταγραφή SMS & Τραπεζών',
        desc: t('pro_feature_bank_sms_desc') || t('auto_bank_sms_desc') || 'Google Pay, Revolut, Winbank, Alpha κ.α. Μόνο πραγματικές συναλλαγές',
    },
    {
        icon: TrendingUp,
        title: t('pro_feature_2') || 'Πλήρης ανάλυση & ετήσιες τάσεις',
        desc: t('pro_feature_2_desc') || 'Λεπτομερή γραφήματα και τάσεις ανά έτος',
    },
    {
        icon: ScanLine,
        title: t('pro_feature_3') || 'Μαζική σάρωση αποδείξεων (AI)',
        desc: t('pro_feature_3_desc') || 'Σκάναρε πολλές αποδείξεις με AI αυτόματα',
    },
    {
        icon: Tags,
        title: t('pro_feature_4') || 'Προσαρμοσμένες κατηγορίες',
        desc: t('pro_feature_4_desc') || 'Δημιούργησε τις δικές σου κατηγορίες',
    },
    {
        icon: Fingerprint,
        title: t('pro_feature_5') || 'Βιομετρικό κλείδωμα',
        desc: t('pro_feature_5_desc') || 'Face ID & Touch ID για πλήρη ασφάλεια',
    },
    {
        icon: Download,
        title: t('pro_feature_6') || 'Εξαγωγή δεδομένων (CSV/JSON)',
        desc: t('pro_feature_6_desc') || 'Κατέβασε CSV / JSON για Excel ή λογιστή',
    },
    {
        icon: Headphones,
        title: t('pro_feature_7') || 'Priority υποστήριξη',
        desc: t('pro_feature_7_desc') || 'Άμεση βοήθεια μέσω email',
    },
    {
        icon: Repeat,
        title: t('pro_feature_8') || 'Επαναλαμβανόμενες Συναλλαγές',
        desc: t('pro_feature_8_desc') || 'Αυτόματη καταχώρηση πάγιων εξόδων',
    },
];

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

const IconBadge = ({ Icon, isAmber }) => (
    <div
        className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
            isAmber
                ? 'bg-amber-50 text-amber-600 border border-amber-200/80 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/20'
                : 'bg-violet-50 text-violet-600 border border-violet-200/80 dark:bg-violet-400/10 dark:text-violet-400 dark:border-violet-400/20'
        }`}
    >
        <Icon size={19} strokeWidth={1.9} />
    </div>
);

const FeatureRow = ({ feature, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.12 + index * 0.035, type: 'spring', stiffness: 260, damping: 28 }}
        className="flex items-center gap-3.5 sm:gap-4 py-3.5 border-b border-gray-200/70 dark:border-white/[0.07] last:border-b-0"
    >
        <IconBadge Icon={feature.icon} isAmber={index % 2 === 0} />
        <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-gray-900 dark:text-white leading-snug">
                {feature.title}
            </p>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed font-normal mt-0.5">
                {feature.desc}
            </p>
        </div>
    </motion.div>
);

const PricingCard = ({ label, price, sub, badge, selected, onSelect }) => (
    <motion.button
        type="button"
        onClick={onSelect}
        whileTap={{ scale: 0.985 }}
        className={`w-full text-left rounded-2xl p-4 transition-all duration-200 cursor-pointer border ${
            selected
                ? 'bg-violet-50/80 dark:bg-[#1e1e32] border-violet-600 dark:border-violet-500 shadow-md shadow-violet-500/10 dark:shadow-violet-500/20 ring-1 ring-violet-500'
                : 'bg-white hover:bg-gray-50/80 dark:bg-[#151522] dark:hover:bg-[#1a1a2b] border-gray-200/90 dark:border-white/[0.08] shadow-xs'
        }`}
    >
        <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-black text-gray-900 dark:text-white tracking-tight">
                        {label}
                    </span>
                    {badge && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap
                                       bg-emerald-50 text-emerald-700 border border-emerald-200
                                       dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30">
                            {badge}
                        </span>
                    )}
                </div>
                <p className="text-[13px] font-semibold text-gray-600 dark:text-gray-300">
                    {price}
                </p>
                {sub && (
                    <div className="flex items-center gap-1.5 mt-1">
                        <ShieldCheck size={12} className="text-amber-500 shrink-0" strokeWidth={2.4} />
                        <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                            {sub}
                        </span>
                    </div>
                )}
            </div>
            <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all border ${
                selected
                    ? 'bg-violet-600 border-violet-600 text-white shadow-xs'
                    : 'border-gray-300 dark:border-white/25 bg-transparent'
            }`}>
                {selected && <Check size={13} strokeWidth={3} className="text-white" />}
            </div>
        </div>
    </motion.button>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const UpgradePage = ({ onBack }) => {
    const { closeUpgradeModal } = useSubscription();
    const { theme, t } = useSettings();
    const isDark = theme === 'dark';
    const [billing, setBilling] = useState('yearly');
    const [loading, setLoading] = useState(false);
    const features = getFeatures(t);

    const handleBack = () => {
        closeUpgradeModal();
        onBack?.();
    };

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.auth.getUser();
            const user = data?.user;
            if (!user) return;
            const baseUrl = billing === 'yearly'
                ? 'https://buy.stripe.com/3cI8wPgtNcy21Z03Rh1gs00'
                : 'https://buy.stripe.com/00wfZh5P941w8nocnN1gs01';
            const checkoutUrl = `${baseUrl}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email)}`;

            if (isNative()) {
                sessionStorage.setItem('pending_stripe_checkout', 'true');
                await Browser.open({ url: checkoutUrl, windowName: '_blank' });
            } else {
                window.location.href = checkoutUrl;
            }
        } catch (e) {
            console.error('Error opening checkout:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="h-full flex flex-col overflow-hidden relative bg-gray-50 dark:bg-[#0d0d14] text-gray-900 dark:text-white transition-colors duration-200"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        >
            {/* ══ STICKY HEADER ══ */}
            <div
                className="shrink-0 flex items-center gap-3 px-4 sm:px-6 py-3.5 z-40
                           bg-white/90 dark:bg-[#0d0d14]/90 backdrop-blur-xl
                           border-b border-gray-200/80 dark:border-white/[0.08] transition-colors"
                style={{
                    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
                }}
            >
                <button
                    type="button"
                    onClick={handleBack}
                    className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all cursor-pointer
                               bg-gray-100 hover:bg-gray-200 text-gray-700
                               dark:bg-white/10 dark:hover:bg-white/15 dark:text-white/90 shadow-2xs"
                    aria-label="Back"
                >
                    <ArrowLeft size={17} strokeWidth={2.4} />
                </button>
                <h1 className="text-[17px] font-black text-gray-900 dark:text-white tracking-tight font-display">
                    {t('plan_upgrade') || t('upgrade_to_pro') || 'Αναβάθμιση πλάνου'}
                </h1>
            </div>

            {/* ══ SCROLLABLE BODY ══ */}
            <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ paddingBottom: 140 }}>
                <div className="max-w-2xl lg:max-w-3xl mx-auto w-full px-4 sm:px-6">

                    {/* Plan tabs */}
                    <div className="flex items-center gap-1.5 pt-4 pb-4">
                        <div className="inline-flex p-1 rounded-full bg-gray-200/80 dark:bg-white/[0.07] border border-gray-300/50 dark:border-white/[0.06]">
                            <button
                                type="button"
                                className="rounded-full px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-white/50 cursor-default"
                            >
                                {t('plan_free') || 'Δωρεάν'}
                            </button>
                            <button
                                type="button"
                                className={`rounded-full px-5 py-1.5 text-xs font-black shadow-xs ${
                                    isDark
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-white text-violet-700 shadow-sm'
                                }`}
                            >
                                {t('plan_pro') || 'Pro'}
                            </button>
                        </div>
                    </div>

                    {/* Hero card */}
                    <div className="pb-5">
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                            className={`rounded-3xl overflow-hidden relative border transition-all duration-300 ${
                                isDark
                                    ? 'bg-gradient-to-br from-[#16122c] via-[#201540] to-[#0f0d1e] border-violet-500/25 shadow-2xl shadow-violet-950/50 text-white'
                                    : 'bg-gradient-to-br from-[#4f46e5] via-[#5b50e6] to-[#7c3aed] border-white/20 shadow-xl shadow-indigo-500/25 text-white'
                            }`}
                        >
                            {/* Ambient lighting glows */}
                            <div
                                className="absolute -right-16 -top-16 w-56 h-56 rounded-full pointer-events-none"
                                style={{
                                    background: 'radial-gradient(circle, rgba(245,158,11,0.22) 0%, rgba(245,158,11,0.05) 50%, transparent 70%)',
                                }}
                            />
                            <div
                                className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full pointer-events-none"
                                style={{
                                    background: isDark
                                        ? 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)'
                                        : 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                                }}
                            />
                            {/* Subtle geometric grid / card pattern */}
                            <div
                                className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"
                            />

                            <div className="relative z-10 p-5 sm:p-7 flex flex-col justify-between min-h-[200px] gap-5">
                                {/* Top row: Pill badge + Luxury frosted emblem */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase backdrop-blur-md bg-white/10 dark:bg-white/[0.08] border border-white/15 text-white shadow-xs">
                                            <ShieldCheck size={13} className="text-amber-400 shrink-0" strokeWidth={2.5} />
                                            {t('hero_card_badge') || 'SPENDWISE PRO'}
                                        </span>
                                        <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 backdrop-blur-md">
                                            {t('hero_card_status') || 'PREMIUM ACCESS'}
                                        </span>
                                    </div>

                                    {/* Polished fintech crest / seal */}
                                    <div
                                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center backdrop-blur-md bg-gradient-to-br from-amber-400/30 to-amber-600/20 border border-amber-300/40 shadow-md shadow-amber-500/20 shrink-0"
                                    >
                                        <ShieldCheck size={24} className="text-amber-300 drop-shadow-sm" strokeWidth={2.3} />
                                    </div>
                                </div>

                                {/* Middle row: Headline & Feature Highlights */}
                                <div className="space-y-3">
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight font-display">
                                            {t('hero_card_title') || 'SpendWise Pro'}
                                        </h2>
                                        <p className="text-[13px] sm:text-[14px] text-white/80 font-normal leading-relaxed max-w-xl mt-1">
                                            {t('hero_card_tagline') || 'Πλήρης οικονομικός έλεγχος με απεριόριστα εργαλεία & αυτόματη καταγραφή'}
                                        </p>
                                    </div>

                                    {/* 3 Frosted Quick-Pills */}
                                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white/10 dark:bg-white/[0.06] border border-white/10 backdrop-blur-md text-white/95">
                                            <Infinity size={13} className="text-amber-300 shrink-0" strokeWidth={2.5} />
                                            <span>{t('hero_chip_unlimited') || 'Απεριόριστα Budgets'}</span>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white/10 dark:bg-white/[0.06] border border-white/10 backdrop-blur-md text-white/95">
                                            <Bell size={13} className="text-emerald-300 shrink-0" strokeWidth={2.4} />
                                            <span>{t('hero_chip_automation') || 'Αυτόματα SMS & Τράπεζες'}</span>
                                        </div>
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white/10 dark:bg-white/[0.06] border border-white/10 backdrop-blur-md text-white/95">
                                            <ScanLine size={13} className="text-indigo-200 shrink-0" strokeWidth={2.4} />
                                            <span>{t('hero_chip_ai') || 'AI Σάρωση & Insights'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom row: Price display + Trial reassurance */}
                                <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none font-display">
                                            €{MONTHLY_PRICE}
                                        </span>
                                        <span className="text-[13px] font-semibold text-white/75">
                                            {t('per_month') || '/μήνα'}
                                        </span>
                                    </div>

                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 backdrop-blur-md">
                                        <CheckCircle2 size={13} className="text-emerald-300 shrink-0" strokeWidth={2.5} />
                                        <span>{t('free_trial_7_days') || 'Δωρεάν δοκιμή 7 ημερών'}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Features header */}
                    <div className="flex items-center gap-2 mt-4 mb-2">
                        <div className="w-5 h-5 rounded-full bg-amber-500/15 dark:bg-amber-400/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                            <ShieldCheck size={13} strokeWidth={2.4} />
                        </div>
                        <span className="text-[11px] font-black tracking-wider uppercase text-gray-500 dark:text-gray-400 font-display">
                            {t('what_pro_includes') || 'Τι περιλαμβάνει το Pro'}
                        </span>
                    </div>

                    {/* Feature rows */}
                    <div className="divide-y divide-gray-200/70 dark:divide-white/[0.07]">
                        {features.map((f, i) => (
                            <FeatureRow key={i} feature={f} index={i} />
                        ))}
                    </div>

                    {/* Pricing section */}
                    <div className="pt-6 pb-2">
                        <p className="text-[15px] font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                            {t('choose_plan') || 'Επίλεξε πλάνο'}
                        </p>
                        <div className="flex flex-col gap-3">
                            <PricingCard
                                label={t('plan_yearly') || 'Ετήσιο'}
                                price={`€${YEARLY_PRICE}${t('per_year') || '/χρόνο'}`}
                                sub={(t('equivalent_per_mo', { price: YEARLY_PER_MO }) || `Ισοδυναμεί με €${YEARLY_PER_MO}/μήνα`)}
                                badge={t('save_16') || 'Εξοικονόμησε 16%'}
                                selected={billing === 'yearly'}
                                onSelect={() => setBilling('yearly')}
                            />
                            <PricingCard
                                label={t('plan_monthly') || 'Μηνιαίο'}
                                price={`€${MONTHLY_PRICE}${t('per_month') || '/μήνα'}`}
                                sub={null}
                                badge={null}
                                selected={billing === 'monthly'}
                                onSelect={() => setBilling('monthly')}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ STICKY BOTTOM CTA ══ */}
            <div
                className="shrink-0 px-4 sm:px-6 absolute bottom-0 left-0 right-0 z-40 transition-colors pointer-events-none"
                style={{
                    paddingTop: 24,
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
                    background: isDark
                        ? 'linear-gradient(to top, #0d0d14 78%, rgba(13,13,20,0) 100%)'
                        : 'linear-gradient(to top, #f9fafb 78%, rgba(249,250,251,0) 100%)',
                }}
            >
                <div className="max-w-2xl lg:max-w-3xl mx-auto w-full pointer-events-auto">
                    <motion.button
                        type="button"
                        onClick={handleSubscribe}
                        disabled={loading}
                        whileHover={!loading ? { scale: 1.01 } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-base cursor-pointer transition-all duration-200 select-none shadow-xl ${
                            loading
                                ? 'opacity-70 cursor-not-allowed'
                                : isDark
                                    ? 'bg-white hover:bg-gray-100 text-slate-950 shadow-black/50'
                                    : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/30'
                        }`}
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <ShieldCheck size={18} strokeWidth={2.4} className={isDark ? 'text-slate-950' : 'text-white'} />
                                <span>{t('free_trial_7_days') || 'Δωρεάν δοκιμή 7 ημερών'}</span>
                            </>
                        )}
                    </motion.button>

                    <p className="text-center text-[12px] text-gray-400 dark:text-gray-500 mt-2 font-medium leading-relaxed">
                        {t('cancel_anytime') || 'Ακυρώνεις όποτε θες · Τιμή με ΦΠΑ'}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default UpgradePage;
