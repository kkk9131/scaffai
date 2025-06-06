import { clsx, type ClassValue } from 'clsx';
import { SizeVariant, ColorVariant } from './types';

/**
 * クラス名をマージするユーティリティ関数
 * Web版とNative版で異なる実装を持つ
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * サイズバリアントをTailwindクラスに変換
 */
export function getSizeClasses(size: SizeVariant = 'md', type: 'padding' | 'text' | 'spacing' = 'padding'): string {
  const sizeMap = {
    padding: {
      sm: 'px-3 py-1.5',
      md: 'px-4 py-2',
      lg: 'px-6 py-3',
      xl: 'px-8 py-4',
    },
    text: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
    spacing: {
      sm: 'gap-1',
      md: 'gap-2',
      lg: 'gap-4',
      xl: 'gap-6',
    },
  };
  
  return sizeMap[type][size];
}

/**
 * カラーバリアントをTailwindクラスに変換
 */
export function getColorClasses(color: ColorVariant = 'primary', variant: 'solid' | 'outline' | 'ghost' = 'solid'): string {
  const colorMap = {
    solid: {
      primary: 'bg-primary-600 text-white hover:bg-primary-700',
      secondary: 'bg-secondary-600 text-white hover:bg-secondary-700',
      scaffold: 'bg-scaffold-orange text-white hover:bg-orange-600',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
      success: 'bg-green-600 text-white hover:bg-green-700',
    },
    outline: {
      primary: 'border border-primary-600 text-primary-600 hover:bg-primary-50',
      secondary: 'border border-secondary-600 text-secondary-600 hover:bg-secondary-50',
      scaffold: 'border border-scaffold-orange text-scaffold-orange hover:bg-orange-50',
      danger: 'border border-red-600 text-red-600 hover:bg-red-50',
      warning: 'border border-yellow-600 text-yellow-600 hover:bg-yellow-50',
      success: 'border border-green-600 text-green-600 hover:bg-green-50',
    },
    ghost: {
      primary: 'text-primary-600 hover:bg-primary-50',
      secondary: 'text-secondary-600 hover:bg-secondary-50',
      scaffold: 'text-scaffold-orange hover:bg-orange-50',
      danger: 'text-red-600 hover:bg-red-50',
      warning: 'text-yellow-600 hover:bg-yellow-50',
      success: 'text-green-600 hover:bg-green-50',
    },
  };
  
  return colorMap[variant][color];
}

/**
 * プラットフォーム検出
 */
export function getPlatform(): 'web' | 'native' {
  // React Nativeの場合、Platformモジュールが存在する
  try {
    // @ts-ignore
    if (typeof require !== 'undefined' && require('react-native')) {
      return 'native';
    }
  } catch {
    // React Nativeでない場合はエラーが発生
  }
  
  return 'web';
}

/**
 * レスポンシブブレークポイントのユーティリティ
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * 数値のフォーマット（建設業界用）
 */
export function formatNumber(value: number, unit?: string): string {
  const formatted = new Intl.NumberFormat('ja-JP').format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * 寸法のフォーマット（mm単位）
 */
export function formatDimension(value: number): string {
  return formatNumber(value, 'mm');
}

/**
 * デバウンス関数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}