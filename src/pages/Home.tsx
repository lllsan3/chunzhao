import { Link } from 'react-router-dom'
import { Kanban, Bell, ArrowRight, Import } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Hero */}
      <section className="px-4 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          2026届春招季已开启
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
          把零散的春招机会
          <br />
          变成<span className="text-blue-600">清晰的行动流</span>
        </h1>
        <p className="mt-4 text-slate-500 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          不再用收藏夹和Excel管理求职。从发现机会到一键导入，再到进度追踪与提醒，春招助手帮你打造最高效的求职工作流。
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            开始找工作
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/board"
            className="inline-flex items-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            查看我的看板
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            icon={<Import className="w-6 h-6 text-blue-600" />}
            title="一键导入机会"
            description="在职位库中发现心仪岗位，点击即可加入你的专属申请池，告别繁琐的手动记录。"
          />
          <FeatureCard
            icon={<Kanban className="w-6 h-6 text-violet-600" />}
            title="看板式进度管理"
            description="待评估、笔试、面试、Offer，所有进度一目了然。拖拽或点击即可更新状态，轻量高效。"
          />
          <FeatureCard
            icon={<Bell className="w-6 h-6 text-amber-600" />}
            title="关键节点提醒"
            description="为每个岗位设置专属提醒，不再错过任何一个网申截止日或面试时间。"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-4 mb-8 bg-slate-900 rounded-2xl px-6 py-12 md:py-16 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          准备好掌控你的春招节奏了吗？
        </h2>
        <p className="mt-3 text-slate-400 text-sm max-w-md mx-auto">
          加入数千名正在使用春招助手的同学，用结构化的工作流代替混乱的收藏夹。
        </p>
        <Link
          to="/pricing"
          className="mt-6 inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
        >
          查看升级计划
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
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  )
}
