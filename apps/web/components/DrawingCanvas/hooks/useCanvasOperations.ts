import { useState, useRef } from 'react';

export interface CanvasOperations {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  showGrid: boolean;
  setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;
  tool: 'select' | 'pan' | 'zoom';
  setTool: React.Dispatch<React.SetStateAction<'select' | 'pan' | 'zoom'>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  isPanning: boolean;
  setIsPanning: React.Dispatch<React.SetStateAction<boolean>>;
  panStartPos: { x: number; y: number } | null;
  setPanStartPos: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  panStartOffset: { x: number; y: number } | null;
  setPanStartOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
}

export const useCanvasOperations = (): CanvasOperations => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [tool, setTool] = useState<'select' | 'pan' | 'zoom'>('select');
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPos, setPanStartPos] = useState<{ x: number; y: number } | null>(null);
  const [panStartOffset, setPanStartOffset] = useState<{ x: number; y: number } | null>(null);

  return {
    canvasRef,
    scale,
    setScale,
    pan,
    setPan,
    showGrid,
    setShowGrid,
    tool,
    setTool,
    isDragging,
    setIsDragging,
    isPanning,
    setIsPanning,
    panStartPos,
    setPanStartPos,
    panStartOffset,
    setPanStartOffset,
  };
};