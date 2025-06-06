// @scaffai/ui メインエクスポート
// プラットフォーム自動検出による適切なコンポーネント提供

import { getPlatform } from './shared/utils';

// プラットフォーム検出
const platform = getPlatform();

// 動的インポートによるプラットフォーム別コンポーネント提供
if (platform === 'native') {
  // React Native環境
  module.exports = require('./native');
} else {
  // Web環境
  module.exports = require('./web');
}

// TypeScript用の型エクスポート
export * from './shared/types';
export * from './shared/utils';