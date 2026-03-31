import { useState, useMemo } from 'react'
import { Search, Download, FileText, Building2 } from 'lucide-react'

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
    title: '腾讯2026春招技术笔试真题',
    year: '2026',
    type: '技术',
    tags: ['前端', '后端', '算法'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=179',
  },
  {
    id: '2',
    company: '字节跳动',
    title: '字节跳动2026春招研发笔试合集',
    year: '2026',
    type: '技术',
    tags: ['算法', '系统设计'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=665',
  },
  {
    id: '3',
    company: '华为',
    title: '华为2026春招机试真题汇总',
    year: '2026',
    type: '技术',
    tags: ['编程', 'OD机试'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=138',
  },
  {
    id: '4',
    company: '阿里巴巴',
    title: '阿里巴巴2026春招笔试真题',
    year: '2026',
    type: '技术',
    tags: ['算法', '数据结构'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=139',
  },
  {
    id: '5',
    company: '美团',
    title: '美团2026春招技术笔试题集',
    year: '2026',
    type: '技术',
    tags: ['算法', '后端'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=138',
  },
  {
    id: '6',
    company: '中国银行',
    title: '中国银行2026春招行测真题',
    year: '2026',
    type: '行测',
    tags: ['数量关系', '言语理解', '判断推理'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=179',
  },
  {
    id: '7',
    company: '国家电网',
    title: '国家电网2026春招笔试真题',
    year: '2026',
    type: '综合',
    tags: ['电气', '计算机', '通信'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=179',
  },
  {
    id: '8',
    company: '招商银行',
    title: '招商银行2026春招笔试合集',
    year: '2026',
    type: '行测',
    tags: ['EPI', '性格测试', '英语'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=179',
  },
  {
    id: '9',
    company: '京东',
    title: '京东2026春招技术笔试真题',
    year: '2026',
    type: '技术',
    tags: ['算法', 'Java', '数据库'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=179',
  },
  {
    id: '10',
    company: '网易',
    title: '网易2026春招编程笔试汇总',
    year: '2026',
    type: '技术',
    tags: ['算法', '游戏开发'],
    url: 'https://www.nowcoder.com/exam/company?currentTab=recommand&jobId=100&selectStatus=0&tagId=179',
  },
]

const QUICK_COMPANIES = ['全部', '腾讯', '字节跳动', '华为', '阿里巴巴', '美团', '中国银行', '国家电网']

export default function Exam() {
  const [search, setSearch] = useState('')
  const [companyFilter, setCompanyFilter] = useState('全部')

  const filtered = useMemo(() => {
    return EXAM_DATA.filter((item) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !item.title.toLowerCase().includes(q) &&
          !item.company.toLowerCase().includes(q) &&
          !item.tags.some((t) => t.toLowerCase().includes(q))
        )
          return false
      }
      if (companyFilter !== '全部' && item.company !== companyFilter) return false
      return true
    })
  }, [search, companyFilter])

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" />
            笔试真题库
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            收录各大公司校招笔试真题资源，持续更新中
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted/70" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索公司、题目或标签..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-line text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Company quick tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {QUICK_COMPANIES.map((c) => {
            const active = companyFilter === c
            return (
              <button
                key={c}
                onClick={() => setCompanyFilter(c)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  active
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-ink-muted border border-line hover:border-amber-300 hover:text-amber-600'
                }`}
              >
                {c !== '全部' && <Building2 className="w-3 h-3" />}
                {c}
              </button>
            )
          })}
        </div>

        {/* Resource list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-ink-muted/70">暂无匹配的真题资源</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-line-light shadow-sm p-4 flex items-center gap-4"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-ink truncate">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-ink-muted">{item.company}</span>
                    <span className="text-xs text-line">·</span>
                    <span className="text-xs text-ink-muted">{item.year}</span>
                    <span className="text-xs text-line">·</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      item.type === '技术'
                        ? 'bg-accent-soft text-accent'
                        : item.type === '行测'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-violet-50 text-violet-600'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded text-[11px] bg-tag-bg text-ink-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-50 text-amber-600 text-xs font-medium hover:bg-amber-100 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  查看
                </a>
              </div>
            ))
          )}
        </div>

        <p className="text-center text-xs text-ink-muted/70 mt-8 pb-4">
          资源链接来自牛客等公开平台，持续收录中
        </p>
      </div>
    </div>
  )
}
