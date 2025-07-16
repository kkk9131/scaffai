# スパン構成最適化システム実装ドキュメント

## 概要

足場計算における最適なスパン構成を自動提案し、ユーザーの編集履歴から学習して改善していくシステムの実装ガイドです。

## システム設計

### アーキテクチャ

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Layer      │    │  Business Logic  │    │  Data Layer     │
│                 │    │                  │    │                 │
│ ・ドラッグ&ドロップ  │ ←→ │ ・ルールエンジン    │ ←→ │ ・Supabase      │
│ ・編集インターフェース │    │ ・最適化アルゴリズム │    │ ・ローカルストレージ │
│ ・推奨表示       │    │ ・学習システム     │    │ ・TensorFlow.js │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### データ構造

```typescript
// スパンパターンの基本データ構造
interface SpanPattern {
  id: string;
  edgeLength: number;           // 辺の長さ（mm）
  originalConfig: number[];     // 初期のスパン構成
  editedConfig: number[];       // 編集後のスパン構成
  conditions: SpanConditions;   // 編集時の条件
  timestamp: Date;
  userId?: string;
  usageCount: number;           // 使用回数
  satisfaction?: number;        // ユーザー満足度（1-5）
}

interface SpanConditions {
  edgeDirection: 'north' | 'east' | 'south' | 'west';
  hasOpenings: boolean;
  openingPositions?: number[];  // 開口部の位置（比率 0-1）
  cornerType?: 'inside' | 'outside' | 'straight';
  adjacentEdgeLengths?: number[]; // 隣接する辺の長さ
  projectType?: string;         // プロジェクトタイプ
}

// 最適化推奨結果
interface OptimizationResult {
  patterns: SpanPattern[];
  confidence: number;          // 信頼度（0-1）
  source: 'rule' | 'history' | 'ml' | 'user';
  reasoning: string;           // 推奨理由
}
```

## 実装フェーズ

### フェーズ1: 基礎実装（1-2週間）

#### 1.1 ルールベース最適化エンジン

```typescript
// packages/core/src/optimization/ruleEngine.ts
export class SpanRuleEngine {
  private rules: OptimizationRule[] = [
    {
      name: 'standard',
      condition: (length) => length > 0,
      optimize: this.standardOptimization
    },
    {
      name: 'edge-optimized',
      condition: (length) => length > 3600,
      optimize: this.edgeOptimization
    },
    {
      name: 'opening-aware',
      condition: (_, conditions) => conditions.hasOpenings,
      optimize: this.openingAwareOptimization
    }
  ];

  optimize(edgeLength: number, conditions: SpanConditions): OptimizationResult {
    const applicableRules = this.rules.filter(rule => 
      rule.condition(edgeLength, conditions)
    );
    
    const results = applicableRules.map(rule => ({
      pattern: rule.optimize(edgeLength, conditions),
      confidence: this.calculateConfidence(rule, edgeLength, conditions),
      source: 'rule' as const,
      reasoning: `${rule.name}ルールを適用`
    }));
    
    return results.sort((a, b) => b.confidence - a.confidence)[0];
  }

  private standardOptimization(length: number): number[] {
    const spanCount = Math.round(length / 1800);
    const spanSize = Math.round(length / spanCount);
    return Array(spanCount).fill(spanSize);
  }

  private edgeOptimization(length: number): number[] {
    const fullSpans = Math.floor(length / 1800);
    const remainder = length % 1800;
    
    if (remainder < 600) {
      // 小さな端部は避け、均等分割
      return this.standardOptimization(length);
    }
    
    // 端部を適切なサイズにする
    const edgeSpan = Math.round(remainder / 2);
    const result = [edgeSpan];
    for (let i = 0; i < fullSpans; i++) {
      result.push(1800);
    }
    result.push(length - result.reduce((sum, span) => sum + span, 0));
    
    return result;
  }

  private openingAwareOptimization(
    length: number, 
    conditions: SpanConditions
  ): number[] {
    // 開口部の位置を考慮した最適化
    const openingPositions = conditions.openingPositions || [];
    const basePattern = this.standardOptimization(length);
    
    // 開口部がスパン境界に近い場合は調整
    return this.adjustForOpenings(basePattern, openingPositions, length);
  }
}
```

#### 1.2 ドラッグ&ドロップUI実装

