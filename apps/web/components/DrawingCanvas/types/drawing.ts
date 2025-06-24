export interface DrawingData {
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

export interface DimensionArea {
  type: 'building' | 'eave' | 'vertex' | 'opening';
  direction: 'width' | 'height' | 'north' | 'east' | 'south' | 'west' | 'vertex';
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  vertexIndex?: number;
  openingId?: string;  // 開口部IDを追加
}

export interface BuildingVertex {
  x: number;
  y: number;
  id: string;
}

export interface EdgeEave {
  edgeIndex: number;
  distance: number;
}

export interface Opening {
  id: string;
  edgeIndex: number;        // どの辺に配置されているか
  startPosition: number;    // 辺の開始点からの距離（0-1の比率）
  endPosition: number;      // 辺の開始点からの距離（0-1の比率）
  width: number;           // 開口幅（mm）
  type: 'entrance' | 'back_door' | 'sliding_window' | 'garage' | 'passage';
}

export interface FloorData {
  id: string;
  name: string;
  height: number;
  vertices: BuildingVertex[];
  eaves: EdgeEave[];
  openings: Opening[];      // 開口部データ
  visible: boolean;
}

export interface FloorColors {
  building: string;
  eaves: string;
  vertex: string;
}

export interface DragHandle {
  id: string;
  type: 'building' | 'eave';
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  x: number;
  y: number;
  radius: number;
}

export interface DrawingEditorProps {
  width?: number;
  height?: number;
}

// 階層カラーパレット
export const FLOOR_COLORS: Record<number, FloorColors> = {
  1: { building: '#22C55E', eaves: '#16A34A', vertex: '#22C55E' }, // 緑+ダークグリーン
  2: { building: '#3B82F6', eaves: '#1E40AF', vertex: '#3B82F6' }, // 青+ダークブルー
  3: { building: '#8B5CF6', eaves: '#5B21B6', vertex: '#8B5CF6' }, // 紫+ダークパープル
  4: { building: '#F59E0B', eaves: '#D97706', vertex: '#F59E0B' }, // 黄+ダークオレンジ
  5: { building: '#EF4444', eaves: '#B91C1C', vertex: '#EF4444' }  // 赤+ダークレッド
};