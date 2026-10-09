import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import Navbar from './Navbar';
import PaymentSuccessView from '../views/PaymentSuccessView';
import PaymentCanceledView from '../views/PaymentCanceledView';

export default function MobileLayout({
    activeTab,
    setActiveTab,
    photoURL,
    imgRetries,
    setImgRetries,
    MAX_IMG_RETRIES,
    translate,
    unreadCount,
    setShowNotificationPanel,
    showPaymentSuccess,
    setShowPaymentSuccess,
    showPaymentCanceled,
    setShowPaymentCanceled,
    openAddModal,
    children,
    overlays,
    modals
}) {
    const [showFabMenu, setShowFabMenu] = useState(false);
    const fabLongPressRef = useRef(null);
    const fabPressStartRef = useRef(false);

    return (
        <main className="h-full w-full bg-surface-light dark:bg-surface-dark
                        font-sans text-gray-900 dark:text-white
                        selection:bg-violet-600 selection:text-white dark:selection:bg-violet-500 dark:selection:text-white
                        flex justify-center items-start transition-colors duration-300">

            {/* Mobile container */}
            <div className="w-full max-w-md bg-gray-50 dark:bg-surface-dark
                            h-full overflow-hidden
                            shadow-2xl relative flex flex-col
                            transition-colors duration-300">

                {/* Payment Success/Cancel Overlay (Mobile) */}
                {showPaymentSuccess && (
                    <PaymentSuccessView
                        onContinue={() => {
                            setShowPaymentSuccess(false);
                            setActiveTab('home');
                        }}
                    />
                )}
                {showPaymentCanceled && (
                    <PaymentCanceledView
                        onContinue={() => {
                            setShowPaymentCanceled(false);
                            setActiveTab('home');
                        }}
                        onRetry={() => {
                            setShowPaymentCanceled(false);
                            setActiveTab('profile');
                        }}
                    />
                )}

                {/* ── Main Scroll Area ── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4">
                    {/* ── Top Bar ── */}
                    <div className="shrink-0 sticky top-0 z-50
                                    bg-gray-50 dark:bg-surface-dark backdrop-blur-md
                                    border-b border-gray-100 dark:border-white/5
                                    px-4 pb-3 -mx-4 transition-all duration-300"
                        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>

                        <div className="flex items-center justify-between min-h-[40px]">
                            {/* LEFT — Profile Avatar */}
                            <div className="relative flex-shrink-0">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab('profile')}
                                    className="w-10 h-10 rounded-full flex-shrink-0
                                                bg-gray-100 dark:bg-white/[0.08]
                                                flex items-center justify-center
                                                text-gray-400 dark:text-gray-500
                                                transition-all duration-200 overflow-hidden"
                                    title={translate('nav_profile')}
                                >
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
                                        <User size={20} strokeWidth={2} />
                                    )}
                                </motion.button>
                            </div>

                            {/* CENTER — App Name */}
                            {activeTab === 'home' ? (
                                <h1 className="absolute left-1/2 -translate-x-1/2
                                                text-[17px] font-black tracking-tight
                                                bg-gradient-to-r from-violet-600 to-indigo-500
                                                dark:from-violet-400 dark:to-indigo-400
                                                bg-clip-text text-transparent
                                                select-none pointer-events-none">
                                    SpendWise
                                </h1>
                            ) : (
                                <h2 className="absolute left-1/2 -translate-x-1/2
                                                text-[16px] font-bold text-gray-900 dark:text-white
                                                truncate max-w-[160px] text-center">
                                    {activeTab === 'history' && translate('nav_history')}
                                    {activeTab === 'stats' && translate('nav_stats')}
                                    {activeTab === 'goals' && translate('goals')}
                                    {activeTab === 'budgets' && translate('budgets')}
                                    {activeTab === 'feedback' && translate('feedback')}
                                    {activeTab === 'admin' && 'Admin Panel'}
                                </h2>
                            )}

                            {/* RIGHT — Notification Bell */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowNotificationPanel(prev => !prev)}
                                className="relative w-10 h-10 rounded-full flex-shrink-0
                                        bg-gray-100 dark:bg-white/[0.08]
                                        flex items-center justify-center
                                        text-gray-500 dark:text-white/50
                                        hover:bg-violet-100 dark:hover:bg-violet-900/30
                                        hover:text-violet-600 dark:hover:text-violet-400
                                        transition-all duration-200"
                                aria-label="Notifications"
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5
                                                        w-4 h-4 rounded-full
                                                        bg-violet-600 text-white
                                                        text-[9px] font-black
                                                        flex items-center justify-center
                                                        shadow-sm">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </motion.button>
                        </div>
                    </div>

                    <div className="h-4 shrink-0" />

                    {/* Main views (Home, Stats, History) */}
                    {children}
                </div>

                {/* Overlays (Profile, Goals, Settings, etc.) */}
                {overlays}

                {/* Mobile Modals/FAB */}
                {!['goals', 'budgets', 'profile', 'recurring', 'general', 'security', 'backup', 'feedback', 'admin', 'privacy', 'advisor', 'guide', 'upgrade'].includes(activeTab) && (
                    <div className="absolute bottom-0 w-full z-[45] pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto">
                            <div id="tour-add-button" className="relative">
                                {/* Long-press context menu */}
                                <AnimatePresence>
                                    {showFabMenu && [
                                        /* Backdrop to dismiss */
                                        <div
                                            key="mobile-fab-menu-backdrop"
                                            className="fixed inset-0 z-[44]"
                                            onClick={() => setShowFabMenu(false)}
                                        />,
                                        <motion.div
                                            key="mobile-fab-menu-popover"
                                            initial={{ opacity: 0, scale: 0.85, y: 8 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.85, y: 8 }}
                                            transition={{ type: 'spring', damping: 20, stiffness: 350, mass: 0.6 }}
                                            className="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 z-[46] flex flex-col gap-2 items-center"
                                        >
                                            {/* Income pill */}
                                            <motion.button
                                                whileTap={{ scale: 0.93 }}
                                                onClick={() => { setShowFabMenu(false); openAddModal('income'); }}
                                                className="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/40 whitespace-nowrap"
                                            >
                                                <TrendingUp size={15} />
                                                <span>Έσοδο</span>
                                            </motion.button>
                                            {/* Expense pill */}
                                            <motion.button
                                                whileTap={{ scale: 0.93 }}
                                                onClick={() => { setShowFabMenu(false); openAddModal('expense'); }}
                                                className="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-500/40 whitespace-nowrap"
                                            >
                                                <TrendingDown size={15} />
                                                <span>Έξοδο</span>
                                            </motion.button>
                                            {/* Connector dot */}
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 opacity-60" />
                                        </motion.div>
                                    ]}
                                </AnimatePresence>

                                {/* FAB */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    animate={showFabMenu ? { scale: 1.08, boxShadow: '0 0 0 6px rgba(124,58,237,0.25)' } : { scale: 1, boxShadow: '0 8px 20px rgba(124,58,237,0.4)' }}
                                    onClick={() => {
                                        if (showFabMenu) { setShowFabMenu(false); return; }
                                        openAddModal();
                                    }}
                                    onContextMenu={(e) => { e.preventDefault(); setShowFabMenu(true); }}
                                    onPointerDown={() => {
                                        fabPressStartRef.current = true;
                                        fabLongPressRef.current = setTimeout(() => {
                                            if (fabPressStartRef.current) setShowFabMenu(true);
                                        }, 500);
                                    }}
                                    onPointerUp={() => {
                                        fabPressStartRef.current = false;
                                        clearTimeout(fabLongPressRef.current);
                                    }}
                                    onPointerLeave={() => {
                                        fabPressStartRef.current = false;
                                        clearTimeout(fabLongPressRef.current);
                                    }}
                                    aria-label="Add transaction"
                                    className="relative w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center border border-violet-500/30"
                                >
                                    <motion.div
                                        animate={{ rotate: showFabMenu ? 45 : 0 }}
                                        transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                                    >
                                        <Plus size={28} strokeWidth={2.5} />
                                    </motion.div>
                                </motion.button>
                            </div>
                        </div>
                        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                )}

                {/* Global Modals */}
                {modals}
            </div>
        </main>
    );
}
