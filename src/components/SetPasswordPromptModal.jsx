import React, { useState } from 'react';
import { X, KeyRound, ShieldCheck, CheckCircle2 } from 'lucide-react';
import PasswordInput from './PasswordInput';
import { useSettings } from '../contexts/SettingsContext';
import { supabase } from '../supabase';

export default function SetPasswordPromptModal({ isOpen, onClose, onSuccess, user }) {
    const { t: translate } = useSettings();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !user) return null;

    const getStrength = (pwd) => {
        if (!pwd) return null;
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score <= 1 ? 'weak' : score <= 3 ? 'fair' : 'strong';
    };

    const strength = getStrength(newPassword);
    const bars = { weak: 1, fair: 2, strong: 3 }[strength] || 0;
    const colors = { weak: 'bg-rose-500', fair: 'bg-amber-400', strong: 'bg-emerald-500' };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError(translate('password_mismatch') || 'Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            setError(translate('password_length_error') || 'Password must be at least 8 characters');
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            setError(translate('password_uppercase_error') || 'Password must contain an uppercase letter');
            return;
        }
        if (!/[0-9]/.test(newPassword)) {
            setError(translate('password_digit_error') || 'Password must contain a number');
            return;
        }

        setLoading(true);
        try {
            const { data, error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
                data: {
                    has_set_password: true,
                    password_set_at: new Date().toISOString()
                }
            });

            if (updateError) throw updateError;
            onSuccess(data?.user || user);
        } catch (err) {
            setError(err.message || translate('error_message_generic') || 'Error setting password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose} />
            
            <div className="relative w-full max-w-sm sm:max-w-md bg-gray-100/95 dark:bg-surface-dark2 rounded-2xl overflow-hidden shadow-2xl border border-gray-300 dark:border-white/10 animate-scale-in">
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-white/10 flex items-start justify-between relative">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
                            <KeyRound size={20} strokeWidth={2.2} />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 uppercase tracking-wide">
                                <ShieldCheck size={12} />
                                {translate('set_password_badge') || 'Recommended'}
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 leading-tight">
                                {translate('set_password_title') || 'Create Account Password'}
                            </h3>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="w-8 h-8 rounded-lg bg-gray-200/60 dark:bg-white/[0.08] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-surface-dark3 border border-gray-200 dark:border-white/10 text-left">
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                            {translate('set_password_subtitle') || 'You signed in with Google. Set a password so you can always log in with your email if Google login is unavailable.'}
                        </p>
                        <p className="text-[11px] font-bold text-violet-600 dark:text-violet-400 mt-1 truncate">
                            {user.email}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-500/20 font-medium">
                            {error}
                        </div>
                    )}

                    <PasswordInput
                        label={translate('new_password') || 'New Password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={translate('new_password_placeholder') || '••••••••'}
                        autoComplete="new-password"
                        required
                    />

                    {newPassword.length > 0 && (
                        <div className="space-y-1">
                            <div className="flex gap-1.5">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= bars ? colors[strength] : 'bg-gray-200 dark:bg-white/10'}`} />
                                ))}
                            </div>
                            <p className={`text-[10px] font-semibold ${strength === 'weak' ? 'text-rose-500' : strength === 'fair' ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {translate(`password_strength_${strength}`) || strength}
                            </p>
                        </div>
                    )}

                    <PasswordInput
                        label={translate('confirm_new_password') || 'Confirm New Password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={translate('confirm_new_password_placeholder') || '••••••••'}
                        autoComplete="new-password"
                        required
                    />

                    <div className="pt-2 flex flex-col gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{translate('set_password_saving') || 'Saving...'}</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 size={16} />
                                    <span>{translate('set_password_btn') || 'Save Password'}</span>
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="w-full py-2.5 bg-transparent hover:bg-gray-200/50 dark:hover:bg-white/[0.05] text-gray-600 dark:text-gray-400 font-semibold rounded-xl text-xs transition-colors"
                        >
                            {translate('set_password_later') || 'Remind me later'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
