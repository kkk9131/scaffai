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
  SupabaseClient,
} from './types';

export { MaterialType, SafetyRating } from './types';

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