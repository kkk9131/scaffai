'use client';

import { useState } from 'react';
import { Building2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginDemoPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@scaffai.com');
  const [password, setPassword] = useState('demo123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ダミー認証（開発用）
    if (email === 'demo@scaffai.com' && password === 'demo123') {
      // ダミーセッションを作成
      const dummyUser = {
        id: 'demo-user-id',
        email: 'demo@scaffai.com',
        name: 'デモユーザー',
        subscription_plan: 'free',
        platform_access: 'mobile_only'
      };
      
      // セッションストレージに保存
      sessionStorage.setItem('demo_user', JSON.stringify(dummyUser));
      
      // ダッシュボードにリダイレクト
      router.push('/dashboard-demo');
    } else {
      alert('デモ用認証情報が正しくありません');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
      <div className="relative z-10 w-full max-w-md p-8 mx-4 rounded-2xl bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 shadow-xl">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-blue-900/30 rounded-xl mb-4">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-1">ScaffAI デモログイン</h1>
          <p className="text-sm text-slate-400 text-center">Supabase接続問題のため、デモ版を使用</p>
        </div>
        
        {/* Demo Info */}
        <div className="mb-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg text-sm text-green-300">
          <p className="font-medium mb-2">🧪 デモ版認証</p>
          <p>Supabase接続の問題を解決中です。</p>
          <p>以下の情報でデモ版をお試しください。</p>
        </div>
        
        {/* Login Form */}
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
              className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
          >
            デモログイン <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            デモ認証情報: demo@scaffai.com / demo123
          </p>
          <p className="text-slate-500 text-xs mt-2">
            ※ Supabase接続問題の解決後、通常認証に移行します
          </p>
        </div>
      </div>
    </div>
  );
}