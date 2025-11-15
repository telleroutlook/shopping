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
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 验证用户身份和权限
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('无效的授权令牌')
    }

    // 检查用户是否是超级管理员
    const { data: profile } = await supabase
      .from('profiles')
      .select('role_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role_id !== 3) {
      throw new Error('权限不足：需要超级管理员权限')
    }

    const { action, userData } = await req.json()

    switch (action) {
      case 'list_users':
        return await listUsers(supabase)
      case 'set_role':
        return await setUserRole(supabase, user.id, userData)
      case 'role_history':
        return await getRoleHistory(supabase, userData)
      default:
        throw new Error('无效的操作类型')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'SUPER_ADMIN_ERROR',
          message: error.message
        }
      }),
      { 
        status: error.message.includes('权限不足') ? 403 : 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function listUsers(supabase) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone, role_id, roles(id, name, description), created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error('获取用户列表失败：' + error.message)

  return new Response(
    JSON.stringify({ data }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function setUserRole(supabase, adminId, userData) {
  const { user_id, new_role_id, reason } = userData

  // 防止修改自己的角色
  if (user_id === adminId) {
    throw new Error('不能修改自己的角色')
  }

  // 防止设置为超级管理员（超级管理员只能通过数据库直接设置）
  if (new_role_id === 3) {
    throw new Error('不能通过API设置超级管理员')
  }

  // 获取用户当前角色
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role_id')
    .eq('id', user_id)
    .single()

  if (!currentProfile) {
    throw new Error('用户不存在')
  }

  const old_role_id = currentProfile.role_id

  // 更新用户角色
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role_id: new_role_id })
    .eq('id', user_id)

  if (updateError) throw new Error('更新用户角色失败：' + updateError.message)

  // 记录角色变更历史
  const { error: historyError } = await supabase
    .from('user_role_history')
    .insert({
      user_id,
      old_role_id,
      new_role_id,
      changed_by: adminId,
      reason: reason || '管理员操作'
    })

  if (historyError) {
    console.error('记录角色变更历史失败：', historyError)
  }

  return new Response(
    JSON.stringify({ 
      data: { 
        success: true,
        user_id,
        old_role_id,
        new_role_id
      } 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function getRoleHistory(supabase, userData) {
  const query = supabase
    .from('user_role_history')
    .select(`
      id,
      user_id,
      old_role_id,
      new_role_id,
      changed_at,
      reason,
      user:profiles!user_role_history_user_id_fkey(email, full_name),
      changer:profiles!user_role_history_changed_by_fkey(email, full_name),
      old_role:roles!user_role_history_old_role_id_fkey(name, description),
      new_role:roles!user_role_history_new_role_id_fkey(name, description)
    `)
    .order('changed_at', { ascending: false })

  if (userData && userData.user_id) {
    query.eq('user_id', userData.user_id)
  }

  const { data, error } = await query.limit(100)

  if (error) throw new Error('获取角色变更历史失败：' + error.message)

  return new Response(
    JSON.stringify({ data }),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}
