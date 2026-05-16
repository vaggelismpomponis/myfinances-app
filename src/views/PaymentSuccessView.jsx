import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ArrowRight, Crown, Sparkles, BarChart2, Target, Lock, ScanLine } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const PRO_FEATURES = [
    { icon: BarChart2, label: 'Full Analytics & History', color: '#a78bfa' },
    { icon: Target,    label: 'Unlimited Budgets & Goals', color: '#f472b6' },
    { icon: Lock,      label: 'Biometric App Lock', color: '#34d399' },
    { icon: ScanLine,  label: 'Bulk Receipt Scanner', color: '#60a5fa' },
];

/* Deterministic pseudo-particles – same values every render, no random flicker */
const PARTICLES = [
    { w: 6,  h: 6,  top:  8, left: 12, delay: 0.0, dur: 5.8 },
    { w: 4,  h: 4,  top: 22, left: 85, delay: 0.4, dur: 6.4 },
    { w: 8,  h: 8,  top: 55, left:  5, delay: 1.1, dur: 7.2 },
    { w: 5,  h: 5,  top: 70, left: 90, delay: 0.7, dur: 5.4 },
    { w: 3,  h: 3,  top: 35, left: 50, delay: 1.5, dur: 6.8 },
    { w: 6,  h: 6,  top: 80, left: 30, delay: 0.2, dur: 8.0 },
    { w: 4,  h: 4,  top: 15, left: 65, delay: 0.9, dur: 5.2 },
    { w: 7,  h: 7,  top: 90, left: 70, delay: 1.8, dur: 7.6 },
    { w: 3,  h: 3,  top: 45, left: 20, delay: 0.5, dur: 6.0 },
    { w: 5,  h: 5,  top: 60, left: 78, delay: 1.3, dur: 5.6 },
];

