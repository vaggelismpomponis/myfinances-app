import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Zap, Infinity, TrendingUp, ScanLine,
    Tags, Fingerprint, Download, Headphones, Repeat,
    Check,
} from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../supabase';

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const MONTHLY_PRICE = 2.99;
const YEARLY_PRICE = 29.99;
const YEARLY_PER_MO = (YEARLY_PRICE / 12).toFixed(2);

/* ─────────────────────────────────────────────────────────────
   FEATURES DATA
───────────────────────────────────────────────────────────── */
const FEATURES = [
    {
        icon: Infinity,
        title: 'Απεριόριστα budgets & στόχοι',
        desc: 'Χωρίς όρια στις κατηγορίες και τους στόχους σου',
    },
    {
        icon: TrendingUp,
        title: 'Πλήρης ανάλυση & ετήσιες τάσεις',
        desc: 'Λεπτομερή γραφήματα και τάσεις ανά έτος',
    },
    {
        icon: ScanLine,
        title: 'Μαζική σάρωση αποδείξεων (AI)',
        desc: 'Σκάναρε πολλές αποδείξεις με AI αυτόματα',
    },
    {
        icon: Tags,
        title: 'Προσαρμοσμένες κατηγορίες',
        desc: 'Δημιούργησε τις δικές σου κατηγορίες',
    },
    {
        icon: Fingerprint,
        title: 'Βιομετρικό κλείδωμα',
        desc: 'Face ID & Touch ID για πλήρη ασφάλεια',
    },
    {
        icon: Download,
        title: 'Εξαγωγή δεδομένων',
        desc: 'Κατέβασε CSV / JSON για Excel ή λογιστή',
    },
    {
        icon: Headphones,
        title: 'Priority υποστήριξη',
        desc: 'Άμεση βοήθεια μέσω email',
    },
    {
        icon: Repeat,
        title: 'Επαναλαμβανόμενες Συναλλαγές',
        desc: 'Αυτόματη καταχώρηση πάγιων εξόδων',
    },
];

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS (always dark — like Revolut)
───────────────────────────────────────────────────────────── */
const C = {
    bg: '#0d0d14',
    card: '#1e1e30',
    border: 'rgba(255,255,255,0.07)',
    selectedBorder: '#7c3aed',
    textPrimary: '#ffffff',
    textSec: 'rgba(255,255,255,0.5)',
    textMute: 'rgba(255,255,255,0.25)',
    amber: '#f59e0b',
    purple: '#7c3aed',
    purpleGlow: 'rgba(124,58,237,0.28)',
};

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

