import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { getBillingService } from '../services/billing';
import { supabase } from '../supabase';

const UpgradeModal = () => {
    const { t } = useSettings();
    const { isUpgradeModalOpen, closeUpgradeModal, upgradeFeatureKey } = useSubscription();
    const [loadingPlan, setLoadingPlan] = useState(null);

    if (!isUpgradeModalOpen) return null;

    const features = [
        t('upgrade_modal_title_budgets', 'Unlimited Budgets'),
        t('upgrade_modal_title_goals', 'Unlimited Goals'),
        t('upgrade_modal_title_stats', 'Full Analytics & History'),
        t('upgrade_modal_title_categories', 'Custom Categories'),
        t('upgrade_modal_title_scanner', 'Bulk Receipt Scanner'),
        t('upgrade_modal_title_biometrics', 'Biometric App Lock'),
    ];

    const getTitle = () => {
        switch (upgradeFeatureKey) {
            case 'budgets': return t('upgrade_modal_title_budgets', 'Unlock Unlimited Budgets');
            case 'goals': return t('upgrade_modal_title_goals', 'Unlock Unlimited Goals');
            case 'biometrics': return t('upgrade_modal_title_biometrics', 'Unlock Biometric Lock');
            case 'stats': return t('upgrade_modal_title_stats', 'Unlock Full Analytics');
            case 'categories': return t('upgrade_modal_title_categories', 'Unlock Custom Categories');
            case 'scanner': return t('upgrade_modal_title_scanner', 'Unlock Bulk Scanner');
            default: return 'SpendWise Pro';
        }
    };

    const handleSubscribe = async (plan) => {
        setLoadingPlan(plan);
        try {
            const { data } = await supabase.auth.getUser();
            const user = data?.user;
            if (!user) return;

            const priceId = plan === 'monthly' ? import.meta.env.VITE_STRIPE_PRICE_MONTHLY : import.meta.env.VITE_STRIPE_PRICE_YEARLY;
            const BillingService = await getBillingService();
            await BillingService.subscribe(priceId, user.id, user.email);
        } catch (error) {
            console.error('Subscription error:', error);
        } finally {
            setLoadingPlan(null);
        }
    };

    const handleRestore = async () => {
        try {
            const BillingService = await getBillingService();
            await BillingService.restorePurchases();
            closeUpgradeModal();
        } catch (e) {
            console.error('Restore error:', e);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center bg-black/60 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-surface-dark w-full sm:max-w-md sm:mx-auto sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header Image/Gradient */}
                <div className="relative h-32 bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center flex-shrink-0">
                    <button 
                        onClick={closeUpgradeModal}
                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="text-center">
                        <div className="text-4xl mb-2">👑</div>
                        <h2 className="text-2xl font-bold text-white tracking-wide">SpendWise <span className="text-amber-300">PRO</span></h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                        {getTitle()}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
                        {t('upgrade_modal_subtitle', 'Get SpendWise Pro and unlock all features.')}
                    </p>

                    <ul className="space-y-3 mb-8">
                        {features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                <div className="bg-violet-100 dark:bg-violet-900/50 p-1 rounded-full text-violet-600 dark:text-violet-400">
                                    <Check size={14} strokeWidth={3} />
                                </div>
                                {feature}
                            </li>
                        ))}
                    </ul>

                    {/* Pricing */}
                    <div className="space-y-3">
                        <button 
                            onClick={() => handleSubscribe('yearly')}
                            disabled={loadingPlan !== null}
                            className="w-full relative group bg-gray-50 dark:bg-white/5 border-2 border-violet-500 hover:border-violet-600 dark:border-violet-500 dark:hover:border-violet-400 rounded-xl p-4 flex flex-col items-center transition-all"
                        >
                            <div className="absolute -top-3 bg-violet-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                                {t('upgrade_yearly_badge', 'Best Value — 2 months free')}
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white text-lg">
                                {t('upgrade_yearly_label', '$29.99 / year')}
                            </span>
                            <span className="text-violet-600 dark:text-violet-400 font-semibold mt-1 text-sm group-hover:underline">
                                {loadingPlan === 'yearly' ? '...' : t('upgrade_cta_yearly', 'Start Yearly')}
                            </span>
                        </button>

                        <button 
                            onClick={() => handleSubscribe('monthly')}
                            disabled={loadingPlan !== null}
                            className="w-full bg-gray-50 dark:bg-white/5 border-2 border-transparent hover:border-gray-200 dark:hover:border-white/10 rounded-xl p-4 flex flex-col items-center transition-all"
                        >
                            <span className="font-bold text-gray-900 dark:text-white">
                                {t('upgrade_monthly_label', '$2.99 / month')}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                {loadingPlan === 'monthly' ? '...' : t('upgrade_cta_monthly', 'Start Monthly')}
                            </span>
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <button 
                            onClick={handleRestore}
                            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
                        >
                            {t('upgrade_restore', 'Restore Purchases')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
