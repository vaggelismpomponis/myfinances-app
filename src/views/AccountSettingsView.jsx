import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, CheckCircle2, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../supabase';

const AccountSettingsView = ({ user, onBack, hideHeader }) => {
    const { t: translate } = useSettings();
    const { showToast } = useToast();
    const [imgRetries, setImgRetries] = useState(0);
    const MAX_IMG_RETRIES = 3;

    const photoURL = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.photoURL;
    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.displayName || user?.email?.split('@')[0] || translate('anonymous_user');
    const isGoogle = user?.app_metadata?.provider === 'google' || user?.app_metadata?.providers?.includes('google') || user?.identities?.some(i => i.provider === 'google');
    const provider = isGoogle ? 'Google' : 'Email / Password';
    const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(displayName);
    const [savingName, setSavingName] = useState(false);

    useEffect(() => { setImgRetries(0); }, [photoURL]);

    const handleSaveName = async () => {
        if (!nameInput.trim() || nameInput === displayName) { setEditingName(false); return; }
        setSavingName(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: nameInput.trim(), name: nameInput.trim() }
            });
            if (error) throw error;
            showToast(translate('name_updated_success') || 'Όνομα ενημερώθηκε!', 'success');
            setEditingName(false);
        } catch (e) {
            showToast(translate('name_update_error') || 'Σφάλμα ενημέρωσης.', 'error');
        } finally {
            setSavingName(false);
        }
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden">
            {/* ─────── Header ─────── */}
            <div className={`shrink-0 sticky top-0 z-20 transition-colors duration-300 ${hideHeader ? 'bg-transparent border-none px-4 pt-4 pb-2' : 'bg-gray-50 dark:bg-surface-dark backdrop-blur-xl border-b border-gray-100 dark:border-transparent px-4 pb-3'}`} style={!hideHeader ? { paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' } : {}}>
                <div className="flex items-center justify-center relative min-h-[32px]">
                    <button
                        onClick={onBack}
                        className="absolute left-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center text-gray-500 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/[0.14] active:scale-90 transition-all duration-150"
                    >
                        <ArrowLeft size={15} strokeWidth={2.5} />
                    </button>
                    {!hideHeader && (
                        <h1 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight text-center truncate px-10">
                            {translate('edit_profile') === 'edit_profile' ? 'Επεξεργασία προφίλ' : translate('edit_profile')}
                        </h1>
                    )}
                </div>
            </div>

            {/* ─────── Content ─────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* Avatar */}
                <div className="flex justify-center mt-6">
                    <div className="relative shrink-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-white/10 shadow-sm border-2 border-white dark:border-surface-dark3">
                            {photoURL && imgRetries < MAX_IMG_RETRIES ? (
                                <img
                                    src={imgRetries > 0 ? `${photoURL}${photoURL.includes('?') ? '&' : '?'}retry=${imgRetries}` : photoURL}
                                    alt="Profile"
                                    referrerPolicy="no-referrer"
                                    crossOrigin="anonymous"
                                    className="w-full h-full object-cover"
                                    onError={() => setTimeout(() => setImgRetries(prev => prev + 1), 500 * imgRetries)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User size={40} strokeWidth={1.5} className="text-gray-400 dark:text-white/40" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Name Edit */}
                <div className="bg-[#f5f5f5] dark:bg-white/[0.04] p-5 rounded-[20px] mb-3">
                    <label className="block text-[13px] font-bold text-gray-500 dark:text-white/50 mb-2">Όνομα Χρήστη / Username</label>
                    {editingName ? (
                        <div className="flex flex-col gap-3 w-full">
                            <input
                                autoFocus
                                value={nameInput}
                                onChange={e => setNameInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setEditingName(false); setNameInput(displayName); } }}
                                className="w-full text-[18px] leading-tight font-extrabold bg-white dark:bg-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all shadow-sm"
                            />
                            <div className="flex items-center gap-2">
                                <button onClick={handleSaveName} className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-[14px] rounded-full active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm">
                                    <CheckCircle2 size={16} /> {translate('save') === 'save' ? 'Αποθήκευση' : translate('save')}
                                </button>
                                <button onClick={() => { setEditingName(false); setNameInput(displayName); }} className="flex-1 py-2.5 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-white font-bold text-[14px] rounded-full active:scale-95 transition-all flex items-center justify-center gap-1.5">
                                    <X size={16} /> {translate('cancel') === 'cancel' ? 'Ακύρωση' : translate('cancel')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <h2 className="text-[19px] leading-tight font-extrabold text-gray-900 dark:text-white break-words line-clamp-2">
                                {displayName}
                            </h2>
                            <button
                                onClick={() => setEditingName(true)}
                                className="inline-flex items-center px-4 py-2 rounded-full bg-gray-200/60 dark:bg-white/10 text-[13px] font-bold text-gray-700 dark:text-white/90 active:scale-95 transition-transform hover:bg-gray-300/80 dark:hover:bg-white/20 shrink-0 ml-4"
                            >
                                {translate('edit') === 'edit' ? 'Επεξεργασία' : translate('edit')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Readonly details */}
                <div className="bg-[#f5f5f5] dark:bg-white/[0.04] p-5 rounded-[20px] space-y-4">
                    <div>
                        <span className="block text-[12px] font-bold text-gray-400 dark:text-white/40 mb-1">{translate('email') || 'Email'}</span>
                        <span className="block text-[15px] font-semibold text-gray-800 dark:text-white/90">{user?.email || '—'}</span>
                    </div>
                    <div>
                        <span className="block text-[12px] font-bold text-gray-400 dark:text-white/40 mb-1">{translate('provider') || 'Provider'}</span>
                        <span className="block text-[15px] font-semibold text-gray-800 dark:text-white/90 capitalize">{provider}</span>
                    </div>
                    <div>
                        <span className="block text-[12px] font-bold text-gray-400 dark:text-white/40 mb-1">{translate('member_since') || 'Member Since'}</span>
                        <span className="block text-[15px] font-semibold text-gray-800 dark:text-white/90">{createdAt}</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AccountSettingsView;
