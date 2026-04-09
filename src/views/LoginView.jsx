import React, { useState } from 'react';
import { Wallet, Mail, Lock, ArrowRight, Eye, EyeOff, X, Check, Sparkles } from 'lucide-react';
import { auth } from '../firebase';
import {
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'firebase/auth';

const InputField = ({ label, type, value, onChange, placeholder, icon: Icon, rightElement }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1.5 ml-0.5">
            {label}
        </label>
        <div className="relative">
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
                className="input-glow w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium
                           bg-gray-50 dark:bg-white/5
                           border border-gray-200
                           text-gray-800 dark:text-white
                           placeholder-gray-400 dark:placeholder-gray-600
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

const LoginView = ({ onGoogleLogin, onEmailLogin, onRegister }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetStatus, setResetStatus] = useState({ loading: false, success: false, error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return;
        setIsLoading(true);
        try {
            if (isLogin) {
                await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
                await onEmailLogin(email, password);
            } else {
                await onRegister(email, password);
            }
        } catch {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!resetEmail) return;
        setResetStatus({ loading: true, success: false, error: '' });
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetStatus({ loading: false, success: true, error: '' });
            setTimeout(() => {
                setShowForgotModal(false);
                setResetStatus({ loading: false, success: false, error: '' });
                setResetEmail('');
            }, 3000);
        } catch (error) {
            let msg = 'Σφάλμα αποστολής email.';
            if (error.code === 'auth/user-not-found') msg = 'Δεν υπάρχει χρήστης με αυτό το email.';
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
                <div className="flex flex-col items-center mb-8 animate-slide-in-up">
                    <div className="relative mb-4">
                    <div className="absolute inset-0 rounded-2xl bg-violet-600/50 blur-lg scale-110 animate-glow-pulse" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-700
                                    rounded-2xl flex items-center justify-center
                                    shadow-glow-violet border border-violet-400/30 rotate-3">
                        <div className="absolute top-1 left-1.5 w-8 h-3 bg-white/20 rounded-full blur-sm rotate-[-25deg]" />
                        <Wallet size={28} className="text-white relative z-10" />
                    </div>
                </div>
                <h1 className="text-3xl font-black gradient-text tracking-tight">SpendWise</h1>
                <p className="text-gray-400 text-sm mt-1 font-medium">
                    {isLogin ? 'Καλωσήρθες πίσω! 👋' : 'Ξεκίνα σήμερα. Δωρεάν!'}
                </p>
            </div>

            {/* Card */}
            <div className="w-full animate-slide-in-up"
                style={{ animationDelay: '0.08s' }}>

                {/* Toggle tabs */}
                <div className="flex rounded-2xl bg-white/5 border border-white/10 p-1 mb-6">
                    {['Σύνδεση', 'Εγγραφή'].map((lbl, i) => {
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InputField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            icon={Mail}
                        />
                        <InputField
                            label="Κωδικός"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            icon={Lock}
                            rightElement={
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            }
                        />

                        {isLogin && (
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                                                     ${rememberMe
                                            ? 'bg-violet-600 border-violet-600'
                                            : 'border-gray-300 group-hover:border-violet-500'}`}
                                        onClick={() => setRememberMe(!rememberMe)}>
                                        {rememberMe && <Check size={10} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Να με θυμάσαι</span>
                                </label>
                                <button type="button" onClick={() => setShowForgotModal(true)}
                                    className="text-xs font-bold text-violet-600 dark:text-violet-400
                                                   hover:text-violet-500 transition-colors">
                                    Ξέχασα τον κωδικό;
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
                                    <Sparkles size={16} />
                                    {isLogin ? 'Σύνδεση' : 'Δημιουργία Λογαριασμού'}
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                        <span className="text-xs font-medium text-gray-400 dark:text-gray-600">ή</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                    </div>

                    {/* Google Button */}
                    <button onClick={onGoogleLogin}
                        className="w-full py-3 rounded-xl font-semibold text-sm
                                       bg-white dark:bg-white/8 dark:hover:bg-white/12
                                       border border-gray-200
                                       text-gray-700 dark:text-gray-200
                                       flex items-center justify-center gap-3
                                       hover:shadow-md active:scale-[0.98]
                                       transition-all duration-200">
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Συνέχεια με Google
                    </button>
                </div>
            </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowForgotModal(false)} />
                    <div className="relative z-10 w-full max-w-md
                                    glass-light dark:bg-surface-dark2/95
                                    rounded-t-[2rem] p-7
                                    border-t border-x border-white/30
                                    shadow-2xl animate-slide-up">
                        {/* Handle */}
                        <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-5" />

                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Επαναφορά Κωδικού</h3>
                            <button onClick={() => setShowForgotModal(false)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10
                                               text-gray-400 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {resetStatus.success ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30
                                                flex items-center justify-center mx-auto mb-4">
                                    <Check size={28} className="text-emerald-600" />
                                </div>
                                <p className="font-semibold text-gray-900 dark:text-white mb-1">Στάλθηκε!</p>
                                <p className="text-sm text-gray-500">Ελέγξε τα εισερχόμενά σου.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Εισάγετε το email σας για να λάβετε σύνδεσμο επαναφοράς.
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
                                    placeholder="name@example.com"
                                    icon={Mail}
                                />
                                <button type="submit" disabled={resetStatus.loading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-700
                                                   text-white font-bold text-sm
                                                   shadow-glow-sm hover:from-violet-500 active:scale-[0.98]
                                                   transition-all duration-200 disabled:opacity-60">
                                    {resetStatus.loading ? 'Αποστολή...' : 'Αποστολή Συνδέσμου'}
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
