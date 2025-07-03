'use client';

import React from 'react';
import { Edit3, Square, Move, ZoomIn, ZoomOut, Grid, Save, Undo, Redo } from 'lucide-react';

interface ToolbarProps {
  tool: 'select' | 'pan' | 'zoom';
  scale: number;
  showGrid: boolean;
  onToolChange: (tool: 'select' | 'pan' | 'zoom') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onGridToggle: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  scale,
  showGrid,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onGridToggle,
  onSave,
  onUndo,
  onRedo,
}) => {
  return (
    <div className="absolute top-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex items-center space-x-2 z-10">
      <button
        onClick={() => onToolChange('select')}
        className={`p-2 rounded transition-colors ${
          tool === 'select' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="選択ツール"
      >
        <Edit3 size={18} />
      </button>
      
      <button
        onClick={() => onToolChange('pan')}
        className={`p-2 rounded transition-colors ${
          tool === 'pan' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="パンツール"
      >
        <Move size={18} />
      </button>
      
      <button
        onClick={() => onToolChange('zoom')}
        className={`p-2 rounded transition-colors ${
          tool === 'zoom' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="ズームツール"
      >
        <Square size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-300" />
      
      <button
        onClick={onZoomIn}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="ズームイン"
      >
        <ZoomIn size={18} />
      </button>
      
      <button
        onClick={onZoomOut}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="ズームアウト"
      >
        <ZoomOut size={18} />
      </button>
      
      <span className="text-sm text-gray-500 px-2">
        {Math.round(scale * 100)}%
      </span>
      
      <div className="w-px h-6 bg-gray-300" />
      
      <button
        onClick={onGridToggle}
        className={`p-2 rounded transition-colors ${
          showGrid ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`}
        title="グリッド表示"
      >
        <Grid size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-300" />
      
      <button
        onClick={onUndo}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="元に戻す"
      >
        <Undo size={18} />
      </button>
      
      <button
        onClick={onRedo}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="やり直し"
      >
        <Redo size={18} />
      </button>
      
      <div className="w-px h-6 bg-gray-300" />
      
      <button
        onClick={onSave}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="保存"
      >
        <Save size={18} />
      </button>
    </div>
  );
};