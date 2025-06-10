import { useState } from 'react';
import { Building2, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoInfo, setShowDemoInfo] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would validate and authenticate here
    navigate('/dashboard');
  };

  return (
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
          <h1 className="text-2xl font-bold text-center mb-1">ScaffAI にログイン</h1>
          <p className="text-sm text-slate-400 text-center">足場設計プラットフォームにアクセス</p>
        </div>
        
        {/* Demo Account Info */}
        {showDemoInfo && (
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600/50 text-sm text-slate-300">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">デモアカウント:</span>
              <button 
                onClick={() => setShowDemoInfo(false)}
                className="text-slate-400 hover:text-slate-300 text-xs"
              >
                閉じる
              </button>
            </div>
            <div className="space-y-1 text-slate-400">
              <p>Email: demo@scaffai.com</p>
              <p>Password: demo123</p>
            </div>
          </div>
        )}
        
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
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-600 bg-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              パスワード
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
          
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 mt-6 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            ログイン <ArrowRight size={16} />
          </button>
        </form>
        
        <div className="mt-6 flex flex-col items-center space-y-4 text-sm">
          <Link
            to="/"
            className="text-slate-400 hover:text-slate-300 flex items-center gap-1"
          >
            <ChevronLeft size={16} /> ホームに戻る
          </Link>
          
          <div className="text-slate-400">
            アカウントをお持ちでない場合は、
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              新規登録
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}