/**
 * 高度計算機能のエラーハンドリングとバリデーション
 */

import type { BuildingVertex, EdgeEave } from '../../components/DrawingCanvas/types/drawing';

interface InsideCornerEdge {
  edgeIndex: number;
  adjacentEdgeIndex: number;
  length: number;
  adjacentEdgeLength: number;
}

/**
 * バリデーション結果
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessages: string[];
  warningMessages: string[];
}

/**
 * 建物頂点のバリデーション
 */
export function validateBuildingVertices(vertices: BuildingVertex[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 最小頂点数チェック
  if (vertices.length < 3) {
    errors.push('建物の頂点が3点未満です。最低3点必要です。');
  }
  
  // 重複頂点チェック
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const vertex1 = vertices[i];
      const vertex2 = vertices[j];
      const distance = Math.sqrt(
        Math.pow(vertex1.x - vertex2.x, 2) + Math.pow(vertex1.y - vertex2.y, 2)
      );
      
      if (distance < 1) { // 1px未満は重複とみなす
        errors.push(`頂点${i}と頂点${j}が重複しています（距離: ${distance.toFixed(2)}px）`);
      }
    }
  }
  
  // 最小辺長チェック
  for (let i = 0; i < vertices.length; i++) {
    const vertex1 = vertices[i];
    const vertex2 = vertices[(i + 1) % vertices.length];
    const distance = Math.sqrt(
      Math.pow(vertex1.x - vertex2.x, 2) + Math.pow(vertex1.y - vertex2.y, 2)
    );
    
    if (distance < 10) { // 10px未満は短すぎる
      warnings.push(`辺${i}が短すぎます（長さ: ${distance.toFixed(2)}px）`);
    }
  }
  
  // 自己交差チェック（簡略化）
  if (vertices.length >= 4) {
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 2; j < vertices.length; j++) {
        if (j === vertices.length - 1 && i === 0) continue; // 隣接辺はスキップ
        
        const intersection = checkLineIntersection(
          vertices[i], vertices[(i + 1) % vertices.length],
          vertices[j], vertices[(j + 1) % vertices.length]
        );
        
        if (intersection) {
          errors.push(`辺${i}と辺${j}が交差しています`);
        }
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errorMessages: errors,
    warningMessages: warnings
  };
}

/**
 * 軒の出設定のバリデーション
 */