```typescript
// apps/web/components/SpanConfigEditor.tsx
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface SpanConfigEditorProps {
  edgeIndex: number;
  spanConfig: number[];
  onUpdate: (newConfig: number[]) => void;
}

export const SpanConfigEditor: React.FC<SpanConfigEditorProps> = ({
  edgeIndex,
  spanConfig,
  onUpdate
}) => {
  const [suggestions, setSuggestions] = useState<OptimizationResult[]>([]);
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const newConfig = Array.from(spanConfig);
    const [reorderedItem] = newConfig.splice(result.source.index, 1);
    newConfig.splice(result.destination.index, 0, reorderedItem);
    
    onUpdate(newConfig);
    
    // 編集履歴を保存
    saveEditHistory(spanConfig, newConfig, edgeIndex);
  };

  const handleSpanEdit = (index: number, newValue: number) => {
    const newConfig = [...spanConfig];
    newConfig[index] = newValue;
    onUpdate(newConfig);
  };

  const splitSpan = (index: number) => {
    const span = spanConfig[index];
    const half = Math.round(span / 2);
    const newConfig = [...spanConfig];
    newConfig.splice(index, 1, half, span - half);
    onUpdate(newConfig);
  };

  const mergeSpans = (index: number) => {
    if (index >= spanConfig.length - 1) return;
    const newConfig = [...spanConfig];
    const merged = newConfig[index] + newConfig[index + 1];
    newConfig.splice(index, 2, merged);
    onUpdate(newConfig);
  };

  return (
    <div className="span-config-editor">
      <div className="mb-4">
        <h4 className="font-medium mb-2">スパン構成編集</h4>
        
        {/* 推奨パターン表示 */}
        {suggestions.length > 0 && (
          <div className="mb-3">
            <h5 className="text-sm font-medium mb-1">推奨パターン</h5>
            {suggestions.slice(0, 3).map((suggestion, i) => (
              <button
                key={i}
                onClick={() => onUpdate(suggestion.patterns[0].editedConfig)}
                className="mr-2 mb-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 rounded"
              >
                {suggestion.patterns[0].editedConfig.join('+')} 
                <span className="ml-1 text-gray-600">
                  ({Math.round(suggestion.confidence * 100)}%)
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ドラッグ&ドロップエリア */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={`spans-${edgeIndex}`}>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`min-h-20 p-2 border-2 border-dashed rounded ${
                snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
              }`}
            >
              {spanConfig.map((span, index) => (
                <Draggable
                  key={`span-${index}`}
                  draggableId={`span-${edgeIndex}-${index}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`mb-2 p-3 bg-white border rounded shadow-sm ${
                        snapshot.isDragging ? 'shadow-lg' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          {...provided.dragHandleProps}
                          className="flex items-center cursor-grab"
                        >
                          <GripVertical className="w-4 h-4 text-gray-400 mr-2" />
                          <input
                            type="number"
                            value={span}
                            onChange={(e) => handleSpanEdit(index, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="ml-1 text-sm text-gray-600">mm</span>
                        </div>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => splitSpan(index)}
                            className="p-1 text-xs text-blue-600 hover:bg-blue-100 rounded"
                            title="分割"
                          >
                            <Split className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => mergeSpans(index)}
                            className="p-1 text-xs text-green-600 hover:bg-green-100 rounded"
                            title="結合"
                          >
                            <Merge className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              const newConfig = spanConfig.filter((_, i) => i !== index);
                              onUpdate(newConfig);
                            }}
                            className="p-1 text-xs text-red-600 hover:bg-red-100 rounded"
                            title="削除"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {/* スパン追加ボタン */}
              <button
                onClick={() => onUpdate([...spanConfig, 1800])}
                className="w-full mt-2 p-2 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:border-blue-400 hover:text-blue-600"
              >
                + スパンを追加
              </button>
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* 合計確認 */}
      <div className="mt-3 text-sm text-gray-600">
        合計: {spanConfig.reduce((sum, span) => sum + span, 0)}mm
      </div>
    </div>
  );
};
```

### フェーズ2: データ収集・履歴機能（3-4週間）

#### 2.1 Supabaseスキーマ設計

