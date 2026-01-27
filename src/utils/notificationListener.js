import { registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';

const TransactionReader = registerPlugin('TransactionReader');

export const setupNotificationListener = (onTransactionsFound) => {
    const checkTransactions = async () => {
        try {
            console.log("[DEBUG] Polling for transactions...");
            const result = await TransactionReader.getPendingTransactions();
            const txs = result.transactions;

            if (txs && txs.length > 0) {
                console.log("[DEBUG] Found pending transactions:", txs);
                onTransactionsFound(txs);
            }
        } catch (e) {
            console.warn('[DEBUG] TransactionReader error', e);
        }
    };

    // Check on startup
    checkTransactions();

    // Check on resume
    const appListener = App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
            checkTransactions();
        }
    });

    // Poll every 5 seconds (in case app is open)
    const intervalId = setInterval(checkTransactions, 5000);

    return () => {
        appListener.then(handle => handle.remove());
        clearInterval(intervalId);
    };
};

export const openNotificationSettings = async () => {
    try {
        await TransactionReader.openNotificationSettings();
    } catch (e) {
        console.warn('Failed to open settings', e);
    }
};
