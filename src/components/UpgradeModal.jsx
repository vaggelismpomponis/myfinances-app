import React, { useState } from 'react';
import { X, Check, Zap, Crown, ArrowLeft, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../supabase';

const YEARLY_SAVINGS_PERCENT = 16;
const MONTHLY_PRICE = 2.99;
const YEARLY_PRICE  = 29.99;
const YEARLY_PER_MO = (YEARLY_PRICE / 12).toFixed(2);

const UpgradeModal = () => {
    const { t, theme } = useSettings();
    const { isUpgradeModalOpen, closeUpgradeModal } = useSubscription();
    const [billing, setBilling]     = useState('monthly');
    const [loadingPlan, setLoading] = useState(null);

    if (!isUpgradeModalOpen) return null;

    const dk = theme === 'dark';

    const tok = {
        sheetBg   : dk ? '#111118' : '#ffffff',
        cardFree  : dk ? '#1c1c26' : '#f8f8f8',
        cardPro   : dk ? '#1c1c26' : '#ffffff',
        cardBorder: dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
        drag      : dk ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.13)',
        closeBg   : dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
        closeIco  : dk ? 'rgba(255,255,255,0.4)'  : 'rgba(0,0,0,0.35)',
        toggleBg  : dk ? 'rgba(255,255,255,0.05)' : '#f0ebff',
        toggleBdr : dk ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.2)',
        txtH      : dk ? '#f0f0f0'                : '#0d0d0d',
        txtB      : dk ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
        txtD      : dk ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.3)',
        divider   : dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        badgeBg   : dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
        badgeTxt  : dk ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
        backHov   : dk ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    };

    const freeFeatures = [
        t('free_feature_1', 'Μέχρι 3 ενεργά budgets'),
        t('free_feature_2', 'Μέχρι 2 ενεργούς στόχους'),
        t('free_feature_3', 'Βασική ανάλυση (μήνας)'),
        t('free_feature_4', 'Απλή σάρωση αποδείξεων'),
        t('free_feature_5', 'PIN κλείδωμα εφαρμογής'),
    ];

    const proFeatures = [
        t('pro_feature_1', 'Απεριόριστα budgets & στόχοι'),
        t('pro_feature_2', 'Πλήρης ανάλυση & ετήσιες τάσεις'),
        t('pro_feature_3', 'Μαζική σάρωση αποδείξεων (AI)'),
        t('pro_feature_4', 'Προσαρμοσμένες κατηγορίες'),
        t('pro_feature_5', 'Βιομετρικό κλείδωμα'),
        t('pro_feature_6', 'Εξαγωγή δεδομένων (CSV/JSON)'),
        t('pro_feature_7', 'Priority υποστήριξη'),
        t('pro_feature_8', 'Επαναλαμβανόμενες Συναλλαγές'),
    ];

    const proPrice  = billing === 'monthly' ? `€${MONTHLY_PRICE}` : `€${YEARLY_PRICE}`;
    const proPeriod = billing === 'monthly' ? `/ ${t('monthly', 'μήνα')}` : `/ ${t('yearly', 'έτος')}`;
    const proSubline = billing === 'yearly'
        ? `≈ €${YEARLY_PER_MO}/μήνα · Κέρδος ${YEARLY_SAVINGS_PERCENT}%`
        : null;

    const handleSubscribe = async () => {
        setLoading(billing);
        try {
            const { data } = await supabase.auth.getUser();
            const user = data?.user;
            if (!user) return;
            const link = billing === 'yearly'
                ? 'https://buy.stripe.com/3cI8wPgtNcy21Z03Rh1gs00'
                : 'https://buy.stripe.com/00wfZh5P941w8nocnN1gs01';
            window.location.href = `${link}?client_reference_id=${user.id}&prefilled_email=${encodeURIComponent(user.email)}`;
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(null);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[200] flex flex-col justify-end items-center"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={e => { if (e.target === e.currentTarget) closeUpgradeModal(); }}
            >
                {/* ═══ Bottom Sheet ═══ */}
                <motion.div
                    className="w-full lg:max-w-[1000px] scrollbar-hide"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', stiffness: 340, damping: 38, mass: 0.9 }}
                    style={{
                        background: tok.sheetBg,
                        borderTopLeftRadius: 32,
                        borderTopRightRadius: 32,
                        borderTop: `1px solid ${tok.cardBorder}`,
                        boxShadow: dk
                            ? '0 -16px 80px rgba(0,0,0,0.8)'
                            : '0 -16px 80px rgba(124,58,237,0.12)',
                        maxHeight: '93dvh',
                        overflowY: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)',
                    }}
                >
                    {/* Drag handle */}
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
                        <div style={{ width: 40, height: 4, borderRadius: 99, background: tok.drag }} />
                    </div>

                    {/* ── Header ── */}
                    <div style={{ position: 'relative', padding: '24px 24px 0', textAlign: 'center' }}>
                        {/* Close */}
                        <button
                            onClick={closeUpgradeModal}
                            style={{
                                position: 'absolute', top: 16, right: 18,
                                background: tok.closeBg, border: 'none', borderRadius: '50%',
                                width: 34, height: 34, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: tok.closeIco, transition: 'background 0.15s',
                            }}
                        >
                            <X size={16} strokeWidth={2.5} />
                        </button>

                        {/* Icon — amber/orange gradient matching CTA */}
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 22, delay: 0.1 }}
                            style={{
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                width: 60, height: 60, borderRadius: 18, marginBottom: 16,
                                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                                boxShadow: '0 8px 28px rgba(245,158,11,0.4)',
                            }}
                        >
                            <Zap size={28} color="#fff" fill="#fff" strokeWidth={0} />
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.3 }}
                            style={{
                                fontSize: 24, fontWeight: 800, color: tok.txtH,
                                margin: '0 0 8px', letterSpacing: '-0.8px',
                            }}
                        >
                            {t('upgrade_sheet_title', 'Διάλεξε πλάνο')}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            style={{
                                fontSize: 14, color: tok.txtB, margin: '0 0 24px',
                                lineHeight: 1.6, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto',
                            }}
                        >
                            {t('upgrade_sheet_sub', 'Ξεκίνα δωρεάν. Αναβαθμίζεις όποτε θες, χωρίς δέσμευση.')}
                        </motion.p>

                        {/* ── Billing toggle ── */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center',
                            background: tok.toggleBg,
                            border: `1.5px solid ${tok.toggleBdr}`,
                            borderRadius: 99, padding: 4,
                            marginBottom: 10,
                        }}>
                            {[
                                { key: 'monthly', label: t('monthly', 'Μηνιαία') },
                                { key: 'yearly',  label: t('yearly',  'Ετήσια') },
                            ].map(({ key, label }) => {
                                const active = billing === key;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setBilling(key)}
                                        style={{
                                            padding: '9px 22px',
                                            borderRadius: 99, border: 'none', cursor: 'pointer',
                                            fontSize: 14, fontWeight: 700,
                                            background: active
                                                ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
                                                : 'transparent',
                                            color: active ? '#fff' : tok.txtB,
                                            boxShadow: active ? '0 2px 14px rgba(124,58,237,0.45)' : 'none',
                                            transition: 'all 0.22s',
                                            display: 'flex', alignItems: 'center', gap: 8,
                                        }}
                                    >
                                        {label}
                                        {key === 'yearly' && (
                                            <span style={{
                                                background: active ? 'rgba(255,255,255,0.22)' : 'rgba(124,58,237,0.14)',
                                                color: active ? '#fff' : '#7c3aed',
                                                borderRadius: 99, fontSize: 11, fontWeight: 800,
                                                padding: '2px 8px', transition: 'all 0.22s',
                                            }}>
                                                -{YEARLY_SAVINGS_PERCENT}%
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ═══ Plan Cards ═══ */}
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 p-5 md:p-10 items-stretch">

                        {/* ─── FREE card ─── */}
                        <div className="flex-1" style={{
                            background: tok.cardFree,
                            borderRadius: 24,
                            border: `1px solid ${tok.cardBorder}`,
                            display: 'flex', flexDirection: 'column', overflow: 'hidden',
                        }}>
                            <div style={{ height: 3, background: 'linear-gradient(90deg, rgba(124,58,237,0.35), rgba(109,40,217,0.15))' }} />
                            <div className="flex-1 flex flex-col" style={{ padding: 28 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                    <span style={{
                                        fontSize: 11, fontWeight: 800, letterSpacing: '1.2px',
                                        textTransform: 'uppercase', color: tok.txtD,
                                    }}>Freemium</span>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700,
                                        background: tok.badgeBg, color: tok.badgeTxt,
                                        borderRadius: 99, padding: '4px 12px',
                                        border: `1px solid ${tok.cardBorder}`,
                                    }}>
                                        {t('current_plan_badge', 'Τρέχον πλάνο')}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                                    <span style={{ fontSize: 46, fontWeight: 800, color: tok.txtH, lineHeight: 1, letterSpacing: '-2px' }}>€0</span>
                                    <span style={{ fontSize: 13, color: tok.txtD, fontWeight: 500 }}>/ {t('monthly', 'μήνα')}</span>
                                </div>
                                <p style={{ fontSize: 13, color: tok.txtD, margin: '0 0 18px', lineHeight: 1.6 }}>
                                    {t('free_plan_desc', 'Δωρεάν για πάντα, χωρίς κάρτα.')}
                                </p>

                                <div style={{ height: 1, background: tok.divider, margin: '0 0 18px' }} />

                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                                    {freeFeatures.map((f, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: tok.txtB }}>
                                            <span style={{
                                                width: 20, height: 20, borderRadius: '50%',
                                                background: 'rgba(124,58,237,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            }}>
                                                <Check size={11} strokeWidth={3} color="#7c3aed" />
                                            </span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={closeUpgradeModal}
                                    style={{
                                        marginTop: 24, width: '100%', padding: '13px 0',
                                        border: `1px solid ${tok.cardBorder}`, borderRadius: 14,
                                        background: 'transparent',
                                        fontSize: 14, fontWeight: 700, color: tok.txtD,
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = tok.backHov; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <ArrowLeft size={14} strokeWidth={2.5} />
                                    {t('back_to_dashboard', 'Πίσω στο dashboard')}
                                </button>
                            </div>
                        </div>

                        {/* ─── PRO card ─── */}
                        <div className="flex-1" style={{ position: 'relative', marginTop: 0 }}>
                            {billing === 'yearly' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                                        color: '#fff', fontSize: 12, fontWeight: 800,
                                        borderRadius: 99, padding: '5px 18px',
                                        whiteSpace: 'nowrap',
                                        boxShadow: '0 6px 20px rgba(245,158,11,0.45)',
                                        display: 'flex', alignItems: 'center', gap: 6, zIndex: 1,
                                    }}
                                >
                                    <Star size={11} fill="#fff" strokeWidth={0} />
                                    {t('most_popular_badge', 'Πιο δημοφιλές')}
                                </motion.div>
                            )}

                            <div style={{
                                background: dk
                                    ? 'linear-gradient(160deg, #1a1526 0%, #1c1c26 60%)'
                                    : 'linear-gradient(160deg, #fdf6ff 0%, #ffffff 60%)',
                                borderRadius: 24,
                                border: '2px solid #7c3aed',
                                boxShadow: '0 20px 60px rgba(124,58,237,0.22)',
                                height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                            }}>
                                {/* Top gradient bar */}
                                <div style={{ height: 3, background: 'linear-gradient(90deg, #f59e0b, #ea580c, #7c3aed)' }} />

                                <div className="flex-1 flex flex-col" style={{ padding: 28 }}>
                                    {/* PRO label with ⚡ icon */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            width: 30, height: 30, borderRadius: 9,
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                                            boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
                                        }}>
                                            <Zap size={15} color="#fff" fill="#fff" strokeWidth={0} />
                                        </div>
                                        <span style={{
                                            fontSize: 12, fontWeight: 800, letterSpacing: '1.4px',
                                            textTransform: 'uppercase', color: '#f59e0b',
                                        }}>
                                            PRO
                                        </span>
                                    </div>

                                    {/* Price */}
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: proSubline ? 4 : 6 }}>
                                        <span style={{ fontSize: 50, fontWeight: 800, color: tok.txtH, lineHeight: 1, letterSpacing: '-2.5px' }}>{proPrice}</span>
                                        <span style={{ fontSize: 13, color: tok.txtB, fontWeight: 500 }}>{proPeriod}</span>
                                    </div>

                                    {proSubline && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                background: 'rgba(245,158,11,0.12)',
                                                border: '1px solid rgba(245,158,11,0.28)',
                                                borderRadius: 99, padding: '4px 12px', marginBottom: 10,
                                            }}
                                        >
                                            <span style={{ fontSize: 12, color: '#d97706', fontWeight: 700 }}>{proSubline}</span>
                                        </motion.div>
                                    )}

                                    <p style={{ fontSize: 13, color: tok.txtB, margin: '0 0 18px', lineHeight: 1.6 }}>
                                        {t('pro_plan_desc', '7 ημέρες δωρεάν δοκιμή. Για όσους θέλουν πλήρη έλεγχο των οικονομικών τους.')}
                                    </p>

                                    <div style={{ height: 1, background: dk ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)', margin: '0 0 18px' }} />

                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28, flex: 1 }}>
                                        {proFeatures.map((f, i) => (
                                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: tok.txtH, fontWeight: 600 }}>
                                                <span style={{
                                                    width: 20, height: 20, borderRadius: '50%',
                                                    background: 'rgba(245,158,11,0.15)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                }}>
                                                    <Check size={11} strokeWidth={3} color="#d97706" />
                                                </span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA — amber-orange gradient matching the header button */}
                                    <motion.button
                                        onClick={handleSubscribe}
                                        disabled={!!loadingPlan}
                                        whileHover={!loadingPlan ? { scale: 1.02, y: -2 } : {}}
                                        whileTap={!loadingPlan ? { scale: 0.97 } : {}}
                                        style={{
                                            width: '100%', padding: '17px 0',
                                            border: 'none', borderRadius: 16,
                                            background: loadingPlan
                                                ? 'rgba(245,158,11,0.5)'
                                                : 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                                            color: '#fff',
                                            fontSize: 16, fontWeight: 800,
                                            cursor: loadingPlan ? 'not-allowed' : 'pointer',
                                            boxShadow: loadingPlan ? 'none' : '0 10px 32px rgba(245,158,11,0.45)',
                                            letterSpacing: '-0.1px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                        }}
                                    >
                                        {loadingPlan ? (
                                            <>
                                                <span style={{
                                                    width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)',
                                                    borderTopColor: '#fff', borderRadius: '50%',
                                                    display: 'inline-block', animation: 'spin 0.7s linear infinite',
                                                }} />
                                                {t('loading', 'Φόρτωση...')}
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={18} fill="#fff" strokeWidth={0} />
                                                {t('upgrade_cta_checkout', 'Δωρεάν δοκιμή 7 ημερών')}
                                            </>
                                        )}
                                    </motion.button>

                                    <p style={{
                                        textAlign: 'center', fontSize: 12,
                                        color: tok.txtD, marginTop: 10, lineHeight: 1.5,
                                    }}>
                                        {t('cancel_anytime', 'Ακυρώνεις όποτε θες · Τιμή με ΦΠΑ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default UpgradeModal;
