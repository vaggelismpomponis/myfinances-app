import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bomponis.spendwise',
  appName: 'SpendWise',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      // Web Client ID (type 3) from google-services.json
      clientId: '345124628478-9dfooug409in2o115t5fdcolhfl9ojnk.apps.googleusercontent.com',
      serverClientId: '345124628478-9dfooug409in2o115t5fdcolhfl9ojnk.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  }
};

export default config;
