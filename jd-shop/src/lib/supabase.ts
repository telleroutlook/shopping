import { createClient } from '@supabase/supabase-js'

// 从环境变量获取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "your_supabase_url_here"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your_supabase_anon_key_here"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 类型定义
export interface Product {
  id: number
  name: string
  short_description: string
  description: string
  price: number
  original_price: number
  category_id: number
  brand: string
  stock: number
  rating: number
  review_count: number
  main_image: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  parent_id: number | null
  icon_name: string
  sort_order: number
  created_at: string
}

export interface CartItem {
  id: number
  user_id: string
  product_id: number
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
}

export interface Order {
  id: number
  order_number: string
  user_id: string
  total_amount: number
  shipping_fee: number
  discount_amount: number
  final_amount: number
  status: string
  payment_method: string
  recipient_name: string
  recipient_phone: string
  shipping_address: string
  note: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  product_name: string
  product_image: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export interface Address {
  id: number
  user_id: string
  recipient_name: string
  phone: string
  province: string
  city: string
  district: string
  detail_address: string
  postal_code: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Review {
  id: number
  order_item_id: number
  product_id: number
  user_id: string
  rating: number
  quality_rating: number
  price_rating: number
  logistics_rating: number
  content: string
  images: string[]
  helpful_count: number
  created_at: string
}

export interface Role {
  id: number
  name: string
  description: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string
  phone: string
  role_id: number
  created_at: string
  updated_at: string
  roles?: Role
}

export interface UserRole {
  user_id: string
  email: string
  full_name: string
  role: Role
}

export interface RoleHistory {
  id: number
  user_id: string
  old_role_id: number
  new_role_id: number
  changed_by: string
  changed_at: string
  reason: string
}