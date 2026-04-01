import { Link } from 'react-router-dom'
import { Kanban, Bell, ArrowRight, Import } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  useSEO({
    title: '校招助手 - 26/27届春招秋招校招岗位管理工具',
    description: '2万+校招岗位免费查，一键导入看板管理投递进度，不再漏投错投',
    path: '/',
  })
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-page">
      {/* Hero */}
      <section className="px-4 pt-8 md:pt-24 pb-6 md:pb-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-4 md:mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          校招信息不再 scattered
        </div>
        <h1 className="text-2xl md:text-5xl font-bold text-ink leading-tight">
          <span className="md:hidden">一站式管理春招信息、投递进度和笔试资料</span>
          <span className="hidden md:inline">把零散的春招机会<br />变成<span className="text-accent">清晰的行动流</span></span>
        </h1>
        <p className="mt-3 md:mt-4 text-ink-muted text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          <span className="md:hidden">从小红书点进来后，3 分钟内就能开始搜岗位、导入申请池、跟踪进度，不再靠备忘录和 Excel 记投递。</span>
          <span className="hidden md:inline">不再用收藏夹和Excel管理求职。从发现机会到一键导入，再到进度追踪与提醒，校招助手帮你打造最高效的求职工作流。</span>
        </p>
        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/jobs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-brand-hover transition-colors"
          >
            开始找工作
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/board"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-ink px-6 py-3 rounded-xl text-sm font-medium border border-line hover:bg-tag-bg transition-colors"
          >
            查看我的看板
          </Link>
        </div>
      </section>

      {/* Social proof */}
      <section className="mx-4 mb-6 bg-brand rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs text-accent-soft font-medium mb-1">社会证明</p>
            <p className="text-lg font-bold text-white">已有 3,000+ 同学<br className="sm:hidden" />在使用</p>
            <p className="text-xs text-white/50 mt-1">覆盖互联网、快消、金融、国企与职能岗方向</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {['复旦', '浙大', '上交', '人大'].map((name) => (
              <span key={name} className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 pb-8 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            icon={<Import className="w-6 h-6 text-accent" />}
            title="一键导入申请池"
            description="看到心仪岗位后直接导入，看板自动开始跟踪。"
          />
          <FeatureCard
            icon={<Kanban className="w-6 h-6 text-violet-600" />}
            title="看板式进度管理"
            description="待评估、笔试、面试、Offer，所有进度一目了然。"
          />
          <FeatureCard
            icon={<Bell className="w-6 h-6 text-amber-600" />}
            title="关键节点提醒"
            description="为每个岗位设置专属提醒，不再错过截止日。"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-4 mb-8 bg-brand rounded-2xl px-6 py-10 md:py-16 text-center">
        <h2 className="text-lg md:text-2xl font-bold text-white">
          准备好掌控你的春招节奏了吗？
        </h2>
        <p className="mt-2 text-white/60 text-sm max-w-md mx-auto">
          加入数千名正在使用校招助手的同学，用结构化的工作流代替混乱的收藏夹。
        </p>
        <Link
          to={user ? '/pricing' : '/login'}
          className="mt-5 inline-flex items-center gap-2 bg-white text-ink px-6 py-3 rounded-xl text-sm font-medium hover:bg-tag-bg transition-colors"
        >
          {user ? '查看升级计划' : '免费注册，开始管理'}
        </Link>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-line-light shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-tag-bg flex items-center justify-center mb-3 md:mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-ink mb-1 md:mb-2">{title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed">{description}</p>
    </div>
  )
}
