import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { withRateLimit } from '../_shared/rate-limit-middleware.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://xpak1yu0vzmo.space.minimaxi.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// 密码复杂度验证函数
function validatePasswordComplexity(password: string, email?: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 基本长度检查
  if (password.length < 8) {
    errors.push('密码长度至少需要8个字符')
  } else if (password.length > 128) {
    errors.push('密码长度不能超过128个字符')
  }
  
  // 复杂度检查
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  
  if (!hasLowercase) {
    errors.push('密码必须包含至少一个小写字母')
  }
  
  if (!hasUppercase) {
    errors.push('密码必须包含至少一个大写字母')
  }
  
  if (!hasNumbers) {
    errors.push('密码必须包含至少一个数字')
  }
  
  if (!hasSpecialChars) {
    errors.push('密码必须包含至少一个特殊字符 (!@#$%^&*()_+-=[]{}|;:,.<>?)')
  }
  
  // 防止常见密码
  const commonPasswords = [
    'password', 'password123', '12345678', 'qwertyuiop', 'abcdefgh',
    '1234567890', 'welcome', 'admin', 'letmein', 'monkey'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('不能使用常见密码，请选择更复杂的密码')
  }
  
  // 防止包含邮箱用户名
  if (email) {
    const emailParts = email.split('@')[0].toLowerCase()
    if (emailParts && password.toLowerCase().includes(emailParts)) {
      errors.push('密码不能包含您的邮箱用户名')
    }
  }
  
  // 防止重复字符过多
  const repeatCharPattern = /(.)\1{3,}/ // 4个或更多相同字符
  if (repeatCharPattern.test(password)) {
    errors.push('密码不能包含4个或更多连续的相同字符')
  }
  
  // 防止连续数字或字母
  const sequentialPattern = /[a-zA-Z0-9]{4,}/
  const sequentialStr = password.match(sequentialPattern)?.[0] || ''
  if (isSequential(sequentialStr)) {
    errors.push('密码不能包含4个或更多的连续数字或字母')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// 检查是否为连续序列
function isSequential(str: string): boolean {
  if (str.length < 4) return false
  
  // 检查数字序列
  const numSequence = /(\d)\1+/g
  const letterSequence = /([a-zA-Z])\1+/g
  
  // 检查数字序列
  for (let i = 0; i < str.length - 3; i++) {
    const substring = str.substring(i, i + 4)
    const numMatch = substring.match(numSequence)
    if (numMatch && numMatch[0].length >= 4) return true
    
    // 检查字母序列
    const letters = substring.toLowerCase()
    const codes = letters.split('').map(c => c.charCodeAt(0))
    if (codes.length === 4) {
      // 检查是否是连续序列
      let isSeq = true
      for (let j = 1; j < codes.length; j++) {
        if (codes[j] !== codes[j-1] + 1) {
          isSeq = false
          break
        }
      }
      if (isSeq) return true
    }
  }
  
  return false
}

// 记录密码变更日志
function logPasswordChange(userEmail: string, action: string, success: boolean, details?: string) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    userEmail,
    action,
    success,
    details,
    source: 'user-password'
  }))
}

Deno.serve(
  withRateLimit('password')(
    async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('未提供授权令牌')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    // 使用service role key创建客户端用于更新密码
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 验证用户身份
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('无效的授权令牌')
    }

    const { current_password, new_password } = await req.json()

    // 基础验证
    if (!current_password || !new_password) {
      throw new Error('请提供当前密码和新密码')
    }

    // 验证当前密码（使用anon key尝试登录）
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
    const { error: verifyError } = await supabaseAnon.auth.signInWithPassword({
      email: user.email,
      password: current_password
    })

    if (verifyError) {
      logPasswordChange(user.email, 'password_change', false, 'current_password_incorrect')
      throw new Error('当前密码不正确')
    }

    // 密码复杂度验证
    const complexityResult = validatePasswordComplexity(new_password, user.email)
    if (!complexityResult.isValid) {
      logPasswordChange(user.email, 'password_change', false, `complexity_failed: ${complexityResult.errors.join(', ')}`)
      throw new Error(`密码不符合安全要求：\n${complexityResult.errors.join('\n')}`)
    }

    // 检查新密码是否与当前密码相同
    if (current_password === new_password) {
      logPasswordChange(user.email, 'password_change', false, 'new_password_same_as_current')
      throw new Error('新密码不能与当前密码相同')
    }

    // 更新密码（使用service role key）
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { 
        password: new_password,
        email_confirm: true
      }
    )

    if (updateError) {
      logPasswordChange(user.email, 'password_change', false, `update_failed: ${updateError.message}`)
      throw new Error('密码更新失败：' + updateError.message)
    }

    // 记录成功变更
    logPasswordChange(user.email, 'password_change', true, 'password_updated_successfully')

    return new Response(
      JSON.stringify({
        data: {
          success: true,
          message: '密码修改成功'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error: any) {
    const status = error.message.includes('当前密码不正确') ? 401 :
                   error.message.includes('不符合安全要求') ? 400 :
                   error.message.includes('不能使用') ? 400 : 500
    
    console.error('密码变更失败:', {
      error: error.message,
      user: user?.email || 'unknown',
      timestamp: new Date().toISOString()
    })
    
    return new Response(
      JSON.stringify({
        error: {
          code: 'PASSWORD_CHANGE_ERROR',
          message: error.message
        }
      }),
      { 
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
  )
)
