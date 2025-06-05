import { SCAFFOLD_CONSTANTS, NORMAL_PARTS } from './types';

const { STANDARD_PART_SIZE } = SCAFFOLD_CONSTANTS;

/**
 * 基本幅を計算（1800mm単位で切り捨て）
 */
export function baseWidth(width: number, unit: number = STANDARD_PART_SIZE): number {
  return width - (width % unit);
}

/**
 * 調整長さを計算
 */
export function adjustLength(
  width: number, 
  eaves: number, 
  margin: number = SCAFFOLD_CONSTANTS.EAVES_MARGIN_THRESHOLD_ADDITION
): number {
  const remainder = width % STANDARD_PART_SIZE;
  const sideSpace = (eaves + margin) * 2;
  return remainder + sideSpace;
}

/**
 * 最適な部材組み合わせを選択
 * target_length以上で最小の組み合わせを返す
 */
export function selectParts(
  targetLength: number, 
  partsOptions: readonly number[] = NORMAL_PARTS, 
  maxItems: number = 4
): number[] {
  if (targetLength <= 0) return [];
  
  let best: number[] | null = null;
  
  for (let rCount = 1; rCount <= maxItems; rCount++) {
    const combinations = generateCombinations([...partsOptions], rCount);
    
    for (const combo of combinations) {
      const total = combo.reduce((sum, part) => sum + part, 0);
      
      if (total >= targetLength) {
        if (best === null || 
            total < best.reduce((sum, part) => sum + part, 0) ||
            (total === best.reduce((sum, part) => sum + part, 0) && 
             combo.filter(p => p === STANDARD_PART_SIZE).length > 
             best.filter(p => p === STANDARD_PART_SIZE).length)) {
          best = [...combo];
        }
      }
    }
  }
  
  return best || [];
}

/**
 * 配列の組み合わせを生成
 */
function generateCombinations(arr: number[], size: number): number[][] {
  if (size === 1) return arr.map(item => [item]);
  
  const result: number[][] = [];
  
  function combine(current: number[], remaining: number[], depth: number) {
    if (depth === size) {
      result.push([...current]);
      return;
    }
    
    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      combine(current, remaining, depth + 1);
      current.pop();
    }
  }
  
  combine([], arr, 0);
  return result;
}

/**
 * 総スパンを計算
 */
export function totalSpan(base: number, adjustPartsList: number[]): number {
  return base + adjustPartsList.reduce((sum, part) => sum + part, 0);
}

/**
 * スパン部材を整形してテキスト化
 */
export function formatSpanParts(partsToFormat: number[]): string {
  const count = new Map<number, number>();
  
  partsToFormat.forEach(part => {
    count.set(part, (count.get(part) || 0) + 1);
  });
  
  const result: string[] = [];
  
  // 1800mmは "Nspan" として表示
  if (count.has(STANDARD_PART_SIZE)) {
    const spanCount = count.get(STANDARD_PART_SIZE)!;
    result.push(`${spanCount}span`);
    count.delete(STANDARD_PART_SIZE);
  }
  
  // 残りの部材を降順でソート
  const sortedParts = Array.from(count.entries())
    .sort(([a], [b]) => b - a)
    .flatMap(([part, cnt]) => Array(cnt).fill(part));
  
  result.push(...sortedParts.map(part => part.toString()));
  
  return result.join(', ');
}