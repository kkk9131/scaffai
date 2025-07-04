import { Platform } from 'react-native';
import { ENV } from './env';

export const REVENUECAT_CONFIG = {
  apiKey: {
    ios: ENV.REVENUECAT_IOS_API_KEY,
    android: ENV.REVENUECAT_ANDROID_API_KEY
  },
  enableSandbox: ENV.IS_DEVELOPMENT,
  enableDebugLogs: ENV.IS_DEVELOPMENT,
  usesStoreKit2IfAvailable: true,
  dangerouslyUseLogHandler: ENV.IS_DEVELOPMENT,
  entitlementVerificationMode: ENV.IS_DEVELOPMENT ? 'disabled' : 'informational'
};

export const getApiKey = () => {
  return Platform.OS === 'ios' 
    ? REVENUECAT_CONFIG.apiKey.ios 
    : REVENUECAT_CONFIG.apiKey.android;
};

export const isConfigured = () => {
  const apiKey = getApiKey();
  return apiKey && apiKey.length > 0;
};