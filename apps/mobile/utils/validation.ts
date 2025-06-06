import { z } from 'zod';
import { ja } from '../constants/translations';

// 入力検証用スキーマ
export const inputSchema = z.object({
  frameWidth: z.object({
    northSouth: z.number({
      required_error: ja.input.validation.required,
      invalid_type_error: ja.input.validation.numeric,
    }).positive({
      message: ja.input.validation.positive,
    }),
    eastWest: z.number({
      required_error: ja.input.validation.required,
      invalid_type_error: ja.input.validation.numeric,
    }).positive({
      message: ja.input.validation.positive,
    }),
  }),
  eaveOverhang: z.object({
    north: z.number({
      invalid_type_error: ja.input.validation.numeric,
    }).nonnegative({
      message: ja.input.validation.positive,
    }).nullable(),
    east: z.number({
      invalid_type_error: ja.input.validation.numeric,
    }).nonnegative({
      message: ja.input.validation.positive,
    }).nullable(),
    south: z.number({
      invalid_type_error: ja.input.validation.numeric,
    }).nonnegative({
      message: ja.input.validation.positive,
    }).nullable(),
    west: z.number({
      invalid_type_error: ja.input.validation.numeric,
    }).nonnegative({
      message: ja.input.validation.positive,
    }).nullable(),
  }),
  propertyLine: z.object({
    north: z.boolean(),
    east: z.boolean(),
    south: z.boolean(),
    west: z.boolean(),
  }),
  referenceHeight: z.number({
    required_error: ja.input.validation.required,
    invalid_type_error: ja.input.validation.numeric,
  }).positive({
    message: ja.input.validation.positive,
  }),
  roofShape: z.enum(['flat', 'sloped', 'roofDeck']),
  hasTieColumns: z.boolean(),
  eavesHandrails: z.number({
    invalid_type_error: ja.input.validation.numeric,
  }).int({
    message: ja.input.validation.integer,
  }).nonnegative({
    message: ja.input.validation.positive,
  }).nullable(),
  // 修正: specialMaterialスキーマを正しく定義
  specialMaterial: z.object({
    northSouth: z.object({
      material355: z.number({
        invalid_type_error: ja.input.validation.numeric,
      }).int({
        message: ja.input.validation.integer,
      }).nonnegative({
        message: ja.input.validation.positive,
      }).nullable(),
      material300: z.number({
        invalid_type_error: ja.input.validation.numeric,
      }).int({
        message: ja.input.validation.integer,
      }).nonnegative({
        message: ja.input.validation.positive,
      }).nullable(),
      material150: z.number({
        invalid_type_error: ja.input.validation.numeric,
      }).int({
        message: ja.input.validation.integer,
      }).nonnegative({
        message: ja.input.validation.positive,
      }).nullable(),
    }),
    eastWest: z.object({
      material355: z.number({
        invalid_type_error: ja.input.validation.numeric,
      }).int({
        message: ja.input.validation.integer,
      }).nonnegative({
        message: ja.input.validation.positive,
      }).nullable(),
      material300: z.number({
        invalid_type_error: ja.input.validation.numeric,
      }).int({
        message: ja.input.validation.integer,
      }).nonnegative({
        message: ja.input.validation.positive,
      }).nullable(),
      material150: z.number({
        invalid_type_error: ja.input.validation.numeric,
      }).int({
        message: ja.input.validation.integer,
      }).nonnegative({
        message: ja.input.validation.positive,
      }).nullable(),
    }),
  }),
  targetOffset: z.number({
    invalid_type_error: ja.input.validation.numeric,
  }).nonnegative({
    message: ja.input.validation.positive,
  }).nullable(),
  propertyLineDistance: z.object({
    north: z.number({
      invalid_type_error: ja.input.validation.numeric,
    }).nonnegative({
      message: ja.input.validation.positive,
    }).nullable().optional(),
    east: z.number({
      invalid_type_error: ja.input.validation.numeric,
    }).nonnegative({
      message: ja.input.validation.positive,
    }).nullable().optional(),
    south: z.number({
      invalid_type_error: ja.input.validation.numeric,
    }).nonnegative({
      message: ja.input.validation.positive,
    }).nullable().optional(),
    west: z.number({
      invalid_type_error: ja.input.validation.numeric,
    }).nonnegative({
      message: ja.input.validation.positive,
    }).nullable().optional(),
  }).optional(),
});

// 入力検証を行う関数
export function validateInput(data: any) {
  try {
    console.log('Validating input data:', JSON.stringify(data, null, 2));
    inputSchema.parse(data);
    return { success: true, errors: null };
  } catch (error) {
    console.error('Validation error:', error);
    if (error instanceof z.ZodError) {
      // エラーメッセージをフラットな形式に変換
      const errorMap: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errorMap[path] = err.message;
      });
      return { success: false, errors: errorMap };
    }
    return { 
      success: false, 
      errors: { '_': '検証中に予期しないエラーが発生しました。' } 
    };
  }
}