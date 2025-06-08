import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = 'https://sqovgtupsgyalvuycyum.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxb3ZndHVwc2d5YWx2dXljeXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjMwMjQsImV4cCI6MjA2NDUzOTAyNH0.pkadOrtCFA-8L8qoCXuO3Abe-9vBe17us5HoYYdR9og';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});