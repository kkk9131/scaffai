'use client';

import React from 'react';
import { useCalculatorStore, ScaffoldInputData } from '../../lib/stores/calculatorStore';
import { Building2, ArrowRight, Ruler, Settings, Wrench } from 'lucide-react';

export default function CalculatorForm() {
  const { inputData, updateInput, calculate, isCalculating, error } = useCalculatorStore();

  const handleInputChange = (field: keyof ScaffoldInputData, value: any) => {
    updateInput({ [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await calculate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 建物の幅 */}
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
                value={inputData.width_NS}
                onChange={(e) => handleInputChange('width_NS', parseInt(e.target.value) || 0)}
                placeholder="例: 10000"
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
                value={inputData.width_EW}
                onChange={(e) => handleInputChange('width_EW', parseInt(e.target.value) || 0)}
                placeholder="例: 9000"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
            </div>
          </div>
        </div>
      </section>

      {/* 軒の出 */}
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
                value={inputData.eaves_N}
                onChange={(e) => handleInputChange('eaves_N', parseInt(e.target.value) || 0)}
                placeholder="例: 500"
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
                value={inputData.eaves_E}
                onChange={(e) => handleInputChange('eaves_E', parseInt(e.target.value) || 0)}
                placeholder="例: 500"
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
                value={inputData.eaves_S}
                onChange={(e) => handleInputChange('eaves_S', parseInt(e.target.value) || 0)}
                placeholder="例: 500"
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
                value={inputData.eaves_W}
                onChange={(e) => handleInputChange('eaves_W', parseInt(e.target.value) || 0)}
                placeholder="例: 500"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
            </div>
          </div>
        </div>
      </section>

      {/* 基本設定 */}
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
                  value={inputData.standard_height}
                  onChange={(e) => handleInputChange('standard_height', parseInt(e.target.value) || 0)}
                  placeholder="例: 2400"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">軒先すわり</label>
              <div className="relative">
                <input
                  type="number"
                  value={inputData.railing_count}
                  onChange={(e) => handleInputChange('railing_count', parseInt(e.target.value) || 0)}
                  placeholder="例: 0"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">個</span>
              </div>
            </div>
          </div>

          {/* 屋根形状 */}
          <div>
            <label className="block text-sm font-medium mb-2">屋根形状</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <input
                  type="radio"
                  name="roof_shape"
                  value="フラット"
                  checked={inputData.roof_shape === 'フラット'}
                  onChange={(e) => handleInputChange('roof_shape', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>フラット</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                  フラットな屋根構造
                </span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <input
                  type="radio"
                  name="roof_shape"
                  value="勾配軒"
                  checked={inputData.roof_shape === '勾配軒'}
                  onChange={(e) => handleInputChange('roof_shape', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>勾配軒</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                  勾配のある屋根構造
                </span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <input
                  type="radio"
                  name="roof_shape"
                  value="陸屋根"
                  checked={inputData.roof_shape === '陸屋根'}
                  onChange={(e) => handleInputChange('roof_shape', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>陸屋根</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                  陸屋根構造
                </span>
              </label>
            </div>
          </div>

          {/* 根がらみ支柱 */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={inputData.tie_column}
                onChange={(e) => handleInputChange('tie_column', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600"
              />
              <span>根がらみ支柱を使用</span>
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-6">
              精度向上のための根がらみ支柱の使用
            </p>
          </div>
        </div>
      </section>

      {/* 計算ボタン */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isCalculating}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCalculating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>計算中...</span>
            </>
          ) : (
            <span>計算実行</span>
          )}
        </button>
      </div>
    </form>
  );
}