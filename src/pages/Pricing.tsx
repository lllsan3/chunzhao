import { useState } from 'react'
import { Check, Sparkles, Ticket, Loader2, ShieldCheck, X } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const PLAN_TYPE_LABEL: Record<string, string> = {
  trial: '体验版',
  seasonal: '春招季卡',
  lifetime: '完整版',
}

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { membership, loading: memberLoading, redeem } = useSubscription()
  const [showRedeemModal, setShowRedeemModal] = useState(false)

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Header */}
      <section className="bg-slate-900 px-4 pt-16 pb-20 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white">选择你的计划</h1>
        <p className="mt-3 text-slate-400 text-sm max-w-md mx-auto">
          免费版即可开始使用，升级后解锁无限管理能力
        </p>
      </section>

      {/* Active membership banner */}
      {!memberLoading && membership.isMember && (
        <div className="max-w-3xl mx-auto px-4 -mt-14 mb-4 relative z-10">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800">
                你已是 {PLAN_TYPE_LABEL[membership.planType ?? ''] || '完整版'} 会员
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                {membership.expiresAt
                  ? `有效期至 ${new Date(membership.expiresAt).toLocaleDateString('zh-CN')}`
                  : '永久有效，已解锁全部功能'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Two-tier cards */}
      <section className={`max-w-3xl mx-auto px-4 pb-10 ${!membership.isMember ? '-mt-10' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Free tier */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
            <h3 className="font-bold text-lg text-slate-800">免费版</h3>
            <p className="text-sm text-slate-500 mt-1">快速体验，轻松上手</p>
            <div className="mt-4 mb-5">
              <span className="text-3xl font-bold text-slate-800">¥0</span>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {['最多管理 3 个岗位', '基础看板管理', '基础截止日期提醒'].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                  <span className="text-slate-600">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate(user ? '/jobs' : '/login?redirect=/jobs')}
              className="w-full py-2.5 rounded-xl text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              免费开始
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">最多管理 3 个岗位</p>
          </div>

          {/* Paid tier */}
          <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                推荐
              </span>
            </div>
            <h3 className="font-bold text-lg text-white">完整版</h3>
            <p className="text-sm text-slate-400 mt-1">解锁全部功能，无限制使用</p>
            <div className="mt-4 mb-5">
              <span className="text-3xl font-bold text-white">¥9.9</span>
              <span className="text-sm text-slate-400"> / 永久</span>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {['无限制导入和管理岗位', '完整看板与自定义标签', '笔试真题资源下载', '截止日期提醒'].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
                  <span className="text-slate-300">{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowRedeemModal(true)}
              className="w-full py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              立即解锁
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">解锁无限岗位管理</p>
          </div>
        </div>
      </section>

      {/* Redeem modal */}
      {showRedeemModal && (
        <RedeemModal
          user={!!user}
          onClose={() => setShowRedeemModal(false)}
          onRedeem={redeem}
          onLogin={() => navigate('/login?redirect=/pricing')}
        />
      )}
    </div>
  )
}

function RedeemModal({
  user,
  onClose,
  onRedeem,
  onLogin,
}: {
  user: boolean
  onClose: () => void
  onRedeem: (code: string) => Promise<{ success: boolean; message: string }>
  onLogin: () => void
}) {
  const [code, setCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleRedeem = async () => {
    if (!user) {
      onLogin()
      return
    }
    if (!code.trim()) return
    setRedeeming(true)
    setResult(null)
    const res = await onRedeem(code)
    setResult(res)
    setRedeeming(false)
    if (res.success) {
      setTimeout(() => onClose(), 1500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">解锁完整版</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Purchase instructions */}
        <div className="bg-slate-50 rounded-xl p-4 mb-5">
          <p className="text-sm font-medium text-slate-700 mb-2">购买步骤：</p>
          <ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
            <li>在小红书搜索「春招助手」</li>
            <li>购买兑换码（¥9.9）</li>
            <li>回到本页输入兑换码</li>
          </ol>
        </div>

        {/* Redeem input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setResult(null) }}
            onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
            placeholder="请输入兑换码"
            maxLength={12}
            className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white tracking-widest text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            onClick={handleRedeem}
            disabled={redeeming || !code.trim()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
            兑换
          </button>
        </div>

        {result && (
          <p className={`mt-3 text-xs ${result.success ? 'text-emerald-600' : 'text-red-500'}`}>
            {result.message}
          </p>
        )}

        <p className="text-center text-xs text-slate-400 mt-4">已有兑换码？直接输入即可兑换</p>
      </div>
    </div>
  )
}
