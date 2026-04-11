import { Link } from 'react-router-dom'
import { ArrowRight, Import, Kanban, Bell } from 'lucide-react'
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
      <section className="mx-auto max-w-5xl px-4 pt-9 pb-10 md:px-8 md:pt-24 md:pb-32">
        {/* Eyebrow */}
        <p className="mb-4 text-[10px] tracking-[0.22em] text-[#1C1C1C]/40 md:mb-8 md:text-[11px] md:tracking-[0.25em]">
          校 招 信 息 整 合 · 进 度 管 理
        </p>

        {/* Headline */}
        <h1 className="mb-5 font-editorial text-[38px] font-bold leading-[1.08] text-[#1C1C1C] md:mb-8 md:text-7xl md:leading-[1.08]">
          别再用 Excel
          <br />
          管<span className="border-b border-[#1C1C1C] pb-0.5">校招</span>了
        </h1>

        {/* Subtitle — generous leading for breathing room */}
        <p className="mb-7 max-w-lg text-sm leading-7 text-[#1C1C1C]/55 md:mb-14 md:text-lg md:leading-loose">
          2 万 + 岗位一键搜索，导入申请池自动跟踪，从网申到 Offer 全程可视化。3 分钟上手，不再漏投错投。
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
          <Link
            to="/jobs"
            className="inline-flex items-center justify-center gap-2 bg-[#1C1C1C] px-7 py-3.5 text-sm font-medium text-[#F4F4F0] transition-colors hover:bg-[#333] md:px-8 md:py-4"
          >
            开始找工作
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/board"
            className="inline-flex items-center justify-center gap-2 border border-[#1C1C1C]/15 bg-transparent px-7 py-3.5 text-sm font-medium text-[#1C1C1C] transition-colors hover:border-[#1C1C1C]/40 md:px-8 md:py-4"
          >
            查看我的看板
          </Link>
        </div>

        {/* Stats strip */}
        <div className="mt-8 grid grid-cols-3 gap-3 border-t border-[#1C1C1C]/10 pt-5 md:mt-20 md:flex md:flex-wrap md:gap-16 md:pt-8">
          {[
            { num: '24,000', label: '校 招 岗 位' },
            { num: '2,300', label: '央 国 企' },
            { num: '950', label: '大 厂 岗 位' },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-editorial text-[28px] font-light text-[#1C1C1C] md:text-5xl">
                {s.num}<span className="text-base md:text-2xl">+</span>
              </p>
              <p className="mt-1 text-[9px] tracking-[0.12em] text-[#1C1C1C]/35 md:text-[11px] md:tracking-[0.15em]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="border-t border-[#1C1C1C]/5 bg-white/50">
        <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-28">
          {/* Section header */}
          <p className="mb-2 text-[10px] tracking-[0.22em] text-[#1C1C1C]/35 md:mb-3 md:text-[11px] md:tracking-[0.25em]">
            核 心 能 力
          </p>
          <h2 className="mb-7 font-editorial text-[28px] font-bold text-[#1C1C1C] md:mb-16 md:text-4xl">
            从搜到投，一条线管完
          </h2>

          {/* ─── Mobile: editorial index list ─── */}
          <div className="md:hidden space-y-0">
            {features.map((f, i) => (
              <div key={i} className="group border-t border-[#1C1C1C] pt-3.5 pb-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-[#1C1C1C]/12 bg-white">
                    <f.icon className="h-3.5 w-3.5 text-[#1C1C1C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1 font-editorial text-[19px] font-bold text-[#1C1C1C]">{f.title}</h3>
                    <p className="line-clamp-2 text-sm leading-6 text-[#1C1C1C]/50">{f.desc}</p>
                    <Link
                      to={f.to}
                      className="mt-2 inline-flex items-center gap-1 text-sm text-[#1C1C1C]/70 underline underline-offset-4 decoration-[#1C1C1C]/15 transition-all duration-300 hover:text-[#1C1C1C] hover:decoration-[#1C1C1C]"
                    >
                      {f.link}
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">›</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ─── Desktop: 3-col with vertical dividers + middle column offset ─── */}
          <div className="hidden md:grid md:grid-cols-3 gap-0">
            {features.map((f, i) => {
              const Icon = f.icon
              // Middle column: border-x dividers + vertical offset for asymmetry
              const colClass = i === 0
                ? 'pr-10'
                : i === 1
                  ? 'px-10 border-x border-[#1C1C1C]/10 mt-12'
                  : 'pl-10'
              return (
                <div key={i} className={`group ${colClass} py-2`}>
                  <div className="mb-5 flex h-10 w-10 items-center justify-center border border-[#1C1C1C]/12 bg-white">
                    <Icon className="h-5 w-5 text-[#1C1C1C]" />
                  </div>
                  <h3 className={`font-editorial ${i === 0 ? 'text-2xl' : 'text-xl'} font-bold text-[#1C1C1C] mb-3`}>{f.title}</h3>
                  <p className="text-sm text-[#1C1C1C]/50 leading-relaxed mb-6">{f.desc}</p>
                  <Link
                    to={f.to}
                    className="inline-flex items-center gap-1 text-sm text-[#1C1C1C]/70 underline underline-offset-[6px] decoration-[#1C1C1C]/15 hover:decoration-[#1C1C1C] hover:text-[#1C1C1C] transition-all duration-300"
                  >
                    {f.link}
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">›</span>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className="border-t border-[#1C1C1C]/5">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center md:px-8 md:py-24">
          <p className="mb-3 text-[10px] tracking-[0.22em] text-[#1C1C1C]/35 md:mb-4 md:text-[11px] md:tracking-[0.25em]">
            开 始 使 用
          </p>
          <h2 className="mb-3 font-editorial text-[28px] font-bold text-[#1C1C1C] md:mb-4 md:text-4xl">
            准备好掌控你的校招节奏了吗？
          </h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-6 text-[#1C1C1C]/45 md:mb-8 md:leading-relaxed">
            加入数千名正在使用校招助手的同学，用结构化的工作流代替混乱的收藏夹。
          </p>
          <Link
            to={user ? '/pricing' : '/login'}
            className="inline-flex items-center justify-center gap-2 bg-[#1C1C1C] px-7 py-3.5 text-sm font-medium text-[#F4F4F0] transition-colors hover:bg-[#333] md:px-8 md:py-4"
          >
            {user ? '查看升级计划' : '免费注册，开始管理'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

/* ─── Feature data ─── */
const features = [
  {
    icon: Import,
    title: '一键导入申请池',
    desc: '在 2 万 + 职位库中发现心仪岗位，点击即导入你的专属申请池。看板自动开始跟踪，告别 Excel 和收藏夹的原始时代。',
    to: '/jobs',
    link: '浏览职位库',
  },
  {
    icon: Kanban,
    title: '看板式进度管理',
    desc: '待评估、笔试、面试、Offer —— 所有进度一目了然。拖拽即更新，轻量高效。',
    to: '/board',
    link: '查看看板',
  },
  {
    icon: Bell,
    title: '关键节点提醒',
    desc: '为每个岗位设置网申截止日和面试提醒，不再错过任何一个关键时间点。',
    to: '/jobs',
    link: '立即体验',
  },
]
