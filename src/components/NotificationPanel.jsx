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
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        key="notif-panel"
                        initial={{ opacity: 0, y: -12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.97 }}
                        transition={{ type: "spring", damping: 22, stiffness: 260 }}
                        className="fixed top-[72px] right-3 left-3 z-50 max-w-sm ml-auto
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
                                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.06]
                                                    flex items-center justify-center mb-4">
                                        <Bell size={24} className="text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-700 dark:text-white/80 mb-1">
                                        {t("no_notifications") || "No notifications yet"}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
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
