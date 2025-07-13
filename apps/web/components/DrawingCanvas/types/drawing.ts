// 建物全体のデータ
export interface DrawingData {
  building: {
    width: number; // 東西方向の長さ（mm）
    height: number; // 南北方向の長さ（mm）
  };
  eaves: {
    north: number;
    east: number;
    south: number;
    west: number;
  };
  timestamp?: number;
}

// 建物の頂点
export interface BuildingVertex {
  id: string;
  x: number;
  y: number;
  index?: number; // 配列内での順序を保持するためのオプショナルプロパティ
}

// 各辺の軒の出
export interface EdgeEave {
  edgeIndex: number;
  distance: number; // mm
}

// 開口部
export interface Opening {
  id: string;
  edgeIndex: number;
  startPosition: number; // 0~1
  endPosition: number;   // 0~1
  width?: number; // mm
  type?: 'entrance' | 'back_door' | 'sliding_window' | 'garage' | 'passage';
}

// 階層データ
export interface FloorData {
  id: string;
  name: string;
  height: number;
  vertices: BuildingVertex[];
  eaves: EdgeEave[];
  openings: Opening[];
  visible: boolean;
}

// 寸法エリア（UI用）
export interface DimensionArea {
  type: 'building' | 'eave' | 'opening';
  direction: string;
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  vertexIndex?: number;
  openingId?: string;
}

// ドラッグハンドル（UI用）
export interface DragHandle {
  id: string;
  type: 'building' | 'eave';
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  x: number;
  y: number;
  radius: number;
}

// 階層カラー
export interface FloorColors {
  building: string;
  eaves: string;
  vertex: string;
}

export const FLOOR_COLORS: Record<number, FloorColors> = {
  1: { building: '#22C55E', eaves: '#16A34A', vertex: '#22C55E' },
  2: { building: '#3B82F6', eaves: '#1E40AF', vertex: '#3B82F6' },
  3: { building: '#8B5CF6', eaves: '#5B21B6', vertex: '#8B5CF6' },
  4: { building: '#F59E0B', eaves: '#D97706', vertex: '#F59E0B' },
  5: { building: '#EF4444', eaves: '#B91C1C', vertex: '#EF4444' }
};

// --- 高度計算用型 ---
export interface EdgeInfo {
  edgeIndex: number;
  startVertex: BuildingVertex;
  endVertex: BuildingVertex;
  length: number;
  direction: string; // '北'|'東'|'南'|'西' など
  isInsideCorner: boolean;
}

export interface CornerInfo {
  vertexIndex: number;
  position: BuildingVertex;
  angle: number;
  type: 'inside' | 'outside' | 'straight';
}

export interface AdvancedCalculationInput {
  buildingVertices: BuildingVertex[];
  edgeEaves: EdgeEave[];
  insideCornerEdges: number[];
  simpleCalculationData: any; // 必要に応じて詳細型を定義
}

export interface AdvancedCalculationResult {
  edgeIndex: number;
  success: boolean;
  resultDistance: number; // mm
  spanConfiguration: number[] | string; // ex: [1800, 1800, 1200] or "6span, 1500"
}

export interface ScaffoldLineData {
  vertices: BuildingVertex[];
  edges: Array<{
    edgeIndex: number;
    startVertex: BuildingVertex;
    endVertex: BuildingVertex;
    spanConfiguration: number[];
    markers?: Array<{ 
      position: { x: number; y: number }; 
      distance: number; 
      type: 'span' | 'vertex' 
    }>;
  }>;
  visible: boolean;
}

export interface AdvancedCalculationSummary {
  insideCornerResults: AdvancedCalculationResult[];
  updatedFaceSpans: Record<string, Record<number, number[]>>;
  success: boolean;
} 