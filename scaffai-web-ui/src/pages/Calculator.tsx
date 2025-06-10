import { useState } from 'react';
import { Ruler, Building2, ArrowRight, Wrench, Settings, RotateCcw, Calculator as CalculatorIcon, FileDown } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { cn } from '../lib/utils';
import { ScrollArea } from '../components/ui/ScrollArea';
import { useNavigate, Link } from 'react-router-dom';

type RoofType = 'flat' | 'sloped' | 'deck';

export default function Calculator() {
  const navigate = useNavigate();
  const [roofType, setRoofType] = useState<RoofType>('flat');
  const [useTieSupports, setUseTieSupports] = useState(false);
  const [boundaryLines, setBoundaryLines] = useState({
    north: false,
    south: false,
    east: false,
    west: false,
  });

  return (
    <div className="flex h-screen text-slate-900 dark:text-slate-100">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-6">
            <header className="mb-8">
              <h1 className="text-2xl font-bold">簡易計算</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                足場の寸法を入力して必要な部材を計算
              </p>
            </header>

            {/* Building Dimensions */}
            <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-lg font-semibold">建物の幅</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">南北方向</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="例: 1000"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">東西方向</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="例: 1000"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Eaves */}
            <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ArrowRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-lg font-semibold">軒の出</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">北側</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="例: 0"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">東側</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="例: 0"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">南側</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="例: 0"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">西側</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="例: 0"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Boundary Lines */}
            <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Ruler className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-lg font-semibold">敷地境界線</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={boundaryLines.north}
                    onChange={(e) => setBoundaryLines({ ...boundaryLines, north: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600"
                  />
                  <span>北側境界線</span>
                  </label>
                  {boundaryLines.north && (
                    <div className="relative ml-6">
                      <input
                        type="number"
                        placeholder="例: 1000"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={boundaryLines.east}
                    onChange={(e) => setBoundaryLines({ ...boundaryLines, east: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600"
                  />
                  <span>東側境界線</span>
                  </label>
                  {boundaryLines.east && (
                    <div className="relative ml-6">
                      <input
                        type="number"
                        placeholder="例: 1000"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={boundaryLines.south}
                    onChange={(e) => setBoundaryLines({ ...boundaryLines, south: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600"
                  />
                  <span>南側境界線</span>
                  </label>
                  {boundaryLines.south && (
                    <div className="relative ml-6">
                      <input
                        type="number"
                        placeholder="例: 1000"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={boundaryLines.west}
                    onChange={(e) => setBoundaryLines({ ...boundaryLines, west: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600"
                  />
                  <span>西側境界線</span>
                  </label>
                  {boundaryLines.west && (
                    <div className="relative ml-6">
                      <input
                        type="number"
                        placeholder="例: 1000"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Basic Settings */}
            <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-lg font-semibold">基本設定</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">基準高さ</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="例: 2400"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ターゲットオフセット</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="例: 900"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">屋根形状</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <input
                        type="radio"
                        name="roofType"
                        value="flat"
                        checked={roofType === 'flat'}
                        onChange={(e) => setRoofType(e.target.value as RoofType)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>平屋根</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                        フラットな屋根構造
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <input
                        type="radio"
                        name="roofType"
                        value="sloped"
                        checked={roofType === 'sloped'}
                        onChange={(e) => setRoofType(e.target.value as RoofType)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>傾斜屋根</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                        向きのある屋根構造
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <input
                        type="radio"
                        name="roofType"
                        value="deck"
                        checked={roofType === 'deck'}
                        onChange={(e) => setRoofType(e.target.value as RoofType)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>屋根デッキ</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                        デッキ構造の屋根
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useTieSupports}
                      onChange={(e) => setUseTieSupports(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600"
                    />
                    <span>タイ支柱を使用</span>
                  </label>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-6">
                    精度向上のためのタイ支柱の使用
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">軒先すわり</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="例: 0"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">個</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Special Materials */}
            <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h2 className="text-lg font-semibold">特殊材料</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* South-North Materials */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">南北方向材料</h3>
                  <div>
                    <label className="block text-sm mb-1">材料355</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="例: 0"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">本</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">材料300</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="例: 0"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">本</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">材料150</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="例: 0"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">本</span>
                    </div>
                  </div>
                </div>

                {/* East-West Materials */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">東西方向材料</h3>
                  <div>
                    <label className="block text-sm mb-1">材料355</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="例: 0"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">本</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">材料300</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="例: 0"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">本</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">材料150</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="例: 0"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">本</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                特殊材料について: 材料355/300/150はそれぞれ異なる長さの足場材料です。必要に応じて本数を指定してください。
              </p>
            </section>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
              <button
                onClick={() => navigate('/output')}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>リセット</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <FileDown className="w-4 h-4" />
                <span>出力</span>
              </button>
            </div>

            {/* Calculation Results */}
            <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl border border-slate-700/50 p-6 mt-8">
              <h2 className="text-lg font-semibold mb-6">計算結果</h2>
              
              {/* Basic Structure */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-slate-300 mb-4">基本構造</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">南北総スパン</div>
                    <div className="text-xl font-semibold text-blue-400">2,700 mm</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">東西総スパン</div>
                    <div className="text-xl font-semibold text-blue-400">2,700 mm</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">段数</div>
                    <div className="text-xl font-semibold text-blue-400">1 段</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">モジュール数</div>
                    <div className="text-xl font-semibold text-blue-400">5 個</div>
                  </div>
                </div>
              </div>
              
              {/* Side Spaces */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-slate-300 mb-4">隙間情報</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">北側隙間</div>
                    <div className="text-xl font-semibold text-emerald-400">850 mm</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">南側隙間</div>
                    <div className="text-xl font-semibold text-emerald-400">850 mm</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">東側隙間</div>
                    <div className="text-xl font-semibold text-emerald-400">850 mm</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">西側隙間</div>
                    <div className="text-xl font-semibold text-emerald-400">850 mm</div>
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
                      <div className="text-lg font-semibold text-purple-400">225 mm</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-400">第1層高さ</div>
                      <div className="text-lg font-semibold text-purple-400">2,600 mm</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-300 mb-4">ステータス</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-400">タイ可能</div>
                      <div className="flex items-center text-emerald-400">
                        <span className="text-lg font-semibold">OK</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-slate-400">タイ支柱使用</div>
                      <div className="flex items-center text-red-400">
                        <span className="text-lg font-semibold">未使用</span>
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
                    <div className="font-mono text-sm text-blue-300">1span, 900</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-2">東西方向構造</div>
                    <div className="font-mono text-sm text-blue-300">1span, 900</div>
                  </div>
                </div>
              </div>
              
              <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors mt-4">
                <span>デバッグ情報を表示</span>
              </button>
            </section>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}