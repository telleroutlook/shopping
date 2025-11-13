import { useState, useEffect } from 'react'
import { Users, Shield, History, AlertCircle, RefreshCw } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useCheckRole } from '@/hooks/usePermission'
import { superAdminUsersApi } from '@/lib/api'
import { ROLES } from '@/hooks/usePermission'
import { useAuth } from '@/hooks/useAuth'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role_id: number
  roles: {
    id: number
    name: string
    description: string
  }
  created_at: string
}

export default function SuperAdminUsersPage() {
  const { user, loading: authLoading } = useAuth()
  const { hasPermission, refreshUserRole } = useCheckRole(ROLES.SUPER_ADMIN)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  // 调试日志
  console.log('SuperAdminUsersPage - 权限状态:', {
    user: user?.email,
    authLoading,
    hasPermission
  })

  useEffect(() => {
    if (!authLoading && hasPermission) {
      console.log('权限检查通过，加载用户列表')
      loadUsers()
    } else if (!authLoading && !hasPermission) {
      console.log('权限检查失败，结束加载')
      setLoading(false)
    }
  }, [authLoading, hasPermission])

  const handleRetryPermission = async () => {
    console.log('手动重试权限检查')
    await refreshUserRole()
  }

  const loadUsers = async () => {
    try {
      const data = await superAdminUsersApi.listUsers()
      setUsers(data)
    } catch (error: any) {
      console.error('加载用户失败:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSetRole = async (user_id: string, new_role_id: number, email: string) => {
    const reason = prompt(`请输入修改 ${email} 角色的原因:`)
    if (!reason) return

    try {
      await superAdminUsersApi.setRole(user_id, new_role_id, reason)
      alert('角色设置成功')
      loadUsers()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const loadHistory = async () => {
    try {
      const data = await superAdminUsersApi.getRoleHistory()
      setHistory(data)
      setShowHistory(true)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const getRoleName = (role_id: number) => {
    switch (role_id) {
      case ROLES.USER: return '普通用户'
      case ROLES.ADMIN: return '管理员'
      case ROLES.SUPER_ADMIN: return '超级管理员'
      default: return '未知'
    }
  }

  const getRoleColor = (role_id: number) => {
    switch (role_id) {
      case ROLES.USER: return 'text-text-secondary'
      case ROLES.ADMIN: return 'text-info'
      case ROLES.SUPER_ADMIN: return 'text-error'
      default: return 'text-text-tertiary'
    }
  }

  // 显示权限加载状态
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="text-text-secondary mb-2">正在验证权限...</p>
            <p className="text-xs text-text-tertiary">authLoading: {authLoading ? 'true' : 'false'}</p>
            <p className="text-xs text-text-tertiary">hasPermission: {hasPermission ? 'true' : 'false'}</p>
            <p className="text-xs text-text-tertiary">loading: {loading ? 'true' : 'false'}</p>
          </div>
        </div>
      </div>
    )
  }

  // 显示数据加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="text-text-secondary mb-2">加载用户列表...</p>
            <p className="text-xs text-text-tertiary">authLoading: {authLoading ? 'true' : 'false'}</p>
            <p className="text-xs text-text-tertiary">hasPermission: {hasPermission ? 'true' : 'false'}</p>
            <p className="text-xs text-text-tertiary">loading: {loading ? 'true' : 'false'}</p>
          </div>
        </div>
      </div>
    )
  }

  // 如果没有权限,显示错误消息
  if (!hasPermission) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <p className="text-error text-lg font-semibold mb-2">权限不足</p>
            <p className="text-text-secondary mb-4">您没有访问此页面的权限</p>
            <button
              onClick={handleRetryPermission}
              className="flex items-center space-x-2 px-4 h-10 border-2 border-brand text-brand font-medium rounded-md hover:bg-brand hover:text-white transition-colors mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>重新检查权限</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-h1 font-bold text-text-primary">用户管理</h1>
            <button
              onClick={loadHistory}
              className="flex items-center space-x-2 px-6 h-14 border-2 border-background-divider text-text-primary font-semibold rounded-md hover:border-brand transition-colors"
            >
              <History className="w-5 h-5" />
              <span>角色变更历史</span>
            </button>
          </div>

          {showHistory && (
            <div className="bg-white border border-background-divider rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">角色变更历史</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-sm text-brand hover:underline"
                >
                  关闭
                </button>
              </div>
              {history.length === 0 ? (
                <p className="text-text-secondary text-center py-8">暂无变更记录</p>
              ) : (
                <div className="space-y-3">
                  {history.map((record) => (
                    <div key={record.id} className="p-4 bg-background-surface rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-text-primary">
                            {record.user?.email || '未知用户'}
                          </p>
                          <p className="text-sm text-text-secondary mt-1">
                            从 <span className="font-medium">{record.old_role?.name}</span> 
                            {' '}→{' '}
                            <span className="font-medium">{record.new_role?.name}</span>
                          </p>
                          <p className="text-xs text-text-tertiary mt-1">
                            操作人: {record.changer?.email || '系统'}
                          </p>
                          {record.reason && (
                            <p className="text-xs text-text-tertiary mt-1">
                              原因: {record.reason}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-text-tertiary">
                          {new Date(record.changed_at).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {users.length === 0 ? (
            <div className="bg-white border border-background-divider rounded-lg p-12 text-center">
              <Users className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <p className="text-text-secondary">暂无用户</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white border border-background-divider rounded-lg p-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
                        <h3 className="font-semibold text-text-primary break-words">
                          {user.email}
                        </h3>
                        <span className={`text-sm font-medium whitespace-nowrap ${getRoleColor(user.role_id)}`}>
                          {user.roles.description || getRoleName(user.role_id)}
                        </span>
                      </div>
                      {user.full_name && (
                        <p className="text-sm text-text-secondary mb-1">
                          姓名: {user.full_name}
                        </p>
                      )}
                      {user.phone && (
                        <p className="text-sm text-text-secondary mb-1">
                          电话: {user.phone}
                        </p>
                      )}
                      <p className="text-xs text-text-tertiary">
                        注册时间: {new Date(user.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      {user.role_id !== ROLES.SUPER_ADMIN && (
                        <>
                          {user.role_id === ROLES.USER && (
                            <button
                              onClick={() => handleSetRole(user.id, ROLES.ADMIN, user.email)}
                              className="flex items-center space-x-1 px-4 h-10 bg-info text-white text-sm font-medium rounded-md hover:bg-info/90 transition-colors whitespace-nowrap"
                            >
                              <Shield className="w-4 h-4" />
                              <span>设为管理员</span>
                            </button>
                          )}
                          {user.role_id === ROLES.ADMIN && (
                            <button
                              onClick={() => handleSetRole(user.id, ROLES.USER, user.email)}
                              className="flex items-center space-x-1 px-4 h-10 border-2 border-background-divider text-text-primary text-sm font-medium rounded-md hover:border-brand transition-colors whitespace-nowrap"
                            >
                              <span>解除管理员</span>
                            </button>
                          )}
                        </>
                      )}
                      {user.role_id === ROLES.SUPER_ADMIN && (
                        <span className="px-4 h-10 flex items-center bg-error/10 text-error text-sm font-medium rounded-md whitespace-nowrap">
                          超级管理员
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
