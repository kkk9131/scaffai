#!/usr/bin/env python3
"""
高さ計算ロジック詳細比較スクリプト
calc_span.py と engine.ts の高さ計算部分を詳細に比較
"""

# calc_span.py の定数を再現
STAGE_UNIT_HEIGHT = 1900
FIRST_LAYER_MIN_HEIGHT_THRESHOLD = 950
TIE_COLUMN_REDUCTION_LARGE = 475
TIE_COLUMN_REDUCTION_SMALL = 130
TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION = 550
TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION = 150

def calc_span_py_height_logic(standard_height, roof_shape, tie_column, railing_count, debug=True):
    """
    calc_span.py の高さ計算ロジックを再現（410-447行目）
    """
    if debug:
        print("=== calc_span.py ロジック ===")
        print(f"入力: standard_height={standard_height}, roof_shape='{roof_shape}', tie_column={tie_column}, railing_count={railing_count}")
    
    # 段数とジャッキアップ高さ計算 (ユーザー提供の calc_span.py から)
    base_unit_map = {"フラット": 1700, "勾配軒": 1900, "陸屋根": 1800}
    base_unit = base_unit_map.get(roof_shape, 1700)
    remainder = standard_height - base_unit
    stage_unit = STAGE_UNIT_HEIGHT
    
    if debug:
        print(f"Step 1: base_unit={base_unit}, remainder={remainder}, stage_unit={stage_unit}")

    initial_stages = 1 + (remainder // stage_unit if remainder > 0 else 0)
    initial_leftover = remainder - (initial_stages - 1) * stage_unit
    
    if debug:
        print(f"Step 2: initial_stages={initial_stages}, initial_leftover={initial_leftover}")
    
    if initial_leftover < FIRST_LAYER_MIN_HEIGHT_THRESHOLD:
        first_layer_height = initial_leftover + stage_unit
    else:
        first_layer_height = initial_leftover
    
    if debug:
        print(f"Step 3: first_layer_height={first_layer_height} (threshold={FIRST_LAYER_MIN_HEIGHT_THRESHOLD})")
    
    remaining_after_first = standard_height - base_unit - first_layer_height
    num_stages = 1 + (remaining_after_first // stage_unit if remaining_after_first > 0 else 0)
    leftover = standard_height - base_unit - (num_stages - 1) * stage_unit
    jack_up_height = leftover
    reduction_loops = 0
    tie_possible = True

    if debug:
        print(f"Step 4: remaining_after_first={remaining_after_first}, num_stages={num_stages}")
        print(f"Step 5: leftover={leftover}, jack_up_height={jack_up_height}")

    if tie_column:
        if jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION:
            while jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION:
                jack_up_height -= TIE_COLUMN_REDUCTION_LARGE
                reduction_loops += 1
                if debug:
                    print(f"  大型削減: jack_up_height={jack_up_height}, reduction_loops={reduction_loops}")
            if jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION:
                jack_up_height -= TIE_COLUMN_REDUCTION_SMALL
                if debug:
                    print(f"  小型削減: jack_up_height={jack_up_height}")
            else:
                tie_possible = False
                jack_up_height = leftover
                reduction_loops = 0
                if debug:
                    print(f"  削減失敗: jack_up_height reset to {jack_up_height}, tie_possible={tie_possible}")
        elif jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION:
            jack_up_height -= TIE_COLUMN_REDUCTION_SMALL
            if debug:
                print(f"  小型削減のみ: jack_up_height={jack_up_height}")
        else:
            tie_possible = False
            jack_up_height = leftover
            if debug:
                print(f"  削減不可: jack_up_height={jack_up_height}, tie_possible={tie_possible}")
    else:
        while jack_up_height >= TIE_COLUMN_REDUCTION_LARGE:
            jack_up_height -= TIE_COLUMN_REDUCTION_LARGE
            reduction_loops += 1
            if debug:
                print(f"  通常削減: jack_up_height={jack_up_height}, reduction_loops={reduction_loops}")
            
    modules_count = 4 + (num_stages - 1) * 4 + reduction_loops
    if railing_count == 3:
        modules_count += 2
    elif railing_count == 2:
        modules_count += 1
    
    if debug:
        print(f"Step 6: modules_count={modules_count} (base=4, stages={(num_stages - 1) * 4}, reductions={reduction_loops}, railing={2 if railing_count == 3 else 1 if railing_count == 2 else 0})")
    
    final_leftover_for_first_layer = standard_height - base_unit - (num_stages - 1) * stage_unit
    if final_leftover_for_first_layer < FIRST_LAYER_MIN_HEIGHT_THRESHOLD:
        first_layer_height = final_leftover_for_first_layer + stage_unit
    else:
        first_layer_height = final_leftover_for_first_layer
    
    if debug:
        print(f"Step 7 (最終調整): final_leftover_for_first_layer={final_leftover_for_first_layer}, first_layer_height={first_layer_height}")
        print(f"最終結果: num_stages={num_stages}, jack_up_height={jack_up_height}, first_layer_height={first_layer_height}, modules_count={modules_count}, tie_ok={tie_possible}")
    
    return {
        "num_stages": num_stages,
        "jack_up_height": jack_up_height,
        "first_layer_height": first_layer_height,
        "modules_count": modules_count,
        "tie_ok": tie_possible,
        "tie_column_used": tie_column
    }

def engine_ts_height_logic(standard_height, roof_shape, tie_column, railing_count, debug=True):
    """
    engine.ts の高さ計算ロジックを再現（79-143行目）
    """
    if debug:
        print("\n=== engine.ts ロジック ===")
        print(f"入力: standard_height={standard_height}, roof_shape='{roof_shape}', tie_column={tie_column}, railing_count={railing_count}")
    
    # 段数とジャッキアップ高さ計算
    ROOF_BASE_UNIT_MAP = {'フラット': 1700, '勾配軒': 1900, '陸屋根': 1800}
    base_unit = ROOF_BASE_UNIT_MAP.get(roof_shape, 1700)
    remainder = standard_height - base_unit
    stage_unit = STAGE_UNIT_HEIGHT
    
    if debug:
        print(f"Step 1: base_unit={base_unit}, remainder={remainder}, stage_unit={stage_unit}")

    initial_stages = 1 + (remainder // stage_unit if remainder > 0 else 0)  # Math.floor(remainder / stage_unit) の Python版
    initial_leftover = remainder - (initial_stages - 1) * stage_unit
    
    if debug:
        print(f"Step 2: initial_stages={initial_stages}, initial_leftover={initial_leftover}")

    if initial_leftover < FIRST_LAYER_MIN_HEIGHT_THRESHOLD:
        first_layer_height = initial_leftover + stage_unit
    else:
        first_layer_height = initial_leftover
    
    if debug:
        print(f"Step 3: first_layer_height={first_layer_height} (threshold={FIRST_LAYER_MIN_HEIGHT_THRESHOLD})")

    remaining_after_first = standard_height - base_unit - first_layer_height
    num_stages = 1 + (remaining_after_first // stage_unit if remaining_after_first > 0 else 0)  # Math.floor の Python版
    leftover = standard_height - base_unit - (num_stages - 1) * stage_unit

    if debug:
        print(f"Step 4: remaining_after_first={remaining_after_first}, num_stages={num_stages}")
        print(f"Step 5: leftover={leftover}")

    jack_up_height = leftover
    reduction_loops = 0
    tie_possible = True

    # 根がらみ支柱の計算
    if tie_column:
        if jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION:
            while jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION:
                jack_up_height -= TIE_COLUMN_REDUCTION_LARGE
                reduction_loops += 1
                if debug:
                    print(f"  大型削減: jack_up_height={jack_up_height}, reduction_loops={reduction_loops}")
            if jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION:
                jack_up_height -= TIE_COLUMN_REDUCTION_SMALL
                if debug:
                    print(f"  小型削減: jack_up_height={jack_up_height}")
            else:
                tie_possible = False
                jack_up_height = leftover
                reduction_loops = 0
                if debug:
                    print(f"  削減失敗: jack_up_height reset to {jack_up_height}, tie_possible={tie_possible}")
        elif jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION:
            jack_up_height -= TIE_COLUMN_REDUCTION_SMALL
            if debug:
                print(f"  小型削減のみ: jack_up_height={jack_up_height}")
        else:
            tie_possible = False
            jack_up_height = leftover
            if debug:
                print(f"  削減不可: jack_up_height={jack_up_height}, tie_possible={tie_possible}")
    else:
        while jack_up_height >= TIE_COLUMN_REDUCTION_LARGE:
            jack_up_height -= TIE_COLUMN_REDUCTION_LARGE
            reduction_loops += 1
            if debug:
                print(f"  通常削減: jack_up_height={jack_up_height}, reduction_loops={reduction_loops}")

    # コマ数計算
    modules_count = 4 + (num_stages - 1) * 4 + reduction_loops
    if railing_count == 3:
        modules_count += 2
    elif railing_count == 2:
        modules_count += 1

    if debug:
        print(f"Step 6: modules_count={modules_count} (base=4, stages={(num_stages - 1) * 4}, reductions={reduction_loops}, railing={2 if railing_count == 3 else 1 if railing_count == 2 else 0})")

    # 1層目高さの最終調整
    final_leftover_for_first_layer = standard_height - base_unit - (num_stages - 1) * stage_unit
    if final_leftover_for_first_layer < FIRST_LAYER_MIN_HEIGHT_THRESHOLD:
        first_layer_height = final_leftover_for_first_layer + stage_unit
    else:
        first_layer_height = final_leftover_for_first_layer

    if debug:
        print(f"Step 7 (最終調整): final_leftover_for_first_layer={final_leftover_for_first_layer}, first_layer_height={first_layer_height}")
        print(f"最終結果: num_stages={num_stages}, jack_up_height={jack_up_height}, first_layer_height={first_layer_height}, modules_count={modules_count}, tie_ok={tie_possible}")

    return {
        "num_stages": num_stages,
        "jack_up_height": jack_up_height,
        "first_layer_height": first_layer_height,
        "modules_count": modules_count,
        "tie_ok": tie_possible,
        "tie_column_used": tie_column
    }

def compare_results(py_result, ts_result):
    """
    結果比較
    """
    print("\n=== 結果比較 ===")
    keys = ["num_stages", "jack_up_height", "first_layer_height", "modules_count", "tie_ok", "tie_column_used"]
    
    all_match = True
    for key in keys:
        py_val = py_result[key]
        ts_val = ts_result[key]
        match = py_val == ts_val
        if not match:
            all_match = False
        
        print(f"{key:20}: Python={py_val:>8}, TypeScript={ts_val:>8}, Match={match}")
    
    print(f"\n全体の一致: {all_match}")
    return all_match

if __name__ == "__main__":
    # テストケース：ユーザー指定の値
    test_cases = [
        {
            "name": "ユーザー指定値",
            "standard_height": 2400,
            "roof_shape": "フラット",
            "tie_column": True,
            "railing_count": 0
        },
        {
            "name": "追加テスト1",
            "standard_height": 6000,
            "roof_shape": "フラット", 
            "tie_column": True,
            "railing_count": 3
        },
        {
            "name": "追加テスト2", 
            "standard_height": 3500,
            "roof_shape": "勾配軒",
            "tie_column": False,
            "railing_count": 2
        }
    ]
    
    for i, test_case in enumerate(test_cases):
        print(f"\n{'='*60}")
        print(f"テストケース {i+1}: {test_case['name']}")
        print(f"standard_height={test_case['standard_height']}, roof_shape='{test_case['roof_shape']}', tie_column={test_case['tie_column']}, railing_count={test_case['railing_count']}")
        print(f"{'='*60}")
        
        # name キーを除外してから関数に渡す
        test_params = {k: v for k, v in test_case.items() if k != 'name'}
        py_result = calc_span_py_height_logic(**test_params, debug=True)
        ts_result = engine_ts_height_logic(**test_params, debug=True)
        compare_results(py_result, ts_result)