import { useState } from 'react'
import { Loader2, Ticket, X } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'
import { useSEO } from '../hooks/useSEO'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const PLAN_TYPE_LABEL: Record<string, string> = {
  trial: '体验版',
  seasonal: '春招季卡',
  lifetime: '完整版',
}

const FREE_FEATURES = [
  '最多管理 3 个岗位',
  '基础看板管理',
  '基础截止日期提醒',
]

const PAID_FEATURES = [
  '无限制导入和管理岗位',
  '完整看板与自定义标签',
  '笔试真题资源下载',
  '截止日期提醒',
]

export default function Pricing() {
  useSEO({
    title: '升级计划 - 校招助手',
    description: '9.9元解锁全部功能，无限岗位管理、看板、提醒、笔试真题下载',
    path: '/pricing',
  })

  const { user } = useAuth()
  const navigate = useNavigate()
  const { membership, loading: memberLoading, redeem } = useSubscription()
  const [showRedeemModal, setShowRedeemModal] = useState(false)

  return (
    <div className="min-h-screen bg-[#F9F9F6]">
      <section className="border-b border-gray-200 px-3 pt-8 pb-5 md:px-4 md:pt-18 md:pb-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">UPGRADE PLAN</p>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-end md:gap-4">
            <div>
              <h1 className="text-[34px] font-light tracking-tight text-black md:text-5xl">
                选择你的升级计划
              </h1>
              <p className="mt-2.5 max-w-xl text-sm leading-6 text-gray-600 md:mt-3 md:text-base">
                去掉所有促销噪音，只保留最直接的价值差异。免费版足够开始，完整版解锁完整的长期管理能力。
              </p>
            </div>
            <p className="text-[13px] leading-6 text-gray-500 md:justify-self-end md:text-right md:text-sm">
              永久买断，不做复杂套餐堆叠。
              <br />
              在手机上先看到关键信息，在桌面端再展开成完整订阅页。
            </p>
          </div>
        </div>
      </section>

      {!memberLoading && membership.isMember && (
        <section className="px-3 pt-4 md:px-4 md:pt-6">
          <div className="mx-auto max-w-5xl">
            <div className="border border-gray-200 px-4 py-3 text-sm text-gray-700 md:px-5">
              <p className="font-medium text-black">
                你已是 {PLAN_TYPE_LABEL[membership.planType ?? ''] || '完整版'} 会员
              </p>
              <p className="mt-1 text-xs text-gray-500 md:text-sm">
                {membership.expiresAt
                  ? `有效期至 ${new Date(membership.expiresAt).toLocaleDateString('zh-CN')}`
                  : '永久有效，已解锁全部功能'}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="px-3 py-4 md:px-4 md:py-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            <article className="flex flex-col border border-gray-200 bg-white px-4 py-4 shadow-none md:p-8">
              <div className="border-b border-gray-200 pb-4 md:pb-5">
                <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">FREE</p>
                <h2 className="mt-2 text-xl font-medium tracking-tight text-black md:text-2xl">
                  免费版
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">快速体验，轻松上手。</p>
              </div>

              <div className="py-5 md:py-6">
                <div className="flex items-end gap-2">
                  <span className="text-[44px] font-light tracking-tight text-black md:text-6xl">¥0</span>
                  <span className="pb-1 text-sm text-gray-500">起步使用</span>
                </div>
              </div>

              <ul className="flex-1 space-y-2.5 border-t border-gray-200 pt-4 md:space-y-3 md:pt-5">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="text-base font-light leading-5 text-black">—</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 md:mt-8">
                <button
                  onClick={() => navigate(user ? '/jobs' : '/login?redirect=/jobs')}
                  className="w-full bg-black px-8 py-3.5 text-sm font-bold tracking-[0.2em] text-white transition-colors hover:bg-gray-800 md:py-4"
                >
                  免费开始
                </button>
                <p className="mt-3 text-xs text-gray-500">适合先建立自己的第一份申请池。</p>
              </div>
            </article>

            <article className="flex flex-col border border-gray-200 border-t-4 border-t-black bg-white px-4 py-4 shadow-none md:p-8">
              <div className="border-b border-gray-200 pb-4 md:pb-5">
                <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">FULL ACCESS</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-medium tracking-tight text-black md:text-2xl">
                    完整版
                  </h2>
                  <span className="text-[10px] tracking-[0.22em] text-gray-500 md:text-xs">永久买断</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  解锁全部功能，无限制使用，适合完整跑完整个校招周期。
                </p>
              </div>

              <div className="py-5 md:py-6">
                <div className="flex items-end gap-2">
                  <span className="text-[44px] font-light tracking-tight text-black md:text-6xl">¥9.9</span>
                  <span className="pb-1 text-sm text-gray-500">永久</span>
                </div>
              </div>

              <ul className="flex-1 space-y-2.5 border-t border-gray-200 pt-4 md:space-y-3 md:pt-5">
                {PAID_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="text-base font-light leading-5 text-black">+</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 md:mt-8">
                <button
                  onClick={() => setShowRedeemModal(true)}
                  className="w-full bg-black px-8 py-3.5 text-sm font-bold tracking-[0.2em] text-white transition-colors hover:bg-gray-800 md:py-4"
                >
                  立即解锁
                </button>
                <p className="mt-3 text-xs text-gray-500">通过兑换码激活，解锁无限岗位管理。</p>
              </div>
            </article>
          </div>
        </div>
      </section>

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
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 md:items-center md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/35" />
      <div
        className="relative w-full max-w-md border border-gray-200 bg-white px-4 py-4 shadow-none md:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-3 md:pb-4">
          <div>
            <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">REDEEM</p>
            <h2 className="mt-1.5 text-lg font-medium tracking-tight text-black md:mt-2 md:text-xl">
              解锁完整版
            </h2>
          </div>
          <button
            onClick={onClose}
            className="border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-black hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 border border-gray-200 px-3 py-3 md:mt-5 md:px-4 md:py-4">
          <p className="text-sm font-medium text-black">购买步骤</p>
          <ol className="mt-3 space-y-2 text-sm text-gray-600">
            <li>— 在小红书搜索「校招助手」</li>
            <li>— 购买兑换码（¥9.9）</li>
            <li>— 回到本页输入兑换码完成激活</li>
          </ol>
        </div>

        <div className="mt-4 space-y-3 md:mt-5">
          <input
            type="text"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase())
              setResult(null)
            }}
            onKeyDown={(event) => event.key === 'Enter' && handleRedeem()}
            placeholder="请输入兑换码"
            maxLength={12}
            className="w-full border border-gray-200 px-3 py-2.5 text-center font-mono text-sm tracking-[0.28em] text-black outline-none transition-colors focus:border-black md:py-3"
          />

          <button
            onClick={handleRedeem}
            disabled={redeeming || !code.trim()}
            className="flex w-full items-center justify-center gap-2 bg-black px-8 py-3.5 text-sm font-bold tracking-[0.2em] text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 md:py-4"
          >
            {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
            {redeeming ? '验证中...' : '兑换'}
          </button>
        </div>

        {result ? (
          <p className={`mt-3 text-sm ${result.success ? 'text-gray-700' : 'text-red-600'}`}>
            {result.message}
          </p>
        ) : null}

        <p className="mt-4 text-xs text-gray-500">已有兑换码？直接输入即可兑换。</p>
      </div>
    </div>
  )
}
