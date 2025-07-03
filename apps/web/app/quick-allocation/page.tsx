'use client';

import { useState } from 'react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Sidebar from '../../components/layout/Sidebar';
import { QuickAllocationInput, QuickAllocationResult, calculateQuickAllocation } from '../../lib/calculator/quickAllocationCalculator';

export default function QuickAllocationPage() {
  const [input, setInput] = useState<QuickAllocationInput>({
    currentDistance: 0,
    allocationDistance: 0,
    eaveOutput: 0,
    boundaryLine: 0,
    cornerType: 'inside',
    specialMaterials: {
      material355: false,
      material300: false,
      material150: false,
    },
  });

  const [result, setResult] = useState<QuickAllocationResult | null>(null);

  const handleCalculate = () => {
    // モバイル版と同じ入力値検証とフォーマット処理
    const currentDistanceNum = Number(input.currentDistance) || 0;
    const allocationDistanceNum = Number(input.allocationDistance) || 0;
    const eaveOutputNum = Number(input.eaveOutput) || 0;
    const boundaryLineNum = Number(input.boundaryLine) || 0;
    const targetDistanceNum = input.targetDistance ? Number(input.targetDistance) : undefined;
    
    // 入力値検証
    if (allocationDistanceNum <= 0) {
      setResult({
        success: false,
        resultDistance: null,
        spanConfiguration: null,
        spanComposition: null,
        needsCorrection: false,
        correctionParts: null,
        correctionAmount: null,
        errorMessage: '割付距離は0より大きい値を入力してください'
      });
      return;
    }
    
    // モバイル版と同じ形式で入力データを構築
    const calculationInput: QuickAllocationInput = {
      currentDistance: currentDistanceNum,
      allocationDistance: allocationDistanceNum,
      eaveOutput: eaveOutputNum,
      boundaryLine: boundaryLineNum || 0, // モバイル版と同じ処理
      cornerType: input.cornerType,
      specialMaterials: input.specialMaterials,
      ...(targetDistanceNum && { targetDistance: targetDistanceNum }), // モバイル版と同じ条件付き追加
    };
    
    const calculationResult = calculateQuickAllocation(calculationInput);
    setResult(calculationResult);
  };

  const handleInputChange = (field: keyof QuickAllocationInput, value: any) => {
    // 数値フィールドの場合は空文字やNaNを適切に処理
    if (['currentDistance', 'allocationDistance', 'eaveOutput', 'boundaryLine', 'targetDistance'].includes(field)) {
      // 空文字の場合は0、NaNの場合は前の値を維持
      const numValue = value === '' ? 0 : (isNaN(Number(value)) ? (input as any)[field] : Number(value));
      setInput(prev => ({
        ...prev,
        [field]: numValue
      }));
    } else {
      setInput(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSpecialMaterialChange = (material: keyof QuickAllocationInput['specialMaterials'], checked: boolean) => {
    setInput(prev => ({
      ...prev,
      specialMaterials: {
        ...prev.specialMaterials,
        [material]: checked
      }
    }));
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <main className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              <div className="max-w-3xl mx-auto p-6 md:p-8 space-y-6">
                <header className="mb-8">
                  <h1 className="text-2xl font-bold">簡易割付計算</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    現在の離れから割付先の離れを計算
                  </p>
                </header>

                {/* Input Form */}
                <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
                  <h2 className="text-lg font-semibold mb-4">計算条件入力</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 基本入力 */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">現在の離れ (mm)</label>
                        <input
                          type="number"
                          value={input.currentDistance}
                          onChange={(e) => handleInputChange('currentDistance', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">割付距離 (mm)</label>
                        <input
                          type="number"
                          value={input.allocationDistance}
                          onChange={(e) => handleInputChange('allocationDistance', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">軒の出 (mm)</label>
                        <input
                          type="number"
                          value={input.eaveOutput}
                          onChange={(e) => handleInputChange('eaveOutput', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">境界線 (mm)</label>
                        <input
                          type="number"
                          value={input.boundaryLine}
                          onChange={(e) => handleInputChange('boundaryLine', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700"
                        />
                      </div>
                    </div>

                    {/* 詳細設定 */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">角部タイプ</label>
                        <select
                          value={input.cornerType}
                          onChange={(e) => handleInputChange('cornerType', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700"
                        >
                          <option value="inside">入隅</option>
                          <option value="outside">出隅</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">目標離れ (mm) ※オプション</label>
                        <input
                          type="number"
                          value={input.targetDistance || ''}
                          onChange={(e) => handleInputChange('targetDistance', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700"
                          placeholder="未指定の場合は最小離れ"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">特殊部材使用</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={input.specialMaterials.material355}
                              onChange={(e) => handleSpecialMaterialChange('material355', e.target.checked)}
                              className="mr-2 rounded"
                            />
                            355mm部材
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={input.specialMaterials.material300}
                              onChange={(e) => handleSpecialMaterialChange('material300', e.target.checked)}
                              className="mr-2 rounded"
                            />
                            300mm部材
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={input.specialMaterials.material150}
                              onChange={(e) => handleSpecialMaterialChange('material150', e.target.checked)}
                              className="mr-2 rounded"
                            />
                            150mm部材
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCalculate}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    計算実行
                  </button>
                </section>

                {/* Results Section */}
                {result && (
                  <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl border border-slate-700/50 p-6">
                    <h2 className="text-lg font-semibold mb-6">計算結果</h2>
                    
                    {result.success ? (
                      <>
                        {/* 基本結果 */}
                        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                          <h3 className="text-sm font-medium text-slate-300 mb-4">割付結果</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm text-slate-400">割付先の離れ</div>
                              <div className="text-2xl font-semibold text-blue-400">{result.resultDistance} mm</div>
                            </div>
                            <div>
                              <div className="text-sm text-slate-400">足場スパン構成</div>
                              <div className="text-lg font-semibold text-emerald-400">{result.spanComposition}</div>
                            </div>
                            <div>
                              <div className="text-sm text-slate-400">角部タイプ</div>
                              <div className="text-lg font-semibold text-purple-400">{input.cornerType === 'inside' ? '入隅' : '出隅'}</div>
                            </div>
                          </div>
                        </div>

                        {/* スパン構成詳細 */}
                        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                          <h3 className="text-sm font-medium text-slate-300 mb-4">スパン構成詳細</h3>
                          <div className="font-mono text-sm text-blue-300">
                            {result.spanConfiguration?.join(', ')} mm
                          </div>
                        </div>

                        {/* 補正情報 */}
                        {result.needsCorrection && (
                          <div className="bg-orange-800/50 rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-medium text-orange-300 mb-4">補正が必要</h3>
                            <div className="text-sm text-orange-200">
                              {result.correctionMessage}
                            </div>
                          </div>
                        )}

                        {/* 補正部材情報 */}
                        {result.correctionParts && result.correctionParts.length > 0 && (
                          <div className="bg-blue-800/50 rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-medium text-blue-300 mb-4">推奨補正部材</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-slate-400">補正部材</div>
                                <div className="text-lg font-semibold text-blue-400">
                                  {result.correctionParts.join(', ')} mm
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-slate-400">補正量</div>
                                <div className="text-lg font-semibold text-blue-400">{result.correctionAmount} mm</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="bg-red-800/50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-red-300 mb-2">計算エラー</h3>
                        <div className="text-sm text-red-200">
                          {result.errorMessage}
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}