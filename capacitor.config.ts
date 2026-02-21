import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myfinances.app',
  appName: 'MyFinances',
  webDir: 'dist',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["google.com"],
      permissions: {
        google: ["email", "profile"]
      }
    }
  }
};

export default config;
