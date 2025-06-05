// 足場計算エンジンのメインエクスポート

export * from './types';
export * from './engine';
export * from './utils';
export * from './margins';
export * from './span-boundaries';
export * from './face-dimensions';

// メイン関数の再エクスポート
export { calculateAll as scaffoldCalculate, calcAll } from './engine';