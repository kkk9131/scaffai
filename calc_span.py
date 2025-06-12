# core/calc_span.py

from itertools import product
from collections import Counter
import math # float('inf') を使うため

# --- 定数定義 ---
BOUNDARY_OFFSET = 60
EAVES_MARGIN_THRESHOLD_ADDITION = 80
STANDARD_PART_SIZE = 1800
DEFAULT_TARGET_MARGIN = 900
STAGE_UNIT_HEIGHT = 1900
FIRST_LAYER_MIN_HEIGHT_THRESHOLD = 950
TIE_COLUMN_REDUCTION_LARGE = 475
TIE_COLUMN_REDUCTION_SMALL = 130
TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION = 550
TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION = 150

normal_parts = [1800, 1500, 1200, 900, 600] # これが「追加で選択可能な通常部材」のマスターリスト

def base_width(width, unit=STANDARD_PART_SIZE):
    return width - (width % unit)

def adjust_length(width, eaves, margin=EAVES_MARGIN_THRESHOLD_ADDITION):
    reminder = width % STANDARD_PART_SIZE
    side_space = (eaves + margin) * 2
    return reminder + side_space

def select_parts(target_length, parts_options=None, max_items=4): # この関数はシンプルな「以上で最小」
    if parts_options is None: parts_options = normal_parts.copy()
    best = None
    for r_count in range(1, max_items + 1):
        for combo in product(parts_options, repeat=r_count):
            total = sum(combo)
            if total >= target_length:
                if best is None or total < sum(best) or \
                   (total == sum(best) and combo.count(STANDARD_PART_SIZE) > best.count(STANDARD_PART_SIZE)):
                    best = combo
    return list(best) if best is not None else []

def total_span(base, adjust_parts_list):
    return base + sum(adjust_parts_list)

def calculate_initial_margins(current_total_span, width,
                              left_boundary_val, right_boundary_val,
                              target_margin_val=DEFAULT_TARGET_MARGIN,
                              eaves_left_for_threshold=0, eaves_right_for_threshold=0, debug_prints=False):
    if debug_prints: print(f"[DEBUG] calculate_initial_margins: total_span={current_total_span}, width={width}, L_b={left_boundary_val}, R_b={right_boundary_val}, target={target_margin_val}")
    available_margin_total = current_total_span - width
    if available_margin_total < 0: available_margin_total = 0
    if debug_prints: print(f"[DEBUG] calculate_initial_margins: available_margin_total={available_margin_total}")
    left_gap, right_gap = available_margin_total // 2, available_margin_total - (available_margin_total // 2)
    if debug_prints: print(f"[DEBUG] calculate_initial_margins: initial L_gap={left_gap}, R_gap={right_gap}")

    if left_boundary_val is None and right_boundary_val is None:
        base_margin_half = available_margin_total // 2
        if base_margin_half <= target_margin_val: left_gap, right_gap = base_margin_half, base_margin_half
        else:
            left_gap, right_gap = target_margin_val, target_margin_val
            surplus = available_margin_total - (target_margin_val * 2)
            if surplus > 0 : left_gap += surplus // 2; right_gap += surplus - (surplus // 2)
        if debug_prints: print(f"[DEBUG] calculate_initial_margins (no boundary): final L_gap={left_gap}, R_gap={right_gap}")
        return left_gap, right_gap

    max_allowed_left = (left_boundary_val - BOUNDARY_OFFSET) if left_boundary_val is not None else float('inf')
    max_allowed_right = (right_boundary_val - BOUNDARY_OFFSET) if right_boundary_val is not None else float('inf')
    if max_allowed_left < 0: max_allowed_left = 0
    if max_allowed_right < 0: max_allowed_right = 0
    if debug_prints: print(f"[DEBUG] calculate_initial_margins: max_L_allow={max_allowed_left}, max_R_allow={max_allowed_right}")
    
    left_gap = max(0, min(left_gap, max_allowed_left))
    right_gap = max(0, min(right_gap, max_allowed_right))
    if debug_prints: print(f"[DEBUG] calculate_initial_margins (after initial clip): L_gap={left_gap}, R_gap={right_gap}")

    if left_gap + right_gap != available_margin_total:
        if debug_prints: print(f"[DEBUG] calculate_initial_margins: sum L+R ({left_gap + right_gap}) != available ({available_margin_total}), adjusting...")
        if left_gap == max_allowed_left and left_boundary_val is not None : right_gap = available_margin_total - left_gap
        elif right_gap == max_allowed_right and right_boundary_val is not None: left_gap = available_margin_total - right_gap
        else:
            left_gap = available_margin_total // 2; right_gap = available_margin_total - left_gap
            left_gap = max(0, min(left_gap, max_allowed_left)); right_gap = max(0, min(right_gap, max_allowed_right))
            if left_gap + right_gap != available_margin_total:
                if left_gap == max_allowed_left and left_boundary_val is not None: right_gap = available_margin_total - left_gap
                else: left_gap = available_margin_total - right_gap
        if debug_prints: print(f"[DEBUG] calculate_initial_margins: Re-adjusted to L_gap={left_gap}, R_gap={right_gap}")

    left_gap = max(0, min(left_gap, max_allowed_left))
    right_gap = max(0, min(right_gap, max_allowed_right))
    if debug_prints: print(f"[DEBUG] calculate_initial_margins (final): L_gap={left_gap}, R_gap={right_gap}")
    return left_gap, right_gap

