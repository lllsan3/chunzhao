import { Check, Sparkles } from 'lucide-react'

const plans = [
  {
    name: '体验版',
    description: '适合刚开始找工作的同学',
    price: '¥0',
    period: '/ 14天',
    features: ['最多导入 20 个职位', '基础看板管理', '截止日期提醒'],
    cta: '免费开始',
    highlighted: false,
  },
  {
    name: '春招季卡',
    description: '覆盖整个春招周期，无限制使用',
    price: '¥68',
    period: '/ 季',
    features: ['无限制导入职位', '高级看板与自定义标签', '多渠道提醒 (微信/邮件)', '面试复盘记录与导出'],
    cta: '立即升级',
    highlighted: true,
  },
  {
    name: '终身会员',
    description: '一次付费，秋招春招社招全覆盖',
    price: '¥198',
    period: '/ 终身',
    features: ['包含季卡所有功能', '永久有效，免费升级新功能', '专属客服支持'],
    cta: '购买终身',
    highlighted: false,
  },
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <section className="bg-slate-900 px-4 pt-16 pb-20 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white">投资你的春招效率</h1>
        <p className="mt-3 text-slate-400 text-sm max-w-md mx-auto">
          节省整理表格的时间，减少错过截止日的遗憾。选择适合你的计划，专注拿 Offer。
        </p>
      </section>

      {/* Cards */}
      <section className="max-w-4xl mx-auto px-4 -mt-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 flex flex-col ${
                plan.highlighted
                  ? 'bg-slate-900 text-white shadow-xl relative'
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    最受欢迎
                  </span>
                </div>
              )}
              <h3 className={`font-bold text-lg ${plan.highlighted ? 'text-white' : 'text-slate-800'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mt-1 ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                {plan.description}
              </p>
              <div className="mt-4 mb-5">
                <span className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-800'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${
                      plan.highlighted ? 'text-blue-400' : 'text-emerald-500'
                    }`} />
                    <span className={plan.highlighted ? 'text-slate-300' : 'text-slate-600'}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
