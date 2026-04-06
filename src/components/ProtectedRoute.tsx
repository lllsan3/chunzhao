import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Loader2, LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-start justify-center bg-page px-3 pt-10 pb-8 md:items-center md:px-4 md:pt-8">
        <div className="w-full max-w-md border border-gray-200 bg-white p-5 text-center shadow-none md:p-8">
          <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">ACCESS</p>
          <Loader2 className="mx-auto mt-4 h-7 w-7 animate-spin text-gray-400 md:h-8 md:w-8" />
          <p className="mt-4 text-sm leading-6 text-gray-500">正在校验登录状态，请稍等片刻。</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (fallback) return <>{fallback}</>

    return (
      <div className="flex min-h-screen items-start justify-center bg-page px-3 pt-10 pb-8 md:items-center md:px-4 md:pt-8">
        <div className="w-full max-w-md border border-gray-200 bg-white p-5 text-center shadow-none md:p-8">
          <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">ACCESS</p>
          <LogIn className="mx-auto mt-4 h-7 w-7 text-gray-400 md:h-8 md:w-8" />
          <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-gray-900">
            请先登录
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            登录后即可继续使用这个功能，所有申请记录和看板状态都会同步保存。
          </p>
          <Link
            to={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="mt-6 inline-flex items-center justify-center gap-2 bg-black px-6 py-3 text-sm font-bold tracking-[0.16em] text-white transition-colors hover:bg-gray-800"
          >
            去登录
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
