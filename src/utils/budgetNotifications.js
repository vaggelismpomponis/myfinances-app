import { LocalNotifications } from '@capacitor/local-notifications';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';

export const BudgetNotificationManager = {
    // Request permissions (call this early in app lifecycle if needed, or before sending)
    async requestPermissions() {
        try {
            const { display } = await LocalNotifications.requestPermissions();
            return display === 'granted';
        } catch (error) {
            console.error("Error requesting notification permissions:", error);
            return false;
        }
    },

    // Check if adding this transaction exceeds any budget thresholds
    async checkTransactionAgainstBudgets(userId, transaction, allTransactions) {
        if (!userId || !transaction || transaction.type !== 'expense' || !transaction.category) {
            return; // Only expenses with categories affect budgets
        }

        try {
            // 1. Fetch user budgets
            const budgetsRef = collection(db, 'artifacts', appId, 'users', userId, 'budgets');
            const budgetsSnapshot = await getDocs(query(budgetsRef));
            const budgets = budgetsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            // 2. Find matching budget
            const targetBudget = budgets.find(b =>
                b.category.toLowerCase() === transaction.category.toLowerCase()
            );

            if (!targetBudget || !targetBudget.notificationThreshold) {
                return; // No budget or no threshold set for this category
            }

            // 3. Calculate spent amount in current month for this category
            const now = new Date();
            const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            // Check if already notified this month to avoid spam
            if (targetBudget.lastNotifiedMonth === currentMonthStr) {
                return;
            }

            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            // Include the new transaction in the calculation if it's new
            // Assuming allTransactions is the list of existing transactions
            const spentSoFar = allTransactions
                .filter(t => {
                    if (t.type !== 'expense') return false;
                    const tDate = new Date(t.date);
                    const isSameMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;

                    const isCategoryMatch = t.category?.toLowerCase() === targetBudget.category.toLowerCase() ||
                        t.note?.toLowerCase().includes(targetBudget.category.toLowerCase());

                    return isSameMonth && isCategoryMatch && t.id !== transaction.id; // exclude the new one if it's already in the list
                })
                .reduce((sum, t) => sum + t.amount, 0);

            const newTotalSpent = spentSoFar + transaction.amount;
            const percentageSpent = (newTotalSpent / targetBudget.amount) * 100;

            // 4. Trigger notification if threshold exceeded
            if (percentageSpent >= targetBudget.notificationThreshold) {
                await this.sendBudgetAlert(targetBudget.category, percentageSpent.toFixed(0), targetBudget.amount);

                // 5. Update budget doc so we don't notify again this month
                const budgetDocRef = doc(db, 'artifacts', appId, 'users', userId, 'budgets', targetBudget.id);
                await updateDoc(budgetDocRef, {
                    lastNotifiedMonth: currentMonthStr
                });
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
                        id: new Date().getTime(), // Unique ID
                        schedule: { at: new Date(Date.now() + 1000) }, // Schedule 1 second from now
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