```sql
-- supabase/migrations/20241216000001_span_optimization.sql

-- スパン編集履歴テーブル
CREATE TABLE span_edit_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  project_id UUID,
  edge_index INTEGER NOT NULL,
  edge_length INTEGER NOT NULL,
  edge_direction TEXT NOT NULL CHECK (edge_direction IN ('north', 'east', 'south', 'west')),
  
  -- 編集前後のスパン構成
  original_config INTEGER[] NOT NULL,
  edited_config INTEGER[] NOT NULL,
  
  -- コンテキスト情報
  has_openings BOOLEAN DEFAULT FALSE,
  opening_positions REAL[],
  corner_type TEXT,
  adjacent_edge_lengths INTEGER[],
  project_type TEXT,
  
  -- メタデータ
  edit_type TEXT DEFAULT 'manual', -- 'manual', 'suggestion_applied', 'auto_optimized'
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- スパンパターン集計ビュー
CREATE VIEW span_pattern_analytics AS
SELECT 
  edge_length,
  edge_direction,
  has_openings,
  edited_config,
  COUNT(*) as usage_count,
  AVG(satisfaction_rating) as avg_satisfaction,
  MAX(created_at) as last_used
FROM span_edit_history 
WHERE satisfaction_rating IS NOT NULL
GROUP BY edge_length, edge_direction, has_openings, edited_config
HAVING COUNT(*) >= 2;

-- インデックス
CREATE INDEX idx_span_history_edge_length ON span_edit_history(edge_length);
CREATE INDEX idx_span_history_direction ON span_edit_history(edge_direction);
CREATE INDEX idx_span_history_user ON span_edit_history(user_id);
CREATE INDEX idx_span_history_created ON span_edit_history(created_at);

-- RLS ポリシー
ALTER TABLE span_edit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own edit history" ON span_edit_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own edit history" ON span_edit_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 集計データは全ユーザーが閲覧可能（個人情報除く）
CREATE POLICY "Analytics view is public" ON span_pattern_analytics
  FOR SELECT USING (true);
```

#### 2.2 データ収集サービス

```typescript
// packages/core/src/services/spanDataService.ts
export class SpanDataService {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  // 編集履歴を保存
  async saveEditHistory(
    edgeIndex: number,
    originalConfig: number[],
    editedConfig: number[],
    conditions: SpanConditions,
    editType: 'manual' | 'suggestion_applied' | 'auto_optimized' = 'manual'
  ): Promise<void> {
    const totalLength = originalConfig.reduce((sum, span) => sum + span, 0);
    
    try {
      const { error } = await this.supabase
        .from('span_edit_history')
        .insert({
          edge_index: edgeIndex,
          edge_length: totalLength,
          edge_direction: conditions.edgeDirection,
          original_config: originalConfig,
          edited_config: editedConfig,
          has_openings: conditions.hasOpenings,
          opening_positions: conditions.openingPositions,
          corner_type: conditions.cornerType,
          adjacent_edge_lengths: conditions.adjacentEdgeLengths,
          project_type: conditions.projectType,
          edit_type: editType
        });

      if (error) throw error;

      // ローカルストレージにもバックアップ
      this.saveToLocalStorage({
        originalConfig,
        editedConfig,
        conditions,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('編集履歴の保存に失敗:', error);
      // オフライン時はローカルストレージのみ
      this.saveToLocalStorage({
        originalConfig,
        editedConfig,
        conditions,
        timestamp: new Date()
      });
    }
  }

  // 類似パターンを検索
  async findSimilarPatterns(
    edgeLength: number,
    conditions: SpanConditions,
    tolerance: number = 200
  ): Promise<SpanPattern[]> {
    try {
      const { data, error } = await this.supabase
        .from('span_pattern_analytics')
        .select('*')
        .gte('edge_length', edgeLength - tolerance)
        .lte('edge_length', edgeLength + tolerance)
        .eq('edge_direction', conditions.edgeDirection)
        .eq('has_openings', conditions.hasOpenings)
        .order('usage_count', { ascending: false })
        .order('avg_satisfaction', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data?.map(this.convertToSpanPattern) || [];
    } catch (error) {
      console.error('類似パターンの検索に失敗:', error);
      return this.getLocalPatterns(edgeLength, conditions, tolerance);
    }
  }

  // 満足度評価を保存
  async rateSatisfaction(
    editHistoryId: string,
    rating: number
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('span_edit_history')
        .update({ satisfaction_rating: rating })
        .eq('id', editHistoryId);

      if (error) throw error;
    } catch (error) {
      console.error('満足度評価の保存に失敗:', error);
    }
  }

  // ユーザーの編集履歴を取得
  async getUserEditHistory(limit: number = 50): Promise<SpanPattern[]> {
    try {
      const { data, error } = await this.supabase
        .from('span_edit_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(this.convertToSpanPattern) || [];
    } catch (error) {
      console.error('編集履歴の取得に失敗:', error);
      return [];
    }
  }

  private saveToLocalStorage(pattern: any): void {
    try {
      const existing = JSON.parse(localStorage.getItem('spanPatterns') || '[]');
      existing.push(pattern);
      
      // 最大1000件まで保持
      if (existing.length > 1000) {
        existing.splice(0, existing.length - 1000);
      }
      
      localStorage.setItem('spanPatterns', JSON.stringify(existing));
    } catch (error) {
      console.error('ローカルストレージへの保存に失敗:', error);
    }
  }

  private getLocalPatterns(
    edgeLength: number,
    conditions: SpanConditions,
    tolerance: number
  ): SpanPattern[] {
    try {
      const patterns = JSON.parse(localStorage.getItem('spanPatterns') || '[]');
      
      return patterns
        .filter((p: any) => {
          const totalLength = p.originalConfig.reduce((sum: number, span: number) => sum + span, 0);
          return Math.abs(totalLength - edgeLength) <= tolerance &&
                 p.conditions.edgeDirection === conditions.edgeDirection;
        })
        .slice(0, 10);
    } catch (error) {
      console.error('ローカルパターンの取得に失敗:', error);
      return [];
    }
  }

  private convertToSpanPattern(data: any): SpanPattern {
    return {
      id: data.id || `local-${Date.now()}`,
      edgeLength: data.edge_length,
      originalConfig: data.original_config || [],
      editedConfig: data.edited_config,
      conditions: {
        edgeDirection: data.edge_direction,
        hasOpenings: data.has_openings,
        openingPositions: data.opening_positions,
        cornerType: data.corner_type,
        adjacentEdgeLengths: data.adjacent_edge_lengths,
        projectType: data.project_type
      },
      timestamp: new Date(data.created_at || data.timestamp),
      userId: data.user_id,
      usageCount: data.usage_count || 1,
      satisfaction: data.avg_satisfaction
    };
  }
}
```

