'use client'

import { useAuth } from '../contexts/AuthContext'
import { PLAN_DETAILS } from '../lib/types'
import { Crown, Smartphone, Monitor, ArrowRight } from 'lucide-react'

interface PlatformAccessGuardProps {
  children: React.ReactNode
}

export function PlatformAccessGuard({ children }: PlatformAccessGuardProps) {
  const { user, profile, loading, hasWebAccess, getCurrentPlan } = useAuth()

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // ログインしていない場合（RequireAuthで処理される）
  if (!user || !profile) {
    return <>{children}</>
  }

  // 開発環境での認証バイパス
  const bypassAuth = process.env.NODE_ENV === 'development' && 
                    process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true'

  // Web版アクセス権限がない場合（バイパスなし）
  if (!hasWebAccess() && !bypassAuth) {
    const currentPlan = getCurrentPlan()
    const currentPlanDetails = PLAN_DETAILS[currentPlan]

    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* アイコン */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-12 h-12 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Web版をご利用いただくには</h1>
            <p className="text-slate-400 text-lg">
              プランのアップグレードが必要です
            </p>
          </div>

          {/* 現在のプラン表示 */}
          <div className="bg-slate-800/50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Smartphone className="w-6 h-6 text-green-400" />
              <span className="text-xl font-semibold">現在のプラン: {currentPlanDetails.name}</span>
            </div>
            <div className="text-slate-300 space-y-2">
              <p>✅ モバイル版アクセス可能</p>
              <p>❌ Web版アクセス不可</p>
              {currentPlanDetails.maxCalculations && (
                <p>📊 月間計算回数: {currentPlanDetails.maxCalculations}回</p>
              )}
            </div>
          </div>

          {/* アップグレード推奨プラン */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Pro プラン */}
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-6 border border-blue-700/50">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold">Pro プラン</h3>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">推奨</span>
              </div>
              <div className="text-2xl font-bold mb-2">¥12,800<span className="text-sm font-normal">/月</span></div>
              <div className="space-y-2 text-left mb-6">
                <p className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-green-400" />
                  <span>Web版 + モバイル版</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center text-xs">∞</span>
                  <span>無制限計算</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-400 flex items-center justify-center text-xs">✏</span>
                  <span>作図機能</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-orange-400 flex items-center justify-center text-xs">⚡</span>
                  <span>高度な計算</span>
                </p>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                Proにアップグレード <ArrowRight size={16} />
              </button>
            </div>

            {/* Max プラン */}
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-6 border border-purple-700/50">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold">Max プラン</h3>
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">最上位</span>
              </div>
              <div className="text-2xl font-bold mb-2">¥24,800<span className="text-sm font-normal">/月</span></div>
              <div className="space-y-2 text-left mb-6">
                <p className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-green-400" />
                  <span>全プラットフォーム</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-green-400 flex items-center justify-center text-xs">🔗</span>
                  <span>CAD連携</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-400 flex items-center justify-center text-xs">API</span>
                  <span>API利用</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-orange-400 flex items-center justify-center text-xs">👥</span>
                  <span>チーム機能</span>
                </p>
              </div>
              <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                Maxにアップグレード <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* モバイル版への案内 */}
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
            <p className="text-slate-300 mb-3">
              現在のプランでは、モバイル版をご利用いただけます。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Smartphone size={16} />
                モバイル版を使用
              </a>
              <button className="inline-flex items-center justify-center gap-2 px-6 py-2 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg transition-colors">
                お問い合わせ
              </button>
            </div>
          </div>

          {/* ユーザー情報 */}
          <div className="mt-8 text-sm text-slate-500">
            <p>ログイン中: {user.email}</p>
            <p>プラン: {currentPlanDetails.name} ({currentPlanDetails.price > 0 ? `¥${currentPlanDetails.price.toLocaleString()}/月` : '無料'})</p>
          </div>
        </div>
      </div>
    )
  }

  // Web版アクセス権限がある場合は通常通り表示
  return <>{children}</>
}