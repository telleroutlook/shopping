// 速率限制中间件 - 基于内存的简单实现
// 在生产环境中，应该使用Redis或类似的分布式缓存服务

export interface RateLimitConfig {
  windowMs: number // 时间窗口（毫秒）
  maxRequests: number // 最大请求数
  keyGenerator?: (req: Request) => string // 生成限制键的函数
  skipSuccessfulRequests?: boolean // 是否跳过成功的请求
  skipFailedRequests?: boolean // 是否跳过失败的请求
  message?: string // 超出限制时的错误信息
  statusCode?: number // 超出限制时的HTTP状态码
}

export interface RateLimitResult {
  isLimited: boolean
  remaining: number
  resetTime: number
  totalHits: number
}

// 内存存储 - 简单实现
const rateLimitStore = new Map<string, {
  count: number
  resetTime: number
  lastRequest?: number
}>()

// 清理过期条目的定时器
let cleanupInterval: number | null = null

// 默认配置
const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15分钟
  maxRequests: 100,
  message: '请求过于频繁，请稍后再试',
  statusCode: 429
}

// 默认键生成器
const defaultKeyGenerator = (req: Request): string => {
  // 从请求头中获取客户端IP
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const clientIp = forwarded?.split(',')[0] || realIp || 'unknown'
  
  // 获取用户ID（如果有认证）
  const authHeader = req.headers.get('Authorization')
  let userId = 'anonymous'
  if (authHeader) {
    try {
      // 简单解析JWT中的sub字段（不验证签名）
      const token = authHeader.replace('Bearer ', '')
      const payload = JSON.parse(atob(token.split('.')[1]))
      userId = payload.sub || 'anonymous'
    } catch {
      // 忽略解析错误
    }
  }
  
  return `${clientIp}:${userId}`
}

// 获取配置的速率限制规则
function getRateLimitRules(): { [key: string]: RateLimitConfig } {
  return {
    // 通用限制
    default: {
      ...DEFAULT_CONFIG,
      maxRequests: 60,
      windowMs: 10 * 60 * 1000 // 10分钟
    },
    
    // 登录相关API限制
    auth: {
      windowMs: 15 * 60 * 1000, // 15分钟
      maxRequests: 5, // 15分钟内最多5次登录尝试
      keyGenerator: (req) => {
        const forwarded = req.headers.get('x-forwarded-for')
        const clientIp = forwarded?.split(',')[0] || 'unknown'
        return `auth:${clientIp}`
      },
      message: '登录尝试过于频繁，请15分钟后再试',
      statusCode: 429
    },
    
    // 密码变更限制
    password: {
      windowMs: 60 * 60 * 1000, // 1小时
      maxRequests: 3, // 1小时内最多3次密码变更
      keyGenerator: (req) => {
        const forwarded = req.headers.get('x-forwarded-for')
        const clientIp = forwarded?.split(',')[0] || 'unknown'
        return `password:${clientIp}`
      },
      message: '密码变更过于频繁，请1小时后再试',
      statusCode: 429
    },
    
    // 管理员API限制
    admin: {
      windowMs: 5 * 60 * 1000, // 5分钟
      maxRequests: 30, // 5分钟内最多30次请求
      keyGenerator: (req) => {
        const forwarded = req.headers.get('x-forwarded-for')
        const clientIp = forwarded?.split(',')[0] || 'unknown'
        return `admin:${clientIp}`
      },
      message: '管理员操作过于频繁，请5分钟后再试',
      statusCode: 429
    },
    
    // 超管API限制（更严格）
    superadmin: {
      windowMs: 10 * 60 * 1000, // 10分钟
      maxRequests: 10, // 10分钟内最多10次请求
      keyGenerator: (req) => {
        const forwarded = req.headers.get('x-forwarded-for')
        const clientIp = forwarded?.split(',')[0] || 'unknown'
        return `superadmin:${clientIp}`
      },
      message: '超级管理员操作过于频繁，请10分钟后再试',
      statusCode: 429
    },
    
    // 商品管理限制
    products: {
      windowMs: 5 * 60 * 1000, // 5分钟
      maxRequests: 50, // 5分钟内最多50次请求
      message: '商品管理操作过于频繁，请5分钟后再试',
      statusCode: 429
    },
    
    // 用户管理限制
    users: {
      windowMs: 10 * 60 * 1000, // 10分钟
      maxRequests: 20, // 10分钟内最多20次请求
      message: '用户管理操作过于频繁，请10分钟后再试',
      statusCode: 429
    }
  }
}

