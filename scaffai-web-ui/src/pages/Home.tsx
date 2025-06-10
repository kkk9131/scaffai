import { Link } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Background gradients */}
      <div className="fixed inset-0 bg-slate-900 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 opacity-80"></div>
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-orange-500/10 to-transparent rounded-full blur-3xl"></div>
      </div>
      
      <header className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold text-white">ScaffAI</span>
        </div>
        
        <nav>
          <Link 
            to="/login" 
            className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            ログイン
          </Link>
        </nav>
      </header>
      
      <main className="relative z-10 container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">
            最先端AI技術で<span className="text-blue-400">足場設計</span>を効率化
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            ScaffAIは建設現場の足場設計を革新する次世代プラットフォーム。設計から見積もりまで、すべての工程をサポートします。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login" 
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center justify-center gap-2 transition-colors"
            >
              今すぐ始める <ArrowRight size={18} />
            </Link>
            <Link 
              to="/register" 
              className="px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-white font-medium transition-colors"
            >
              無料アカウント作成
            </Link>
          </div>
        </div>
        
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">主な機能</h2>
            <p className="text-slate-400">設計から見積りまで、一貫してサポート</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="rounded-full bg-blue-900/30 w-12 h-12 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI自動設計</h3>
              <p className="text-slate-400">
                AIが建物の特性を分析し、最適な足場設計を提案。手作業の設計時間を大幅に削減します。
              </p>
            </div>
            
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="rounded-full bg-green-900/30 w-12 h-12 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">リアルタイム計算</h3>
              <p className="text-slate-400">
                必要な材料数と工数をリアルタイムで計算。予算管理と資材手配の効率化に貢献します。
              </p>
            </div>
            
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="rounded-full bg-orange-900/30 w-12 h-12 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">見積書自動作成</h3>
              <p className="text-slate-400">
                設計データから自動的に見積書を生成。価格設定も柔軟にカスタマイズ可能です。
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="relative z-10 container mx-auto px-4 py-8 text-center text-slate-500 border-t border-slate-800">
        <p>© 2025 ScaffAI. All rights reserved.</p>
      </footer>
    </div>
  );
}