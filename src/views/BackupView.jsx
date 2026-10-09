import React, { useState, useRef } from 'react';
import {
    ArrowLeft,
    Download,
    Upload,
    ShieldCheck,
    Clock,
    Database,
    CheckCircle2,
    AlertTriangle,
    FileJson,
    RefreshCw,
    Info,
    UserCheck,
    Layers,
    Check,
    Lock
} from 'lucide-react';
import { supabase } from '../supabase';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import ViewHeader from '../components/ViewHeader';
import DesktopBreadcrumb from '../components/DesktopBreadcrumb';

/* ── Restore Mode Selector ── */
const RestoreModeButton = ({ active, onClick, icon: Icon, label, sublabel, color = 'violet' }) => {
    const isRose = color === 'rose';
    return (
        <button
            onClick={onClick}
            type="button"
            className={`flex-1 flex flex-col items-center sm:items-start text-center sm:text-left gap-2 p-4 rounded-2xl border transition-all duration-200 ${
                active
                    ? isRose
                        ? 'border-rose-400 bg-rose-50/80 dark:bg-rose-500/10 shadow-sm ring-1 ring-rose-400/30'
                        : 'border-violet-400 bg-violet-50/80 dark:bg-violet-500/10 shadow-sm ring-1 ring-violet-400/30'
                    : 'border-gray-200/70 dark:border-white/[0.06] bg-white dark:bg-surface-dark2 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
            }`}
        >
            <div className="flex items-center gap-2.5">
                <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        active
                            ? isRose
                                ? 'bg-rose-500 text-white'
                                : 'bg-violet-600 text-white'
                            : 'bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-white/60'
                    }`}
                >
                    <Icon size={18} strokeWidth={2.2} />
                </div>
                <div>
                    <p
                        className={`text-xs font-bold leading-tight ${
                            active
                                ? isRose
                                    ? 'text-rose-700 dark:text-rose-300'
                                    : 'text-violet-700 dark:text-violet-300'
                                : 'text-gray-900 dark:text-white'
                        }`}
                    >
                        {label}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                        {sublabel}
                    </p>
                </div>
            </div>
        </button>
    );
};

const BackupView = ({ user, onBack, hideHeader }) => {
    const { t: translate, customCategories, language, currency, theme } = useSettings();
    const { showToast } = useToast();

    // Export state
    const [isExporting, setIsExporting] = useState(false);
    const [lastExportInfo, setLastExportInfo] = useState(null);

    // Import state
    const [isImporting, setIsImporting] = useState(false);
    const [importStep, setImportStep] = useState('idle'); // idle | preview | importing | done
    const [parsedBackup, setParsedBackup] = useState(null);
    const [restoreMode, setRestoreMode] = useState('merge'); // merge | replace
    const fileInputRef = useRef(null);

    /* ────────── EXPORT ────────── */
    const handleExportBackup = async () => {
        setIsExporting(true);
        try {
            const [
                { data: transactions },
                { data: goals },
                { data: budgets },
                { data: recurring }
            ] = await Promise.all([
                supabase.from('transactions').select('*').eq('user_id', user.id),
                supabase.from('goals').select('*').eq('user_id', user.id),
                supabase.from('budgets').select('*').eq('user_id', user.id),
                supabase.from('recurring_transactions').select('*').eq('user_id', user.id),
            ]);

            const backup = {
                _meta: {
                    version: '1.0',
                    app: 'SpendWise',
                    exportedAt: new Date().toISOString(),
                    exportedBy: user.email,
                    userId: user.id,
                    transactionCount: (transactions || []).length,
                    goalsCount: (goals || []).length,
                    budgetsCount: (budgets || []).length,
                    recurringCount: (recurring || []).length,
                },
                settings: {
                    currency,
                    language,
                    theme,
                    customCategories,
                },
                transactions: transactions || [],
                goals: goals || [],
                budgets: budgets || [],
                recurringTransactions: recurring || [],
            };

            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().split('T')[0];
            a.download = `spendwise_backup_${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setLastExportInfo({
                date: new Date().toLocaleString(),
                transactions: (transactions || []).length,
                goals: (goals || []).length,
                budgets: (budgets || []).length,
                recurring: (recurring || []).length,
            });
            showToast(translate('backup_success') || 'Backup exported successfully!', 'success');
        } catch (err) {
            console.error('Backup export error:', err);
            showToast(translate('backup_error') || 'Failed to export backup.', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    /* ────────── IMPORT – File pick ────────── */
    const handleFilePick = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target.result);
                if (!json._meta || json._meta.app !== 'SpendWise') {
                    showToast(translate('backup_invalid') || 'Invalid or unsupported backup file.', 'error');
                    return;
                }
                setParsedBackup(json);
                setImportStep('preview');
            } catch {
                showToast(translate('backup_parse_error') || 'Could not parse backup file.', 'error');
            }
        };
        reader.readAsText(file);
        // reset so same file can be re-picked
        e.target.value = '';
    };

    /* ────────── IMPORT – Execute ────────── */
    const handleRestoreBackup = async () => {
        if (!parsedBackup) return;
        setIsImporting(true);
        setImportStep('importing');

        try {
            const uid = user.id;
            const { transactions = [], goals = [], budgets = [], recurringTransactions = [] } = parsedBackup;

            /* Strip IDs and old user_id, assign current user */
            const strip = (items) =>
                items.map(({ id, user_id, created_at, ...rest }) => ({ ...rest, user_id: uid }));

            if (restoreMode === 'replace') {
                // Delete existing data first
                await Promise.all([
                    supabase.from('transactions').delete().eq('user_id', uid),
                    supabase.from('goals').delete().eq('user_id', uid),
                    supabase.from('budgets').delete().eq('user_id', uid),
                    supabase.from('recurring_transactions').delete().eq('user_id', uid),
                ]);
            }

            // Insert in batches to avoid payload limits
            const batchInsert = async (table, items) => {
                if (!items.length) return;
                const BATCH = 100;
                for (let i = 0; i < items.length; i += BATCH) {
                    const { error } = await supabase.from(table).insert(items.slice(i, i + BATCH));
                    if (error) throw error;
                }
            };

            await batchInsert('transactions', strip(transactions));
            await batchInsert('goals', strip(goals));
            await batchInsert('budgets', strip(budgets));
            await batchInsert('recurring_transactions', strip(recurringTransactions));

            setImportStep('done');
            showToast(translate('restore_success') || 'Backup restored successfully!', 'success');
        } catch (err) {
            console.error('Restore error:', err);
            setImportStep('preview');
            showToast(translate('restore_error') || 'Failed to restore backup.', 'error');
        } finally {
            setIsImporting(false);
        }
    };

    const resetImport = () => {
        setParsedBackup(null);
        setImportStep('idle');
    };

    const meta = parsedBackup?._meta;

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden">
            {/* ─────── Mobile Sticky Header ─────── */}
            <ViewHeader
                onBack={onBack}
                title={translate('backup_restore') || 'Backup & Restore'}
                subtitle={translate('backup_subtitle') || 'Data preservation & vault'}
                hideHeader={hideHeader}
            />

            {/* ─────── Main Scroll Container ─────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-6">

                    {/* Desktop Navigation Breadcrumb Bar */}
                    <DesktopBreadcrumb
                        onBack={onBack}
                        backLabel={translate('guide_back_to_settings') || 'Back to Settings'}
                        hideHeader={hideHeader}
                    />

                    {/* ─────── Hero Hub ─────── */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 dark:from-violet-950 dark:via-indigo-950 dark:to-surface-dark3 border border-violet-400/30 dark:border-white/10 shadow-xl shadow-violet-500/15 text-white p-6 sm:p-8">
                        {/* Ambient decorative glowing backdrop lights */}
                        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
                        <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
                            <Database size={160} strokeWidth={1} />
                        </div>

                        <div className="relative z-10 max-w-2xl space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-violet-100 tracking-wide uppercase">
                                <ShieldCheck size={13} />
                                <span>Secure Data Vault</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                                {translate('backup_restore') || 'Backup & Restore'}
                            </h2>
                            <p className="text-sm sm:text-base text-violet-100/90 leading-relaxed font-medium">
                                {translate('backup_info') || 'A backup includes all your transactions, goals, budgets, recurring rules, and app settings. You can restore it to any SpendWise account.'}
                            </p>

                            {/* Attribute Chips */}
                            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-violet-100/90">
                                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                                    Full Data Portability
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                                    Client-Side JSON
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                                    Zero Lock-In
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Main Actions: Export & Import Bento Grid ─────── */}
                    {importStep === 'idle' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                            {/* Export Card */}
                            <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-500/20 flex items-center justify-center shrink-0">
                                            <Download size={22} strokeWidth={2.3} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 border border-violet-200/60 dark:border-violet-500/20">
                                                Export
                                            </span>
                                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight mt-1">
                                                {translate('backup_export_title') || 'Create Full Backup'}
                                            </h3>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {translate('backup_export_sublabel') || 'Export all your transactions, goals, budgets, recurring rules, and custom categories into a secure JSON file.'}
                                    </p>

                                    {/* Checklist */}
                                    <div className="space-y-2 pt-1">
                                        {[
                                            translate('backup_check_tx') || 'All historical income & expense transactions',
                                            translate('backup_check_goals') || 'Active and completed savings goals',
                                            translate('backup_check_budgets') || 'Monthly category budgets and threshold rules',
                                            translate('backup_check_recurring') || 'Recurring bills and subscriptions',
                                            translate('backup_check_settings') || 'Custom categories & regional settings'
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                                                    <Check size={11} strokeWidth={3} />
                                                </div>
                                                <span className="text-[12px] text-gray-700 dark:text-gray-300">
                                                    {item}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    {/* Action Button */}
                                    <button
                                        onClick={handleExportBackup}
                                        disabled={isExporting}
                                        className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isExporting ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Download size={15} strokeWidth={2.3} />
                                                <span>{translate('backup_export_label') || 'Export Full Backup'}</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Last Export Badge */}
                                    {lastExportInfo && (
                                        <div className="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200/60 dark:border-emerald-500/20 flex items-start gap-2.5">
                                            <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                                            <div className="text-[11px] leading-snug">
                                                <p className="font-bold text-emerald-700 dark:text-emerald-300">
                                                    {translate('backup_exported') || 'Backup Created'}
                                                </p>
                                                <p className="text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                                                    {lastExportInfo.date} &bull; {lastExportInfo.transactions} {translate('backup_tx') || 'transactions'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Restore Card */}
                            <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-500/20 flex items-center justify-center shrink-0">
                                            <Upload size={22} strokeWidth={2.3} />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-500/20">
                                                Restore
                                            </span>
                                            <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight mt-1">
                                                {translate('backup_restore_title') || 'Restore from Backup'}
                                            </h3>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {translate('backup_choose_sublabel') || 'Select a previously exported .json SpendWise backup file to recover or sync your account data.'}
                                    </p>

                                    {/* Key Capabilities */}
                                    <div className="space-y-2 pt-1">
                                        {[
                                            translate('backup_check_modes') || 'Dual restore modes: Merge or Clean Replace',
                                            translate('backup_check_validation') || 'Pre-import data validation & schema checking',
                                            translate('backup_check_reassign') || 'Re-associates records to current authenticated user',
                                            translate('backup_check_batch') || 'Safe batch insertion preventing network timeouts',
                                            translate('backup_check_dedup') || 'Automatic duplicate avoidance when merging'
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                                                    <Check size={11} strokeWidth={3} />
                                                </div>
                                                <span className="text-[12px] text-gray-700 dark:text-gray-300">
                                                    {item}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".json,application/json"
                                        aria-label={translate('backup_choose_file') || 'Choose Backup File'}
                                        className="hidden"
                                        onChange={handleFilePick}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full py-3.5 px-5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <FileJson size={15} strokeWidth={2.3} />
                                        <span>{translate('backup_choose_file') || 'Choose Backup File'}</span>
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ─────── Preview Step Card ─────── */}
                    {importStep === 'preview' && meta && (
                        <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/[0.06] pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-500/20 flex items-center justify-center shrink-0">
                                        <FileJson size={22} strokeWidth={2.2} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                                            {translate('backup_file_preview') || 'Backup File Preview'}
                                        </h3>
                                        <p className="text-[11px] font-semibold text-gray-400 dark:text-white/40">
                                            SpendWise Schema v{meta.version}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/20">
                                    Valid Format
                                </span>
                            </div>

                            {/* Metadata Table */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { icon: Clock, label: translate('backup_date') || 'Exported At', value: new Date(meta.exportedAt).toLocaleString() },
                                    { icon: UserCheck, label: translate('backup_owner') || 'Original Owner', value: meta.exportedBy || '—' },
                                    { icon: Database, label: translate('backup_transactions_count') || 'Transactions', value: `${meta.transactionCount} records` },
                                    { icon: Layers, label: translate('backup_other_data') || 'Goals / Budgets / Recurring', value: `${meta.goalsCount} / ${meta.budgetsCount} / ${meta.recurringCount}` },
                                ].map(({ icon: Ico, label, value }) => (
                                    <div
                                        key={label}
                                        className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-surface-dark border border-gray-200/60 dark:border-white/[0.06] flex items-center gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-gray-200/60 dark:bg-white/[0.08] flex items-center justify-center shrink-0 text-gray-600 dark:text-gray-300">
                                            <Ico size={15} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                {label}
                                            </p>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate mt-0.5">
                                                {value}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Restore Mode Selector */}
                            <div className="space-y-3 pt-2">
                                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                    {translate('backup_restore_mode') || 'Choose Restore Mode'}
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <RestoreModeButton
                                        active={restoreMode === 'merge'}
                                        onClick={() => setRestoreMode('merge')}
                                        icon={RefreshCw}
                                        label={translate('backup_mode_merge') || 'Merge Data'}
                                        sublabel={translate('backup_mode_merge_desc') || 'Append backup to existing transactions'}
                                        color="violet"
                                    />
                                    <RestoreModeButton
                                        active={restoreMode === 'replace'}
                                        onClick={() => setRestoreMode('replace')}
                                        icon={Database}
                                        label={translate('backup_mode_replace') || 'Clean Replace'}
                                        sublabel={translate('backup_mode_replace_desc') || 'Delete current data and restore exact backup'}
                                        color="rose"
                                    />
                                </div>
                            </div>

                            {/* Warning when Replace is selected */}
                            {restoreMode === 'replace' && (
                                <div className="bg-rose-50 dark:bg-rose-500/10 rounded-2xl p-4 border border-rose-200/70 dark:border-rose-500/20 flex items-start gap-3">
                                    <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed font-medium">
                                        {translate('backup_replace_warning') || 'This will permanently delete all your existing transactions, budgets, and goals before restoring. This action cannot be undone.'}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetImport}
                                    className="flex-1 py-3.5 px-5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-gray-700 dark:text-gray-200 font-extrabold text-xs active:scale-[0.98] transition-all"
                                >
                                    {translate('cancel') || 'Cancel'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRestoreBackup}
                                    disabled={isImporting}
                                    className={`flex-1 py-3.5 px-5 rounded-2xl text-white font-extrabold text-xs active:scale-[0.98] transition-all shadow-lg ${
                                        restoreMode === 'replace'
                                            ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
                                            : 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/25'
                                    }`}
                                >
                                    {translate('backup_restore_btn') || 'Restore Backup Now'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ─────── Importing Progress State ─────── */}
                    {importStep === 'importing' && (
                        <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-10 text-center space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300 flex items-center justify-center mx-auto">
                                <div className="w-7 h-7 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                                    {translate('backup_restoring') || 'Restoring your data...'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {translate('backup_restoring_desc') || 'Please wait while we populate transactions and settings into your account.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ─────── Done State ─────── */}
                    {importStep === 'done' && (
                        <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-8 sm:p-10 text-center space-y-5">
                            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400 flex items-center justify-center mx-auto">
                                <ShieldCheck size={34} strokeWidth={2.2} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                                    {translate('backup_done_title') || 'Data Restored Successfully'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {meta?.transactionCount} {translate('backup_tx') || 'transactions'} {translate('backup_done_imported') || 'imported into your account'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={resetImport}
                                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs active:scale-95 transition-all shadow-sm shadow-emerald-500/20"
                            >
                                {translate('backup_restore_another') || 'Done'}
                            </button>
                        </div>
                    )}

                    {/* ─────── Bottom Bento: Trust & Safety ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                <Lock size={20} strokeWidth={2.3} />
                            </div>
                            <div>
                                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                    Data Sovereignty & Security Notice
                                </h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                    You own your financial data completely
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-violet-600 dark:text-violet-400">
                                    <CheckCircle2 size={13} strokeWidth={2.5} />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                                    Backups are standard JSON files that you can inspect or import anytime.
                                </p>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-violet-600 dark:text-violet-400">
                                    <ShieldCheck size={13} strokeWidth={2.5} />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                                    Keep your exported backups in a safe location (e.g. password manager or encrypted drive).
                                </p>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-violet-600 dark:text-violet-400">
                                    <CheckCircle2 size={13} strokeWidth={2.5} />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                                    Seamlessly migrate your data between different phones, devices, or accounts.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Signature */}
                    <div className="text-center pt-2 pb-8">
                        <p className="text-[11px] font-medium text-gray-400 dark:text-white/40">
                            SpendWise &bull; Financial Data Vault &bull; Version 2.0
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BackupView;
