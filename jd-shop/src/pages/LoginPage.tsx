import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { UserRole } from '@/lib/supabase'
import PasswordInput from '@/components/PasswordInput'
import PageShell from '@/components/PageShell'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, setUserRoleManually, setManualLoginMode } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    setManualLoginMode(true)

    try {
      await signIn(email, password)

      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        setError('登录成功但无法获取用户信息')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role_id, roles(id, name, description)')
        .eq('id', currentUser.id)
        .single()

      if (profileError) {
        console.error('登录后角色查询失败:', profileError)
        setError('获取用户角色失败，请重试')
        return
      }

      if (!profile || !profile.roles) {
        console.error('未找到用户角色数据')
        setError('未找到用户角色信息')
        return
      }

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

      setUserRoleManually(roleData)

      // 角色决定跳转路径
      const targetPath = roleData.role.id === 3 ? '/super-admin/users' : '/'
      await new Promise((resolve) => setTimeout(resolve, 300))
      navigate(targetPath)
    } catch (err: any) {
      console.error('登录错误:', err)
      setError(err.message || '登录失败，请重试')
    } finally {
      setManualLoginMode(false)
      setLoading(false)
    }
  }

  return (
    <PageShell
      includeFooter={false}
      mainClassName="flex items-center justify-center"
      innerClassName="w-full max-w-md"
    >
      <div className="bg-white border border-background-divider rounded-lg p-8 shadow-card">
        <h1 className="text-2xl font-bold text-text-primary text-center mb-8">
          用户登录
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
            autoComplete="current-password"
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
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/register" className="text-sm text-brand hover:underline block">
            还没有账号？立即注册
          </Link>
          <Link to="/forgot-password" className="text-sm text-text-tertiary hover:text-brand block">
            忘记密码？
          </Link>
          <Link to="/" className="text-sm text-text-tertiary hover:text-brand block">
            返回首页
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
