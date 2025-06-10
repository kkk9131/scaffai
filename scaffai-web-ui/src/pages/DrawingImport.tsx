import { useState, useRef } from 'react';
import { Stage, Layer, Circle } from 'react-konva';
import { 
  Upload, Layers, Ruler, ChevronLeft, ChevronRight, FileDown,
  ZoomIn, ZoomOut, Maximize, Check, RotateCcw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/Select';

type Point = { x: number; y: number };
type DrawingType = 'pdf' | 'dxf' | null;

export default function DrawingImport() {
  const navigate = useNavigate();
  const [drawingType, setDrawingType] = useState<DrawingType>(null);
  const [selectedLayer, setSelectedLayer] = useState<string>('');
  const [scale, setScale] = useState(1);
  const [points, setPoints] = useState<Point[]>([]);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType === 'pdf' || fileType === 'dxf') {
      setDrawingType(fileType as DrawingType);
    } else {
      alert('PDFまたはDXFファイルを選択してください。');
    }
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

  const handlePointClick = (e: any) => {
    if (drawingType !== 'pdf') return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    setPoints([...points, point]);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Left Sidebar */}
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

        <div className="p-4 h-full flex flex-col">
          <Link 
            to="/dashboard" 
            className={cn(
              "block mb-6 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors",
              leftSidebarCollapsed ? "text-center text-xl" : "text-lg"
            )}
          >
            ScaffAI
          </Link>

          {!leftSidebarCollapsed && (
            <h2 className="text-lg font-semibold mb-4">図面読込</h2>
          )}

          <div className={cn(
            "flex flex-col gap-4",
            leftSidebarCollapsed && "items-center"
          )}>
            <div>
              <input
                type="file"
                accept=".pdf,.dxf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex items-center gap-2 w-full p-3 rounded-lg",
                  "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
                  "hover:bg-blue-100 dark:hover:bg-blue-900/30",
                  "border-2 border-dashed border-blue-200 dark:border-blue-800",
                  leftSidebarCollapsed && "justify-center"
                )}
              >
                <Upload className="w-5 h-5" />
                {!leftSidebarCollapsed && <span>ファイルを選択</span>}
              </button>
              {!leftSidebarCollapsed && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  PDFまたはDXFファイル
                </p>
              )}
            </div>

            {drawingType === 'dxf' && !leftSidebarCollapsed && (
              <div className="space-y-2">
                <label className="text-sm font-medium">レイヤー選択</label>
                <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                  <SelectTrigger>
                    <SelectValue placeholder="レイヤーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walls">壁</SelectItem>
                    <SelectItem value="doors">ドア</SelectItem>
                    <SelectItem value="windows">窓</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!leftSidebarCollapsed && (
              <div className="space-y-2">
                <label className="text-sm font-medium">スケール設定</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">1/</span>
                  <input
                    type="number"
                    placeholder="100"
                    className="flex-1 px-3 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  図面の縮尺を入力してください
                </p>
              </div>
            )}
          </div>
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
          onClick={handlePointClick}
          scale={{ x: scale, y: scale }}
        >
          <Layer>
            {/* Preview content will be rendered here */}
            {points.map((point, i) => (
              <Circle
                key={i}
                x={point.x}
                y={point.y}
                radius={4}
                fill="#3b82f6"
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
            <Maximize className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/output')}
            className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            <FileDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right Sidebar */}
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
          "h-full",
          rightSidebarCollapsed ? "p-2" : "p-4"
        )}>
          {!rightSidebarCollapsed ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">変換結果</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Check className="w-4 h-4" />
                  <span>確定</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">抽出された線分</span>
                    <span className="text-sm text-slate-500">0本</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">補助点</span>
                    <span className="text-sm text-slate-500">{points.length}点</span>
                  </div>
                </div>

                <button className="flex items-center justify-center gap-2 w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <RotateCcw className="w-4 h-4" />
                  <span>再スキャン</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <Check className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}