def format_span_parts(parts_to_format):
    count = Counter(parts_to_format)
    result = []
    if STANDARD_PART_SIZE in count:
        result.append(f"{count[STANDARD_PART_SIZE]}span")
        del count[STANDARD_PART_SIZE]
    result += [f"{k}" for k in sorted(count.elements(), reverse=True)]
    return ", ".join(result)

def calculate_span_with_boundaries(width, eaves, 
                                   mandatory_special_parts, # 必須使用の特殊部材リスト
                                   available_normal_parts_list,  # 選択可能な通常部材リスト
                                   left_boundary=None, right_boundary=None,
                                   target_margin=DEFAULT_TARGET_MARGIN, debug_prints=False):
    base = base_width(width)
    sum_of_mandatory_special = sum(mandatory_special_parts)

    max_allowed_l = (left_boundary - BOUNDARY_OFFSET) if left_boundary is not None else float('inf')
    if max_allowed_l < 0: max_allowed_l = 0
    max_allowed_r = (right_boundary - BOUNDARY_OFFSET) if right_boundary is not None else float('inf')
    if max_allowed_r < 0: max_allowed_r = 0

    effective_target_l = min(target_margin, max_allowed_l)
    effective_target_r = min(target_margin, max_allowed_r)
    ideal_target_total_span = width + effective_target_l + effective_target_r
    absolute_max_total_span = width + max_allowed_l + max_allowed_r # これを超えることは絶対にない

    if debug_prints: print(f"[DEBUG CSB_Revised] ideal_target_total_span={ideal_target_total_span}, absolute_max_total_span={absolute_max_total_span}")
    if debug_prints: print(f"[DEBUG CSB_Revised] mandatory_special_parts={mandatory_special_parts}, sum_mandatory_special={sum_of_mandatory_special}")

    # 必須特殊部材と基本スパンを除いた後、通常部材でカバーすべき長さの理想値
    target_sum_for_normal_parts_ideal = ideal_target_total_span - base - sum_of_mandatory_special
    if debug_prints: print(f"[DEBUG CSB_Revised] target_sum_for_normal_parts (ideal)={target_sum_for_normal_parts_ideal}")

    # 建物自体をカバーするために通常部材で最低限必要な長さ
    # (躯体の端数) - (必須特殊部材でカバーできなかった躯体の端数分)
    min_normal_parts_sum_for_building = (width % STANDARD_PART_SIZE) - sum_of_mandatory_special # これは負にもなりうる
    # if min_normal_parts_sum_for_building < 0: min_normal_parts_sum_for_building = 0
    # 通常部材は0以上なので、負の場合は0として扱うか、あるいは sum_of_mandatory_special が端数をどれだけ超えたかを考慮する
    # ここでは、select_parts_combo が target に近いものを探すので、マイナスでも問題ないはず
    # ただし、combo_sum は正なので、min_normal_parts_sum_for_building が負の場合、常に combo_sum >= min_normal_parts_sum_for_building は満たされる。
    # より正確には、「base + mandatory + normal_parts >= width」 を満たす必要がある。
    # base + sum_of_mandatory_special + sum(normal_parts) >= width
    # sum(normal_parts) >= width - base - sum_of_mandatory_special
    min_sum_normal_for_width_coverage = width - base - sum_of_mandatory_special
    if min_sum_normal_for_width_coverage < 0: min_sum_normal_for_width_coverage = 0 # 通常部材が不要な場合


    best_combo_normal_parts = [] # 最適な「追加の通常部材」の組み合わせ
    min_abs_diff_to_target_sum_normal = float('inf')
    
    # 通常部材で構成できる最大長（絶対最大スパンを超えないように）
    max_sum_for_normal_parts_absolute = absolute_max_total_span - base - sum_of_mandatory_special
    if max_sum_for_normal_parts_absolute < 0 : max_sum_for_normal_parts_absolute = 0 # 通常部材の入る余地がない

    # 通常部材の組み合わせを探す (0個から4個まで)
    for r_count in range(0, 5): # 0個の通常部材（つまり必須特殊部材のみ）も考慮
        for combo_normal in product(available_normal_parts_list, repeat=r_count):
            current_sum_normal = sum(combo_normal)

            # 条件1: 通常部材の合計が、躯体カバーに必要な最小長を満たしていること
            if current_sum_normal < min_sum_normal_for_width_coverage:
                continue
            
            # 条件2: 通常部材の合計が、絶対最大スパンから計算される上限を超えないこと
            if current_sum_normal > max_sum_for_normal_parts_absolute:
                continue
            
            # target_sum_for_normal_parts_ideal への近さで評価
            diff = abs(current_sum_normal - target_sum_for_normal_parts_ideal)

            if diff < min_abs_diff_to_target_sum_normal:
                min_abs_diff_to_target_sum_normal = diff
                best_combo_normal_parts = list(combo_normal)
            elif diff == min_abs_diff_to_target_sum_normal: # 差が同じ場合
                # 部材数が少ない、または1800が多い構成を優先
                if len(combo_normal) < len(best_combo_normal_parts) or \
                   (len(combo_normal) == len(best_combo_normal_parts) and combo_normal.count(STANDARD_PART_SIZE) > best_combo_normal_parts.count(STANDARD_PART_SIZE)):
                    best_combo_normal_parts = list(combo_normal)
    
    # 最終的な部材構成と総スパン
    final_parts = sorted(mandatory_special_parts + best_combo_normal_parts, reverse=True) # 見栄えのためにソート
    final_total_span = base + sum(final_parts)
    
    # フォールバック: もし上記の探索で見つからなかった場合 (特に target_sum_for_normal_parts_ideal が非常に小さい/負の場合で、0個の通常部材が選ばれなかった場合など)
    # または、min_sum_normal_for_width_coverage を満たす最小限の構成が必要な場合
    if not best_combo_normal_parts and min_sum_normal_for_width_coverage > 0:
        if debug_prints: print(f"[DEBUG CSB_Revised] Fallback: trying to find minimal normal parts for width coverage target {min_sum_normal_for_width_coverage}")
        fallback_normal_parts = select_parts(min_sum_normal_for_width_coverage, available_normal_parts_list) # select_parts は target以上で最小を探す
        if fallback_normal_parts:
            if base + sum_of_mandatory_special + sum(fallback_normal_parts) <= absolute_max_total_span:
                best_combo_normal_parts = fallback_normal_parts
                final_parts = sorted(mandatory_special_parts + best_combo_normal_parts, reverse=True)
                final_total_span = base + sum(final_parts)
                if debug_prints: print(f"[DEBUG CSB_Revised] Fallback selected normal parts: {best_combo_normal_parts}")


    if debug_prints: print(f"[DEBUG CSB_Revised] Selected: base={base}, final_parts={final_parts}, final_total_span={final_total_span}")
    return base, final_parts, final_total_span


