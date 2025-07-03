'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Edit3, Square, Move, ZoomIn, ZoomOut, Grid, Save, Undo, Redo, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

// React-Konvaコンポーネントを動的インポート
const Stage = dynamic(() => import('react-konva').then(mod => ({ default: mod.Stage })), { ssr: false });
const Layer = dynamic(() => import('react-konva').then(mod => ({ default: mod.Layer })), { ssr: false });
const Line = dynamic(() => import('react-konva').then(mod => ({ default: mod.Line })), { ssr: false });
const Circle = dynamic(() => import('react-konva').then(mod => ({ default: mod.Circle })), { ssr: false });
const Text = dynamic(() => import('react-konva').then(mod => ({ default: mod.Text })), { ssr: false });
const Group = dynamic(() => import('react-konva').then(mod => ({ default: mod.Group })), { ssr: false });

// @ts-ignore
import * as ClipperLib from 'clipper-lib';

interface Point {
  x: number;
  y: number;
}

interface Vertex extends Point {
  id: string;
}

interface Edge {
  start: Vertex;
  end: Vertex;
  eaveDistance: number;
}

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

interface KonvaDrawingEditorProps {
  width?: number;
  height?: number;
}

export default function KonvaDrawingEditor({ 
  width = 1000, 
  height = 700 
}: KonvaDrawingEditorProps) {
  const stageRef = useRef<any>(null);
  const [vertices, setVertices] = useState<Vertex[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [tool, setTool] = useState<'select' | 'addVertex' | 'pan'>('select');
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [selectedVertex, setSelectedVertex] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [editingEaveDistance, setEditingEaveDistance] = useState<Edge | null>(null);
  const [modalValue, setModalValue] = useState<string>('');
  const [showEaves, setShowEaves] = useState(true);
  const [globalEaveDistance, setGlobalEaveDistance] = useState(500);
  const [mounted, setMounted] = useState(false);

  // クライアントサイドでのみレンダリング
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // セッションストレージから簡易計算データを読み込み
    if (typeof window !== 'undefined') {
      const savedDrawingData = sessionStorage.getItem('drawingData');
      if (savedDrawingData) {
        try {
          const data: DrawingData = JSON.parse(savedDrawingData);
          initializeBuildingFromData(data);
          console.log('計算機からのデータを読み込みました:', data);
        } catch (error) {
          console.error('データ読み込みエラー:', error);
        }
      } else {
        // デフォルトの四角形を作成
        createDefaultBuilding();
      }
    }
  }, []);

  const initializeBuildingFromData = (data: DrawingData) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const buildingWidth = Math.min(data.building.width * 0.3, 200);
    const buildingHeight = Math.min(data.building.height * 0.3, 200);

    const newVertices: Vertex[] = [
      { id: 'v1', x: centerX - buildingWidth / 2, y: centerY - buildingHeight / 2 },
      { id: 'v2', x: centerX + buildingWidth / 2, y: centerY - buildingHeight / 2 },
      { id: 'v3', x: centerX + buildingWidth / 2, y: centerY + buildingHeight / 2 },
      { id: 'v4', x: centerX - buildingWidth / 2, y: centerY + buildingHeight / 2 }
    ];

    const newEdges: Edge[] = [
      { start: newVertices[0], end: newVertices[1], eaveDistance: data.eaves.north },
      { start: newVertices[1], end: newVertices[2], eaveDistance: data.eaves.east },
      { start: newVertices[2], end: newVertices[3], eaveDistance: data.eaves.south },
      { start: newVertices[3], end: newVertices[0], eaveDistance: data.eaves.west }
    ];

    setVertices(newVertices);
    setEdges(newEdges);
  };

  const createDefaultBuilding = () => {
    const centerX = width / 2;
    const centerY = height / 2;
    const buildingSize = 150;

    const newVertices: Vertex[] = [
      { id: 'v1', x: centerX - buildingSize, y: centerY - buildingSize },
      { id: 'v2', x: centerX + buildingSize, y: centerY - buildingSize },
      { id: 'v3', x: centerX + buildingSize, y: centerY + buildingSize },
      { id: 'v4', x: centerX - buildingSize, y: centerY + buildingSize }
    ];

    const newEdges: Edge[] = [
      { start: newVertices[0], end: newVertices[1], eaveDistance: 500 },
      { start: newVertices[1], end: newVertices[2], eaveDistance: 500 },
      { start: newVertices[2], end: newVertices[3], eaveDistance: 500 },
      { start: newVertices[3], end: newVertices[0], eaveDistance: 500 }
    ];

    setVertices(newVertices);
    setEdges(newEdges);
  };

  const generateEavesPolygon = () => {
    if (vertices.length < 3) return [];

    try {
      // 建物の多角形をClipper.jsの形式に変換
      const buildingPath = vertices.map(v => ({ X: v.x * 1000, Y: v.y * 1000 }));
      
      const clipper = new ClipperLib.ClipperOffset();
      const solution = new ClipperLib.Paths();
      
      // 各辺の軒の出距離の平均を使用（簡易実装）
      const avgEaveDistance = edges.reduce((sum, edge) => sum + edge.eaveDistance, 0) / edges.length;
      const offsetDistance = avgEaveDistance * 1000; // mm to clipper units
      
      clipper.AddPath(buildingPath, ClipperLib.JoinType.jtSquare, ClipperLib.EndType.etClosedPolygon);
      clipper.Execute(solution, offsetDistance);
      
      if (solution.length > 0) {
        return solution[0].map((point: any) => ({
          x: point.X / 1000,
          y: point.Y / 1000
        }));
      }
    } catch (error) {
      console.error('軒の出生成エラー:', error);
    }
    
    return [];
  };

  const addVertex = (x: number, y: number) => {
    const newVertex: Vertex = {
      id: `v${Date.now()}`,
      x: x - position.x,
      y: y - position.y
    };
    
    setVertices(prev => [...prev, newVertex]);
    
    // 最初の辺の場合、最後の頂点と接続
    if (vertices.length > 0) {
      const lastVertex = vertices[vertices.length - 1];
      const newEdge: Edge = {
        start: lastVertex,
        end: newVertex,
        eaveDistance: globalEaveDistance
      };
      setEdges(prev => [...prev, newEdge]);
    }
  };

  const deleteVertex = (vertexId: string) => {
    setVertices(prev => prev.filter(v => v.id !== vertexId));
    setEdges(prev => prev.filter(e => e.start.id !== vertexId && e.end.id !== vertexId));
    setSelectedVertex(null);
  };

  const updateVertexPosition = (vertexId: string, newX: number, newY: number) => {
    setVertices(prev => prev.map(v => 
      v.id === vertexId ? { ...v, x: newX, y: newY } : v
    ));
    
    // 関連する辺も更新
    setEdges(prev => prev.map(edge => ({
      ...edge,
      start: edge.start.id === vertexId ? { ...edge.start, x: newX, y: newY } : edge.start,
      end: edge.end.id === vertexId ? { ...edge.end, x: newX, y: newY } : edge.end
    })));
  };

  const updateEaveDistance = (edge: Edge, distance: number) => {
    setEdges(prev => prev.map(e => 
      e.start.id === edge.start.id && e.end.id === edge.end.id 
        ? { ...e, eaveDistance: distance }
        : e
    ));
  };

  const generateAllEaves = () => {
    setEdges(prev => prev.map(edge => ({
      ...edge,
      eaveDistance: globalEaveDistance
    })));
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.3));
  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleStageClick = (e: any) => {
    if (tool === 'addVertex') {
      const pos = e.target.getStage().getPointerPosition();
      addVertex(pos.x, pos.y);
    } else if (tool === 'select') {
      // 空の場所をクリックした場合、選択を解除
      if (e.target === e.target.getStage()) {
        setSelectedVertex(null);
        setSelectedEdge(null);
      }
    }
  };

  const handleVertexDragEnd = (vertexId: string, e: any) => {
    const newPos = e.target.position();
    updateVertexPosition(vertexId, newPos.x, newPos.y);
  };

  const handleEdgeClick = (edge: Edge) => {
    setSelectedEdge(edge);
    setEditingEaveDistance(edge);
    setModalValue(edge.eaveDistance.toString());
  };

  const handleModalSave = () => {
    if (!editingEaveDistance) return;
    
    const newDistance = parseInt(modalValue);
    if (!isNaN(newDistance) && newDistance >= 0) {
      updateEaveDistance(editingEaveDistance, newDistance);
    }
    
    setEditingEaveDistance(null);
    setModalValue('');
  };

  const handleModalCancel = () => {
    setEditingEaveDistance(null);
    setModalValue('');
  };

  const eavesPolygon = generateEavesPolygon();

  // SSR中は何も表示しない
  if (!mounted) {
    return <div className="flex h-full items-center justify-center">読み込み中...</div>;
  }

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
          onClick={() => setTool('addVertex')}
          className={`p-3 rounded-lg transition-colors ${
            tool === 'addVertex' 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
              : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          title="頂点追加"
        >
          <Plus className="w-5 h-5" />
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
          <span className="text-sm font-medium">React-Konva 作図エディタ</span>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
          <span className="text-xs text-slate-500">スケール: {(scale * 100).toFixed(0)}%</span>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-600" />
          <span className="text-xs text-emerald-600 dark:text-emerald-400">
            頂点: {vertices.length}個 | 辺: {edges.length}個
          </span>
        </div>

        {/* キャンバス */}
        <div className="flex-1 relative overflow-hidden">
          <Stage
            ref={stageRef}
            width={width}
            height={height}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            draggable={tool === 'pan'}
            onDragEnd={(e) => setPosition(e.target.position())}
            onClick={handleStageClick}
            style={{ backgroundColor: '#fafafa' }}
          >
            <Layer>
              {/* グリッド */}
              {showGrid && (
                <Group>
                  {Array.from({ length: Math.ceil(width / (50 * scale)) + 1 }, (_, i) => (
                    <Line
                      key={`grid-v-${i}`}
                      points={[i * 50, 0, i * 50, height]}
                      stroke="#e2e8f0"
                      strokeWidth={0.5 / scale}
                    />
                  ))}
                  {Array.from({ length: Math.ceil(height / (50 * scale)) + 1 }, (_, i) => (
                    <Line
                      key={`grid-h-${i}`}
                      points={[0, i * 50, width, i * 50]}
                      stroke="#e2e8f0"
                      strokeWidth={0.5 / scale}
                    />
                  ))}
                </Group>
              )}

              {/* 軒の出ポリゴン */}
              {showEaves && eavesPolygon.length > 0 && (
                <Line
                  points={eavesPolygon.flatMap((p: {x: number, y: number}) => [p.x, p.y])}
                  closed
                  stroke="#FF8C00"
                  strokeWidth={2 / scale}
                  dash={[8 / scale, 4 / scale]}
                  fill="rgba(255, 140, 0, 0.1)"
                />
              )}

              {/* 建物のポリゴン */}
              {vertices.length > 2 && (
                <Line
                  points={vertices.flatMap(v => [v.x, v.y])}
                  closed
                  stroke="#90EE90"
                  strokeWidth={3 / scale}
                  fill="rgba(144, 238, 144, 0.2)"
                />
              )}

              {/* 辺 */}
              {edges.map((edge, index) => (
                <Group key={`edge-${index}`}>
                  <Line
                    points={[edge.start.x, edge.start.y, edge.end.x, edge.end.y]}
                    stroke={selectedEdge === edge ? "#3b82f6" : "#90EE90"}
                    strokeWidth={selectedEdge === edge ? 4 / scale : 3 / scale}
                    onClick={() => handleEdgeClick(edge)}
                  />
                  {/* 辺の中点に軒の出距離を表示 */}
                  <Text
                    x={(edge.start.x + edge.end.x) / 2}
                    y={(edge.start.y + edge.end.y) / 2 - 10 / scale}
                    text={`${edge.eaveDistance}mm`}
                    fontSize={12 / scale}
                    fill="#FF8C00"
                    align="center"
                    onClick={() => handleEdgeClick(edge)}
                  />
                </Group>
              ))}

              {/* 頂点 */}
              {vertices.map((vertex) => (
                <Circle
                  key={vertex.id}
                  x={vertex.x}
                  y={vertex.y}
                  radius={8 / scale}
                  fill={selectedVertex === vertex.id ? "#3b82f6" : "#ffffff"}
                  stroke={selectedVertex === vertex.id ? "#1e40af" : "#90EE90"}
                  strokeWidth={2 / scale}
                  draggable={tool === 'select'}
                  onClick={() => setSelectedVertex(vertex.id)}
                  onDragEnd={(e) => handleVertexDragEnd(vertex.id, e)}
                />
              ))}
            </Layer>
          </Stage>
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
          <div className="p-4 space-y-6">
            {/* 頂点操作 */}
            <div>
              <h3 className="text-sm font-medium mb-3">頂点操作</h3>
              <div className="space-y-2">
                {selectedVertex && (
                  <button
                    onClick={() => deleteVertex(selectedVertex)}
                    className="w-full p-2 text-left text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    選択した頂点を削除
                  </button>
                )}
                <p className="text-xs text-slate-500">
                  {selectedVertex 
                    ? `頂点 ${selectedVertex} を選択中` 
                    : '頂点をクリックして選択してください'
                  }
                </p>
              </div>
            </div>

            {/* 軒の出操作 */}
            <div>
              <h3 className="text-sm font-medium mb-3">軒の出操作</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    一括軒の出距離 (mm)
                  </label>
                  <input
                    type="number"
                    value={globalEaveDistance}
                    onChange={(e) => setGlobalEaveDistance(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded text-sm"
                    min="0"
                    max="5000"
                  />
                </div>
                <button
                  onClick={generateAllEaves}
                  className="w-full p-2 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                >
                  軒の出一括生成
                </button>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showEaves"
                    checked={showEaves}
                    onChange={(e) => setShowEaves(e.target.checked)}
                  />
                  <label htmlFor="showEaves" className="text-sm">
                    軒の出を表示
                  </label>
                </div>
              </div>
            </div>

            {/* 現在の状態 */}
            <div>
              <h3 className="text-sm font-medium mb-3">現在の状態</h3>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
                <div className="text-xs">
                  <span className="font-medium">頂点数:</span> {vertices.length}
                </div>
                <div className="text-xs">
                  <span className="font-medium">辺数:</span> {edges.length}
                </div>
                <div className="text-xs">
                  <span className="font-medium">選択ツール:</span> {
                    tool === 'select' ? '選択' :
                    tool === 'addVertex' ? '頂点追加' :
                    tool === 'pan' ? 'パン' : tool
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 軒の出距離編集モーダル */}
      {editingEaveDistance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              軒の出距離を編集
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                軒の出距離 (mm)
              </label>
              <input
                type="number"
                value={modalValue}
                onChange={(e) => setModalValue(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="距離を入力"
                min="0"
                max="5000"
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-1">
                現在の値: {editingEaveDistance.eaveDistance}mm
              </p>
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
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                更新
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}