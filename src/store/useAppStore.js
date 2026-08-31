import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { calculateStb, getRemainingDaysInMonth, getDaysInMonth } from '../features/StbEngine';

// Custom IndexedDB storage engine for Zustand using idb-keyval
const idbStorage = {
    getItem: async (name) => {
        return (await get(name)) || null;
    },
    setItem: async (name, value) => {
        await set(name, value);
    },
    removeItem: async (name) => {
        await del(name);
    }
};

export const useAppStore = create(
    persist(
        (set, getStore) => ({
            transactions: [],
            budgets: [],
            goals: [],
            userSettings: {
                income: 0,
                fixedObligations: 0,
                targetSavings: 0,
            },

            // Actions for syncing state from Supabase and optimistic updates
            setTransactions: (updater) => set((state) => ({
                transactions: typeof updater === 'function' ? updater(state.transactions) : updater
            })),
            setBudgets: (updater) => set((state) => ({
                budgets: typeof updater === 'function' ? updater(state.budgets) : updater
            })),
            setGoals: (updater) => set((state) => ({
                goals: typeof updater === 'function' ? updater(state.goals) : updater
            })),
            setUserSettings: (settings) => set((state) => ({
                userSettings: { ...state.userSettings, ...settings }
            })),
            
            // Optimistic UI updates
            addTransaction: (tx) => set((state) => ({
                transactions: [tx, ...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date))
            })),
            removeTransaction: (id) => set((state) => ({
                transactions: state.transactions.filter(tx => tx.id !== id)
            })),
            updateTransaction: (updatedTx) => set((state) => ({
                transactions: state.transactions.map(tx => tx.id === updatedTx.id ? updatedTx : tx)
            })),

            // Derived Safe-to-Burn calculation
            getSafeToBurn: () => {
                const state = getStore();
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                const currentDay = now.getDate();
                
                const pastDailySpends = [];
                let todaySpend = 0;
                
                for (let day = 1; day < currentDay; day++) {
                    const startOfDay = new Date(year, month, day, 0, 0, 0);
                    const endOfDay = new Date(year, month, day, 23, 59, 59, 999);
                    
                    const dailyTotal = state.transactions
                        .filter(tx => tx.type === 'expense')
                        .filter(tx => {
                            const d = new Date(tx.date);
                            return d >= startOfDay && d <= endOfDay;
                        })
                        .reduce((sum, tx) => sum + (tx.amount || 0), 0);
                        
                    pastDailySpends.push(dailyTotal);
                }
                
                const startOfToday = new Date(year, month, currentDay, 0, 0, 0);
                todaySpend = state.transactions
                    .filter(tx => tx.type === 'expense')
                    .filter(tx => new Date(tx.date) >= startOfToday)
                    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
                    
                return calculateStb({
                    income: state.userSettings.income || 0,
                    fixed: state.userSettings.fixedObligations || 0,
                    savings: state.userSettings.targetSavings || 0,
                    pastDailySpends,
                    todaySpend,
                    daysInMonth: getDaysInMonth(now)
                });
            }
        }),
        {
            name: 'spendwise-store', // unique storage key
            storage: createJSONStorage(() => idbStorage),
            // Optionally whitelist what to persist if we don't want everything
        }
    )
);