export function validateEdgeEaves(
  vertices: BuildingVertex[],
  edgeEaves: EdgeEave[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 軒の出データの整合性チェック
  if (edgeEaves.length !== vertices.length) {
    errors.push(`軒の出データ数（${edgeEaves.length}）と頂点数（${vertices.length}）が一致しません`);
  }
  
  // 各軒の出の妥当性チェック
  edgeEaves.forEach((eave, index) => {
    if (eave.edgeIndex !== index) {
      errors.push(`軒の出${index}のedgeIndexが不正です（期待値: ${index}, 実際: ${eave.edgeIndex}）`);
    }
    
    if (eave.distance < 0) {
      errors.push(`軒の出${index}が負の値です（${eave.distance}mm）`);
    }
    
    if (eave.distance > 2000) {
      warnings.push(`軒の出${index}が大きすぎます（${eave.distance}mm）`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errorMessages: errors,
    warningMessages: warnings
  };
}

/**
 * 入隅検出結果のバリデーション
 */
export function validateInsideCornerEdges(
  vertices: BuildingVertex[],
  insideCornerEdges: InsideCornerEdge[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 入隅辺の整合性チェック
  insideCornerEdges.forEach((edge, index) => {
    if (edge.edgeIndex < 0 || edge.edgeIndex >= vertices.length) {
      errors.push(`入隅辺${index}のedgeIndexが範囲外です（${edge.edgeIndex}）`);
    }
    
    if (edge.adjacentEdgeIndex < 0 || edge.adjacentEdgeIndex >= vertices.length) {
      errors.push(`入隅辺${index}のadjacentEdgeIndexが範囲外です（${edge.adjacentEdgeIndex}）`);
    }
    
    if (edge.length <= 0) {
      errors.push(`入隅辺${index}の長さが不正です（${edge.length}）`);
    }
    
    if (edge.adjacentEdgeLength <= 0) {
      errors.push(`入隅辺${index}の隣接辺長が不正です（${edge.adjacentEdgeLength}）`);
    }
  });
  
  // 重複チェック（入隅頂点1つに対して2つの辺は正常なので、異常な重複のみチェック）
  const edgeIndexCounts: Record<number, number> = {};
  insideCornerEdges.forEach(edge => {
    edgeIndexCounts[edge.edgeIndex] = (edgeIndexCounts[edge.edgeIndex] || 0) + 1;
  });
  
  Object.entries(edgeIndexCounts).forEach(([edgeIndex, count]) => {
    if (count > 2) {
      errors.push(`辺${edgeIndex}が${count}回登録されています（異常な重複）`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errorMessages: errors,
    warningMessages: warnings
  };
}

/**
 * 簡易計算データのバリデーション
 */
export function validateSimpleCalculationData(simpleData: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!simpleData) {
    errors.push('簡易計算データが存在しません');
    return { isValid: false, errorMessages: errors, warningMessages: warnings };
  }
  
  // 面の離れデータチェック
  if (!simpleData.faceDistances || typeof simpleData.faceDistances !== 'object') {
    errors.push('面の離れデータが不正です');
  } else {
    const requiredFaces = ['北', '東', '南', '西'];
    requiredFaces.forEach(face => {
      const distance = simpleData.faceDistances[face];
      if (typeof distance !== 'number' || distance <= 0) {
        errors.push(`${face}面の離れが不正です（${distance}）`);
      }
    });
  }
  
  // 面のスパンデータチェック
  if (!simpleData.faceSpans || typeof simpleData.faceSpans !== 'object') {
    errors.push('面のスパンデータが不正です');
  } else {
    Object.entries(simpleData.faceSpans).forEach(([face, spans]) => {
      if (!Array.isArray(spans)) {
        errors.push(`${face}面のスパン構成が配列ではありません`);
      } else {
        const spanArray = spans as number[];
        spanArray.forEach((span, index) => {
          if (typeof span !== 'number' || span <= 0) {
            errors.push(`${face}面のスパン${index}が不正です（${span}）`);
          }
        });
      }
    });
  }
  
  // 足場ライン境界チェック
  if (!simpleData.scaffoldBounds || typeof simpleData.scaffoldBounds !== 'object') {
    errors.push('足場ライン境界データが不正です');
  } else {
    const bounds = simpleData.scaffoldBounds;
    const requiredProps = ['minX', 'maxX', 'minY', 'maxY'];
    requiredProps.forEach(prop => {
      if (typeof bounds[prop] !== 'number') {
        errors.push(`足場ライン境界の${prop}が不正です`);
      }
    });
    
    if (bounds.minX >= bounds.maxX) {
      errors.push('足場ライン境界のX座標が不正です（minX >= maxX）');
    }
    
    if (bounds.minY >= bounds.maxY) {
      errors.push('足場ライン境界のY座標が不正です（minY >= maxY）');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errorMessages: errors,
    warningMessages: warnings
  };
}

/**
 * 高度計算実行前の総合バリデーション
 */
export function validateAdvancedCalculationInput(
  vertices: BuildingVertex[],
  edgeEaves: EdgeEave[],
  insideCornerEdges: InsideCornerEdge[],
  simpleData: any
): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  // 各バリデーションを実行
  const verticesResult = validateBuildingVertices(vertices);
  const eavesResult = validateEdgeEaves(vertices, edgeEaves);
  const insideCornerResult = validateInsideCornerEdges(vertices, insideCornerEdges);
  const simpleDataResult = validateSimpleCalculationData(simpleData);
  
  // 結果を統合
  allErrors.push(...verticesResult.errorMessages);
  allErrors.push(...eavesResult.errorMessages);
  allErrors.push(...insideCornerResult.errorMessages);
  allErrors.push(...simpleDataResult.errorMessages);
  
  allWarnings.push(...verticesResult.warningMessages);
  allWarnings.push(...eavesResult.warningMessages);
  allWarnings.push(...insideCornerResult.warningMessages);
  allWarnings.push(...simpleDataResult.warningMessages);
  
  return {
    isValid: allErrors.length === 0,
    errorMessages: allErrors,
    warningMessages: allWarnings
  };
}

/**
 * 線分の交差判定（簡略化）
 */
function checkLineIntersection(
  line1Start: BuildingVertex,
  line1End: BuildingVertex,
  line2Start: BuildingVertex,
  line2End: BuildingVertex
): boolean {
  // 簡略化された交差判定
  // 実際にはより精密な計算が必要
  const x1 = line1Start.x, y1 = line1Start.y;
  const x2 = line1End.x, y2 = line1End.y;
  const x3 = line2Start.x, y3 = line2Start.y;
  const x4 = line2End.x, y4 = line2End.y;
  
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-10) return false; // 平行線
  
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
  
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

/**
 * エラーメッセージの分類
 */
export function categorizeErrors(errors: string[]): {
  critical: string[];
  warning: string[];
  info: string[];
} {
  const critical: string[] = [];
  const warning: string[] = [];
  const info: string[] = [];
  
  errors.forEach(error => {
    if (error.includes('範囲外') || error.includes('存在しません') || error.includes('不正です')) {
      critical.push(error);
    } else if (error.includes('短すぎます') || error.includes('大きすぎます')) {
      warning.push(error);
    } else {
      info.push(error);
    }
  });
  
  return { critical, warning, info };
}