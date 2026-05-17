import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stopamine.app',
  appName: 'Stopamine',
  webDir: 'dist/client',
  server: {
    url: 'https://tanstack-start-app.stopamine.workers.dev',
    cleartext: false,
  },
};

export default config;
