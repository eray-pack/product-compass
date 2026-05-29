import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eraypack.stopamine',
  appName: 'Stopamine',
  webDir: 'dist/client',
  server: {
    url: 'https://stopamine.stopamine.workers.dev',
    cleartext: false,
  },
};

export default config;
