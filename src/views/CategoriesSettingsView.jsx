import React, { useState, useMemo } from 'react';
import {
    Tag,
    Plus,
    Pencil,
    Trash2,
    Check,
    X,
    Info,
    ChevronDown,
    ChevronUp,
    ShieldCheck,
    ArrowRightLeft,
    CheckCircle2
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { isBaseCategory } from '../utils/categoryTranslations';
import ViewHeader from '../components/ViewHeader';
import DesktopBreadcrumb from '../components/DesktopBreadcrumb';
import ConfirmationModal from '../components/ConfirmationModal';
import CategoryIcon, { CATEGORY_ACCENT } from '../components/CategoryIcon';
import ProBadge from '../components/ProBadge';

const BASE_EXPENSE_CATEGORIES = ['Σούπερ Μάρκετ', 'Φαγητό', 'Καφές', 'Σπίτι', 'Λογαριασμοί', 'Διασκέδαση', 'Βενζίνη', 'Υγεία', 'Άλλο'];
const BASE_INCOME_CATEGORIES = ['Μισθός', 'Δώρο', 'Επενδύσεις', 'Άλλα Έσοδα'];

const CategoriesSettingsView = ({ user, transactions = [], onBack, hideHeader }) => {
    const {
        language,
        t: translate,
        customCategories,
        addCustomCategory,
        editCustomCategory,
        deleteCustomCategory
    } = useSettings();
    const isEL = language === 'el';
    const { showToast } = useToast();
    const { isPro, openUpgradeModal } = useSubscription();

    const [activeType, setActiveType] = useState('expense');
    const [newCatName, setNewCatName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Edit state
    const [editingCategory, setEditingCategory] = useState(null); // { oldName, newName, type }
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    // Delete state
    const [deleteTarget, setDeleteTarget] = useState(null); // { name, type, txCount, reassignTo }
    const [isDeleting, setIsDeleting] = useState(false);

    // Base categories collapse
    const [showBaseCategories, setShowBaseCategories] = useState(false);

    // Calculate transaction counts for each category
    const txCounts = useMemo(() => {
        const counts = {};
        (transactions || []).forEach(tx => {
            const cat = tx.category?.trim();
            if (cat) {
                counts[cat] = (counts[cat] || 0) + 1;
            }
        });
        return counts;
    }, [transactions]);

    const expenseCustom = customCategories?.expense || [];
    const incomeCustom = customCategories?.income || [];
    const currentCustomList = activeType === 'expense' ? expenseCustom : incomeCustom;
    const currentBaseList = activeType === 'expense' ? BASE_EXPENSE_CATEGORIES : BASE_INCOME_CATEGORIES;

    // Available target categories for reassigning deleted transactions
    const availableReassignTargets = useMemo(() => {
        if (!deleteTarget) return [];
        const base = deleteTarget.type === 'income' ? BASE_INCOME_CATEGORIES : BASE_EXPENSE_CATEGORIES;
        const custom = (deleteTarget.type === 'income' ? incomeCustom : expenseCustom).filter(c => c !== deleteTarget.name);
        return [...base, ...custom];
    }, [deleteTarget, incomeCustom, expenseCustom]);

    // Handle adding a new category
    const handleAddCategory = (e) => {
        if (e) e.preventDefault();
        if (!isPro) {
            openUpgradeModal('categories');
            return;
        }

        const trimmed = newCatName.trim();
        if (!trimmed) {
            showToast(translate('category_name_empty') || 'Το όνομα της κατηγορίας δεν μπορεί να είναι κενό.', 'error');
            return;
        }

        if (isBaseCategory(trimmed)) {
            showToast(translate('category_is_base') || 'Αυτό το όνομα ανήκει στις βασικές κατηγορίες.', 'error');
            return;
        }

        const exists = currentCustomList.some(c => c.toLowerCase() === trimmed.toLowerCase());
        if (exists) {
            showToast(translate('category_already_exists') || 'Υπάρχει ήδη κατηγορία με αυτό το όνομα.', 'error');
            return;
        }

        addCustomCategory(activeType, trimmed);
        setNewCatName('');
        setIsAdding(false);
        showToast(translate('category_added_success') || 'Η κατηγορία προστέθηκε επιτυχώς!', 'success');
    };

    // Handle saving an edited category
    const handleSaveEdit = async () => {
        if (!editingCategory) return;
        const { oldName, newName, type } = editingCategory;
        const trimmed = newName.trim();

        if (!trimmed) {
            showToast(translate('category_name_empty') || 'Το όνομα δεν μπορεί να είναι κενό.', 'error');
            return;
        }

        if (trimmed === oldName) {
            setEditingCategory(null);
            return;
        }

        if (isBaseCategory(trimmed)) {
            showToast(translate('category_is_base') || 'Αυτό το όνομα ανήκει στις βασικές κατηγορίες.', 'error');
            return;
        }

        setIsSavingEdit(true);
        try {
            const res = editCustomCategory(type, oldName, trimmed);
            if (!res.success) {
                if (res.error === 'already_exists') {
                    showToast(translate('category_already_exists') || 'Υπάρχει ήδη κατηγορία με αυτό το όνομα.', 'error');
                } else if (res.error === 'base_category') {
                    showToast(translate('category_is_base') || 'Αυτό το όνομα ανήκει στις βασικές κατηγορίες.', 'error');
                } else {
                    showToast(translate('error_message_generic') || 'Σφάλμα κατά την ενημέρωση.', 'error');
                }
                return;
            }

            showToast(translate('category_updated_success') || 'Η κατηγορία ενημερώθηκε επιτυχώς!', 'success');
            setEditingCategory(null);
        } catch (err) {
            console.error('Error saving edited category:', err);
            showToast(translate('error_message_generic') || 'Σφάλμα κατά την ενημέρωση.', 'error');
        } finally {
            setIsSavingEdit(false);
        }
    };

    // Prompt delete
    const handlePromptDelete = (catName) => {
        const count = txCounts[catName] || 0;
        const defaultFallback = activeType === 'income' ? 'Άλλα Έσοδα' : 'Άλλο';
        setDeleteTarget({
            name: catName,
            type: activeType,
            txCount: count,
            reassignTo: defaultFallback
        });
    };

    // Confirm deletion
    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            const res = deleteCustomCategory(deleteTarget.type, deleteTarget.name, deleteTarget.reassignTo);
            if (res.success) {
                showToast(translate('category_deleted_success') || 'Η κατηγορία διαγράφηκε επιτυχώς!', 'success');
            } else {
                showToast(translate('error_message_generic') || 'Σφάλμα κατά τη διαγραφή.', 'error');
            }
        } catch (err) {
            console.error('Error deleting category:', err);
            showToast(translate('error_message_generic') || 'Σφάλμα κατά τη διαγραφή.', 'error');
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden">
            {/* Header */}
            <ViewHeader
                onBack={onBack}
                title={translate('custom_categories') || 'Προσαρμοσμένες Κατηγορίες'}
                subtitle={translate('custom_categories_desc') || 'Διαχείριση κατηγοριών'}
                hideHeader={hideHeader}
            />

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-6">

                    {/* Desktop Navigation Breadcrumb */}
                    <DesktopBreadcrumb
                        onBack={onBack}
                        backLabel={translate('guide_back_to_settings') || 'Back to Settings'}
                        hideHeader={hideHeader}
                    />

                    {/* Executive Hero Hub */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 dark:from-violet-950 dark:via-indigo-950 dark:to-surface-dark3 border border-violet-400/30 dark:border-white/10 shadow-xl shadow-violet-500/15 text-white p-6 sm:p-8">
                        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

                        <div className="relative z-10 max-w-2xl space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-violet-100 tracking-wide uppercase">
                                <Tag size={13} strokeWidth={2.3} />
                                <span>{isEL ? 'Διαχείριση Κατηγοριών' : 'Categories Management'}</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                                {translate('custom_categories') || (isEL ? 'Προσαρμοσμένες Κατηγορίες' : 'Custom Categories')}
                            </h2>
                            <p className="text-sm sm:text-base text-violet-100/90 leading-relaxed font-medium">
                                {translate('custom_categories_desc') || (isEL ? 'Επεξεργαστείτε, μετονομάστε ή διαγράψτε τις δικές σας κατηγορίες. Οι αλλαγές συγχρονίζονται άμεσα σε όλες τις συσκευές σας.' : 'Edit, rename, or delete your custom categories. Changes synchronize across all your devices instantly.')}
                            </p>

                            {/* Stats Chips */}
                            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                                <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-violet-100 flex items-center gap-1.5">
                                    <Tag size={12} strokeWidth={2.5} />
                                    <span>{translate('categories_expense_tab') || 'Έξοδα'}: {expenseCustom.length}</span>
                                </span>
                                <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-violet-100 flex items-center gap-1.5">
                                    <Tag size={12} strokeWidth={2.5} />
                                    <span>{translate('categories_income_tab') || 'Έσοδα'}: {incomeCustom.length}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Type Toggle & Add Bar */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                            {/* Segmented Type Toggle */}
                            <div className="flex bg-gray-100 dark:bg-white/[0.06] p-1.5 rounded-2xl shrink-0">
                                <button
                                    type="button"
                                    onClick={() => { setActiveType('expense'); setEditingCategory(null); }}
                                    className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                                        activeType === 'expense'
                                            ? 'bg-white dark:bg-surface-dark3 text-rose-600 dark:text-rose-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <span>{translate('categories_expense_tab') || 'Έξοδα'}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                                        activeType === 'expense'
                                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                                            : 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                                    }`}>
                                        {expenseCustom.length}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setActiveType('income'); setEditingCategory(null); }}
                                    className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                                        activeType === 'income'
                                            ? 'bg-white dark:bg-surface-dark3 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <span>{translate('categories_income_tab') || 'Έσοδα'}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                                        activeType === 'income'
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                            : 'bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                                    }`}>
                                        {incomeCustom.length}
                                    </span>
                                </button>
                            </div>

                            {/* Add Category Button or Expand */}
                            {!isAdding ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isPro) {
                                            openUpgradeModal('categories');
                                            return;
                                        }
                                        setIsAdding(true);
                                    }}
                                    className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm shadow-violet-600/20 active:scale-95 transition-all cursor-pointer"
                                >
                                    <Plus size={16} strokeWidth={2.5} />
                                    <span>{translate('add_category') || 'Προσθήκη Κατηγορίας'}</span>
                                    {!isPro && <ProBadge />}
                                </button>
                            ) : null}
                        </div>

                        {/* Inline Add Category Form */}
                        {isAdding && (
                            <form onSubmit={handleAddCategory} className="p-4 rounded-2xl bg-violet-50/50 dark:bg-violet-500/[0.05] border border-violet-200/80 dark:border-violet-500/20 space-y-3 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-violet-900 dark:text-violet-300">
                                        {translate('add_category') || 'Νέα Προσαρμοσμένη Κατηγορία'} ({activeType === 'expense' ? (isEL ? 'Έξοδο' : 'Expense') : (isEL ? 'Έσοδο' : 'Income')})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => { setIsAdding(false); setNewCatName(''); }}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        autoFocus
                                        value={newCatName}
                                        onChange={(e) => setNewCatName(e.target.value)}
                                        placeholder={translate('category_name_placeholder') || 'π.χ. Συνδρομές, Φροντιστήριο...'}
                                        maxLength={40}
                                        className="flex-1 px-3.5 py-2.5 rounded-xl text-sm border border-violet-200 dark:border-white/10 bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={!newCatName.trim()}
                                            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-violet-600/20"
                                        >
                                            <Check size={16} />
                                            <span>{translate('save') || 'Αποθήκευση'}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setIsAdding(false); setNewCatName(''); }}
                                            className="px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                                        >
                                            {translate('cancel') || 'Ακύρωση'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Custom Categories List */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between pb-1">
                            <div>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                                    {activeType === 'expense'
                                        ? (isEL ? 'Κατηγορίες Εξόδων' : 'Expense Categories')
                                        : (isEL ? 'Κατηγορίες Εσόδων' : 'Income Categories')}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {isEL
                                        ? `${currentCustomList.length} προσαρμοσμένες κατηγορίες`
                                        : `${currentCustomList.length} custom categories`}
                                </p>
                            </div>
                        </div>

                        {currentCustomList.length === 0 ? (
                            <div className="py-12 px-4 text-center rounded-2xl bg-gray-50/60 dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10 space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-violet-100/70 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto">
                                    <Tag size={22} strokeWidth={2} />
                                </div>
                                <h4 className="font-extrabold text-sm text-gray-800 dark:text-white">
                                    {translate('no_custom_categories_title') || 'Δεν υπάρχουν προσαρμοσμένες κατηγορίες'}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
                                    {translate('no_custom_categories_desc') || 'Μπορείτε να προσθέσετε νέες κατηγορίες πατώντας το κουμπί παραπάνω.'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {currentCustomList.map((catName) => {
                                    const count = txCounts[catName] || 0;
                                    const isEditing = editingCategory?.oldName === catName && editingCategory?.type === activeType;

                                    return (
                                        <div
                                            key={catName}
                                            className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 group"
                                        >
                                            {isEditing ? (
                                                <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full animate-fade-in">
                                                    <input
                                                        type="text"
                                                        autoFocus
                                                        value={editingCategory.newName}
                                                        onChange={(e) => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveEdit();
                                                            if (e.key === 'Escape') setEditingCategory(null);
                                                        }}
                                                        maxLength={40}
                                                        className="flex-1 px-3.5 py-2 rounded-xl text-sm border border-violet-300 dark:border-violet-500/50 bg-white dark:bg-surface-dark3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                                    />
                                                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                                                        <button
                                                            type="button"
                                                            disabled={isSavingEdit || !editingCategory.newName.trim()}
                                                            onClick={handleSaveEdit}
                                                            className="p-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-all"
                                                            title={translate('save') || 'Αποθήκευση'}
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingCategory(null)}
                                                            className="p-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                                                            title={translate('cancel') || 'Ακύρωση'}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center gap-3.5 min-w-0">
                                                        <CategoryIcon category={catName} type={activeType} size={18} className="w-10 h-10 rounded-xl" />
                                                        <div className="min-w-0">
                                                            <span className="block font-bold text-sm text-gray-900 dark:text-white truncate">
                                                                {catName}
                                                            </span>
                                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                                {count === 0
                                                                    ? (translate('tx_count_none') || 'Καμία συναλλαγή')
                                                                    : count === 1
                                                                    ? (translate('tx_count_singular') || '1 συναλλαγή')
                                                                    : (translate('tx_count_label', { count }) || `${count} συναλλαγές`)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-end gap-2 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingCategory({ oldName: catName, newName: catName, type: activeType })}
                                                            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all"
                                                            title={translate('edit_category') || 'Επεξεργασία'}
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePromptDelete(catName)}
                                                            className="p-2 rounded-xl text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                                                            title={translate('delete_category') || 'Διαγραφή'}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* System Built-in Categories Reference Card */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
                        <button
                            type="button"
                            onClick={() => setShowBaseCategories(!showBaseCategories)}
                            className="w-full flex items-center justify-between text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 flex items-center justify-center shrink-0">
                                    <Info size={18} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                        {translate('system_base_categories') || 'Βασικές Κατηγορίες Συστήματος'}
                                    </h4>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        {translate('system_base_categories_desc') || 'Προκαθορισμένες μόνιμες κατηγορίες'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-gray-400 dark:text-white/40">
                                {showBaseCategories ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                        </button>

                        {showBaseCategories && (
                            <div className="pt-2 border-t border-gray-100 dark:border-white/[0.05] animate-fade-in space-y-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Οι παρακάτω κατηγορίες είναι ενσωματωμένες στο σύστημα του SpendWise για την υποστήριξη αυτόματης αναγνώρισης αποδείξεων και τραπεζικών μηνυμάτων και δεν μπορούν να διαγραφούν:'
                                        : 'These categories are built into SpendWise to power receipt and SMS parsing and cannot be removed:'}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {currentBaseList.map((baseCat) => (
                                        <span
                                            key={baseCat}
                                            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/[0.05] text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-white/[0.06] flex items-center gap-1.5"
                                        >
                                            <CategoryIcon category={baseCat} type={activeType} size={13} className="!p-1 !rounded-md" />
                                            <span>{baseCat}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Delete Modal with Reassignment Target */}
            {deleteTarget && (
                <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center animate-fade-in">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteTarget(null)} />
                    <div className="relative z-10 w-full max-w-md bg-white dark:bg-surface-dark2 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-5 border border-gray-100 dark:border-white/10 m-0 sm:m-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 flex items-center justify-center shrink-0">
                                <Trash2 size={20} strokeWidth={2.3} />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
                                    {translate('delete_category') || 'Διαγραφή Κατηγορίας'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    «{deleteTarget.name}»
                                </p>
                            </div>
                        </div>

                        {deleteTarget.txCount > 0 ? (
                            <div className="space-y-4">
                                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2.5">
                                    <ArrowRightLeft size={16} className="shrink-0 mt-0.5" />
                                    <span>
                                        {translate('delete_category_has_txs', { category: deleteTarget.name, count: deleteTarget.txCount }) ||
                                            `Η κατηγορία «${deleteTarget.name}» συνδέεται με ${deleteTarget.txCount} συναλλαγές.`}
                                    </span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                        {translate('reassign_to_label') || 'Μεταφορά συναλλαγών στην κατηγορία:'}
                                    </label>
                                    <select
                                        value={deleteTarget.reassignTo}
                                        onChange={(e) => setDeleteTarget({ ...deleteTarget, reassignTo: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-surface-dark3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                                    >
                                        {availableReassignTargets.map(target => (
                                            <option key={target} value={target}>
                                                {target}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                                        {translate('reassign_desc') || 'Όλες οι υπάρχουσες συναλλαγές θα μεταφερθούν αυτόματα στην επιλεγμένη κατηγορία χωρίς απώλεια δεδομένων.'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                {translate('delete_category_confirm', { category: deleteTarget.name }) ||
                                    `Είστε βέβαιοι ότι θέλετε να διαγράψετε την κατηγορία «${deleteTarget.name}»;`}
                            </p>
                        )}

                        <div className="flex gap-2.5 pt-1">
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-center"
                            >
                                {translate('cancel') || 'Ακύρωση'}
                            </button>
                            <button
                                type="button"
                                id="confirm-delete-category-btn"
                                data-testid="confirm-delete-category-btn"
                                disabled={isDeleting}
                                onClick={handleConfirmDelete}
                                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm shadow-rose-600/30 transition-all text-center flex items-center justify-center gap-1.5"
                            >
                                {isDeleting ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Trash2 size={14} />
                                        <span>{translate('delete') || 'Διαγραφή'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesSettingsView;
