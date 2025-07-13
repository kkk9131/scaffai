'use client';

import React, { useRef, useEffect } from 'react';
import { MobileScaffoldInputData } from '../../lib/stores/calculatorStore';

interface DrawingCanvasProps {
  inputData: MobileScaffoldInputData;
  width?: number;
  height?: number;
}

export default function DrawingCanvas({ 
  inputData, 
  width = 800, 
  height = 600 
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas設定
    canvas.width = width;
    canvas.height = height;

    // 背景色をクリア
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // 建物寸法を取得（mm単位）
    const buildingWidthNS = inputData.frameWidth.northSouth ?? 1000; // 南北
    const buildingWidthEW = inputData.frameWidth.eastWest ?? 1000;   // 東西

    // スケール計算（Canvas内に収まるように）
    const margin = 100; // 余白
    const maxCanvasWidth = width - margin * 2;
    const maxCanvasHeight = height - margin * 2;

    // 建物のアスペクト比を保持してスケール計算
    const scaleX = maxCanvasWidth / buildingWidthEW;
    const scaleY = maxCanvasHeight / buildingWidthNS;
    const scale = Math.min(scaleX, scaleY, 0.5); // 最大50%のサイズに制限

    // Canvas上での建物寸法
    const canvasBuildingWidth = buildingWidthEW * scale;
    const canvasBuildingHeight = buildingWidthNS * scale;

    // 中央配置の座標計算
    const startX = (width - canvasBuildingWidth) / 2;
    const startY = (height - canvasBuildingHeight) / 2;

    // ライトグリーンで建物矩形を描画
    ctx.strokeStyle = '#90EE90'; // ライトグリーン
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(144, 238, 144, 0.2)'; // 薄いライトグリーン背景

    // 矩形描画（塗りつぶし + 枠線）
    ctx.fillRect(startX, startY, canvasBuildingWidth, canvasBuildingHeight);
    ctx.strokeRect(startX, startY, canvasBuildingWidth, canvasBuildingHeight);

    // 軒の出情報を取得
    const eaveNorth = (inputData.eaveOverhang.north ?? 0) * scale;
    const eaveEast = (inputData.eaveOverhang.east ?? 0) * scale;
    const eaveSouth = (inputData.eaveOverhang.south ?? 0) * scale;
    const eaveWest = (inputData.eaveOverhang.west ?? 0) * scale;

    // 軒の出エリアの座標計算
    const eaveStartX = startX - eaveWest;
    const eaveStartY = startY - eaveNorth;
    const eaveWidth = canvasBuildingWidth + eaveWest + eaveEast;
    const eaveHeight = canvasBuildingHeight + eaveNorth + eaveSouth;

    // オレンジで軒の出矩形を描画（塗りつぶしなし）
    if (eaveNorth > 0 || eaveEast > 0 || eaveSouth > 0 || eaveWest > 0) {
      ctx.strokeStyle = '#FF8C00'; // オレンジ
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]); // 破線スタイル
      ctx.strokeRect(eaveStartX, eaveStartY, eaveWidth, eaveHeight);
      ctx.setLineDash([]); // 破線をリセット
    }

    // 寸法ラベル描画
    ctx.fillStyle = '#333333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';

    // 軒の出がある場合は建物寸法ラベルをさらに遠ざける
    const hasEaveOverhang = eaveNorth > 0 || eaveEast > 0 || eaveSouth > 0 || eaveWest > 0;
    const extraOffset = hasEaveOverhang ? 35 : 0; // 軒の出がある場合は追加オフセット

    // 東西方向の寸法（下側）
    const ewLabelX = startX + canvasBuildingWidth / 2;
    const ewLabelY = startY + canvasBuildingHeight + 45 + extraOffset + Math.max(eaveSouth, 0);
    ctx.fillText(`建物 ${buildingWidthEW}mm`, ewLabelX, ewLabelY);

    // 南北方向の寸法（右側）
    ctx.save();
    ctx.translate(startX + canvasBuildingWidth + 45 + extraOffset + Math.max(eaveEast, 0), startY + canvasBuildingHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`建物 ${buildingWidthNS}mm`, 0, 0);
    ctx.restore();

    // 軒の出寸法ラベル描画（軒の出がある場合のみ）
    ctx.fillStyle = '#FF8C00'; // オレンジ色
    ctx.font = '12px Arial';
    
    // 北側の軒の出
    if ((inputData.eaveOverhang.north ?? 0) > 0) {
      ctx.textAlign = 'center';
      ctx.fillText(`軒 ${inputData.eaveOverhang.north ?? 0}mm`, startX + canvasBuildingWidth / 2, eaveStartY - 8);
    }
    
    // 南側の軒の出
    if ((inputData.eaveOverhang.south ?? 0) > 0) {
      ctx.textAlign = 'center';
      ctx.fillText(`軒 ${inputData.eaveOverhang.south ?? 0}mm`, startX + canvasBuildingWidth / 2, eaveStartY + eaveHeight + 18);
    }
    
    // 東側の軒の出
    if ((inputData.eaveOverhang.east ?? 0) > 0) {
      ctx.save();
      ctx.translate(eaveStartX + eaveWidth + 12, startY + canvasBuildingHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(`軒 ${inputData.eaveOverhang.east ?? 0}mm`, 0, 0);
      ctx.restore();
    }
    
    // 西側の軒の出
    if ((inputData.eaveOverhang.west ?? 0) > 0) {
      ctx.save();
      ctx.translate(eaveStartX - 12, startY + canvasBuildingHeight / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(`軒 ${inputData.eaveOverhang.west ?? 0}mm`, 0, 0);
      ctx.restore();
    }

    // グリッド線（オプション）
    drawGrid(ctx, width, height);

  }, [inputData, width, height]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
        <canvas
          ref={canvasRef}
          className="block"
          style={{ 
            maxWidth: '100%',
            height: 'auto',
            background: '#fafafa'
          }}
        />
      </div>
      
      {/* 建物情報表示 */}
      <div className="text-sm text-slate-600 dark:text-slate-400 text-center space-y-2">
        <div>
          <p>建物寸法: {inputData.frameWidth.eastWest}mm × {inputData.frameWidth.northSouth}mm</p>
          <p className="text-xs">（東西 × 南北）</p>
        </div>
        
        {/* 軒の出情報 */}
        {((inputData.eaveOverhang.north ?? 0) > 0 || (inputData.eaveOverhang.east ?? 0) > 0 || 
          (inputData.eaveOverhang.south ?? 0) > 0 || (inputData.eaveOverhang.west ?? 0) > 0) && (
          <div className="border-t pt-2">
            <p className="text-orange-600 font-medium">軒の出:</p>
            <div className="grid grid-cols-2 gap-x-4 text-xs mt-1">
              {(inputData.eaveOverhang.north ?? 0) > 0 && <span>北: {inputData.eaveOverhang.north}mm</span>}
              {(inputData.eaveOverhang.east ?? 0) > 0 && <span>東: {inputData.eaveOverhang.east}mm</span>}
              {(inputData.eaveOverhang.south ?? 0) > 0 && <span>南: {inputData.eaveOverhang.south}mm</span>}
              {(inputData.eaveOverhang.west ?? 0) > 0 && <span>西: {inputData.eaveOverhang.west}mm</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// グリッド線描画関数
function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gridSize = 50;
  
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 0.5;
  
  // 縦線
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // 横線
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}