### フェーズ3: 統計的最適化（5-6週間）

#### 3.1 統計ベース推奨エンジン

```typescript
// packages/core/src/optimization/statisticalOptimizer.ts
export class StatisticalOptimizer {
  private dataService: SpanDataService;

  constructor(dataService: SpanDataService) {
    this.dataService = dataService;
  }

  async getOptimizedRecommendations(
    edgeLength: number,
    conditions: SpanConditions
  ): Promise<OptimizationResult[]> {
    const recommendations: OptimizationResult[] = [];

    // 1. 統計的に最も使用されているパターン
    const popularPatterns = await this.getPopularPatterns(edgeLength, conditions);
    if (popularPatterns.length > 0) {
      recommendations.push({
        patterns: popularPatterns,
        confidence: this.calculateStatisticalConfidence(popularPatterns),
        source: 'history',
        reasoning: `類似条件で${popularPatterns[0].usageCount}回使用された実績パターン`
      });
    }

    // 2. 満足度が高いパターン
    const highRatedPatterns = await this.getHighRatedPatterns(edgeLength, conditions);
    if (highRatedPatterns.length > 0) {
      recommendations.push({
        patterns: highRatedPatterns,
        confidence: this.calculateSatisfactionConfidence(highRatedPatterns),
        source: 'history',
        reasoning: `平均満足度${highRatedPatterns[0].satisfaction?.toFixed(1)}の高評価パターン`
      });
    }

    // 3. 最近のトレンド
    const trendingPatterns = await this.getTrendingPatterns(edgeLength, conditions);
    if (trendingPatterns.length > 0) {
      recommendations.push({
        patterns: trendingPatterns,
        confidence: 0.6,
        source: 'history',
        reasoning: '最近よく使用されているパターン'
      });
    }

    // 4. ユーザー個人の傾向
    const personalPatterns = await this.getPersonalPatterns(edgeLength, conditions);
    if (personalPatterns.length > 0) {
      recommendations.push({
        patterns: personalPatterns,
        confidence: 0.8,
        source: 'user',
        reasoning: 'あなたがよく使用するパターン'
      });
    }

    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // 上位5つまで
  }

  private async getPopularPatterns(
    edgeLength: number,
    conditions: SpanConditions
  ): Promise<SpanPattern[]> {
    return this.dataService.findSimilarPatterns(edgeLength, conditions)
      .then(patterns => 
        patterns
          .filter(p => p.usageCount >= 3)
          .sort((a, b) => b.usageCount - a.usageCount)
          .slice(0, 3)
      );
  }

  private async getHighRatedPatterns(
    edgeLength: number,
    conditions: SpanConditions
  ): Promise<SpanPattern[]> {
    return this.dataService.findSimilarPatterns(edgeLength, conditions)
      .then(patterns => 
        patterns
          .filter(p => p.satisfaction && p.satisfaction >= 4.0)
          .sort((a, b) => (b.satisfaction || 0) - (a.satisfaction || 0))
          .slice(0, 3)
      );
  }

  private async getTrendingPatterns(
    edgeLength: number,
    conditions: SpanConditions
  ): Promise<SpanPattern[]> {
    // 過去30日のデータから傾向を分析
    const recentThreshold = new Date();
    recentThreshold.setDate(recentThreshold.getDate() - 30);

    return this.dataService.findSimilarPatterns(edgeLength, conditions)
      .then(patterns => 
        patterns
          .filter(p => p.timestamp > recentThreshold)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 3)
      );
  }

  private async getPersonalPatterns(
    edgeLength: number,
    conditions: SpanConditions
  ): Promise<SpanPattern[]> {
    const userHistory = await this.dataService.getUserEditHistory(100);
    
    return userHistory
      .filter(p => {
        return Math.abs(p.edgeLength - edgeLength) <= 300 &&
               p.conditions.edgeDirection === conditions.edgeDirection;
      })
      .slice(0, 3);
  }

  private calculateStatisticalConfidence(patterns: SpanPattern[]): number {
    if (patterns.length === 0) return 0;
    
    const totalUsage = patterns.reduce((sum, p) => sum + p.usageCount, 0);
    const maxUsage = Math.max(...patterns.map(p => p.usageCount));
    
    // 使用回数が多いほど信頼度が高い（最大0.9）
    return Math.min(0.9, (maxUsage / Math.max(totalUsage, 10)) + 0.3);
  }

  private calculateSatisfactionConfidence(patterns: SpanPattern[]): number {
    if (patterns.length === 0) return 0;
    
    const avgSatisfaction = patterns.reduce((sum, p) => sum + (p.satisfaction || 0), 0) / patterns.length;
    
    // 満足度を信頼度に変換（1-5 → 0.2-1.0）
    return (avgSatisfaction - 1) / 4 * 0.8 + 0.2;
  }
}
```

