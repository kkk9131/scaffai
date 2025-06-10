'use client';

import React from 'react';
import { useCalculatorStore } from '../../lib/stores/calculatorStore';

export default function CalculationResult() {
  const { result, isCalculating } = useCalculatorStore();

  if (isCalculating) {
    return (
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl border border-slate-700/50 p-6 mt-8">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-lg">計算中...</span>
          </div>
        </div>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 mt-8">
        <div className="text-center py-8">
          <p className="text-lg">計算を実行すると結果が表示されます</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl border border-slate-700/50 p-6 mt-8">
      <h2 className="text-lg font-semibold mb-6">計算結果</h2>
      
      {/* 基本構造 */}
      <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">基本構造</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-slate-400">南北総スパン</div>
            <div className="text-xl font-semibold text-blue-400">
              {result.ns_total_span.toLocaleString()} mm
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400">東西総スパン</div>
            <div className="text-xl font-semibold text-blue-400">
              {result.ew_total_span.toLocaleString()} mm
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400">段数</div>
            <div className="text-xl font-semibold text-blue-400">
              {result.num_stages} 段
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400">コマ数</div>
            <div className="text-xl font-semibold text-blue-400">
              {result.modules_count} 個
            </div>
          </div>
        </div>
      </div>
      
      {/* 隙間情報 */}
      <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">隙間情報</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-slate-400">北側隙間</div>
            <div className="text-xl font-semibold text-emerald-400">
              {result.north_gap}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400">南側隙間</div>
            <div className="text-xl font-semibold text-emerald-400">
              {result.south_gap}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400">東側隙間</div>
            <div className="text-xl font-semibold text-emerald-400">
              {result.east_gap}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400">西側隙間</div>
            <div className="text-xl font-semibold text-emerald-400">
              {result.west_gap}
            </div>
          </div>
        </div>
      </div>
      
      {/* 高さ情報とステータス */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-4">高さ情報</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-400">ジャッキアップ高さ</div>
              <div className="text-lg font-semibold text-purple-400">
                {result.jack_up_height} mm
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-400">第1層高さ</div>
              <div className="text-lg font-semibold text-purple-400">
                {result.first_layer_height.toLocaleString()} mm
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-4">ステータス</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-400">根がらみ可能</div>
              <div className={`flex items-center ${result.tie_ok ? 'text-emerald-400' : 'text-red-400'}`}>
                <span className="text-lg font-semibold">
                  {result.tie_ok ? 'OK' : 'NG'}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-400">根がらみ支柱使用</div>
              <div className={`flex items-center ${result.tie_column_used ? 'text-emerald-400' : 'text-slate-400'}`}>
                <span className="text-lg font-semibold">
                  {result.tie_column_used ? '使用' : '未使用'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 構造詳細 */}
      <div className="bg-slate-800/50 rounded-lg p-4 mt-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">構造詳細</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-slate-400 mb-2">南北方向構造</div>
            <div className="font-mono text-sm text-blue-300 bg-slate-900/50 p-2 rounded">
              {result.ns_span_structure}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-2">東西方向構造</div>
            <div className="font-mono text-sm text-blue-300 bg-slate-900/50 p-2 rounded">
              {result.ew_span_structure}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}