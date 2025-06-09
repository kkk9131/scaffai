#!/usr/bin/env python3

# calc_span.py をインポート
import sys
sys.path.append('.')
from calc_span import calc_all

# ユーザー指定値でテスト
test_params = {
    "width_NS": 10010, 
    "width_EW": 9100,
    "eaves_N": 500,  
    "eaves_E": 500,  
    "eaves_S": 500,  
    "eaves_W": 500,
    "boundary_N": 640,  
    "boundary_E": None,  
    "boundary_S": 600,  
    "boundary_W": None,
    "standard_height": 2400,  # ユーザー指定値
    "roof_shape": "フラット",  # ユーザー指定値
    "tie_column": True, 
    "railing_count": 0,  # ユーザー指定値（3から0に変更）
    "use_355_NS": 1,  
    "use_300_NS": 0,  
    "use_150_NS": 1,
    "use_355_EW": 0,  
    "use_300_EW": 0,  
    "use_150_EW": 0,
    "target_margin": 1000 
}

print("========== ユーザー指定値での計算結果 ==========")
print(f"standard_height: {test_params['standard_height']} mm")
print(f"roof_shape: '{test_params['roof_shape']}'")
print(f"railing_count: {test_params['railing_count']}")
print("==========================================")

results = calc_all(**test_params)

print("\n========== 計算結果（高さ関連のみ） ==========")
print(f"総段数        : {results.get('num_stages')} 段")
print(f"1層目高さ     : {results.get('first_layer_height')} mm")
print(f"ジャッキアップ: {results.get('jack_up_height')} mm")
print(f"コマ数        : {results.get('modules_count')} コマ")
if results.get('tie_column_used'): 
    print(f"根がらみ支柱  : {'設置可能' if results.get('tie_ok') else '設置不可'}")
else: 
    print(f"根がらみ支柱  : 使用しない")