const PaymentSuccessView = ({ onContinue }) => {
    const { t } = useSettings();
    const { syncSubscription } = useSubscription();
    const hasAnimated = useRef(false);
    const [visible, setVisible] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!hasAnimated.current) {
            hasAnimated.current = true;
            const url = new URL(window.location.href);
            url.searchParams.delete('upgraded');
            window.history.replaceState({}, '', url.toString());
        }
        // Trigger stagger after mount
        const raf = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    // Call syncSubscription on mount — this directly queries Stripe, updates the
    // DB, then re-reads it. No dependency on webhooks.
    useEffect(() => {
        syncSubscription().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={styles.root}>

            {/* ── Animated Background ── */}
            <div style={styles.bgGradient} />
            <div style={styles.blob1} />
            <div style={styles.blob2} />
            <div style={styles.blob3} />

            {/* ── Floating Particles ── */}
            {PARTICLES.map((p, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        width:  p.w,
                        height: p.h,
                        top:  `${p.top}%`,
                        left: `${p.left}%`,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.25)',
                        animation: `psFloat ${p.dur}s ${p.delay}s ease-in-out infinite`,
                        pointerEvents: 'none',
                    }}
                />
            ))}

            {/* ── Card ── */}
            <div style={{
                ...styles.card,
                opacity:    visible ? 1 : 0,
                transform:  visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
                transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)',
            }}>

                {/* Crown Badge */}
                <div style={styles.badgeWrap}>
                    <div style={styles.badgePing} className="animate-ping-pulse" />
                    <div style={styles.badgeRing} />
                    <div style={styles.badgeInner}>
                        <Crown size={36} color="#fbbf24" strokeWidth={1.8} />
                    </div>
                </div>

                {/* Label */}
                <div style={{
                    ...styles.label,
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.5s 0.12s both, transform 0.5s 0.12s both',
                }}>
                    <Sparkles size={11} color="rgba(255,255,255,0.5)" />
                    <span>{t('payment_success_label')}</span>
                    <Sparkles size={11} color="rgba(255,255,255,0.5)" />
                </div>

                {/* Headline */}
                <h1 style={{
                    ...styles.title,
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.5s 0.2s both, transform 0.5s 0.2s both',
                }}>
                    {t('payment_success_title')}
                </h1>

                {/* Subtitle */}
                <p style={{
                    ...styles.subtitle,
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.5s 0.28s both, transform 0.5s 0.28s both',
                }}>
                    {t('payment_success_subtitle')}
                </p>

                {/* Divider */}
                <div style={{
                    ...styles.divider,
                    opacity:    visible ? 1 : 0,
                    transition: 'opacity 0.5s 0.35s both',
                }} />

                {/* Feature Grid */}
                <div style={styles.grid}>
                    {PRO_FEATURES.map(({ icon: Icon, label, color }, idx) => (
                        <div
                            key={label}
                            style={{
                                ...styles.featureCard,
                                opacity:    visible ? 1 : 0,
                                transform:  visible ? 'translateY(0)' : 'translateY(14px)',
                                transition: `opacity 0.45s ${0.38 + idx * 0.07}s both, transform 0.45s ${0.38 + idx * 0.07}s both`,
                            }}
                        >
                            <div style={{ ...styles.iconWrap, background: `${color}22`, border: `1px solid ${color}44` }}>
                                <Icon size={15} color={color} strokeWidth={2} />
                            </div>
                            <span style={styles.featureLabel}>{label}</span>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <button
                    onClick={async () => {
                        if (isRefreshing) return;
                        setIsRefreshing(true);
                        try {
                            await syncSubscription();
                        } catch (e) {
                            console.error('Sync failed', e);
                        }
                        onContinue();
                    }}
                    disabled={isRefreshing}
                    style={{
                        ...styles.cta,
                        opacity:    visible ? 1 : 0,
                        transform:  visible ? 'translateY(0)' : 'translateY(10px)',
                        transition: 'opacity 0.5s 0.68s both, transform 0.5s 0.68s both',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 20px 48px -8px rgba(124,58,237,0.55)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = styles.cta.boxShadow;
                    }}
                    onMouseDown={e  => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                    onMouseUp={e    => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
                >
                    <CheckCircle2 size={19} color="#7c3aed" strokeWidth={2.2} />
                    <span style={styles.ctaText}>{t('payment_success_cta')}</span>
                    <ArrowRight size={17} color="#7c3aed" strokeWidth={2.2} style={{ marginLeft: 'auto' }} />
                </button>

                {/* Manage note */}
                <p style={{
                    ...styles.manageNote,
                    opacity:    visible ? 1 : 0,
                    transition: 'opacity 0.5s 0.8s both',
                }}>
                    {t('payment_success_manage')}
                </p>

            </div>

            {/* Particle keyframes injected once */}
            <style>{`
                @keyframes psFloat {
                    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
                    33%       { transform: translateY(-18px) rotate(120deg); opacity: 1; }
                    66%       { transform: translateY(-9px) rotate(240deg); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

/* ── Inline styles (no Tailwind dependency for this view) ── */
const styles = {
    root: {
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        overflow: 'hidden',
    },
    bgGradient: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(145deg, #1e0a3c 0%, #2d1060 35%, #4a0e8f 65%, #6d1fc4 100%)',
    },
    blob1: {
        position: 'absolute',
        top: '-15%', left: '-10%',
        width: 380, height: 380,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        animation: 'psFloat 9s 0s ease-in-out infinite',
    },
    blob2: {
        position: 'absolute',
        bottom: '-10%', right: '-5%',
        width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.28) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        animation: 'psFloat 11s 1.5s ease-in-out infinite',
    },
    blob3: {
        position: 'absolute',
        top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(109,31,196,0.2) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
    },
    card: {
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: 360,
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.13)',
        borderRadius: 28,
        padding: '36px 28px 28px',
        boxShadow: '0 32px 80px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)',
    },
    badgeWrap: {
        position: 'relative',
        width: 96,
        height: 96,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    badgePing: {
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'rgba(251,191,36,0.18)',
    },
    badgeRing: {
        position: 'absolute',
        inset: 8,
        borderRadius: '50%',
        border: '1.5px solid rgba(251,191,36,0.3)',
        background: 'radial-gradient(circle at 40% 35%, rgba(251,191,36,0.15) 0%, rgba(139,92,246,0.08) 100%)',
        backdropFilter: 'blur(8px)',
    },
    badgeInner: {
        position: 'relative',
        zIndex: 1,
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'linear-gradient(145deg, rgba(251,191,36,0.25) 0%, rgba(245,158,11,0.1) 100%)',
        border: '1px solid rgba(251,191,36,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px -4px rgba(251,191,36,0.4)',
    },
    label: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 10,
    },
    title: {
        fontSize: 34,
        fontWeight: 900,
        color: '#ffffff',
        margin: '0 0 10px',
        textAlign: 'center',
        lineHeight: 1.15,
        letterSpacing: '-0.5px',
        textShadow: '0 2px 20px rgba(139,92,246,0.4)',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.62)',
        textAlign: 'center',
        lineHeight: 1.6,
        maxWidth: 280,
        margin: '0 auto 4px',
    },
    divider: {
        width: 48,
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        margin: '20px auto',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        width: '100%',
        marginBottom: 24,
    },
    featureCard: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '10px 12px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
    },
    iconWrap: {
        width: 30,
        height: 30,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    featureLabel: {
        fontSize: 11,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 1.35,
    },
    cta: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '15px 20px',
        borderRadius: 18,
        background: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'Inter, system-ui, sans-serif',
        transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s ease',
        boxShadow: '0 12px 36px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.9)',
    },
    ctaText: {
        fontSize: 15,
        fontWeight: 800,
        color: '#5b21b6',
        letterSpacing: '-0.1px',
    },
    manageNote: {
        marginTop: 16,
        fontSize: 11,
        fontWeight: 500,
        color: 'rgba(255,255,255,0.32)',
        textAlign: 'center',
        lineHeight: 1.5,
        maxWidth: 260,
    },
};

export default PaymentSuccessView;
