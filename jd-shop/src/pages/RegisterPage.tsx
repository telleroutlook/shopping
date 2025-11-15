import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import PasswordInput from '@/components/PasswordInput'
import PageShell from '@/components/PageShell'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6位字符')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password)
      setError('注册成功！请检查邮箱并验证后登录。')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      console.error('注册错误:', err)
      setError(err.message || '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell includeFooter={false} mainClassName="flex items-center justify-center" innerClassName="w-full max-w-md">
      <div className="bg-white border border-background-divider rounded-lg p-8 shadow-card">
        <h1 className="text-2xl font-bold text-text-primary text-center mb-8">
          创建账号
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
            autoComplete="new-password"
          />

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
              确认密码
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-14 px-4 border border-background-divider rounded-md focus:border-brand focus:outline-none transition-colors text-base"
              placeholder="请再次输入密码"
            />
          </div>

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
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-brand hover:underline">
            已有账号？立即登录
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-text-tertiary hover:text-brand">
            返回首页
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
