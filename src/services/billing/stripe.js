import { supabase } from '../../supabase';

export const StripeBilling = {
  subscribe: async (priceId, userId, email) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId, userId, email }
      });
      if (error) throw error;
      const url = data?.url;
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error starting subscription:', error);
      throw error;
    }
  },
  getPortalUrl: async (userId) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { userId }
      });
      if (error) throw error;
      const url = data?.url;
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      throw error;
    }
  },
  restorePurchases: async () => {
    // With Stripe, backend webhooks handle sync. We just rely on the latest DB state.
    return true;
  }
};
