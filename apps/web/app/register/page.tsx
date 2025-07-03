'use client';

import { useState, useEffect } from 'react';
import { Building2, ArrowRight, Eye, EyeOff, ChevronLeft, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { RequireNoAuth } from '../../components/ProtectedRoute';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, loading, error, clearError, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 既にログインしている場合はダッシュボードにリダイレクト
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // エラーメッセージが変更されたときに自動で非表示にする
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      clearError();
      setTimeout(() => {
        // 一時的なエラー表示のハック
        console.error('パスワードが一致しません');
      }, 100);
      return;
    }

    if (password.length < 6) {
      clearError();
      setTimeout(() => {
        console.error('パスワードは6文字以上で入力してください');
      }, 100);
      return;
    }

    const { error } = await signUp(email, password);
    
    if (!error) {
      setIsSuccess(true);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@scaffai.com');
    setPassword('demo123');
    setConfirmPassword('demo123');
  };

  if (isSuccess) {
    return (
      <RequireNoAuth>
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
          <div className="relative z-10 w-full max-w-md p-8 mx-4 rounded-2xl bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 shadow-xl">
            <div className="flex flex-col items-center mb-6">
              <div className="p-3 bg-green-900/30 rounded-xl mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-center mb-1">アカウント作成完了</h1>
              <p className="text-sm text-slate-400 text-center">
                確認メールをお送りしました
              </p>
            </div>
            
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 mb-6">
              <p className="text-green-300 text-sm mb-3">
                <strong>{email}</strong> に確認メールを送信しました。
              </p>
              <p className="text-slate-300 text-xs">
                メール内のリンクをクリックしてアカウントを有効化してください。
                メールが届かない場合は、迷惑メールフォルダもご確認ください。
              </p>
            </div>

            <div className="flex flex-col items-center space-y-4 text-sm">
              <Link
                href="/login"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                ログインページへ戻る <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </RequireNoAuth>
    );
  }

  return (
    <RequireNoAuth>
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        {/* Background gradients */}
        <div className="fixed inset-0 bg-slate-900 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-80"></div>
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-md p-8 mx-4 rounded-2xl bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 shadow-xl">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-blue-900/30 rounded-xl mb-4">
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-1">ScaffAI アカウント作成</h1>
            <p className="text-sm text-slate-400 text-center">足場設計プラットフォームを始めましょう</p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-700/50 rounded-lg flex items-center gap-3 text-red-300">
              <AlertCircle size={20} className="flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300 text-xs"
              >
                ×
              </button>
            </div>
          )}
          
          {/* Demo Account Info */}
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50 text-sm text-slate-300">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">テスト用アカウント作成:</span>
            </div>
            <button
              onClick={handleDemoFill}
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              demo@scaffai.com でテストアカウント作成
            </button>
          </div>
          
          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                パスワード（6文字以上）
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">
                パスワード確認
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="パスワードを再入力"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-xs mt-1">パスワードが一致しません</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading || !email || !password || !confirmPassword || password !== confirmPassword}
              className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  アカウント作成中...
                </>
              ) : (
                <>
                  アカウント作成 <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 flex flex-col items-center space-y-4 text-sm">
            <Link
              href="/login"
              className="text-slate-400 hover:text-slate-300 flex items-center gap-1"
            >
              <ChevronLeft size={16} /> ログインページに戻る
            </Link>
            
            <div className="text-slate-400">
              すでにアカウントをお持ちの場合は、
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                ログイン
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RequireNoAuth>
  );
}