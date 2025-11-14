import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/supabase'
import { loginSchema, registerSchema, getValidationErrors } from '@/lib/validation'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const manualLoginModeRef = useRef(false)
  
  const setManualLoginMode = (mode: boolean) => {
    manualLoginModeRef.current = mode
  }

  const setUserRoleManually = (roleData: UserRole | null) => {
    setUserRole(roleData)
  }

  const loadUserRole = useCallback(async (currentUser: User) => {
    // 开始加载角色信息
    
    try {
      // 直接从数据库查询用户角色（绕过Edge Function）
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role_id, roles(id, name, description)')
        .eq('id', currentUser.id)
        .single()
      
      if (profileError) {
        console.error('[AuthContext] 数据库查询失败:', profileError)
        setUserRole(null)
        return
      }
      
      if (profiles && profiles.roles) {
        const roleData: UserRole = {
          user_id: profiles.id,
          email: profiles.email,
          full_name: profiles.full_name,
          role: {
            id: (profiles.roles as any).id,
            name: (profiles.roles as any).name,
            description: (profiles.roles as any).description,
            created_at: (profiles.roles as any).created_at || new Date().toISOString()
          }
        }
        setUserRole(roleData)
      } else {
        console.error('[AuthContext] 未找到用户角色数据')
        setUserRole(null)
      }
    } catch (error) {
      console.error('[AuthContext] 加载角色异常:', error)
      setUserRole(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshUserRole = useCallback(async () => {
    if (user) {
      setLoading(true)
      await loadUserRole(user)
    }
  }, [user, loadUserRole])

  useEffect(() => {
    // 加载用户
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        if (user) {
          await loadUserRole(user)  // loadUserRole的finally会设置loading=false
        } else {
          // 没有用户，直接结束loading
          setLoading(false)
        }
      } catch (error) {
        console.error('Error loading user:', error)
        setLoading(false)  // 错误时也要结束loading
      }
    }
    loadUser()

    // 监听认证状态变化 - 不在回调中使用async操作
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const newUser = session?.user || null
        setUser(newUser)
        
        // 如果处于手动登录模式，跳过自动角色加载
        if (manualLoginModeRef.current) {
          setLoading(false)
          return
        }
        
        if (newUser) {
          setLoading(true)
          // 在下一个事件循环中加载角色，避免在回调中执行异步操作
          Promise.resolve().then(() => loadUserRole(newUser))
        } else {
          setUserRole(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [loadUserRole])

  const signIn = async (email: string, password: string) => {
    try {
      // 验证输入数据
      const validatedData = loginSchema.parse({ email, password })
      
      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password
      })
      
      if (error) {
        // 提供用户友好的错误信息
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('邮箱或密码错误，请检查后重试')
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('请先验证您的邮箱地址')
        } else {
          throw new Error('登录失败，请稍后重试')
        }
      }
    } catch (error: any) {
      if (error.name === 'ZodError') {
        // 处理验证错误
        const errors = getValidationErrors(error)
        const firstError = errors[0]
        throw new Error(firstError.message)
      }
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      // 验证输入数据
      const validatedData = registerSchema.parse({ email, password, confirmPassword: password })
      
      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      
      if (error) {
        // 提供用户友好的错误信息
        if (error.message.includes('User already registered')) {
          throw new Error('该邮箱已被注册，请使用其他邮箱或尝试登录')
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('密码至少需要6个字符')
        } else {
          throw new Error('注册失败，请稍后重试')
        }
      }
    } catch (error: any) {
      if (error.name === 'ZodError') {
        // 处理验证错误
        const errors = getValidationErrors(error)
        const firstError = errors[0]
        throw new Error(firstError.message)
      }
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // 使用useMemo优化value对象，避免不必要的重渲染
  const value = useMemo(
    () => ({ user, userRole, loading, signIn, signUp, signOut, refreshUserRole, setUserRoleManually, setManualLoginMode }),
    [user, userRole, loading, refreshUserRole]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
