import { z } from 'zod';

// 商品表单验证schema
export const productSchema = z.object({
  name: z.string()
    .min(1, '商品名称不能为空')
    .max(255, '商品名称不能超过255个字符'),
  category_id: z.number()
    .int('分类ID必须为整数')
    .positive('请选择有效分类'),
  brand: z.string()
    .min(1, '品牌不能为空')
    .max(100, '品牌名称不能超过100个字符'),
  price: z.number()
    .positive('价格必须大于0')
    .max(999999.99, '价格不能超过999999.99元'),
  original_price: z.number()
    .positive('原价必须大于0')
    .max(999999.99, '原价不能超过999999.99元')
    .optional()
    .refine((val) => val === undefined || val > 0, '原价必须大于0'),
  stock: z.number()
    .int('库存数量必须为整数')
    .min(0, '库存不能为负数')
    .max(999999, '库存不能超过999999'),
  main_image: z.string()
    .url('请输入有效的图片URL')
    .startsWith('http', '图片URL必须以http或https开头'),
  description: z.string()
    .min(1, '商品描述不能为空')
    .max(2000, '商品描述不能超过2000个字符'),
  short_description: z.string()
    .min(1, '简要描述不能为空')
    .max(500, '简要描述不能超过500个字符'),
  is_active: z.boolean()
}).refine((data) => {
  // 如果有原价，确保原价比现价高
  if (data.original_price && data.original_price > 0) {
    return data.original_price > data.price;
  }
  return true;
}, {
  message: '原价必须大于现价',
  path: ['original_price']
});

// 用户登录验证schema
export const loginSchema = z.object({
  email: z.string()
    .email('请输入有效的邮箱地址'),
  password: z.string()
    .min(1, '密码不能为空')
});

// 用户注册验证schema
export const registerSchema = z.object({
  email: z.string()
    .email('请输入有效的邮箱地址'),
  password: z.string()
    .min(6, '密码至少需要6个字符')
    .max(100, '密码不能超过100个字符'),
  confirmPassword: z.string()
    .min(1, '请确认密码')
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword']
});

// 密码修改验证schema
export const passwordChangeSchema = z.object({
  current_password: z.string()
    .min(1, '请输入当前密码'),
  new_password: z.string()
    .min(6, '新密码至少需要6个字符')
    .max(100, '新密码不能超过100个字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
  confirm_new_password: z.string()
    .min(1, '请确认新密码')
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: '两次输入的新密码不一致',
  path: ['confirm_new_password']
});

// 用户资料验证schema
export const userProfileSchema = z.object({
  full_name: z.string()
    .min(1, '姓名不能为空')
    .max(100, '姓名不能超过100个字符'),
  phone: z.string()
    .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码')
    .optional()
    .or(z.literal('')),
});

// 收货地址验证schema
export const addressSchema = z.object({
  recipient_name: z.string()
    .min(1, '收件人姓名不能为空')
    .max(50, '收件人姓名不能超过50个字符'),
  phone: z.string()
    .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码'),
  province: z.string()
    .min(1, '请选择省份'),
  city: z.string()
    .min(1, '请选择城市'),
  district: z.string()
    .min(1, '请选择区县'),
  street: z.string()
    .min(1, '详细地址不能为空')
    .max(200, '详细地址不能超过200个字符'),
  is_default: z.boolean()
});

// 分类表单验证schema
export const categorySchema = z.object({
  name: z.string()
    .min(1, '分类名称不能为空')
    .max(100, '分类名称不能超过100个字符'),
  description: z.string()
    .max(500, '描述不能超过500个字符')
    .optional(),
  parent_id: z.number()
    .int('父分类ID必须为整数')
    .positive('父分类ID必须大于0')
    .optional()
    .or(z.literal(null)),
  sort_order: z.number()
    .int('排序号必须为整数')
    .min(0, '排序号不能为负数'),
  is_active: z.boolean()
});

// 获取验证错误的用户友好提示
export function getValidationErrors(error: z.ZodError): { field: string; message: string }[] {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));
}

// 类型导出
export type ProductFormData = z.infer<typeof productSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;