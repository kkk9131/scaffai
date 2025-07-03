'use client';

import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FloorData, FloorColors } from '../types/drawing';
import { FLOOR_COLORS } from '../types/drawing';

interface FloorManagerProps {
  floors: FloorData[];
  activeFloorId: string;
  rightPanelCollapsed: boolean;
  draggedFloorId: string | null;
  dropTargetFloorId: string | null;
  nextFloorNumber: number;
  onFloorAdd: () => void;
  onFloorDelete: (floorId: string) => void;
  onFloorSelect: (floorId: string) => void;
  onFloorToggleVisibility: (floorId: string) => void;
  onFloorRename: (floorId: string, newName: string) => void;
  onRightPanelToggle: () => void;
  onFloorDragStart: (floorId: string) => void;
  onFloorDragEnd: () => void;
  onFloorDragOver: (e: React.DragEvent, floorId: string) => void;
  onFloorDrop: (e: React.DragEvent, targetFloorId: string) => void;
}

export const FloorManager: React.FC<FloorManagerProps> = ({
  floors,
  activeFloorId,
  rightPanelCollapsed,
  draggedFloorId,
  dropTargetFloorId,
  nextFloorNumber,
  onFloorAdd,
  onFloorDelete,
  onFloorSelect,
  onFloorToggleVisibility,
  onFloorRename,
  onRightPanelToggle,
  onFloorDragStart,
  onFloorDragEnd,
  onFloorDragOver,
  onFloorDrop,
}) => {
  const getFloorColors = (floorNumber: number): FloorColors => {
    return FLOOR_COLORS[floorNumber] || FLOOR_COLORS[1];
  };

  return (
    <div className={`absolute top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg transition-all duration-300 ${rightPanelCollapsed ? 'w-12' : 'w-80'} z-10`}>
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        {!rightPanelCollapsed && (
          <h3 className="text-sm font-medium text-gray-700">階層管理</h3>
        )}
        <button
          onClick={onRightPanelToggle}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {rightPanelCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {!rightPanelCollapsed && (
        <div className="p-3 space-y-3">
          <button
            onClick={onFloorAdd}
            className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            + 階層追加
          </button>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {floors.map((floor, index) => {
              const floorNumber = floors.length - index;
              const colors = getFloorColors(floorNumber);
              const isActive = floor.id === activeFloorId;
              const isDragged = floor.id === draggedFloorId;
              const isDropTarget = floor.id === dropTargetFloorId;

              return (
                <div
                  key={floor.id}
                  draggable
                  onDragStart={() => onFloorDragStart(floor.id)}
                  onDragEnd={onFloorDragEnd}
                  onDragOver={(e) => onFloorDragOver(e, floor.id)}
                  onDrop={(e) => onFloorDrop(e, floor.id)}
                  className={`
                    p-3 border rounded-lg cursor-move transition-all duration-200
                    ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
                    ${isDragged ? 'opacity-50 scale-95' : ''}
                    ${isDropTarget ? 'border-green-500 bg-green-50' : ''}
                    hover:shadow-md
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: colors.building }}
                      />
                      <input
                        type="text"
                        value={floor.name}
                        onChange={(e) => onFloorRename(floor.id, e.target.value)}
                        className="text-sm font-medium bg-transparent border-none outline-none text-gray-700 flex-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onFloorToggleVisibility(floor.id);
                        }}
                        className={`p-1 rounded text-xs transition-colors ${
                          floor.visible 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {floor.visible ? '表示' : '非表示'}
                      </button>
                      
                      {floors.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onFloorDelete(floor.id);
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded text-xs"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>高さ: {floor.height}mm</div>
                    <div>頂点: {floor.vertices.length}個</div>
                    <div>軒: {floor.eaves.length}個</div>
                    <div>開口: {floor.openings.length}個</div>
                  </div>

                  <button
                    onClick={() => onFloorSelect(floor.id)}
                    className={`
                      w-full mt-2 px-2 py-1 text-xs rounded transition-colors
                      ${isActive 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {isActive ? '編集中' : '編集する'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};