### フェーズ4: 機械学習システム（7-10週間）

#### 4.1 TensorFlow.js実装

```typescript
// packages/core/src/ml/spanMLModel.ts
import * as tf from '@tensorflow/tfjs';

export class SpanMLModel {
  private model: tf.Sequential | null = null;
  private isTraining = false;
  private trainingProgress = 0;

  // モデルの作成
  createModel(): void {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [8], // 入力特徴量数
          units: 32,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({
          units: 8,
          activation: 'sigmoid' // 最大8スパンを想定
        })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });
  }

  // 特徴量の抽出
  private extractFeatures(
    edgeLength: number,
    conditions: SpanConditions
  ): number[] {
    return [
      edgeLength / 10000,                                    // 正規化された辺の長さ
      conditions.edgeDirection === 'north' ? 1 : 0,         // 方向（北）
      conditions.edgeDirection === 'east' ? 1 : 0,          // 方向（東）
      conditions.edgeDirection === 'south' ? 1 : 0,         // 方向（南）
      conditions.hasOpenings ? 1 : 0,                       // 開口部有無
      (conditions.openingPositions?.length || 0) / 5,       // 開口部数（正規化）
      conditions.cornerType === 'inside' ? 1 : 0,           // 入隅
      (conditions.adjacentEdgeLengths?.[0] || 0) / 10000    // 隣接辺長（正規化）
    ];
  }

  // 訓練データの準備
  private prepareTrainingData(patterns: SpanPattern[]): {
    inputs: tf.Tensor2D;
    outputs: tf.Tensor2D;
  } {
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    patterns.forEach(pattern => {
      const features = this.extractFeatures(pattern.edgeLength, pattern.conditions);
      inputs.push(features);

      // 出力：各位置にスパンがあるかの確率（最大8分割）
      const spanOutput = this.encodeSpanConfig(pattern.editedConfig, pattern.edgeLength);
      outputs.push(spanOutput);
    });

    return {
      inputs: tf.tensor2d(inputs),
      outputs: tf.tensor2d(outputs)
    };
  }

  // スパン構成をモデル出力形式にエンコード
  private encodeSpanConfig(spanConfig: number[], totalLength: number): number[] {
    const encoded = new Array(8).fill(0);
    let currentPos = 0;

    spanConfig.forEach((span, index) => {
      if (index < 8) {
        const position = currentPos / totalLength;
        encoded[index] = Math.min(1, span / 2400); // 最大2400mmで正規化
        currentPos += span;
      }
    });

    return encoded;
  }

  // スパン構成をモデル出力からデコード
  private decodeSpanConfig(prediction: number[], totalLength: number): number[] {
    const spans: number[] = [];
    let remainingLength = totalLength;

    prediction.forEach((prob, index) => {
      if (prob > 0.1 && remainingLength > 0) { // 閾値以上の場合のみ
        const spanLength = Math.round(prob * 2400); // 正規化を戻す
        const actualSpan = Math.min(spanLength, remainingLength);
        if (actualSpan > 300) { // 最小300mm
          spans.push(actualSpan);
          remainingLength -= actualSpan;
        }
      }
    });

    // 残りがある場合は最後のスパンに加算
    if (remainingLength > 0 && spans.length > 0) {
      spans[spans.length - 1] += remainingLength;
    } else if (spans.length === 0) {
      spans.push(totalLength);
    }

    return spans;
  }

  // モデルの訓練
  async trainModel(
    patterns: SpanPattern[],
    validationSplit: number = 0.2,
    epochs: number = 100,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    if (!this.model) {
      this.createModel();
    }

    if (patterns.length < 50) {
      throw new Error('訓練には最低50件のデータが必要です');
    }

    this.isTraining = true;
    this.trainingProgress = 0;

    try {
      const { inputs, outputs } = this.prepareTrainingData(patterns);

      const history = await this.model!.fit(inputs, outputs, {
        epochs,
        validationSplit,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            this.trainingProgress = ((epoch + 1) / epochs) * 100;
            onProgress?.(this.trainingProgress);
            console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss?.toFixed(4)}`);
          }
        }
      });

      // モデルを保存
      await this.saveModel();

      inputs.dispose();
      outputs.dispose();

    } catch (error) {
      console.error('モデル訓練エラー:', error);
      throw error;
    } finally {
      this.isTraining = false;
    }
  }

  // 予測の実行
  async predict(
    edgeLength: number,
    conditions: SpanConditions
  ): Promise<{ config: number[]; confidence: number }> {
    if (!this.model) {
      await this.loadModel();
      if (!this.model) {
        throw new Error('モデルが利用できません');
      }
    }

    const features = this.extractFeatures(edgeLength, conditions);
    const input = tf.tensor2d([features]);

    try {
      const prediction = this.model.predict(input) as tf.Tensor;
      const predictionData = await prediction.data();
      
      const spanConfig = this.decodeSpanConfig(Array.from(predictionData), edgeLength);
      const confidence = this.calculatePredictionConfidence(predictionData);

      return {
        config: spanConfig,
        confidence
      };

    } finally {
      input.dispose();
    }
  }

  // 予測信頼度の計算
  private calculatePredictionConfidence(prediction: Float32Array): number {
    // 予測値の分散が小さいほど信頼度が高い
    const mean = Array.from(prediction).reduce((sum, val) => sum + val, 0) / prediction.length;
    const variance = Array.from(prediction).reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / prediction.length;
    
    return Math.max(0.3, Math.min(0.9, 1 - variance));
  }

  // モデルの保存
  async saveModel(): Promise<void> {
    if (!this.model) return;

    try {
      await this.model.save('localstorage://span-optimization-model');
      console.log('モデルを保存しました');
    } catch (error) {
      console.error('モデル保存エラー:', error);
    }
  }

  // モデルの読み込み
  async loadModel(): Promise<void> {
    try {
      this.model = await tf.loadLayersModel('localstorage://span-optimization-model');
      console.log('モデルを読み込みました');
    } catch (error) {
      console.log('保存されたモデルが見つかりません。新しいモデルを作成します。');
      this.createModel();
    }
  }

  // 訓練状況の取得
  getTrainingStatus(): { isTraining: boolean; progress: number } {
    return {
      isTraining: this.isTraining,
      progress: this.trainingProgress
    };
  }
}
```

#### 4.2 統合最適化システム

```typescript
// packages/core/src/optimization/optimizationManager.ts
export class OptimizationManager {
  private ruleEngine: SpanRuleEngine;
  private statisticalOptimizer: StatisticalOptimizer;
  private mlModel: SpanMLModel;
  private dataService: SpanDataService;

