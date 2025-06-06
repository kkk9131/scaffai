export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ScaffoldCalculation {
  id: string;
  project_id: string;
  name: string;
  parameters: ScaffoldParameters;
  results: ScaffoldResults;
  created_at: string;
  updated_at: string;
}

export interface ScaffoldParameters {
  width: number;
  height: number;
  length: number;
  load_capacity: number;
  material_type: MaterialType;
  safety_factor: number;
}

export interface ScaffoldResults {
  total_material_count: number;
  estimated_cost: number;
  safety_rating: SafetyRating;
  weight: number;
  assembly_time: number;
}

export enum MaterialType {
  STEEL = 'steel',
  ALUMINUM = 'aluminum',
  WOOD = 'wood',
}

export enum SafetyRating {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  ACCEPTABLE = 'acceptable',
  POOR = 'poor',
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Re-export from other modules
export type { Database } from './database';
import type { Database } from './database';

// Helper type for getting table types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];