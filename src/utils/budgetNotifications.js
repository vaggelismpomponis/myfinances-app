import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '../supabase';

export const BudgetNotificationManager = {
    async requestPermissions() {
        try {
            const { display } = await LocalNotifications.requestPermissions();
            return display === 'granted';
        } catch (error) {
            console.error("Error requesting notification permissions:", error);
            return false;
        }
    },

    async checkTransactionAgainstBudgets(userId, transaction, allTransactions) {
        if (!userId || !transaction || transaction.type !== 'expense' || !transaction.category) {
            return;
        }

        try {
            const { data: budgets, error } = await supabase
                .from('budgets')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            const targetBudget = (budgets || []).find(b =>
                b.category.toLowerCase() === transaction.category.toLowerCase()
            );

            if (!targetBudget || !targetBudget.notification_threshold) {
                return;
            }

            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            if (targetBudget.last_notified_month === currentMonthStr) {
                return;
            }

            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const spentSoFar = allTransactions
                .filter(t => {
                    if (t.type !== 'expense') return false;
                    const tDate = new Date(t.date);
                    const isSameMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
                    const isCategoryMatch = t.category?.toLowerCase() === targetBudget.category.toLowerCase();
                    return isSameMonth && isCategoryMatch && t.id !== transaction.id;
                })
                .reduce((sum, t) => sum + t.amount, 0);

            const newTotalSpent = spentSoFar + transaction.amount;
            const percentageSpent = (newTotalSpent / targetBudget.amount) * 100;

            if (percentageSpent >= targetBudget.notification_threshold) {
                await this.sendBudgetAlert(targetBudget.category, percentageSpent.toFixed(0), targetBudget.amount);

                await supabase.from('budgets')
                    .update({ last_notified_month: currentMonthStr })
                    .eq('id', targetBudget.id);
            }

        } catch (error) {
            console.error("Error checking budget thresholds:", error);
        }
    },

    async sendBudgetAlert(category, percentage, totalAmount) {
        try {
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) return;

            await LocalNotifications.schedule({
                notifications: [
                    {
                        title: `Προσοχή: Όριο ${category}`,
                        body: `Έχετε ξεπεράσει το ${percentage}% του προϋπολογισμού σας (${totalAmount}€).`,
                        id: new Date().getTime(),
                        schedule: { at: new Date(Date.now() + 1000) },
                        sound: null,
                        attachments: null,
                        actionTypeId: '',
                        extra: null
                    }
                ]
            });
        } catch (error) {
            console.error("Failed to send local notification:", error);
        }
    }
};
