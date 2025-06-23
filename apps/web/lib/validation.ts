// 簡易バリデーション関数（zod未使用版）
import { MobileScaffoldInputData } from './calculator/types';

export function validateMobileScaffoldInput(data: MobileScaffoldInputData) {
  const errors: Record<string, string> = {};

  // 躯体幅のバリデーション
  if (!data.frameWidth.northSouth || data.frameWidth.northSouth <= 0) {
    errors['frameWidth.northSouth'] = '正の数値を入力してください';
  }
  if (!data.frameWidth.eastWest || data.frameWidth.eastWest <= 0) {
    errors['frameWidth.eastWest'] = '正の数値を入力してください';
  }

  // 基準高さのバリデーション
  if (!data.referenceHeight || data.referenceHeight <= 0) {
    errors['referenceHeight'] = '正の数値を入力してください';
  }

  // 軒の出のバリデーション
  if (data.eaveOverhang.north < 0) {
    errors['eaveOverhang.north'] = '0以上の数値を入力してください';
  }
  if (data.eaveOverhang.east < 0) {
    errors['eaveOverhang.east'] = '0以上の数値を入力してください';
  }
  if (data.eaveOverhang.south < 0) {
    errors['eaveOverhang.south'] = '0以上の数値を入力してください';
  }
  if (data.eaveOverhang.west < 0) {
    errors['eaveOverhang.west'] = '0以上の数値を入力してください';
  }

  // 軒先手摺のバリデーション
  if (data.eavesHandrails < 0) {
    errors['eavesHandrails'] = '0以上の数値を入力してください';
  }

  const hasErrors = Object.keys(errors).length > 0;
  return {
    success: !hasErrors,
    errors: hasErrors ? errors : null
  };
}