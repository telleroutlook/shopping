import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 角色ID常量
export const ROLES = {
  USER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3
} as const

// 检查用户是否有指定角色
export function useRole() {
  const { userRole } = useAuth()

  const isUser = userRole?.role?.id === ROLES.USER
  const isAdmin = userRole?.role?.id === ROLES.ADMIN
  const isSuperAdmin = userRole?.role?.id === ROLES.SUPER_ADMIN
  const isAdminOrHigher = userRole?.role?.id && userRole.role.id >= ROLES.ADMIN
  
  return {
    userRole,
    isUser,
    isAdmin,
    isSuperAdmin,
    isAdminOrHigher,
    roleId: userRole?.role?.id || null,
    roleName: userRole?.role?.name || null
  }
}

// 路由守卫：要求指定角色
export function useRequireRole(requiredRoleId: number, redirectTo: string = '/') {
  const { user, userRole, loading } = useAuth()
  const navigate = useNavigate()

  const hasPermission = userRole?.role?.id && userRole.role.id >= requiredRoleId

  useEffect(() => {
    console.log('[useRequireRole] 状态检查:', {
      user: user?.email,
      userRole: userRole?.role?.name,
      hasPermission,
      loading
    })
    
    if (!loading) {
      if (!user) {
        console.log('[useRequireRole] 未登录，跳转到登录页')
        navigate('/login')
      } else if (!hasPermission) {
        console.log('[useRequireRole] 权限不足，跳转到:', redirectTo)
        navigate(redirectTo)
      }
    }
  }, [user, userRole, loading, hasPermission, requiredRoleId, redirectTo, navigate])

  return { 
    loading, 
    hasPermission
  }
}

// 路由守卫：要求管理员或更高权限
export function useRequireAdmin(redirectTo: string = '/') {
  return useRequireRole(ROLES.ADMIN, redirectTo)
}

// 路由守卫：要求超级管理员权限
export function useRequireSuperAdmin(redirectTo: string = '/') {
  return useRequireRole(ROLES.SUPER_ADMIN, redirectTo)
}

// 通用角色检查hook（不带导航跳转）
export function useCheckRole(requiredRoleId: number) {
  const { userRole, refreshUserRole } = useAuth()
  
  const hasPermission = userRole?.role?.id && userRole.role.id >= requiredRoleId
  
  console.log('[useCheckRole] 检查权限:', {
    requiredRoleId,
    currentRoleId: userRole?.role?.id,
    hasPermission
  })
  
  return {
    hasPermission,
    userRole,
    roleName: userRole?.role?.name || null,
    refreshUserRole
  }
}
  
