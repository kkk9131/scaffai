import { useState, useRef } from 'react';
import { Stage, Layer, Line, Text } from 'react-konva';
import {
  Pencil, Eraser, Undo, Redo, ZoomIn, ZoomOut, FileDown,
  Maximize as MaximizeSquare, Grid, Save, Move,
  ChevronLeft, ChevronRight, Square, Triangle,
  Building2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';

type Tool = 'select' | 'pan' | 'zoom' | 'measure' | 'wall1f' | 'wall2f' | 'roof' | 'eaves' | 'eraser' | 'boundary' | 'opening';
type Layer = 'wall1f' | 'wall2f' | 'roof' | 'eaves';
type LineType = {
  tool: Tool;
  points: number[];
  id: string;
  length?: number;
  angle?: number;
};

const GRID_SIZE = 20;
const SNAP_THRESHOLD = 10;

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

function ToolButton({ icon, label, active, onClick, collapsed }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-2 rounded-lg flex items-center gap-2",
        collapsed && "justify-center",
        "hover:bg-slate-100 dark:hover:bg-slate-700",
        "transition-colors duration-200",
        active && "bg-blue-50 dark:bg-blue-900/20"
      )}
    >
      {icon}
      {!collapsed && <span className="text-sm">{label}</span>}
    </button>
  );
}

