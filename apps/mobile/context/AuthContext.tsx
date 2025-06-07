import React, { createContext, useContext } from 'react';
import { useAuth, AuthState } from '../hooks/useAuth';
import { Tables } from '@scaffai/core';

type Profile = Tables<'profiles'>;

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, name?: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: any; error: any } | { error: Error; data?: undefined }>;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // デフォルト値を返してエラーを防ぐ
    return {
      user: null,
      profile: null,
      session: null,
      loading: true,
      initialized: false,
      signUp: async () => ({ data: null, error: null }),
      signIn: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      updateProfile: async () => ({ data: null, error: null }),
      refreshProfile: () => {},
    };
  }
  return context;
};