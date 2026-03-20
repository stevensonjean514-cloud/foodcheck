import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ca.foodcheck.app',
  appName: 'FoodCheck',
  webDir: 'dist',
  plugins: {
    Camera: {
      permissions: ['camera', 'photos']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#EF4444',
      showSpinner: false
    }
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    backgroundColor: '#EF4444'
  }
};

export default config;
