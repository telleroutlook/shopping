import { supabase } from './supabase'
import type { Product, Role, RoleHistory } from './supabase'

// 从环境变量获取 Supabase URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'your_supabase_url_here'

// 获取授权header
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('未登录')
  
  const { data: { public: { anonKey } } } = await supabase.auth.getConfig()
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    'apikey': anonKey
  }
}

// 管理员商品管理API
export const adminProductsApi = {
  // 创建商品
  async create(productData: Partial<Product>) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-products`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'create',
        productData
      })
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error?.message || '创建商品失败')
    return result.data
  },

  // 更新商品
  async update(id: number, productData: Partial<Product>) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-products`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'update',
        productData: { id, ...productData }
      })
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error?.message || '更新商品失败')
    return result.data
  },

  // 删除商品
  async delete(id: number) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-products`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'delete',
        productData: { id }
      })
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error?.message || '删除商品失败')
    return result.data
  },

  // 更新库存
  async updateStock(id: number, stock: number) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-products`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'update_stock',
        productData: { id, stock }
      })
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error?.message || '更新库存失败')
    return result.data
  }
}

// 超级管理员用户管理API
export const superAdminUsersApi = {
  // 获取所有用户
  async listUsers() {
    const headers = await getAuthHeaders()
    const response = await fetch(`${SUPABASE_URL}/functions/v1/super-admin-users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'list_users'
      })
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error?.message || '获取用户列表失败')
    return result.data
  },

  // 设置用户角色
  async setRole(user_id: string, new_role_id: number, reason?: string) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${SUPABASE_URL}/functions/v1/super-admin-users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'set_role',
        userData: { user_id, new_role_id, reason }
      })
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error?.message || '设置角色失败')
    return result.data
  },

  // 获取角色变更历史
  async getRoleHistory(user_id?: string) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${SUPABASE_URL}/functions/v1/super-admin-users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'role_history',
        userData: user_id ? { user_id } : undefined
      })
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error?.message || '获取角色历史失败')
    return result.data
  }
}

// 用户密码管理API
export const userPasswordApi = {
  // 修改密码
  async change(current_password: string, new_password: string) {
    const headers = await getAuthHeaders()
    const response = await fetch(`${SUPABASE_URL}/functions/v1/user-password`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        current_password,
        new_password
      })
    })
    const result = await response.json()
    if (!response.ok) throw new Error(result.error?.message || '修改密码失败')
    return result.data
  }
}