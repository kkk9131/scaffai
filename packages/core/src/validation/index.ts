import { z } from 'zod';

// バリデーション用のエラーメッセージ
export const validationMessages = {
  required: '必須項目です',
  numeric: '数値を入力してください',
  positive: '正の数値を入力してください',
  nonnegative: '0以上の数値を入力してください',
  integer: '整数を入力してください',
};

// 入力検証用スキーマ
export const mobileScaffoldInputSchema = z.object({
  frameWidth: z.object({
    northSouth: z.number({
      required_error: validationMessages.required,
      invalid_type_error: validationMessages.numeric,
    }).positive({
      message: validationMessages.positive,
    }),
    eastWest: z.number({
      required_error: validationMessages.required,
      invalid_type_error: validationMessages.numeric,
    }).positive({
      message: validationMessages.positive,
    }),
  }),
  eaveOverhang: z.object({
    north: z.number({
      invalid_type_error: validationMessages.numeric,
    }).nonnegative({
      message: validationMessages.nonnegative,
    }),
    east: z.number({
      invalid_type_error: validationMessages.numeric,
    }).nonnegative({
      message: validationMessages.nonnegative,
    }),
    south: z.number({
      invalid_type_error: validationMessages.numeric,
    }).nonnegative({
      message: validationMessages.nonnegative,
    }),
    west: z.number({
      invalid_type_error: validationMessages.numeric,
    }).nonnegative({
      message: validationMessages.nonnegative,
    }),
  }),
  propertyLine: z.object({
    north: z.boolean(),
    east: z.boolean(),
    south: z.boolean(),
    west: z.boolean(),
  }),
  propertyLineDistance: z.object({
    north: z.number({
      invalid_type_error: validationMessages.numeric,
    }).nonnegative({
      message: validationMessages.nonnegative,
    }).nullable().optional(),
    east: z.number({
      invalid_type_error: validationMessages.numeric,
    }).nonnegative({
      message: validationMessages.nonnegative,
    }).nullable().optional(),
    south: z.number({
      invalid_type_error: validationMessages.numeric,
    }).nonnegative({
      message: validationMessages.nonnegative,
    }).nullable().optional(),
    west: z.number({
      invalid_type_error: validationMessages.numeric,
    }).nonnegative({
      message: validationMessages.nonnegative,
    }).nullable().optional(),
  }).optional(),
  referenceHeight: z.number({
    required_error: validationMessages.required,
    invalid_type_error: validationMessages.numeric,
  }).positive({
    message: validationMessages.positive,
  }),
  roofShape: z.enum(['flat', 'sloped', 'roofDeck']),
  hasTieColumns: z.boolean(),
  eavesHandrails: z.number({
    invalid_type_error: validationMessages.numeric,
  }).int({
    message: validationMessages.integer,
  }).nonnegative({
    message: validationMessages.nonnegative,
  }),
  specialMaterial: z.object({
    northSouth: z.object({
      material355: z.number({
        invalid_type_error: validationMessages.numeric,
      }).int({
        message: validationMessages.integer,
      }).nonnegative({
        message: validationMessages.nonnegative,
      }),
      material300: z.number({
        invalid_type_error: validationMessages.numeric,
      }).int({
        message: validationMessages.integer,
      }).nonnegative({
        message: validationMessages.nonnegative,
      }),
      material150: z.number({
        invalid_type_error: validationMessages.numeric,
      }).int({
        message: validationMessages.integer,
      }).nonnegative({
        message: validationMessages.nonnegative,
      }),
    }),
    eastWest: z.object({
      material355: z.number({
        invalid_type_error: validationMessages.numeric,
      }).int({
        message: validationMessages.integer,
      }).nonnegative({
        message: validationMessages.nonnegative,
      }),
      material300: z.number({
        invalid_type_error: validationMessages.numeric,
      }).int({
        message: validationMessages.integer,
      }).nonnegative({
        message: validationMessages.nonnegative,
      }),
      material150: z.number({
        invalid_type_error: validationMessages.numeric,
      }).int({
        message: validationMessages.integer,
      }).nonnegative({
        message: validationMessages.nonnegative,
      }),
    }),
  }),
  targetOffset: z.object({
    north: z.object({
      enabled: z.boolean(),
      value: z.number({
        invalid_type_error: validationMessages.numeric,
      }).nonnegative({
        message: validationMessages.nonnegative,
      }).nullable(),
    }),
    east: z.object({
      enabled: z.boolean(),
      value: z.number({
        invalid_type_error: validationMessages.numeric,
      }).nonnegative({
        message: validationMessages.nonnegative,
      }).nullable(),
    }),
    south: z.object({
      enabled: z.boolean(),
      value: z.number({
        invalid_type_error: validationMessages.numeric,
      }).nonnegative({
        message: validationMessages.nonnegative,
      }).nullable(),
    }),
    west: z.object({
      enabled: z.boolean(),
      value: z.number({
        invalid_type_error: validationMessages.numeric,
      }).nonnegative({
        message: validationMessages.nonnegative,
      }).nullable(),
    }),
  }),
});

// 入力検証を行う関数
export function validateMobileScaffoldInput(data: any) {
  try {
    console.log('Validating input data:', JSON.stringify(data, null, 2));
    mobileScaffoldInputSchema.parse(data);
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