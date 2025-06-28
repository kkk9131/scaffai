'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, Building2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  fallbackPath?: string
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  fallbackPath = '/login'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // 認証が必要だがユーザーがログインしていない
        router.push(fallbackPath)
        return
      }
      
      if (!requireAuth && user) {
        // 認証が不要だがユーザーがログインしている（ログインページなど）
        router.push('/dashboard')
        return
      }
      
      // 条件を満たしている場合のみレンダリング許可
      setShouldRender(true)
    }
  }, [user, loading, requireAuth, router, fallbackPath])

  // ローディング中またはリダイレクト中
  if (loading || !shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-blue-900/30 rounded-xl">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex items-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
            <span className="text-slate-300">
              {loading ? '認証状況を確認中...' : 'リダイレクト中...'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// ログインが必要なページ用のコンポーネント
export function RequireAuth({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={true} fallbackPath="/login">
      {children}
    </ProtectedRoute>
  )
}

// ログインしていない場合のみアクセス可能なページ用のコンポーネント  
export function RequireNoAuth({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false} fallbackPath="/dashboard">
      {children}
    </ProtectedRoute>
  )
}