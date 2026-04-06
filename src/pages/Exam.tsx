import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'

interface ExamResource {
  id: string
  company: string
  title: string
  year: string
  type: string
  tags: string[]
  url: string
}

const EXAM_DATA: ExamResource[] = [
  {
    id: '1',
    company: '腾讯',
    title: '腾讯校招技术笔试真题',
    year: '2026',
    type: '技术',
    tags: ['前端', '后端', '算法'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=138',
  },
  {
    id: '2',
    company: '字节跳动',
    title: '字节跳动校招研发笔试合集',
    year: '2026',
    type: '技术',
    tags: ['算法', '系统设计'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=665',
  },
  {
    id: '3',
    company: '华为',
    title: '华为校招机试真题汇总',
    year: '2026',
    type: '技术',
    tags: ['编程', 'OD机试'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=239',
  },
  {
    id: '4',
    company: '阿里巴巴',
    title: '阿里巴巴校招笔试真题',
    year: '2026',
    type: '技术',
    tags: ['算法', '数据结构'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=134',
  },
  {
    id: '5',
    company: '美团',
    title: '美团校招技术笔试题集',
    year: '2026',
    type: '技术',
    tags: ['算法', '后端'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=179',
  },
  {
    id: '6',
    company: '京东',
    title: '京东校招技术笔试真题',
    year: '2026',
    type: '技术',
    tags: ['算法', 'Java', '数据库'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=151',
  },
  {
    id: '7',
    company: '百度',
    title: '百度校招笔试真题汇总',
    year: '2026',
    type: '技术',
    tags: ['算法', 'AI', '系统设计'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=139',
  },
  {
    id: '8',
    company: '小红书',
    title: '小红书校招笔试真题',
    year: '2026',
    type: '技术',
    tags: ['算法', '数据'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=715',
  },
  {
    id: '9',
    company: '快手',
    title: '快手校招笔试真题合集',
    year: '2026',
    type: '技术',
    tags: ['算法', '工程'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=898',
  },
  {
    id: '10',
    company: '滴滴',
    title: '滴滴校招笔试真题汇总',
    year: '2026',
    type: '技术',
    tags: ['算法', '策略'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=652',
  },
]

const QUICK_COMPANIES = ['全部', '腾讯', '字节跳动', '华为', '阿里巴巴', '美团', '京东', '百度']

function buildMetaLine(item: ExamResource) {
  const left = `${item.company} · ${item.year} ${item.type}`
  const right = item.tags.join(' · ')
  return right ? `${left} | ${right}` : left
}

function ExamArchiveItem({ item }: { item: ExamResource }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block cursor-pointer border-b border-gray-200 py-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h3 className="text-base font-medium text-gray-900 md:text-lg">
            {item.title}
          </h3>
          <p className="text-xs leading-5 text-gray-500">
            {buildMetaLine(item)}
          </p>
        </div>

        <span className="shrink-0 pt-0.5 text-base text-gray-900 transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </a>
  )
}

export default function Exam() {
  useSEO({
    title: '笔试面试真题 - 校招助手',
    description: '大厂、国企、银行笔试面试真题资料汇总',
    path: '/exam',
  })

  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('全部')

  const filtered = useMemo(() => {
    return EXAM_DATA.filter((item) => {
      if (search) {
        const query = search.toLowerCase()

        if (
          !item.title.toLowerCase().includes(query) &&
          !item.company.toLowerCase().includes(query) &&
          !item.tags.some((tag) => tag.toLowerCase().includes(query))
        ) {
          return false
        }
      }

      if (companyFilter !== '全部' && item.company !== companyFilter) return false

      return true
    })
  }, [search, companyFilter])

  const [leftColumn, rightColumn] = useMemo(() => {
    const midpoint = Math.ceil(filtered.length / 2)
    return [filtered.slice(0, midpoint), filtered.slice(midpoint)]
  }, [filtered])

  return (
    <div className="min-h-screen bg-[#F9F9F6]">
      <div className="mx-auto max-w-5xl px-4 py-6 md:py-8">
        <section className="border-b border-gray-200 pb-5 md:pb-7">
          <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">THE ARCHIVE</p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-light tracking-tight text-black md:text-5xl">
                笔试真题库
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
                把分散的真题入口整理成一份可检索的目录。手机端保持高密度索引，桌面端展开成双栏档案册。
              </p>
            </div>
            <p className="text-xs text-gray-500 md:text-sm">
              当前收录 {filtered.length} 份公开资源
            </p>
          </div>
        </section>

        <section className="pt-4 md:pt-6">
          <div className="relative border-b border-gray-200 pb-3">
            <Search className="absolute left-0 top-0.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索公司、题目或关键词"
              className="w-full bg-transparent pl-6 pr-0 text-sm text-gray-900 outline-none placeholder:text-gray-400 md:text-base"
            />
          </div>

          <div className="mt-4 flex overflow-x-auto space-x-6 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {QUICK_COMPANIES.map((company) => {
              const active = companyFilter === company

              return (
                <button
                  key={company}
                  onClick={() => setCompanyFilter(company)}
                  className={`shrink-0 border-b-2 pb-1 text-sm transition-colors ${
                    active
                      ? 'border-black font-semibold text-black'
                      : 'border-transparent text-gray-500 hover:text-black'
                  }`}
                >
                  {company}
                </button>
              )
            })}
          </div>
        </section>

        <section className="pt-3 md:pt-5">
          {filtered.length === 0 ? (
            <div className="border-b border-gray-200 py-10 text-sm text-gray-500">
              暂无匹配的真题资源
            </div>
          ) : (
            <>
              <div className="md:hidden">
                {filtered.map((item) => (
                  <ExamArchiveItem key={item.id} item={item} />
                ))}
              </div>

              <div className="hidden md:grid md:grid-cols-2 md:gap-12">
                <div>
                  {leftColumn.map((item) => (
                    <ExamArchiveItem key={item.id} item={item} />
                  ))}
                </div>

                <div className="md:border-l md:border-gray-200 md:pl-12">
                  {rightColumn.map((item) => (
                    <ExamArchiveItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        <p className="pt-6 text-center text-xs text-gray-500">
          资源链接来自牛客等公开平台，持续收录中
        </p>
      </div>
    </div>
  )
}