export default function DrawingEditor() {
  const navigate = useNavigate();
  const [tool, setTool] = useState<Tool>('select');
  const [lines, setLines] = useState<LineType[]>([]);
  const [activeLayers, setActiveLayers] = useState<Layer[]>(['wall1f', 'wall2f', 'roof']);
  const [selectedLine, setSelectedLine] = useState<LineType | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [defaultEavesLength, setDefaultEavesLength] = useState(600);
  const stageRef = useRef(null);

  const toolConfigs: Record<Tool, { color: string; strokeWidth: number; dash?: number[] }> = {
    select: { color: '#3b82f6', strokeWidth: 1 },
    pan: { color: '#3b82f6', strokeWidth: 1 },
    zoom: { color: '#3b82f6', strokeWidth: 1 },
    measure: { color: '#3b82f6', strokeWidth: 1 },
    wall1f: { color: '#3b82f6', strokeWidth: 2 },
    wall2f: { color: '#10b981', strokeWidth: 2 },
    roof: { color: '#f59e0b', strokeWidth: 2, dash: [6, 3] },
    eaves: { color: '#22c55e', strokeWidth: 2 },
    eraser: { color: '#000000', strokeWidth: 10 },
    boundary: { color: '#64748b', strokeWidth: 2, dash: [4, 4] },
    opening: { color: '#ef4444', strokeWidth: 2 },
  };

  const handleMouseDown = (e: any) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    const snappedPos = snapToGrid(pos);
    
    setLines([...lines, { 
      tool, 
      points: [snappedPos.x, snappedPos.y], 
      id: Date.now().toString() 
    }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const snappedPoint = snapToGrid(point);
    
    const lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([snappedPoint.x, snappedPoint.y]);

    setLines([...lines.slice(0, -1), lastLine]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const snapToGrid = (point: { x: number; y: number }) => {
    if (!showGrid) return point;

    const x = Math.round(point.x / GRID_SIZE) * GRID_SIZE;
    const y = Math.round(point.y / GRID_SIZE) * GRID_SIZE;

    return { x, y };
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const newScale = direction === 'in' 
      ? Math.min(scale * 1.2, 3) 
      : Math.max(scale / 1.2, 0.3);
    setScale(newScale);
  };

  const handleFitScreen = () => {
    setScale(1);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Left Toolbar */}
      <div className={cn(
        "relative bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out",
        leftSidebarCollapsed ? "w-16" : "w-64"
      )}>
        <div className="absolute right-0 top-4 -mr-3 z-10">
          <button
            onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            className="p-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
          >
            {leftSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
        <div className="p-4">
          <Link 
            to="/dashboard" 
            className={cn(
              "block mb-6 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors",
              leftSidebarCollapsed ? "text-center text-xl" : "text-lg"
            )}
          >
            ScaffAI
          </Link>
          
          <h2 className="text-lg font-semibold mb-4">描画ツール</h2>
          
          {/* Basic Tools */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">基本ツール</h3>
            <div className="grid grid-cols-3 gap-2">
              <ToolButton
                icon={<Square className="w-4 h-4" />}
                label="選択"
                active={tool === 'select'}
                onClick={() => setTool('select')}
                collapsed={false}
              />
              <ToolButton
                icon={<Move className="w-4 h-4" />}
                label="移動"
                active={tool === 'pan'}
                onClick={() => setTool('pan')}
                collapsed={false}
              />
              <ToolButton
                icon={<ZoomIn className="w-4 h-4" />}
                label="拡大"
                active={tool === 'zoom'}
                onClick={() => setTool('zoom')}
                collapsed={false}
              />
            </div>
          </div>
          
          {/* Building Elements */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">建物要素</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTool('wall1f')}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700",
                  "hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors",
                  tool === 'wall1f' && "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                )}
              >
                <span className="text-xs mb-1">1F</span>
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </button>
              <button
                onClick={() => setTool('wall2f')}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 dark:border-slate-700",
                  "hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors",
                  tool === 'wall2f' && "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                )}
              >
                <span className="text-xs mb-1">2F</span>
                <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </button>
            </div>
          </div>
          
          {/* Layers */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">レイヤー</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={activeLayers.includes('wall1f')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setActiveLayers([...activeLayers, 'wall1f']);
                    } else {
                      setActiveLayers(activeLayers.filter(l => l !== 'wall1f'));
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600"
                />
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-sm" />
                  <span className="text-sm">1F壁線</span>
                </span>
              </label>
              {/* Similar checkboxes for other layers */}
            </div>
          </div>
          
          {!leftSidebarCollapsed && (
            <h2 className="px-2 text-lg font-semibold text-slate-900 dark:text-white mb-2">
              ツール
            </h2>
          )}
          <ToolButton
            icon={<div className="w-4 h-4 bg-blue-500 rounded-sm" />}
            label="1F壁"
            active={tool === 'wall1f'}
            onClick={() => setTool('wall1f')}
            collapsed={leftSidebarCollapsed}
          />
          <ToolButton
            icon={<div className="w-4 h-4 bg-green-500 rounded-sm" />}
            label="2F壁"
            active={tool === 'wall2f'}
            onClick={() => setTool('wall2f')}
            collapsed={leftSidebarCollapsed}
          />
          <ToolButton
            icon={<div className="w-4 h-4 bg-orange-500 rounded-sm border-2 border-dashed" />}
            label="屋根"
            active={tool === 'roof'}
            onClick={() => setTool('roof')}
            collapsed={leftSidebarCollapsed}
          />
          <ToolButton
            icon={<div className="w-4 h-4 bg-slate-500 rounded-sm border border-dotted" />}
            label="境界線"
            active={tool === 'boundary'}
            onClick={() => setTool('boundary')}
            collapsed={leftSidebarCollapsed}
          />
          <ToolButton
            icon={<div className="w-4 h-4 bg-red-500 rounded-sm" />}
            label="開口部"
            active={tool === 'opening'}
            onClick={() => setTool('opening')}
            collapsed={leftSidebarCollapsed}
          />
          <div className="border-t border-slate-200 dark:border-slate-700 my-2" />
          <ToolButton
            icon={<Eraser className="w-4 h-4" />}
            label="消しゴム"
            active={tool === 'eraser'}
            onClick={() => setTool('eraser')}
            collapsed={leftSidebarCollapsed}
          />
          <ToolButton
            icon={<Grid className="w-4 h-4" />}
            label="グリッド"
            active={showGrid}
            onClick={() => setShowGrid(!showGrid)}
            collapsed={leftSidebarCollapsed}
          />
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <Stage
          width={window.innerWidth - (
            (leftSidebarCollapsed ? 64 : 256) + 
            (rightSidebarCollapsed ? 64 : 320)
          )}
          height={window.innerHeight}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={stageRef}
          scale={{ x: scale, y: scale }}
        >
          <Layer>
            {/* Grid */}
            {showGrid && Array.from({ length: 100 }).map((_, i) => (
              <>
                <Line
                  key={`v${i}`}
                  points={[i * GRID_SIZE, 0, i * GRID_SIZE, window.innerHeight]}
                  stroke="#e2e8f0"
                  strokeWidth={0.5}
                />
                <Line
                  key={`h${i}`}
                  points={[0, i * GRID_SIZE, window.innerWidth, i * GRID_SIZE]}
                  stroke="#e2e8f0"
                  strokeWidth={0.5}
                />
              </>
            ))}

            {/* Drawing Lines */}
            {lines.map((line, i) => (
              <Line
                key={line.id}
                points={line.points}
                stroke={toolConfigs[line.tool as Tool].color}
                strokeWidth={toolConfigs[line.tool as Tool].strokeWidth}
                dash={toolConfigs[line.tool as Tool].dash}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
              />
            ))}
          </Layer>
        </Stage>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={() => handleZoom('in')}
            className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleFitScreen}
            className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <MaximizeSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/output')}
            className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            <FileDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className={cn(
        "relative bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out",
        rightSidebarCollapsed ? "w-16" : "w-80"
      )}>
        <div className="absolute left-0 top-4 -ml-3 z-10">
          <button
            onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
            className="p-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
          >
            {rightSidebarCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
        <div className={cn(
          "h-full p-4"
        )}>
          {!rightSidebarCollapsed ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">オブジェクト情報</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">選択オブジェクト</label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    {selectedLine ? '壁線 (1F)' : '未選択'}
                  </div>
                </div>
                
                {selectedLine && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">長さ</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={selectedLine.length || 0}
                          onChange={(e) => {
                            // Update length logic
                          }}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                          mm
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">角度</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={selectedLine.angle || 0}
                          onChange={(e) => {
                            // Update angle logic
                          }}
                          className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                          °
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">計算設定</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">境界線の有無</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span>左側</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span>右側</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">屋根形状</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <option>フラット屋根</option>
                    <option>切妻屋根</option>
                    <option>片流れ屋根</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">特殊部材</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span>355mm対応</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span>300mm対応</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span>150mm対応</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">計算結果</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">スパン構成</label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg font-mono text-sm">
                    1800×4 + 900×1
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">段数</label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    2段
                  </div>
                </div>
              </div>
            </div>
          </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}