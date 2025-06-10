'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Edit3, Square, Move, ZoomIn, ZoomOut, Grid, Save, Undo, Redo, ChevronLeft, ChevronRight } from 'lucide-react';

interface DrawingData {
  building: {
    width: number;
    height: number;
  };
  eaves: {
    north: number;
    east: number;
    south: number;
    west: number;
  };
  timestamp: number;
}

interface DrawingEditorProps {
  width?: number;
  height?: number;
}

export default function DrawingEditor({ 
  width = 1000, 
  height = 700 
}: DrawingEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingData, setDrawingData] = useState<DrawingData | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [tool, setTool] = useState<'select' | 'pan' | 'zoom'>('select');
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  useEffect(() => {
    // セッションストレージから簡易計算データを読み込み
    const savedDrawingData = sessionStorage.getItem('drawingData');
    if (savedDrawingData) {
      try {
        const data = JSON.parse(savedDrawingData);
        setDrawingData(data);
        console.log('計算機からのデータを読み込みました:', data);
      } catch (error) {
        console.error('データ読み込みエラー:', error);
      }
    }
  }, []);

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

    // グリッド線描画
    if (showGrid) {
      drawGrid(ctx, width, height, scale, pan);
    }

    // 計算機からのデータがある場合は建物を描画
    if (drawingData) {
      drawBuildingFromData(ctx, drawingData, width, height, scale, pan);
    }

  }, [drawingData, width, height, scale, pan, showGrid]);

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, pan: { x: number; y: number }) => {
    const gridSize = 50 * scale;
    
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    
    // 縦線
    for (let x = pan.x % gridSize; x <= w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    
    // 横線
    for (let y = pan.y % gridSize; y <= h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  };

  const drawBuildingFromData = (
    ctx: CanvasRenderingContext2D, 
    data: DrawingData, 
    canvasWidth: number, 
    canvasHeight: number,
    scale: number,
    pan: { x: number; y: number }
  ) => {
    const buildingWidthNS = data.building.height; // 南北
    const buildingWidthEW = data.building.width;  // 東西

    // スケール計算
    const margin = 100;
    const maxCanvasWidth = canvasWidth - margin * 2;
    const maxCanvasHeight = canvasHeight - margin * 2;

    const scaleX = maxCanvasWidth / buildingWidthEW;
    const scaleY = maxCanvasHeight / buildingWidthNS;
    const autoScale = Math.min(scaleX, scaleY, 0.3) * scale;

    // Canvas上での建物寸法
    const canvasBuildingWidth = buildingWidthEW * autoScale;
    const canvasBuildingHeight = buildingWidthNS * autoScale;

    // 中央配置の座標計算（パン考慮）
    const startX = (canvasWidth - canvasBuildingWidth) / 2 + pan.x;
    const startY = (canvasHeight - canvasBuildingHeight) / 2 + pan.y;

    // 軒の出計算
    const eaveNorth = data.eaves.north * autoScale;
    const eaveEast = data.eaves.east * autoScale;
    const eaveSouth = data.eaves.south * autoScale;
    const eaveWest = data.eaves.west * autoScale;

    // 建物矩形（ライトグリーン）
    ctx.strokeStyle = '#90EE90';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(144, 238, 144, 0.2)';
    ctx.fillRect(startX, startY, canvasBuildingWidth, canvasBuildingHeight);
    ctx.strokeRect(startX, startY, canvasBuildingWidth, canvasBuildingHeight);

    // 軒の出矩形（オレンジ破線）
    if (eaveNorth > 0 || eaveEast > 0 || eaveSouth > 0 || eaveWest > 0) {
      const eaveStartX = startX - eaveWest;
      const eaveStartY = startY - eaveNorth;
      const eaveWidth = canvasBuildingWidth + eaveWest + eaveEast;
      const eaveHeight = canvasBuildingHeight + eaveNorth + eaveSouth;

      ctx.strokeStyle = '#FF8C00';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(eaveStartX, eaveStartY, eaveWidth, eaveHeight);
      ctx.setLineDash([]);
    }

    // 寸法ラベル
    ctx.fillStyle = '#333333';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';

    // 建物寸法ラベル
    const hasEaves = eaveNorth > 0 || eaveEast > 0 || eaveSouth > 0 || eaveWest > 0;
    const extraOffset = hasEaves ? 40 : 0;

    // 東西寸法（下）
    ctx.fillText(
      `建物 ${buildingWidthEW}mm`,
      startX + canvasBuildingWidth / 2,
      startY + canvasBuildingHeight + 50 + extraOffset + Math.max(eaveSouth, 0)
    );

    // 南北寸法（右）
    ctx.save();
    ctx.translate(
      startX + canvasBuildingWidth + 50 + extraOffset + Math.max(eaveEast, 0),
      startY + canvasBuildingHeight / 2
    );
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`建物 ${buildingWidthNS}mm`, 0, 0);
    ctx.restore();

    // 軒の出ラベル
    if (hasEaves) {
      ctx.fillStyle = '#FF8C00';
      ctx.font = '14px Arial';

      if (data.eaves.north > 0) {
        ctx.textAlign = 'center';
        ctx.fillText(`軒 ${data.eaves.north}mm`, startX + canvasBuildingWidth / 2, startY - eaveNorth - 10);
      }
      if (data.eaves.south > 0) {
        ctx.textAlign = 'center';
        ctx.fillText(`軒 ${data.eaves.south}mm`, startX + canvasBuildingWidth / 2, startY + canvasBuildingHeight + eaveSouth + 25);
      }
      if (data.eaves.east > 0) {
        ctx.save();
        ctx.translate(startX + canvasBuildingWidth + eaveEast + 15, startY + canvasBuildingHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(`軒 ${data.eaves.east}mm`, 0, 0);
        ctx.restore();
      }
      if (data.eaves.west > 0) {
        ctx.save();
        ctx.translate(startX - eaveWest - 15, startY + canvasBuildingHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText(`軒 ${data.eaves.west}mm`, 0, 0);
        ctx.restore();
      }
    }
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.3));
  const handleResetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="flex h-full">
      {/* 左ツールバー */}
      <div className="w-16 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center py-4 space-y-2">
        <button
          onClick={() => setTool('select')}
          className={`p-3 rounded-lg transition-colors ${
            tool === 'select' 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
              : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="選択"
        >
          <Move className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => setTool('pan')}
          className={`p-3 rounded-lg transition-colors ${
            tool === 'pan' 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
              : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="パン"
        >
          <Edit3 className="w-5 h-5" />
        </button>

        <div className="w-full h-px bg-slate-300 dark:bg-slate-600 my-2" />

        <button
          onClick={handleZoomIn}
          className="p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="拡大"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        <button
          onClick={handleZoomOut}
          className="p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="縮小"
        >
          <ZoomOut className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-3 rounded-lg transition-colors ${
            showGrid 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
              : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="グリッド表示"
        >
          <Grid className="w-5 h-5" />
        </button>

        <div className="w-full h-px bg-slate-300 dark:bg-slate-600 my-2" />

        <button
          onClick={handleResetView}
          className="p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="ビューリセット"
        >
          <Square className="w-5 h-5" />
        </button>
      </div>

      {/* メインキャンバスエリア */}
      <div className="flex-1 flex flex-col">
        {/* 上部ツールバー */}
        <div className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-4">
          <span className="text-sm font-medium">作図エディタ</span>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
          <span className="text-xs text-slate-500">スケール: {(scale * 100).toFixed(0)}%</span>
          {drawingData && (
            <>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                計算機データ: {drawingData.building.width}×{drawingData.building.height}mm
              </span>
            </>
          )}
        </div>

        {/* キャンバス */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className="block cursor-crosshair"
            style={{ 
              width: '100%',
              height: '100%',
              background: '#fafafa'
            }}
          />
        </div>
      </div>

      {/* 右パネル */}
      <div className={`${
        rightPanelCollapsed ? 'w-16' : 'w-80'
      } bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 overflow-y-auto transition-all duration-300`}>
        
        {/* 右パネル折りたたみボタン */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          {!rightPanelCollapsed && (
            <h2 className="text-sm font-medium">プロパティ</h2>
          )}
          <button
            onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={rightPanelCollapsed ? "パネルを展開" : "パネルを収納"}
          >
            {rightPanelCollapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {!rightPanelCollapsed && (
          <div className="p-4">
        {/* 計算機からのデータ表示 */}
        {drawingData && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-emerald-600">計算機からのデータ</h2>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 space-y-3">
              <div>
                <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">建物寸法</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  {drawingData.building?.width}mm × {drawingData.building?.height}mm
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500">（東西 × 南北）</p>
              </div>
              
              {(drawingData.eaves?.north > 0 || drawingData.eaves?.east > 0 || 
                drawingData.eaves?.south > 0 || drawingData.eaves?.west > 0) && (
                <div>
                  <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">軒の出</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                    {drawingData.eaves?.north > 0 && <span>北: {drawingData.eaves.north}mm</span>}
                    {drawingData.eaves?.east > 0 && <span>東: {drawingData.eaves.east}mm</span>}
                    {drawingData.eaves?.south > 0 && <span>南: {drawingData.eaves.south}mm</span>}
                    {drawingData.eaves?.west > 0 && <span>西: {drawingData.eaves.west}mm</span>}
                  </div>
                </div>
              )}
              
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  ✓ 建物と軒の出が自動描画されています
                </p>
              </div>
            </div>
          </div>
        )}

        {/* その他のツール */}
        <div>
          <h3 className="text-sm font-medium mb-3">描画ツール</h3>
          <div className="space-y-2">
            <button className="w-full p-2 text-left text-sm bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              矩形ツール
            </button>
            <button className="w-full p-2 text-left text-sm bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              線ツール
            </button>
            <button className="w-full p-2 text-left text-sm bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              寸法線ツール
            </button>
          </div>
        </div>
          </div>
        )}

        {/* 収納時のアイコン表示 */}
        {rightPanelCollapsed && drawingData && (
          <div className="p-2 flex flex-col items-center">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center mb-2">
              <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 text-center">
              データ
            </div>
          </div>
        )}
      </div>
    </div>
  );
}