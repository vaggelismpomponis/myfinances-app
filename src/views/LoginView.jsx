import React, { useState, useEffect, useRef } from 'react';
import {
    Mail,
    Lock,
    ArrowRight,
    ArrowLeft,
    Eye,
    EyeOff,
    X,
    Check,
    Sparkles,
    ShieldCheck,
    KeyRound,
    HelpCircle,
    CheckCircle2
} from 'lucide-react';
import { supabase } from '../supabase';
import { useSettings } from '../contexts/SettingsContext';
import { Capacitor } from '@capacitor/core';
import { validateEmail } from '../utils/emailValidation';
import PasswordInput from '../components/PasswordInput';
import { motion, AnimatePresence } from 'framer-motion';

const LoginView = ({
    onEmailLogin,
    onRegister,
    onGoogleLogin,
    onVerifyOtp,
    onResendOtp,
    isVerifying,
    onCancelVerification
}) => {
    const { t } = useSettings();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);

    // Verification State
    const [showVerification, setShowVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(0);
    const codeRefs = useRef([]);

    // Sync with App-level verification state
    useEffect(() => {
        if (isVerifying) {
            setShowVerification(true);
            if (email && !verificationEmail) {
                setVerificationEmail(email);
            }
        }
    }, [isVerifying, email]);

    const handleCodeChange = (idx, val) => {
        if (!/^\d*$/.test(val)) return;

        const newCode = [...verificationCode];
        newCode[idx] = val.slice(-1);
        setVerificationCode(newCode);

        // Auto-focus next
        if (val && idx < 7) {
            codeRefs.current[idx + 1]?.focus();
        }

        // Auto-submit if all 8 filled
        if (newCode.every(v => v !== '') && val) {
            const finalCode = newCode.join('');
            onVerifyOtp(verificationEmail, finalCode).catch(() => {
                setVerificationCode(['', '', '', '', '', '', '', '']);
                codeRefs.current[0]?.focus();
            });
        }
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !verificationCode[idx] && idx > 0) {
            codeRefs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        const digits = pastedData.replace(/\D/g, '').slice(0, 8);

        if (digits.length > 0) {
            const newCode = [...verificationCode];
            digits.split('').forEach((digit, i) => {
                if (i < 8) newCode[i] = digit;
            });
            setVerificationCode(newCode);

            const nextIdx = Math.min(digits.length, 7);
            codeRefs.current[nextIdx]?.focus();

            if (digits.length === 8) {
                onVerifyOtp(verificationEmail, digits).catch(() => {
                    setVerificationCode(['', '', '', '', '', '', '', '']);
                    codeRefs.current[0]?.focus();
                });
            }
        }
    };

    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    const handleResend = async () => {
        if (resendTimer > 0) return;
        await onResendOtp(verificationEmail || email);
        setResendTimer(60);
    };

    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetStatus, setResetStatus] = useState({ loading: false, success: false, error: '' });
    const [formError, setFormError] = useState('');
    const [gsiFailed, setGsiFailed] = useState(false);

    // Detect & maintain the GSI button when returning to the choice screen
    useEffect(() => {
        if (Capacitor.isNativePlatform()) return;
        if (showEmailForm || showVerification) return;

        const checkGsi = () => {
            const container = document.getElementById('google-signin-button');
            if (container) {
                if (container.children.length === 0) {
                    if (typeof window.__renderGoogleButton === 'function') {
                        window.__renderGoogleButton();
                    }
                } else {
                    setGsiFailed(false);
                }
            }
        };

        checkGsi();
        const t1 = setTimeout(checkGsi, 100);
        const t2 = setTimeout(checkGsi, 400);

        const failTimer = setTimeout(() => {
            const container = document.getElementById('google-signin-button');
            if (container && container.children.length === 0) {
                setGsiFailed(true);
            }
        }, 2500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(failTimer);
        };
    }, [showEmailForm, showVerification]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!email || !password) return;

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            if (!isLogin || emailValidation.errorKey === 'invalid_email_format') {
                setFormError(t(emailValidation.errorKey) || 'Μη έγκυρη διεύθυνση email');
                return;
            }
        }
        if (!isLogin && password.length < 8) {
            setFormError(t('password_length_error') || 'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες');
            return;
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                await onEmailLogin(email, password);
            } else {
                await onRegister(email, password);
                setVerificationEmail(email);
                setShowVerification(true);
            }
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            let msg = (t('error_prefix') || 'Σφάλμα: ') + (err.message || t('something_went_wrong') || 'Κάτι πήγε στραβά');
            if (err.message?.includes('Invalid login credentials') || err.message?.includes('invalid_credentials')) {
                msg = t('wrong_password') || 'Λάθος email ή κωδικός πρόσβασης';
            } else if (err.message?.includes('already registered') || err.message?.includes('User already registered')) {
                msg = t('email_in_use') || 'Το email χρησιμοποιείται ήδη';
            } else if (err.status === 429 || err.message?.includes('too many requests')) {
                msg = t('rate_limit_error') || 'Πάρα πολλά αιτήματα. Δοκιμάστε αργότερα.';
            }
            setFormError(msg);
        }
    };

    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        const code = verificationCode.join('');
        if (code.length !== 8) return;

        setIsLoading(true);
        try {
            await onVerifyOtp(verificationEmail, code);
            setIsLoading(false);
        } catch (err) {
            setIsLoading(false);
            setVerificationCode(['', '', '', '', '', '', '', '']);
            codeRefs.current[0]?.focus();
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!resetEmail) return;
        setResetStatus({ loading: true, success: false, error: '' });
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: window.location.origin
            });
            if (error) throw error;
            setResetStatus({ loading: false, success: true, error: '' });
            setTimeout(() => {
                setShowForgotModal(false);
                setResetStatus({ loading: false, success: false, error: '' });
                setResetEmail('');
            }, 3000);
        } catch (error) {
            let msg = t('email_send_error') || 'Σφάλμα αποστολής email.';
            if (error.message?.includes('not found') || error.message?.includes('User not found')) {
                msg = t('user_not_found') || 'Δεν υπάρχει χρήστης με αυτό το email.';
            }
            setResetStatus({ loading: false, success: false, error: msg });
        }
    };

    return (
        <div className="min-h-[100dvh] w-full flex flex-col items-center justify-between relative overflow-y-auto overflow-x-hidden bg-[#08070D] px-4 py-8 sm:py-12 selection:bg-violet-500/30">

            {/* Ambient Background Glows */}
            <div className="fixed -top-32 -left-32 w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full bg-violet-600/20 blur-[130px] pointer-events-none animate-pulse" />
            <div className="fixed -bottom-28 -right-28 w-80 h-80 sm:w-[450px] sm:h-[450px] rounded-full bg-indigo-600/20 blur-[140px] pointer-events-none" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

            {/* Micro Dot Matrix Grid */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.14]"
                style={{
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Center Content Container */}
            <div className="w-full max-w-[420px] my-auto py-2 z-10 relative flex flex-col items-center">

                {/* ── Brand Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-col items-center text-center mb-6 sm:mb-8"
                >
                    {/* Glowing Squircle App Icon */}
                    <div className="relative group cursor-pointer mb-3.5">
                        <div className="absolute -inset-1 rounded-[26px] bg-gradient-to-tr from-violet-600 via-indigo-500 to-fuchsia-500 opacity-60 blur-xl group-hover:opacity-90 transition duration-500" />
                        <div className="relative w-20 h-20 sm:w-[88px] sm:h-[88px] rounded-[24px] bg-[#12101F] border border-white/20 p-3.5 shadow-2xl flex items-center justify-center backdrop-blur-xl ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-300">
                            <img
                                src="/spendwise-mark.png"
                                alt="SpendWise Icon"
                                className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(124,58,237,0.45)]"
                            />
                        </div>
                    </div>

                    {/* App Title & Subtitle */}
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-outfit">
                        SpendWise
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1 text-center max-w-[280px]">
                        {showVerification
                            ? (t('verification_title') || 'Επαλήθευση ασφαλείας')
                            : (isLogin
                                ? 'Καλωσήρθες πίσω'
                                : 'Δημιούργησε λογαριασμό σε 30 δευτερόλεπτα')}
                    </p>
                </motion.div>

                {/* ── Main Auth Card ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
                    className="w-full bg-[#131120]/90 backdrop-blur-2xl border border-white/[0.12] rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] relative overflow-hidden"
                >
                    {/* Top Edge Ambient Highlight Line */}
                    <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-violet-400/50 to-transparent pointer-events-none" />

                    <AnimatePresence mode="wait">
                        {/* ── OTP Verification Flow ── */}
                        {showVerification ? (
                            <motion.div
                                key="verification-view"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-6"
                            >
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowVerification(false);
                                        if (onCancelVerification) onCancelVerification();
                                    }}
                                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft size={16} /> {t('back') || 'Πίσω'}
                                </button>

                                <div className="text-center space-y-2">
                                    <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto text-violet-400 mb-3 shadow-[0_0_20px_rgba(124,58,237,0.25)]">
                                        <ShieldCheck size={30} />
                                    </div>
                                    <h2 className="text-lg font-bold text-white tracking-tight">
                                        {t('verification_code') || 'Κωδικός Επιβεβαίωσης'}
                                    </h2>
                                    <p className="text-xs text-gray-400 leading-relaxed px-2">
                                        {(t('check_email_for_code') || 'Σου στείλαμε έναν 8-ψήφιο κωδικό στο {email}.').replace('{email}', verificationEmail)}
                                    </p>
                                </div>

                                <div className="flex justify-center gap-1 sm:gap-1.5 py-3">
                                    {verificationCode.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={el => codeRefs.current[idx] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={e => handleCodeChange(idx, e.target.value)}
                                            onKeyDown={e => handleKeyDown(idx, e)}
                                            onPaste={handlePaste}
                                            aria-label={`Digit ${idx + 1}`}
                                            className="w-8 h-11 sm:w-9 sm:h-12 text-center text-base sm:text-lg font-bold rounded-xl
                                                     bg-white/[0.05] border border-white/10
                                                     focus:border-violet-500 focus:bg-white/10 focus:ring-2 focus:ring-violet-500/20
                                                     text-white outline-none transition-all shadow-sm"
                                        />
                                    ))}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleVerify}
                                    disabled={isLoading || verificationCode.some(d => !d)}
                                    className="w-full py-4 rounded-2xl font-bold text-sm text-white
                                             bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-500
                                             hover:from-violet-500 hover:to-indigo-500
                                             shadow-[0_8px_25px_rgba(124,58,237,0.35)]
                                             flex items-center justify-center gap-2
                                             transition-all duration-200
                                             disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>{t('verify_btn') || 'Επιβεβαίωση'}</span>
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </motion.button>

                                <div className="text-center pt-2">
                                    <button
                                        type="button"
                                        disabled={resendTimer > 0}
                                        className="text-xs font-bold text-violet-400 hover:text-violet-300 disabled:opacity-50 disabled:no-underline transition-colors"
                                        onClick={handleResend}
                                    >
                                        {resendTimer > 0
                                            ? `${t('resend_code') || 'Επαναποστολή κωδικού'} (${resendTimer}s)`
                                            : (t('resend_code') || 'Επαναποστολή κωδικού')}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            /* ── Main Auth Flow (Tabs + Social / Email) ── */
                            <motion.div
                                key="auth-main-view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* ── Segmented Control (Σύνδεση | Εγγραφή) ── */}
                                <div className="bg-white/[0.05] p-1.5 rounded-2xl flex relative border border-white/[0.08] mb-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLogin(true);
                                            setFormError('');
                                        }}
                                        className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold relative z-10 transition-colors ${isLogin ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                                            }`}
                                    >
                                        {isLogin && (
                                            <motion.div
                                                layoutId="auth-tab-pill"
                                                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                                                className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.35)]"
                                                style={{ zIndex: -1 }}
                                            />
                                        )}
                                        {t('login_tab') || 'Σύνδεση'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLogin(false);
                                            setFormError('');
                                        }}
                                        className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold relative z-10 transition-colors ${!isLogin ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                                            }`}
                                    >
                                        {!isLogin && (
                                            <motion.div
                                                layoutId="auth-tab-pill"
                                                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                                                className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl shadow-[0_4px_16px_rgba(124,58,237,0.35)]"
                                                style={{ zIndex: -1 }}
                                            />
                                        )}
                                        {t('register_tab') || 'Εγγραφή'}
                                    </button>
                                </div>

                                    {/* ── View A: Quick Choice (Google & Email Entry) ── */}
                                    {/* Kept permanently mounted in DOM so Google's rendered button iframe is preserved */}
                                    <div className={showEmailForm ? 'hidden' : 'space-y-4 animate-fade-in'}>
                                            {/* Google Sign-In */}
                                            {Capacitor.isNativePlatform() ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    type="button"
                                                    onClick={onGoogleLogin}
                                                    className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl 
                                                             border border-white/20 bg-white text-gray-900 font-bold text-sm 
                                                             shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all"
                                                >
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                    </svg>
                                                    <span>{isLogin ? 'Σύνδεση με Google' : 'Εγγραφή με Google'}</span>
                                                </motion.button>
                                            ) : gsiFailed ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    type="button"
                                                    onClick={() => window.__googleOAuthPopup?.()}
                                                    className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl
                                                             border border-white/20 bg-white text-gray-900 font-bold text-sm
                                                             shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all"
                                                >
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                    </svg>
                                                    <span>{isLogin ? 'Σύνδεση με Google' : 'Εγγραφή με Google'}</span>
                                                </motion.button>
                                            ) : (
                                                <div
                                                    id="google-signin-button"
                                                    className="w-full flex items-center justify-center rounded-2xl overflow-hidden min-h-[44px]"
                                                />
                                            )}

                                            {/* Modern Divider */}
                                            <div className="flex items-center gap-3 my-5">
                                                <div className="flex-1 h-px bg-white/10" />
                                                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                                                    {t('or_divider') || 'ή'}
                                                </span>
                                                <div className="flex-1 h-px bg-white/10" />
                                            </div>

                                            {/* Email Action Button */}
                                            <motion.button
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="button"
                                                onClick={() => setShowEmailForm(true)}
                                                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl
                                                         bg-white/[0.08] hover:bg-white/[0.12]
                                                         border border-white/15 hover:border-white/25
                                                         text-white font-bold text-sm
                                                         shadow-sm transition-all"
                                            >
                                                <Mail size={18} className="text-violet-400" />
                                                <span>{isLogin ? 'Σύνδεση με Email' : 'Εγγραφή με Email'}</span>
                                            </motion.button>

                                            {/* Trust features row for Sign Up */}
                                            {!isLogin && (
                                                <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-around text-[11px] text-gray-400">
                                                    <span className="flex items-center gap-1.5">
                                                        <CheckCircle2 size={13} className="text-emerald-400" /> 100% Δωρεάν
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <CheckCircle2 size={13} className="text-emerald-400" /> Χωρίς κάρτα
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <CheckCircle2 size={13} className="text-emerald-400" /> Ασφαλές
                                                    </span>
                                                </div>
                                            )}
                                    </div>
                                    {/* ── View B: Email & Password Form ── */}
                                    <div className={!showEmailForm ? 'hidden' : 'space-y-4 animate-fade-in'}>
                                            {/* Header with Back Button */}
                                            <div className="flex items-center justify-between mb-5">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowEmailForm(false);
                                                        setFormError('');
                                                    }}
                                                    className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors group"
                                                >
                                                    <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                                                        <ArrowLeft size={14} />
                                                    </div>
                                                    <span>{t('back') || 'Πίσω'}</span>
                                                </button>
                                                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                                    {isLogin ? 'Είσοδος' : 'Νέος Λογαριασμός'}
                                                </span>
                                            </div>

                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                {/* Email Input */}
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-300 mb-1.5 tracking-wide text-left">
                                                        Email
                                                    </label>
                                                    <div className="relative group">
                                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" size={17} />
                                                        <input
                                                            type="email"
                                                            value={email}
                                                            onChange={e => { setEmail(e.target.value); setFormError(''); }}
                                                            placeholder={t('email_placeholder') || 'youremail@gmail.com'}
                                                            required
                                                            autoComplete="email"
                                                            autoCapitalize="none"
                                                            spellCheck="false"
                                                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium
                                                                     bg-white/[0.05] hover:bg-white/[0.07] focus:bg-white/[0.08]
                                                                     border border-white/10 focus:border-violet-500
                                                                     focus:ring-4 focus:ring-violet-500/15
                                                                     text-white placeholder:text-gray-500
                                                                     outline-none transition-all duration-200"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Password Input */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <label className="text-xs font-semibold text-gray-300 tracking-wide text-left">
                                                            {t('password') || 'Κωδικός'}
                                                        </label>
                                                        {!isLogin && (
                                                            <span className="text-[10px] text-gray-400 font-medium">
                                                                Ελάχ. 8 χαρακτήρες
                                                            </span>
                                                        )}
                                                    </div>
                                                    <PasswordInput
                                                        value={password}
                                                        onChange={e => { setPassword(e.target.value); setFormError(''); }}
                                                        placeholder={t('password_placeholder') || '••••••••'}
                                                        icon={Lock}
                                                        required
                                                        inputClassName="bg-white/[0.05] hover:bg-white/[0.07] focus:bg-white/[0.08] border-white/10 focus:border-violet-500 text-white placeholder:text-gray-500 rounded-2xl py-3.5"
                                                    />
                                                </div>

                                                {/* Error banner */}
                                                {formError && (
                                                    <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-2xl flex flex-col gap-2 animate-fade-in">
                                                        <span>{formError}</span>
                                                        {formError === (t('email_in_use') || 'Το email χρησιμοποιείται ήδη.') && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIsLogin(true);
                                                                    setFormError('');
                                                                }}
                                                                className="text-violet-400 font-bold hover:underline self-start mt-0.5"
                                                            >
                                                                {t('login_now') || 'Σύνδεση τώρα'}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Remember Me & Forgot Password */}
                                                {isLogin && (
                                                    <div className="flex items-center justify-between pt-1">
                                                        <label
                                                            className="flex items-center gap-2 cursor-pointer group select-none"
                                                            onClick={() => setRememberMe(!rememberMe)}
                                                        >
                                                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${rememberMe
                                                                    ? 'bg-violet-600 border-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.5)]'
                                                                    : 'border-white/20 bg-white/5 group-hover:border-violet-400'
                                                                }`}>
                                                                {rememberMe && <Check size={11} className="text-white" strokeWidth={3} />}
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                                                                {t('remember_me') || 'Να με θυμάσαι'}
                                                            </span>
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowForgotModal(true)}
                                                            className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                                                        >
                                                            {t('forgot_password') || 'Ξέχασα τον κωδικό;'}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Submit Button */}
                                                <motion.button
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="w-full py-4 rounded-2xl font-bold text-sm text-white
                                                             bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-500
                                                             hover:from-violet-500 hover:to-indigo-500
                                                             shadow-[0_8px_25px_rgba(124,58,237,0.35)]
                                                             hover:shadow-[0_10px_30px_rgba(124,58,237,0.45)]
                                                             flex items-center justify-center gap-2
                                                             transition-all duration-200 mt-2
                                                             disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    {isLoading ? (
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <span>
                                                                {isLogin ? (t('login_btn') || 'Σύνδεση') : (t('register_btn') || 'Δημιουργία Λογαριασμού')}
                                                            </span>
                                                            <ArrowRight size={16} />
                                                        </>
                                                    )}
                                                </motion.button>
                                            </form>
                                    </div>

                                {/* Footer Toggle (Δεν έχεις λογαριασμό; / Έχεις ήδη;) */}
                                <div className="mt-6 pt-5 border-t border-white/[0.08] text-center">
                                    <p className="text-xs sm:text-sm text-gray-400 font-medium">
                                        {isLogin ? "Δεν έχεις λογαριασμό;" : "Έχεις ήδη λογαριασμό;"}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsLogin(!isLogin);
                                                setFormError('');
                                            }}
                                            className="ml-2 font-bold text-violet-400 hover:text-violet-300 hover:underline transition-colors"
                                        >
                                            {isLogin ? "Εγγραφή" : "Σύνδεση"}
                                        </button>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── Security Trust Footer ── */}
                <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 mt-6 sm:mt-8">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>Τραπεζική κρυπτογράφηση δεδομένων 256-bit</span>
                </div>
            </div>

            {/* ── Forgot Password Bottom Sheet / Modal ── */}
            <AnimatePresence>
                {showForgotModal && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-md"
                            onClick={() => setShowForgotModal(false)}
                        />

                        {/* Sheet Container */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                            className="relative z-10 w-full max-w-md
                                     bg-[#161424] text-white
                                     rounded-t-[32px] sm:rounded-[32px] p-6 sm:p-7
                                     border-t sm:border border-white/10
                                     shadow-2xl"
                        >
                            {/* Sheet Handle */}
                            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5 sm:hidden" />

                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                                        <KeyRound size={18} />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                                        {t('reset_password') || 'Επαναφορά Κωδικού'}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(false)}
                                    className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {resetStatus.success ? (
                                <div className="text-center py-6 space-y-2">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                                        <Check size={28} />
                                    </div>
                                    <p className="font-bold text-white text-base">
                                        {t('email_sent_title') || 'Στάλθηκε!'}
                                    </p>
                                    <p className="text-xs text-gray-400 leading-relaxed max-w-[280px] mx-auto">
                                        {t('email_sent_desc') || 'Ελέγξε τα εισερχόμενά σου για τον σύνδεσμο επαναφοράς.'}
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleForgotPassword} className="space-y-4">
                                    <p className="text-xs text-gray-400 leading-relaxed text-left">
                                        {t('reset_email_instruction') || 'Εισάγετε το email σας για να λάβετε σύνδεσμο επαναφοράς.'}
                                    </p>
                                    {resetStatus.error && (
                                        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
                                            {resetStatus.error}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-300 mb-1.5 text-left">
                                            Email
                                        </label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-400 transition-colors pointer-events-none" size={17} />
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={e => setResetEmail(e.target.value)}
                                                placeholder={t('email_placeholder') || 'youremail@gmail.com'}
                                                required
                                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium
                                                         bg-white/[0.05] hover:bg-white/[0.07] focus:bg-white/[0.08]
                                                         border border-white/10 focus:border-violet-500
                                                         text-white placeholder:text-gray-500
                                                         outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={resetStatus.loading}
                                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-500
                                                 text-white font-bold text-sm
                                                 shadow-[0_8px_25px_rgba(124,58,237,0.35)]
                                                 transition-all duration-200 disabled:opacity-60"
                                    >
                                        {resetStatus.loading ? (t('sending') || 'Αποστολή...') : (t('send_link') || 'Αποστολή Συνδέσμου')}
                                    </motion.button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LoginView;
