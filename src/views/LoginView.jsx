import React, { useState } from 'react';
import { Wallet, Mail, Lock, ArrowRight, Eye, EyeOff, X, Check, Sparkles } from 'lucide-react';
import { supabase } from '../supabase';
import { useSettings } from '../contexts/SettingsContext';
import { Capacitor } from '@capacitor/core';
import { validateEmail } from '../utils/emailValidation';
import PasswordInput from '../components/PasswordInput';

const InputField = ({ label, type, value, onChange, placeholder, icon: Icon, rightElement }) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-300 mb-1.5 ml-0.5 uppercase tracking-wider">
            {label}
        </label>
        <div className="relative">
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
                className="input-glow w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium
                           bg-gray-50 dark:bg-white/5
                           border border-gray-200 dark:border-transparent
                           text-gray-800 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400
                           transition-all duration-200"
            />
            {rightElement && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {rightElement}
                </div>
            )}
        </div>
    </div>
);

const LoginView = ({ onEmailLogin, onRegister, onGoogleLogin }) => {
    const { t } = useSettings();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetStatus, setResetStatus] = useState({ loading: false, success: false, error: '' });
    const [formError, setFormError] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!email || !password) return;

        // Comprehensive email validation
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            // Block disposable only on registration. Allow login for existing accounts (even if disposable).
            if (!isLogin || emailValidation.errorKey === 'invalid_email_format') {
                setFormError(t(emailValidation.errorKey));
                return;
            }
        }
        // Minimum password length check before hitting the API
        if (!isLogin && password.length < 8) {
            setFormError(t('password_length_error'));
            return;
        }

        setIsLoading(true);
        try {
            if (isLogin) {
                await onEmailLogin(email, password);
            } else {
                await onRegister(email, password);
            }
        } catch (err) {
            setIsLoading(false);
            // Show server errors inline for better UX
            let msg = t('error_prefix') + (err.message || t('something_went_wrong'));
            if (err.message?.includes('Invalid login credentials') || err.message?.includes('invalid_credentials')) {
                msg = t('wrong_password');
            } else if (err.message?.includes('already registered') || err.message?.includes('User already registered')) {
                msg = t('email_in_use');
            } else if (err.status === 429 || err.message?.includes('too many requests')) {
                msg = t('rate_limit_error');
            }
            setFormError(msg);
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
            let msg = t('email_send_error');
            if (error.message?.includes('not found') || error.message?.includes('User not found')) {
                msg = t('user_not_found');
            }
            setResetStatus({ loading: false, success: false, error: msg });
        }
    };

    return (
        <div className="relative flex flex-col items-center h-[100dvh]
                        mesh-bg overflow-y-auto overflow-x-hidden px-5 py-8">

            {/* Ambient blobs */}
            <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full
                            bg-violet-600/20 blur-[100px] animate-float pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 w-60 h-60 rounded-full
                            bg-cyan-500/15 blur-[80px] pointer-events-none" />

            <div className="w-full max-w-sm flex flex-col justify-center my-auto py-4">
                {/* Logo area */}
                <div className="flex flex-col items-center mb-10 animate-slide-in-up">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 rounded-3xl bg-violet-600/30 blur-xl scale-125 animate-glow-pulse" />
                        <div className="relative w-24 h-24 flex items-center justify-center z-10 transition-transform hover:scale-105 duration-300">
                            <img src="/spendwise-logo.png" alt="SpendWise Icon" className="w-20 h-20 drop-shadow-2xl object-contain" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black gradient-text tracking-tighter">SpendWise</h1>
                    </div>
                    <p className="text-gray-400 text-sm mt-3 font-medium opacity-80 uppercase tracking-widest">
                        {isLogin ? t('login_welcome_back') : t('login_start_free')}
                    </p>
                </div>

                {/* Card */}
                <div className="w-full animate-slide-in-up"
                    style={{ animationDelay: '0.08s' }}>

                    {/* Toggle tabs */}
                    <div className="flex rounded-2xl bg-white/5 border border-white/10 p-1 mb-6">
                        {[t('login_tab'), t('register_tab')].map((lbl, i) => {
                            const active = isLogin === (i === 0);
                            return (
                                <button key={lbl}
                                    onClick={() => setIsLogin(i === 0)}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-250
                                                ${active
                                            ? 'bg-white dark:bg-white/10 text-violet-600 dark:text-white shadow-sm'
                                            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                                        }`}>
                                    {lbl}
                                </button>
                            );
                        })}
                    </div>

                    {/* Glass form card */}
                    <div className="glass-light dark:glass rounded-3xl p-6 shadow-glass">
                        {/* Google Sign-In — native button (shows "SpendWise" in popup via GSI) */}
                        {Capacitor.isNativePlatform() ? (
                            <button
                                type="button"
                                onClick={onGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl 
                                           border border-gray-200 dark:border-white/10 
                                           bg-white dark:bg-white/5 
                                           text-gray-700 dark:text-white font-bold text-sm 
                                           transition-all active:scale-[0.98] shadow-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                {t('continue_google')}
                            </button>
                        ) : (
                            <div
                                id="google-signin-button"
                                className="w-full flex items-center justify-center rounded-xl overflow-hidden"
                                style={{ minHeight: '44px' }}
                            />
                        )}

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('or_divider')}</span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <InputField
                                label="Email"
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setFormError(''); }}
                                placeholder={t('email_placeholder')}
                                icon={Mail}
                            />
                            <PasswordInput
                                 label={t('password')}
                                 value={password}
                                 onChange={e => { setPassword(e.target.value); setFormError(''); }}
                                 placeholder={t('password_placeholder')}
                                 icon={Lock}
                                 required
                             />

                            {formError && (
                                <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-xl">
                                    {formError}
                                </div>
                            )}

                            {isLogin && (
                                <div className="flex items-center justify-between">
                                    <label
                                        className="flex items-center gap-2 cursor-pointer group"
                                        onClick={() => setRememberMe(!rememberMe)}
                                    >
                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                                                     ${rememberMe
                                                ? 'bg-violet-600 border-violet-600'
                                                : 'border-gray-300 group-hover:border-violet-500'}`}>
                                            {rememberMe && <Check size={10} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 select-none">{t('remember_me')}</span>
                                    </label>
                                    <button type="button" onClick={() => setShowForgotModal(true)}
                                        className="text-xs font-bold text-violet-600 dark:text-violet-400
                                                   hover:text-violet-500 transition-colors">
                                        {t('forgot_password')}
                                    </button>
                                </div>
                            )}

                            <button type="submit" disabled={isLoading}
                                className="w-full py-3.5 rounded-xl font-bold text-sm text-white
                                           bg-gradient-to-r from-violet-600 to-violet-700
                                           hover:from-violet-500 hover:to-violet-600
                                           shadow-glow-sm active:scale-[0.98]
                                           flex items-center justify-center gap-2
                                           transition-all duration-200 mt-2
                                           disabled:opacity-60 disabled:cursor-not-allowed">
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? t('login_btn') : t('register_btn')}
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowForgotModal(false)} />
                    <div className="relative z-10 w-full max-w-md
                                    bg-white dark:bg-surface-dark2
                                    rounded-t-[32px] p-7
                                    border-t border-x border-gray-200 dark:border-white/10
                                    shadow-2xl animate-slide-up">
                        {/* Handle */}
                        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-5" />

                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('reset_password')}</h3>
                            <button onClick={() => setShowForgotModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10
                                               text-gray-500 dark:text-gray-400 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {resetStatus.success ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30
                                                flex items-center justify-center mx-auto mb-4">
                                    <Check size={28} className="text-emerald-600" />
                                </div>
                                <p className="font-semibold text-gray-900 dark:text-white mb-1">{t('email_sent_title')}</p>
                                <p className="text-sm text-gray-500">{t('email_sent_desc')}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-200 leading-relaxed">
                                    {t('reset_email_instruction')}
                                </p>
                                {resetStatus.error && (
                                    <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400
                                                    text-xs p-3 rounded-xl">
                                        {resetStatus.error}
                                    </div>
                                )}
                                <InputField
                                    label="Email"
                                    type="email"
                                    value={resetEmail}
                                    onChange={e => setResetEmail(e.target.value)}
                                    placeholder={t('email_placeholder')}
                                    icon={Mail}
                                />
                                <button type="submit" disabled={resetStatus.loading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700
                                                   text-white font-bold text-sm
                                                   shadow-glow-sm hover:from-violet-500 active:scale-[0.98]
                                                   transition-all duration-200 disabled:opacity-60">
                                    {resetStatus.loading ? t('sending') : t('send_link')}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginView;









