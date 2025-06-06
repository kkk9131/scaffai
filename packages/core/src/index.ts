// Supabase Client
export {
  createSupabaseClient,
  getSupabaseClient,
  resetSupabaseClient,
} from './lib/supabase';

// Types
export type {
  User,
  Project,
  ScaffoldCalculation,
  ScaffoldParameters,
  ScaffoldResults,
  AuthState,
  DatabaseError,
  Json,
  Database,
  Tables,
} from './types';

export { MaterialType, SafetyRating } from './types';

// 計算エンジン
export {
  calculateAll,
  calcAll,
} from './calculator/engine';

// 計算関連の型
export type {
  ScaffoldInputData,
  ScaffoldCalculationResult,
} from './calculator/types';

// Utilities
export {
  formatCurrency,
  formatWeight,
  formatTime,
  calculatePercentage,
  clamp,
  generateId,
  isValidEmail,
  debounce,
  throttle,
} from './utils';