const IconBadge = ({ Icon, color }) => (
    <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: `${color}18`,
        border: `1px solid ${color}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
        <Icon size={19} color={color} strokeWidth={1.75} />
    </div>
);

const FeatureRow = ({ feature, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25 + index * 0.05, type: 'spring', stiffness: 260, damping: 28 }}
        className="flex items-center gap-4 py-4"
        style={{ borderBottom: `1px solid ${C.border}` }}
    >
        <IconBadge Icon={feature.icon} color={index % 2 === 0 ? C.amber : C.purple} />
        <div className="flex-1 min-w-0">
            <p style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, marginBottom: 3 }}>
                {feature.title}
            </p>
            <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.55 }}>
                {feature.desc}
            </p>
        </div>
    </motion.div>
);

const PricingCard = ({ label, price, sub, badge, selected, onSelect }) => (
    <motion.button
        onClick={onSelect}
        whileTap={{ scale: 0.985 }}
        className="w-full text-left rounded-2xl p-4 transition-all"
        style={{
            background: C.card,
            border: `1.5px solid ${selected ? C.selectedBorder : C.border}`,
            boxShadow: selected ? `0 0 0 1px ${C.selectedBorder}, 0 8px 24px ${C.purpleGlow}` : 'none',
            cursor: 'pointer',
        }}
    >
        <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>{label}</span>
                    {badge && (
                        <span style={{
                            background: 'rgba(16,185,129,0.15)',
                            border: '1px solid rgba(16,185,129,0.3)',
                            color: '#10b981',
                            fontSize: 10, fontWeight: 800, borderRadius: 99,
                            padding: '2px 8px', whiteSpace: 'nowrap',
                        }}>
                            {badge}
                        </span>
                    )}
                </div>
                <p style={{ fontSize: 13, color: C.textSec, marginBottom: sub ? 4 : 0 }}>{price}</p>
                {sub && (
                    <div className="flex items-center gap-1.5">
                        <Zap size={10} color={C.amber} fill={C.amber} strokeWidth={0} />
                        <span style={{ fontSize: 11, color: C.textMute }}>{sub}</span>
                    </div>
                )}
            </div>
            <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${selected ? C.purple : C.border}`,
                background: selected ? C.purple : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
            }}>
                {selected && <Check size={13} color="#fff" strokeWidth={3} />}
            </div>
        </div>
    </motion.button>
);

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const UpgradePage = ({ onBack }) => {
    const { closeUpgradeModal } = useSubscription();
    const [billing, setBilling] = useState('yearly');
    const [loading, setLoading] = useState(false);

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
            const url = billing === 'yearly'
                ? 'https://buy.stripe.com/3cI8wPgtNcy21Z03Rh1gs00'
                : 'https://buy.stripe.com/00wfZh5P941w8nocnN1gs01';
            window.location.href = `${url}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email)}`;
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="h-full flex flex-col overflow-hidden"
            style={{ background: C.bg, color: C.textPrimary, position: 'relative' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        >
            {/* ══ STICKY HEADER ══ */}
            <div
                className="shrink-0 flex items-center gap-3 px-4"
                style={{
                    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)',
                    paddingBottom: 14,
                    background: `${C.bg}f0`,
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderBottom: `1px solid ${C.border}`,
                    zIndex: 50,
                }}
            >
                <button
                    onClick={handleBack}
                    className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.09)', border: 'none', cursor: 'pointer' }}
                >
                    <ArrowLeft size={17} strokeWidth={2.5} color="rgba(255,255,255,0.75)" />
                </button>
                <span style={{ fontSize: 17, fontWeight: 700, color: C.textPrimary }}>
                    Αναβάθμιση πλάνου
                </span>
            </div>

            {/* ══ SCROLLABLE BODY ══ */}
            <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 140 }}>

                {/* Plan tabs */}
                <div className="flex items-center gap-1 px-4 pt-5 pb-3">
                    {[
                        { key: 'free', label: 'Δωρεάν' },
                        { key: 'pro', label: 'Pro' },
                    ].map(({ key, label }) => {
                        const active = key === 'pro'; // Pro always active in this app
                        return (
                            <button
                                key={key}
                                className="rounded-full transition-all active:scale-95"
                                style={{
                                    padding: '7px 20px', border: 'none',
                                    background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
                                    color: active ? C.textPrimary : C.textSec,
                                    fontSize: 14, fontWeight: active ? 700 : 500,
                                    cursor: 'pointer',
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Hero card */}
                <div className="px-4 pb-5">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                        className="rounded-3xl overflow-hidden relative"
                        style={{
                            background: 'linear-gradient(135deg, #1e1040 0%, #2a1060 45%, #1a1a2e 100%)',
                            border: '1px solid rgba(124,58,237,0.25)',
                            minHeight: 170,
                            boxShadow: '0 24px 64px rgba(124,58,237,0.18)',
                        }}
                    >
                        {/* Amber glow blob top-right */}
                        <div style={{
                            position: 'absolute', right: -20, top: -20,
                            width: 160, height: 160, borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%)',
                            pointerEvents: 'none',
                        }} />

                        {/* ⚡ icon card */}
                        <div style={{
                            position: 'absolute', right: 24, top: 24,
                            width: 72, height: 72, borderRadius: 20,
                            background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                            boxShadow: '0 12px 32px rgba(245,158,11,0.55)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Zap size={34} color="#fff" fill="#fff" strokeWidth={0} />
                        </div>

                        <div className="p-6 pt-8">
                            <p style={{
                                fontSize: 34, fontWeight: 800, color: '#fff',
                                letterSpacing: '-0.5px', marginBottom: 6,
                            }}>
                                Pro
                            </p>
                            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                                €{MONTHLY_PRICE}/μήνα
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Features header */}
                <div className="flex items-center gap-2.5 px-4 mb-1">
                    <Zap size={14} color={C.amber} fill={C.amber} strokeWidth={0} />
                    <span style={{
                        fontSize: 12, fontWeight: 700, letterSpacing: '0.8px',
                        textTransform: 'uppercase', color: C.textSec,
                    }}>
                        Τι περιλαμβάνει το Pro
                    </span>
                </div>

                {/* Feature rows */}
                <div className="px-4">
                    {FEATURES.map((f, i) => (
                        <FeatureRow key={i} feature={f} index={i} />
                    ))}
                </div>

                {/* Pricing section */}
                <div className="px-4 pt-7">
                    <p style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, marginBottom: 12 }}>
                        Επίλεξε πλάνο
                    </p>
                    <div className="flex flex-col gap-3">
                        <PricingCard
                            label="Ετήσιο"
                            price={`€${YEARLY_PRICE}/χρόνο`}
                            sub={`Ισοδυναμεί με €${YEARLY_PER_MO}/μήνα`}
                            badge="Εξοικονόμησε 16%"
                            selected={billing === 'yearly'}
                            onSelect={() => setBilling('yearly')}
                        />
                        <PricingCard
                            label="Μηνιαίο"
                            price={`€${MONTHLY_PRICE}/μήνα`}
                            sub={null}
                            badge={null}
                            selected={billing === 'monthly'}
                            onSelect={() => setBilling('monthly')}
                        />
                    </div>
                </div>
            </div>

            {/* ══ STICKY BOTTOM CTA ══ */}
            <div
                className="shrink-0 px-4 absolute bottom-0 left-0 right-0 z-50"
                style={{
                    paddingTop: 20,
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
                    background: `linear-gradient(to top, ${C.bg} 65%, transparent)`,
                }}
            >
                <motion.button
                    onClick={handleSubscribe}
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.015 } : {}}
                    whileTap={!loading ? { scale: 0.97 } : {}}
                    className="w-full rounded-2xl flex items-center justify-center gap-2"
                    style={{
                        padding: '18px 0',
                        border: 'none',
                        background: loading ? 'rgba(255,255,255,0.35)' : '#ffffff',
                        color: '#0d0d14',
                        fontSize: 16, fontWeight: 800,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        letterSpacing: '-0.1px',
                    }}
                >
                    {loading ? (
                        <span style={{
                            width: 20, height: 20,
                            border: '3px solid rgba(0,0,0,0.15)',
                            borderTopColor: '#0d0d14',
                            borderRadius: '50%',
                            display: 'inline-block',
                            animation: 'spin 0.7s linear infinite',
                        }} />
                    ) : (
                        <>
                            <Zap size={17} color="#0d0d14" fill="#0d0d14" strokeWidth={0} />
                            Δωρεάν δοκιμή 7 ημερών
                        </>
                    )}
                </motion.button>

                <p style={{
                    textAlign: 'center', fontSize: 12,
                    color: C.textMute, marginTop: 10, lineHeight: 1.5,
                }}>
                    Ακυρώνεις όποτε θες · Τιμή με ΦΠΑ
                </p>
            </div>
        </motion.div>
    );
};

export default UpgradePage;
