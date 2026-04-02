import { Fragment } from 'react'
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
      <section className="px-5 md:px-8 pt-12 md:pt-24 pb-16 md:pb-32 max-w-5xl mx-auto">
        {/* Eyebrow */}
        <p className="text-[11px] tracking-[0.25em] text-[#1C1C1C]/40 mb-6 md:mb-8">
          校 招 信 息 整 合 · 进 度 管 理
        </p>

        {/* Headline */}
        <h1 className="font-editorial text-4xl md:text-7xl font-bold text-[#1C1C1C] leading-[1.15] md:leading-[1.08] mb-6 md:mb-8">
          别再用备忘录
          <br />
          管<span className="text-accent">校招</span>了
        </h1>

        {/* Subtitle — generous leading for breathing room */}
        <p className="text-base md:text-lg text-[#1C1C1C]/55 max-w-lg leading-loose mb-10 md:mb-14">
          2 万 + 岗位一键搜索，导入申请池自动跟踪，从网申到 Offer 全程可视化。3 分钟上手，不再漏投错投。
        </p>

        {/* CTAs */}
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
            className="inline-flex items-center justify-center gap-2 bg-transparent text-[#1C1C1C] px-8 py-4 rounded-md text-sm font-medium border border-[#1C1C1C]/15 hover:border-[#1C1C1C]/40 transition-colors"
          >
            查看我的看板
          </Link>
        </div>

        {/* Stats strip */}
        <div className="mt-14 md:mt-20 flex flex-wrap gap-8 md:gap-16 border-t border-[#1C1C1C]/10 pt-8">
          {[
            { num: '24,000', label: '校 招 岗 位' },
            { num: '2,300', label: '央 国 企' },
            { num: '950', label: '大 厂 岗 位' },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-editorial text-3xl md:text-5xl font-light text-[#1C1C1C]">
                {s.num}<span className="text-lg md:text-2xl">+</span>
              </p>
              <p className="text-[11px] tracking-[0.15em] text-[#1C1C1C]/35 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="border-t border-[#1C1C1C]/5 bg-white/50">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-14 md:py-28">
          {/* Section header */}
          <p className="text-[11px] tracking-[0.25em] text-[#1C1C1C]/35 mb-3">核 心 能 力</p>
          <h2 className="font-editorial text-2xl md:text-4xl font-bold text-[#1C1C1C] mb-10 md:mb-16">
            从搜到投，一条线管完
          </h2>

          {/* ─── Mobile: editorial index list ─── */}
          <div className="md:hidden space-y-0">
            {features.map((f, i) => (
              <div key={i} className="border-t border-[#1C1C1C] pt-4 pb-5">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-sm ${f.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <f.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-editorial text-lg font-bold text-[#1C1C1C] mb-1">{f.title}</h3>
                    <p className="text-sm text-[#1C1C1C]/50 leading-relaxed line-clamp-2">{f.desc}</p>
                    <Link
                      to={f.to}
                      className="mt-2 inline-block text-sm text-[#1C1C1C]/70 underline underline-offset-4 decoration-[#1C1C1C]/20 hover:decoration-[#1C1C1C] hover:text-[#1C1C1C] transition-colors duration-300"
                    >
                      {f.link}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ─── Desktop: asymmetric 5-1-3-1-2 grid with column dividers ─── */}
          <div className="hidden md:grid md:grid-cols-12 gap-0">
            {features.map((f, i) => {
              const Icon = f.icon
              const colSpan = i === 0 ? 'col-span-5 pr-8' : i === 1 ? 'col-span-3 px-4' : 'col-span-2 pl-4'
              const titleSize = i === 0 ? 'text-2xl' : 'text-xl'
              return (
                <Fragment key={i}>
                  {i > 0 && (
                    <div className="col-span-1 flex justify-center">
                      <div className="w-px h-full bg-[#1C1C1C]/10" />
                    </div>
                  )}
                  <div className={`${colSpan} py-2`}>
                    <div className={`w-10 h-10 rounded-sm ${f.iconBg} flex items-center justify-center mb-5`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className={`font-editorial ${titleSize} font-bold text-[#1C1C1C] mb-3`}>{f.title}</h3>
                    <p className="text-sm text-[#1C1C1C]/50 leading-relaxed mb-5">{f.desc}</p>
                    <Link
                      to={f.to}
                      className="text-sm text-[#1C1C1C] underline underline-offset-8 decoration-[#1C1C1C]/20 hover:decoration-[#1C1C1C] transition-colors duration-300"
                    >
                      {f.link}
                    </Link>
                  </div>
                </Fragment>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className="border-t border-[#1C1C1C]/5">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-16 md:py-24 text-center">
          <p className="text-[11px] tracking-[0.25em] text-[#1C1C1C]/35 mb-4">开 始 使 用</p>
          <h2 className="font-editorial text-2xl md:text-4xl font-bold text-[#1C1C1C] mb-4">
            准备好掌控你的校招节奏了吗？
          </h2>
          <p className="text-sm text-[#1C1C1C]/45 max-w-md mx-auto mb-8 leading-relaxed">
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

/* ─── Feature data ─── */
const features = [
  {
    icon: Import,
    iconBg: 'bg-[#1C1C1C]',
    title: '一键导入申请池',
    desc: '在 2 万 + 职位库中发现心仪岗位，点击即导入你的专属申请池。看板自动开始跟踪，告别 Excel 和收藏夹的原始时代。',
    to: '/jobs',
    link: '浏览职位库',
  },
  {
    icon: Kanban,
    iconBg: 'bg-accent',
    title: '看板式进度管理',
    desc: '待评估、笔试、面试、Offer —— 所有进度一目了然。拖拽即更新，轻量高效。',
    to: '/board',
    link: '查看看板',
  },
  {
    icon: Bell,
    iconBg: 'bg-[#d38b1f]',
    title: '关键节点提醒',
    desc: '为每个岗位设置网申截止日和面试提醒，不再错过任何一个关键时间点。',
    to: '/jobs',
    link: '立即体验',
  },
]
