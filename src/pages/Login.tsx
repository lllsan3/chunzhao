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

function translateError(message: string): string {
  if (ERROR_MAP[message]) return ERROR_MAP[message]

  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (message.includes(key)) return value
  }

  return message
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
  const redirectTo = rawRedirect.startsWith('/') ? rawRedirect : '/jobs'

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    if (isSignUp) {
      const result = await signUp(email, password)
      if (result.error) {
        setError(translateError(result.error.message))
      } else {
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
    <div className="min-h-screen bg-page px-3 py-4 md:px-4 md:py-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-black md:mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </button>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-12">
          <section className="border-b border-gray-200 pb-4 md:border-b-0 md:pb-0">
            <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">ACCOUNT</p>
            <h1 className="mt-2 font-serif text-[32px] font-semibold tracking-tight text-gray-900 md:text-5xl">
              {isSignUp ? '创建你的校招工作台' : '登录校招助手'}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 md:mt-4 md:text-base">
              用一套更有秩序的方式管理职位、看板和提醒。注册后会自动登录，继续回到你刚才的页面。
            </p>

            <div className="mt-5 space-y-3 border-t border-gray-200 pt-4 md:mt-8 md:space-y-4 md:pt-5">
              <div className="border-b border-gray-200 pb-3 md:pb-4">
                <p className="text-sm font-medium text-gray-900">职位池同步</p>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  登录后，导入的岗位、笔记和提醒都会和账号绑定。
                </p>
              </div>
              <div className="border-b border-gray-200 pb-3 md:pb-4">
                <p className="text-sm font-medium text-gray-900">看板持续更新</p>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  你在任意设备上的状态拖拽和编辑都会同步保存。
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">低噪音工作流</p>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  把分散的收藏夹、备忘录和聊天记录，统一收进一个申请系统。
                </p>
              </div>
            </div>
          </section>

          <section className="border border-gray-200 bg-white px-4 py-4 shadow-none md:p-7">
            <div className="flex gap-6 border-b border-gray-200 pb-2">
              <button
                onClick={() => {
                  setIsSignUp(false)
                  setError('')
                }}
                className={`border-b-2 pb-2 text-sm transition-colors ${
                  !isSignUp
                    ? 'border-black font-semibold text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                登录
              </button>
              <button
                onClick={() => {
                  setIsSignUp(true)
                  setError('')
                }}
                className={`border-b-2 pb-2 text-sm transition-colors ${
                  isSignUp
                    ? 'border-black font-semibold text-black'
                    : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                注册
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 md:mt-6 md:space-y-4">
              <div>
                <label className="mb-1.5 block text-sm text-gray-500">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full border border-gray-200 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-black md:py-3"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm text-gray-500">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  className="w-full border border-gray-200 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-black md:py-3"
                  placeholder="至少 6 位"
                />
              </div>

              {error ? (
                <p className="border border-red-200 px-3 py-2.5 text-sm text-red-600 md:py-3">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black px-8 py-3.5 text-sm font-bold tracking-[0.2em] text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 md:py-4"
              >
                {loading ? '处理中...' : isSignUp ? '创建账号' : '立即登录'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
