import React, { useState } from 'react';
import { X, Check, Zap, Crown, ArrowLeft, Star } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../supabase';

const PURPLE       = '#7c3aed';
const PURPLE_DARK  = '#5b21b6';
const PURPLE_MID   = '#6d28d9';
const PURPLE_LITE  = 'rgba(124,58,237,0.14)';
const PURPLE_XLIT  = 'rgba(124,58,237,0.07)';
const YEARLY_SAVINGS_PERCENT = 16;
const MONTHLY_PRICE = 2.99;
const YEARLY_PRICE  = 29.99;
const YEARLY_PER_MO = (YEARLY_PRICE / 12).toFixed(2);

/* ─── tiny helper: merge inline style objects ─── */
const s = (...objs) => Object.assign({}, ...objs);

const UpgradeModal = () => {
    const { t, theme } = useSettings();
    const { isUpgradeModalOpen, closeUpgradeModal } = useSubscription();
    const [billing, setBilling]     = useState('monthly');
    const [loadingPlan, setLoading] = useState(null);

    if (!isUpgradeModalOpen) return null;

    /* ── theme tokens ────────────────────────────────────────────────── */
    const dk = theme === 'dark';

    const tok = {
        sheetBg   : dk ? '#161616' : '#ffffff',
        cardFree  : dk ? '#1e1e1e' : '#fafafa',
        cardPro   : dk ? '#1e1e1e' : '#ffffff',
        cardBorder: dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)',
        drag      : dk ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
        closeBg   : dk ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        closeIco  : dk ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
        toggleBg  : dk ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.08)',
        toggleBdr : dk ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.18)',
        txtH      : dk ? '#f5f5f5'                : '#0f0f0f',
        txtB      : dk ? 'rgba(255,255,255,0.6)'  : 'rgba(0,0,0,0.55)',
        txtD      : dk ? 'rgba(255,255,255,0.32)' : 'rgba(0,0,0,0.35)',
        divider   : dk ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        badgeBg   : dk ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
        badgeTxt  : dk ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)',
        backHov   : dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        inputBg   : dk ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    };

    /* ── feature lists ───────────────────────────────────────────────── */
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

    /* ── subscribe handler ───────────────────────────────────────────── */
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

    /* ── shared style fragments ──────────────────────────────────────── */
    const featureRow = { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, lineHeight: 1.45 };
    const checkDot   = (color = PURPLE_LITE, icon = PURPLE) => ({
        width: 20, height: 20, borderRadius: '50%',
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    });

    /* ═══════════════════════════════════════════════════════════════════ */
    return (
        <div
            className="animate-fade-in fixed inset-0 z-[200] flex flex-col justify-end md:justify-center items-center bg-black/55 backdrop-blur-md"
            onClick={e => { if (e.target === e.currentTarget) closeUpgradeModal(); }}
        >
            {/* ═══ Bottom Sheet / Modal ═══════════════════════════════════════ */}
            <div
                className="animate-slide-up md:animate-pop scrollbar-hide w-full md:max-w-[900px] md:m-4"
                style={{
                    background: tok.sheetBg,
                    borderRadius: window.innerWidth >= 768 ? '32px' : '26px 26px 0 0',
                    borderTop: `1px solid ${tok.cardBorder}`,
                    border: window.innerWidth >= 768 ? `1px solid ${tok.cardBorder}` : undefined,
                    boxShadow: dk
                        ? '0 -12px 60px rgba(0,0,0,0.7), 0 -1px 0 rgba(255,255,255,0.04)'
                        : '0 -12px 60px rgba(124,58,237,0.10), 0 -1px 0 rgba(0,0,0,0.06)',
                    maxHeight: '93dvh',
                    overflowY: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    paddingBottom: window.innerWidth >= 768 ? '40px' : 'max(env(safe-area-inset-bottom, 0px), 20px)',
                }}
            >
                {/* ── Drag handle (mobile only) ── */}
                <div className="md:hidden" style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 0' }}>
                    <div style={{ width: 40, height: 4, borderRadius: 99, background: tok.drag }} />
                </div>

                {/* ── Header ── */}
                <div style={{ position: 'relative', padding: '24px 24px 0', textAlign: 'center' }}>
                    {/* Close */}
                    <button
                        onClick={closeUpgradeModal}
                        className="md:top-6 md:right-6"
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

                    {/* Crown icon */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 52, height: 52, borderRadius: 16, marginBottom: 14,
                        background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`,
                        boxShadow: `0 8px 24px ${PURPLE}44`,
                    }}>
                        <Crown size={26} color="#fff" strokeWidth={2} />
                    </div>

                    <h2 className="md:text-4xl md:mt-4" style={{
                        fontSize: 22, fontWeight: 800, color: tok.txtH,
                        margin: '0 0 8px', letterSpacing: '-1px',
                    }}>
                        {t('upgrade_sheet_title', 'Διάλεξε πλάνο')}
                    </h2>
                    <p className="md:max-w-lg md:text-base" style={{ fontSize: 13.5, color: tok.txtB, margin: '0 0 24px', lineHeight: 1.55, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto', textAlign: 'center' }}>
                        {t('upgrade_sheet_sub', 'Ξεκίνα δωρεάν. Αναβαθμίζεις όποτε θες, χωρίς δέσμευση.')}
                    </p>

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
                                        padding: '10px 24px',
                                        borderRadius: 99, border: 'none',
                                        cursor: 'pointer',
                                        fontSize: 14, fontWeight: 700,
                                        background: active
                                            ? `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`
                                            : 'transparent',
                                        color: active ? '#fff' : tok.txtB,
                                        boxShadow: active ? `0 2px 14px ${PURPLE}50` : 'none',
                                        transition: 'all 0.22s',
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        letterSpacing: '-0.1px',
                                    }}
                                >
                                    {label}
                                    {key === 'yearly' && (
                                        <span style={{
                                            background: active ? 'rgba(255,255,255,0.22)' : PURPLE_LITE,
                                            color: active ? '#fff' : PURPLE,
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

                {/* ═══ Plan Cards ════════════════════════════════════════════ */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-10 items-stretch">

                    {/* ─── FREE card ──────────────────────────────────────── */}
                    <div className="flex-1" style={{
                        background: tok.cardFree,
                        borderRadius: 24,
                        border: `1px solid ${tok.cardBorder}`,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ height: 4, background: `linear-gradient(90deg, rgba(124,58,237,0.4), rgba(109,40,217,0.2))` }} />

                        <div className="flex-1 flex flex-col" style={{ padding: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <span style={{
                                    fontSize: 11, fontWeight: 800, letterSpacing: '1.2px',
                                    textTransform: 'uppercase', color: tok.txtD,
                                }}>
                                    Freemium
                                </span>
                                <span style={{
                                    fontSize: 11, fontWeight: 700,
                                    background: tok.badgeBg,
                                    color: tok.badgeTxt,
                                    borderRadius: 99, padding: '5px 12px',
                                    border: `1px solid ${tok.cardBorder}`,
                                }}>
                                    {t('current_plan_badge', 'Τρέχον πλάνο')}
                                </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 6 }}>
                                <span style={{ fontSize: 48, fontWeight: 800, color: tok.txtH, lineHeight: 1, letterSpacing: '-2px' }}>€0</span>
                                <span style={{ fontSize: 14, color: tok.txtD, fontWeight: 500 }}>/ {t('monthly', 'μήνα')}</span>
                            </div>
                            <p style={{ fontSize: 13, color: tok.txtD, margin: '0 0 20px', lineHeight: 1.6 }}>
                                {t('free_plan_desc', 'Δωρεάν για πάντα, χωρίς κάρτα. Δοκίμασέ το, μοίρασέ το, δες αν σου κάνει.')}
                            </p>

                            <div style={{ height: 1, background: tok.divider, margin: '0 0 20px' }} />

                            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
                                {freeFeatures.map((f, i) => (
                                    <li key={i} style={s(featureRow, { color: tok.txtB, fontSize: 14.5 })}>
                                        <span style={checkDot(PURPLE_XLIT)}>
                                            <Check size={12} strokeWidth={3} color={PURPLE} />
                                        </span>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={closeUpgradeModal}
                                style={{
                                    marginTop: 28, width: '100%',
                                    padding: '14px 0',
                                    border: `1px solid ${tok.cardBorder}`,
                                    borderRadius: 16,
                                    background: 'transparent',
                                    fontSize: 14.5, fontWeight: 700, color: tok.txtD,
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = tok.backHov;
                                    e.currentTarget.style.color = tok.txtB;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = tok.txtD;
                                }}
                            >
                                <ArrowLeft size={15} strokeWidth={2.5} />
                                {t('back_to_dashboard', 'Πίσω στο dashboard')}
                            </button>
                        </div>
                    </div>

                    {/* ─── PRO card ───────────────────────────────────────── */}
                    <div className="flex-1" style={{ position: 'relative', marginTop: window.innerWidth >= 768 ? 0 : 15 }}>
                        <div style={{
                            position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                            background: `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE_DARK} 100%)`,
                            color: '#fff', fontSize: 12, fontWeight: 800,
                            borderRadius: 99, padding: '6px 20px',
                            whiteSpace: 'nowrap',
                            boxShadow: `0 6px 20px ${PURPLE}55`,
                            letterSpacing: '0.4px',
                            display: 'flex', alignItems: 'center', gap: 6,
                            zIndex: 1,
                        }}>
                            <Star size={12} fill="#fff" strokeWidth={0} />
                            {t('most_popular_badge', 'Πιο δημοφιλές')}
                        </div>

                        <div style={{
                            background: dk
                                ? 'linear-gradient(160deg, #1e1524 0%, #1a1a1a 60%)'
                                : 'linear-gradient(160deg, #f5f0ff 0%, #ffffff 60%)',
                            borderRadius: 24,
                            border: `2px solid ${PURPLE}`,
                            overflow: 'hidden',
                            boxShadow: `0 20px 50px ${PURPLE}30`,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div style={{ height: 4, background: `linear-gradient(90deg, ${PURPLE}, #a78bfa, ${PURPLE_DARK})` }} />

                            <div className="flex-1 flex flex-col" style={{ padding: '30px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: 32, height: 32, borderRadius: 10,
                                        background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`,
                                        boxShadow: `0 4px 12px ${PURPLE}44`,
                                    }}>
                                        <Zap size={16} color="#fff" fill="#fff" strokeWidth={0} />
                                    </div>
                                    <span style={{
                                        fontSize: 12, fontWeight: 800, letterSpacing: '1.2px',
                                        textTransform: 'uppercase', color: PURPLE,
                                    }}>
                                        Pro
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: proSubline ? 4 : 8 }}>
                                    <span style={{ fontSize: 52, fontWeight: 800, color: tok.txtH, lineHeight: 1, letterSpacing: '-2.5px' }}>{proPrice}</span>
                                    <span style={{ fontSize: 14, color: tok.txtB, fontWeight: 500 }}>{proPeriod}</span>
                                </div>

                                {proSubline && (
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        background: PURPLE_LITE,
                                        border: `1px solid rgba(124,58,237,0.3)`,
                                        borderRadius: 99, padding: '4px 12px',
                                        marginBottom: 12,
                                    }}>
                                        <span style={{ fontSize: 12, color: PURPLE, fontWeight: 700 }}>{proSubline}</span>
                                    </div>
                                )}

                                <p style={{ fontSize: 13, color: tok.txtB, margin: '0 0 20px', lineHeight: 1.6 }}>
                                    {t('pro_plan_desc', '14 ημέρες δωρεάν δοκιμή. Για όσους θέλουν πλήρη έλεγχο των οικονομικών τους.')}
                                </p>

                                <div style={{ height: 1, background: dk ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.10)', margin: '0 0 20px' }} />

                                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32, flex: 1 }}>
                                    {proFeatures.map((f, i) => (
                                        <li key={i} style={s(featureRow, { color: tok.txtH, fontWeight: 600, fontSize: 14.5 })}>
                                            <span style={checkDot(PURPLE_LITE)}>
                                                <Check size={12} strokeWidth={3} color={PURPLE} />
                                            </span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={handleSubscribe}
                                    disabled={!!loadingPlan}
                                    className="press-effect"
                                    style={{
                                        width: '100%', padding: '18px 0',
                                        border: 'none', borderRadius: 16,
                                        background: loadingPlan
                                            ? `${PURPLE}88`
                                            : `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE_DARK} 100%)`,
                                        color: '#fff',
                                        fontSize: 16, fontWeight: 800,
                                        cursor: loadingPlan ? 'not-allowed' : 'pointer',
                                        boxShadow: loadingPlan ? 'none' : `0 10px 30px ${PURPLE}55`,
                                        letterSpacing: '-0.2px',
                                        transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    }}
                                    onMouseEnter={e => { if (!loadingPlan) e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
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
                                            {billing === 'monthly'
                                                ? `Δωρεάν δοκιμή 14 ημερών`
                                                : `Δωρεάν δοκιμή 14 ημερών`}
                                        </>
                                    )}
                                </button>

                                <p style={{
                                    textAlign: 'center', fontSize: 12,
                                    color: tok.txtD, marginTop: 12, lineHeight: 1.5,
                                }}>
                                    Ακυρώνεις όποτε θες · Τιμή με ΦΠΑ
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ height: 10 }} />
            </div>
        </div>
    );
};

export default UpgradeModal;
