'use client';

import React from 'react';
import type { ScaffoldLineData } from '../types/drawing';

interface ScaffoldEdgeInfoProps {
  scaffoldLineData: ScaffoldLineData | null;
  visible: boolean;
  onToggle: () => void;
  baseScale?: number;
}

// 辺番号から方角を判定
const getDirectionFromEdgeIndex = (edgeIndex: number): string => {
  // L字型建物の場合の辺と方角の対応
  switch (edgeIndex) {
    case 0: return '北面';
    case 1: return '東面';
    case 2: return '北面';
    case 3: return '東面';
    case 4: return '南面';
    case 5: return '西面';
    default: return `辺${edgeIndex}`;
  }
};

// 辺番号から詳細説明を取得
const getEdgeDescription = (edgeIndex: number): string => {
  switch (edgeIndex) {
    case 0: return '1→2';
    case 1: return '2→3';
    case 2: return '3→4';
    case 3: return '4→5';
    case 4: return '5→6';
    case 5: return '6→1';
    default: return '';
  }
};

export default function ScaffoldEdgeInfo({ scaffoldLineData, visible, onToggle, baseScale = 0.3 }: ScaffoldEdgeInfoProps) {
  if (!scaffoldLineData || !scaffoldLineData.edges || scaffoldLineData.edges.length === 0) {
    return null;
  }
  
  // 対面の合計を計算（詳細版）
  const calculateFaceTotal = (edgeIndices: number[]) => {
    const details: {[key: number]: number[]} = {};
    const total = edgeIndices.reduce((sum, index) => {
      const edge = scaffoldLineData.edges.find(e => e.edgeIndex === index);
      if (edge) {
        details[index] = edge.spanConfiguration;
        return sum + edge.spanConfiguration.reduce((s, span) => s + span, 0);
      }
      return sum;
    }, 0);
    return { total, details };
  };
  
  const northData = calculateFaceTotal([0, 2]); // 北面: 辺0 + 辺2
  const southData = calculateFaceTotal([4]); // 南面: 辺4
  const eastData = calculateFaceTotal([1, 3]); // 東面: 辺1 + 辺3
  const westData = calculateFaceTotal([5]); // 西面: 辺5
  
  const northTotal = northData.total;
  const southTotal = southData.total;
  const eastTotal = eastData.total;
  const westTotal = westData.total;

  return (
    <div className="absolute top-24 left-4 z-10 bg-white/95 rounded-lg shadow-lg border border-gray-200 max-w-xs">
      {/* ヘッダー */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">足場辺情報</h3>
        <button
          onClick={onToggle}
          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          {visible ? '非表示' : '表示'}
        </button>
      </div>
      
      {/* 情報表示 */}
      {visible && (
        <div className="p-3">
          <div className="space-y-2">
            {scaffoldLineData.edges.map((edge, index) => {
              // 足場辺の長さを計算（ピクセル単位）
              const length = Math.sqrt(
                Math.pow(edge.endVertex.x - edge.startVertex.x, 2) + 
                Math.pow(edge.endVertex.y - edge.startVertex.y, 2)
              );
              
              // 実寸に変換
              const realLength = Math.round(length / baseScale);
              
              // スパン構成の合計
              const spanTotal = edge.spanConfiguration.reduce((sum, span) => sum + span, 0);
              
              return (
                <div key={index} className="text-xs space-y-1 p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-700">
                    辺{edge.edgeIndex} ({getEdgeDescription(edge.edgeIndex)}) - {getDirectionFromEdgeIndex(edge.edgeIndex)}
                  </div>
                  <div className="text-gray-600">
                    スパン: [{edge.spanConfiguration.join(', ')}]
                  </div>
                  <div className="text-gray-600">
                    スパン合計: {spanTotal}mm ({(spanTotal / 1000).toFixed(1)}m)
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* 対面の合計チェック */}
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            <div className="text-xs font-semibold text-gray-700">対面の合計チェック:</div>
            
            {/* 北面 vs 南面 */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-600">北面 vs 南面:</div>
              <div className="text-xs space-y-1 pl-2">
                <div>北面合計: {northTotal}mm</div>
                {Object.entries(northData.details).map(([edgeIndex, spans]) => (
                  <div key={edgeIndex} className="pl-2 text-gray-500">
                    辺{edgeIndex}: [{spans.join(', ')}] = {spans.reduce((s, v) => s + v, 0)}mm
                  </div>
                ))}
                <div className="mt-1">南面合計: {southTotal}mm</div>
                {Object.entries(southData.details).map(([edgeIndex, spans]) => (
                  <div key={edgeIndex} className="pl-2 text-gray-500">
                    辺{edgeIndex}: [{spans.join(', ')}] = {spans.reduce((s, v) => s + v, 0)}mm
                  </div>
                ))}
                {Math.abs(northTotal - southTotal) > 10 && (
                  <div className="text-red-600 font-semibold">
                    ⚠️ 差: {Math.abs(northTotal - southTotal)}mm
                  </div>
                )}
              </div>
            </div>
            {/* 東面 vs 西面 */}
            <div className="space-y-1 mt-3">
              <div className="text-xs font-semibold text-gray-600">東面 vs 西面:</div>
              <div className="text-xs space-y-1 pl-2">
                <div>東面合計: {eastTotal}mm</div>
                {Object.entries(eastData.details).map(([edgeIndex, spans]) => (
                  <div key={edgeIndex} className="pl-2 text-gray-500">
                    辺{edgeIndex}: [{spans.join(', ')}] = {spans.reduce((s, v) => s + v, 0)}mm
                  </div>
                ))}
                <div className="mt-1">西面合計: {westTotal}mm</div>
                {Object.entries(westData.details).map(([edgeIndex, spans]) => (
                  <div key={edgeIndex} className="pl-2 text-gray-500">
                    辺{edgeIndex}: [{spans.join(', ')}] = {spans.reduce((s, v) => s + v, 0)}mm
                  </div>
                ))}
                {Math.abs(eastTotal - westTotal) > 10 && (
                  <div className="text-red-600 font-semibold">
                    ⚠️ 差: {Math.abs(eastTotal - westTotal)}mm
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 凡例 */}
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
            <div className="font-semibold mb-1">建物形状:</div>
            <pre className="text-xs leading-tight">
  1---2
  |   |
  |   3--4
  |      |
  6------5
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}