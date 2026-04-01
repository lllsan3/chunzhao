import { Link, useLocation } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()

  if (loading) return null

  if (!user) {
    // Use custom fallback if provided, otherwise show default login prompt
    if (fallback) return <>{fallback}</>

    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <LogIn className="w-10 h-10 text-line mx-auto mb-4" />
          <p className="text-ink-muted mb-4">请先登录以使用此功能</p>
          <Link
            to={`/login?redirect=${encodeURIComponent(pathname)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-hover"
          >
            去登录
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
