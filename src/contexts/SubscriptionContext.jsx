import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { getBillingService } from '../services/billing';

const SubscriptionContext = createContext(null);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ user, children }) => {
  const [isPro, setIsPro] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('free');
  const [subscriptionExpiry, setSubscriptionExpiry] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeatureKey, setUpgradeFeatureKey] = useState(null);

  const checkProStatus = (status, expiry) => {
    if (status === 'pro') {
      if (!expiry) return true;
      return new Date(expiry) > new Date();
    }
    return false;
  };

  useEffect(() => {
    if (!user) {
      setIsPro(false);
      setSubscriptionStatus('free');
      setSubscriptionExpiry(null);
      return;
    }

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_expiry')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setSubscriptionStatus(data.subscription_status);
        setSubscriptionExpiry(data.subscription_expiry);
        setIsPro(checkProStatus(data.subscription_status, data.subscription_expiry));
      }
    };

    fetchProfile();

    const channel = supabase
      .channel('profile_updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        const { subscription_status, subscription_expiry } = payload.new;
        setSubscriptionStatus(subscription_status);
        setSubscriptionExpiry(subscription_expiry);
        setIsPro(checkProStatus(subscription_status, subscription_expiry));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const openUpgradeModal = (featureKey) => {
    setUpgradeFeatureKey(featureKey);
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeFeatureKey(null);
  };

  const openBillingPortal = async () => {
    try {
      const BillingService = await getBillingService();
      await BillingService.getPortalUrl(user.id);
    } catch (e) {
      console.error('Error opening billing portal', e);
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      isPro,
      subscriptionStatus,
      subscriptionExpiry,
      openUpgradeModal,
      openBillingPortal,
      isUpgradeModalOpen,
      closeUpgradeModal,
      upgradeFeatureKey
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
