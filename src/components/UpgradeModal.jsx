import React, { useState } from 'react';
import {
    X, Check, ShieldCheck, CheckCircle2,
    Infinity, Bell, TrendingUp, ScanLine, Tags,
    Fingerprint, Download, Headphones, Repeat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../supabase';
import { isNative } from '../utils/platform';
import { Browser } from '@capacitor/browser';

const MONTHLY_PRICE = 2.99;
const YEARLY_PRICE = 29.99;
const YEARLY_SAVINGS_PERCENT = 16;
const YEARLY_PER_MO = (YEARLY_PRICE / 12).toFixed(2);

const getFeatures = (t) => [
    {
        icon: Infinity,
        title: t('pro_feature_1') || 'Απεριόριστα budgets & στόχοι',
        desc: t('pro_feature_1_desc') || 'Χωρίς όρια στις κατηγορίες και τους στόχους σου',
    },
    {
        icon: Bell,
        title: t('pro_feature_bank_sms') || t('auto_bank_sms') || 'Αυτόματη καταγραφή SMS & Τραπεζών',
        desc: t('pro_feature_bank_sms_desc') || t('auto_bank_sms_desc') || 'Google Pay, Revolut, Winbank, Alpha κ.α.',
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

const UpgradeModal = () => {
    const { t } = useSettings();
    const { isUpgradeModalOpen, closeUpgradeModal } = useSubscription();
    const [billing, setBilling] = useState('yearly');
    const [loading, setLoading] = useState(false);

    const features = getFeatures(t);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const { data } = await supabase.auth.getUser();
            const user = data?.user;
            if (!user) return;
            const link = billing === 'yearly'
                ? 'https://buy.stripe.com/3cI8wPgtNcy21Z03Rh1gs00'
                : 'https://buy.stripe.com/00wfZh5P941w8nocnN1gs01';
            const checkoutUrl = `${link}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email)}`;

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
        <AnimatePresence>
            {isUpgradeModalOpen && (
                <div
                    className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeUpgradeModal();
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                        className="w-full max-w-xl max-h-[92dvh] sm:max-h-[88dvh] bg-gray-100/95 dark:bg-surface-dark2 rounded-t-2xl sm:rounded-2xl border border-gray-300 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden text-gray-900 dark:text-white"
                    >
                        {/* ── Modal Header ── */}
                        <div className="px-5 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between shrink-0 bg-white/60 dark:bg-surface-dark2/60">
                            <div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={18} strokeWidth={2.4} className="text-amber-500 shrink-0" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        SpendWise Pro
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                                        PRO
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                                    {t('upgrade_sheet_sub') || 'Πλήρης οικονομικός έλεγχος χωρίς περιορισμούς'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeUpgradeModal}
                                aria-label="Close"
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-xl bg-gray-200/60 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* ── Scrollable Body ── */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">

                            {/* Billing Switcher */}
                            <div className="p-1 rounded-xl bg-gray-200/70 dark:bg-white/[0.08] flex gap-1 border border-gray-300/50 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setBilling('monthly')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                                        billing === 'monthly'
                                            ? 'bg-white dark:bg-surface-dark3 text-gray-950 dark:text-white shadow-xs'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    {t('monthly', 'Μηνιαία')} (€{MONTHLY_PRICE})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBilling('yearly')}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                        billing === 'yearly'
                                            ? 'bg-white dark:bg-surface-dark3 text-gray-950 dark:text-white shadow-xs'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <span>{t('yearly', 'Ετήσια')} (€{YEARLY_PRICE})</span>
                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                        -{YEARLY_SAVINGS_PERCENT}%
                                    </span>
                                </button>
                            </div>

                            {/* Selected Plan Summary Card */}
                            <div className="bg-white dark:bg-surface-dark3 rounded-xl p-4 border border-gray-200 dark:border-white/10 flex items-center justify-between gap-3 shadow-xs">
                                <div>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                            {billing === 'yearly' ? `€${YEARLY_PRICE}` : `€${MONTHLY_PRICE}`}
                                        </span>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {billing === 'yearly' ? `/ ${t('yearly', 'έτος')}` : `/ ${t('monthly', 'μήνα')}`}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                        {billing === 'yearly'
                                            ? `≈ €${YEARLY_PER_MO}/μήνα · Κέρδος ${YEARLY_SAVINGS_PERCENT}%`
                                            : t('cancel_anytime') || 'Ακυρώνεις όποτε θες'}
                                    </p>
                                </div>

                                <div className="text-right shrink-0">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                        <CheckCircle2 size={13} className="shrink-0" />
                                        <span>7 ημέρες δωρεάν</span>
                                    </span>
                                </div>
                            </div>

                            {/* Pro Features Included */}
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-gray-500 dark:text-white/60 uppercase tracking-widest px-1 mb-1.5">
                                    {t('what_included') || 'Τι περιλαμβάνει το Pro'}
                                </p>
                                <div className="bg-white dark:bg-surface-dark3 rounded-xl border border-gray-200 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/[0.06] overflow-hidden shadow-xs">
                                    {features.map((feat) => {
                                        const Icon = feat.icon;
                                        return (
                                            <div key={feat.title} className="flex items-start gap-3 p-3 transition-colors">
                                                <Icon size={16} strokeWidth={2.2} className="text-gray-700 dark:text-gray-300 shrink-0 mt-0.5" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                                                        {feat.title}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed mt-0.5">
                                                        {feat.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>

                        {/* ── Modal Footer ── */}
                        <div className="p-4 sm:p-5 border-t border-gray-200 dark:border-white/10 bg-gray-50/90 dark:bg-surface-dark2 space-y-2 shrink-0">
                            <button
                                type="button"
                                onClick={handleSubscribe}
                                disabled={loading}
                                className="w-full py-3 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-white dark:border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <ShieldCheck size={16} strokeWidth={2.2} />
                                        <span>{t('upgrade_cta_checkout') || 'Δωρεάν δοκιμή 7 ημερών'}</span>
                                    </>
                                )}
                            </button>

                            <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 font-medium">
                                {t('cancel_anytime') || 'Ακυρώνεις όποτε θες'} · {t('vat_included') || 'Τιμή με ΦΠΑ'} · Stripe
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UpgradeModal;
