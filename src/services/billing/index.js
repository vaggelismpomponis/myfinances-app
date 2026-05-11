// Platform imports removed as we currently default to Stripe for all platforms.

export const getBillingService = async () => {
  // For now, we use StripeBilling for all platforms (Web and Native)
  // as GooglePlayBilling is not yet implemented.
  const { StripeBilling } = await import('./stripe');
  return StripeBilling;
};

