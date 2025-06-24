import type { DrawingData, FloorData, BuildingVertex, EdgeEave, Opening, DimensionArea, DragHandle, FloorColors } from '../types/drawing';
import { FLOOR_COLORS } from '../types/drawing';
import { calculateLineIntersection } from './geometry';

// @ts-ignore
import * as ClipperLib from 'clipper-lib';

export const drawGrid = (
  ctx: CanvasRenderingContext2D, 
  w: number, 
  h: number, 
  scale: number, 
  pan: { x: number; y: number },
  drawingData: DrawingData | null
) => {
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

export const drawHoveredDimensionArea = (ctx: CanvasRenderingContext2D, hoveredDimension: DimensionArea) => {
  ctx.fillStyle = 'rgba(255, 140, 0, 0.3)';
  ctx.fillRect(hoveredDimension.x, hoveredDimension.y, hoveredDimension.width, hoveredDimension.height);
};

export const drawDimensionAreas = (ctx: CanvasRenderingContext2D, dimensionAreas: DimensionArea[]) => {
  dimensionAreas.forEach(area => {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(area.x, area.y, area.width, area.height);
  });
};

export const drawDragHandles = (
  ctx: CanvasRenderingContext2D, 
  dragHandles: DragHandle[], 
  hoveredHandle: DragHandle | null
) => {
  dragHandles.forEach(handle => {
    const isHovered = hoveredHandle?.id === handle.id;
    
    ctx.fillStyle = isHovered ? '#FF8C00' : '#4285f4';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(handle.x, handle.y, handle.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  });
};

export const drawEdgeWithOpenings = (
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

// 建物の境界を計算する関数
export const getBuildingBounds = (vertices: BuildingVertex[]) => {
  if (vertices.length === 0) return { width: 0, height: 0 };
  
  let minX = vertices[0].x;
  let maxX = vertices[0].x;
  let minY = vertices[0].y;
  let maxY = vertices[0].y;
  
  for (let i = 1; i < vertices.length; i++) {
    minX = Math.min(minX, vertices[i].x);
    maxX = Math.max(maxX, vertices[i].x);
    minY = Math.min(minY, vertices[i].y);
    maxY = Math.max(maxY, vertices[i].y);
  }
  
  return {
    width: maxX - minX,
    height: maxY - minY
  };
};


export const drawAdvancedBuilding = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
  pan: { x: number; y: number },
  buildingVertices: BuildingVertex[],
  drawingData: DrawingData | null,
  activeFloorId: string,
  openings: Opening[],
  edgeEaves: EdgeEave[],
  selectedVertexIndex: number | null,
  visibleOpeningDimensions: Set<string>,
  setDimensionAreas: (areas: DimensionArea[]) => void,
  setDragHandles: (handles: DragHandle[]) => void
) => {
  if (buildingVertices.length < 3) return;

  const newDimensionAreas: DimensionArea[] = [];
  const newDragHandles: DragHandle[] = [];

  // 基準縮尺を計算（ズーム無関係）
  let baseScale = 0.3;
  let autoScale = 0.3;
  
  if (drawingData) {
    const buildingWidthEW = drawingData.building.width;
    const buildingWidthNS = drawingData.building.height;
    
    const margin = 100;
    const maxCanvasWidth = canvasWidth - margin * 2;
    const maxCanvasHeight = canvasHeight - margin * 2;
    
    const scaleX = maxCanvasWidth / buildingWidthEW;
    const scaleY = maxCanvasHeight / buildingWidthNS;
    baseScale = Math.min(scaleX, scaleY, 0.3);
    autoScale = baseScale * scale;
  }

  // 現在の階層番号を取得
  const currentFloorNumber = parseInt(activeFloorId.split('-')[1]) || 1;
  const colors = FLOOR_COLORS[currentFloorNumber] || FLOOR_COLORS[1];

  // 建物ポリゴンを描画（ズーム対応、階層カラー適用、開口部対応）
  ctx.lineWidth = 3;
  ctx.fillStyle = colors.building + '33';

  // 建物頂点をズームに応じて変換
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  // ズーム適用後の頂点座標を計算
  const scaledVertices = buildingVertices.map(vertex => ({
    x: centerX + (vertex.x - centerX) * scale + pan.x,
    y: centerY + (vertex.y - centerY) * scale + pan.y
  }));

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

  // 軒の出ポリゴンの頂点を保存する変数
  let eaveVertices: { x: number; y: number }[] = [];

  // 辺ごとの個別距離に対応した軒の出生成（正確な平行オフセット）
  if (edgeEaves.length > 0 && edgeEaves.some(edge => edge.distance > 0)) {
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
        const intersection = calculateLineIntersection(
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
        ctx.fillText(`${eave.distance.toFixed(1)}mm`, eaveMidX, eaveMidY - 5);
        
        // クリック可能エリアを記録
        const eaveTextMetrics = ctx.measureText(`${eave.distance.toFixed(1)}mm`);
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

  // 頂点を描画（ズーム対応）
  scaledVertices.forEach((vertex, index) => {
    const radius = 8;
    const isSelected = selectedVertexIndex === index;
    
    ctx.beginPath();
    ctx.arc(vertex.x, vertex.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected ? '#3b82f6' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#1e40af' : colors.vertex;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 頂点番号を表示
    ctx.fillStyle = '#333333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText((index + 1).toString(), vertex.x, vertex.y - 15);
  });

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

  // 開口部の寸法を描画（表示状態の開口部のみ）
  drawOpeningDimensions(ctx, scaledVertices, colors, autoScale, newDimensionAreas, openings, visibleOpeningDimensions);

  setDimensionAreas(newDimensionAreas);
  setDragHandles(newDragHandles);
};

// 開口部タイプ名を取得する関数
const getOpeningTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    'entrance': '玄関',
    'back_door': '勝手口',
    'sliding_window': '掃出窓',
    'garage': '車庫',
    'passage': '通路'
  };
  return typeNames[type] || type;
};

// 開口部の寸法を描画する関数
export const drawOpeningDimensions = (
  ctx: CanvasRenderingContext2D,
  scaledVertices: { x: number; y: number }[],
  colors: FloorColors,
  autoScale: number,
  newDimensionAreas: DimensionArea[],
  openings: Opening[],
  visibleOpeningDimensions: Set<string>
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

// 作図モード：全階層を重ね合わせて描画（上階優先）
export const drawCompositeView = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
  pan: { x: number; y: number },
  floors: FloorData[],
  drawingData: DrawingData | null,
  setDimensionAreas?: (areas: DimensionArea[]) => void
) => {
  // 階層を階数順でソート（1F, 2F, 3F...）
  const sortedFloors = [...floors].sort((a, b) => {
    const aFloor = parseInt(a.id.split('-')[1]) || 1;
    const bFloor = parseInt(b.id.split('-')[1]) || 1;
    return aFloor - bFloor;
  });

  // 各階層の建物パスを準備
  const floorPaths: Array<{
    floor: FloorData;
    buildingPath: Path2D;
    eavesPath: Path2D | null;
    colors: FloorColors;
    isScaffoldLine: boolean;
  }> = [];

  // すべての階層のパスを作成
  sortedFloors.forEach(floor => {
    if (floor.vertices.length < 3) return;

    const floorNumber = parseInt(floor.id.split('-')[1]) || 1;
    
    // 足場ラインは黒で描画
    let colors;
    if (floor.name === '足場ライン') {
      colors = { building: '#000000', eaves: '#000000', vertex: '#000000' };
    } else {
      colors = FLOOR_COLORS[floorNumber] || FLOOR_COLORS[1];
    }

    // ズーム座標変換を計算
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    const scaledVertices = floor.vertices.map(vertex => ({
      x: centerX + (vertex.x - centerX) * scale + pan.x,
      y: centerY + (vertex.y - centerY) * scale + pan.y
    }));

    // 建物パスを作成
    const buildingPath = new Path2D();
    buildingPath.moveTo(scaledVertices[0].x, scaledVertices[0].y);
    for (let i = 1; i < scaledVertices.length; i++) {
      buildingPath.lineTo(scaledVertices[i].x, scaledVertices[i].y);
    }
    buildingPath.closePath();

    // 軒の出パスを作成（必要な場合）
    let eavesPath: Path2D | null = null;
    if (floor.eaves.length > 0 && floor.eaves.some(eave => eave.distance > 0)) {
      try {
        // 基準縮尺を計算
        let baseScale = 0.3;
        if (drawingData) {
          const buildingWidthEW = drawingData.building.width;
          const buildingWidthNS = drawingData.building.height;
          const margin = 100;
          const maxCanvasWidth = canvasWidth - margin * 2;
          const maxCanvasHeight = canvasHeight - margin * 2;
          const scaleX = maxCanvasWidth / buildingWidthEW;
          const scaleY = maxCanvasHeight / buildingWidthNS;
          baseScale = Math.min(scaleX, scaleY, 0.3);
        }
        const autoScale = baseScale * scale;

        // 軒の出の頂点を計算
        const eaveVertices: { x: number; y: number }[] = [];
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
              
              offsetLines.push({
                start: {
                  x: currentVertex.x + normalX * canvasOffset,
                  y: currentVertex.y + normalY * canvasOffset
                },
                end: {
                  x: nextVertex.x + normalX * canvasOffset,
                  y: nextVertex.y + normalY * canvasOffset
                }
              });
            }
          } else {
            offsetLines.push({ 
              start: { x: currentVertex.x, y: currentVertex.y },
              end: { x: nextVertex.x, y: nextVertex.y }
            });
          }
        }

        // 隣接する線分の交点を計算
        for (let i = 0; i < offsetLines.length; i++) {
          const currentLine = offsetLines[i];
          const nextLine = offsetLines[(i + 1) % offsetLines.length];
          
          const intersection = calculateLineIntersection(
            currentLine.start, currentLine.end,
            nextLine.start, nextLine.end
          );
          
          if (intersection) {
            eaveVertices.push(intersection);
          } else {
            eaveVertices.push(currentLine.end);
          }
        }

        // 軒の出パスを作成
        if (eaveVertices.length >= 3) {
          eavesPath = new Path2D();
          eavesPath.moveTo(eaveVertices[0].x, eaveVertices[0].y);
          for (let i = 1; i < eaveVertices.length; i++) {
            eavesPath.lineTo(eaveVertices[i].x, eaveVertices[i].y);
          }
          eavesPath.closePath();
        }
      } catch (error) {
        console.error('Composite view eave path creation error:', error);
      }
    }

    floorPaths.push({
      floor,
      buildingPath,
      eavesPath,
      colors,
      isScaffoldLine: floor.name === '足場ライン'
    });
  });

  // 下の階から上の階へ順番に描画（上階が上に重なる）
  floorPaths.forEach(({ floor, buildingPath, eavesPath, colors, isScaffoldLine }, index) => {
    const isTopFloor = index === floorPaths.length - 1;
    
    // 足場ライン以外は塗りつぶし
    if (!isScaffoldLine) {
      ctx.fillStyle = colors.building + '4D'; // 30%透明度
      ctx.fill(buildingPath);
    }
    
    // 建物枠線
    ctx.strokeStyle = colors.building;
    if (isScaffoldLine) {
      ctx.lineWidth = 2; // 足場ラインは中太線（塗りつぶしなし）
      ctx.setLineDash([]); // 実線
    } else {
      ctx.lineWidth = isTopFloor ? 3 : 2; // 最上階は太い線
      ctx.setLineDash([]);
    }
    ctx.stroke(buildingPath);

    // 軒の出を描画
    if (eavesPath) {
      ctx.strokeStyle = colors.eaves;
      ctx.lineWidth = isTopFloor ? 2 : 1;
      ctx.setLineDash(isTopFloor ? [8, 4] : [4, 2]);
      ctx.stroke(eavesPath);
      ctx.setLineDash([]);
    }
  });

  // 寸法線の描画（建物フロアに対してのみ）
  const buildingFloor = sortedFloors.find(floor => floor.name === '建物');
  if (buildingFloor && buildingFloor.vertices.length >= 4) {
    const newDimensionAreas: DimensionArea[] = [];
    // ズーム座標変換を計算
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    const scaledVertices = buildingFloor.vertices.map(vertex => ({
      x: centerX + (vertex.x - centerX) * scale + pan.x,
      y: centerY + (vertex.y - centerY) * scale + pan.y
    }));

    // 基準縮尺を計算
    let baseScale = 0.3;
    if (drawingData) {
      const buildingWidthEW = drawingData.building.width;
      const buildingWidthNS = drawingData.building.height;
      const margin = 100;
      const maxCanvasWidth = canvasWidth - margin * 2;
      const maxCanvasHeight = canvasHeight - margin * 2;
      const scaleX = maxCanvasWidth / buildingWidthEW;
      const scaleY = maxCanvasHeight / buildingWidthNS;
      baseScale = Math.min(scaleX, scaleY, 0.3);
    }

    // 建物の辺上に寸法を表示
    buildingFloor.vertices.forEach((vertex, index) => {
      const nextVertex = buildingFloor.vertices[(index + 1) % buildingFloor.vertices.length];
      
      // 辺の長さを計算（ズーム無関係の基準座標で計算）
      const deltaX = nextVertex.x - vertex.x;
      const deltaY = nextVertex.y - vertex.y;
      const pixelLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // ピクセル距離を実際の距離（mm）に変換
      let realLength = 0;
      if (baseScale > 0) {
        realLength = pixelLength / baseScale;
      }
      
      if (realLength > 10) { // 10mm以上の辺のみ表示
        // 表示位置はズーム済み座標を使用
        const scaledVertex = scaledVertices[index];
        const scaledNextVertex = scaledVertices[(index + 1) % scaledVertices.length];
        const midX = (scaledVertex.x + scaledNextVertex.x) / 2;
        const midY = (scaledVertex.y + scaledNextVertex.y) / 2;
        
        // 辺に垂直な方向にオフセット
        const edgeX = scaledNextVertex.x - scaledVertex.x;
        const edgeY = scaledNextVertex.y - scaledVertex.y;
        const edgeLength = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
        
        if (edgeLength > 0) {
          const normalX = -edgeY / edgeLength;
          const normalY = edgeX / edgeLength;
          
          const offsetDistance = 30;
          const textX = midX + normalX * offsetDistance;
          const textY = midY + normalY * offsetDistance;
          
          // 寸法テキストを描画
          ctx.fillStyle = '#000000';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${realLength.toFixed(0)}mm`, textX, textY);
          
          // 寸法エリアを記録（クリック可能にするため）
          const textMetrics = ctx.measureText(`${realLength.toFixed(0)}mm`);
          const textWidth = textMetrics.width;
          const textHeight = 16;
          newDimensionAreas.push({
            type: 'building' as const,
            direction: index === 0 ? 'north' : index === 1 ? 'east' : index === 2 ? 'south' : 'west',
            x: textX - textWidth / 2,
            y: textY - textHeight / 2,
            width: textWidth,
            height: textHeight,
            value: realLength,
            vertexIndex: index
          });
        }
      }
    });
    
    // 寸法エリアを設定
    if (setDimensionAreas) {
      setDimensionAreas(newDimensionAreas);
    }
  }
};


export const drawBuildingFromData = (
  ctx: CanvasRenderingContext2D, 
  data: DrawingData, 
  canvasWidth: number, 
  canvasHeight: number,
  scale: number,
  pan: { x: number; y: number },
  activeFloorId: string,
  edgeEaves: EdgeEave[],
  setDimensionAreas: (areas: DimensionArea[]) => void,
  setDragHandles: (handles: DragHandle[]) => void
) => {
  // 寸法エリアとドラッグハンドルをリセット
  const newDimensionAreas: DimensionArea[] = [];
  const newDragHandles: DragHandle[] = [];
  const buildingWidthNS = data.building.height; // 南北
  const buildingWidthEW = data.building.width;  // 東西

  // 現在の階層番号を取得してカラーを設定
  const currentFloorNumber = parseInt(activeFloorId.split('-')[1]) || 1;
  const colors = FLOOR_COLORS[currentFloorNumber] || FLOOR_COLORS[1];

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

  // 建物のドラッグハンドル座標を記録
  const handleRadius = 6;
  newDragHandles.push(
    {
      id: 'building-top-left',
      type: 'building',
      corner: 'top-left',
      x: startX,
      y: startY,
      radius: handleRadius
    },
    {
      id: 'building-top-right',
      type: 'building',
      corner: 'top-right',
      x: startX + canvasBuildingWidth,
      y: startY,
      radius: handleRadius
    },
    {
      id: 'building-bottom-left',
      type: 'building',
      corner: 'bottom-left',
      x: startX,
      y: startY + canvasBuildingHeight,
      radius: handleRadius
    },
    {
      id: 'building-bottom-right',
      type: 'building',
      corner: 'bottom-right',
      x: startX + canvasBuildingWidth,
      y: startY + canvasBuildingHeight,
      radius: handleRadius
    }
  );

  // シンプルモード: 辺ごとの個別距離に対応した軒の出生成（高度モードと同じアルゴリズム）
  if (edgeEaves.length > 0 && edgeEaves.some(edge => edge.distance > 0)) {
    try {
      // 建物の四角形の頂点を定義
      const simpleVertices = [
        { x: startX, y: startY },
        { x: startX + canvasBuildingWidth, y: startY },
        { x: startX + canvasBuildingWidth, y: startY + canvasBuildingHeight },
        { x: startX, y: startY + canvasBuildingHeight }
      ];
      
      // 各辺から平行オフセットした線分を計算
      const offsetLines: Array<{start: {x: number, y: number}, end: {x: number, y: number}}> = [];
      
      for (let i = 0; i < simpleVertices.length; i++) {
        const currentVertex = simpleVertices[i];
        const nextVertex = simpleVertices[(i + 1) % simpleVertices.length];
        const eaveDistance = edgeEaves[i]?.distance || 0;
        
        if (eaveDistance > 0) {
          // 辺のベクトルを計算
          const edgeX = nextVertex.x - currentVertex.x;
          const edgeY = nextVertex.y - currentVertex.y;
          const edgeLength = Math.sqrt(edgeX * edgeX + edgeY * edgeY);
          
          if (edgeLength > 0) {
            // 外向きの法線ベクトル
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
      const eaveVertices: { x: number; y: number }[] = [];
      
      for (let i = 0; i < offsetLines.length; i++) {
        const currentLine = offsetLines[i];
        const nextLine = offsetLines[(i + 1) % offsetLines.length];
        
        // 2つの線分の交点を計算
        const intersection = calculateLineIntersection(
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
      console.error('Simple mode eave generation error:', error);
    }
  }

  // 軒の出のドラッグハンドル座標を記録（軒の出がある場合のみ）
  if (eaveNorth > 0 || eaveEast > 0 || eaveSouth > 0 || eaveWest > 0) {
      const eaveStartX = startX - eaveWest;
      const eaveStartY = startY - eaveNorth;
      const eaveWidth = canvasBuildingWidth + eaveWest + eaveEast;
      const eaveHeight = canvasBuildingHeight + eaveNorth + eaveSouth;

      newDragHandles.push(
        {
          id: 'eave-top-left',
          type: 'eave',
          corner: 'top-left',
          x: eaveStartX,
          y: eaveStartY,
          radius: handleRadius
        },
        {
          id: 'eave-top-right',
          type: 'eave',
          corner: 'top-right',
          x: eaveStartX + eaveWidth,
          y: eaveStartY,
          radius: handleRadius
        },
        {
          id: 'eave-bottom-left',
          type: 'eave',
          corner: 'bottom-left',
          x: eaveStartX,
          y: eaveStartY + eaveHeight,
          radius: handleRadius
        },
        {
          id: 'eave-bottom-right',
          type: 'eave',
          corner: 'bottom-right',
          x: eaveStartX + eaveWidth,
          y: eaveStartY + eaveHeight,
          radius: handleRadius
        }
      );
    }

  // 寸法ラベル
  ctx.fillStyle = '#333333';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';

  // 建物寸法ラベル
  const hasEaves = eaveNorth > 0 || eaveEast > 0 || eaveSouth > 0 || eaveWest > 0;
  const extraOffset = hasEaves ? 40 : 0;

  // 東西寸法（下）
  const ewLabelText = `建物 ${buildingWidthEW.toFixed(1)}mm`;
  const ewLabelX = startX + canvasBuildingWidth / 2;
  const ewLabelY = startY + canvasBuildingHeight + 50 + extraOffset + Math.max(eaveSouth, 0);
  
  ctx.fillText(ewLabelText, ewLabelX, ewLabelY);
  
  // 東西寸法のクリック可能エリアを記録
  const ewTextMetrics = ctx.measureText(ewLabelText);
  const ewTextWidth = ewTextMetrics.width;
  const ewTextHeight = (ewTextMetrics.actualBoundingBoxAscent || 12) + (ewTextMetrics.actualBoundingBoxDescent || 4);
  newDimensionAreas.push({
    type: 'building',
    direction: 'width',
    x: ewLabelX - ewTextWidth / 2,
    y: ewLabelY - (ewTextMetrics.actualBoundingBoxAscent || 12),
    width: ewTextWidth,
    height: ewTextHeight,
    value: buildingWidthEW
  });

  // 南北寸法（右）
  const nsLabelX = startX + canvasBuildingWidth + 50 + extraOffset + Math.max(eaveEast, 0);
  const nsLabelY = startY + canvasBuildingHeight / 2;
  const nsLabelText = `建物 ${buildingWidthNS.toFixed(1)}mm`;
  
  ctx.save();
  ctx.translate(nsLabelX, nsLabelY);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(nsLabelText, 0, 0);
  ctx.restore();
  
  // 南北寸法のクリック可能エリアを記録（回転テキスト）
  const nsTextMetrics = ctx.measureText(nsLabelText);
  const nsTextWidth = nsTextMetrics.width;
  const nsTextHeight = (nsTextMetrics.actualBoundingBoxAscent || 12) + (nsTextMetrics.actualBoundingBoxDescent || 4);
  
  // 回転したテキストの場合、幅と高さが入れ替わる
  newDimensionAreas.push({
    type: 'building',
    direction: 'height',
    x: nsLabelX - nsTextHeight / 2,
    y: nsLabelY - nsTextWidth / 2,
    width: nsTextHeight,
    height: nsTextWidth,
    value: buildingWidthNS
  });

  // 軒の出ラベル
  if (hasEaves) {
    ctx.fillStyle = '#FF8C00';
    ctx.font = '14px Arial';

    if (data.eaves.north > 0) {
      ctx.textAlign = 'center';
      const northText = `軒 ${data.eaves.north.toFixed(1)}mm`;
      const northX = startX + canvasBuildingWidth / 2;
      const northY = startY - eaveNorth - 10;
      ctx.fillText(northText, northX, northY);
      
      // 北軒の出クリック可能エリア
      const northTextMetrics = ctx.measureText(northText);
      const northTextWidth = northTextMetrics.width;
      const northTextHeight = northTextMetrics.actualBoundingBoxAscent + northTextMetrics.actualBoundingBoxDescent;
      newDimensionAreas.push({
        type: 'eave',
        direction: 'north',
        x: northX - northTextWidth / 2,
        y: northY - northTextMetrics.actualBoundingBoxAscent,
        width: northTextWidth,
        height: northTextHeight,
        value: data.eaves.north
      });
    }
    
    if (data.eaves.south > 0) {
      ctx.textAlign = 'center';
      const southText = `軒 ${data.eaves.south.toFixed(1)}mm`;
      const southX = startX + canvasBuildingWidth / 2;
      const southY = startY + canvasBuildingHeight + eaveSouth + 25;
      ctx.fillText(southText, southX, southY);
      
      // 南軒の出クリック可能エリア
      const southTextMetrics = ctx.measureText(southText);
      const southTextWidth = southTextMetrics.width;
      const southTextHeight = southTextMetrics.actualBoundingBoxAscent + southTextMetrics.actualBoundingBoxDescent;
      newDimensionAreas.push({
        type: 'eave',
        direction: 'south',
        x: southX - southTextWidth / 2,
        y: southY - southTextMetrics.actualBoundingBoxAscent,
        width: southTextWidth,
        height: southTextHeight,
        value: data.eaves.south
      });
    }
    
    if (data.eaves.east > 0) {
      const eastText = `軒 ${data.eaves.east.toFixed(1)}mm`;
      const eastX = startX + canvasBuildingWidth + eaveEast + 15;
      const eastY = startY + canvasBuildingHeight / 2;
      
      ctx.save();
      ctx.translate(eastX, eastY);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(eastText, 0, 0);
      ctx.restore();
      
      // 東軒の出クリック可能エリア（回転テキスト）
      const eastTextMetrics = ctx.measureText(eastText);
      const eastTextWidth = eastTextMetrics.width;
      const eastTextHeight = eastTextMetrics.actualBoundingBoxAscent + eastTextMetrics.actualBoundingBoxDescent;
      
      // 回転したテキストの場合、幅と高さが入れ替わる
      newDimensionAreas.push({
        type: 'eave',
        direction: 'east',
        x: eastX - eastTextHeight / 2,
        y: eastY - eastTextWidth / 2,
        width: eastTextHeight,
        height: eastTextWidth,
        value: data.eaves.east
      });
    }
    
    if (data.eaves.west > 0) {
      const westText = `軒 ${data.eaves.west.toFixed(1)}mm`;
      const westX = startX - eaveWest - 15;
      const westY = startY + canvasBuildingHeight / 2;
      
      ctx.save();
      ctx.translate(westX, westY);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(westText, 0, 0);
      ctx.restore();
      
      // 西軒の出クリック可能エリア（回転テキスト）
      const westTextMetrics = ctx.measureText(westText);
      const westTextWidth = westTextMetrics.width;
      const westTextHeight = westTextMetrics.actualBoundingBoxAscent + westTextMetrics.actualBoundingBoxDescent;
      
      // 回転したテキストの場合、幅と高さが入れ替わる
      newDimensionAreas.push({
        type: 'eave',
        direction: 'west',
        x: westX - westTextHeight / 2,
        y: westY - westTextWidth / 2,
        width: westTextHeight,
        height: westTextWidth,
        value: data.eaves.west
      });
    }
  }
  
  // 寸法エリアとドラッグハンドルをstateに保存
  setDimensionAreas(newDimensionAreas);
  setDragHandles(newDragHandles);
};