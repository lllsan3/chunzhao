import { useState } from 'react'
import { Check, Sparkles, Ticket, Loader2, ShieldCheck } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

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

const PLAN_TYPE_LABEL: Record<string, string> = {
  trial: '体验版',
  seasonal: '春招季卡',
  lifetime: '终身会员',
}

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { membership, loading: memberLoading, redeem } = useSubscription()
  const [showRedeem, setShowRedeem] = useState(false)
  const [code, setCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleRedeem = async () => {
    if (!user) {
      navigate('/login?redirect=/pricing')
      return
    }
    if (!code.trim()) return

    setRedeeming(true)
    setResult(null)
    const res = await redeem(code)
    setResult(res)
    setRedeeming(false)
    if (res.success) {
      setCode('')
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <section className="bg-slate-900 px-4 pt-16 pb-20 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white">投资你的春招效率</h1>
        <p className="mt-3 text-slate-400 text-sm max-w-md mx-auto">
          节省整理表格的时间，减少错过截止日的遗憾。选择适合你的计划，专注拿 Offer。
        </p>
      </section>

      {/* Active membership banner */}
      {!memberLoading && membership.isMember && (
        <div className="max-w-4xl mx-auto px-4 -mt-14 mb-4 relative z-10">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800">
                你已是 {PLAN_TYPE_LABEL[membership.planType ?? ''] || membership.planType} 会员
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                {membership.expiresAt
                  ? `有效期至 ${new Date(membership.expiresAt).toLocaleDateString('zh-CN')}`
                  : '永久有效'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      <section className={`max-w-4xl mx-auto px-4 pb-10 ${!membership.isMember ? '-mt-10' : ''}`}>
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

      {/* Redeem code section */}
      <section className="max-w-md mx-auto px-4 pb-16">
        {!showRedeem ? (
          <button
            onClick={() => setShowRedeem(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <Ticket className="w-4 h-4" />
            有兑换码？点击兑换
          </button>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-blue-600" />
              输入兑换码
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setResult(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                placeholder="请输入 8 位兑换码"
                maxLength={12}
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white tracking-widest text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <button
                onClick={handleRedeem}
                disabled={redeeming || !code.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : '兑换'}
              </button>
            </div>
            {result && (
              <p className={`mt-3 text-xs ${result.success ? 'text-emerald-600' : 'text-red-500'}`}>
                {result.message}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
