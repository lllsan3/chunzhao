import { Link, useLocation } from 'react-router-dom'
import { Search, Kanban, BarChart3, CreditCard, FileText, LogIn, LogOut, Bell } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { prefetchJobs } from '../../lib/prefetch'

const navItems = [
  { to: '/jobs', icon: Search, label: '找职位' },
  { to: '/board', icon: Kanban, label: '我的投递' },
  { to: '/dashboard', icon: BarChart3, label: '进度概览' },
  { to: '/pricing', icon: CreditCard, label: '升级计划' },
  { to: '/exam', icon: FileText, label: '笔试真题' },
]

export function Navbar() {
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-line-light">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-ink">
          <Kanban className="w-5 h-5" />
          <span className="text-base">校招助手</span>
          <span className="hidden md:inline text-xs text-ink-muted font-normal ml-1">春招信息整合 + 进度管理</span>
        </Link>

        {/* Desktop nav — unchanged */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onMouseEnter={item.to === '/jobs' ? prefetchJobs : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-tag-bg text-ink font-medium'
                    : 'text-ink-muted hover:text-ink hover:bg-tag-bg'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink px-3 py-1.5 rounded-lg hover:bg-tag-bg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 text-sm bg-brand text-white px-4 py-1.5 rounded-lg hover:bg-brand-hover transition-colors"
            >
              <LogIn className="w-4 h-4" />
              登录
            </Link>
          )}
        </div>

        {/* Mobile right side — notification bell (replaces hamburger) */}
        <div className="md:hidden flex items-center gap-2">
          <button className="p-2 text-ink-muted">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}