  constructor(
    dataService: SpanDataService,
    enableML: boolean = true
  ) {
    this.dataService = dataService;
    this.ruleEngine = new SpanRuleEngine();
    this.statisticalOptimizer = new StatisticalOptimizer(dataService);
    
    if (enableML) {
      this.mlModel = new SpanMLModel();
      this.mlModel.loadModel();
    }
  }

  // 統合的な最適化推奨
  async getRecommendations(
    edgeLength: number,
    conditions: SpanConditions
  ): Promise<OptimizationResult[]> {
    const recommendations: OptimizationResult[] = [];

    try {
      // 1. ルールベース推奨（常に利用可能）
      const ruleResult = this.ruleEngine.optimize(edgeLength, conditions);
      recommendations.push(ruleResult);

      // 2. 統計ベース推奨（データがある場合）
      const statisticalResults = await this.statisticalOptimizer
        .getOptimizedRecommendations(edgeLength, conditions);
      recommendations.push(...statisticalResults);

      // 3. ML推奨（モデルが利用可能な場合）
      if (this.mlModel) {
        try {
          const mlPrediction = await this.mlModel.predict(edgeLength, conditions);
          if (mlPrediction.confidence > 0.5) {
            recommendations.push({
              patterns: [{
                id: `ml-${Date.now()}`,
                edgeLength,
                originalConfig: [],
                editedConfig: mlPrediction.config,
                conditions,
                timestamp: new Date(),
                usageCount: 0
              }],
              confidence: mlPrediction.confidence,
              source: 'ml',
              reasoning: 'AI による最適化予測'
            });
          }
        } catch (error) {
          console.warn('ML予測でエラーが発生:', error);
        }
      }

      // 信頼度順にソート
      return recommendations
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

    } catch (error) {
      console.error('推奨取得エラー:', error);
      
      // エラー時はルールベースのみ返す
      return [this.ruleEngine.optimize(edgeLength, conditions)];
    }
  }

