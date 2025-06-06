import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Tables } from '@scaffai/core';

type Profile = Tables<'profiles'>;

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false,
  });

  useEffect(() => {
    // 初期セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      }));

      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
        initialized: true,
      }));

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, profile: null }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setAuthState(prev => ({ ...prev, profile }));
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { data: null, error };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { data: null, error };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuthState(prev => ({
        ...prev,
        user: null,
        profile: null,
        session: null,
        loading: false,
      }));

      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!authState.user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single();

      if (error) throw error;

      setAuthState(prev => ({ ...prev, profile: data }));
      return { data, error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { data: null, error };
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile: () => authState.user && fetchProfile(authState.user.id),
  };
};