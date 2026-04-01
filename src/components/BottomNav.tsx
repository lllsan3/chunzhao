import { NavLink, useLocation } from 'react-router-dom'
import { Home, Search, LayoutGrid, User } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: '首页', exact: true },
  { to: '/jobs', icon: Search, label: '职位库' },
  { to: '/board', icon: LayoutGrid, label: '看板' },
  { to: '/profile', icon: User, label: '我的', matchPrefixes: ['/profile', '/dashboard', '/pricing', '/exam'] },
]

// Pages where bottom nav should be hidden
const HIDDEN_PATTERNS = ['/login', '/jobs/', '/applications/']

export function BottomNav() {
  const { pathname } = useLocation()

  // Hide on login, detail pages
  if (HIDDEN_PATTERNS.some((p) => p === pathname || (p.endsWith('/') && pathname.startsWith(p) && pathname !== p.slice(0, -1)))) {
    return null
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-line-light"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex h-14">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.to
            : tab.matchPrefixes
              ? tab.matchPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))
              : pathname === tab.to || pathname.startsWith(tab.to + '/')

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5"
            >
              <tab.icon className={`w-[22px] h-[22px] ${isActive ? 'text-accent' : 'text-ink-muted'}`} />
              <span className={`text-[11px] ${isActive ? 'text-accent font-medium' : 'text-ink-muted'}`}>
                {tab.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
