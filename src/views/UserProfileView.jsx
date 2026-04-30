import React, { useState, useRef } from 'react';
import {
    ArrowLeft, User, Camera, Mail, Shield,
    ChevronRight, Trash2, AlertTriangle, X,
    CheckCircle2, Pencil, Phone, Calendar,
    Eye, EyeOff
} from 'lucide-react';
import PasswordInput from '../components/PasswordInput';
import { supabase } from '../supabase';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';

/* ─── helpers ─── */
const SectionLabel = ({ children }) => (
    <p className="text-[12px] font-semibold text-gray-400 dark:text-white/50 mb-2 px-1">
        {children}
    </p>
);

const InfoRow = ({ icon: Icon, label, value, last = false }) => (
    <div className={`flex items-center gap-3.5 px-4 py-[14px]
                     ${!last ? 'border-b border-gray-100 dark:border-transparent' : ''}`}>
        <Icon size={18} className="text-gray-400 dark:text-white/60 flex-shrink-0" strokeWidth={1.9} />
        <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-400 dark:text-white/60 mb-0.5">{label}</p>
            <p className="text-[14px] font-medium text-gray-800 dark:text-white/90 truncate">{value}</p>
        </div>
    </div>
);

const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-surface-dark3 rounded-2xl overflow-hidden
                     border border-gray-100 dark:border-transparent
                     shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_12px_rgba(0,0,0,0.3)] ${className}`}>
        {children}
    </div>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
 ═══════════════════════════════════════════════════════════ */
const UserProfileView = ({ user, onBack, onSignOut }) => {
    const { t: translate } = useSettings();
    const { showToast } = useToast();

    const photoURL = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name
        || user?.email?.split('@')[0] || translate('anonymous_user');
    const provider = user?.app_metadata?.provider === 'google' ? 'Google' : 'Email / Password';
    const createdAt = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—';

    const [imgError, setImgError] = useState(false);

    // Edit name
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(displayName);
    const [savingName, setSavingName] = useState(false);

    // Delete account
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const isPasswordUser = user?.app_metadata?.provider === 'email'
        || user?.identities?.some(i => i.provider === 'email');

    /* ── Save display name ── */
    const handleSaveName = async () => {
        if (!nameInput.trim() || nameInput === displayName) { setEditingName(false); return; }
        setSavingName(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: nameInput.trim(), name: nameInput.trim() }
            });
            if (error) throw error;
            showToast(translate('name_updated_success') || 'Το όνομα ενημερώθηκε!', 'success');
            setEditingName(false);
        } catch (e) {
            showToast(translate('name_update_error') || 'Αποτυχία ενημέρωσης.', 'error');
        } finally {
            setSavingName(false);
        }
    };

    /* ── Delete account ── */
    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setIsDeleting(true);
        try {
            if (isPasswordUser) {
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: deletePassword
                });
                if (authError) throw new Error('wrong_password');
            }
            const tables = ['transactions', 'recurring_transactions', 'goals', 'budgets', 'sessions'];
            for (const table of tables) {
                await supabase.from(table).delete().eq('user_id', user.id);
            }
            await supabase.rpc('delete_user');
            showToast(translate('account_deleted_successfully'), 'success');
        } catch (error) {
            if (error.message === 'wrong_password') {
                showToast(translate('current_password_error'), 'error');
            } else {
                showToast(translate('error_message_generic'), 'error');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark animate-fade-in flex flex-col transition-colors duration-300 overflow-hidden">

            {/* ── Header ── */}
            <div
                className="shrink-0 bg-gray-50 dark:bg-surface-dark
                            border-b border-gray-100 dark:border-transparent
                            px-4 pb-3 sticky top-0 z-10 backdrop-blur-xl transition-colors duration-300"
                style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
            >
                <div className="flex items-center justify-center relative min-h-[32px]">
                    <button
                        onClick={onBack}
                        className="absolute left-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.08]
                                   flex items-center justify-center
                                   text-gray-500 dark:text-white/50
                                   hover:bg-gray-200 dark:hover:bg-white/[0.14]
                                   active:scale-90 transition-all duration-150"
                    >
                        <ArrowLeft size={15} strokeWidth={2.5} />
                    </button>
                    <h1 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight text-center">
                        {translate('profile_details') || 'Profile details'}
                    </h1>
                </div>
            </div>

            {/* ── Scrollable Content ── */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 pb-12 space-y-5">

                    {/* ── Avatar + Name Hero ── */}
                    <div className="flex flex-col items-center pt-4 pb-2 gap-3">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-[80px] h-[80px] rounded-full overflow-hidden
                                            bg-violet-100 dark:bg-violet-500/20
                                            border-2 border-violet-200 dark:border-violet-500/30
                                            shadow-[0_4px_20px_rgba(109,40,217,0.2)]">
                                {photoURL && !imgError ? (
                                    <img
                                        src={photoURL}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User size={32} strokeWidth={1.5} className="text-violet-500 dark:text-violet-400" />
                                    </div>
                                )}
                            </div>
                            {/* Online dot */}
                            <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full
                                            bg-emerald-400 border-2 border-white dark:border-surface-dark
                                            shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                        </div>

                        {/* Display Name (editable) */}
                        {editingName ? (
                            <div className="flex items-center gap-2 w-full max-w-[300px]">
                                <div className="relative flex-1">
                                    <input
                                        autoFocus
                                        value={nameInput}
                                        onChange={e => setNameInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                                        className="w-full text-center text-[17px] font-bold
                                                   bg-white dark:bg-white/[0.07]
                                                   border border-violet-200 dark:border-violet-500/30
                                                   rounded-2xl px-4 py-2.5
                                                   text-gray-900 dark:text-white
                                                   focus:outline-none focus:ring-4 focus:ring-violet-500/15
                                                   transition-all shadow-sm"
                                    />
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        onClick={handleSaveName}
                                        disabled={savingName}
                                        className="w-10 h-10 rounded-xl bg-violet-600 
                                                   flex items-center justify-center
                                                   text-white shadow-lg shadow-violet-500/30
                                                   active:scale-90 hover:scale-105 transition-all disabled:opacity-50"
                                        title="Save"
                                    >
                                        {savingName
                                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            : <CheckCircle2 size={18} />
                                        }
                                    </button>
                                    <button
                                        onClick={() => { setEditingName(false); setNameInput(displayName); }}
                                        className="w-10 h-10 rounded-xl bg-white dark:bg-white/[0.08]
                                                   border border-gray-100 dark:border-transparent
                                                   flex items-center justify-center
                                                   text-gray-400 dark:text-white/60
                                                   shadow-sm active:scale-90 hover:scale-105 transition-all"
                                        title="Cancel"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setEditingName(true)}
                                className="group flex items-center gap-2"
                            >
                                <span className="text-[19px] font-bold text-gray-900 dark:text-white">
                                    {displayName}
                                </span>
                                <Pencil
                                    size={13}
                                    className="text-gray-300 dark:text-white/40
                                               group-hover:text-violet-500 dark:group-hover:text-violet-400
                                               transition-colors duration-150"
                                />
                            </button>
                        )}

                        <p className="text-[12.5px] text-gray-400 dark:text-white/35">
                            {user?.email}
                        </p>
                    </div>

                    {/* ── Account Info ── */}
                    <div>
                        <SectionLabel>{translate('account_info') || 'Account info'}</SectionLabel>
                        <Card>
                            <InfoRow
                                icon={Mail}
                                label={translate('email') || 'Email'}
                                value={user?.email || '—'}
                            />
                            <InfoRow
                                icon={Shield}
                                label={translate('login_method') || 'Login method'}
                                value={provider}
                            />
                            <InfoRow
                                icon={Calendar}
                                label={translate('member_since') || 'Member since'}
                                value={createdAt}
                                last
                            />
                        </Card>
                    </div>

                    {/* ── Danger Zone ── */}
                    <div>
                        <SectionLabel>{translate('danger_zone') || 'Danger zone'}</SectionLabel>
                        <Card>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full flex items-center gap-3.5 px-4 py-[14px] text-left
                                           hover:bg-rose-50/50 dark:hover:bg-rose-500/[0.06]
                                           active:bg-rose-50 dark:active:bg-rose-500/10
                                           transition-all duration-150"
                            >
                                <Trash2 size={18} className="text-rose-500 flex-shrink-0" strokeWidth={1.9} />
                                <span className="flex-1 text-[14.5px] font-medium text-rose-500">
                                    {translate('deactivate_account') || 'Deactivate my account'}
                                </span>
                                <ChevronRight size={16} className="text-rose-300 dark:text-rose-500/40 flex-shrink-0" />
                            </button>
                        </Card>
                        <p className="text-[11px] text-gray-400 dark:text-white/25 mt-2 px-2">
                            {translate('data_deletion_warning') || 'Data deletion is irreversible.'}
                        </p>
                    </div>

                </div>
            </div>

            {/* ── Delete Account Modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0
                                    bg-white dark:bg-surface-dark2 rounded-3xl p-6
                                    shadow-2xl border border-gray-100 dark:border-transparent
                                    animate-slide-up">

                        {/* Icon */}
                        <div className="flex flex-col items-center mb-6 text-center">
                            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/15 rounded-2xl
                                            flex items-center justify-center mb-4
                                            shadow-[0_0_24px_rgba(239,68,68,0.15)]">
                                <AlertTriangle size={28} className="text-rose-500" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-[18px] font-bold text-gray-900 dark:text-white mb-2">
                                {translate('delete_account')}
                            </h3>
                            <p className="text-[13px] text-gray-500 dark:text-white/60 leading-relaxed">
                                {translate('delete_account_confirm_message')}
                            </p>
                        </div>

                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                            {isPasswordUser ? (
                                    <PasswordInput
                                        label={translate('confirm_password_instruction')}
                                        value={deletePassword}
                                        onChange={e => setDeletePassword(e.target.value)}
                                        placeholder={translate('password_input_placeholder')}
                                        required
                                    />
                            ) : (
                                <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4
                                                border border-gray-100 dark:border-transparent
                                                text-[13px] text-gray-600 dark:text-white/50">
                                    {translate('google_reauth_instruction')}
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3.5 bg-gray-100 dark:bg-white/[0.06]
                                               text-gray-700 dark:text-white/60 font-bold rounded-xl
                                               hover:bg-gray-200 dark:hover:bg-white/[0.1]
                                               active:scale-95 transition-all text-[14px]"
                                >
                                    {translate('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isDeleting}
                                    className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600
                                               text-white font-bold rounded-xl
                                               shadow-[0_4px_16px_rgba(239,68,68,0.35)]
                                               active:scale-95 transition-all disabled:opacity-50 text-[14px]"
                                >
                                    {isDeleting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            {translate('deleting')}
                                        </span>
                                    ) : translate('delete_btn')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfileView;









