import { Link } from 'react-router-dom'
import { ArrowRight, Import, Kanban, Bell, ChevronRight } from 'lucide-react'
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
    <div className="min-h-screen bg-[#F4F4F0]">

      {/* ═══════════ HERO ═══════════ */}
      <section className="px-5 md:px-8 pt-12 md:pt-24 pb-16 md:pb-32 max-w-5xl mx-auto">
        {/* Eyebrow */}
        <p className="text-xs tracking-[0.25em] text-[#1C1C1C]/50 mb-6 md:mb-8">
          校 招 信 息 整 合 · 进 度 管 理
        </p>

        {/* Headline — editorial serif, massive size contrast */}
        <h1 className="font-editorial text-4xl md:text-7xl font-bold text-[#1C1C1C] leading-[1.15] md:leading-[1.1] mb-6 md:mb-8">
          别再用备忘录
          <br />
          管<span className="text-accent">校招</span>了
        </h1>

        {/* Subtitle — sans-serif, muted, breathing room */}
        <p className="text-base md:text-lg text-[#1C1C1C]/60 max-w-lg leading-relaxed mb-10 md:mb-14">
          2 万 + 岗位一键搜索，导入申请池自动跟踪，从网申到 Offer 全程可视化。3 分钟上手，不再漏投错投。
        </p>

        {/* CTAs — high contrast, editorial button style */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/jobs"
            className="inline-flex items-center justify-center gap-2 bg-[#1C1C1C] text-[#F4F4F0] px-8 py-4 rounded-md text-sm font-medium hover:bg-[#333] transition-colors"
          >
            开始找工作
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/board"
            className="inline-flex items-center justify-center gap-2 bg-transparent text-[#1C1C1C] px-8 py-4 rounded-md text-sm font-medium border border-[#1C1C1C]/20 hover:border-[#1C1C1C]/40 transition-colors"
          >
            查看我的看板
          </Link>
        </div>

        {/* Stats strip — light, editorial data display */}
        <div className="mt-14 md:mt-20 flex flex-wrap gap-8 md:gap-16 border-t border-[#1C1C1C]/10 pt-8">
          <div>
            <p className="font-editorial text-3xl md:text-5xl font-light text-[#1C1C1C]">24,000<span className="text-lg md:text-2xl">+</span></p>
            <p className="text-xs tracking-[0.15em] text-[#1C1C1C]/40 mt-1">校 招 岗 位</p>
          </div>
          <div>
            <p className="font-editorial text-3xl md:text-5xl font-light text-[#1C1C1C]">2,300<span className="text-lg md:text-2xl">+</span></p>
            <p className="text-xs tracking-[0.15em] text-[#1C1C1C]/40 mt-1">央 国 企</p>
          </div>
          <div>
            <p className="font-editorial text-3xl md:text-5xl font-light text-[#1C1C1C]">950<span className="text-lg md:text-2xl">+</span></p>
            <p className="text-xs tracking-[0.15em] text-[#1C1C1C]/40 mt-1">大 厂 岗 位</p>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="bg-white/60 border-t border-[#1C1C1C]/5">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-16 md:py-28">
          {/* Section label */}
          <p className="text-xs tracking-[0.25em] text-[#1C1C1C]/40 mb-4">核 心 能 力</p>
          <h2 className="font-editorial text-2xl md:text-4xl font-bold text-[#1C1C1C] mb-12 md:mb-16">
            从搜到投，一条线管完
          </h2>

          {/* Feature cards — asymmetric grid on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
            {/* Card 1: large, spans 7 cols */}
            <div className="md:col-span-7 bg-[#F9F9F6] border border-[#1C1C1C]/8 rounded-sm p-6 md:p-8 flex flex-col">
              <div className="w-10 h-10 rounded-sm bg-[#1C1C1C] flex items-center justify-center mb-5">
                <Import className="w-5 h-5 text-[#F4F4F0]" />
              </div>
              <h3 className="font-editorial text-xl md:text-2xl font-bold text-[#1C1C1C] mb-2">一键导入申请池</h3>
              <p className="text-sm text-[#1C1C1C]/55 leading-relaxed flex-1">
                在 2 万 + 职位库中发现心仪岗位，点击即导入你的专属申请池。看板自动开始跟踪，告别 Excel 和收藏夹的原始时代。
              </p>
              <Link to="/jobs" className="mt-5 inline-flex items-center gap-1 text-sm text-[#1C1C1C] font-medium hover:text-accent transition-colors">
                浏览职位库 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 2: smaller, spans 5 cols */}
            <div className="md:col-span-5 bg-[#F9F9F6] border border-[#1C1C1C]/8 rounded-sm p-6 md:p-8 flex flex-col">
              <div className="w-10 h-10 rounded-sm bg-accent flex items-center justify-center mb-5">
                <Kanban className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-editorial text-xl md:text-2xl font-bold text-[#1C1C1C] mb-2">看板式进度管理</h3>
              <p className="text-sm text-[#1C1C1C]/55 leading-relaxed flex-1">
                待评估、笔试、面试、Offer —— 所有进度一目了然。拖拽即更新，轻量高效。
              </p>
              <Link to="/board" className="mt-5 inline-flex items-center gap-1 text-sm text-[#1C1C1C] font-medium hover:text-accent transition-colors">
                查看看板 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 3: full width, horizontal layout */}
            <div className="md:col-span-12 bg-[#F9F9F6] border border-[#1C1C1C]/8 rounded-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-10 h-10 rounded-sm bg-[#d38b1f] flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-editorial text-xl md:text-2xl font-bold text-[#1C1C1C] mb-1">关键节点提醒</h3>
                <p className="text-sm text-[#1C1C1C]/55 leading-relaxed">
                  为每个岗位设置网申截止日和面试提醒，不再错过任何一个关键时间点。
                </p>
              </div>
              <Link to="/jobs" className="inline-flex items-center gap-1 text-sm text-[#1C1C1C] font-medium hover:text-accent transition-colors shrink-0">
                立即体验 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className="border-t border-[#1C1C1C]/5">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-16 md:py-24 text-center">
          <p className="text-xs tracking-[0.25em] text-[#1C1C1C]/40 mb-4">开 始 使 用</p>
          <h2 className="font-editorial text-2xl md:text-4xl font-bold text-[#1C1C1C] mb-4">
            准备好掌控你的校招节奏了吗？
          </h2>
          <p className="text-sm text-[#1C1C1C]/50 max-w-md mx-auto mb-8">
            加入数千名正在使用校招助手的同学，用结构化的工作流代替混乱的收藏夹。
          </p>
          <Link
            to={user ? '/pricing' : '/login'}
            className="inline-flex items-center justify-center gap-2 bg-[#1C1C1C] text-[#F4F4F0] px-8 py-4 rounded-md text-sm font-medium hover:bg-[#333] transition-colors"
          >
            {user ? '查看升级计划' : '免费注册，开始管理'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
