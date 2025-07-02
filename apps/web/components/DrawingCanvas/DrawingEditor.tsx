'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Edit3, Square, Move, ZoomIn, ZoomOut, Grid, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { drawCompositeView, drawGrid as drawAdvancedGrid } from './utils/drawingUtils';
import type { DrawingData, DimensionArea, BuildingVertex, EdgeEave, Opening, FloorData, FloorColors, AdvancedCalculationSummary, ScaffoldLineData } from './types/drawing';
import type { ScaffoldCalculationResult } from '../../lib/calculator/types';
// import { convertToFloorData, generateDrawingMetadata, type ScaffoldInputData } from '../../lib/drawing/scaffoldGenerator';

interface ScaffoldInputData {
  width_NS: number;
  width_EW: number;
  eaves_N: number;
  eaves_E: number;
  eaves_S: number;
  eaves_W: number;
}

// スライダーのカスタムスタイル
const sliderStyle = `
.slider::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #FF8C00;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.slider::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #FF8C00;
  cursor: pointer;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.slider::-webkit-slider-track {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
}

.slider::-moz-range-track {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
}
`;

// 階層カラーパレット
const FLOOR_COLORS: Record<number, FloorColors> = {
  1: { building: '#22C55E', eaves: '#16A34A', vertex: '#22C55E' }, // 緑+ダークグリーン
  2: { building: '#3B82F6', eaves: '#1E40AF', vertex: '#3B82F6' }, // 青+ダークブルー
  3: { building: '#8B5CF6', eaves: '#5B21B6', vertex: '#8B5CF6' }, // 紫+ダークパープル
  4: { building: '#F59E0B', eaves: '#D97706', vertex: '#F59E0B' }, // 黄+ダークオレンジ
  5: { building: '#EF4444', eaves: '#B91C1C', vertex: '#EF4444' }  // 赤+ダークレッド
};

interface DragHandle {
  id: string;
  type: 'building' | 'eave';
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  x: number;
  y: number;
  radius: number;
}

interface DrawingEditorProps {
  width?: number;
  height?: number;
  calculationResult?: ScaffoldCalculationResult;
  inputData?: ScaffoldInputData;
  autoGenerate?: boolean;
}


