import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eraypack.stopamine',
  appName: 'Stopamine',
  webDir: 'dist/client',
  server: {
    url: 'https://stopamineapp.com',
    cleartext: false,
    // Hosts the webview may navigate to WITHOUT being bounced to external
    // Safari. Without these, supabase.auth.signInWithOAuth() opened Safari and
    // the returning session landed in Safari instead of the app — that was the
    // App Review 2.1(a) rejection ("Safari can't open the page…").
    allowNavigation: [
      'iikoxopupfjiavjjvkgm.supabase.co',
      'appleid.apple.com',
    ],
  },
};

export default config;
