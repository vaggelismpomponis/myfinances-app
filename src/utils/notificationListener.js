import { registerPlugin, Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import logger from './logger';

const TransactionReader = registerPlugin('TransactionReader');

export const setupNotificationListener = (onTransactionsFound) => {
    if (!Capacitor.isNativePlatform()) return () => {};

    const checkTransactions = async () => {
        try {
            const result = await TransactionReader.getPendingTransactions();
            const txs = result?.transactions;

            if (txs && txs.length > 0) {
                logger.info(`Received ${txs.length} pending notification payload(s)`, 'TransactionReader');
                onTransactionsFound(txs);
            }
        } catch (e) {
            logger.warn(`TransactionReader getPendingTransactions error: ${e?.message || e}`, 'TransactionReader');
        }
    };

    // Check on startup
    checkTransactions();

    // Check on app resume
    const appListener = App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
            checkTransactions();
        }
    });

    // Poll every 5 seconds while active
    const intervalId = setInterval(checkTransactions, 5000);

    return () => {
        appListener.then(handle => handle?.remove?.()).catch(() => {});
        clearInterval(intervalId);
    };
};

export const openNotificationSettings = async () => {
    try {
        await TransactionReader.openNotificationSettings();
    } catch (e) {
        logger.warn(`Failed to open notification settings: ${e?.message || e}`, 'TransactionReader');
    }
};

export const checkNotificationPermission = async () => {
    if (!Capacitor.isNativePlatform()) return false;
    try {
        const result = await TransactionReader.checkPermission();
        return !!result?.granted;
    } catch (e) {
        logger.warn(`Failed to check notification permission: ${e?.message || e}`, 'TransactionReader');
        return false;
    }
};
