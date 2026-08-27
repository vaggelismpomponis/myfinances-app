import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bomponis.spendwise',
  appName: 'SpendWise',
  webDir: 'dist',
  plugins: {
    SocialLogin: {
      providers: {
        google: true,
      },
    },
  }
};

export default config;
