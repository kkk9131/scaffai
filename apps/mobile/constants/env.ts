// 環境変数の管理
export const ENV = {
  REVENUECAT_IOS_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '',
  REVENUECAT_ANDROID_API_KEY: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '',
  REVENUECAT_ENVIRONMENT: process.env.EXPO_PUBLIC_REVENUECAT_ENVIRONMENT || 'development',
  IS_DEVELOPMENT: process.env.EXPO_PUBLIC_REVENUECAT_ENVIRONMENT === 'development'
};

// APIキーの検証
export const isRevenueCatConfigured = () => {
  return ENV.REVENUECAT_IOS_API_KEY && ENV.REVENUECAT_IOS_API_KEY.length > 0;
};