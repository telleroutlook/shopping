import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/lib/supabase'
import Header from '@/components/Header'
import PasswordInput from '@/components/PasswordInput'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp, setUserRoleManually, setManualLoginMode } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // 启用手动登录模式，防止auth state change干扰
        console.log('🔒 [LoginPage] 启用手动登录模式')
        setManualLoginMode(true)
        
        console.log('📝 [LoginPage] 步骤0：开始登录流程...')
        await signIn(email, password)
        console.log('[LoginPage] 步骤1：登录API调用成功')
        
        // 获取当前用户
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
          setError('登录成功但无法获取用户信息')
          return
        }
        
        console.log('[LoginPage] 步骤2：开始从数据库查询用户角色...')
        
        // 直接从数据库查询用户角色
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name, role_id, roles(id, name, description)')
          .eq('id', currentUser.id)
          .single()
        
        if (profileError) {
          console.error('[LoginPage] 数据库查询失败:', profileError)
          setError('获取用户角色失败，请重试')
          return
        }
        
        if (!profile || !profile.roles) {
          console.error('[LoginPage] 未找到用户角色数据')
          setError('未找到用户角色信息')
          return
        }
        
        console.log('[LoginPage] 步骤3：角色查询成功')
        
        const roleData: UserRole = {
          user_id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: {
            id: (profile.roles as any).id,
            name: (profile.roles as any).name,
            description: (profile.roles as any).description,
            created_at: (profile.roles as any).created_at || new Date().toISOString()
          }
        }
        
        console.log('[LoginPage] 角色详情 - ID:', roleData.role.id, '名称:', roleData.role.name)
        
        setUserRoleManually(roleData)
        
        console.log('[LoginPage] 步骤4：角色设置成功')
        
        // 根据用户角色决定跳转目标
        const targetPath = roleData.role.id === 3 ? '/super-admin/users' : '/'
        console.log('[LoginPage] 步骤5：准备导航到对应页面:', targetPath)
        
        // 添加延迟确保状态更新
        await new Promise(resolve => setTimeout(resolve, 300))
        
        console.log('[LoginPage] 延迟结束，开始导航')
        
        // 禁用手动登录模式
        console.log('[LoginPage] 禁用手动登录模式')
        setManualLoginMode(false)
        
        navigate(targetPath)
        
        console.log('[LoginPage] navigate 调用完成，登录流程结束')
      } else {
        await signUp(email, password)
        setError('注册成功！请检查邮箱并验证后登录。')
      }
    } catch (err: any) {
      console.error('登录/注册错误:', err)
      setError(err.message || '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <div className="bg-white border border-background-divider rounded-lg p-8 shadow-card">
            <h1 className="text-2xl font-bold text-text-primary text-center mb-8">
              {isLogin ? '登录' : '注册'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  邮箱
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none transition-colors text-base"
                  placeholder="请输入邮箱"
                />
              </div>

              <PasswordInput
                id="password"
                label="密码"
                value={password}
                onChange={setPassword}
                placeholder="请输入密码（至少6位）"
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />

              {error && (
                <div className={`p-3 rounded-md text-sm ${
                  error.includes('成功') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover disabled:bg-background-divider disabled:text-text-tertiary transition-colors duration-fast flex items-center justify-center"
              >
                {loading ? '处理中...' : isLogin ? '登录' : '注册'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
                className="text-sm text-brand hover:underline"
              >
                {isLogin ? '还没有账号？立即注册' : '已有账号？去登录'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-text-tertiary hover:text-brand">
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
