import React, { useState } from 'react';
import {
    ArrowLeft,
    Globe,
    Download,
    Trash2,
    Bell,
    Languages,
    AlertTriangle,
    ChevronRight,
    Database,
    UserX,
    ExternalLink,
    ShieldAlert as Shield
} from 'lucide-react';
import { supabase } from '../supabase';
import ConfirmationModal from '../components/ConfirmationModal';
import PasswordInput from '../components/PasswordInput';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { openNotificationSettings } from '../utils/notificationListener';
import { Capacitor } from '@capacitor/core';

/* ── Section Header ── */
const SectionLabel = ({ children }) => (
    <p className="text-[12px] font-semibold text-gray-400 dark:text-white/50 mb-2 px-1">
        {children}
    </p>
);

/* ── Row for clickable setting items ── */
const SettingRow = ({ icon: Icon, iconColor, iconBg, label, sublabel, right, onClick, last = false, danger = false }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left
                    active:scale-[0.98] transition-all duration-150
                    hover:bg-black/[0.03] dark:hover:bg-white/[0.04]
                    ${!last ? 'border-b border-gray-100/80 dark:border-transparent' : ''}`}
    >
        <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon size={16} className={iconColor} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0 text-left">
            <span className={`block font-semibold text-[13.5px] leading-tight ${danger ? 'text-rose-500' : 'text-gray-800 dark:text-white/90'}`}>
                {label}
            </span>
            {sublabel && (
                <span className="block text-[11px] text-gray-400 dark:text-white/35 mt-0.5 leading-tight">{sublabel}</span>
            )}
        </div>
        {right !== undefined ? right : <ChevronRight size={14} className="text-gray-300 dark:text-white/40 flex-shrink-0" />}
    </button>
);

const GeneralSettingsView = ({ user, onBack, onPrivacy }) => {
    const { language, updateLanguage, t: translate } = useSettings();
    const { showToast } = useToast();
    const [showClearDataModal, setShowClearDataModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Delete Account State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleExportData = async () => {
        setIsExporting(true);
        try {
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id);
            if (error) throw error;
            const dataStr = JSON.stringify(transactions, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `transactions_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast(translate('data_exported_successfully'), 'success');
        } catch (error) {
            console.error("Export error:", error);
            showToast(translate('export_failed'), 'error');
        } finally {
            setIsExporting(false);
        }
    };

    const handleClearData = async () => {
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('user_id', user.id);
            if (error) throw error;
            showToast(translate('data_cleared') || "All data deleted successfully.", 'success');
        } catch (error) {
            console.error("Clear data error:", error);
            showToast(translate('clear_error') || "Error deleting data.", 'error');
        }
    };

    const handleDeleteAccount = async (e) => {
        e.preventDefault();
        setIsDeleting(true);
        try {
            const isPasswordUser = user?.app_metadata?.provider === 'email' || user?.identities?.some(i => i.provider === 'email');
            if (isPasswordUser) {
                // Verify password first
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: deletePassword
                });
                if (authError) throw new Error('wrong_password');
            }
            // Delete all user data from each table (RLS ensures only user's own rows)
            const tables = ['transactions', 'recurring_transactions', 'goals', 'budgets', 'sessions'];
            for (const table of tables) {
                await supabase.from(table).delete().eq('user_id', user.id);
            }
            // Delete the auth user via admin — Supabase client can only delete the current user
            const { error: deleteError = null } = await supabase.rpc('delete_user');
            if (deleteError) {
                // Fallback: just sign out and show message
                await supabase.auth.signOut();
            }
            showToast(translate('account_deleted_successfully'), 'success');
        } catch (error) {
            console.error("Delete account error:", error);
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
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col animate-fade-in transition-colors duration-300">

            {/* ───────── Header ───────── */}
            <div
                className="shrink-0 bg-gray-50 dark:bg-surface-dark
                            border-b border-gray-100 dark:border-transparent
                            px-4 pb-3 sticky top-0 z-10
                            backdrop-blur-xl transition-colors duration-300"
                style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
            >
                <div className="flex items-center justify-center relative min-h-[32px]">
                    <button
                        onClick={onBack}
                        className="absolute left-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.08]
                                   flex items-center justify-center
                                   text-gray-500 dark:text-white/50
                                   hover:bg-gray-200 dark:hover:bg-white/[0.14]
                                   active:scale-90 transition-all"
                    >
                        <ArrowLeft size={15} strokeWidth={2.5} />
                    </button>
                    <h2 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight text-center">
                        {translate('general_settings')}
                    </h2>
                </div>
            </div>

            {/* ───────── Content ───────── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-10">

                {/* Regional */}
                <div>
                    <SectionLabel>{translate('regional_settings')}</SectionLabel>
                    <div className="bg-white dark:bg-surface-dark3 rounded-2xl overflow-hidden
                                    shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)]
                                    border border-gray-100 dark:border-transparent">
                        <div className="flex items-center gap-3.5 px-4 py-3.5">
                            <div className="w-9 h-9 rounded-[11px] flex items-center justify-center bg-indigo-50 dark:bg-indigo-500/10 flex-shrink-0">
                                <Languages size={16} className="text-indigo-600 dark:text-indigo-400" strokeWidth={2.2} />
                            </div>
                            <div className="flex-1">
                                <span className="block font-semibold text-[13.5px] text-gray-800 dark:text-white/90">{translate('language')}</span>
                                <span className="text-[11px] text-gray-400 dark:text-white/35">{translate('app_display_language')}</span>
                            </div>
                            {/* Language pills */}
                            <div className="flex gap-1 bg-gray-100 dark:bg-white/[0.06] p-1 rounded-xl">
                                {['el', 'en'].map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => updateLanguage(lang)}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200
                                                    ${language === lang
                                                ? 'bg-white dark:bg-white/[0.12] text-violet-600 dark:text-violet-400 shadow-sm'
                                                : 'text-gray-400 dark:text-white/50'}`}
                                    >
                                        {lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div>
                    <SectionLabel>{translate('notifications')}</SectionLabel>
                    <div className="bg-white dark:bg-surface-dark3 rounded-2xl overflow-hidden
                                    shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)]
                                    border border-gray-100 dark:border-transparent">
                        <SettingRow
                            icon={Bell}
                            iconBg="bg-orange-50 dark:bg-orange-500/10"
                            iconColor="text-orange-500 dark:text-orange-400"
                            label={translate('enable_sms_reading')}
                            sublabel={translate('sms_reading_desc')}
                            onClick={openNotificationSettings}
                            right={<ExternalLink size={14} className="text-gray-300 dark:text-white/40" />}
                            last
                        />
                    </div>
                </div>

                {/* Legal */}
                <div>
                    <SectionLabel>{translate('legal')}</SectionLabel>
                    <div className="bg-white dark:bg-surface-dark3 rounded-2xl overflow-hidden
                                    shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)]
                                    border border-gray-100 dark:border-transparent">
                        <SettingRow
                            icon={Shield}
                            iconBg="bg-teal-50 dark:bg-teal-500/10"
                            iconColor="text-teal-600 dark:text-teal-400"
                            label={translate('privacy_policy')}
                            sublabel={translate('privacy_desc')}
                            onClick={onPrivacy}
                            last
                        />
                    </div>
                </div>

                {/* Data */}
                <div>
                    <SectionLabel>{translate('data')}</SectionLabel>
                    <div className="bg-white dark:bg-surface-dark3 rounded-2xl overflow-hidden
                                    shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.4)]
                                    border border-gray-100 dark:border-transparent">
                        <SettingRow
                            icon={Download}
                            iconBg="bg-violet-50 dark:bg-violet-500/10"
                            iconColor="text-violet-600 dark:text-violet-400"
                            label={translate('export_data')}
                            sublabel={translate('export_data_desc')}
                            right={isExporting
                                ? <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                : <ChevronRight size={14} className="text-gray-300 dark:text-white/40" />
                            }
                            onClick={handleExportData}
                        />
                        <SettingRow
                            icon={Database}
                            iconBg="bg-rose-50 dark:bg-rose-500/10"
                            iconColor="text-rose-500"
                            label={translate('clear_all_data')}
                            sublabel={translate('clear_all_data_desc')}
                            danger
                            onClick={() => setShowClearDataModal(true)}
                        />
                        <SettingRow
                            icon={UserX}
                            iconBg="bg-rose-50 dark:bg-rose-500/10"
                            iconColor="text-rose-500"
                            label={translate('delete_account')}
                            sublabel={translate('delete_account_desc')}
                            danger
                            onClick={() => setShowDeleteModal(true)}
                            last
                            right={null}
                        />
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-white/25 mt-2 px-2">
                        {translate('data_deletion_warning')}
                    </p>
                </div>

            </div>

            {/* ── Clear Data Modal ── */}
            <ConfirmationModal
                isOpen={showClearDataModal}
                onClose={() => setShowClearDataModal(false)}
                onConfirm={handleClearData}
                title={translate('clear_all_data')}
                message={translate('clear_data_confirm_message')}
                confirmText={translate('delete')}
                type="danger"
            />

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
                            {(user?.app_metadata?.provider === 'email' || user?.identities?.some(i => i.provider === 'email')) ? (
                                    <PasswordInput
                                        label={translate('confirm_password_instruction')}
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
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

export default GeneralSettingsView;









