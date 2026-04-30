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
    ChevronRight,
    Info,
    UserCheck,
    Layers
} from 'lucide-react';
import { supabase } from '../supabase';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';

/* ── Section Label ── */
const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-white/50 mb-2 ml-1 px-1">
        {children}
    </p>
);

/* ── Action Row ── */
const ActionRow = ({ icon: Icon, iconBg, iconColor, label, sublabel, right, onClick, last = false, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left
                    active:scale-[0.98] transition-all duration-150
                    hover:bg-black/[0.03] dark:hover:bg-white/[0.04]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${!last ? 'border-b border-gray-100/80 dark:border-transparent' : ''}`}
    >
        <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <Icon size={16} className={iconColor} strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0 text-left">
            <span className="block font-semibold text-[13.5px] text-gray-800 dark:text-white/90 leading-tight">
                {label}
            </span>
            {sublabel && (
                <span className="block text-[11px] text-gray-400 dark:text-white/35 mt-0.5 leading-tight">{sublabel}</span>
            )}
        </div>
        {right !== undefined ? right : <ChevronRight size={14} className="text-gray-300 dark:text-white/40 flex-shrink-0" />}
    </button>
);

/* ── Restore Mode Selector ── */
const RestoreModeButton = ({ active, onClick, icon: Icon, label, sublabel }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 transition-all duration-200
                    ${active
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                : 'border-gray-100 dark:border-transparent bg-white dark:bg-white/[0.03]'}`}
    >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                        ${active ? 'bg-violet-500' : 'bg-gray-100 dark:bg-white/[0.07]'}`}>
            <Icon size={18} className={active ? 'text-white' : 'text-gray-400 dark:text-white/60'} strokeWidth={2} />
        </div>
        <div className="text-center">
            <p className={`text-[12px] font-bold leading-tight ${active ? 'text-violet-600 dark:text-violet-400' : 'text-gray-700 dark:text-white/70'}`}>
                {label}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-white/50 mt-0.5 leading-tight">{sublabel}</p>
        </div>
    </button>
);

const BackupView = ({ user, onBack }) => {
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
            showToast(translate('backup_success'), 'success');
        } catch (err) {
            console.error('Backup export error:', err);
            showToast(translate('backup_error'), 'error');
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
                    showToast(translate('backup_invalid'), 'error');
                    return;
                }
                setParsedBackup(json);
                setImportStep('preview');
            } catch {
                showToast(translate('backup_parse_error'), 'error');
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
            showToast(translate('restore_success'), 'success');
        } catch (err) {
            console.error('Restore error:', err);
            setImportStep('preview');
            showToast(translate('restore_error'), 'error');
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
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col animate-fade-in transition-colors duration-300">

            {/* ── Header ── */}
            <div className="shrink-0 bg-gray-50 dark:bg-surface-dark
                            border-b border-gray-100 dark:border-transparent
                            shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:shadow-none
                            px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4
                            sticky top-0 z-10 backdrop-blur-xl transition-colors duration-300">
                <div className="flex items-center justify-center relative min-h-[36px]">
                    <button
                        onClick={onBack}
                        className="absolute left-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.08]
                                   flex items-center justify-center text-gray-500 dark:text-white/50
                                   hover:bg-gray-200 dark:hover:bg-white/[0.14]
                                   active:scale-90 transition-all duration-150"
                    >
                        <ArrowLeft size={15} strokeWidth={2.5} />
                    </button>
                    <div className="text-center">
                        <h2 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">
                            {translate('backup_restore')}
                        </h2>
                        <p className="text-[11px] text-gray-400 dark:text-white/35">
                            {translate('backup_subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-10">

                {/* Info Banner */}
                <div className="bg-violet-50 dark:bg-violet-500/[0.08] rounded-2xl p-4
                                border border-violet-100 dark:border-violet-500/20
                                flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info size={15} className="text-violet-500 dark:text-violet-400" />
                    </div>
                    <p className="text-[12px] text-violet-700 dark:text-violet-300/80 leading-relaxed">
                        {translate('backup_info')}
                    </p>
                </div>

                {/* ── Export Section ── */}
                <div>
                    <SectionLabel>{translate('backup_export_title')}</SectionLabel>
                    <div className="bg-white dark:bg-white/[0.04] rounded-2xl overflow-hidden
                                    shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-none
                                    border border-gray-100 dark:border-transparent">
                        <ActionRow
                            icon={Download}
                            iconBg="bg-violet-50 dark:bg-violet-500/10"
                            iconColor="text-violet-600 dark:text-violet-400"
                            label={translate('backup_export_label')}
                            sublabel={translate('backup_export_sublabel')}
                            right={isExporting
                                ? <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                : <ChevronRight size={14} className="text-gray-300 dark:text-white/40" />
                            }
                            onClick={handleExportBackup}
                            disabled={isExporting}
                            last
                        />
                    </div>

                    {/* Last export info */}
                    {lastExportInfo && (
                        <div className="mt-3 px-3 py-3 bg-emerald-50 dark:bg-emerald-500/[0.07] rounded-xl
                                        border border-emerald-100 dark:border-emerald-500/20
                                        flex items-start gap-2.5">
                            <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-300">
                                    {translate('backup_exported')}
                                </p>
                                <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/60 mt-0.5">
                                    {lastExportInfo.date} · {lastExportInfo.transactions} {translate('backup_tx')} ·{' '}
                                    {lastExportInfo.goals} {translate('backup_goals')} ·{' '}
                                    {lastExportInfo.budgets} {translate('backup_budgets')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Restore Section ── */}
                <div>
                    <SectionLabel>{translate('backup_restore_title')}</SectionLabel>

                    {importStep === 'idle' && (
                        <div className="bg-white dark:bg-white/[0.04] rounded-2xl overflow-hidden
                                        shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-none
                                        border border-gray-100 dark:border-transparent">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json,application/json"
                                className="hidden"
                                onChange={handleFilePick}
                            />
                            <ActionRow
                                icon={Upload}
                                iconBg="bg-cyan-50 dark:bg-cyan-500/10"
                                iconColor="text-cyan-600 dark:text-cyan-400"
                                label={translate('backup_choose_file')}
                                sublabel={translate('backup_choose_sublabel')}
                                onClick={() => fileInputRef.current?.click()}
                                last
                            />
                        </div>
                    )}

                    {/* Preview Step */}
                    {importStep === 'preview' && meta && (
                        <div className="space-y-3">
                            {/* Backup metadata card */}
                            <div className="bg-white dark:bg-white/[0.04] rounded-2xl
                                            shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-none
                                            border border-gray-100 dark:border-transparent overflow-hidden">
                                <div className="px-4 py-3.5 border-b border-gray-100 dark:border-transparent flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-[11px] bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center">
                                        <FileJson size={16} className="text-cyan-600 dark:text-cyan-400" strokeWidth={2.2} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[13.5px] text-gray-800 dark:text-white/90">
                                            {translate('backup_file_preview')}
                                        </p>
                                        <p className="text-[11px] text-gray-400 dark:text-white/35">SpendWise v{meta.version}</p>
                                    </div>
                                </div>

                                {[
                                    { icon: Clock, label: translate('backup_date'), value: new Date(meta.exportedAt).toLocaleString() },
                                    { icon: UserCheck, label: translate('backup_owner'), value: meta.exportedBy || '—' },
                                    { icon: Database, label: translate('backup_transactions_count'), value: meta.transactionCount },
                                    { icon: Layers, label: translate('backup_other_data'), value: `${meta.goalsCount} / ${meta.budgetsCount} / ${meta.recurringCount}` },
                                ].map(({ icon: Ico, label, value }, i, arr) => (
                                    <div key={label} className={`flex items-center gap-3 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-gray-100 dark:border-transparent' : ''}`}>
                                        <Ico size={14} className="text-gray-400 dark:text-white/50 flex-shrink-0" />
                                        <span className="text-[12px] text-gray-500 dark:text-white/60 flex-1">{label}</span>
                                        <span className="text-[12px] font-semibold text-gray-700 dark:text-white/70">{value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Restore mode */}
                            <div>
                                <p className="text-[11px] font-semibold text-gray-400 dark:text-white/50 uppercase tracking-widest mb-2 px-1">
                                    {translate('backup_restore_mode')}
                                </p>
                                <div className="flex gap-2">
                                    <RestoreModeButton
                                        active={restoreMode === 'merge'}
                                        onClick={() => setRestoreMode('merge')}
                                        icon={RefreshCw}
                                        label={translate('backup_mode_merge')}
                                        sublabel={translate('backup_mode_merge_desc')}
                                    />
                                    <RestoreModeButton
                                        active={restoreMode === 'replace'}
                                        onClick={() => setRestoreMode('replace')}
                                        icon={Database}
                                        label={translate('backup_mode_replace')}
                                        sublabel={translate('backup_mode_replace_desc')}
                                    />
                                </div>
                            </div>

                            {/* Replace warning */}
                            {restoreMode === 'replace' && (
                                <div className="bg-rose-50 dark:bg-rose-500/[0.07] rounded-xl px-3.5 py-3
                                                border border-rose-100 dark:border-rose-500/20
                                                flex items-start gap-2.5">
                                    <AlertTriangle size={15} className="text-rose-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-[12px] text-rose-700 dark:text-rose-300 leading-relaxed">
                                        {translate('backup_replace_warning')}
                                    </p>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-2.5 pt-1">
                                <button
                                    onClick={resetImport}
                                    className="flex-1 py-3.5 bg-gray-100 dark:bg-white
                                               text-gray-700 dark:text-black font-bold rounded-xl text-[14px]
                                               hover:bg-gray-200 dark:hover:bg-gray-100
                                               active:scale-95 transition-all"
                                >
                                    {translate('cancel')}
                                </button>
                                <button
                                    onClick={handleRestoreBackup}
                                    className={`flex-1 py-3.5 font-bold rounded-xl text-white text-[14px]
                                               active:scale-95 transition-all
                                               ${restoreMode === 'replace'
                                            ? 'bg-rose-500 hover:bg-rose-600 shadow-[0_4px_16px_rgba(239,68,68,0.35)]'
                                            : 'bg-violet-600 hover:bg-violet-700 shadow-[0_4px_16px_rgba(124,58,237,0.35)]'}`}
                                >
                                    {translate('backup_restore_btn')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Importing progress */}
                    {importStep === 'importing' && (
                        <div className="bg-white dark:bg-white/[0.04] rounded-2xl p-8
                                        shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-none
                                        border border-gray-100 dark:border-transparent
                                        flex flex-col items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                                <div className="w-7 h-7 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-[15px] text-gray-800 dark:text-white/90">
                                    {translate('backup_restoring')}
                                </p>
                                <p className="text-[12px] text-gray-400 dark:text-white/35 mt-1">
                                    {translate('backup_restoring_desc')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Done state */}
                    {importStep === 'done' && (
                        <div className="bg-white dark:bg-white/[0.04] rounded-2xl p-8
                                        shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-none
                                        border border-gray-100 dark:border-transparent
                                        flex flex-col items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                <ShieldCheck size={28} className="text-emerald-500" strokeWidth={1.5} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-[15px] text-gray-800 dark:text-white/90">
                                    {translate('backup_done_title')}
                                </p>
                                <p className="text-[12px] text-gray-400 dark:text-white/35 mt-1 leading-relaxed">
                                    {meta?.transactionCount} {translate('backup_tx')} {translate('backup_done_imported')}
                                </p>
                            </div>
                            <button
                                onClick={resetImport}
                                className="px-6 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10
                                           text-emerald-600 dark:text-emerald-400 font-bold text-[13px]
                                           hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all active:scale-95"
                            >
                                {translate('backup_restore_another')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Security Note */}
                <div className="flex items-start gap-2.5 px-2">
                    <ShieldCheck size={13} className="text-gray-300 dark:text-white/40 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-gray-400 dark:text-white/25 leading-relaxed">
                        {translate('backup_security_note')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BackupView;









