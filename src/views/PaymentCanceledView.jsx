import React, { useEffect, useRef, useState } from 'react';
import { XCircle, ArrowLeft, RefreshCcw, ShieldAlert, CreditCard } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const PARTICLES = [
    { w: 6,  h: 6,  top:  10, left: 20, delay: 0.1, dur: 5.5 },
    { w: 4,  h: 4,  top: 30, left: 80, delay: 0.3, dur: 6.0 },
    { w: 8,  h: 8,  top: 60, left: 10, delay: 1.0, dur: 7.0 },
    { w: 5,  h: 5,  top: 80, left: 85, delay: 0.6, dur: 5.8 },
    { w: 3,  h: 3,  top: 40, left: 45, delay: 1.2, dur: 6.5 },
];

const PaymentCanceledView = ({ onContinue, onRetry }) => {
    const { t } = useSettings();
    const hasAnimated = useRef(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!hasAnimated.current) {
            hasAnimated.current = true;
            const url = new URL(window.location.href);
            url.searchParams.delete('canceled');
            window.history.replaceState({}, '', url.toString());
        }
        const raf = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div style={styles.root}>
            {/* Animated Background */}
            <div style={styles.bgGradient} />
            <div style={styles.blob1} />
            <div style={styles.blob2} />
            <div style={styles.blob3} />

            {/* Floating Particles */}
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
                        background: 'rgba(255,255,255,0.2)',
                        animation: `pcFloat ${p.dur}s ${p.delay}s ease-in-out infinite`,
                        pointerEvents: 'none',
                    }}
                />
            ))}

            {/* Card */}
            <div style={{
                ...styles.card,
                opacity:    visible ? 1 : 0,
                transform:  visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
                transition: 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)',
            }}>

                {/* Icon Badge */}
                <div style={styles.badgeWrap}>
                    <div style={styles.badgePing} className="animate-ping-pulse" />
                    <div style={styles.badgeRing} />
                    <div style={styles.badgeInner}>
                        <XCircle size={40} color="#f87171" strokeWidth={1.8} />
                    </div>
                </div>

                {/* Label */}
                <div style={{
                    ...styles.label,
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.5s 0.12s both, transform 0.5s 0.12s both',
                }}>
                    <span>{t('payment_canceled_label') || 'Payment Canceled'}</span>
                </div>

                {/* Headline */}
                <h1 style={{
                    ...styles.title,
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.5s 0.2s both, transform 0.5s 0.2s both',
                }}>
                    {t('payment_canceled_title') || 'No Charges Made'}
                </h1>

                {/* Subtitle */}
                <p style={{
                    ...styles.subtitle,
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.5s 0.28s both, transform 0.5s 0.28s both',
                }}>
                    {t('payment_canceled_subtitle') || 'Your checkout process was canceled. Your account was not charged.'}
                </p>

                {/* Divider */}
                <div style={{
                    ...styles.divider,
                    opacity:    visible ? 1 : 0,
                    transition: 'opacity 0.5s 0.35s both',
                }} />

                {/* Info List */}
                <div style={{
                    ...styles.infoList,
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.5s 0.4s both, transform 0.5s 0.4s both',
                }}>
                    <div style={styles.infoRow}>
                        <ShieldAlert size={16} color="#f87171" />
                        <span>{t('payment_canceled_info_1') || 'Safe and secure process'}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <CreditCard size={16} color="#60a5fa" />
                        <span>{t('payment_canceled_info_2') || 'You can try again anytime'}</span>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div style={{
                    ...styles.actions,
                    opacity:    visible ? 1 : 0,
                    transform:  visible ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.5s 0.5s both, transform 0.5s 0.5s both',
                }}>
                    <button
                        onClick={onContinue}
                        style={styles.secondaryBtn}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    >
                        <ArrowLeft size={16} />
                        <span>{t('back_to_app') || 'Go Back'}</span>
                    </button>

                    <button
                        onClick={onRetry}
                        style={styles.primaryBtn}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <RefreshCcw size={16} />
                        <span>{t('try_again') || 'Try Again'}</span>
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes pcFloat {
                    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.5; }
                    33%       { transform: translateY(-15px) rotate(90deg); opacity: 0.8; }
                    66%       { transform: translateY(-8px) rotate(180deg); opacity: 0.6; }
                }
            `}</style>
        </div>
    );
};

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
        background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)',
    },
    blob1: {
        position: 'absolute',
        top: '-10%', left: '-5%',
        width: 300, height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        animation: 'pcFloat 10s 0s ease-in-out infinite',
    },
    blob2: {
        position: 'absolute',
        bottom: '-5%', right: '-10%',
        width: 250, height: 250,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
        animation: 'pcFloat 12s 1.5s ease-in-out infinite',
    },
    blob3: {
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400, height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(79,70,229,0.1) 0%, transparent 70%)',
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
        background: 'rgba(30,30,40,0.6)',
        backdropFilter: 'blur(20px) saturate(150%)',
        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: '36px 24px 28px',
        boxShadow: '0 24px 60px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
    },
    badgeWrap: {
        position: 'relative',
        width: 80,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    badgePing: {
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: 'rgba(239,68,68,0.15)',
    },
    badgeRing: {
        position: 'absolute',
        inset: 6,
        borderRadius: '50%',
        border: '1.5px solid rgba(239,68,68,0.2)',
        background: 'radial-gradient(circle at 50% 50%, rgba(239,68,68,0.1) 0%, transparent 100%)',
        backdropFilter: 'blur(4px)',
    },
    badgeInner: {
        position: 'relative',
        zIndex: 1,
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: 'linear-gradient(145deg, rgba(239,68,68,0.2) 0%, rgba(220,38,38,0.05) 100%)',
        border: '1px solid rgba(239,68,68,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px -4px rgba(239,68,68,0.3)',
    },
    label: {
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 800,
        color: '#ffffff',
        margin: '0 0 10px',
        textAlign: 'center',
        lineHeight: 1.2,
        letterSpacing: '-0.5px',
    },
    subtitle: {
        fontSize: 14,
        fontWeight: 400,
        color: 'rgba(255,255,255,0.6)',
        textAlign: 'center',
        lineHeight: 1.5,
        maxWidth: 280,
        margin: '0 auto',
    },
    divider: {
        width: 40,
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
        margin: '20px auto',
    },
    infoList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
        marginBottom: 24,
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
    },
    actions: {
        display: 'flex',
        width: '100%',
        gap: 12,
    },
    secondaryBtn: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '12px 0',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.2s',
    },
    primaryBtn: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '12px 0',
        borderRadius: 14,
        background: '#4f46e5',
        border: 'none',
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 8px 20px -4px rgba(79,70,229,0.5)',
    },
};

export default PaymentCanceledView;
