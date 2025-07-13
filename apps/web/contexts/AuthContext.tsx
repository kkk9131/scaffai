'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Profile, SubscriptionPlan, PlatformAccess, PLAN_DETAILS } from '../lib/types'

// 認証状態の型定義
interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  error: string | null
}

// 認証アクションの型定義
interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  clearError: () => void
  // プロフィール管理
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
  // プラットフォームアクセス制御
  canAccessPlatform: (platform: 'web' | 'mobile') => boolean
  hasWebAccess: () => boolean
  getCurrentPlan: () => SubscriptionPlan
}

// 認証コンテキストの型定義
type AuthContextType = AuthState & AuthActions

// 認証コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 認証プロバイダーのProps型
interface AuthProviderProps {
  children: React.ReactNode
}

// 認証プロバイダーコンポーネント
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // セッションの初期化と状態変更の監視
  useEffect(() => {
    let mounted = true

    // 現在のセッションを取得
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (mounted) {
          if (error) {
            console.error('セッション取得エラー:', error)
            setError(error.message)
          } else {
            setSession(session)
            setUser(session?.user ?? null)
          }
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          console.error('予期しないエラー:', err)
          setError('セッションの取得に失敗しました')
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          console.log('認証状態変更:', event, session?.user?.email)
          
          setSession(session)
          setUser(session?.user ?? null)
          
          // セッションがある場合はプロフィールを取得
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }
          
          setLoading(false)

          // エラーをクリア（成功時）
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setError(null)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // プロフィール取得関数
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('プロフィール取得エラー:', error)
        return
      }

      setProfile(data)
    } catch (err) {
      console.error('プロフィール取得の予期しないエラー:', err)
    }
  }

  // プロフィール作成または更新関数
  const createOrUpdateProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          subscription_plan: 'free',
          subscription_status: 'active',
          platform_access: 'mobile_only',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('プロフィール作成エラー:', error)
        return
      }

      setProfile(data)
    } catch (err) {
      console.error('プロフィール作成の予期しないエラー:', err)
    }
  }

  // サインイン関数
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error('サインインエラー:', error)
        setError(getErrorMessage(error))
      }

      return { error }
    } catch (err) {
      console.error('予期しないサインインエラー:', err)
      const errorMessage = 'ログインに失敗しました'
      setError(errorMessage)
      return { error: { message: errorMessage } as AuthError }
    } finally {
      setLoading(false)
    }
  }

  // サインアップ関数
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        console.error('サインアップエラー:', error)
        setError(getErrorMessage(error))
      } else {
        // サインアップ成功時にプロフィールを作成
        // 注意: Supabaseの確認メール送信後にプロフィールが作成される
        console.log('サインアップ成功 - 確認メールをチェックしてください')
      }

      return { error }
    } catch (err) {
      console.error('予期しないサインアップエラー:', err)
      const errorMessage = 'アカウント作成に失敗しました'
      setError(errorMessage)
      return { error: { message: errorMessage } as AuthError }
    } finally {
      setLoading(false)
    }
  }

  // サインアウト関数
  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('サインアウトエラー:', error)
        setError(getErrorMessage(error))
      }

      return { error }
    } catch (err) {
      console.error('予期しないサインアウトエラー:', err)
      const errorMessage = 'ログアウトに失敗しました'
      setError(errorMessage)
      return { error: { message: errorMessage } as AuthError }
    } finally {
      setLoading(false)
    }
  }

  // パスワードリセット関数
  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        console.error('パスワードリセットエラー:', error)
        setError(getErrorMessage(error))
      }

      return { error }
    } catch (err) {
      console.error('予期しないパスワードリセットエラー:', err)
      const errorMessage = 'パスワードリセットに失敗しました'
      setError(errorMessage)
      return { error: { message: errorMessage } as AuthError }
    } finally {
      setLoading(false)
    }
  }

  // エラークリア関数
  const clearError = () => {
    setError(null)
  }

  // プロフィール更新関数
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('ユーザーがログインしていません') }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('プロフィール更新エラー:', error)
        return { error: new Error(error.message) }
      }

      setProfile(data)
      return { error: null }
    } catch (err) {
      console.error('予期しないプロフィール更新エラー:', err)
      return { error: new Error('プロフィールの更新に失敗しました') }
    }
  }

  // プロフィール再取得関数
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  // プラットフォームアクセス制御関数
  const canAccessPlatform = (platform: 'web' | 'mobile'): boolean => {
    // 開発環境での認証バイパス
    if (process.env.NODE_ENV === 'development' && 
        process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true') {
      return true
    }
    
    // 開発期間中は全機能を利用可能にする（既存のロジック）
    return true
    
    // if (!profile) return false
    // 
    // const access = profile.platform_access
    // 
    // if (platform === 'mobile') {
    //   return access === 'mobile_only' || access === 'both'
    // }
    // 
    // if (platform === 'web') {
    //   return access === 'web_only' || access === 'both'
    // }
    // 
    // return false
  }

  // Web版アクセス権限チェック
  const hasWebAccess = (): boolean => {
    return canAccessPlatform('web')
  }

  // 現在のプラン取得
  const getCurrentPlan = (): SubscriptionPlan => {
    return profile?.subscription_plan || 'free'
  }

  // エラーメッセージの日本語化
  const getErrorMessage = (error: AuthError): string => {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'メールアドレスまたはパスワードが間違っています'
      case 'Email not confirmed':
        return 'メールアドレスが確認されていません。確認メールをチェックしてください'
      case 'User already registered':
        return 'このメールアドレスは既に登録されています'
      case 'Password should be at least 6 characters':
        return 'パスワードは6文字以上で設定してください'
      case 'Unable to validate email address: invalid format':
        return 'メールアドレスの形式が正しくありません'
      case 'Signup is disabled':
        return '新規登録は現在無効になっています'
      case 'Email rate limit exceeded':
        return 'メール送信の制限に達しました。しばらく待ってから再試行してください'
      default:
        return error.message || '認証エラーが発生しました'
    }
  }

  // コンテキストの値
  const value: AuthContextType = {
    // 状態
    user,
    session,
    profile,
    loading,
    error,
    // アクション
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError,
    // プロフィール管理
    updateProfile,
    refreshProfile,
    // プラットフォームアクセス制御
    canAccessPlatform,
    hasWebAccess,
    getCurrentPlan,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 認証コンテキストを使用するカスタムフック
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

// ユーザーがログインしているかチェックするフック
export function useRequireAuth() {
  const auth = useAuth()
  
  useEffect(() => {
    // 開発環境での認証バイパス
    if (process.env.NODE_ENV === 'development' && 
        process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true') {
      return
    }
    
    if (!auth.loading && !auth.user) {
      // ログインしていない場合はログインページにリダイレクト
      window.location.href = '/login'
    }
  }, [auth.loading, auth.user])
  
  return auth
}

// 管理者権限チェック用フック（将来的な拡張）
export function useIsAdmin() {
  const { user } = useAuth()
  
  // TODO: ユーザーのロールベースアクセス制御を実装
  return user?.email === 'admin@scaffai.com'
}