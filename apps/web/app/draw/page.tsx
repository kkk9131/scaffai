'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ThemeProvider } from '../../contexts/ThemeContext';
import Sidebar from '../../components/layout/Sidebar';
import DrawingEditor from '../../components/DrawingCanvas/DrawingEditor';
import type { ScaffoldCalculationResult, ExtendedScaffoldCalculationResult, ScaffoldInputData } from '../../lib/calculator/types';

function DrawContent() {
  const searchParams = useSearchParams();
  const [calculationResult, setCalculationResult] = useState<ExtendedScaffoldCalculationResult | undefined>();
  const [inputData, setInputData] = useState<ScaffoldInputData | undefined>();
  const [autoGenerate, setAutoGenerate] = useState(false);

  useEffect(() => {
    // URLパラメータから自動生成フラグを取得
    const autoParam = searchParams?.get('auto');
    if (autoParam === 'true') {
      setAutoGenerate(true);
      
      // セッションストレージから計算結果を取得
      if (typeof window !== 'undefined') {
        try {
          const savedCalculationResult = sessionStorage.getItem('scaffoldCalculationResult');
          const savedInputData = sessionStorage.getItem('scaffoldInputData');
          
          if (savedCalculationResult && savedInputData) {
            const calcResult = JSON.parse(savedCalculationResult);
            const input = JSON.parse(savedInputData);
            
            // ExtendedScaffoldCalculationResultに変換
            const extendedResult: ExtendedScaffoldCalculationResult = {
              ...calcResult,
              success: true
            };
            
            setCalculationResult(extendedResult);
            setInputData(input);
            
            console.log('足場ライン生成用データを読み込みました:', { calcResult, input });
          } else {
            console.warn('セッションストレージに足場データが見つかりません');
          }
        } catch (error) {
          console.error('計算結果の読み込みエラー:', error);
        }
      }
    }
  }, [searchParams]);

  return (
    <DrawingEditor 
      calculationResult={calculationResult}
      inputData={inputData}
      autoGenerate={autoGenerate}
    />
  );
}

export default function DrawPage() {
  return (
    <ThemeProvider>
      <div className="flex h-screen" style={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <div className="flex-1" style={{ flex: 1 }}>
          <Suspense fallback={<div className="flex items-center justify-center h-full">読み込み中...</div>}>
            <DrawContent />
          </Suspense>
        </div>
      </div>
    </ThemeProvider>
  );
}