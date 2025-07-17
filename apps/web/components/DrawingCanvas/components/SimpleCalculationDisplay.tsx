'use client';

import React from 'react';
import type { ExtendedScaffoldCalculationResult } from '../../../lib/calculator/types';

interface SimpleCalculationDisplayProps {
  calculationResult: ExtendedScaffoldCalculationResult | null;
  visible: boolean;
  onToggle: () => void;
}

export default function SimpleCalculationDisplay({ 
  calculationResult, 
  visible, 
  onToggle 
}: SimpleCalculationDisplayProps) {
  if (!calculationResult) {
    return null;
  }

  return (
    <div className="absolute top-24 left-4 z-10 bg-white/95 rounded-lg shadow-lg border border-gray-200 max-w-sm">
      {/* ヘッダー */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">簡易計算結果</h3>
        <button
          onClick={onToggle}
          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          {visible ? '非表示' : '表示'}
        </button>
      </div>
      
      {/* 計算結果表示 */}
      {visible && (
        <div className="p-3">
          <div className="space-y-3">
            {/* 基本情報 */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700">建物寸法:</div>
              <div className="text-xs space-y-1 pl-2">
                <div>東西方向: {calculationResult.buildingDimensions?.width_EW || 'N/A'}mm</div>
                <div>南北方向: {calculationResult.buildingDimensions?.width_NS || 'N/A'}mm</div>
              </div>
            </div>

            {/* 軒の出 */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700">軒の出:</div>
              <div className="text-xs space-y-1 pl-2">
                <div>北面: {calculationResult.eaveDistances?.north || 'N/A'}mm</div>
                <div>東面: {calculationResult.eaveDistances?.east || 'N/A'}mm</div>
                <div>南面: {calculationResult.eaveDistances?.south || 'N/A'}mm</div>
                <div>西面: {calculationResult.eaveDistances?.west || 'N/A'}mm</div>
              </div>
            </div>

            {/* 足場総スパン */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700">足場総スパン:</div>
              <div className="text-xs space-y-1 pl-2">
                <div>東西方向: {calculationResult.totalSpans?.eastWest || 'N/A'}mm</div>
                <div>南北方向: {calculationResult.totalSpans?.northSouth || 'N/A'}mm</div>
              </div>
            </div>

            {/* 各面の離れ */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700">各面の離れ:</div>
              <div className="text-xs space-y-1 pl-2">
                <div>北面: {calculationResult.faceDistances?.north || 'N/A'}mm</div>
                <div>東面: {calculationResult.faceDistances?.east || 'N/A'}mm</div>
                <div>南面: {calculationResult.faceDistances?.south || 'N/A'}mm</div>
                <div>西面: {calculationResult.faceDistances?.west || 'N/A'}mm</div>
              </div>
            </div>

            {/* スパン構成 */}
            {calculationResult.spanConfigurations && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700">スパン構成:</div>
                <div className="text-xs space-y-1 pl-2">
                  {Object.entries(calculationResult.spanConfigurations).map(([face, spans]) => (
                    <div key={face}>
                      {face}: [{Array.isArray(spans) ? spans.join(', ') : spans}]
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 入隅情報 */}
            {calculationResult.insideCorners && calculationResult.insideCorners.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-700">入隅頂点情報:</div>
                <div className="text-xs space-y-2 pl-2">
                  {calculationResult.insideCorners.map((corner, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      <div className="font-semibold text-gray-700">
                        頂点{corner.index + 1} ({Math.round(corner.position.x)}, {Math.round(corner.position.y)})
                      </div>
                      <div className="text-gray-600 mt-1">
                        内角: {corner.angle.toFixed(1)}度
                      </div>
                      <div className="text-gray-600">
                        前辺長: {corner.prevEdgeLength}mm
                      </div>
                      <div className="text-gray-600">
                        次辺長: {corner.nextEdgeLength}mm
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 計算方法 */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700">計算方法:</div>
              <div className="text-xs pl-2 text-gray-600">
                {calculationResult.calculationMethod || '簡易計算'}
              </div>
            </div>

            {/* 成功状態 */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700">状態:</div>
              <div className="text-xs pl-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  calculationResult.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {calculationResult.success ? '成功' : '失敗'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}