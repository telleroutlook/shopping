export interface CorsConfig {
  /** 允许的请求方法 */
  allowedMethods?: string
  /** 允许的请求头 */
  allowedHeaders?: string
  /** 预检缓存，单位秒 */
  maxAge?: string
  /** 是否支持凭证(cookie/authorization) */
  allowCredentials?: boolean
  /** 额外允许的域名列表（@deprecated, 推荐通过 CORS_ALLOW_ORIGINS 环境变量控制） */
  allowedOrigins?: string[]
  /** 额外响应头 */
  extraHeaders?: Record<string, string>
  /** OPTIONS 返回状态码 */
  optionStatus?: number
}

const DEFAULT_CONFIG = {
  allowedMethods: 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  allowedHeaders: 'authorization, x-client-info, apikey, content-type',
  maxAge: '86400',
  allowCredentials: false
} satisfies Required<Pick<CorsConfig, 'allowedMethods' | 'allowedHeaders' | 'maxAge' | 'allowCredentials'>>

const ENV_ALLOWED_ORIGINS = (Deno.env.get('CORS_ALLOW_ORIGINS') ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

function resolveOrigin(req: Request, config?: CorsConfig): string {
  const originHeader = req.headers.get('origin')
  const candidates = config?.allowedOrigins?.length
    ? config.allowedOrigins
    : ENV_ALLOWED_ORIGINS.length
      ? ENV_ALLOWED_ORIGINS
      : ['*']

  if (!originHeader) {
    return candidates[0] === '*' ? '*' : candidates[0]
  }

  if (candidates.includes('*')) {
    return originHeader
  }

  return candidates.includes(originHeader) ? originHeader : candidates[0]
}

/** 构建 CORS 响应头，用于普通请求和错误响应 */
export function getCorsHeaders(req: Request, config: CorsConfig = {}): Record<string, string> {
  const origin = resolveOrigin(req, config)
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': config.allowedHeaders ?? DEFAULT_CONFIG.allowedHeaders,
    'Access-Control-Allow-Methods': config.allowedMethods ?? DEFAULT_CONFIG.allowedMethods,
    'Access-Control-Max-Age': config.maxAge ?? DEFAULT_CONFIG.maxAge,
    'Access-Control-Allow-Credentials': (config.allowCredentials ?? DEFAULT_CONFIG.allowCredentials) ? 'true' : 'false',
    ...config.extraHeaders
  }
}

/** 如果遇到预检请求，直接返回包含 CORS 头的响应，调用方可以直接返回 */
export function respondToCorsPreflight(req: Request, config: CorsConfig = {}): Response | null {
  if (req.method !== 'OPTIONS') return null
  const status = config.optionStatus ?? 200
  return new Response(null, {
    status,
    headers: getCorsHeaders(req, config)
  })
}
