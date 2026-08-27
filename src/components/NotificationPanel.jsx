import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCheck, Trash2, Plus, Pencil, Minus, Info } from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import { useSettings } from "../contexts/SettingsContext";

const TYPE_CONFIG = {
    add:    { icon: Plus,   bg: "bg-emerald-100 dark:bg-emerald-900/40",  color: "text-emerald-600 dark:text-emerald-400" },
    edit:   { icon: Pencil, bg: "bg-violet-100 dark:bg-violet-900/40",   color: "text-violet-600 dark:text-violet-400"   },
    delete: { icon: Minus,  bg: "bg-rose-100 dark:bg-rose-900/40",       color: "text-rose-600 dark:text-rose-400"       },
    info:   { icon: Info,   bg: "bg-blue-100 dark:bg-blue-900/40",       color: "text-blue-600 dark:text-blue-400"       },
};

function timeAgo(isoString, t) {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60)   return `${diff}${t('time_seconds_ago') || 's ago'}`;
    if (diff < 3600) return `${Math.floor(diff / 60)}${t('time_minutes_ago') || 'm ago'}`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}${t('time_hours_ago') || 'h ago'}`;
    return `${Math.floor(diff / 86400)}${t('time_days_ago') || 'd ago'}`;
}

const NotificationPanel = ({ isOpen, onClose }) => {
    const { notifications, markAllRead, clearAll, unreadCount } = useNotifications();
    const { t } = useSettings();

    const handleOpen = () => {
        markAllRead();
    };

    React.useEffect(() => {
        if (isOpen) handleOpen();
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="notif-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-[50] bg-black/30 backdrop-blur-[2px]"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        key="notif-panel"
                        initial={{ opacity: 0, y: -12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.97 }}
                        transition={{ type: "spring", damping: 22, stiffness: 260 }}
                        className="fixed top-[72px] right-3 left-3 z-[55] max-w-sm ml-auto
                                   bg-white dark:bg-surface-dark3
                                   rounded-[1.75rem] shadow-2xl shadow-black/15
                                   border border-gray-100 dark:border-white/[0.07]
                                   overflow-hidden"
                        style={{ maxHeight: "70vh" }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4
                                        border-b border-gray-100 dark:border-white/[0.06]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40
                                                flex items-center justify-center">
                                    <Bell size={16} className="text-violet-600 dark:text-violet-400" />
                                </div>
                                <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                                    {t("notifications") || "Notifications"}
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="bg-violet-600 text-white text-[10px] font-black
                                                     px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAll}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center
                                                   text-gray-400 hover:text-rose-500
                                                   hover:bg-rose-50 dark:hover:bg-rose-900/20
                                                   transition-all duration-150"
                                        title={t("clear_all") || "Clear all"}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center
                                               text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                                               hover:bg-gray-100 dark:hover:bg-white/[0.07]
                                               transition-all duration-150"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 68px)" }}>
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
                                    <div className="relative mb-3">
                                        {/* Inline SVG — always transparent, crisp at any size */}
                                        <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            {/* Soft glow behind bell */}
                                            <ellipse cx="70" cy="72" rx="42" ry="38" fill="url(#glowGrad)" opacity="0.35"/>

                                            {/* Bell body */}
                                            <path d="M70 22C52 22 38 37 38 56V82H102V56C102 37 88 22 70 22Z" fill="url(#bellGrad)"/>
                                            {/* Bell bottom flare */}
                                            <path d="M32 82H108C108 82 108 88 70 88C32 88 32 82 32 82Z" fill="url(#bellGrad2)" rx="4"/>
                                            {/* Bell clapper */}
                                            <ellipse cx="70" cy="91" rx="7" ry="5" fill="url(#bellGrad2)"/>
                                            {/* Bell handle */}
                                            <path d="M64 22C64 18.686 66.686 16 70 16C73.314 16 76 18.686 76 22" stroke="url(#bellGrad2)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                                            {/* Highlight sheen */}
                                            <ellipse cx="57" cy="44" rx="7" ry="12" fill="white" opacity="0.18" transform="rotate(-15 57 44)"/>

                                            {/* Sleeping eyes */}
                                            <path d="M60 64 Q63 61 66 64" stroke="#5B3FA0" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                                            <path d="M74 64 Q77 61 80 64" stroke="#5B3FA0" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                                            {/* Smile */}
                                            <path d="M63 72 Q70 77 77 72" stroke="#5B3FA0" strokeWidth="2" strokeLinecap="round" fill="none"/>
                                            {/* Cheek blush */}
                                            <ellipse cx="58" cy="70" rx="4.5" ry="2.5" fill="#C084FC" opacity="0.35"/>
                                            <ellipse cx="82" cy="70" rx="4.5" ry="2.5" fill="#C084FC" opacity="0.35"/>

                                            {/* ZZZ */}
                                            <text x="96" y="40" fontSize="9" fontWeight="700" fill="#A78BFA" opacity="0.9" fontFamily="sans-serif">z</text>
                                            <text x="103" y="30" fontSize="11" fontWeight="700" fill="#A78BFA" opacity="0.75" fontFamily="sans-serif">z</text>
                                            <text x="111" y="19" fontSize="13" fontWeight="700" fill="#A78BFA" opacity="0.6" fontFamily="sans-serif">z</text>

                                            {/* Sparkles */}
                                            <g opacity="0.8">
                                                <path d="M28 38 L29.5 34 L31 38 L35 39.5 L31 41 L29.5 45 L28 41 L24 39.5Z" fill="#C4B5FD"/>
                                                <path d="M108 52 L109 49 L110 52 L113 53 L110 54 L109 57 L108 54 L105 53Z" fill="#C4B5FD"/>
                                                <path d="M40 20 L40.8 18 L41.6 20 L43.6 20.8 L41.6 21.6 L40.8 23.6 L40 21.6 L38 20.8Z" fill="#E9D5FF"/>
                                                <path d="M115 75 L115.6 73.5 L116.2 75 L117.7 75.6 L116.2 76.2 L115.6 77.7 L115 76.2 L113.5 75.6Z" fill="#DDD6FE"/>
                                            </g>

                                            {/* Coins */}
                                            <circle cx="38" cy="112" r="9" fill="#F9A8D4" opacity="0.9"/>
                                            <circle cx="38" cy="112" r="9" fill="url(#coinGrad)" opacity="0.9"/>
                                            <text x="35" y="116" fontSize="9" fill="#7C3AED" fontFamily="sans-serif" fontWeight="700">$</text>
                                            <circle cx="52" cy="118" r="7" fill="url(#coinGrad)" opacity="0.75"/>
                                            <text x="49.5" y="122" fontSize="7.5" fill="#7C3AED" fontFamily="sans-serif" fontWeight="700">$</text>

                                            {/* Credit card */}
                                            <rect x="58" y="108" width="30" height="20" rx="3.5" fill="url(#cardGrad)" opacity="0.9"/>
                                            <rect x="58" y="113" width="30" height="4" fill="#7C3AED" opacity="0.25"/>
                                            <rect x="61" y="120" width="8" height="2.5" rx="1" fill="white" opacity="0.55"/>

                                            {/* Piggy bank */}
                                            <ellipse cx="108" cy="116" rx="11" ry="9" fill="url(#piggyGrad)" opacity="0.9"/>
                                            <circle cx="116" cy="112" r="3.5" fill="url(#piggyGrad)" opacity="0.9"/>
                                            <ellipse cx="101" cy="117" rx="2" ry="2.5" fill="#A78BFA" opacity="0.5"/>
                                            <circle cx="105" cy="112" r="2.5" fill="#7C3AED" opacity="0.3"/>
                                            <rect x="106" y="105" width="4" height="2.5" rx="1" fill="#7C3AED" opacity="0.4"/>

                                            {/* Gradient defs */}
                                            <defs>
                                                <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                                                    <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.5"/>
                                                    <stop offset="100%" stopColor="#A78BFA" stopOpacity="0"/>
                                                </radialGradient>
                                                <linearGradient id="bellGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                                                    <stop offset="0%" stopColor="#C4B5FD"/>
                                                    <stop offset="100%" stopColor="#7C3AED"/>
                                                </linearGradient>
                                                <linearGradient id="bellGrad2" x1="50%" y1="0%" x2="50%" y2="100%">
                                                    <stop offset="0%" stopColor="#8B5CF6"/>
                                                    <stop offset="100%" stopColor="#6D28D9"/>
                                                </linearGradient>
                                                <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#E9D5FF"/>
                                                    <stop offset="100%" stopColor="#C4B5FD"/>
                                                </linearGradient>
                                                <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#A78BFA"/>
                                                    <stop offset="100%" stopColor="#7C3AED"/>
                                                </linearGradient>
                                                <linearGradient id="piggyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#DDD6FE"/>
                                                    <stop offset="100%" stopColor="#A78BFA"/>
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white/85 mb-1">
                                        {t("no_notifications") || "No notifications yet"}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[200px] leading-relaxed">
                                        {t("notifications_empty_desc") || "Actions you take will appear here"}
                                    </p>
                                </div>
                            ) : (
                                <div className="p-2 space-y-1">
                                    {notifications.map((notif, idx) => {
                                        const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
                                        const IconComp = cfg.icon;
                                        return (
                                            <motion.div
                                                key={notif.id}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className={`flex items-start gap-3 px-3 py-3 rounded-2xl
                                                            transition-colors duration-150
                                                            ${!notif.read
                                                                ? "bg-violet-50/70 dark:bg-violet-900/10"
                                                                : "hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                                                            }`}
                                            >
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                                                    <IconComp size={16} className={cfg.color} />
                                                </div>
                                                <div className="flex-1 min-w-0 pt-0.5">
                                                    <p className={`text-[13px] font-semibold leading-snug
                                                                   ${!notif.read
                                                                       ? "text-gray-900 dark:text-white"
                                                                       : "text-gray-600 dark:text-gray-400"}`}>
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                        {timeAgo(notif.timestamp, t)}
                                                    </p>
                                                </div>
                                                {!notif.read && (
                                                    <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0 mt-2" />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
