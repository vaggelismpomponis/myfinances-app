import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Star, ShieldCheck, Zap, Bell, RefreshCw, QrCode } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { PLAY_STORE_URL } from '../utils/platform';

/* ─────────────────────────────────────────
   Official Google Play Brand Icon (SVG)
 ───────────────────────────────────────── */
export const GooglePlayIcon = ({ size = 22, className = '' }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={`flex-shrink-0 ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path
            d="M3.609 1.814C3.228 2.222 3 2.825 3 3.61v16.78c0 .785.228 1.388.609 1.796l.095.093 9.49-9.49v-.224L3.704 1.721l-.095.093z"
            fill="#00D2FF"
        />
        <path
            d="M16.36 15.726l-3.166-3.166v-.224l3.166-3.166.071.04 3.75 2.131c1.07.608 1.07 1.605 0 2.213l-3.75 2.132-.071.04z"
            fill="#FFCE00"
        />
        <path
            d="M13.194 12.336L3.609 21.921c.42.444 1.114.498 1.884.06l10.867-6.173-3.166-4.072z"
            fill="#FF334B"
        />
        <path
            d="M13.194 12.112l3.166-4.072L5.493 1.867C4.723 1.43 4.029 1.484 3.609 1.928l9.585 10.184z"
            fill="#00E266"
        />
    </svg>
);

const PlayStoreModal = ({ isOpen, onClose }) => {
    const { t, language } = useSettings();

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(PLAY_STORE_URL)}&margin=0`;

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="playstore-modal-title"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 16 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden z-10 max-h-[90vh] flex flex-col"
                    >
                        {/* Ambient decorative glow */}
                        <div className="absolute -top-24 -right-24 w-52 h-52 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-gradient-to-tr from-violet-500/15 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                        {/* Top close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white bg-gray-100/80 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all active:scale-90"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>

                        {/* Modal Body */}
                        <div className="p-6 sm:p-7 overflow-y-auto custom-scrollbar relative z-10 space-y-5">
                            {/* App Identity Header */}
                            <div className="flex items-center gap-4 pr-8">
                                <div className="relative flex-shrink-0">
                                    <img
                                        src="/spendwise-logo.webp"
                                        alt="SpendWise Logo"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = '/pwa-192x192.png';
                                        }}
                                        className="w-16 h-16 rounded-[18px] object-cover shadow-lg border border-black/5 dark:border-white/10"
                                    />
                                    <div className="absolute -bottom-1.5 -right-1.5 p-1 bg-white dark:bg-slate-800 rounded-full shadow-md border border-gray-100 dark:border-white/10 flex items-center justify-center">
                                        <GooglePlayIcon size={14} />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <h3
                                        id="playstore-modal-title"
                                        className="text-[20px] font-black text-gray-900 dark:text-white tracking-tight leading-tight truncate"
                                    >
                                        SpendWise
                                    </h3>
                                    <p className="text-[12px] font-medium text-gray-500 dark:text-white/60 truncate mt-0.5">
                                        {t('play_store_subtitle') || 'Επίσημη εφαρμογή Android'}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-500/20">
                                            <ShieldCheck size={11} /> {t('play_store_badge_protect') || 'Play Protect Verified'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Store Highlights Grid */}
                            <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-gray-50/90 dark:bg-white/[0.04] rounded-2xl border border-gray-100 dark:border-white/5 text-center">
                                <div>
                                    <div className="flex items-center justify-center gap-1 text-[13px] font-black text-amber-500">
                                        <Star size={13} className="fill-amber-400 text-amber-400" />
                                        <span>4.9</span>
                                    </div>
                                    <p className="text-[10px] font-medium text-gray-400 dark:text-white/40 mt-0.5">
                                        {t('play_store_badge_rating') || '4.9 ★'}
                                    </p>
                                </div>
                                <div className="border-x border-gray-200/60 dark:border-white/10">
                                    <div className="flex items-center justify-center gap-1 text-[13px] font-black text-emerald-600 dark:text-emerald-400">
                                        <Zap size={13} />
                                        <span>100%</span>
                                    </div>
                                    <p className="text-[10px] font-medium text-gray-400 dark:text-white/40 mt-0.5">
                                        {t('play_store_badge_free') || 'Δωρεάν'}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center gap-1 text-[13px] font-black text-blue-600 dark:text-blue-400">
                                        <ShieldCheck size={13} />
                                        <span>Google</span>
                                    </div>
                                    <p className="text-[10px] font-medium text-gray-400 dark:text-white/40 mt-0.5">
                                        Play Store
                                    </p>
                                </div>
                            </div>

                            {/* Pitch / Description */}
                            <p className="text-[13px] text-gray-600 dark:text-white/70 leading-relaxed text-left">
                                {t('play_store_desc') ||
                                    'Κατεβάστε την επίσημη εφαρμογή απευθείας από το Google Play Store για άμεσες ειδοποιήσεις, αυτόματες ενημερώσεις και μέγιστη ασφάλεια.'}
                            </p>

                            {/* Feature Pills */}
                            <div className="space-y-2 text-left">
                                <div className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-700 dark:text-white/80">
                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                                        <Bell size={13} />
                                    </div>
                                    <span>{t('play_store_feature_push') || 'Άμεσες ειδοποιήσεις & υπενθυμίσεις εξόδων'}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-700 dark:text-white/80">
                                    <div className="w-6 h-6 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
                                        <Zap size={13} />
                                    </div>
                                    <span>{t('play_store_feature_perf') || 'Ταχύτερη απόδοση & λειτουργία εκτός σύνδεσης'}</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-700 dark:text-white/80">
                                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                        <RefreshCw size={13} />
                                    </div>
                                    <span>{t('play_store_feature_updates') || 'Αυτόματες ενημερώσεις & μέγιστη ασφάλεια'}</span>
                                </div>
                            </div>

                            {/* Desktop QR Scan Section */}
                            <div className="hidden sm:flex items-center gap-3.5 p-3 bg-gray-50/90 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-2xl">
                                <div className="bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex-shrink-0">
                                    <img
                                        src={qrCodeUrl}
                                        alt="Google Play QR Code"
                                        className="w-16 h-16 object-contain"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="text-left min-w-0">
                                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-900 dark:text-white">
                                        <QrCode size={13} className="text-emerald-500" />
                                        <span>{t('play_store_scan_qr_title') || 'Σαρώστε με το κινητό σας'}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-white/50 mt-0.5 leading-snug">
                                        {t('play_store_scan_qr_desc') || 'Ανοίξτε την κάμερα του κινητού σας για άμεση λήψη στο Google Play.'}
                                    </p>
                                </div>
                            </div>

                            {/* Main CTA: Official Google Play Badge Button */}
                            <a
                                href={PLAY_STORE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-black hover:bg-neutral-900 active:scale-[0.98] text-white rounded-2xl border border-white/10 shadow-xl shadow-black/25 transition-all duration-200 group cursor-pointer"
                            >
                                <GooglePlayIcon size={26} />
                                <div className="text-left flex flex-col leading-tight">
                                    <span className="text-[10px] tracking-wider uppercase font-semibold text-neutral-300">
                                        {t('play_store_get_it_on') || (language === 'el' ? 'ΑΠΟΚΤΗΣΤΕ ΤΟ ΣΤΟ' : 'GET IT ON')}
                                    </span>
                                    <span className="text-[17px] font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                                        Google Play
                                    </span>
                                </div>
                                <ExternalLink size={16} className="text-neutral-400 group-hover:text-white transition-colors ml-auto" />
                            </a>

                            {/* Dismiss button */}
                            <button
                                onClick={onClose}
                                className="w-full py-2.5 text-[13px] font-bold text-gray-500 dark:text-white/50 hover:text-gray-800 dark:hover:text-white transition-colors"
                            >
                                {t('close') || 'Κλείσιμο'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PlayStoreModal;
