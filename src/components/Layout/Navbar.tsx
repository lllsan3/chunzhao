import { Link, useLocation } from 'react-router-dom'
import { Kanban } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { prefetchJobs } from '../../lib/prefetch'

const navItems = [
  { to: '/jobs', label: '找职位' },
  { to: '/board', label: '我的投递' },
  { to: '/dashboard', label: '进度概览' },
  { to: '/pricing', label: '升级计划' },
  { to: '/exam', label: '笔试真题' },
]

export function Navbar() {
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1C1C1C]/8 bg-[#F4F4F0]/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold text-[#1C1C1C]">
          <Kanban className="h-5 w-5" />
          <span className="text-base">校招助手</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onMouseEnter={item.to === '/jobs' ? prefetchJobs : undefined}
                className={`border-b pb-1 text-sm transition-colors duration-200 ${
                  active
                    ? 'border-[#1C1C1C] font-medium text-[#1C1C1C]'
                    : 'border-transparent text-[#1C1C1C]/45 hover:text-[#1C1C1C]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="hidden md:block">
          {user ? (
            <button
              onClick={signOut}
              className="text-sm text-[#1C1C1C]/45 underline underline-offset-[6px] decoration-[#1C1C1C]/12 transition-all hover:text-[#1C1C1C] hover:decoration-[#1C1C1C]"
            >
              退出
            </button>
          ) : (
            <Link
              to="/login"
              className="text-sm text-[#1C1C1C] underline underline-offset-[6px] decoration-[#1C1C1C]/12 transition-all hover:decoration-[#1C1C1C]"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
