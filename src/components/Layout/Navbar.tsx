import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Kanban, BarChart3, CreditCard, FileText, Menu, X, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

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
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-line-light">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-ink">
          <Kanban className="w-5 h-5" />
          <span className="text-base">校招助手</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
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

        {/* Auth + mobile toggle */}
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={signOut}
              className="hidden md:flex items-center gap-1 text-sm text-ink-muted hover:text-ink px-3 py-1.5 rounded-lg hover:bg-tag-bg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex items-center gap-1 text-sm bg-brand text-white px-4 py-1.5 rounded-lg hover:bg-brand-hover transition-colors"
            >
              <LogIn className="w-4 h-4" />
              登录
            </Link>
          )}
          <button
            className="md:hidden p-2 text-ink-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-line-light bg-white px-4 pb-4">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm ${
                  active ? 'bg-tag-bg text-ink font-medium' : 'text-ink-muted'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
          <div className="border-t border-line-light mt-2 pt-2">
            {user ? (
              <button
                onClick={() => { signOut(); setMobileOpen(false) }}
                className="flex items-center gap-2 px-3 py-3 text-sm text-ink-muted w-full"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-3 text-sm text-ink-muted"
              >
                <LogIn className="w-4 h-4" />
                登录 / 注册
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
