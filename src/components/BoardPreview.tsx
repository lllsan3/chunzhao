import { Link } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'

const mockOverview = {
  total: 12,
  note: '最近一周有 3 条新的进度推进',
}

const mockStats = [
  { label: '待评估', count: 3 },
  { label: '待投递', count: 4 },
  { label: '笔试', count: 2 },
  { label: '面试', count: 1 },
]

const mockRows = [
  { company: '腾讯', role: '前端开发工程师', updated: '2 天前更新' },
  { company: '字节跳动', role: '后端开发工程师', updated: '3 天前更新' },
  { company: '美团', role: '算法工程师', updated: '5 天前更新' },
]

export default function BoardPreview() {
  useSEO({ title: '我的看板 - 校招助手', path: '/board' })

  return (
    <div className="min-h-screen bg-[#F9F9F6]">
      <div className="mx-auto max-w-4xl px-3 py-4 md:px-4 md:py-8">
        <section className="border-b border-gray-200 pb-4 md:pb-7">
          <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">看板预览</p>
          <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-gray-900 md:text-4xl">
                我的看板
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                用一张更清晰的档案面板追踪每个岗位的推进状态，未登录时也能先预览整套工作流。
              </p>
            </div>
            <p className="text-[11px] text-gray-500 md:text-sm">未登录也可先看结构与节奏</p>
          </div>
        </section>

        <section className="mt-4 space-y-3 md:hidden">
          <div className="border border-gray-200 bg-white px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] tracking-[0.28em] text-gray-400">看板缩影</p>
                <p className="mt-3 text-5xl font-light leading-none tracking-tight text-gray-900">
                  {mockOverview.total}
                </p>
                <p className="mt-1 text-[10px] tracking-[0.2em] text-gray-500">示例申请节点</p>
              </div>
              <p className="max-w-[132px] text-right text-[11px] leading-5 text-gray-500">
                {mockOverview.note}
              </p>
            </div>
          </div>

          <div className="overflow-hidden border border-gray-200 bg-gray-200">
            <div className="grid grid-cols-4 gap-px">
              {mockStats.map((item) => (
                <div key={item.label} className="flex min-h-[72px] flex-col justify-between bg-white px-2.5 py-2.5">
                  <p className="text-[26px] font-light leading-none tracking-tight text-gray-900">
                    {item.count}
                  </p>
                  <p className="mt-2 text-[9px] leading-3 tracking-[0.14em] text-gray-500">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 hidden border border-gray-200 bg-white shadow-none md:block">
          <div className="grid grid-cols-4 gap-px border-b border-gray-200 bg-gray-200">
            {mockStats.map((item) => (
              <div key={item.label} className="bg-white px-5 py-5">
                <p className="text-4xl font-light tracking-tight text-gray-900">{item.count}</p>
                <p className="mt-2 text-xs tracking-[0.28em] text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-3 border border-gray-200 bg-white shadow-none">
          <div className="px-3 md:px-5">
            {mockRows.map((row) => (
              <div key={row.company} className="group border-b border-gray-200 py-3 last:border-b-0 md:py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{row.company}</p>
                    <p className="mt-1 text-[11px] leading-5 text-gray-500 md:text-xs">
                      {row.role}
                      <span className="mx-1 text-gray-300">·</span>
                      {row.updated}
                    </p>
                  </div>
                  <span className="shrink-0 text-gray-400 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-4 border border-gray-200 bg-white px-4 py-5 text-center shadow-none md:p-6">
          <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">开始使用</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-gray-900">
            开始管理你的申请池
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            从网申、笔试到录用，把每一步收进一张有秩序的看板。
          </p>
          <Link
            to="/login?redirect=/board"
            className="mt-5 inline-flex items-center justify-center bg-black px-8 py-4 text-sm font-bold tracking-[0.2em] text-white transition-colors hover:bg-gray-800"
          >
            免费注册，开始管理
          </Link>
          <Link
            to="/login?redirect=/board"
            className="group mt-4 inline-flex items-center gap-1 text-sm text-gray-600 underline underline-offset-[6px] decoration-gray-200 transition-all hover:text-black hover:decoration-black"
          >
            已有账号？直接登录
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </section>
      </div>
    </div>
  )
}
