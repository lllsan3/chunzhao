import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useSEO } from '../hooks/useSEO'

const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': '邮箱或密码错误',
  'Email not confirmed': '请先验证邮箱',
  'User already registered': '该邮箱已注册',
  'Signup requires a valid password': '请输入有效密码（至少 6 位）',
  'Unable to validate email address: invalid format': '邮箱格式不正确',
  'Password should be at least 6 characters': '密码至少 6 位',
  'For security purposes, you can only request this after': '操作过于频繁，请稍后再试',
}

function translateError(msg: string): string {
  // Exact match
  if (ERROR_MAP[msg]) return ERROR_MAP[msg]
  // Partial match
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (msg.includes(key)) return value
  }
  // Fallback: show original if no match
  return msg
}

export default function Login() {
  useSEO({ title: '登录 - 校招助手', path: '/login' })
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const rawRedirect = searchParams.get('redirect') || '/jobs'
  // Validate redirect is a relative path
  const redirectTo = rawRedirect.startsWith('/') ? rawRedirect : '/jobs'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isSignUp) {
      const result = await signUp(email, password)
      if (result.error) {
        setError(translateError(result.error.message))
      } else {
        // Email verification is disabled — sign in directly after signup
        const loginResult = await signIn(email, password)
        if (loginResult.error) {
          setError(translateError(loginResult.error.message))
        } else {
          navigate(redirectTo)
        }
      }
    } else {
      const result = await signIn(email, password)
      if (result.error) {
        setError(translateError(result.error.message))
      } else {
        navigate(redirectTo)
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-page flex items-start pt-20 md:items-center md:pt-0 justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Mobile back arrow */}
        <button
          onClick={() => navigate(-1)}
          className="md:hidden flex items-center gap-1 text-sm text-ink-muted mb-4 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-line-light p-6">
          <h1 className="text-xl font-bold text-ink text-center mb-6">
            {isSignUp ? '创建账号' : '登录校招助手'}
          </h1>

          {/* Tabs */}
          <div className="flex bg-tag-bg rounded-lg p-0.5 mb-6">
            <button
              onClick={() => { setIsSignUp(false); setError('') }}
              className={`flex-1 py-2.5 text-sm rounded-md transition-colors ${
                !isSignUp ? 'bg-white shadow-sm text-ink font-medium' : 'text-ink-muted'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError('') }}
              className={`flex-1 py-2.5 text-sm rounded-md transition-colors ${
                isSignUp ? 'bg-white shadow-sm text-ink font-medium' : 'text-ink-muted'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-ink-muted mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm text-ink-muted mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 rounded-lg border border-line text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                placeholder="至少 6 位"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white py-3 rounded-xl text-sm font-semibold hover:bg-brand-hover disabled:opacity-50 transition-colors"
            >
              {loading ? '处理中...' : isSignUp ? '注册' : '登录'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