def calculate_face_dimensions(
    width_val,
    eaves_left_val, eaves_right_val,
    boundary_left_val, boundary_right_val,
    use_150_val, use_300_val, use_355_val,
    parts_master_list, target_margin_val=DEFAULT_TARGET_MARGIN, # parts_master_list は normal_parts グローバル変数
    face_name="UnknownFace"
):
    debug_prints = True # True にするとこの関数内のデバッグプリントが有効になる
    if debug_prints: print(f"\n--- Calculating for {face_name} ---")
    if debug_prints: print(f"[DEBUG {face_name}] Inputs: width={width_val}, eaves_L={eaves_left_val}, eaves_R={eaves_right_val}, bound_L={boundary_left_val}, bound_R={boundary_right_val}, target_margin={target_margin_val}")

    eaves_for_span_calc = max(eaves_left_val, eaves_right_val) # これは calculate_span_with_boundaries には直接渡さない

    # 1. ユーザー指定の必須特殊部材リストを作成
    mandatory_special_parts = []
    for p_spec, count_spec in ((150, use_150_val), (300, use_300_val), (355, use_355_val)):
        mandatory_special_parts.extend([p_spec] * count_spec)
    
    # 2. calculate_span_with_boundaries を呼び出し、最適な総スパンと部材構成を得る
    #    この関数は必須特殊部材を考慮し、残りを通常部材で補って target_margin を目指す
    base_val, parts_val, total_val = calculate_span_with_boundaries(
        width_val, eaves_for_span_calc, # eaves は adjust_length のために渡すが、新しいCSBでは直接は使わないかも
        mandatory_special_parts,        # 必須特殊部材リスト
        parts_master_list,              # 選択可能な「通常」部材のマスターリスト
        boundary_left_val, boundary_right_val,
        target_margin=target_margin_val,
        debug_prints=debug_prints
    )
    if debug_prints: print(f"[DEBUG {face_name}] calculate_span_with_boundaries (revised call) returned: base={base_val}, parts={parts_val}, total_span={total_val}")
    
    # parts_val には必須特殊部材と選ばれた通常部材が含まれているはず
    # total_val はそれらすべてを合計した最終的な総スパン

    # 3. 確定した total_val を元に、離れを計算・分配する
    left_margin, right_margin = calculate_initial_margins(
        total_val, width_val,
        boundary_left_val, boundary_right_val,
        target_margin_val,
        eaves_left_val, eaves_right_val, debug_prints=debug_prints
    )
    if debug_prints: print(f"[DEBUG {face_name}] calculate_initial_margins returned: L_margin={left_margin}, R_margin={right_margin}")
    
    threshold_left = eaves_left_val + EAVES_MARGIN_THRESHOLD_ADDITION
    threshold_right = eaves_right_val + EAVES_MARGIN_THRESHOLD_ADDITION
    current_total_margin_space = total_val - width_val
    if current_total_margin_space < 0: current_total_margin_space = 0

    max_allowed_left = (boundary_left_val - BOUNDARY_OFFSET) if boundary_left_val is not None else float('inf')
    max_allowed_right = (boundary_right_val - BOUNDARY_OFFSET) if boundary_right_val is not None else float('inf')
    if max_allowed_left < 0: max_allowed_left = 0
    if max_allowed_right < 0: max_allowed_right = 0
    if debug_prints: print(f"[DEBUG {face_name}] thresholds: L={threshold_left}, R={threshold_right} | max_allowed: L={max_allowed_left}, R={max_allowed_right} | total_margin_space={current_total_margin_space}")

    # 初期クリッピングと合計調整 (calculate_initial_margins の結果をさらに調整)
    lm_temp = max(0, min(left_margin, max_allowed_left))
    rm_temp = max(0, min(right_margin, max_allowed_right))
    if lm_temp + rm_temp != current_total_margin_space:
        if lm_temp == max_allowed_left and boundary_left_val is not None: rm_temp = current_total_margin_space - lm_temp
        elif rm_temp == max_allowed_right and boundary_right_val is not None: lm_temp = current_total_margin_space - rm_temp
        else: lm_temp = current_total_margin_space // 2; rm_temp = current_total_margin_space - lm_temp
    left_margin = max(0, min(lm_temp, max_allowed_left))
    right_margin = max(0, min(current_total_margin_space - left_margin, max_allowed_right))
    left_margin = max(0, min(current_total_margin_space - right_margin, max_allowed_left))
    if debug_prints: print(f"[DEBUG {face_name}] After initial clip & adjust: L_margin={left_margin}, R_margin={right_margin}")

    needs_correction_flag = True 
    if left_margin >= threshold_left and right_margin >= threshold_right:
        needs_correction_flag = False
        if debug_prints: print(f"[DEBUG {face_name}] Initial margins already meet both thresholds. needs_correction=False")

    # 両側境界線がある場合の優先分配ロジック (ここは前回から微調整)
    if needs_correction_flag and boundary_left_val is not None and boundary_right_val is not None:
        if debug_prints: print(f"[DEBUG {face_name}] Trying distribution for double boundary.")
        best_lm, best_rm = left_margin, right_margin
        both_thresholds_met_by_candidate = False

        # 試行1: 右側優先
        if max_allowed_right >= threshold_right:
            test_r1a = max_allowed_right; test_l1a = current_total_margin_space - test_r1a
            if 0 <= test_l1a <= max_allowed_left and test_l1a >= threshold_left:
                if not both_thresholds_met_by_candidate : best_lm, best_rm = test_l1a, test_r1a; both_thresholds_met_by_candidate = True
                if debug_prints: print(f"[DEBUG {face_name}] Option DB R-1a (both meet): L={test_l1a}, R={test_r1a}")
            if not both_thresholds_met_by_candidate:
                test_r1b = threshold_right; test_l1b = current_total_margin_space - test_r1b
                if 0 <= test_l1b <= max_allowed_left:
                    if test_l1b >= threshold_left: best_lm, best_rm = test_l1b, test_r1b; both_thresholds_met_by_candidate = True;
                    elif not (best_lm >= threshold_left and best_rm >=threshold_right): best_lm, best_rm = test_l1b, test_r1b
                    if debug_prints: print(f"[DEBUG {face_name}] Option DB R-1b (L {'>=' if test_l1b >= threshold_left else '<'} thresh): L={test_l1b}, R={test_r1b}")
        # 試行2: 左側優先
        if not both_thresholds_met_by_candidate and max_allowed_left >= threshold_left:
            test_l2a = max_allowed_left; test_r2a = current_total_margin_space - test_l2a
            if 0 <= test_r2a <= max_allowed_right and test_r2a >= threshold_right :
                if not both_thresholds_met_by_candidate: best_lm, best_rm = test_l2a, test_r2a; both_thresholds_met_by_candidate = True
                if debug_prints: print(f"[DEBUG {face_name}] Option DB L-2a (both meet): L={test_l2a}, R={test_r2a}")
            if not both_thresholds_met_by_candidate:
                test_l2b = threshold_left; test_r2b = current_total_margin_space - test_l2b
                if 0 <= test_r2b <= max_allowed_right:
                    if test_r2b >= threshold_right: best_lm, best_rm = test_l2b, test_r2b; both_thresholds_met_by_candidate = True;
                    elif not (best_lm >= threshold_left and best_rm >=threshold_right):
                         if not (best_lm >= threshold_left) or (test_r2b > best_rm) : best_lm, best_rm = test_l2b, test_r2b
                    if debug_prints: print(f"[DEBUG {face_name}] Option DB L-2b (R {'>=' if test_r2b >= threshold_right else '<'} thresh): L={test_l2b}, R={test_r2b}")
        left_margin, right_margin = best_lm, best_rm
        if both_thresholds_met_by_candidate: needs_correction_flag = False
        if debug_prints and not needs_correction_flag: print(f"[DEBUG {face_name}] Solved by double boundary distribution. needs_correction=False")

    elif needs_correction_flag : 
        if debug_prints: print(f"[DEBUG {face_name}] Trying distribution for single/no boundary (or double boundary not solved without correction).")
        if boundary_left_val is not None and boundary_right_val is None: # 左のみ境界
            if max_allowed_left >= threshold_left: left_margin = threshold_left
            else: left_margin = max_allowed_left
            right_margin = current_total_margin_space - left_margin; right_margin = max(0, right_margin)
        elif boundary_left_val is None and boundary_right_val is not None: # 右のみ境界
            if max_allowed_right >= threshold_right: right_margin = threshold_right
            else: right_margin = max_allowed_right
            left_margin = current_total_margin_space - right_margin; left_margin = max(0, left_margin)
    
    left_margin = max(0, min(left_margin, max_allowed_left))
    right_margin = max(0, min(right_margin, max_allowed_right))
    if left_margin + right_margin != current_total_margin_space and current_total_margin_space >= 0:
        if left_margin == max_allowed_left and boundary_left_val is not None: right_margin = current_total_margin_space - left_margin
        else: left_margin = current_total_margin_space - right_margin
    left_margin = max(0, min(left_margin, max_allowed_left))
    right_margin = max(0, min(right_margin, max_allowed_right))
    if debug_prints: print(f"[DEBUG {face_name}] After all distribution attempts: L_margin={left_margin}, R_margin={right_margin}")

    if left_margin >= threshold_left and right_margin >= threshold_right:
        needs_correction_flag = False
        if debug_prints: print(f"[DEBUG {face_name}] Final check: Both thresholds met. needs_correction=False")
    else:
        needs_correction_flag = True
        if debug_prints: print(f"[DEBUG {face_name}] Final check: At least one threshold NOT met. needs_correction=True. (L_actual:{left_margin} vs L_thresh:{threshold_left}, R_actual:{right_margin} vs R_thresh:{threshold_right})")

    original_left_margin, original_right_margin = left_margin, right_margin
    correction_part_val = None; corr_val_for_left_note_str = None; corr_val_for_right_note_str = None

    if needs_correction_flag:
        candidates = [150, 300, 355, 600, 900]
        if original_left_margin < threshold_left:
            for p_corr in candidates:
                if original_left_margin + p_corr >= threshold_left: corr_val_for_left_note_str = p_corr; break
            if corr_val_for_left_note_str is None and candidates: corr_val_for_left_note_str = candidates[-1]
        if original_right_margin < threshold_right:
            for p_corr in candidates:
                if original_right_margin + p_corr >= threshold_right: corr_val_for_right_note_str = p_corr; break
            if corr_val_for_right_note_str is None and candidates: corr_val_for_right_note_str = candidates[-1]
        if corr_val_for_left_note_str and corr_val_for_right_note_str: correction_part_val = max(corr_val_for_left_note_str, corr_val_for_right_note_str)
        elif corr_val_for_left_note_str: correction_part_val = corr_val_for_left_note_str
        elif corr_val_for_right_note_str: correction_part_val = corr_val_for_right_note_str
        if debug_prints: print(f"[DEBUG {face_name}] Needs correction. L_corr_note={corr_val_for_left_note_str}, R_corr_note={corr_val_for_right_note_str}, span_text_corr_val={correction_part_val}")

    # parts_val は calculate_span_with_boundaries から返された、必須特殊部材と追加通常部材のリスト
    base_parts_for_format = [STANDARD_PART_SIZE] * (base_val // STANDARD_PART_SIZE)
    combined_parts_for_format = base_parts_for_format + parts_val # parts_val には既に base に対応しない調整部材が入っている
    span_parts_text = format_span_parts(combined_parts_for_format)

    left_note_str = f"{original_left_margin} mm"
    if original_left_margin < threshold_left and corr_val_for_left_note_str is not None :
        left_note_str += f"(+{corr_val_for_left_note_str})"
    right_note_str = f"{original_right_margin} mm"
    if original_right_margin < threshold_right and corr_val_for_right_note_str is not None :
        right_note_str += f"(+{corr_val_for_right_note_str})"

    if needs_correction_flag and correction_part_val is not None:
        prefix_str = f"(+{correction_part_val})" if original_left_margin < threshold_left and corr_val_for_left_note_str == correction_part_val else ""
        suffix_str = f"(+{correction_part_val})" if original_right_margin < threshold_right and corr_val_for_right_note_str == correction_part_val else ""
        
        # スパン構成テキストの補正表示 (元のユーザー提供コードのcalc_allに近づける)
        current_span_elements = span_parts_text.split(", ") # 補正前のスパンテキスト
        if prefix_str and suffix_str and prefix_str == suffix_str:
             span_parts_text = f"{prefix_str}, {span_parts_text}, {correction_part_val}{suffix_str}"
        elif prefix_str:
            span_parts_text = f"{prefix_str}, {span_parts_text}"
        elif suffix_str:
            if current_span_elements and len(current_span_elements) > 0 and current_span_elements[-1].replace('span','').isdigit():
                current_span_elements[-1] = f"{current_span_elements[-1]}{suffix_str}"
                span_parts_text = ", ".join(current_span_elements)
            else:
                span_parts_text = f"{span_parts_text}, {correction_part_val}{suffix_str}"
    
    if debug_prints: print(f"[DEBUG {face_name}] Final Notes: L='{left_note_str}', R='{right_note_str}' | Span Text='{span_parts_text}'")
    if debug_prints: print(f"--- End Calculating for {face_name} ---\n")
    return total_val, span_parts_text, original_left_margin, original_right_margin, left_note_str, right_note_str

# calc_all 関数 (ユーザー提供のものをベースに、段数計算などを統合)
def calc_all(
    width_NS, width_EW,
    eaves_N, eaves_E, eaves_S, eaves_W,
    boundary_N, boundary_E, boundary_S, boundary_W,
    standard_height, roof_shape, tie_column, railing_count,
    use_355_NS=0, use_300_NS=0, use_150_NS=0,
    use_355_EW=0, use_300_EW=0, use_150_EW=0,
    target_margin=DEFAULT_TARGET_MARGIN
):
    global normal_parts # グローバルな通常部材リストを参照

    # 南北方向の計算（東面・西面の離れを決定）
    ns_total_val, span_text_ns, _, _, east_note, west_note = calculate_face_dimensions(
        width_val=width_NS,
        eaves_left_val=eaves_E, eaves_right_val=eaves_W,
        boundary_left_val=boundary_E, boundary_right_val=boundary_W,
        use_150_val=use_150_NS, use_300_val=use_300_NS, use_355_val=use_355_NS,
        parts_master_list=normal_parts, # 通常部材のマスターリストを渡す
        target_margin_val=target_margin,
        face_name="NS_direction (East/West gaps)"
    )
    # 東西方向の計算（北面・南面の離れを決定）
    ew_total_val, span_text_ew, _, _, south_note, north_note = calculate_face_dimensions(
        width_val=width_EW,
        eaves_left_val=eaves_S, eaves_right_val=eaves_N,
        boundary_left_val=boundary_S, boundary_right_val=boundary_N,
        use_150_val=use_150_EW, use_300_val=use_300_EW, use_355_val=use_355_EW,
        parts_master_list=normal_parts, # 通常部材のマスターリストを渡す
        target_margin_val=target_margin,
        face_name="EW_direction (North/South gaps)"
    )

    # 段数とジャッキアップ高さ計算 (ユーザー提供の calc_span.py から)
    base_unit_map = {"フラット": 1700, "勾配軒": 1900, "陸屋根": 1800}
    base_unit = base_unit_map.get(roof_shape, 1700)
    remainder = standard_height - base_unit
    stage_unit = STAGE_UNIT_HEIGHT

    initial_stages = 1 + (remainder // stage_unit if remainder > 0 else 0)
    initial_leftover = remainder - (initial_stages - 1) * stage_unit
    
    if initial_leftover < FIRST_LAYER_MIN_HEIGHT_THRESHOLD:
        first_layer_height = initial_leftover + stage_unit
    else:
        first_layer_height = initial_leftover
    
    remaining_after_first = standard_height - base_unit - first_layer_height
    num_stages = 1 + (remaining_after_first // stage_unit if remaining_after_first > 0 else 0)
    leftover = standard_height - base_unit - (num_stages - 1) * stage_unit
    jack_up_height = leftover; reduction_loops = 0; tie_possible = True

    if tie_column:
        if jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION:
            while jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_LARGE_REDUCTION:
                jack_up_height -= TIE_COLUMN_REDUCTION_LARGE; reduction_loops += 1
            if jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION: jack_up_height -= TIE_COLUMN_REDUCTION_SMALL
            else: tie_possible = False
        elif jack_up_height >= TIE_COLUMN_MIN_HEIGHT_FOR_SMALL_REDUCTION: jack_up_height -= TIE_COLUMN_REDUCTION_SMALL
        else: tie_possible = False; jack_up_height = leftover
    else:
        while jack_up_height >= TIE_COLUMN_REDUCTION_LARGE:
            jack_up_height -= TIE_COLUMN_REDUCTION_LARGE; reduction_loops += 1
            
    modules_count = 4 + (num_stages - 1) * 4 + reduction_loops
    if railing_count == 3: modules_count += 2
    elif railing_count == 2: modules_count += 1
    
    final_leftover_for_first_layer = standard_height - base_unit - (num_stages - 1) * stage_unit
    if final_leftover_for_first_layer < FIRST_LAYER_MIN_HEIGHT_THRESHOLD: first_layer_height = final_leftover_for_first_layer + stage_unit
    else: first_layer_height = final_leftover_for_first_layer

    result = {
        "ns_total_span": ns_total_val, "ew_total_span": ew_total_val,
        "ns_span_structure": span_text_ns, "ew_span_structure": span_text_ew,
        "north_gap": north_note, "south_gap": south_note,
        "east_gap": east_note, "west_gap": west_note,
        "num_stages": num_stages, "modules_count": modules_count,
        "jack_up_height": jack_up_height, "first_layer_height": first_layer_height,
        "tie_ok": tie_possible, "tie_column_used": tie_column
    }
    return result

# グローバルな normal_parts の定義はファイルの末尾のまま (ユーザー提供の元のコードより)
# normal_parts = [1800, 1500, 1200, 900, 600] # これはファイルの先頭に移動済み

if __name__ == "__main__":
    test_params = {
        "width_NS": 10010, "width_EW": 9100,
        "eaves_N": 500,  "eaves_E": 500,  "eaves_S": 500,  "eaves_W": 500,
        "boundary_N": 640,  "boundary_E": None,  "boundary_S": 600,  "boundary_W": None,
        "standard_height": 6250, "roof_shape": "勾配軒",
        "tie_column": True, "railing_count": 3,
        "use_355_NS": 1,  "use_300_NS": 0,  "use_150_NS": 1, # 特殊部材使用
        "use_355_EW": 0,  "use_300_EW": 0,  "use_150_EW": 0,
        "target_margin": 1000 
    }
    print("========== 入力パラメータ ==========")
    for key, value in test_params.items():
        if "boundary" in key and value == 0: print(f"{key:<18}: {value} (境界指示あり、壁位置)")
        elif "boundary" in key and value is None: print(f"{key:<18}: {value} (境界指示なし)")
        else: print(f"{key:<18}: {value}")
    print("===================================")
    results = calc_all(**test_params)
    print("\n========== 計算結果 ==========")
    print(f"南北 総スパン   : {results.get('ns_total_span')} mm")
    print(f"東西 総スパン   : {results.get('ew_total_span')} mm")
    print(f"南北 スパン構成: {results.get('ns_span_structure')}")
    print(f"東西 スパン構成: {results.get('ew_span_structure')}")
    print(f"北面 離れ      : {results.get('north_gap')}")
    print(f"南面 離れ      : {results.get('south_gap')}")
    print(f"東面 離れ      : {results.get('east_gap')}")
    print(f"西面 離れ      : {results.get('west_gap')}")
    print("--- 高さ関連 ---")
    print(f"総段数        : {results.get('num_stages')} 段")
    print(f"1層目高さ     : {results.get('first_layer_height')} mm")
    print(f"ジャッキアップ: {results.get('jack_up_height')} mm")
    print(f"コマ数        : {results.get('modules_count')} コマ")
    if results.get('tie_column_used'): print(f"根がらみ支柱  : {'設置可能' if results.get('tie_ok') else '設置不可'}")
    else: print(f"根がらみ支柱  : 使用しない")