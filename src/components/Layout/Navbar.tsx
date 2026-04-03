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
    <nav className="sticky top-0 z-50 bg-[#F4F4F0]/80 backdrop-blur-md border-b border-[#1C1C1C]/8">
      <div className="max-w-5xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-[#1C1C1C]">
          <Kanban className="w-5 h-5" />
          <span className="text-base">校招助手</span>
        </Link>

        {/* Desktop nav — editorial: muted, no bg on hover, just color shift */}
        <div className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onMouseEnter={item.to === '/jobs' ? prefetchJobs : undefined}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors duration-200 ${
                  active
                    ? 'text-[#1C1C1C] font-medium'
                    : 'text-[#1C1C1C]/45 hover:text-[#1C1C1C]'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Desktop auth — editorial: minimal, no bg button */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1 text-sm text-[#1C1C1C]/40 hover:text-[#1C1C1C] transition-colors duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              退出
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1 text-sm text-[#1C1C1C] px-4 py-1.5 rounded-md border border-[#1C1C1C]/15 hover:border-[#1C1C1C]/40 transition-colors duration-200"
            >
              <LogIn className="w-3.5 h-3.5" />
              登录
            </Link>
          )}
        </div>

        {/* Mobile right side */}
        <div className="md:hidden flex items-center gap-2">
          <button className="p-2 text-[#1C1C1C]/40">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}