  // ML モデルの再訓練
  async retrainModel(onProgress?: (progress: number) => void): Promise<void> {
    if (!this.mlModel) {
      throw new Error('ML機能が無効です');
    }

    // 十分なデータがあるかチェック
    const recentPatterns = await this.dataService.getUserEditHistory(1000);
    
    if (recentPatterns.length < 100) {
      throw new Error('訓練には最低100件の編集履歴が必要です');
    }

    console.log(`${recentPatterns.length}件のデータでモデルを訓練します...`);
    
    await this.mlModel.trainModel(
      recentPatterns,
      0.2, // 20%をバリデーション用
      50,  // エポック数
      onProgress
    );

    console.log('モデルの再訓練が完了しました');
  }

  // システム統計の取得
  async getSystemStats(): Promise<{
    totalPatterns: number;
    recentActivity: number;
    mlStatus: string;
    topPatterns: SpanPattern[];
  }> {
    const userHistory = await this.dataService.getUserEditHistory(100);
    const recentThreshold = new Date();
    recentThreshold.setDate(recentThreshold.getDate() - 7);
    
    const recentActivity = userHistory.filter(p => p.timestamp > recentThreshold).length;
    
    let mlStatus = 'disabled';
    if (this.mlModel) {
      const { isTraining } = this.mlModel.getTrainingStatus();
      mlStatus = isTraining ? 'training' : 'ready';
    }

    return {
      totalPatterns: userHistory.length,
      recentActivity,
      mlStatus,
      topPatterns: userHistory.slice(0, 5)
    };
  }
}
```

## 使用方法

### 基本的な使用例

```typescript
// apps/web/pages/draw.tsx での統合例
const DrawPage: React.FC = () => {
  const [optimizationManager, setOptimizationManager] = useState<OptimizationManager | null>(null);
  
  useEffect(() => {
    const initOptimization = async () => {
      const supabase = createClientComponentClient();
      const dataService = new SpanDataService(supabase);
      const manager = new OptimizationManager(dataService, true);
      setOptimizationManager(manager);
    };
    
    initOptimization();
  }, []);

  const handleSpanConfigEdit = async (
    edgeIndex: number,
    originalConfig: number[],
    newConfig: number[]
  ) => {
    if (!optimizationManager) return;

    // 編集を保存
    await optimizationManager.dataService.saveEditHistory(
      edgeIndex,
      originalConfig,
      newConfig,
      getCurrentEdgeConditions(edgeIndex)
    );

    // 新しい推奨を取得
    const recommendations = await optimizationManager.getRecommendations(
      newConfig.reduce((sum, span) => sum + span, 0),
      getCurrentEdgeConditions(edgeIndex)
    );

    setSuggestions(recommendations);
  };

  return (
    <div>
      {/* 既存のDrawingEditor */}
      <DrawingEditor {...props} />
      
      {/* スパン構成編集パネル */}
      {allocationResult && (
        <SpanOptimizationPanel
          edgeCalculations={allocationResult.edgeCalculations}
          optimizationManager={optimizationManager}
          onConfigUpdate={handleSpanConfigEdit}
        />
      )}
    </div>
  );
};
```

## テスト戦略

### 単体テスト

```typescript
// packages/core/src/optimization/__tests__/ruleEngine.test.ts
describe('SpanRuleEngine', () => {
  let ruleEngine: SpanRuleEngine;

  beforeEach(() => {
    ruleEngine = new SpanRuleEngine();
  });

  test('標準的な長さで適切な分割を行う', () => {
    const result = ruleEngine.optimize(5400, {
      edgeDirection: 'north',
      hasOpenings: false
    });

    expect(result.patterns[0].editedConfig).toEqual([1800, 1800, 1800]);
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  test('端部最適化が適切に動作する', () => {
    const result = ruleEngine.optimize(4200, {
      edgeDirection: 'east',
      hasOpenings: false
    });

    const config = result.patterns[0].editedConfig;
    expect(config.reduce((sum, span) => sum + span, 0)).toBe(4200);
    expect(Math.min(...config)).toBeGreaterThan(500); // 最小スパンが500mm以上
  });
});
```

### 統合テスト

```typescript
// apps/web/__tests__/span-optimization.test.ts
describe('スパン最適化統合テスト', () => {
  test('編集からデータ保存まで正常に動作する', async () => {
    const mockSupabase = createMockSupabaseClient();
    const dataService = new SpanDataService(mockSupabase);
    const manager = new OptimizationManager(dataService, false);

    // 編集履歴を保存
    await dataService.saveEditHistory(
      0,
      [1800, 1800, 1800],
      [1200, 1800, 2400],
      {
        edgeDirection: 'north',
        hasOpenings: false
      }
    );

    // 推奨を取得
    const recommendations = await manager.getRecommendations(5400, {
      edgeDirection: 'north',
      hasOpenings: false
    });

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].confidence).toBeGreaterThan(0);
  });
});
```

## パフォーマンス考慮事項

### 1. データ量の管理
- ローカルストレージ：最大1000件
- 定期的な古いデータの削除
- インデックスの適切な設定

### 2. ML モデルの最適化
- モデルサイズの制限（<10MB）
- 推論の高速化（<100ms）
- バックグラウンド訓練

### 3. UI レスポンス
- 推奨表示の遅延読み込み
- 編集のリアルタイム反映
- プログレス表示

## セキュリティ・プライバシー

### データ保護
- 個人識別可能情報の除去
- 集計データのみの共有
- GDPR準拠のデータ管理

### モデルの検証
- 予測結果の妥当性チェック
- 異常値の検出と除外
- ユーザーの最終承認

## 今後の拡張可能性

### 高度な機械学習
- 深層学習モデルの導入
- 強化学習による継続改善
- 自然言語による条件指定

### クラウド連携
- モデルのクラウド訓練
- リアルタイム協調最適化
- 業界ベンチマークとの比較

### 他システムとの統合
- CADソフトウェアとの連携
- 施工管理システムとの統合
- IoTデータの活用

---

このドキュメントに基づいて段階的に実装を進めることで、実用的なスパン構成最適化システムを構築できます。各フェーズの完了後に次のフェーズに進むことで、リスクを最小化しながら価値を提供し続けることが可能です。