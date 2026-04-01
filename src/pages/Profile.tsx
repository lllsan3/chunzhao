import { Link } from 'react-router-dom'
import { User, Lock, TrendingUp, Crown, FileText, LogOut, ChevronRight, LayoutGrid } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useSEO } from '../hooks/useSEO'

export default function Profile() {
  useSEO({ title: '我的 - 校招助手', path: '/profile' })
  const { user, signOut } = useAuth()
  const { membership } = useSubscription()

  const menuItems = [
    { to: '/dashboard', icon: TrendingUp, label: '数据概览预览' },
    { to: '/pricing', icon: Crown, label: membership.isMember ? '已是完整版会员' : '升级到完整版' },
    { to: '/exam', icon: FileText, label: '笔试真题资料' },
  ]

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-tag-bg flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-ink-muted" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">我的</h1>
            <p className="text-xs text-ink-muted">个人中心与付费入口</p>
          </div>
        </div>

        {/* User card */}
        <div className="bg-white rounded-2xl border border-line-light shadow-sm p-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-tag-bg flex items-center justify-center shrink-0">
              {user ? (
                <span className="text-lg font-bold text-accent">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              ) : (
                <User className="w-6 h-6 text-ink-muted" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {user ? (
                <>
                  <p className="font-medium text-ink truncate">{user.email}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {membership.isMember ? '✨ 完整版会员' : '免费版 · 最多管理 3 个岗位'}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-ink">未登录用户</p>
                  <p className="text-xs text-ink-muted mt-0.5">注册后同步你的职位池、看板与笔试记录</p>
                </>
              )}
            </div>
            {!user && <Lock className="w-4 h-4 text-ink-muted/50 shrink-0" />}
          </div>

          {!user && (
            <Link
              to="/login?redirect=/profile"
              className="mt-4 w-full flex items-center justify-center py-3 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors"
            >
              免费注册 / 登录
            </Link>
          )}
        </div>

        {/* Menu items */}
        <div className="bg-white rounded-2xl border border-line-light shadow-sm divide-y divide-line-light">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-5 py-4 hover:bg-tag-bg/50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
            >
              <item.icon className="w-5 h-5 text-ink-muted shrink-0" />
              <span className="flex-1 text-sm text-ink">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-ink-muted/50" />
            </Link>
          ))}
        </div>

        {/* Logout */}
        {user && (
          <button
            onClick={signOut}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-line text-sm text-ink-muted hover:bg-tag-bg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        )}
      </div>
    </div>
  )
}
