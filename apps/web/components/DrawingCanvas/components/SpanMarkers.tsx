/**
 * スパンマーカー描画コンポーネント
 * 簡易計算結果のスパン構成に応じたマーカーを表示
 */

import React from 'react';
import { Circle, Group, Text } from 'react-konva';
import type { SpanMarkerData } from '../utils/quickAllocationMarkers';

export interface SpanMarkersProps {
  markerData: SpanMarkerData | null;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  scale: number;
  visible?: boolean;
  color?: string;
  radius?: number;
  showLabels?: boolean;
}

export const SpanMarkers: React.FC<SpanMarkersProps> = ({
  markerData,
  startX,
  startY,
  endX,
  endY,
  scale,
  visible = true,
  color = '#000000',
  radius = 4,
  showLabels = false
}) => {
  if (!visible || !markerData) {
    return null;
  }

  // 線の長さを計算
  const lineLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  
  // マーカー位置をキャンバス座標に変換
  const canvasMarkers = markerData.markerPositions.map(marker => {
    const positionRatio = marker.position / markerData.totalDistance;
    const x = startX + (endX - startX) * positionRatio;
    const y = startY + (endY - startY) * positionRatio;
    
    return {
      x,
      y,
      position: marker.position,
      index: marker.index,
      isStart: marker.isStart,
      isEnd: marker.isEnd
    };
  });

  // ラベルの表示位置を計算（線に垂直方向にオフセット）
  const getLabelPosition = (x: number, y: number) => {
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    if (length === 0) return { x, y: y - 20 };
    
    // 線に垂直な単位ベクトル
    const perpX = -dy / length;
    const perpY = dx / length;
    
    // ラベル位置（線から15px離れた位置）
    const labelOffset = 15;
    return {
      x: x + perpX * labelOffset,
      y: y + perpY * labelOffset
    };
  };

  return (
    <Group>
      {canvasMarkers.map((marker, index) => {
        const labelPos = getLabelPosition(marker.x, marker.y);
        
        return (
          <Group key={`span-marker-${index}`}>
            {/* マーカー円 */}
            <Circle
              x={marker.x}
              y={marker.y}
              radius={radius}
              fill={color}
              stroke={color}
              strokeWidth={1}
            />
            
            {/* 位置ラベル（オプション） */}
            {showLabels && (
              <Text
                x={labelPos.x - 20}
                y={labelPos.y - 8}
                width={40}
                height={16}
                text={`${marker.position}`}
                fontSize={10}
                fontFamily="Arial"
                fill={color}
                align="center"
                verticalAlign="middle"
              />
            )}
          </Group>
        );
      })}
      
      {/* スパン構成ラベル（線の中央に表示） */}
      {showLabels && (
        <Text
          x={(startX + endX) / 2 - 40}
          y={(startY + endY) / 2 - 25}
          width={80}
          height={20}
          text={markerData.spanComposition}
          fontSize={11}
          fontFamily="Arial"
          fill={color}
          align="center"
          verticalAlign="middle"
          stroke="white"
          strokeWidth={2}
        />
      )}
    </Group>
  );
};

/**
 * 複数の足場ラインにマーカーを表示するコンポーネント
 */
export interface MultipleSpanMarkersProps {
  markersData: Array<{
    id: string;
    markerData: SpanMarkerData;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  }>;
  scale: number;
  visible?: boolean;
  color?: string;
  radius?: number;
  showLabels?: boolean;
}

export const MultipleSpanMarkers: React.FC<MultipleSpanMarkersProps> = ({
  markersData,
  scale,
  visible = true,
  color = '#000000',
  radius = 4,
  showLabels = false
}) => {
  if (!visible || !markersData.length) {
    return null;
  }

  return (
    <Group>
      {markersData.map((data) => (
        <SpanMarkers
          key={data.id}
          markerData={data.markerData}
          startX={data.startX}
          startY={data.startY}
          endX={data.endX}
          endY={data.endY}
          scale={scale}
          visible={visible}
          color={color}
          radius={radius}
          showLabels={showLabels}
        />
      ))}
    </Group>
  );
};

export default SpanMarkers;