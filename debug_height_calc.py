# 高さ計算の詳細デバッグ版
STAGE_UNIT_HEIGHT = 1900
FIRST_LAYER_MIN_HEIGHT_THRESHOLD = 950
TIE_COLUMN_REDUCTION_LARGE = 475
TIE_COLUMN_REDUCTION_SMALL = 130
TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION = 550
TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION = 150

def debug_height_calculation(standard_height, roof_shape, tie_column, railing_count):
    print(f"=== 高さ計算デバッグ ===")
    print(f"入力: height={standard_height}, roof_shape={roof_shape}, tie_column={tie_column}, railing_count={railing_count}")
    
    # Step 1: 基本値
    base_unit_map = {"フラット": 1700, "勾配軒": 1900, "陸屋根": 1800}
    base_unit = base_unit_map.get(roof_shape, 1700)
    remainder = standard_height - base_unit
    stage_unit = STAGE_UNIT_HEIGHT
    
    print(f"Step 1: base_unit={base_unit}, remainder={remainder}, stage_unit={stage_unit}")
    
    # Step 2: 初期段数計算
    initial_stages = 1 + (remainder // stage_unit if remainder > 0 else 0)
    initial_leftover = remainder - (initial_stages - 1) * stage_unit
    
    print(f"Step 2: initial_stages={initial_stages}, initial_leftover={initial_leftover}")
    
    # Step 3: 1層目高さ決定
    if initial_leftover < FIRST_LAYER_MIN_HEIGHT_THRESHOLD:
        first_layer_height = initial_leftover + stage_unit
        print(f"Step 3: initial_leftover({initial_leftover}) < threshold({FIRST_LAYER_MIN_HEIGHT_THRESHOLD}) → first_layer_height = {initial_leftover} + {stage_unit} = {first_layer_height}")
    else:
        first_layer_height = initial_leftover
        print(f"Step 3: initial_leftover({initial_leftover}) >= threshold({FIRST_LAYER_MIN_HEIGHT_THRESHOLD}) → first_layer_height = {first_layer_height}")
    
    # Step 4: 最終段数計算
    remaining_after_first = standard_height - base_unit - first_layer_height
    num_stages = 1 + (remaining_after_first // stage_unit if remaining_after_first > 0 else 0)
    leftover = standard_height - base_unit - (num_stages - 1) * stage_unit
    
    print(f"Step 4: remaining_after_first={remaining_after_first}, num_stages={num_stages}, leftover={leftover}")
    
    # Step 5: ジャッキアップ高さ計算
    jack_up_height = leftover
    reduction_loops = 0
    tie_possible = True
    
    print(f"Step 5 初期: jack_up_height={jack_up_height}")
    
    if tie_column:
        print("根がらみ支柱使用")
        if jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION:
            while jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION:
                print(f"  大減算: {jack_up_height} - {TIE_COLUMN_REDUCTION_LARGE} = {jack_up_height - TIE_COLUMN_REDUCTION_LARGE}")
                jack_up_height -= TIE_COLUMN_REDUCTION_LARGE
                reduction_loops += 1
            if jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION:
                print(f"  小減算: {jack_up_height} - {TIE_COLUMN_REDUCTION_SMALL} = {jack_up_height - TIE_COLUMN_REDUCTION_SMALL}")
                jack_up_height -= TIE_COLUMN_REDUCTION_SMALL
            else:
                tie_possible = False
                print(f"  小減算不可 → tie_possible=False, jack_up_height={jack_up_height}, reduction_loops={reduction_loops}")
        elif jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION:
            print(f"  小減算のみ: {jack_up_height} - {TIE_COLUMN_REDUCTION_SMALL} = {jack_up_height - TIE_COLUMN_REDUCTION_SMALL}")
            jack_up_height -= TIE_COLUMN_REDUCTION_SMALL
        else:
            tie_possible = False
            jack_up_height = leftover
            print(f"  減算不可 → tie_possible=False, jack_up_height={jack_up_height}")
    else:
        print("根がらみ支柱不使用")
        while jack_up_height >= TIE_COLUMN_REDUCTION_LARGE:
            print(f"  大減算: {jack_up_height} - {TIE_COLUMN_REDUCTION_LARGE} = {jack_up_height - TIE_COLUMN_REDUCTION_LARGE}")
            jack_up_height -= TIE_COLUMN_REDUCTION_LARGE
            reduction_loops += 1
    
    # Step 6: コマ数計算
    modules_count = 4 + (num_stages - 1) * 4 + reduction_loops
    if railing_count == 3:
        modules_count += 2
    elif railing_count == 2:
        modules_count += 1
    
    print(f"Step 6: modules_count = 4 + ({num_stages} - 1) * 4 + {reduction_loops} + railing_bonus = {modules_count}")
    
    # Step 7: 最終調整（問題の可能性がある箇所）
    final_leftover_for_first_layer = standard_height - base_unit - (num_stages - 1) * stage_unit
    print(f"Step 7 最終調整: final_leftover_for_first_layer = {standard_height} - {base_unit} - {(num_stages - 1) * stage_unit} = {final_leftover_for_first_layer}")
    
    if final_leftover_for_first_layer < FIRST_LAYER_MIN_HEIGHT_THRESHOLD:
        new_first_layer_height = final_leftover_for_first_layer + stage_unit
        print(f"Step 7: {final_leftover_for_first_layer} < {FIRST_LAYER_MIN_HEIGHT_THRESHOLD} → first_layer_height = {new_first_layer_height}")
        first_layer_height = new_first_layer_height
    else:
        print(f"Step 7: {final_leftover_for_first_layer} >= {FIRST_LAYER_MIN_HEIGHT_THRESHOLD} → first_layer_height = {final_leftover_for_first_layer}")
        first_layer_height = final_leftover_for_first_layer
    
    print(f"\n=== 最終結果 ===")
    print(f"総段数: {num_stages}")
    print(f"1層目高さ: {first_layer_height}mm")
    print(f"ジャッキアップ高さ: {jack_up_height}mm")
    print(f"コマ数: {modules_count}")
    print(f"根がらみ支柱設置: {'可能' if tie_possible else '不可'}")
    print(f"reduction_loops: {reduction_loops}")
    
    return {
        "num_stages": num_stages,
        "first_layer_height": first_layer_height,
        "jack_up_height": jack_up_height,
        "modules_count": modules_count,
        "tie_possible": tie_possible
    }

# テスト実行
debug_height_calculation(6250, "勾配軒", True, 3)