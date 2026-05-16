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
  const [isPro, setIsPro] = useState(() => {
    if (user) {
      const cached = localStorage.getItem(`isPro_${user.id}`);
      return cached === 'true';
    }
    return false;
  });
  const [subscriptionStatus, setSubscriptionStatus] = useState(() => {
    if (user) {
      return localStorage.getItem(`subStatus_${user.id}`) || 'free';
    }
    return 'free';
  });
  const [subscriptionExpiry, setSubscriptionExpiry] = useState(() => {
    if (user) {
      return localStorage.getItem(`subExpiry_${user.id}`);
    }
    return null;
  });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeatureKey, setUpgradeFeatureKey] = useState(null);

  const checkProStatus = (status, expiry) => {
    if (status === 'pro') {
      if (!expiry) return true;
      return new Date(expiry) > new Date();
    }
    return false;
  };

  const updateSubscriptionState = (status, expiry) => {
    const pro = checkProStatus(status, expiry);
    setSubscriptionStatus(status);
    setSubscriptionExpiry(expiry);
    setIsPro(pro);

    if (user) {
      localStorage.setItem(`isPro_${user.id}`, pro.toString());
      localStorage.setItem(`subStatus_${user.id}`, status || 'free');
      if (expiry) localStorage.setItem(`subExpiry_${user.id}`, expiry);
      else localStorage.removeItem(`subExpiry_${user.id}`);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_expiry')
      .eq('id', user.id)
      .single();
    
    if (data) {
      updateSubscriptionState(data.subscription_status, data.subscription_expiry);
    }
  };

  useEffect(() => {
    if (!user) {
      setIsPro(false);
      setSubscriptionStatus('free');
      setSubscriptionExpiry(null);
      return;
    }

    fetchProfile();

    const channel = supabase
      .channel(`profile_updates_${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
      }, (payload) => {
        const { subscription_status, subscription_expiry } = payload.new;
        updateSubscriptionState(subscription_status, subscription_expiry);
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
      upgradeFeatureKey,
      refreshSubscription: fetchProfile
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
