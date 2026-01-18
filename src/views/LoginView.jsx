import React, { useState } from 'react';
import { Wallet, Mail, Lock, User, ArrowRight, Eye, EyeOff, X, Check } from 'lucide-react';
import { auth } from '../firebase';
import {
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'firebase/auth';

const LoginView = ({ onGoogleLogin, onEmailLogin, onRegister }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Forgot Password State
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetStatus, setResetStatus] = useState({ loading: false, success: false, error: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsLoading(true);
        try {
            if (isLogin) {
                // Set Persistence based on "Remember Me"
                await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
                await onEmailLogin(email, password);
            } else {
                await onRegister(email, password);
            }
        } catch (error) {
            // Error is handled in App.jsx but we stop loading here if it throws back
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
            console.error("Reset password error:", error);
            let msg = "Σφάλμα αποστολής email.";
            if (error.code === 'auth/user-not-found') msg = "Δεν υπάρχει χρήστης με αυτό το email.";
            setResetStatus({ loading: false, success: false, error: msg });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">

            {/* Logo */}
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-200 dark:shadow-none rotate-3">
                <Wallet size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">MyFinances</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Διαχειρίσου τα οικονομικά σου.</p>

            <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-300">

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Email</label>
                        <div className="relative mt-1">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl py-3 pl-10 pr-4 text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-700 transition-all font-medium"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Κωδικός</label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl py-3 pl-10 pr-12 text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-700 transition-all font-medium"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {isLogin && (
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <span className="text-xs font-medium">Να με θυμάσαι</span>
                            </label>

                            <button
                                type="button"
                                onClick={() => setShowForgotModal(true)}
                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                            >
                                Ξέχασα τον κωδικό μου;
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                {isLogin ? 'Σύνδεση' : 'Εγγραφή'} <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative flex py-2 items-center mb-6">
                    <div className="flex-grow border-t border-gray-100 dark:border-gray-700"></div>
                    <span className="flex-shrink-0 mx-4 text-xs font-medium text-gray-400">Ή συνέχισε με</span>
                    <div className="flex-grow border-t border-gray-100 dark:border-gray-700"></div>
                </div>

                {/* Google Button */}
                <button
                    onClick={onGoogleLogin}
                    className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl shadow-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors active:scale-95"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Google
                </button>

            </div>

            {/* Toggle Mode */}
            <div className="mt-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {isLogin ? 'Δεν έχεις λογαριασμό;' : 'Έχεις ήδη λογαριασμό;'}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-2 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                    >
                        {isLogin ? 'Εγγραφή' : 'Σύνδεση'}
                    </button>
                </p>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForgotModal(false)} />
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Επαναφορά Κωδικού</h3>
                            <button onClick={() => setShowForgotModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={20} />
                            </button>
                        </div>

                        {resetStatus.success ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check size={32} className="text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-gray-800 dark:text-white font-medium mb-2">Στάλθηκε email!</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Ελέγξτε τα εισερχόμενά σας (και τα spam) για οδηγίες επαναφοράς.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Συμπληρώστε το email σας και θα σας στείλουμε έναν σύνδεσμο για να ορίσετε νέο κωδικό.
                                </p>

                                {resetStatus.error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs p-3 rounded-xl">
                                        {resetStatus.error}
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Email</label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-xl py-3 pl-10 pr-4 text-gray-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-700 transition-all font-medium"
                                            placeholder="name@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={resetStatus.loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
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
