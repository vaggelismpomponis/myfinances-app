import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Download,
    Bell,
    Languages,
    AlertTriangle,
    ChevronRight,
    Database,
    UserX,
    Shield,
    CheckCircle2,
    SlidersHorizontal,
    X,
    Check
} from 'lucide-react';
import { supabase } from '../supabase';
import { exportJSON } from '../services/export';
import ConfirmationModal from '../components/ConfirmationModal';
import PasswordInput from '../components/PasswordInput';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { openNotificationSettings, checkNotificationPermission } from '../utils/notificationListener';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { useSubscription } from '../contexts/SubscriptionContext';
import ProBadge from '../components/ProBadge';
import Toggle from '../components/Toggle';
import ViewHeader from '../components/ViewHeader';
import DesktopBreadcrumb from '../components/DesktopBreadcrumb';


const GeneralSettingsView = ({ user, onBack, onPrivacy, hideHeader }) => {
    const { language, updateLanguage, t: translate } = useSettings();
    const { showToast } = useToast();
    const { isPro, openUpgradeModal } = useSubscription();
    const [showClearDataModal, setShowClearDataModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
    // Notification Permission State
    const [isSmsEnabled, setIsSmsEnabled] = useState(false);

    useEffect(() => {
        const checkPermission = async () => {
            const hasPermission = await checkNotificationPermission();
            setIsSmsEnabled(hasPermission);
        };

        checkPermission();

        const listener = App.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
                checkPermission();
            }
        });

        return () => {
            listener.then(handle => handle.remove());
        };
    }, []);

    // Delete Account State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleExportData = async () => {
        if (!isPro) {
            openUpgradeModal('export');
            return;
        }
        setIsExporting(true);
        try {
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id);
            if (error) throw error;
            exportJSON(transactions);
            showToast(translate('data_exported_successfully') || 'Data exported successfully.', 'success');
        } catch (error) {
            console.error("Export error:", error);
            showToast(translate('export_failed') || 'Export failed.', 'error');
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
            showToast(translate('data_cleared') || "All transactions deleted successfully.", 'success');
        } catch (error) {
            console.error("Clear data error:", error);
            showToast(translate('clear_error') || "Error deleting data.", 'error');
        }
    };

    const handleDeleteAccount = async (e) => {
        if (e) e.preventDefault();
        setIsDeleting(true);
        try {
            const isPasswordUser = user?.app_metadata?.provider === 'email' || user?.identities?.some(i => i.provider === 'email');
            if (isPasswordUser) {
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: deletePassword
                });
                if (authError) throw new Error('wrong_password');
            }

            // 1. Delete all user data from each table
            const tables = ['transactions', 'recurring_transactions', 'goals', 'budgets', 'sessions'];
            for (const table of tables) {
                try {
                    await supabase.from(table).delete().eq('user_id', user.id);
                } catch (err) {
                    console.warn(`Failed to delete from ${table}:`, err);
                }
            }

            // 2. Call RPC to delete the auth user
            const { error: rpcError } = await supabase.rpc('delete_user');
            if (rpcError) throw rpcError;

            // 3. Clear session and local data
            await supabase.auth.signOut();
            localStorage.clear();
            
            showToast(translate('account_deleted_successfully') || 'Account deleted successfully.', 'success');
            
            // 4. Force reload to landing page
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } catch (error) {
            console.error("Delete account error:", error);
            if (error.message === 'wrong_password') {
                showToast(translate('current_password_error') || 'Current password is incorrect.', 'error');
            } else {
                showToast(translate('error_message_generic') || 'Error deleting account.', 'error');
            }
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden">

            {/* ─────── Mobile Sticky Header ─────── */}
            <ViewHeader
                onBack={onBack}
                title={translate('general_settings') || translate('general') || 'General Settings'}
                subtitle={translate('general_desc') || 'Preferences & data management'}
                hideHeader={hideHeader}
            />

            {/* ─────── Main Scroll Container ─────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-6">

                    {/* Desktop Navigation Breadcrumb Bar */}
                    <DesktopBreadcrumb
                        onBack={onBack}
                        backLabel={translate('guide_back_to_settings') || 'Back to Settings'}
                        badgeIcon={SlidersHorizontal}
                        badgeText="SpendWise Preferences & Control"
                        hideHeader={hideHeader}
                    />

                    {/* ─────── Executive Hero Hub ─────── */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 dark:from-violet-950 dark:via-indigo-950 dark:to-surface-dark3 border border-violet-400/30 dark:border-white/10 shadow-xl shadow-violet-500/15 text-white p-6 sm:p-8">
                        {/* Ambient decorative glowing backdrops */}
                        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
                        <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
                            <SlidersHorizontal size={160} strokeWidth={1} />
                        </div>

                        <div className="relative z-10 max-w-2xl space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-violet-100 tracking-wide uppercase">
                                <SlidersHorizontal size={13} />
                                <span>Configuration Hub</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                                {translate('general_settings') || translate('general') || 'General Settings'}
                            </h2>
                            <p className="text-sm sm:text-base text-violet-100/90 leading-relaxed font-medium">
                                {translate('general_desc') || 'Customize display language, configure automatic transaction detection, and manage account data sovereignty.'}
                            </p>

                            {/* Live Preference Chips */}
                            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-violet-100/90 flex items-center gap-1.5">
                                    <Languages size={12} strokeWidth={2.5} />
                                    <span>{language === 'el' ? 'Ελληνικά (EL)' : 'English (EN)'}</span>
                                </span>

                                <span className={`px-2.5 py-1 rounded-lg backdrop-blur-sm border flex items-center gap-1.5 ${
                                    isSmsEnabled
                                        ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200'
                                        : 'bg-white/10 border-white/15 text-violet-100/80'
                                }`}>
                                    <Bell size={12} strokeWidth={2.5} />
                                    <span>Automations: {isSmsEnabled ? 'Active' : 'Off'}</span>
                                </span>

                                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-violet-100/90 flex items-center gap-1.5">
                                    <Database size={12} strokeWidth={2.5} />
                                    <span>Direct Cloud Storage</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Bento Grid: Preferences & Export ─────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">

                        {/* ── Card 1: App Preferences & Automations ── */}
                        <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-500/20 flex items-center justify-center shrink-0">
                                        <SlidersHorizontal size={20} strokeWidth={2.3} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 border border-violet-200/60 dark:border-violet-500/20">
                                            Preferences
                                        </span>
                                        <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight mt-1">
                                            Localization & Reading
                                        </h3>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Control app language, legal disclosures, and automated transaction imports.
                                </p>

                                <div className="space-y-3 pt-1">
                                    {/* Language Selector */}
                                    <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06]">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100/70 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                            <Languages size={18} strokeWidth={2.2} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="block font-bold text-sm text-gray-900 dark:text-white">
                                                {translate('language') || 'Language'}
                                            </span>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                {translate('app_display_language') || 'App display language'}
                                            </span>
                                        </div>

                                        {/* Language Segmented Control */}
                                        <div className="flex gap-1 bg-gray-200/70 dark:bg-white/[0.08] p-1 rounded-xl shrink-0">
                                            {[
                                                { key: 'el', label: 'EL' },
                                                { key: 'en', label: 'EN' }
                                            ].map(({ key, label }) => (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => updateLanguage(key)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                                                        language === key
                                                            ? 'bg-white dark:bg-surface-dark text-violet-600 dark:text-violet-400 shadow-sm'
                                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SMS / Bank App Reading */}
                                    <div
                                        onClick={openNotificationSettings}
                                        className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] hover:bg-gray-100/60 dark:hover:bg-white/[0.05] transition-all cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-amber-100/70 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                            <Bell size={18} strokeWidth={2.2} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                                    {translate('enable_sms_reading') || 'Enable SMS/App Reading'}
                                                </span>
                                            </div>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight block">
                                                {translate('sms_reading_desc') || 'Automatic transaction tracking from notifications'}
                                            </span>
                                        </div>
                                        <Toggle enabled={isSmsEnabled} onClick={openNotificationSettings} />
                                    </div>

                                    {/* Privacy Policy */}
                                    <button
                                        type="button"
                                        onClick={onPrivacy}
                                        className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] hover:bg-teal-50/60 dark:hover:bg-teal-500/[0.08] hover:border-teal-300 dark:hover:border-teal-500/30 active:scale-[0.99] transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-teal-100/70 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <Shield size={18} strokeWidth={2.2} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className="block font-bold text-sm text-gray-900 dark:text-white">
                                                {translate('privacy_policy') || 'Privacy Policy'}
                                            </span>
                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                {translate('privacy_desc') || 'How we handle and protect your data'}
                                            </span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-400 dark:text-white/40 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── Card 2: Data Portability & Export ── */}
                        <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                        <Download size={20} strokeWidth={2.3} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/20">
                                            Portability
                                        </span>
                                        <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight mt-1">
                                            {translate('export_data') || 'Export Data'}
                                        </h3>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    Download your entire personal ledger in standard JSON for offline storage or third-party analysis.
                                </p>

                                <div className="space-y-2.5 pt-1">
                                    {[
                                        'Full JSON structure with timestamps',
                                        'All categories, income & expense tags',
                                        'Compatible with Excel and database tools'
                                    ].map((feat, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                                <Check size={11} strokeWidth={3} />
                                            </div>
                                            <span className="text-xs text-gray-700 dark:text-gray-300">
                                                {feat}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleExportData}
                                disabled={isExporting}
                                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isExporting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        <span>Exporting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download size={15} strokeWidth={2.5} />
                                        <span>Download JSON Archive</span>
                                        {!isPro && <ProBadge />}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ─────── Danger Zone Card ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-rose-200/80 dark:border-rose-900/30 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                                <AlertTriangle size={20} strokeWidth={2.3} />
                            </div>
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20">
                                    Danger Zone
                                </span>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight mt-1">
                                    Irreversible Actions
                                </h3>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {translate('data_deletion_warning') || 'Actions performed here are permanent and cannot be reversed without an existing offline backup.'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            {/* Clear All Data */}
                            <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-500/[0.04] border border-rose-100 dark:border-rose-500/20 flex flex-col justify-between space-y-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Database size={15} className="text-rose-500" strokeWidth={2.2} />
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                            {translate('clear_all_data') || 'Delete All Data'}
                                        </h4>
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {translate('clear_all_data_desc') || 'Remove all transaction rows while keeping goals, rules, and your account active.'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowClearDataModal(true)}
                                    className="w-full py-2.5 px-3 rounded-xl border border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 font-extrabold text-xs hover:bg-rose-100/60 dark:hover:bg-rose-500/15 active:scale-95 transition-all text-center cursor-pointer"
                                >
                                    {translate('clear_all_data') || 'Clear Transactions'}
                                </button>
                            </div>

                            {/* Delete Account */}
                            <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-500/[0.04] border border-rose-100 dark:border-rose-500/20 flex flex-col justify-between space-y-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <UserX size={15} className="text-rose-500" strokeWidth={2.2} />
                                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                            {translate('delete_account') || 'Delete Account'}
                                        </h4>
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {translate('delete_account_desc') || 'Permanently destroy your SpendWise registration, active sessions, and all cloud tables.'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(true)}
                                    className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm shadow-rose-600/30 active:scale-95 transition-all text-center cursor-pointer"
                                >
                                    {translate('delete_account') || 'Delete Account'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Bottom Bento: Trust & Safety ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                <Shield size={20} strokeWidth={2.3} />
                            </div>
                            <div>
                                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                    Data Autonomy & Transparency
                                </h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Your personal finance records remain private and under your control
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-violet-600 dark:text-violet-400">
                                    <CheckCircle2 size={13} strokeWidth={2.5} />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                                    All backups and JSON exports download directly onto your device.
                                </p>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-violet-600 dark:text-violet-400">
                                    <CheckCircle2 size={13} strokeWidth={2.5} />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                                    Notification readers only scan incoming financial receipts locally.
                                </p>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-violet-600 dark:text-violet-400">
                                    <CheckCircle2 size={13} strokeWidth={2.5} />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                                    Account deletion purges database rows and auth identity completely.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Signature */}
                    <div className="text-center pt-2 pb-8">
                        <p className="text-[11px] font-medium text-gray-400 dark:text-white/40">
                            SpendWise &bull; System Configuration &bull; Version 2.0
                        </p>
                    </div>

                </div>
            </div>

            {/* ── Clear Data Modal ── */}
            <ConfirmationModal
                isOpen={showClearDataModal}
                onClose={() => setShowClearDataModal(false)}
                onConfirm={handleClearData}
                title={translate('clear_all_data') || 'Delete All Data'}
                message={translate('clear_data_confirm_message') || 'Are you sure? This will delete all transactions and cannot be undone.'}
                confirmText={translate('delete') || 'Delete'}
                type="danger"
            />

            {/* ── Delete Account Modal ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
                    <div className="relative z-10 w-full max-w-sm mx-4 mb-4 sm:mb-0
                                    bg-white dark:bg-surface-dark2 rounded-3xl p-6
                                    shadow-2xl border border-gray-100 dark:border-white/10
                                    animate-slide-up">
                        {/* Icon */}
                        <div className="flex flex-col items-center mb-6 text-center">
                            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/15 rounded-2xl
                                            flex items-center justify-center mb-4
                                            shadow-[0_0_24px_rgba(239,68,68,0.15)]">
                                <AlertTriangle size={28} className="text-rose-500" strokeWidth={1.8} />
                            </div>
                            <h3 className="text-[18px] font-bold text-gray-900 dark:text-white mb-2">
                                {translate('delete_account') || 'Delete Account'}
                            </h3>
                            <p className="text-[13px] text-gray-500 dark:text-white/60 leading-relaxed">
                                {translate('delete_account_confirm_message') || 'This action is permanent and cannot be reversed. All your transactions and data will be erased.'}
                            </p>
                        </div>

                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                            {(user?.app_metadata?.provider === 'email' || user?.identities?.some(i => i.provider === 'email')) ? (
                                <PasswordInput
                                    label={translate('confirm_password_instruction') || 'Confirm with your password'}
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder={translate('password_input_placeholder') || '••••••••'}
                                    required
                                />
                            ) : (
                                <div className="bg-gray-50 dark:bg-white/[0.04] rounded-xl p-4
                                                border border-gray-100 dark:border-white/10
                                                text-[13px] text-gray-600 dark:text-white/50">
                                    {translate('google_reauth_instruction') || 'You will be prompted to verify via Google.'}
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-3.5 bg-gray-100 dark:bg-white/[0.08]
                                               text-gray-700 dark:text-white font-bold rounded-xl
                                               hover:bg-gray-200 dark:hover:bg-white/[0.1]
                                               active:scale-95 transition-all text-[14px] cursor-pointer"
                                >
                                    {translate('cancel') || 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isDeleting}
                                    className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700
                                               text-white font-bold rounded-xl
                                               shadow-[0_4px_16px_rgba(239,68,68,0.35)]
                                               active:scale-95 transition-all disabled:opacity-50 text-[14px] cursor-pointer"
                                >
                                    {isDeleting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            <span>{translate('deleting') || 'Deleting...'}</span>
                                        </span>
                                    ) : (translate('delete_btn') || 'Delete Account')}
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