// 获取或创建清理定时器
function getCleanupInterval(): number {
  if (cleanupInterval === null) {
    cleanupInterval = setInterval(cleanup, 5 * 60 * 1000) // 每5分钟清理一次
  }
  return cleanupInterval
}

// 清理过期的速率限制记录
function cleanup() {
  const now = Date.now()
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime <= now) {
      rateLimitStore.delete(key)
    }
  }
}

// 主要的速率限制检查函数
export async function checkRateLimit(
  req: Request,
  route: string,
  config: Partial<RateLimitConfig> = {}
): Promise<RateLimitResult> {
  try {
    // 获取路由的配置
    const routeRules = getRateLimitRules()
    const routeConfig = routeRules[route] || routeRules.default
    
    // 合并配置
    const fullConfig: RateLimitConfig = { ...routeConfig, ...config }
    
    // 生成限制键
    const key = fullConfig.keyGenerator?.(req) || defaultKeyGenerator(req)
    
    // 获取或创建记录
    const record = rateLimitStore.get(key) || {
      count: 0,
      resetTime: Date.now() + fullConfig.windowMs
    }
    
    // 检查是否需要重置计数器
    if (record.resetTime <= Date.now()) {
      record.count = 0
      record.resetTime = Date.now() + fullConfig.windowMs
    }
    
    // 增加计数器
    record.count++
    record.lastRequest = Date.now()
    rateLimitStore.set(key, record)
    
    // 确保清理定时器正在运行
    getCleanupInterval()
    
    return {
      isLimited: record.count > fullConfig.maxRequests,
      remaining: Math.max(0, fullConfig.maxRequests - record.count),
      resetTime: record.resetTime,
      totalHits: record.count
    }
    
  } catch (error) {
    console.error('速率限制检查失败:', error)
    // 发生错误时允许请求继续
    return {
      isLimited: false,
      remaining: 999,
      resetTime: Date.now() + 60000,
      totalHits: 0
    }
  }
}

// 创建速率限制响应
export function createRateLimitResponse(
  result: RateLimitResult,
  config: RateLimitConfig
): Response {
  const headers = {
    'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
    'X-RateLimit-Limit': (config.maxRequests).toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
  }
  
  return new Response(
    JSON.stringify({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: config.message || '请求过于频繁，请稍后再试'
      }
    }),
    {
      status: config.statusCode || 429,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    }
  )
}

// 装饰器函数，用于包装Edge Function处理器
export function withRateLimit(
  route: string,
  config: Partial<RateLimitConfig> = {}
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (req: Request, ...args: any[]) {
      try {
        // 检查速率限制
        const result = await checkRateLimit(req, route, config)
        
        if (result.isLimited) {
          const routeRules = getRateLimitRules()
          const routeConfig = routeRules[route] || routeRules.default
          return createRateLimitResponse(result, { ...routeConfig, ...config })
        }
        
        // 执行原始方法
        const result = await originalMethod.call(this, req, ...args)
        
        // 在这里可以添加成功请求的逻辑（如果需要跳过成功请求）
        return result
        
      } catch (error) {
        console.error('速率限制中间件错误:', error)
        // 发生错误时，允许请求继续
        const result = await originalMethod.call(this, req, ...args)
        return result
      }
    }
    
    return descriptor
  }
}

// 获取当前速率限制状态（用于监控）
export function getRateLimitStatus() {
  const now = Date.now()
  const entries: Array<{
    key: string
    count: number
    resetTime: number
    remaining: number
  }> = []
  
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime > now) {
      entries.push({
        key,
        count: record.count,
        resetTime: record.resetTime,
        remaining: Math.max(0, 100 - record.count) // 这里假设最大限制是100
      })
    }
  }
  
  return {
    activeEntries: entries.length,
    totalEntries: rateLimitStore.size,
    entries: entries.sort((a, b) => b.count - a.count).slice(0, 10) // 返回前10个最活跃的条目
  }
}