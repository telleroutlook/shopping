import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, respondToCorsPreflight } from './cors.ts'

export interface AuthenticatedUser {
  id: string
  email: string
  role_id: number
  role_name: string
}

export interface PermissionResult {
  isValid: boolean
  user?: AuthenticatedUser
  error?: string
  statusCode?: number
}

// 错误响应工具函数
export function createErrorResponse(error: string, statusCode: number, headers: Record<string, string>) {
  return new Response(
    JSON.stringify({
      error: {
        code: 'AUTH_ERROR',
        message: error
      }
    }),
    {
      status: statusCode,
      headers: { ...headers, 'Content-Type': 'application/json' }
    }
  )
}

// 创建Supabase客户端
export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('缺少必要的Supabase环境变量')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

// 验证JWT令牌
async function verifyJWT(token: string, supabase: any): Promise<any> {
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw new Error('无效的JWT令牌')
  }
  
  return user
}

// 获取用户详细信息和角色
async function getUserProfile(userId: string, supabase: any): Promise<any> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      id,
      email,
      full_name,
      role_id,
      roles (
        id,
        name,
        description,
        created_at
      )
    `)
    .eq('id', userId)
    .single()
  
  if (profileError || !profile) {
    throw new Error(`获取用户资料失败: ${profileError?.message || '用户不存在'}`)
  }
  
  if (!profile.roles) {
    throw new Error('用户角色信息缺失')
  }
  
  return profile
}

// 检查角色权限
function checkRolePermission(userRoleId: number, requiredRoleIds: number[]): boolean {
  return requiredRoleIds.includes(userRoleId)
}

// 生成访问日志
function logAccess(userId: string, action: string, resource: string, success: boolean) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    userId,
    action,
    resource,
    success,
    source: 'auth-middleware'
  }))
}

// 主要的权限验证函数
export async function verifyAuthAndPermissions(
  req: Request,
  headers: Record<string, string>,
  requiredRoles: number[],
  action: string,
  resource: string = 'unknown'
): Promise<PermissionResult> {
  try {
    // 检查授权头
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      logAccess('unknown', action, resource, false)
      return {
        isValid: false,
        error: '缺少Authorization头',
        statusCode: 401
      }
    }
    
    // 创建Supabase客户端
    const supabase = createSupabaseClient()
    
    // 验证JWT令牌
    const token = authHeader.replace('Bearer ', '')
    const user = await verifyJWT(token, supabase)
    
    // 获取用户资料
    const profile = await getUserProfile(user.id, supabase)
    
    // 检查角色权限
    const hasPermission = checkRolePermission(profile.role_id, requiredRoles)
    
    if (!hasPermission) {
      logAccess(user.id, action, resource, false)
      return {
        isValid: false,
        error: `权限不足：需要角色ID ${requiredRoles.join(', ')}，当前用户角色ID: ${profile.role_id}`,
        statusCode: 403
      }
    }
    
    // 构建用户信息
    const userInfo: AuthenticatedUser = {
      id: profile.id,
      email: profile.email,
      role_id: profile.role_id,
      role_name: profile.roles.name
    }
    
    // 记录成功的访问
    logAccess(user.id, action, resource, true)
    
    return {
      isValid: true,
      user: userInfo
    }
    
  } catch (error: any) {
    logAccess('unknown', action, resource, false)
    
    // 根据错误类型返回适当的错误码
    let statusCode = 401
    let errorMessage = '认证失败'
    
    if (error.message.includes('无效的JWT令牌')) {
      statusCode = 401
      errorMessage = '无效的认证令牌'
    } else if (error.message.includes('获取用户资料失败')) {
      statusCode = 404
      errorMessage = '用户不存在'
    } else if (error.message.includes('权限不足')) {
      statusCode = 403
      errorMessage = error.message
    } else {
      statusCode = 500
      errorMessage = '内部服务器错误'
    }
    
    return {
      isValid: false,
      error: errorMessage,
      statusCode
    }
  }
}

// 装饰器函数，用于包装Edge Function处理器
export function withAuthAndPermissions(
  requiredRoles: number[],
  action: string,
  resource: string = 'unknown'
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (req: Request, ...args: any[]) {
      const corsHeaders = getCorsHeaders(req)
      const preflight = respondToCorsPreflight(req)
      if (preflight) {
        return preflight
      }
      
      try {
        // 验证权限
        const authResult = await verifyAuthAndPermissions(req, corsHeaders, requiredRoles, action, resource)
        
        if (!authResult.isValid || !authResult.user) {
          return createErrorResponse(
            authResult.error || '认证失败',
            authResult.statusCode || 401,
            corsHeaders
          )
        }
        
        // 将认证结果传递给原始方法
        const result = await originalMethod.call(this, req, authResult.user, ...args)
        return result
        
      } catch (error: any) {
        console.error(`${action}操作失败:`, error)
        return createErrorResponse(
          '服务器内部错误',
          500,
          corsHeaders
        )
      }
    }
    
    return descriptor
  }
}

// 角色常量定义
export const ROLES = {
  USER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3
} as const

// 权限常量定义
export const PERMISSIONS = {
  // 用户权限
  VIEW_OWN_PROFILE: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
  EDIT_OWN_PROFILE: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
  VIEW_PRODUCTS: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
  SHOPPING_CART: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN],
  
  // 管理员权限
  MANAGE_PRODUCTS: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
  MANAGE_ORDERS: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
  MANAGE_CATEGORIES: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
  
  // 超级管理员权限
  MANAGE_USERS: [ROLES.SUPER_ADMIN],
  MANAGE_ROLES: [ROLES.SUPER_ADMIN],
  SYSTEM_CONFIG: [ROLES.SUPER_ADMIN]
} as const
