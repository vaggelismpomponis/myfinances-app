import { isNative, isAndroid, isIOS } from '../../utils/platform';

export const getBillingService = async () => {
  if (isNative()) {
    if (isAndroid() || isIOS()) {
      const { GooglePlayBilling } = await import('./googlePlay');
      return GooglePlayBilling;
    }
  }
  const { StripeBilling } = await import('./stripe');
  return StripeBilling;
};
