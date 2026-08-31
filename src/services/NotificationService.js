import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * Request notification permissions (required for iOS/Android 13+)
 */
export const requestNotificationPermissions = async () => {
    if (!Capacitor.isNativePlatform()) return true;
    
    try {
        const { display } = await LocalNotifications.requestPermissions();
        return display === 'granted';
    } catch (e) {
        console.warn('Failed to request notification permissions:', e);
        return false;
    }
};

/**
 * Schedules a regret check-in for a transaction 14 days in the future.
 * Only triggers if the amount is > 2000 cents (€20).
 */
export const scheduleRegretCheckin = async (transaction) => {
    if (!transaction || transaction.type !== 'expense' || transaction.amount <= 2000) {
        return;
    }

    if (Capacitor.isNativePlatform()) {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) return;
    }

    // Schedule for 14 days from now
    const scheduleDate = new Date();
    scheduleDate.setDate(scheduleDate.getDate() + 14);

    try {
        await LocalNotifications.schedule({
            notifications: [
                {
                    title: 'Time for a Check-in! 🕰️',
                    body: `It's been 14 days since you spent €${(transaction.amount / 100).toFixed(2)}. Was it worth it?`,
                    id: Math.floor(Math.random() * 1000000),
                    schedule: { at: scheduleDate },
                    extra: {
                        transactionId: transaction.id,
                        action: 'regret_checkin'
                    },
                }
            ]
        });
        console.log(`Scheduled check-in for transaction ${transaction.id} on ${scheduleDate.toISOString()}`);
    } catch (e) {
        console.warn('Failed to schedule local notification:', e);
    }
};
