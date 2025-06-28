'use client';

import { ThemeProvider } from '../../contexts/ThemeContext';
import { RequireAuth } from '../../components/ProtectedRoute';
import { PlatformAccessGuard } from '../../components/PlatformAccessGuard';
import Sidebar from '../../components/layout/Sidebar';
import CalculatorForm from '../../components/Calculator/CalculatorForm';
import DrawingCanvas from '../../components/DrawingCanvas/DrawingCanvas';
import { useCalculatorStore } from '../../lib/stores/calculatorStore';

export default function CalculatorPage() {
  const { result, inputData } = useCalculatorStore();

  return (
    <RequireAuth>
      <PlatformAccessGuard>
        <ThemeProvider>
          <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 overflow-auto">
          <main className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-6">
                <header className="mb-8">
                  <h1 className="text-2xl font-bold">簡易計算</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    足場の寸法を入力して必要な部材を計算
                  </p>
                </header>

                <CalculatorForm />

                {/* Drawing Canvas Section */}
                <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V5zM21 15a2 2 0 00-2-2h-4a2 2 0 00-2 2v2a2 2 0 002 2h4a2 2 0 002-2v-2z" />
                    </svg>
                    <h2 className="text-lg font-semibold">建物平面図プレビュー</h2>
                  </div>
                  <DrawingCanvas inputData={inputData} />
                </section>

                {/* Results Section */}
                {result && (
                  <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl border border-slate-700/50 p-6 mt-8">
                    <h2 className="text-lg font-semibold mb-6">計算結果</h2>
                    
                    {/* Basic Structure */}
                    <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                      <h3 className="text-sm font-medium text-slate-300 mb-4">基本構造</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-slate-400">南北総スパン</div>
                          <div className="text-xl font-semibold text-blue-400">{result.ns_total_span} mm</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">東西総スパン</div>
                          <div className="text-xl font-semibold text-blue-400">{result.ew_total_span} mm</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">段数</div>
                          <div className="text-xl font-semibold text-blue-400">{result.num_stages} 段</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">モジュール数</div>
                          <div className="text-xl font-semibold text-blue-400">{result.modules_count} 個</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Side Spaces */}
                    <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                      <h3 className="text-sm font-medium text-slate-300 mb-4">隙間情報</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-slate-400">北側隙間</div>
                          <div className="text-xl font-semibold text-emerald-400">{result.north_gap}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">南側隙間</div>
                          <div className="text-xl font-semibold text-emerald-400">{result.south_gap}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">東側隙間</div>
                          <div className="text-xl font-semibold text-emerald-400">{result.east_gap}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">西側隙間</div>
                          <div className="text-xl font-semibold text-emerald-400">{result.west_gap}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Height Info and Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-slate-300 mb-4">高さ情報</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-slate-400">ジャッキアップ高さ</div>
                            <div className="text-lg font-semibold text-purple-400">{result.jack_up_height} mm</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-slate-400">第1層高さ</div>
                            <div className="text-lg font-semibold text-purple-400">{result.first_layer_height} mm</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-slate-300 mb-4">ステータス</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-slate-400">タイ可能</div>
                            <div className={`flex items-center ${result.tie_ok ? 'text-emerald-400' : 'text-red-400'}`}>
                              <span className="text-lg font-semibold">{result.tie_ok ? 'OK' : 'NG'}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-slate-400">タイ支柱使用</div>
                            <div className={`flex items-center ${result.tie_column_used ? 'text-emerald-400' : 'text-red-400'}`}>
                              <span className="text-lg font-semibold">{result.tie_column_used ? '使用' : '未使用'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Structure Details */}
                    <div className="bg-slate-800/50 rounded-lg p-4 mt-6">
                      <h3 className="text-sm font-medium text-slate-300 mb-4">構造詳細</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-sm text-slate-400 mb-2">南北方向構造</div>
                          <div className="font-mono text-sm text-blue-300">{result.ns_span_structure}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400 mb-2">東西方向構造</div>
                          <div className="font-mono text-sm text-blue-300">{result.ew_span_structure}</div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
      </PlatformAccessGuard>
    </RequireAuth>
  );
}