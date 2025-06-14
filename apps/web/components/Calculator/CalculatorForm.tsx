'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCalculatorStore, MobileScaffoldInputData } from '../../lib/stores/calculatorStore';
import { Building2, ArrowRight, Ruler, Settings, Wrench, MapPin, Target, Edit3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

export default function CalculatorForm() {
  const { inputData, updateInput, calculate, isCalculating, error } = useCalculatorStore();
  const router = useRouter();

  const handleInputChange = (data: Partial<MobileScaffoldInputData>) => {
    updateInput(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await calculate();
  };

  const handleGoToDrawingEditor = () => {
    // 入力データをセッションストレージに保存
    sessionStorage.setItem('drawingData', JSON.stringify({
      building: {
        width: inputData.frameWidth.eastWest,
        height: inputData.frameWidth.northSouth,
      },
      eaves: {
        north: inputData.eaveOverhang.north,
        east: inputData.eaveOverhang.east,
        south: inputData.eaveOverhang.south,
        west: inputData.eaveOverhang.west,
      },
      timestamp: Date.now(),
    }));
    
    // 作図エディタページへナビゲート
    router.push('/draw');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 躯体幅 */}
      <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h2 className="text-lg font-semibold">躯体幅</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">南北</label>
            <div className="relative">
              <input
                type="number"
                value={inputData.frameWidth.northSouth}
                onChange={(e) => handleInputChange({
                  frameWidth: {
                    ...inputData.frameWidth,
                    northSouth: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="例: 1000"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">東西</label>
            <div className="relative">
              <input
                type="number"
                value={inputData.frameWidth.eastWest}
                onChange={(e) => handleInputChange({
                  frameWidth: {
                    ...inputData.frameWidth,
                    eastWest: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="例: 1000"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
            </div>
          </div>
        </div>
      </section>

      {/* 軒の出 */}
      <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h2 className="text-lg font-semibold">軒の出</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">北</label>
            <div className="relative">
              <input
                type="number"
                value={inputData.eaveOverhang.north}
                onChange={(e) => handleInputChange({
                  eaveOverhang: {
                    ...inputData.eaveOverhang,
                    north: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="0"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">東</label>
            <div className="relative">
              <input
                type="number"
                value={inputData.eaveOverhang.east}
                onChange={(e) => handleInputChange({
                  eaveOverhang: {
                    ...inputData.eaveOverhang,
                    east: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="0"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">南</label>
            <div className="relative">
              <input
                type="number"
                value={inputData.eaveOverhang.south}
                onChange={(e) => handleInputChange({
                  eaveOverhang: {
                    ...inputData.eaveOverhang,
                    south: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="0"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">西</label>
            <div className="relative">
              <input
                type="number"
                value={inputData.eaveOverhang.west}
                onChange={(e) => handleInputChange({
                  eaveOverhang: {
                    ...inputData.eaveOverhang,
                    west: parseInt(e.target.value) || 0
                  }
                })}
                placeholder="0"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
            </div>
          </div>
        </div>
      </section>

      {/* 敷地境界線の有無 */}
      <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h2 className="text-lg font-semibold">敷地境界線の有無</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {(['north', 'east', 'south', 'west'] as const).map((direction) => {
            const labels = { north: '北', east: '東', south: '南', west: '西' };
            return (
              <div key={direction}>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inputData.propertyLine[direction]}
                    onChange={(e) => handleInputChange({
                      propertyLine: {
                        ...inputData.propertyLine,
                        [direction]: e.target.checked
                      },
                      propertyLineDistance: {
                        ...inputData.propertyLineDistance,
                        [direction]: e.target.checked ? 0 : null
                      }
                    })}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600"
                  />
                  <span>{labels[direction]}</span>
                </label>
              </div>
            );
          })}
        </div>
        
        {/* 境界線距離の入力フィールド（チェックされた面のみ表示） */}
        {Object.entries(inputData.propertyLine).some(([_, enabled]) => enabled) && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="text-sm font-medium mb-3 text-slate-600 dark:text-slate-400">敷地境界線距離</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['north', 'east', 'south', 'west'] as const).map((direction) => {
                const labels = { north: '北', east: '東', south: '南', west: '西' };
                if (!inputData.propertyLine[direction]) return null;
                
                return (
                  <div key={`distance-${direction}`}>
                    <label className="block text-sm font-medium mb-1">{labels[direction]}</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputData.propertyLineDistance[direction] || ''}
                        onChange={(e) => handleInputChange({
                          propertyLineDistance: {
                            ...inputData.propertyLineDistance,
                            [direction]: parseInt(e.target.value) || 0
                          }
                        })}
                        placeholder="距離"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 基準高さ・屋根形状 */}
      <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h2 className="text-lg font-semibold">基準高さ・屋根形状</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">基準高さ</label>
            <div className="relative">
              <input
                type="number"
                value={inputData.referenceHeight}
                onChange={(e) => handleInputChange({
                  referenceHeight: parseInt(e.target.value) || 0
                })}
                placeholder="2400"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
            </div>
          </div>

          {/* 屋根形状 */}
          <div>
            <label className="block text-sm font-medium mb-2">屋根の形状</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <input
                  type="radio"
                  name="roof_shape"
                  value="flat"
                  checked={inputData.roofShape === 'flat'}
                  onChange={(e) => handleInputChange({
                    roofShape: e.target.value as 'flat' | 'sloped' | 'roofDeck'
                  })}
                  className="w-4 h-4 text-blue-600"
                />
                <span>フラット</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                  フラットな屋根構造
                </span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <input
                  type="radio"
                  name="roof_shape"
                  value="sloped"
                  checked={inputData.roofShape === 'sloped'}
                  onChange={(e) => handleInputChange({
                    roofShape: e.target.value as 'flat' | 'sloped' | 'roofDeck'
                  })}
                  className="w-4 h-4 text-blue-600"
                />
                <span>勾配軒</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                  勾配のある屋根構造
                </span>
              </label>
              <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <input
                  type="radio"
                  name="roof_shape"
                  value="roofDeck"
                  checked={inputData.roofShape === 'roofDeck'}
                  onChange={(e) => handleInputChange({
                    roofShape: e.target.value as 'flat' | 'sloped' | 'roofDeck'
                  })}
                  className="w-4 h-4 text-blue-600"
                />
                <span>陸屋根</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                  陸屋根構造
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* 根がらみ支柱・軒先手摺 */}
      <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h2 className="text-lg font-semibold">根がらみ支柱・軒先手摺</h2>
        </div>
        <div className="space-y-4">
          {/* 根がらみ支柱 */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={inputData.hasTieColumns}
                onChange={(e) => handleInputChange({
                  hasTieColumns: e.target.checked
                })}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600"
              />
              <span>根がらみ支柱の有無</span>
            </label>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 ml-6">
              構造安定性向上のための根がらみ支柱の使用
            </p>
          </div>

          {/* 軒先手摺 */}
          <div>
            <label className="block text-sm font-medium mb-1">軒先手摺の本数</label>
            <div className="relative">
              <input
                type="number"
                value={inputData.eavesHandrails}
                onChange={(e) => handleInputChange({
                  eavesHandrails: parseInt(e.target.value) || 0
                })}
                placeholder="0"
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">本</span>
            </div>
          </div>
        </div>
      </section>

      {/* 特殊部材数 */}
      <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Ruler className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h2 className="text-lg font-semibold">特殊部材数</h2>
        </div>
        
        {/* 南北方向 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3 text-slate-600 dark:text-slate-400">南北方向</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">355mm</label>
              <Select
                value={inputData.specialMaterial.northSouth.material355.toString()}
                onValueChange={(value) => handleInputChange({
                  specialMaterial: {
                    ...inputData.specialMaterial,
                    northSouth: {
                      ...inputData.specialMaterial.northSouth,
                      material355: parseInt(value)
                    }
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">なし</SelectItem>
                  <SelectItem value="1">1本</SelectItem>
                  <SelectItem value="2">2本</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">300mm</label>
              <Select
                value={inputData.specialMaterial.northSouth.material300.toString()}
                onValueChange={(value) => handleInputChange({
                  specialMaterial: {
                    ...inputData.specialMaterial,
                    northSouth: {
                      ...inputData.specialMaterial.northSouth,
                      material300: parseInt(value)
                    }
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">なし</SelectItem>
                  <SelectItem value="1">1本</SelectItem>
                  <SelectItem value="2">2本</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">150mm</label>
              <Select
                value={inputData.specialMaterial.northSouth.material150.toString()}
                onValueChange={(value) => handleInputChange({
                  specialMaterial: {
                    ...inputData.specialMaterial,
                    northSouth: {
                      ...inputData.specialMaterial.northSouth,
                      material150: parseInt(value)
                    }
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">なし</SelectItem>
                  <SelectItem value="1">1本</SelectItem>
                  <SelectItem value="2">2本</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 東西方向 */}
        <div>
          <h3 className="text-sm font-medium mb-3 text-slate-600 dark:text-slate-400">東西方向</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">355mm</label>
              <Select
                value={inputData.specialMaterial.eastWest.material355.toString()}
                onValueChange={(value) => handleInputChange({
                  specialMaterial: {
                    ...inputData.specialMaterial,
                    eastWest: {
                      ...inputData.specialMaterial.eastWest,
                      material355: parseInt(value)
                    }
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">なし</SelectItem>
                  <SelectItem value="1">1本</SelectItem>
                  <SelectItem value="2">2本</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">300mm</label>
              <Select
                value={inputData.specialMaterial.eastWest.material300.toString()}
                onValueChange={(value) => handleInputChange({
                  specialMaterial: {
                    ...inputData.specialMaterial,
                    eastWest: {
                      ...inputData.specialMaterial.eastWest,
                      material300: parseInt(value)
                    }
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">なし</SelectItem>
                  <SelectItem value="1">1本</SelectItem>
                  <SelectItem value="2">2本</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">150mm</label>
              <Select
                value={inputData.specialMaterial.eastWest.material150.toString()}
                onValueChange={(value) => handleInputChange({
                  specialMaterial: {
                    ...inputData.specialMaterial,
                    eastWest: {
                      ...inputData.specialMaterial.eastWest,
                      material150: parseInt(value)
                    }
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">なし</SelectItem>
                  <SelectItem value="1">1本</SelectItem>
                  <SelectItem value="2">2本</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* 目標離れ */}
      <section className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h2 className="text-lg font-semibold">目標離れ（4面個別設定）</h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          チェックを入れると、その面の目標離れを個別に設定できます。チェックを外すと軒の出+80mmの最小離れのみ使用されます。
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['north', 'east', 'south', 'west'] as const).map((direction) => {
            const labels = { north: '北', east: '東', south: '南', west: '西' };
            return (
              <div key={`target-${direction}`} className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={inputData.targetOffset[direction].enabled}
                    onChange={(e) => handleInputChange({
                      targetOffset: {
                        ...inputData.targetOffset,
                        [direction]: {
                          enabled: e.target.checked,
                          value: e.target.checked ? 0 : null
                        }
                      }
                    })}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600"
                  />
                  <span>{labels[direction]}</span>
                </label>
                
                {inputData.targetOffset[direction].enabled && (
                  <div className="relative">
                    <input
                      type="number"
                      value={inputData.targetOffset[direction].value || ''}
                      onChange={(e) => handleInputChange({
                        targetOffset: {
                          ...inputData.targetOffset,
                          [direction]: {
                            enabled: true,
                            value: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      placeholder="目標離れ"
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">mm</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ボタンエリア */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
        <button
          type="button"
          onClick={handleGoToDrawingEditor}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <Edit3 className="w-4 h-4" />
          <span>作図エディタへ</span>
        </button>
        
        <button
          type="submit"
          disabled={isCalculating}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCalculating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>計算中...</span>
            </>
          ) : (
            <span>計算実行</span>
          )}
        </button>
      </div>
    </form>
  );
}