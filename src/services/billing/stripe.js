import { supabase } from '../../supabase';
import { Browser } from '@capacitor/browser';
import { isNative } from '../../utils/platform';

export const StripeBilling = {
  subscribe: async (priceId, userId, email) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId, userId, email, platform: isNative() ? 'mobile' : 'web' }
      });
      if (error) throw error;
      const url = data?.url;
      if (url) {
        if (isNative()) {
          await Browser.open({ url });
        } else {
          window.open(url, '_blank');
        }
      }
    } catch (error) {
      console.error('Error starting subscription:', error);
      throw error;
    }
  },
  getPortalUrl: async (_userId) => {
    const url = 'https://billing.stripe.com/p/login/3cI8wPgtNcy21Z03Rh1gs00';
    try {
      if (isNative()) {
        await Browser.open({ url });
      } else {
        window.open(url, '_blank');
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
