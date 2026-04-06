import { Link } from 'react-router-dom'
import { User, Lock, TrendingUp, Crown, FileText, LogOut, ChevronRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useSubscription } from '../hooks/useSubscription'
import { useSEO } from '../hooks/useSEO'

export default function Profile() {
  useSEO({ title: '我的 - 校招助手', path: '/profile' })

  const { user, signOut } = useAuth()
  const { membership } = useSubscription()

  const menuItems = [
    { to: '/dashboard', icon: TrendingUp, label: '进度概览' },
    { to: '/pricing', icon: Crown, label: membership.isMember ? '已是完整版会员' : '升级到完整版' },
    { to: '/exam', icon: FileText, label: '笔试真题资料' },
  ]

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-3xl px-3 py-4 md:px-4 md:py-8">
        <section className="border-b border-gray-200 pb-4 md:pb-7">
          <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">PROFILE</p>
          <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-gray-900 md:text-4xl">
                我的
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                这里集中管理账号、订阅状态和重要入口。
              </p>
            </div>
            <p className="text-[11px] text-gray-500 md:text-sm">
              {membership.isMember ? '当前已解锁完整功能' : '当前为免费版'}
            </p>
          </div>
        </section>

        <section className="mt-4 border border-gray-200 bg-white px-3 py-4 shadow-none md:mt-5 md:px-6 md:py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-gray-200 bg-[#F9F9F6] md:h-12 md:w-12">
              {user ? (
                <span className="text-lg font-medium text-gray-900">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              ) : (
                <User className="h-5 w-5 text-gray-500" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              {user ? (
                <>
                  <p className="truncate text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="mt-1 text-[11px] leading-5 text-gray-500 md:text-xs">
                    {membership.isMember ? '完整版会员 · 无限岗位管理' : '免费版 · 最多管理 3 个岗位'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900">未登录用户</p>
                  <p className="mt-1 text-[11px] leading-5 text-gray-500 md:text-xs">
                    登录后即可同步你的职位池、看板和真题记录。
                  </p>
                </>
              )}
            </div>

            {!user ? <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /> : null}
          </div>

          {!user ? (
            <Link
              to="/login?redirect=/profile"
              className="mt-4 inline-flex w-full items-center justify-center bg-black px-8 py-3.5 text-sm font-bold tracking-[0.2em] text-white transition-colors hover:bg-gray-800 md:mt-5 md:py-4"
            >
              免费注册 / 登录
            </Link>
          ) : null}
        </section>

        <section className="mt-4 border border-gray-200 bg-white shadow-none">
          {menuItems.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3 px-3 py-3.5 transition-colors hover:bg-[#F9F9F6] md:px-5 md:py-4 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0 text-gray-500" />
              <span className="flex-1 text-sm text-gray-900">{item.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </section>

        {user ? (
          <button
            onClick={signOut}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-gray-200 px-4 py-2.5 text-sm text-gray-600 transition-colors hover:border-black hover:text-black md:py-3"
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </button>
        ) : null}
      </div>
    </div>
  )
}