export default function DrawingEditor({ 
  width = 1000, 
  height = 700,
  calculationResult,
  inputData,
  autoGenerate = false
}: DrawingEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingData, setDrawingData] = useState<DrawingData | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [tool, setTool] = useState<'select' | 'pan' | 'zoom'>('select');
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [dimensionAreas, setDimensionAreas] = useState<DimensionArea[]>([]);
  const [editingDimension, setEditingDimension] = useState<DimensionArea | null>(null);
  const [modalValue, setModalValue] = useState<string>('');
  const [hoveredDimension] = useState<DimensionArea | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [mounted] = useState(true);
  const [dragHandles, setDragHandles] = useState<DragHandle[]>([]);
  const [hoveredHandle] = useState<DragHandle | null>(null);
  const [draggingHandle] = useState<DragHandle | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPos, setPanStartPos] = useState<{ x: number; y: number } | null>(null);
  const [panStartOffset, setPanStartOffset] = useState<{ x: number; y: number } | null>(null);
  const [buildingVertices, setBuildingVertices] = useState<BuildingVertex[]>([]);
  // シンプルモードを削除し、常に高度モードで動作（グリッド吸着のみ）
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null);
  const [edgeEaves, setEdgeEaves] = useState<EdgeEave[]>([]);
  
  // 階層管理
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [activeFloorId, setActiveFloorId] = useState<string>('floor-1');
  const [nextFloorNumber, setNextFloorNumber] = useState<number>(2);
  
  // ドラッグ&ドロップ
  const [draggedFloorId, setDraggedFloorId] = useState<string | null>(null);
  const [dropTargetFloorId, setDropTargetFloorId] = useState<string | null>(null);
  
  // 作図モード
  const [isCompositeMode, setIsCompositeMode] = useState<boolean>(false);
  
  // 開口部管理
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [openingType, setOpeningType] = useState<'entrance' | 'back_door' | 'sliding_window' | 'garage' | 'passage'>('entrance');
  const [isCreatingOpening, setIsCreatingOpening] = useState<boolean>(false);
  const [openingStartPoint, setOpeningStartPoint] = useState<{ edgeIndex: number; position: number } | null>(null);
  
  // UI折りたたみ状態
  const [isEavesCollapsed, setIsEavesCollapsed] = useState<boolean>(false);
  const [isOpeningsCollapsed, setIsOpeningsCollapsed] = useState<boolean>(false);
  
  // 開口部寸法表示状態（開口部IDのセット）
  const [visibleOpeningDimensions, setVisibleOpeningDimensions] = useState<Set<string>>(new Set());

  // 高度計算関連のステート
  const [advancedCalculationResult, setAdvancedCalculationResult] = useState<AdvancedCalculationSummary | null>(null);
  const [scaffoldLineData, setScaffoldLineData] = useState<ScaffoldLineData | null>(null);
  const [showScaffoldLine, setShowScaffoldLine] = useState<boolean>(true);
  const [isAdvancedCalculating, setIsAdvancedCalculating] = useState<boolean>(false);

  // 足場ライン自動生成機能
  useEffect(() => {
    if (autoGenerate && calculationResult && inputData) {
      console.log('足場ライン自動生成を開始:', { calculationResult, inputData });
      
      try {
        // 入力データから実寸でFloorDataを生成
        const buildingWidthEW = inputData.width_EW; // 東西
        const buildingWidthNS = inputData.width_NS; // 南北
        
        // Canvas中心
        const centerX = width / 2;
        const centerY = height / 2;
        
        // 縮尺計算
        const margin = 100;
        const maxCanvasWidth = width - margin * 2;
        const maxCanvasHeight = height - margin * 2;
        const scaleX = maxCanvasWidth / buildingWidthEW;
        const scaleY = maxCanvasHeight / buildingWidthNS;
        const autoScale = Math.min(scaleX, scaleY, 0.3);
        
        // 建物サイズをピクセルに変換
        const buildingPixelWidth = buildingWidthEW * autoScale;
        const buildingPixelHeight = buildingWidthNS * autoScale;
        
        // 建物Floor（入力データから正確な寸法）
        const buildingFloor: FloorData = {
          id: 'building-floor-1',
          name: '建物',
          height: 3000,
          vertices: [
            { id: 'building-1', x: centerX - buildingPixelWidth / 2, y: centerY - buildingPixelHeight / 2 },
            { id: 'building-2', x: centerX + buildingPixelWidth / 2, y: centerY - buildingPixelHeight / 2 },
            { id: 'building-3', x: centerX + buildingPixelWidth / 2, y: centerY + buildingPixelHeight / 2 },
            { id: 'building-4', x: centerX - buildingPixelWidth / 2, y: centerY + buildingPixelHeight / 2 }
          ],
          eaves: [
            { edgeIndex: 0, distance: inputData.eaves_N },
            { edgeIndex: 1, distance: inputData.eaves_E },
            { edgeIndex: 2, distance: inputData.eaves_S },
            { edgeIndex: 3, distance: inputData.eaves_W }
          ],
          openings: [],
          visible: true
        };

        // 足場ライン（計算結果から離れを反映）
        console.log('計算結果の詳細:', calculationResult);
        
        // 計算結果から離れの値を取得（型定義に合わせて修正）
        const eastGap = parseInt(calculationResult.east_gap?.replace(' mm', '') || '150');
        const westGap = parseInt(calculationResult.west_gap?.replace(' mm', '') || '150');
        const northGap = parseInt(calculationResult.north_gap?.replace(' mm', '') || '100');
        const southGap = parseInt(calculationResult.south_gap?.replace(' mm', '') || '100');
        
        console.log('離れの値:', { eastGap, westGap, northGap, southGap });
        
        // 足場ラインサイズをピクセルに変換
        const scaffoldPixelOffsetNorth = northGap * autoScale;
        const scaffoldPixelOffsetEast = eastGap * autoScale;
        const scaffoldPixelOffsetSouth = southGap * autoScale;
        const scaffoldPixelOffsetWest = westGap * autoScale;
        
        const scaffoldFloor: FloorData = {
          id: 'scaffold-line-1',
          name: '足場ライン',
          height: 3000,
          vertices: [
            { id: 'scaffold-1', x: centerX - buildingPixelWidth / 2 - scaffoldPixelOffsetWest, y: centerY - buildingPixelHeight / 2 - scaffoldPixelOffsetNorth },
            { id: 'scaffold-2', x: centerX + buildingPixelWidth / 2 + scaffoldPixelOffsetEast, y: centerY - buildingPixelHeight / 2 - scaffoldPixelOffsetNorth },
            { id: 'scaffold-3', x: centerX + buildingPixelWidth / 2 + scaffoldPixelOffsetEast, y: centerY + buildingPixelHeight / 2 + scaffoldPixelOffsetSouth },
            { id: 'scaffold-4', x: centerX - buildingPixelWidth / 2 - scaffoldPixelOffsetWest, y: centerY + buildingPixelHeight / 2 + scaffoldPixelOffsetSouth }
          ],
          eaves: [],
          openings: [],
          visible: true
        };
        
        const generatedFloors = [buildingFloor, scaffoldFloor];
        console.log('生成されたFloors:', generatedFloors);
        
        // floorsに設定
        setFloors(generatedFloors);
        
        // 建物フロアをアクティブに設定と頂点設定
        if (generatedFloors.length > 0) {
          setActiveFloorId(generatedFloors[0].id);
          setBuildingVertices(generatedFloors[0].vertices);
          setEdgeEaves(generatedFloors[0].eaves);
          setOpenings(generatedFloors[0].openings || []);
        }
        
        // 正しいdrawingDataを設定（編集機能を有効にするため）
        const correctDrawingData = {
          building: { width: inputData.width_EW, height: inputData.width_NS },
          eaves: { north: inputData.eaves_N, east: inputData.eaves_E, south: inputData.eaves_S, west: inputData.eaves_W },
          timestamp: Date.now()
        };
        setDrawingData(correctDrawingData);
        
        // 適切なズームレベルで表示
        setScale(1); // デフォルトズームで表示
        
        console.log('足場ライン自動生成完了:', generatedFloors.length, '階層生成');
      } catch (error) {
        console.error('足場ライン自動生成エラー:', error);
      }
    }
  }, [autoGenerate, calculationResult, inputData, width, height]);

  useEffect(() => {
    // 自動生成モードでない場合のみ、セッションストレージから簡易計算データを読み込み
    if (typeof window !== 'undefined' && !autoGenerate) {
      const savedDrawingData = sessionStorage.getItem('drawingData');
      if (savedDrawingData) {
        try {
          const data = JSON.parse(savedDrawingData);
          setDrawingData(data);
          console.log('計算機からのデータを読み込みました:', data);
          
          // 初期頂点を設定（四角形） - 軒の出も含めて初期化
          initializeBuildingVertices(data);
        } catch (error) {
          console.error('データ読み込みエラー:', error);
          // エラーの場合もデフォルトデータで初期化
          const defaultData: DrawingData = {
            building: { width: 6000, height: 4000 },
            eaves: { north: 500, east: 500, south: 500, west: 500 },
            timestamp: Date.now()
          };
          setDrawingData(defaultData);
          initializeBuildingVertices(defaultData);
        }
      } else {
        // デフォルトデータで初期化
        const defaultData: DrawingData = {
          building: { width: 6000, height: 4000 },
          eaves: { north: 500, east: 500, south: 500, west: 500 },
          timestamp: Date.now()
        };
        setDrawingData(defaultData);
        initializeBuildingVertices(defaultData);
        console.log('デフォルトデータで初期化しました:', defaultData);
      }
      
      // 1階を初期フロアとして設定
      initializeFloors();
    }
  }, [width, height]);

  // 建物の頂点を初期化
  const initializeBuildingVertices = (data: DrawingData) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 正しい縮尺計算（drawAdvancedBuildingと同じロジック）
    const buildingWidthEW = data.building.width;
    const buildingWidthNS = data.building.height;
    
    const margin = 100;
    const maxCanvasWidth = width - margin * 2;
    const maxCanvasHeight = height - margin * 2;
    
    const scaleX = maxCanvasWidth / buildingWidthEW;
    const scaleY = maxCanvasHeight / buildingWidthNS;
    const baseScale = Math.min(scaleX, scaleY, 0.3);
    
    // 実際の建物サイズをピクセルに変換
    const buildingWidth = buildingWidthEW * baseScale;
    const buildingHeight = buildingWidthNS * baseScale;

    const vertices: BuildingVertex[] = [
      { id: 'v1', x: centerX - buildingWidth / 2, y: centerY - buildingHeight / 2 },
      { id: 'v2', x: centerX + buildingWidth / 2, y: centerY - buildingHeight / 2 },
      { id: 'v3', x: centerX + buildingWidth / 2, y: centerY + buildingHeight / 2 },
      { id: 'v4', x: centerX - buildingWidth / 2, y: centerY + buildingHeight / 2 }
    ];

    setBuildingVertices(vertices);
    
    // 計算機からの軒の出データを使用
    const initialEdgeEaves: EdgeEave[] = [
      { edgeIndex: 0, distance: data.eaves.north },  // 上辺
      { edgeIndex: 1, distance: data.eaves.east },   // 右辺
      { edgeIndex: 2, distance: data.eaves.south },  // 下辺
      { edgeIndex: 3, distance: data.eaves.west }    // 左辺
    ];
    setEdgeEaves(initialEdgeEaves);
  };

  // 階層を初期化
  const initializeFloors = () => {
    const initialFloor: FloorData = {
      id: 'floor-1',
      name: '1F',
      height: 3000, // デフォルト3m
      vertices: [],
      eaves: [],
      openings: [],     // 開口部データを追加
      visible: true
    };
    setFloors([initialFloor]);
  };

  // 階層同期：現在の頂点と軒の出、開口部を現在のフロアに保存
  const syncCurrentFloorData = () => {
    setFloors(prev => prev.map(floor => 
      floor.id === activeFloorId 
        ? { ...floor, vertices: buildingVertices, eaves: edgeEaves, openings: openings }
        : floor
    ));
  };

  // 階層データから頂点と軒の出、開口部を復元
  const loadFloorData = (floorId: string) => {
    const floor = floors.find(f => f.id === floorId);
    if (floor) {
      setBuildingVertices(floor.vertices);
      setEdgeEaves(floor.eaves);
      setOpenings(floor.openings);
    }
  };

  // 新しい階層を追加
  const addNewFloor = () => {
    // 現在のフロアデータを保存
    syncCurrentFloorData();
    
    const newFloor: FloorData = {
      id: `floor-${nextFloorNumber}`,
      name: `${nextFloorNumber}F`,
      height: 3000,
      vertices: [],
      eaves: [],
      openings: [],     // 新しい階層は空の開口部
      visible: true
    };
    
    setFloors(prev => [...prev, newFloor]);
    setNextFloorNumber(prev => prev + 1);
  };

  // 階層を切り替え
  const switchFloor = (floorId: string) => {
    // 現在のフロアデータを保存
    syncCurrentFloorData();
    
    // 新しいフロアデータを読み込み
    setActiveFloorId(floorId);
    loadFloorData(floorId);
    setSelectedVertexIndex(null);
  };

  // ドラッグ開始
  const handleDragStart = (e: React.DragEvent, floorId: string) => {
    setDraggedFloorId(floorId);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', floorId);
    
    // ドラッグ画像をカスタマイズ（オプション）
    const dragImage = document.createElement('div');
    dragImage.textContent = `${floors.find(f => f.id === floorId)?.name} をコピー`;
    dragImage.style.padding = '8px 12px';
    dragImage.style.background = '#3B82F6';
    dragImage.style.color = 'white';
    dragImage.style.borderRadius = '4px';
    dragImage.style.fontSize = '12px';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  // ドラッグオーバー
  const handleDragOver = (e: React.DragEvent, targetFloorId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDropTargetFloorId(targetFloorId);
  };

  // ドラッグ離脱
  const handleDragLeave = () => {
    setDropTargetFloorId(null);
  };

  // ドロップ
  const handleDrop = (e: React.DragEvent, targetFloorId: string) => {
    e.preventDefault();
    const sourceFloorId = e.dataTransfer.getData('text/plain');
    
    if (sourceFloorId && sourceFloorId !== targetFloorId) {
      copyFloorData(sourceFloorId, targetFloorId);
    }
    
    setDraggedFloorId(null);
    setDropTargetFloorId(null);
  };

  // ドラッグ終了（階層用）
  const handleFloorDragEnd = () => {
    setDraggedFloorId(null);
    setDropTargetFloorId(null);
  };

  // 階層データをコピー
  const copyFloorData = (sourceFloorId: string, targetFloorId: string) => {
    const sourceFloor = floors.find(f => f.id === sourceFloorId);
    if (!sourceFloor) return;

    // 現在のアクティブフロアのデータを保存
    syncCurrentFloorData();

    // ソースフロアの最新データを取得
    const updatedSourceFloor = floors.find(f => f.id === sourceFloorId);
    if (!updatedSourceFloor) return;

    // ターゲットフロアにコピー（同じ座標で配置）
    const copiedVertices = updatedSourceFloor.vertices.map(vertex => ({
      ...vertex,
      id: `${vertex.id}-copy-${Date.now()}`
      // x, yはそのまま（オフセットなし）
    }));

    setFloors(prev => prev.map(floor => 
      floor.id === targetFloorId 
        ? { 
            ...floor, 
            vertices: copiedVertices,
            eaves: [...updatedSourceFloor.eaves], // 軒の出はコピー
            openings: [] // 開口部はコピーしない（空配列）
          }
        : floor
    ));

    // ターゲットフロアに切り替え
    setActiveFloorId(targetFloorId);
    setBuildingVertices(copiedVertices);
    setEdgeEaves([...updatedSourceFloor.eaves]);
    setOpenings([]); // 開口部は空にリセット
    setSelectedVertexIndex(null);

    console.log(`フロア ${updatedSourceFloor.name} から ${floors.find(f => f.id === targetFloorId)?.name} にコピーしました`);
  };

  // 初期化関数の重複を削除（initializeBuildingVerticesで処理済み）

  // 辺上の位置を検出する関数
  const detectEdgeClick = (mouseX: number, mouseY: number): { edgeIndex: number; position: number } | null => {
    if (buildingVertices.length < 3) return null;

    const centerX = width / 2;
    const centerY = height / 2;
    
    // ズーム適用後の頂点座標を計算
    const scaledVertices = buildingVertices.map(vertex => ({
      x: centerX + (vertex.x - centerX) * scale + pan.x,
      y: centerY + (vertex.y - centerY) * scale + pan.y
    }));

    // 各辺をチェック
    for (let i = 0; i < scaledVertices.length; i++) {
      const current = scaledVertices[i];
      const next = scaledVertices[(i + 1) % scaledVertices.length];
      
      // 辺上の最近傍点を計算
      const closest = getClosestPointOnSegment(mouseX, mouseY, current, next);
      
      // クリック位置と最近傍点の距離をチェック（10px以内）
      const distance = Math.sqrt(Math.pow(mouseX - closest.x, 2) + Math.pow(mouseY - closest.y, 2));
      
      if (distance <= 10) {
        // 辺上での位置を0-1の比率で計算
        const edgeLength = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2));
        const clickLength = Math.sqrt(Math.pow(closest.x - current.x, 2) + Math.pow(closest.y - current.y, 2));
        const position = edgeLength > 0 ? clickLength / edgeLength : 0;
        
        return { edgeIndex: i, position: Math.max(0, Math.min(1, position)) };
      }
    }
    
    return null;
  };

  // 線分上の最近傍点を計算
  const getClosestPointOnSegment = (
    px: number, py: number,
    start: { x: number; y: number },
    end: { x: number; y: number }
  ): { x: number; y: number } => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = dx * dx + dy * dy;
    
    if (length === 0) return { x: start.x, y: start.y };
    
    const t = Math.max(0, Math.min(1, ((px - start.x) * dx + (py - start.y) * dy) / length));
    
    return {
      x: start.x + t * dx,
      y: start.y + t * dy
    };
  };

  // 開口部の点線クリック検出
  const detectOpeningClick = (mouseX: number, mouseY: number): string | null => {
    if (buildingVertices.length < 3 || openings.length === 0) return null;

    const centerX = width / 2;
    const centerY = height / 2;
    
    // ズーム適用後の頂点座標を計算
    const scaledVertices = buildingVertices.map(vertex => ({
      x: centerX + (vertex.x - centerX) * scale + pan.x,
      y: centerY + (vertex.y - centerY) * scale + pan.y
    }));

    // 各開口部をチェック
    for (const opening of openings) {
      if (opening.edgeIndex >= scaledVertices.length) continue;
      
      const current = scaledVertices[opening.edgeIndex];
      const next = scaledVertices[(opening.edgeIndex + 1) % scaledVertices.length];
      
      // 開口部の開始・終了位置を計算
      const openingStart = {
        x: current.x + (next.x - current.x) * opening.startPosition,
        y: current.y + (next.y - current.y) * opening.startPosition
      };
      const openingEnd = {
        x: current.x + (next.x - current.x) * opening.endPosition,
        y: current.y + (next.y - current.y) * opening.endPosition
      };
      
      // 開口部線分上の最近傍点を計算
      const closest = getClosestPointOnSegment(mouseX, mouseY, openingStart, openingEnd);
      
      // クリック位置と最近傍点の距離をチェック（15px以内）
      const distance = Math.sqrt(Math.pow(mouseX - closest.x, 2) + Math.pow(mouseY - closest.y, 2));
      
      if (distance <= 15) {
        return opening.id;
      }
    }
    
    return null;
  };

  // 開口部の寸法表示を切り替え
  const toggleOpeningDimension = (openingId: string) => {
    setVisibleOpeningDimensions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(openingId)) {
        newSet.delete(openingId);
      } else {
        newSet.add(openingId);
      }
      return newSet;
    });
  };

  // 開口部の種類に応じたデフォルト幅を取得
  const getDefaultOpeningWidth = (type: typeof openingType): number => {
    switch (type) {
      case 'entrance': return 900;      // 玄関: 900mm
      case 'back_door': return 800;     // 勝手口: 800mm
      case 'sliding_window': return 1800; // 掃出し窓: 1800mm
      case 'garage': return 2500;       // ガレージ: 2500mm
      case 'passage': return 1200;      // 通路: 1200mm
      default: return 900;
    }
  };

  // 開口部種類の日本語表示名を取得
  const getOpeningTypeName = (type: typeof openingType): string => {
    switch (type) {
      case 'entrance': return '玄関';
      case 'back_door': return '勝手口';
      case 'sliding_window': return '掃出し窓';
      case 'garage': return 'ガレージ';
      case 'passage': return '通路';
      default: return '不明';
    }
  };

  // 開口部の種類が変更された時の処理
  const handleOpeningTypeChange = (newType: typeof openingType) => {
    setOpeningType(newType);
  };

  // 開口部を作成する関数
  const createOpening = (edgeIndex: number, startPos: number, endPos: number) => {
    // 開始位置と終了位置を正しい順序に調整
    const minPos = Math.min(startPos, endPos);
    const maxPos = Math.max(startPos, endPos);
    
    // 最小幅のチェック
    const actualWidth = Math.abs(maxPos - minPos);
    if (actualWidth < 0.05) { // 5%未満の場合は無効
      console.warn('開口部が小さすぎます');
      return;
    }

    const newOpening: Opening = {
      id: `opening-${Date.now()}`,
      edgeIndex,
      startPosition: minPos,
      endPosition: maxPos,
      width: getDefaultOpeningWidth(openingType),
      type: openingType // 選択された種類を使用
    };

    setOpenings(prev => [...prev, newOpening]);
    
    // 開口部作成モードを終了
    setIsCreatingOpening(false);
    setOpeningStartPoint(null);
    
    console.log('開口部を作成しました:', newOpening);
  };

  // 開口部を考慮して辺を描画する関数
  const drawEdgeWithOpenings = (
    ctx: CanvasRenderingContext2D,
    start: { x: number; y: number },
    end: { x: number; y: number },
    edgeOpenings: Opening[]
  ) => {
    // 開口部を位置順にソート
    const sortedOpenings = [...edgeOpenings].sort((a, b) => a.startPosition - b.startPosition);
    
    let currentPos = 0;
    
    sortedOpenings.forEach(opening => {
      // 開口部の前の実線部分を描画
      if (currentPos < opening.startPosition) {
        const segmentStart = {
          x: start.x + (end.x - start.x) * currentPos,
          y: start.y + (end.y - start.y) * currentPos
        };
        const segmentEnd = {
          x: start.x + (end.x - start.x) * opening.startPosition,
          y: start.y + (end.y - start.y) * opening.startPosition
        };
        
        // 実線で描画
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(segmentStart.x, segmentStart.y);
        ctx.lineTo(segmentEnd.x, segmentEnd.y);
        ctx.stroke();
      }
      
      // 開口部の点線部分を描画
      const openingStart = {
        x: start.x + (end.x - start.x) * opening.startPosition,
        y: start.y + (end.y - start.y) * opening.startPosition
      };
      const openingEnd = {
        x: start.x + (end.x - start.x) * opening.endPosition,
        y: start.y + (end.y - start.y) * opening.endPosition
      };
      
      // 点線で描画
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(openingStart.x, openingStart.y);
      ctx.lineTo(openingEnd.x, openingEnd.y);
      ctx.stroke();
      
      currentPos = opening.endPosition;
    });
    
    // 最後の開口部以降の実線部分を描画
    if (currentPos < 1) {
      const segmentStart = {
        x: start.x + (end.x - start.x) * currentPos,
        y: start.y + (end.y - start.y) * currentPos
      };
      
      // 実線で描画
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(segmentStart.x, segmentStart.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
    
    // 線種をリセット
    ctx.setLineDash([]);
  };

  // 頂点を追加（100mm単位グリッド吸着）
  const addVertex = (x: number, y: number, insertAfterIndex: number) => {
    // 100mm単位に吸着
    const snapped = snapToGrid(x, y);
    
    const newVertex: BuildingVertex = {
      id: `v${Date.now()}`,
      x: snapped.x,
      y: snapped.y
    };

    setBuildingVertices(prev => {
      const newVertices = [...prev];
      newVertices.splice(insertAfterIndex + 1, 0, newVertex);
      return newVertices;
    });
    // useEffectが自動でリアルタイム再描画を処理します

    // 新しい辺の軒の出を追加
    setEdgeEaves(prev => {
      const newEdgeEaves = [...prev];
      newEdgeEaves.splice(insertAfterIndex + 1, 0, {
        edgeIndex: insertAfterIndex + 1,
        distance: 500
      });
      // インデックスを更新
      return newEdgeEaves.map((edge, index) => ({
        ...edge,
        edgeIndex: index
      }));
    });
  };

  // 頂点を削除
  const deleteVertex = (index: number) => {
    if (buildingVertices.length <= 3) {
      alert('最低3つの頂点が必要です');
      return;
    }

    setBuildingVertices(prev => prev.filter((_, i) => i !== index));
    setSelectedVertexIndex(null);

    // 対応する辺の軒の出を削除
    setEdgeEaves(prev => {
      const filteredEaves = prev.filter((_, i) => i !== index);
      // インデックスを更新
      return filteredEaves.map((edge, i) => ({
        ...edge,
        edgeIndex: i
      }));
    });
  };

  // 頂点位置を更新（100mm単位グリッド吸着）
  const updateVertexPosition = (index: number, x: number, y: number) => {
    // 100mm単位に吸着
    const snapped = snapToGrid(x, y);
    
    setBuildingVertices(prev => prev.map((vertex, i) => 
      i === index ? { ...vertex, x: snapped.x, y: snapped.y } : vertex
    ));
    // useEffectが自動でリアルタイム再描画を処理します
  };

  // Canvas座標を100mm単位のグリッドに吸着（グリッド描画と完全に一致）
  const snapToGrid = (canvasX: number, canvasY: number) => {
    if (!drawingData) return { x: canvasX, y: canvasY };
    
    // グリッド描画と同じ計算
    const buildingWidthEW = drawingData.building.width;
    const buildingWidthNS = drawingData.building.height;
    
    const margin = 100;
    const maxCanvasWidth = width - margin * 2;
    const maxCanvasHeight = height - margin * 2;
    
    const scaleX = maxCanvasWidth / buildingWidthEW;
    const scaleY = maxCanvasHeight / buildingWidthNS;
    const baseScale = Math.min(scaleX, scaleY, 0.3);
    const currentScale = baseScale * scale;
    
    // グリッドサイズ（100mm単位）
    const gridSize = currentScale * 100;
    
    // 元の中心点（パンなし）
    const originX = width / 2;
    const originY = height / 2;
    
    // パンを考慮したグリッド原点
    const gridOriginX = originX + pan.x;
    const gridOriginY = originY + pan.y;
    
    // グリッド原点からの相対位置
    const relativeX = canvasX - gridOriginX;
    const relativeY = canvasY - gridOriginY;
    
    // 最も近いグリッド点に吸着
    const snappedRelativeX = Math.round(relativeX / gridSize) * gridSize;
    const snappedRelativeY = Math.round(relativeY / gridSize) * gridSize;
    
    // 絶対座標に戻す
    const snappedX = gridOriginX + snappedRelativeX;
    const snappedY = gridOriginY + snappedRelativeY;
    
    return { x: snappedX, y: snappedY };
  };


  // 辺の軒の出距離を更新
  const updateEdgeEaveDistance = (edgeIndex: number, distance: number) => {
    setEdgeEaves(prev => prev.map(edge => 
      edge.edgeIndex === edgeIndex ? { ...edge, distance } : edge
    ));
  };

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
    console.log('Grid check:', { showGrid, width, height });
    if (showGrid) {
      console.log('Drawing grid...');
      // 自動生成モードでは仮のdrawingDataを作成
      const gridDrawingData = autoGenerate && floors.length > 0 && inputData ? {
        building: { width: inputData.width_EW, height: inputData.width_NS },
        eaves: { north: inputData.eaves_N, east: inputData.eaves_E, south: inputData.eaves_S, west: inputData.eaves_W },
        timestamp: Date.now()
      } : drawingData;
      if (gridDrawingData) {
        drawAdvancedGrid(ctx, width, height, scale, pan, gridDrawingData);
      }
    } else {
      console.log('Grid is disabled');
    }

    // 自動生成モードまたは計算機からのデータがある場合は建物を描画
    console.log('Drawing mode check:', { autoGenerate, floorsLength: floors.length, hasDrawingData: !!drawingData, isCompositeMode, buildingVerticesLength: buildingVertices.length });
    
    if (autoGenerate && floors.length > 0) {
      if (buildingVertices.length >= 3) {
        // 頂点編集中：足場ラインのみ描画 + 編集中の建物描画
        console.log('Drawing scaffold lines only + edited building for autoGenerate mode');
        // 足場ラインのみを描画
        const scaffoldFloors = floors.filter(floor => floor.name === '足場ライン');
        if (scaffoldFloors.length > 0) {
          drawCompositeView(ctx, width, height, scale, pan, scaffoldFloors, drawingData, setDimensionAreas);
        }
        // 編集中の建物を描画
        drawAdvancedBuilding(ctx, width, height, scale, pan, false);
      } else {
        // 通常表示：全階層を描画
        console.log('Using drawCompositeView for autoGenerate mode');
        drawCompositeView(ctx, width, height, scale, pan, floors, drawingData, setDimensionAreas);
      }
    } else if (drawingData) {
      if (isCompositeMode) {
        // 作図モード：全階層を重ね合わせて描画（上階優先）
        console.log('Using drawCompositeView for composite mode');
        drawCompositeView(ctx, width, height, scale, pan, floors, drawingData, setDimensionAreas);
      } else {
        // 編集モード：全階層を描画（非アクティブ階層は薄く表示）
        console.log('Using drawAdvancedBuilding for edit mode');
        drawAllFloors(ctx, width, height, scale, pan);
        
        // アクティブ階層を描画
        drawAdvancedBuilding(ctx, width, height, scale, pan);
      }
    }

    // ホバーした寸法エリアのハイライト表示
    if (hoveredDimension) {
      drawHoveredDimensionArea(ctx, hoveredDimension);
    }


    // デバッグ用: 寸法エリアのハイライト表示 (無効化)
    // if (process.env.NODE_ENV === 'development') {
    //   drawDimensionAreas(ctx);
    // }

  }, [drawingData, width, height, scale, pan, showGrid, mounted, buildingVertices, edgeEaves, openings, visibleOpeningDimensions, autoGenerate, floors, isCompositeMode]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Gキーでグリッド表示/非表示切り替え
      if (event.key === 'g' || event.key === 'G') {
        event.preventDefault();
        setShowGrid(prev => !prev);
      }
      // Spaceキーでパンモード切り替え
      if (event.code === 'Space' && !event.repeat) {
        event.preventDefault();
        setTool(prev => prev === 'pan' ? 'select' : 'pan');
      }
      // +/-キーでズーム
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        handleZoomIn();
      }
      if (event.key === '-') {
        event.preventDefault();
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ドラッグハンドルとホバーエフェクトの描画用useEffect
  useEffect(() => {
    if (!mounted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ドラッグハンドルを描画
    if (dragHandles.length > 0) {
      drawDragHandles(ctx, dragHandles, hoveredHandle);
    }
  }, [mounted, dragHandles, hoveredHandle, draggingHandle]);

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number, scale: number, pan: { x: number; y: number }) => {
    if (!drawingData) return;
    
    // 建物データに基づく動的グリッド計算
    const buildingWidthEW = drawingData.building.width;
    const buildingWidthNS = drawingData.building.height;
    
    const margin = 100;
    const maxCanvasWidth = w - margin * 2;
    const maxCanvasHeight = h - margin * 2;
    
    const scaleX = maxCanvasWidth / buildingWidthEW;
    const scaleY = maxCanvasHeight / buildingWidthNS;
    const baseScale = Math.min(scaleX, scaleY, 0.3);
    const currentScale = baseScale * scale;
    
    // グリッドサイズ（ピクセル単位）
    const gridSize100mm = currentScale * 100; // 100mm = このピクセル数
    const gridSize500mm = currentScale * 500; // 500mm = このピクセル数
    
    // 元の中心点（パンなし）
    const originX = w / 2;
    const originY = h / 2;
    
    // パンを考慮したグリッド原点
    const gridOriginX = originX + pan.x;
    const gridOriginY = originY + pan.y;
    
    // 描画開始位置を計算（画面外からも描画）
    const startX = Math.floor((0 - gridOriginX) / gridSize100mm) * gridSize100mm + gridOriginX;
    const startY = Math.floor((0 - gridOriginY) / gridSize100mm) * gridSize100mm + gridOriginY;
    
    // 細かいグリッド（100mm単位）- ズーム時のみ表示
    if (scale > 0.8) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([]);
      
      // 縦線
      for (let x = startX; x <= w + gridSize100mm; x += gridSize100mm) {
        if (x >= 0 && x <= w) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
      }
      
      // 横線
      for (let y = startY; y <= h + gridSize100mm; y += gridSize100mm) {
        if (y >= 0 && y <= h) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }
    }
    
    // 太いグリッド（500mm単位）
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    
    const start500X = Math.floor((0 - gridOriginX) / gridSize500mm) * gridSize500mm + gridOriginX;
    const start500Y = Math.floor((0 - gridOriginY) / gridSize500mm) * gridSize500mm + gridOriginY;
    
    // 縦線
    for (let x = start500X; x <= w + gridSize500mm; x += gridSize500mm) {
      if (x >= 0 && x <= w) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
    }
    
    // 横線
    for (let y = start500Y; y <= h + gridSize500mm; y += gridSize500mm) {
      if (y >= 0 && y <= h) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }
    
    // 中心線（元の中心点）
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    // 中央の縦線
    if (gridOriginX >= 0 && gridOriginX <= w) {
      ctx.beginPath();
      ctx.moveTo(gridOriginX, 0);
      ctx.lineTo(gridOriginX, h);
      ctx.stroke();
    }
    
    // 中央の横線
    if (gridOriginY >= 0 && gridOriginY <= h) {
      ctx.beginPath();
      ctx.moveTo(0, gridOriginY);
      ctx.lineTo(w, gridOriginY);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  };

  // 全階層を描画（非アクティブ階層は薄く表示）
  const drawAllFloors = (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    scale: number,
    pan: { x: number; y: number }
  ) => {
    floors.forEach(floor => {
      if (floor.id === activeFloorId || floor.vertices.length === 0) return;
      
      const floorNumber = parseInt(floor.id.split('-')[1]) || 1;
      const colors = FLOOR_COLORS[floorNumber] || FLOOR_COLORS[1];
      
      // 非アクティブ階層は薄く表示
      ctx.globalAlpha = 0.4;
      
      drawFloorBuilding(ctx, floor, colors, canvasWidth, canvasHeight, scale, pan);
      
      // 透明度をリセット
      ctx.globalAlpha = 1.0;
    });
  };

  // 指定した階層の建物を描画
  const drawFloorBuilding = (
    ctx: CanvasRenderingContext2D,
    floor: FloorData,
    colors: FloorColors,
    canvasWidth: number,
    canvasHeight: number,
    scale: number,
    pan: { x: number; y: number }
  ) => {
    if (floor.vertices.length < 3) return;

    // ズーム座標変換を計算
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    const scaledVertices = floor.vertices.map(vertex => ({
      x: centerX + (vertex.x - centerX) * scale + pan.x,
      y: centerY + (vertex.y - centerY) * scale + pan.y
    }));

    // 建物ポリゴンを描画
    ctx.strokeStyle = colors.building;
    ctx.lineWidth = 1; // 非アクティブは細い線
    ctx.fillStyle = colors.building + '1A'; // 10%透明度

    ctx.beginPath();
    ctx.moveTo(scaledVertices[0].x, scaledVertices[0].y);
    
    for (let i = 1; i < scaledVertices.length; i++) {
      ctx.lineTo(scaledVertices[i].x, scaledVertices[i].y);
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 軒の出を描画（簡略化）
    if (floor.eaves.length > 0) {
      drawFloorEaves(ctx, floor, colors, scaledVertices, scale);
    }
  };

  // 指定した階層の軒の出を描画
  const drawFloorEaves = (
    ctx: CanvasRenderingContext2D,
    floor: FloorData,
    colors: FloorColors,
    scaledVertices: { x: number; y: number }[],
    scale: number
  ) => {
    // 基準縮尺を計算
    let baseScale = 0.3;
    if (drawingData) {
      const buildingWidthEW = drawingData.building.width;
      const buildingWidthNS = drawingData.building.height;
      const margin = 100;
      const maxCanvasWidth = width - margin * 2;
      const maxCanvasHeight = height - margin * 2;
      const scaleX = maxCanvasWidth / buildingWidthEW;
      const scaleY = maxCanvasHeight / buildingWidthNS;
      baseScale = Math.min(scaleX, scaleY, 0.3);
    }
    const autoScale = baseScale * scale;

    try {
      const offsetLines: Array<{start: {x: number, y: number}, end: {x: number, y: number}}> = [];
      
      for (let i = 0; i < scaledVertices.length; i++) {
        const currentVertex = scaledVertices[i];
        const nextVertex = scaledVertices[(i + 1) % scaledVertices.length];
        const eaveDistance = floor.eaves[i]?.distance || 0;
        
        if (eaveDistance > 0) {
          const edgeX = nextVertex.x - currentVertex.x;
          const edgeY = nextVertex.y - currentVertex.y;
          const edgeLength = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
          
          if (edgeLength > 0) {
            const normalX = edgeY / edgeLength;
            const normalY = -edgeX / edgeLength;
            const canvasOffset = eaveDistance * autoScale;
            
            const offsetStart = {
              x: currentVertex.x + normalX * canvasOffset,
              y: currentVertex.y + normalY * canvasOffset
            };
            const offsetEnd = {
              x: nextVertex.x + normalX * canvasOffset,
              y: nextVertex.y + normalY * canvasOffset
            };
            
            offsetLines.push({ start: offsetStart, end: offsetEnd });
          }
        } else {
          offsetLines.push({ 
            start: { x: currentVertex.x, y: currentVertex.y },
            end: { x: nextVertex.x, y: nextVertex.y }
          });
        }
      }
      
      // 軒の出ポリゴンを描画
      if (offsetLines.length >= 3) {
        ctx.strokeStyle = colors.eaves;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 2]); // 短い破線
        
        ctx.beginPath();
        ctx.moveTo(offsetLines[0].start.x, offsetLines[0].start.y);
        
        for (let i = 0; i < offsetLines.length; i++) {
          ctx.lineTo(offsetLines[i].end.x, offsetLines[i].end.y);
        }
        
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } catch (error) {
      console.error('Floor eave drawing error:', error);
    }
  };

  // 作図モード：全階層を重ね合わせて描画（上階優先）

  // 開口部の寸法を描画する関数
  const drawOpeningDimensions = (
    ctx: CanvasRenderingContext2D,
    scaledVertices: { x: number; y: number }[],
    colors: FloorColors,
    _autoScale: number,
    newDimensionAreas: DimensionArea[]
  ) => {
    // 表示状態の開口部のみ処理
    const visibleOpenings = openings.filter(opening => visibleOpeningDimensions.has(opening.id));
    
    visibleOpenings.forEach(opening => {
      if (opening.edgeIndex >= scaledVertices.length) return;
      
      const current = scaledVertices[opening.edgeIndex];
      const next = scaledVertices[(opening.edgeIndex + 1) % scaledVertices.length];
      
      // 開口部の開始・終了位置を計算
      const openingStart = {
        x: current.x + (next.x - current.x) * opening.startPosition,
        y: current.y + (next.y - current.y) * opening.startPosition
      };
      const openingEnd = {
        x: current.x + (next.x - current.x) * opening.endPosition,
        y: current.y + (next.y - current.y) * opening.endPosition
      };
      
      // 開口部の中点を計算
      const midX = (openingStart.x + openingEnd.x) / 2;
      const midY = (openingStart.y + openingEnd.y) / 2;
      
      // 辺の方向ベクトルと法線ベクトルを計算
      const edgeX = next.x - current.x;
      const edgeY = next.y - current.y;
      const edgeLength = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
      
      if (edgeLength > 0) {
        // 外向きの法線ベクトル
        const normalX = edgeY / edgeLength;
        const normalY = -edgeX / edgeLength;
        
        // 寸法テキストの位置（開口部から少し外側）
        const offset = 25;
        const textX = midX + normalX * offset;
        const textY = midY + normalY * offset;
        
        // 設定された開口部の幅を使用（サイドバーと同期）
        const openingWidthMm = opening.width;
        
        // 寸法線を描画
        ctx.strokeStyle = colors.building;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        
        // 寸法線（開口部の両端から少し伸ばした線）
        const extensionLength = 15;
        const extensionStart = {
          x: openingStart.x + normalX * 5,
          y: openingStart.y + normalY * 5
        };
        const extensionEnd = {
          x: openingEnd.x + normalX * 5,
          y: openingEnd.y + normalY * 5
        };
        
        // 両端の延長線
        ctx.beginPath();
        ctx.moveTo(openingStart.x, openingStart.y);
        ctx.lineTo(extensionStart.x + normalX * extensionLength, extensionStart.y + normalY * extensionLength);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(openingEnd.x, openingEnd.y);
        ctx.lineTo(extensionEnd.x + normalX * extensionLength, extensionEnd.y + normalY * extensionLength);
        ctx.stroke();
        
        // 寸法線本体
        ctx.beginPath();
        ctx.moveTo(extensionStart.x + normalX * extensionLength, extensionStart.y + normalY * extensionLength);
        ctx.lineTo(extensionEnd.x + normalX * extensionLength, extensionEnd.y + normalY * extensionLength);
        ctx.stroke();
        
        ctx.setLineDash([]);
        
        // 寸法テキストを描画
        ctx.fillStyle = colors.building;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 背景を描画（視認性向上）
        const text = `${openingWidthMm.toFixed(0)}mm`;
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const textHeight = 16;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(textX - textWidth/2 - 2, textY - textHeight/2 - 1, textWidth + 4, textHeight + 2);
        
        ctx.strokeStyle = colors.building;
        ctx.lineWidth = 1;
        ctx.strokeRect(textX - textWidth/2 - 2, textY - textHeight/2 - 1, textWidth + 4, textHeight + 2);
        
        // テキストを描画
        ctx.fillStyle = colors.building;
        ctx.fillText(text, textX, textY);
        
        // クリック可能エリアを記録（開口部寸法用）
        newDimensionAreas.push({
          type: 'opening',
          direction: 'width',
          x: textX - textWidth/2 - 2,
          y: textY - textHeight/2 - 1,
          width: textWidth + 4,
          height: textHeight + 2,
          value: opening.width,
          openingId: opening.id
        });
        
        // 開口部の種類も表示
        ctx.font = '10px Arial';
        ctx.fillStyle = colors.eaves;
        ctx.fillText(getOpeningTypeName(opening.type), textX, textY + 15);
      }
    });
  };


  const drawDimensionAreas = (ctx: CanvasRenderingContext2D) => {
    // 寸法エリアを半透明の赤で表示（デバッグ用）
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 1;

    dimensionAreas.forEach(area => {
      ctx.fillRect(area.x, area.y, area.width, area.height);
      ctx.strokeRect(area.x, area.y, area.width, area.height);
    });
  };

  const drawHoveredDimensionArea = (ctx: CanvasRenderingContext2D, area: DimensionArea) => {
    // ホバーした寸法エリアを青色でハイライト
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 2;
    ctx.fillRect(area.x, area.y, area.width, area.height);
    ctx.strokeRect(area.x, area.y, area.width, area.height);
  };

  const drawDragHandles = (ctx: CanvasRenderingContext2D, handles: DragHandle[], hoveredHandle: DragHandle | null) => {
    handles.forEach(handle => {
      const isHovered = hoveredHandle?.id === handle.id;
      const isDragging = draggingHandle?.id === handle.id;
      
      // ハンドルの色を決定
      let fillColor = '#ffffff';
      let strokeColor = handle.type === 'building' ? '#90EE90' : '#FF8C00';
      
      if (isDragging) {
        fillColor = '#3b82f6';
        strokeColor = '#1e40af';
      } else if (isHovered) {
        fillColor = '#e0e7ff';
        strokeColor = '#4f46e5';
      }
      
      // ハンドルを描画（円形）
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, handle.radius, 0, 2 * Math.PI);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 中央に小さい点を描画
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = strokeColor;
      ctx.fill();
    });
  };

  const drawAdvancedBuilding = (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    scale: number,
    pan: { x: number; y: number },
    vertexHandlesOnly = false // 頂点ハンドルのみ描画するフラグ
  ) => {
    if (buildingVertices.length < 3) return;

    const newDimensionAreas: DimensionArea[] = [];
    const newDragHandles: DragHandle[] = [];

    // 基準縮尺を計算（ズーム無関係）
    let baseScale = 0.3; // デフォルト値
    let autoScale = 0.3; // 実際の描画用縮尺（ズーム込み）
    
    if (drawingData) {
      const buildingWidthEW = drawingData.building.width;
      const buildingWidthNS = drawingData.building.height;
      
      const margin = 100;
      const maxCanvasWidth = canvasWidth - margin * 2;
      const maxCanvasHeight = canvasHeight - margin * 2;
      
      const scaleX = maxCanvasWidth / buildingWidthEW;
      const scaleY = maxCanvasHeight / buildingWidthNS;
      baseScale = Math.min(scaleX, scaleY, 0.3); // ズーム無関係の基準縮尺
      autoScale = baseScale * scale; // 描画用縮尺（ズーム込み）
    }

    // 現在の階層番号を取得
    const currentFloorNumber = parseInt(activeFloorId.split('-')[1]) || 1;
    const colors = FLOOR_COLORS[currentFloorNumber] || FLOOR_COLORS[1];

    // 建物頂点をズームに応じて変換
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // ズーム適用後の頂点座標を計算
    const scaledVertices = buildingVertices.map(vertex => ({
      x: centerX + (vertex.x - centerX) * scale + pan.x,
      y: centerY + (vertex.y - centerY) * scale + pan.y
    }));

    // 頂点ハンドルのみモードでない場合は建物を描画
    if (!vertexHandlesOnly) {
      // 建物ポリゴンを描画（ズーム対応、階層カラー適用、開口部対応）
      ctx.lineWidth = 3;
      ctx.fillStyle = colors.building + '33'; // 20%透明度

      // 塗りつぶしのみ先に描画（開口部は影響しない）
      ctx.beginPath();
      ctx.moveTo(scaledVertices[0].x, scaledVertices[0].y);
      for (let i = 1; i < scaledVertices.length; i++) {
        ctx.lineTo(scaledVertices[i].x, scaledVertices[i].y);
      }
      ctx.closePath();
      ctx.fill();

      // 各辺を個別に描画（開口部考慮）
      ctx.strokeStyle = colors.building;
      for (let i = 0; i < scaledVertices.length; i++) {
        const current = scaledVertices[i];
        const next = scaledVertices[(i + 1) % scaledVertices.length];
        
        // この辺の開口部を取得
        const edgeOpenings = openings.filter(opening => opening.edgeIndex === i);
        
        if (edgeOpenings.length === 0) {
          // 開口部がない場合は通常の実線
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.moveTo(current.x, current.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        } else {
          // 開口部がある場合は部分的に描画
          drawEdgeWithOpenings(ctx, current, next, edgeOpenings);
        }
      }
    }

    // 軒の出ポリゴンの頂点を保存する変数
    let eaveVertices: { x: number; y: number }[] = [];

    // 頂点ハンドルのみモードでない場合は軒の出を描画
    if (!vertexHandlesOnly && edgeEaves.length > 0 && edgeEaves.some(edge => edge.distance > 0)) {
      try {
        // 各辺から平行オフセットした線分を計算
        const offsetLines: Array<{start: {x: number, y: number}, end: {x: number, y: number}}> = [];
        
        for (let i = 0; i < scaledVertices.length; i++) {
          const currentVertex = scaledVertices[i];
          const nextVertex = scaledVertices[(i + 1) % scaledVertices.length];
          const eaveDistance = edgeEaves[i]?.distance || 0;
          
          if (eaveDistance > 0) {
            // 辺のベクトルを計算
            const edgeX = nextVertex.x - currentVertex.x;
            const edgeY = nextVertex.y - currentVertex.y;
            const edgeLength = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
            
            if (edgeLength > 0) {
              // 外向きの法線ベクトル（符号を反転）
              const normalX = edgeY / edgeLength;
              const normalY = -edgeX / edgeLength;
              
              // 軒の出距離をピクセルに変換（正しい縮尺を使用）
              const canvasOffset = eaveDistance * autoScale;
              
              // 平行オフセットした線分の始点と終点
              const offsetStart = {
                x: currentVertex.x + normalX * canvasOffset,
                y: currentVertex.y + normalY * canvasOffset
              };
              const offsetEnd = {
                x: nextVertex.x + normalX * canvasOffset,
                y: nextVertex.y + normalY * canvasOffset
              };
              
              offsetLines.push({ start: offsetStart, end: offsetEnd });
            }
          } else {
            // 0mmの場合は元の辺をそのまま使用
            offsetLines.push({ 
              start: { x: currentVertex.x, y: currentVertex.y },
              end: { x: nextVertex.x, y: nextVertex.y }
            });
          }
        }
        
        // 隣接する線分の交点を計算して軒の出の頂点を求める
        for (let i = 0; i < offsetLines.length; i++) {
          const currentLine = offsetLines[i];
          const nextLine = offsetLines[(i + 1) % offsetLines.length];
          
          // 2つの線分の交点を計算
          const intersection = getLineIntersection(
            currentLine.start, currentLine.end,
            nextLine.start, nextLine.end
          );
          
          if (intersection) {
            eaveVertices.push(intersection);
          } else {
            // 交点が見つからない場合は現在の線分の終点を使用
            eaveVertices.push(currentLine.end);
          }
        }
        
        // 軒の出ポリゴンを描画（塗りつぶしなし）
        if (eaveVertices.length >= 3) {
          ctx.strokeStyle = colors.eaves;
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 4]);
          
          ctx.beginPath();
          ctx.moveTo(eaveVertices[0].x, eaveVertices[0].y);
          
          for (let i = 1; i < eaveVertices.length; i++) {
            ctx.lineTo(eaveVertices[i].x, eaveVertices[i].y);
          }
          
          ctx.closePath();
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
      } catch (error) {
        console.error('Advanced mode eave generation error:', error);
      }
    }
    
    
    // 線分の交点を計算する関数
    function getLineIntersection(
      p1: {x: number, y: number}, p2: {x: number, y: number},
      p3: {x: number, y: number}, p4: {x: number, y: number}
    ): {x: number, y: number} | null {
      const d1x = p2.x - p1.x;
      const d1y = p2.y - p1.y;
      const d2x = p4.x - p3.x;
      const d2y = p4.y - p3.y;
      
      const denominator = d1x * d2y - d1y * d2x;
      
      if (Math.abs(denominator) < 1e-10) {
        // 平行線の場合は交点なし
        return null;
      }
      
      const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denominator;
      
      return {
        x: p1.x + t * d1x,
        y: p1.y + t * d1y
      };
    }

    // 頂点ハンドルのみモードでない場合は寸法を描画
    if (!vertexHandlesOnly) {
      // 軒の出線上に寸法を表示（クリック可能）
      edgeEaves.forEach((eave, index) => {
      if (index < scaledVertices.length) {
        const current = scaledVertices[index];
        const next = scaledVertices[(index + 1) % scaledVertices.length];
        
        // 建物の辺の中点を計算
        const buildingMidX = (current.x + next.x) / 2;
        const buildingMidY = (current.y + next.y) / 2;
        
        // 辺のベクトルと法線ベクトルを計算
        const edgeX = next.x - current.x;
        const edgeY = next.y - current.y;
        const edgeLength = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
        
        if (edgeLength > 0) {
          const normalX = edgeY / edgeLength;
          const normalY = -edgeX / edgeLength;
          
          // 軒の出が0mmの場合は建物線の少し外側に表示
          const displayOffset = eave.distance > 0 ? eave.distance * autoScale : 20;
          
          // 寸法表示位置
          const eaveMidX = buildingMidX + normalX * displayOffset;
          const eaveMidY = buildingMidY + normalY * displayOffset;
          
          // 寸法テキストを描画（階層カラー適用）
          ctx.fillStyle = colors.eaves;
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${(eave.distance || 0).toFixed(1)}mm`, eaveMidX, eaveMidY - 5);
          
          // クリック可能エリアを記録
          const eaveTextMetrics = ctx.measureText(`${(eave.distance || 0).toFixed(1)}mm`);
          const eaveTextWidth = eaveTextMetrics.width;
          const eaveTextHeight = 16;
          newDimensionAreas.push({
            type: 'eave',
            direction: `edge-${index}` as any,
            x: eaveMidX - eaveTextWidth / 2,
            y: eaveMidY - eaveTextHeight,
            width: eaveTextWidth,
            height: eaveTextHeight,
            value: eave.distance,
            vertexIndex: index
          });
        }
      }
      });

      // 建物の辺上に寸法を表示（クリック可能）
      buildingVertices.forEach((vertex, index) => {
      const nextVertex = buildingVertices[(index + 1) % buildingVertices.length];
      
      // 辺の長さを計算（ズーム無関係の基準座標で計算）
      const deltaX = nextVertex.x - vertex.x;
      const deltaY = nextVertex.y - vertex.y;
      const pixelLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // ピクセル距離を実際の距離（mm）に変換（基準縮尺を使用）
      let realLength = 0;
      if (drawingData && baseScale > 0) {
        realLength = pixelLength / baseScale;
      }
      
      if (realLength > 10) { // 10mm以上の辺のみ表示
        // 表示位置はズーム済み座標を使用
        const scaledVertex = scaledVertices[index];
        const scaledNextVertex = scaledVertices[(index + 1) % scaledVertices.length];
        const midX = (scaledVertex.x + scaledNextVertex.x) / 2;
        const midY = (scaledVertex.y + scaledNextVertex.y) / 2;
        
        // 辺に垂直なオフセット位置に寸法を表示
        const edgeLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const normalX = -deltaY / edgeLength;
        const normalY = deltaX / edgeLength;
        
        const offsetDistance = 15;
        const labelX = midX + normalX * offsetDistance;
        const labelY = midY + normalY * offsetDistance;
        
        ctx.fillStyle = '#333333';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${realLength.toFixed(1)}mm`, labelX, labelY);
        
        // クリック可能エリアを記録
        const buildingTextMetrics = ctx.measureText(`${realLength.toFixed(1)}mm`);
        const buildingTextWidth = buildingTextMetrics.width;
        const buildingTextHeight = 14;
        newDimensionAreas.push({
          type: 'building',
          direction: `edge-${index}` as any,
          x: labelX - buildingTextWidth / 2,
          y: labelY - buildingTextHeight / 2,
          width: buildingTextWidth,
          height: buildingTextHeight,
          value: realLength,
          vertexIndex: index
        });
      }
      });

      // 開口部の寸法を描画（表示状態の開口部のみ）
      drawOpeningDimensions(ctx, scaledVertices, colors, autoScale, newDimensionAreas);

      // 辺の中点を描画（新しい頂点追加用） - ズーム対応
      for (let i = 0; i < scaledVertices.length; i++) {
      const current = scaledVertices[i];
      const next = scaledVertices[(i + 1) % scaledVertices.length];
      
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      
      ctx.beginPath();
      ctx.arc(midX, midY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#10b981';
      ctx.fill();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1;
      ctx.stroke();
      }
    }

    // 頂点を描画（シンプルなデザイン）
    scaledVertices.forEach((vertex, index) => {
      const radius = 8;
      const isSelected = selectedVertexIndex === index;
      
      // シンプルな円形ハンドル
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? '#3b82f6' : '#ffffff';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#1e40af' : '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    setDimensionAreas(newDimensionAreas);
    setDragHandles(newDragHandles);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.3));
  const handleResetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    
    // Canvas内での実際の座標を計算
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    // パン中の処理（最優先）
    if (isPanning && panStartPos && panStartOffset) {
      console.log('Panning:', { mouseX, mouseY, panStartPos });
      const deltaX = mouseX - panStartPos.x;
      const deltaY = mouseY - panStartPos.y;
      
      setPan({
        x: panStartOffset.x + deltaX,
        y: panStartOffset.y + deltaY
      });
      return;
    }

    // 頂点ドラッグ中の処理
    if (isDragging && tool === 'select') {
      handleDragMove(mouseX, mouseY);
      return;
    }

    // カーソルスタイルを設定
    if (tool === 'pan') {
      canvas.style.cursor = isPanning ? 'grabbing' : 'grab';
    } else if (tool === 'select' && !isPanning) {
      // ズーム座標変換を計算
      const centerX = width / 2;
      const centerY = height / 2;
      const scaledVertices = buildingVertices.map(vertex => ({
        x: centerX + (vertex.x - centerX) * scale + pan.x,
        y: centerY + (vertex.y - centerY) * scale + pan.y
      }));

      // 頂点のホバー検出（ズーム対応）
      const hoveredVertexIndex = scaledVertices.findIndex(vertex => {
        const distance = Math.sqrt(Math.pow(mouseX - vertex.x, 2) + Math.pow(mouseY - vertex.y, 2));
        return distance <= 15; // 頂点サイズと合わせて調整
      });

      // 辺の中点のホバー検出（ズーム対応）
      let hoveredMidpoint = false;
      for (let i = 0; i < scaledVertices.length; i++) {
        const current = scaledVertices[i];
        const next = scaledVertices[(i + 1) % scaledVertices.length];
        
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        
        const distance = Math.sqrt(Math.pow(mouseX - midX, 2) + Math.pow(mouseY - midY, 2));
        if (distance <= 6) {
          hoveredMidpoint = true;
          break;
        }
      }

      // カーソルスタイルを設定
      if (hoveredVertexIndex !== -1 || hoveredMidpoint) {
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'default';
      }
    }
  };

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    console.log('Mouse down:', { tool, mouseX, mouseY });

    // パンツール時またはShift+クリック時
    if (tool === 'pan' || event.shiftKey) {
      console.log('Starting pan');
      setIsPanning(true);
      setPanStartPos({ x: mouseX, y: mouseY });
      setPanStartOffset({ x: pan.x, y: pan.y });
      return;
    }

    // 開口部作成モードの場合
    if (isCreatingOpening && tool === 'select') {
      const edgeClick = detectEdgeClick(mouseX, mouseY);
      
      if (edgeClick) {
        if (!openingStartPoint) {
          // 開始地点を設定
          setOpeningStartPoint(edgeClick);
          console.log('開口部開始地点を設定:', edgeClick);
        } else if (openingStartPoint.edgeIndex === edgeClick.edgeIndex) {
          // 同じ辺での終了地点を設定して開口部を作成
          createOpening(edgeClick.edgeIndex, openingStartPoint.position, edgeClick.position);
        } else {
          // 異なる辺の場合は開始地点をリセット
          setOpeningStartPoint(edgeClick);
          console.log('異なる辺です。開始地点をリセット:', edgeClick);
        }
      }
      return;
    }

    // セレクトツールの場合
    if (tool === 'select') {
      // 寸法エリアのクリック判定（最優先）
      const clickedArea = dimensionAreas.find(area => 
        mouseX >= area.x && mouseX <= area.x + area.width &&
        mouseY >= area.y && mouseY <= area.y + area.height
      );

      if (clickedArea) {
        setEditingDimension(clickedArea);
        setModalValue(clickedArea.value.toFixed(1));
        return;
      }

      // 開口部の点線クリック判定（開口部作成モードでない場合）
      if (!isCreatingOpening) {
        const clickedOpeningId = detectOpeningClick(mouseX, mouseY);
        if (clickedOpeningId) {
          toggleOpeningDimension(clickedOpeningId);
          return;
        }
      }

      // ズーム座標変換を計算
      const centerX = width / 2;
      const centerY = height / 2;
      const scaledVertices = buildingVertices.map(vertex => ({
        x: centerX + (vertex.x - centerX) * scale + pan.x,
        y: centerY + (vertex.y - centerY) * scale + pan.y
      }));

      // 頂点クリック判定（ズーム対応）
      const clickedVertexIndex = scaledVertices.findIndex(vertex => {
        const distance = Math.sqrt(Math.pow(mouseX - vertex.x, 2) + Math.pow(mouseY - vertex.y, 2));
        return distance <= 15; // 頂点サイズと合わせて調整
      });

      if (clickedVertexIndex !== -1) {
        setSelectedVertexIndex(clickedVertexIndex);
        setDragStartPos({ x: mouseX, y: mouseY });
        setIsDragging(true);
        return;
      }

      // 辺の中点クリック判定（頂点追加）
      for (let i = 0; i < scaledVertices.length; i++) {
        const current = scaledVertices[i];
        const next = scaledVertices[(i + 1) % scaledVertices.length];
        
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        
        const distance = Math.sqrt(Math.pow(mouseX - midX, 2) + Math.pow(mouseY - midY, 2));
        if (distance <= 6) {
          const realMidX = (midX - pan.x - centerX) / scale + centerX;
          const realMidY = (midY - pan.y - centerY) / scale + centerY;
          addVertex(realMidX, realMidY, i);
          return;
        }
      }

      // 空の場所をクリック - 選択解除
      setSelectedVertexIndex(null);
    }
  };

  const handleCanvasMouseUp = (_event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('Mouse up:', { isDragging, isPanning });
    
    if (isDragging) {
      handleDragEnd();
    }
    
    if (isPanning) {
      console.log('Ending pan');
      setIsPanning(false);
      setPanStartPos(null);
      setPanStartOffset(null);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    // 寸法エリアのクリック判定
    const clickedArea = dimensionAreas.find(area => 
      mouseX >= area.x && mouseX <= area.x + area.width &&
      mouseY >= area.y && mouseY <= area.y + area.height
    );

    if (clickedArea) {
      setEditingDimension(clickedArea);
      setModalValue(clickedArea.value.toFixed(1));
    }
  };

  const validateInput = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      return '0以上の有効な数値を入力してください';
    }
    if (editingDimension?.type === 'building' && numValue < 100) {
      return '建物寸法は100mm以上で入力してください';
    }
    if (editingDimension?.type === 'eave' && numValue > 5000) {
      return '軒の出は5000mm以下で入力してください';
    }
    if (editingDimension?.type === 'opening' && (numValue < 100 || numValue > 5000)) {
      return '開口部寸法は100mm以上5000mm以下で入力してください';
    }
    return '';
  };

  const handleModalInputChange = (value: string) => {
    setModalValue(value);
    setValidationError(validateInput(value));
  };

  const handleModalSave = () => {
    const newValue = parseFloat(modalValue);
    const error = validateInput(modalValue);
    
    if (error) {
      setValidationError(error);
      return;
    }

    if (!editingDimension) return;

    if (editingDimension.type === 'eave' && editingDimension.direction.startsWith('edge-')) {
      // 辺ごとの軒の出編集
      const edgeIndex = parseInt(editingDimension.direction.replace('edge-', ''));
      updateEdgeEaveDistance(edgeIndex, newValue);
    } else if (editingDimension.type === 'building' && editingDimension.direction.startsWith('edge-')) {
      // 建物の辺の長さ編集 - 頂点を移動して辺の長さを調整
      const edgeIndex = parseInt(editingDimension.direction.replace('edge-', ''));
      if (edgeIndex < buildingVertices.length) {
        const currentVertex = buildingVertices[edgeIndex];
        const nextVertex = buildingVertices[(edgeIndex + 1) % buildingVertices.length];
        
        // 現在の辺の方向ベクトルを正規化
        const deltaX = nextVertex.x - currentVertex.x;
        const deltaY = nextVertex.y - currentVertex.y;
        const currentLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (currentLength > 0 && drawingData) {
          // 基準縮尺を計算（ズーム無関係）
          const buildingWidthEW = drawingData.building.width;
          const buildingWidthNS = drawingData.building.height;
          const margin = 100;
          const maxCanvasWidth = width - margin * 2;
          const maxCanvasHeight = height - margin * 2;
          const scaleX = maxCanvasWidth / buildingWidthEW;
          const scaleY = maxCanvasHeight / buildingWidthNS;
          const baseScale = Math.min(scaleX, scaleY, 0.3);
          
          // 新しい長さをピクセルに変換（基準縮尺を使用）
          const newPixelLength = newValue * baseScale;
          const scale_factor = newPixelLength / currentLength;
          
          // 次の頂点を正確な位置に移動（グリッド吸着なし）
          const newNextX = currentVertex.x + deltaX * scale_factor;
          const newNextY = currentVertex.y + deltaY * scale_factor;
          
          setBuildingVertices(prev => prev.map((vertex, i) => 
            i === (edgeIndex + 1) % buildingVertices.length 
              ? { ...vertex, x: newNextX, y: newNextY } 
              : vertex
          ));
        }
      }
    } else if (editingDimension.type === 'building' && drawingData) {
      // 従来の建物全体寸法編集
      const updatedData = { ...drawingData };
      
      if (editingDimension.direction === 'width') {
        updatedData.building.width = newValue;
      } else if (editingDimension.direction === 'height') {
        updatedData.building.height = newValue;
      }
      
      setDrawingData(updatedData);
      sessionStorage.setItem('drawingData', JSON.stringify(updatedData));
    } else if (editingDimension.type === 'eave' && drawingData) {
      // 従来の軒の出編集
      const updatedData = { ...drawingData };
      updatedData.eaves[editingDimension.direction as keyof typeof updatedData.eaves] = newValue;
      setDrawingData(updatedData);
      sessionStorage.setItem('drawingData', JSON.stringify(updatedData));
    } else if (editingDimension.type === 'opening' && editingDimension.openingId) {
      // 開口部寸法編集
      const openingId = editingDimension.openingId;
      
      // 辺の長さを計算して新しい位置を決定
      const targetOpening = openings.find(o => o.id === openingId);
      if (targetOpening && targetOpening.edgeIndex < buildingVertices.length) {
        const currentVertex = buildingVertices[targetOpening.edgeIndex];
        const nextVertex = buildingVertices[(targetOpening.edgeIndex + 1) % buildingVertices.length];
        
        // 辺の長さを計算（ピクセル単位）
        const edgeLength = Math.sqrt(
          Math.pow(nextVertex.x - currentVertex.x, 2) + 
          Math.pow(nextVertex.y - currentVertex.y, 2)
        );
        
        // 基準縮尺を計算
        let baseScale = 0.3;
        if (drawingData) {
          const buildingWidthEW = drawingData.building.width;
          const buildingWidthNS = drawingData.building.height;
          const margin = 100;
          const maxCanvasWidth = width - margin * 2;
          const maxCanvasHeight = height - margin * 2;
          const scaleX = maxCanvasWidth / buildingWidthEW;
          const scaleY = maxCanvasHeight / buildingWidthNS;
          baseScale = Math.min(scaleX, scaleY, 0.3);
        }
        
        // 実際の辺の長さ（mm）
        const realEdgeLength = edgeLength / baseScale;
        
        // 新しい幅の比率を計算
        const newWidthRatio = newValue / realEdgeLength;
        
        // 現在の中央位置を維持
        const currentCenter = (targetOpening.startPosition + targetOpening.endPosition) / 2;
        
        // 新しい開始・終了位置を計算
        const newStartPosition = Math.max(0, currentCenter - newWidthRatio / 2);
        const newEndPosition = Math.min(1, currentCenter + newWidthRatio / 2);
        
        // 位置が範囲外の場合は調整
        let adjustedStart = newStartPosition;
        let adjustedEnd = newEndPosition;
        
        if (newEndPosition > 1) {
          adjustedEnd = 1;
          adjustedStart = Math.max(0, 1 - newWidthRatio);
        } else if (newStartPosition < 0) {
          adjustedStart = 0;
          adjustedEnd = Math.min(1, newWidthRatio);
        }
        
        setOpenings(prev => prev.map(opening => 
          opening.id === openingId 
            ? { 
                ...opening, 
                width: newValue,
                startPosition: adjustedStart,
                endPosition: adjustedEnd
              }
            : opening
        ));
        
        // 現在のフロアデータも更新
        const currentFloor = floors.find(floor => floor.id === activeFloorId);
        if (currentFloor) {
          setFloors(prev => prev.map(floor => 
            floor.id === activeFloorId 
              ? { 
                  ...floor, 
                  openings: floor.openings.map(opening => 
                    opening.id === openingId 
                      ? { 
                          ...opening, 
                          width: newValue,
                          startPosition: adjustedStart,
                          endPosition: adjustedEnd
                        }
                      : opening
                  )
                }
              : floor
          ));
        }
      }
    }

    // モーダルを閉じる
    setEditingDimension(null);
    setModalValue('');
  };

  const handleModalCancel = () => {
    setEditingDimension(null);
    setModalValue('');
    setValidationError('');
  };

  const handleDragMove = (mouseX: number, mouseY: number) => {
    if (!isDragging || !dragStartPos) return;

    // 頂点ドラッグ（常にグリッド吸着）（ズーム対応）
    if (selectedVertexIndex !== null) {
      // マウス座標をズーム前の座標系に逆変換
      const centerX = width / 2;
      const centerY = height / 2;
      const realMouseX = (mouseX - pan.x - centerX) / scale + centerX;
      const realMouseY = (mouseY - pan.y - centerY) / scale + centerY;
      
      updateVertexPosition(selectedVertexIndex, realMouseX, realMouseY);
      return;
    }

  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStartPos(null);
    // 頂点選択は維持
  };

  // === 高度計算関連の関数 ===

  // 簡易計算結果をセッションから取得
  const getSimpleCalculationResult = () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const savedResult = sessionStorage.getItem('scaffoldCalculationResult');
      const savedInput = sessionStorage.getItem('scaffoldInputData');
      
      if (!savedResult || !savedInput) {
        console.warn('簡易計算結果がセッションに見つかりません');
        return null;
      }
      
      return {
        result: JSON.parse(savedResult),
        input: JSON.parse(savedInput)
      };
    } catch (error) {
      console.error('簡易計算結果の読み込みエラー:', error);
      return null;
    }
  };

  // 高度計算実行の前提条件チェック
  const canExecuteAdvancedCalculation = (): { canExecute: boolean; errorMessage?: string } => {
    // 建物頂点が3点以上あるかチェック
    if (buildingVertices.length < 3) {
      return { canExecute: false, errorMessage: '建物の頂点が3点以上必要です' };
    }
    
    // 簡易計算結果があるかチェック
    const simpleResult = getSimpleCalculationResult();
    if (!simpleResult) {
      return { canExecute: false, errorMessage: '先に簡易計算を実行してください' };
    }
    
    return { canExecute: true };
  };

  // 高度計算メイン関数（仮実装）
  const executeAdvancedCalculation = async () => {
    const validation = canExecuteAdvancedCalculation();
    if (!validation.canExecute) {
      alert(validation.errorMessage);
      return;
    }

    setIsAdvancedCalculating(true);
    
    try {
      console.log('高度計算を開始します...');
      console.log('建物頂点:', buildingVertices);
      console.log('軒の出:', edgeEaves);
      
      const simpleResult = getSimpleCalculationResult();
      console.log('簡易計算結果:', simpleResult);
      
      // Phase 2で実装予定の計算ロジック
      // TODO: 実際の計算処理を実装
      
      // 仮の結果
      const dummyResult: AdvancedCalculationSummary = {
        success: true,
        calculatedEdges: [],
        scaffoldLine: null,
        totalErrors: []
      };
      
      setAdvancedCalculationResult(dummyResult);
      console.log('高度計算完了');
      
    } catch (error) {
      console.error('高度計算エラー:', error);
      alert('高度計算中にエラーが発生しました');
    } finally {
      setIsAdvancedCalculating(false);
    }
  };



  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sliderStyle }} />
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
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
          <span className={`text-xs ${showGrid ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
            グリッド: {showGrid ? 'ON' : 'OFF'}
          </span>
        </div>

        {/* キャンバス */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onClick={handleCanvasClick}
            className={`block ${
              isPanning ? 'cursor-grabbing' : 
              isDragging ? 'cursor-grabbing' : 
              (tool === 'pan' ? 'cursor-grab' : 
              (hoveredHandle ? 'cursor-grab' : 'cursor-default'))
            }`}
            style={{ 
              width: '100%',
              height: '100%',
              background: '#fafafa',
              display: 'block'
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
            {/* 高度計算セクション */}
            <div className="mb-6">
              <button
                onClick={executeAdvancedCalculation}
                disabled={isAdvancedCalculating}
                className={`w-full p-3 rounded-lg font-medium transition-colors ${
                  isAdvancedCalculating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isAdvancedCalculating ? '計算中...' : '🔧 高度計算'}
              </button>
              
              {/* 足場ライン表示切り替え */}
              {scaffoldLineData && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="scaffold-line-toggle"
                    checked={showScaffoldLine}
                    onChange={(e) => setShowScaffoldLine(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="scaffold-line-toggle" className="text-sm text-slate-700 dark:text-slate-300">
                    足場ライン表示
                  </label>
                </div>
              )}
              
              {/* 計算結果の簡易表示 */}
              {advancedCalculationResult && (
                <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs">
                  <div className="text-slate-600 dark:text-slate-400">
                    計算結果: {advancedCalculationResult.success ? '✅ 成功' : '❌ 失敗'}
                  </div>
                  {advancedCalculationResult.calculatedEdges.length > 0 && (
                    <div className="text-slate-600 dark:text-slate-400">
                      処理済み辺: {advancedCalculationResult.calculatedEdges.length}件
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 階層管理 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">階層管理</h3>
              <div className="space-y-3">
                {/* 作図モード切り替え */}
                <div className="flex gap-2">
                  <button
                    onClick={addNewFloor}
                    className="flex-1 p-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    階層を追加
                  </button>
                  
                  <button
                    onClick={() => setIsCompositeMode(!isCompositeMode)}
                    className={`flex-1 p-2 text-sm rounded transition-colors ${
                      isCompositeMode
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isCompositeMode ? '編集モード' : '作図モード'}
                  </button>
                </div>
                
                {/* ドラッグ&ドロップ説明 */}
                {floors.length > 1 && (
                  <div className="text-xs text-slate-500 bg-slate-50 rounded p-2">
                    💡 階層タブをドラッグ&ドロップで建物形状をコピーできます
                  </div>
                )}
                
                {/* 階層タブ */}
                <div className="flex flex-wrap gap-1">
                  {floors.map((floor) => {
                    const floorNumber = parseInt(floor.id.split('-')[1]) || 1;
                    const colorSet = FLOOR_COLORS[floorNumber] || FLOOR_COLORS[1];
                    const isActive = floor.id === activeFloorId;
                    const isDragTarget = dropTargetFloorId === floor.id;
                    const isDragging = draggedFloorId === floor.id;
                    
                    return (
                      <button
                        key={floor.id}
                        draggable={floor.vertices.length > 0} // 頂点がある場合のみドラッグ可能
                        onClick={() => switchFloor(floor.id)}
                        onDragStart={(e) => handleDragStart(e, floor.id)}
                        onDragOver={(e) => handleDragOver(e, floor.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, floor.id)}
                        onDragEnd={handleFloorDragEnd}
                        className={`px-3 py-1 text-xs rounded transition-all duration-200 flex items-center gap-1 ${
                          isDragTarget
                            ? 'bg-blue-200 text-blue-800 border-2 border-blue-400 border-dashed'
                            : isDragging
                            ? 'bg-slate-300 text-slate-500 opacity-50'
                            : isActive
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        } ${floor.vertices.length > 0 ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                        title={floor.vertices.length > 0 ? `${floor.name}をドラッグして他の階層にコピー` : `${floor.name}に切り替え`}
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colorSet.building }}
                        />
                        {floor.name}
                        {isDragTarget && (
                          <span className="ml-1 text-blue-600">📋</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 頂点操作 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">頂点操作</h3>
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  頂点: {buildingVertices.length}個
                </p>
                {selectedVertexIndex !== null && (
                  <button
                    onClick={() => deleteVertex(selectedVertexIndex)}
                    className="w-full p-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    選択した頂点を削除
                  </button>
                )}
              </div>
            </div>

            {/* 軒の出調整 */}
            {edgeEaves.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setIsEavesCollapsed(!isEavesCollapsed)}
                  className="w-full flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  <h3 className="text-sm font-medium">軒の出調整</h3>
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${isEavesCollapsed ? 'rotate-180' : ''}`}
                  />
                </button>
                {!isEavesCollapsed && (
                  <div className="space-y-4 mt-3">
                  {edgeEaves.map((eave, index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        辺 {index + 1} の軒の出 ({(eave.distance || 0).toFixed(1)}mm)
                      </label>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          step="10"
                          value={eave.distance}
                          onChange={(e) => updateEdgeEaveDistance(index, parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="2000"
                            step="0.1"
                            value={(eave.distance || 0).toFixed(1)}
                            onChange={(e) => updateEdgeEaveDistance(index, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                          />
                          <span className="text-xs text-slate-500">mm</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const avgDistance = edgeEaves.reduce((sum, edge) => sum + edge.distance, 0) / edgeEaves.length;
                      edgeEaves.forEach((_, index) => {
                        updateEdgeEaveDistance(index, avgDistance);
                      });
                    }}
                    className="w-full p-2 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                  >
                    全辺を平均値に統一
                  </button>
                  </div>
                )}
              </div>
            )}

            {/* 開口部管理 */}
            {!isCompositeMode && (
              <div className="mb-6">
                <button
                  onClick={() => setIsOpeningsCollapsed(!isOpeningsCollapsed)}
                  className="w-full flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                >
                  <h3 className="text-sm font-medium">
                    開口部管理
                    {isCreatingOpening && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">作成中</span>
                    )}
                  </h3>
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${(isOpeningsCollapsed && !isCreatingOpening) ? 'rotate-180' : ''}`}
                  />
                </button>
                {(!isOpeningsCollapsed || isCreatingOpening) && (
                  <div className="space-y-4 mt-3">
                  {/* 開口部の種類選択 */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      開口部の種類
                    </label>
                    <select
                      value={openingType}
                      onChange={(e) => handleOpeningTypeChange(e.target.value as typeof openingType)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option value="entrance">🚪 玄関 (900mm)</option>
                      <option value="back_door">🚪 勝手口 (800mm)</option>
                      <option value="sliding_window">🪟 掃出し窓 (1800mm)</option>
                      <option value="garage">🚗 ガレージ (2500mm)</option>
                      <option value="passage">🚶 通路 (1200mm)</option>
                    </select>
                    <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded p-2">
                      選択: {getOpeningTypeName(openingType)} (デフォルト: {getDefaultOpeningWidth(openingType)}mm)
                    </div>
                  </div>


                  {/* 開口部作成ボタン */}
                  <button
                    onClick={() => {
                      setIsCreatingOpening(!isCreatingOpening);
                      if (isCreatingOpening) {
                        setOpeningStartPoint(null); // キャンセル時は開始地点もリセット
                      }
                    }}
                    className={`w-full p-2 text-sm rounded transition-colors ${
                      isCreatingOpening
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {isCreatingOpening ? '開口部作成キャンセル' : '開口部を作成'}
                  </button>

                  {/* 作成中の説明 */}
                  {isCreatingOpening && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded p-2">
                      💡 {getOpeningTypeName(openingType)}を作成中<br/>
                      建物の辺をクリックして開始地点と終了地点を指定してください
                      {openingStartPoint && (
                        <div className="mt-1 text-blue-600 dark:text-blue-400">
                          📍 開始地点設定済み (辺{openingStartPoint.edgeIndex + 1})
                        </div>
                      )}
                    </div>
                  )}

                  {/* 開口部リスト */}
                  {openings.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        作成済み開口部 ({openings.length}個)
                      </label>
                      <div className="space-y-1">
                        {openings.map((opening, _index) => (
                          <div key={opening.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs">
                            <span className="text-slate-700 dark:text-slate-300">
                              辺{opening.edgeIndex + 1} - {opening.width}mm {getOpeningTypeName(opening.type)}
                            </span>
                            <button
                              onClick={() => {
                                setOpenings(prev => prev.filter(o => o.id !== opening.id));
                              }}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              削除
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 寸法編集モーダル */}
      {editingDimension && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              {editingDimension.type === 'building' ? '建物寸法' : 
               editingDimension.type === 'opening' ? '開口部寸法' : '軒の出'} - {
                editingDimension.type === 'building' 
                  ? (editingDimension.direction === 'width' ? '東西' : '南北')
                  : editingDimension.type === 'opening'
                    ? '幅'
                    : { north: '北', east: '東', south: '南', west: '西' }[editingDimension.direction as 'north' | 'east' | 'south' | 'west']
              }
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                新しい値を入力してください
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={modalValue}
                  onChange={(e) => handleModalInputChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:border-transparent ${
                    validationError 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                  }`}
                  placeholder="寸法を入力"
                  autoFocus
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  mm
                </span>
              </div>
              {validationError ? (
                <p className="text-xs text-red-500 mt-1">
                  {validationError}
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-1">
                  現在の値: {editingDimension.value}mm
                </p>
              )}
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleModalCancel}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleModalSave}
                disabled={!!validationError}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  validationError
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                更新
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}