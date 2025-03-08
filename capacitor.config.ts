
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a64929f4814247e0a1199d467136a084',
  appName: 'life-harmony-cards',
  webDir: 'dist',
  server: {
    url: 'https://a64929f4-8142-47e0-a119-9d467136a084.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
    scheme: 'life-harmony-cards',
    backgroundColor: '#ffffff',
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: true,
    allowsLinkPreview: false,
    handleApplicationNotifications: true,
    webViewSuspensibilityLevel: 'normal'
  },
  android: {
    backgroundColor: '#ffffff'
  }
};

export default config;
