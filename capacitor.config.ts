import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eraypack.stopamine',
  appName: 'Stopamine',
  webDir: 'dist/client',
  server: {
    url: 'https://stopamineapp.com',
    cleartext: false,
  },
};

export default config;
