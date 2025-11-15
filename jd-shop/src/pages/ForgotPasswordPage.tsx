import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import PageShell from '@/components/PageShell'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('密码重置邮件已发送，请检查您的邮箱')
      }
    } catch (err: any) {
      setError('发送失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell includeFooter={false} mainClassName="flex items-center justify-center" innerClassName="w-full max-w-md">
      <div className="bg-white border border-background-divider rounded-lg p-8 shadow-card">
        <h1 className="text-2xl font-bold text-text-primary text-center mb-8">
          重置密码
        </h1>

        <p className="text-text-secondary text-center mb-6">
          请输入您的邮箱地址，我们将发送密码重置链接
        </p>

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
              placeholder="请输入注册邮箱"
            />
          </div>

          {error && (
            <div className="p-3 rounded-md bg-error/10 text-error text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-md bg-success/10 text-success text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-cta-primary text-white font-semibold rounded-md hover:bg-cta-primary-hover disabled:bg-background-divider disabled:text-text-tertiary transition-colors duration-fast flex items-center justify-center"
          >
            {loading ? '发送中...' : '发送重置链接'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/login" className="text-sm text-brand hover:underline block">
            记起密码了？立即登录
          </Link>
          <Link to="/register" className="text-sm text-text-tertiary hover:text-brand">
            还没有账号？去注册
          </Link>
          <Link to="/" className="text-sm text-text-tertiary hover:text-brand">
            返回首页
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
