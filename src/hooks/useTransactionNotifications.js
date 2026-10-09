import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { setupNotificationListener } from '../utils/notificationListener';
import { parseNotificationTransaction } from '../utils/transactionParser';
import logger from '../utils/logger';

export function useTransactionNotifications({
    isPro,
    setPendingNotificationTransactions,
    setActiveRegretTxId,
    setShowRegretModal,
    showAddModal,
    pendingNotificationTransactions,
    setEditingTransaction,
    setShowAddModal,
    showToast
}) {
    // Notification Listener for Bank & Wallet Transactions
    useEffect(() => {
        const cleanup = setupNotificationListener((rawTransactions) => {
            if (!rawTransactions || rawTransactions.length === 0) return;

            // Strict Pro gating: Only subscribers can use automated notification transaction tracking
            if (!isPro) {
                logger.info('Notification transactions received but feature is gated for Pro users', 'App');
                return;
            }

            // Rigorously filter and parse ONLY authentic transactions
            const validTransactions = rawTransactions
                .map(raw => parseNotificationTransaction(raw))
                .filter(parsed => parsed && parsed.isValidTransaction);

            if (validTransactions.length === 0) {
                logger.debug('No valid transaction notifications found in batch', 'App');
                return;
            }

            logger.info(`Queuing ${validTransactions.length} valid transaction notification(s)`, 'App');
            setPendingNotificationTransactions(prev => [...prev, ...validTransactions]);
        });

        // Listen for Regret Check-in Action
        const notificationListener = Capacitor.isNativePlatform() ? 
            LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
                const action = notificationAction.notification.extra?.action;
                const txId = notificationAction.notification.extra?.transactionId;
                if (action === 'regret_checkin' && txId) {
                    setActiveRegretTxId(txId);
                    setShowRegretModal(true);
                }
            }) : null;

        return () => {
            cleanup();
            if (notificationListener) {
                notificationListener.then(listener => listener.remove());
            }
        };
    }, [isPro, setActiveRegretTxId, setPendingNotificationTransactions, setShowRegretModal]);

    // Sequential Queue Processing for Pending Notification Transactions
    useEffect(() => {
        if (!showAddModal && pendingNotificationTransactions.length > 0) {
            const nextTx = pendingNotificationTransactions[0];
            setPendingNotificationTransactions(prev => prev.slice(1));

            setEditingTransaction({
                amount: nextTx.amount,
                note: nextTx.note,
                type: nextTx.type,
                category: nextTx.category,
                date: nextTx.date || new Date().toISOString()
            });
            setShowAddModal(true);
            showToast(
                `Εντοπίστηκε νέα συναλλαγή από ${nextTx.sourceName}: ${nextTx.amount.toFixed(2)}€!`,
                'info'
            );
        }
    }, [showAddModal, pendingNotificationTransactions, setEditingTransaction, setPendingNotificationTransactions, setShowAddModal, showToast]);
}
