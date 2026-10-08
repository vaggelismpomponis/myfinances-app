import React from 'react';
import {
    ArrowLeft,
    ShieldCheck,
    Lock,
    Eye,
    Database,
    Globe,
    Mail,
    Server,
    UserCheck,
    FileText,
    CheckCircle2,
    Sparkles,
    Shield,
    Check,
    MessageSquare
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const PrivacyPolicyView = ({ onBack, hideHeader }) => {
    const { language } = useSettings();
    const isEL = language === 'el';

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden">

            {/* ─────── Mobile Sticky Header ─────── */}
            {!hideHeader && (
                <div
                    className="shrink-0 transition-colors duration-300 sticky top-0 z-20 bg-gray-50/90 dark:bg-surface-dark/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06] px-4 pb-3"
                    style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
                >
                    <div className="flex items-center justify-between min-h-[36px]">
                        <button
                            onClick={onBack}
                            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center text-gray-700 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/[0.14] active:scale-90 transition-all duration-150"
                            aria-label="Back"
                        >
                            <ArrowLeft size={16} strokeWidth={2.5} />
                        </button>
                        <div className="text-center">
                            <h2 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight">
                                {isEL ? 'Πολιτική Απορρήτου' : 'Privacy Policy'}
                            </h2>
                            <p className="text-[11px] font-medium text-gray-500 dark:text-white/50 leading-none mt-0.5">
                                {isEL ? 'Ενημέρωση: Οκτώβριος 2026' : 'Updated: October 2026'}
                            </p>
                        </div>
                        <div className="w-9" />
                    </div>
                </div>
            )}

            {/* ─────── Main Scroll Container ─────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-6">

                    {/* Desktop Navigation Breadcrumb Bar */}
                    {hideHeader && (
                        <div className="flex items-center justify-between pb-1">
                            <button
                                onClick={onBack}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.05] border border-gray-200/80 dark:border-white/[0.08] text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.1] active:scale-95 shadow-sm transition-all"
                            >
                                <ArrowLeft size={14} strokeWidth={2.5} />
                                <span>{isEL ? 'Επιστροφή στις Ρυθμίσεις' : 'Back to Settings'}</span>
                            </button>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-200/60 dark:border-violet-500/20 text-xs font-semibold text-violet-700 dark:text-violet-300">
                                <ShieldCheck size={13} className="shrink-0 text-violet-600 dark:text-violet-400" />
                                <span>SpendWise Trust & Privacy</span>
                            </div>
                        </div>
                    )}

                    {/* ─────── Executive Hero Hub ─────── */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 dark:from-violet-950 dark:via-indigo-950 dark:to-surface-dark3 border border-violet-400/30 dark:border-white/10 shadow-xl shadow-violet-500/15 text-white p-6 sm:p-8">
                        {/* Ambient decorative glowing backdrops */}
                        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
                        <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
                            <ShieldCheck size={160} strokeWidth={1} />
                        </div>

                        <div className="relative z-10 max-w-2xl space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-violet-100 tracking-wide uppercase">
                                <Shield size={13} />
                                <span>{isEL ? 'Χάρτης Εμπιστοσύνης & Απορρήτου' : 'Privacy & Trust Charter'}</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                                {isEL ? 'Το Απόρρητό σας είναι Προτεραιότητα' : 'Your Privacy is Our Priority'}
                            </h2>
                            <p className="text-sm sm:text-base text-violet-100/90 leading-relaxed font-medium">
                                {isEL
                                    ? 'Κατανοούμε απόλυτα ότι τα οικονομικά σας δεδομένα είναι ευαίσθητα. Δείτε με διαφάνεια πώς τα συλλέγουμε, πώς τα προστατεύουμε και γιατί δεν τα διαμοιραζόμαστε ποτέ με διαφημιστές.'
                                    : 'We understand that your financial records are sensitive. Here is complete transparency on how we protect your records, enforce encryption, and never share data with advertisers.'}
                            </p>

                            {/* Trust Commitments */}
                            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold">
                                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-violet-100/90 flex items-center gap-1.5">
                                    <CheckCircle2 size={12} strokeWidth={2.5} className="text-emerald-300" />
                                    <span>{isEL ? 'Μηδενικές Διαφημίσεις' : 'Zero Ad Tracking'}</span>
                                </span>

                                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-violet-100/90 flex items-center gap-1.5">
                                    <Lock size={12} strokeWidth={2.5} className="text-emerald-300" />
                                    <span>{isEL ? 'Κρυπτογραφημένο Cloud Vault' : 'Encrypted Cloud Vault'}</span>
                                </span>

                                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/15 text-violet-100/90 flex items-center gap-1.5">
                                    <Sparkles size={12} strokeWidth={2.5} />
                                    <span>{isEL ? 'Πλήρης Κυριαρχία Δεδομένων' : 'Full Data Sovereignty'}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Bento Card 1: What Data We Collect ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-500/20 flex items-center justify-center shrink-0">
                                <Eye size={20} strokeWidth={2.3} />
                            </div>
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 border border-violet-200/60 dark:border-violet-500/20">
                                    {isEL ? 'Δεδομένα' : 'Collection'}
                                </span>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight mt-1">
                                    {isEL ? 'Τι δεδομένα συλλέγουμε' : 'What Data We Collect'}
                                </h3>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {isEL
                                ? 'Συλλέγουμε αυστηρά μόνο τα δεδομένα που είναι απολύτως απαραίτητα για την ορθή λειτουργία της εφαρμογής:'
                                : 'We only collect information that is strictly essential for the financial ledger to function:'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] space-y-2">
                                <div className="w-9 h-9 rounded-xl bg-violet-100/70 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                                    <UserCheck size={18} strokeWidth={2.2} />
                                </div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Στοιχεία Λογαριασμού' : 'Account Identity'}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Το email και το όνομά σας όταν συνδέεστε μέσω Google ή Email, αποκλειστικά για την ταυτοποίηση της σύνδεσής σας.'
                                        : 'Your email address and display name when signing in via Google Auth or Email, strictly for session authentication.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] space-y-2">
                                <div className="w-9 h-9 rounded-xl bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <Database size={18} strokeWidth={2.2} />
                                </div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Οικονομικά Δεδομένα' : 'Financial Ledger'}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Συναλλαγές, κατηγορίες, στόχοι αποταμίευσης και προϋπολογισμοί που καταχωρείτε εσείς στην εφαρμογή.'
                                        : 'Transactions, categories, recurring rules, and budgets that you enter manually or import into the app.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] space-y-2">
                                <div className="w-9 h-9 rounded-xl bg-cyan-100/70 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                                    <Server size={18} strokeWidth={2.2} />
                                </div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Τηλεμετρία Συσκευής' : 'Device Compatibility'}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Βασικές πληροφορίες συσκευής και πλατφόρμας για διασφάλιση συμβατότητας PIN και βιομετρικού κλειδώματος.'
                                        : 'Basic OS platform and screen profile parameters to ensure hardware PIN and biometric lock compatibility.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Bento Card 2: How We Use Data & Zero-Ad Pledge ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20 flex items-center justify-center shrink-0">
                                <Database size={20} strokeWidth={2.3} />
                            </div>
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/20">
                                    {isEL ? 'Χρήση' : 'Usage'}
                                </span>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight mt-1">
                                    {isEL ? 'Πώς χρησιμοποιούμε τα δεδομένα σας' : 'How We Use Data'}
                                </h3>
                            </div>
                        </div>

                        {/* Ironclad Pledge Banner */}
                        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                            <ShieldCheck size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" strokeWidth={2.2} />
                            <div className="text-xs leading-relaxed">
                                <strong className="font-extrabold block text-[13px] text-emerald-800 dark:text-emerald-300 mb-0.5">
                                    {isEL ? 'Δέσμευση Μηδενικής Εμπορευματοποίησης' : 'Zero Commercialization Pledge'}
                                </strong>
                                {isEL
                                    ? 'Δεν πουλάμε, δεν ενοικιάζουμε και δεν μοιραζόμαστε ποτέ τα οικονομικά σας δεδομένα με διαφημιστικές εταιρείες ή εταιρείες ανάλυσης δεδομένων.'
                                    : 'We never sell, rent, broker, or monetize your financial data to advertising networks or third-party data brokers.'}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                                    <Check size={14} strokeWidth={2.5} />
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Παροχή & Συγχρονισμός Υπηρεσιών' : 'Service Delivery & Real-Time Sync'}
                                    </strong>
                                    {isEL
                                        ? 'Εμφάνιση στατιστικών, υπολογισμός υπολοίπων, ειδοποιήσεις υπέρβασης ορίων και άμεσος συγχρονισμός σε όλες τις συνδεδεμένες συσκευές σας.'
                                        : 'Displaying balance insights, budget utilization limits, recurring rules, and seamless cloud synchronization across all devices.'}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                                    <Check size={14} strokeWidth={2.5} />
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Προστασία & Ασφάλεια' : 'Security & Access Control'}
                                    </strong>
                                    {isEL
                                        ? 'Έλεγχος ενεργών συνεδριών, αποτροπή κακόβουλης πρόσβασης και εφαρμογή κρυπτογραφημένων πρωτοκόλλων ασφαλείας.'
                                        : 'Monitoring active session devices, blocking unauthorized connections, and safeguarding cryptographic access tokens.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Bento Card 3: Storage & Cryptography ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <Lock size={20} strokeWidth={2.3} />
                            </div>
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-500/20">
                                    {isEL ? 'Ασφάλεια' : 'Security'}
                                </span>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight mt-1">
                                    {isEL ? 'Ασφάλεια Δεδομένων & Κρυπτογράφηση' : 'Data Security & Storage'}
                                </h3>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {isEL
                                ? 'Χρησιμοποιούμε enterprise υποδομές Supabase (σε servers Google Cloud) με ισχυρή κρυπτογράφηση σε ηρεμία και μεταφορά:'
                                : 'We leverage enterprise Supabase infrastructure (hosted on Google Cloud Platform) with multi-tiered encryption:'}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] space-y-2">
                                <div className="text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
                                    TLS 1.3
                                </div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Κρυπτογράφηση Μεταφοράς' : 'In-Transit Encryption'}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Όλη η κίνηση μεταξύ συσκευής και βάσης δεδομένων κρυπτογραφείται μέσω αυστηρού πρωτοκόλλου HTTPS / TLS.'
                                        : 'Every request between your device and database travels across high-grade encrypted HTTPS / TLS channels.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] space-y-2">
                                <div className="text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
                                    AES-256
                                </div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Κρυπτογράφηση σε Ηρεμία' : 'At-Rest Encryption'}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Τα αποθηκευμένα δεδομένα παραμένουν προστατευμένα με enterprise κρυπτογράφηση δίσκου στα κέντρα δεδομένων.'
                                        : 'Stored tables and backups reside on encrypted Google Cloud disks protected by hardened security policies.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] space-y-2">
                                <div className="text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
                                    Local Enclave
                                </div>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                    {isEL ? 'Τοπικό Κλείδωμα' : 'Hardware Biometrics'}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {isEL
                                        ? 'Το PIN και τα βιομετρικά αποτυπώματα ελέγχονται αποκλειστικά τοπικά στο hardware της συσκευής σας.'
                                        : 'Your App PIN and FaceID / TouchID biometric keys are authenticated locally without reaching external servers.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Bento Card 4: Third-Party Infrastructure ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-500/20 flex items-center justify-center shrink-0">
                                <Globe size={20} strokeWidth={2.3} />
                            </div>
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-500/20">
                                    {isEL ? 'Υποδομές' : 'Partners'}
                                </span>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight mt-1">
                                    {isEL ? 'Υπηρεσίες & Υποδομές Τρίτων' : 'Third-Party Services'}
                                </h3>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {isEL
                                ? 'Η εφαρμογή SpendWise βασίζεται στις εξής αξιόπιστες υπηρεσίες παγκόσμιας κλάσης:'
                                : 'SpendWise partners only with world-class, SOC 2 compliant platforms:'}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                            <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06]">
                                <span className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase">Database & Auth</span>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">Supabase</h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                    {isEL ? 'Βάση δεδομένων PostgreSQL και διαχείριση ταυτότητας.' : 'Encrypted PostgreSQL cloud database & JWT tokens.'}
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06]">
                                <span className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase">Authentication</span>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">Google OAuth</h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                    {isEL ? 'Ασφαλής είσοδος χωρίς κοινοποίηση του κωδικού σας.' : 'Zero-password Google SSO identity authentication.'}
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06]">
                                <span className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase">Native Runtime</span>
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">Capacitor</h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                                    {isEL ? 'Επίσημο Android/iOS native runtime περιβάλλον.' : 'Secure sandboxed native bridge for Android devices.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Bento Card 5: Your Rights & Sovereignty ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/20 flex items-center justify-center shrink-0">
                                <FileText size={20} strokeWidth={2.3} />
                            </div>
                            <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-200/60 dark:border-amber-500/20">
                                    {isEL ? 'Δικαιώματα' : 'Sovereignty'}
                                </span>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight mt-1">
                                    {isEL ? 'Τα Δικαιώματά σας & Κυριαρχία Δεδομένων' : 'Your Rights & Data Portability'}
                                </h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 size={13} strokeWidth={2.5} />
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Δικαίωμα Εξαγωγής' : 'Right to Export'}
                                    </strong>
                                    {isEL
                                        ? 'Μπορείτε να κατεβάσετε όλο το ιστορικό σας σε standard JSON αρχείο ανά πάσα στιγμή.'
                                        : 'Download your complete transaction ledger as a JSON archive anytime from Settings.'}
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 size={13} strokeWidth={2.5} />
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Δικαίωμα Διόρθωσης' : 'Right to Rectify'}
                                    </strong>
                                    {isEL
                                        ? 'Έχετε τη δυνατότητα άμεσης επεξεργασίας ή διόρθωσης οποιασδήποτε εγγραφής ή κανόνα.'
                                        : 'Update, rename, or adjust transactions, categories, and account settings instantly.'}
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                                    <CheckCircle2 size={13} strokeWidth={2.5} />
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                    <strong className="block text-gray-900 dark:text-white font-bold mb-0.5">
                                        {isEL ? 'Δικαίωμα Διαγραφής' : 'Right to Erasure'}
                                    </strong>
                                    {isEL
                                        ? 'Οριστική διαγραφή όλων των συναλλαγών ή του λογαριασμού σας με 1 κλικ από τη Ζώνη Κινδύνου.'
                                        : 'Permanently purge all financial rows or delete your account completely with zero residue.'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Contact & Inquiries Card ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-500/20 flex items-center justify-center shrink-0">
                                    <Mail size={20} strokeWidth={2.3} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                        {isEL ? 'Ερωτήσεις για το Απόρρητο;' : 'Questions Regarding Privacy?'}
                                    </h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {isEL
                                            ? 'Επικοινωνήστε απευθείας με την ομάδα ανάπτυξης μέσω της ενότητας Σχόλια & Ιδέες.'
                                            : 'Reach out directly to the team via the Feedback & Ideas hub in Settings.'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onBack}
                                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-gray-700 dark:text-white font-extrabold text-xs active:scale-95 transition-all text-center shrink-0"
                            >
                                {isEL ? 'Επιστροφή' : 'Return'}
                            </button>
                        </div>
                    </div>

                    {/* Footer Signature */}
                    <div className="text-center pt-2 pb-8">
                        <p className="text-[11px] font-medium text-gray-400 dark:text-white/40">
                            SpendWise Finance App &bull; {isEL ? 'Χάρτης Προστασίας Δεδομένων' : 'Data Protection Charter'} &bull; &copy; 2026
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyView;
