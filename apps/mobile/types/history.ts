import { InputData, CalculationResult } from '../context/ScaffoldContext';

export interface CalculationHistory {
  id: string;
  createdAt: string;
  inputData: InputData;
  result: CalculationResult;
  title?: string;
  notes?: string;
}

export interface HistoryFilter {
  searchTerm: string;
  sortBy: 'date' | 'size';
  filterBy: 'all' | 'recent';
}

export interface HistorySummary {
  totalCalculations: number;
  averageFrameSize: number;
  mostUsedRoofShape: string;
  lastCalculation?: string;
}