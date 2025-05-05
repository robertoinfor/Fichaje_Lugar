import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Lugar.Fichaje_Lugar',
  appName: 'Fichaje_Lugar',
  webDir: 'dist',
  "plugins": {
    "SplashScreen": { "launchShowDuration": 0 },
    "App": {
      "androidDarkMode": false
    }
  }
};

export default config;
