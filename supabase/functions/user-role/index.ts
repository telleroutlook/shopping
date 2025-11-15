import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders, respondToCorsPreflight } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  const preflight = respondToCorsPreflight(req)
  if (preflight) {
    return preflight
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('未提供授权令牌')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 验证JWT并获取用户信息
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('无效的授权令牌')
    }

    // 获取用户角色信息 - 使用两次独立查询避免关联查询问题
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role_id')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw new Error(`获取用户信息失败: ${profileError.message}`)
    }

    // 确保用户有角色，如果没有则设置为普通用户
    if (!profile.role_id) {
      await supabase
        .from('profiles')
        .update({ role_id: 1 })
        .eq('id', user.id)
      
      profile.role_id = 1
    }

    // 查询角色信息
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id, name, description')
      .eq('id', profile.role_id)
      .single()

    if (roleError) {
      throw new Error(`获取角色信息失败: ${roleError.message}`)
    }

    return new Response(
      JSON.stringify({
        data: {
          user_id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: role
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'PERMISSION_ERROR',
          message: error.message
        }
      }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
