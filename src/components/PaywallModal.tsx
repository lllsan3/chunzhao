import { useState } from 'react'
import { X, Ticket, Loader2 } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export function PaywallModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { redeem } = useSubscription()
  const [code, setCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleRedeem = async () => {
    if (!user) {
      navigate('/login?redirect=/board')
      return
    }

    if (!code.trim()) return

    setRedeeming(true)
    setResult(null)
    const res = await redeem(code)
    setResult(res)
    setRedeeming(false)

    if (res.success) {
      setTimeout(() => onClose(), 1200)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/35" />
      <div
        className="relative w-full max-w-sm border border-gray-200 bg-white p-6 shadow-none md:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">UNLOCK</p>
            <h2 className="mt-2 text-xl font-medium tracking-tight text-black">升级解锁</h2>
          </div>
          <button
            onClick={onClose}
            className="border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-black hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-5 text-sm leading-6 text-gray-600">
          免费版最多管理 3 个职位。输入兑换码后，即可解锁无限导入与完整管理能力。
        </p>

        <div className="mt-5 border border-gray-200 px-4 py-4">
          <p className="text-sm font-medium text-black">购买步骤</p>
          <ol className="mt-3 space-y-2 text-sm text-gray-600">
            <li>— 在小红书搜索「校招助手」</li>
            <li>— 购买兑换码（¥9.9）</li>
            <li>— 回到本页输入兑换码完成激活</li>
          </ol>
        </div>

        <div className="mt-5 space-y-3">
          <input
            type="text"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.toUpperCase())
              setResult(null)
            }}
            onKeyDown={(event) => event.key === 'Enter' && handleRedeem()}
            placeholder="输入兑换码"
            maxLength={12}
            className="w-full border border-gray-200 px-3 py-3 text-center font-mono text-sm tracking-[0.28em] text-black outline-none transition-colors focus:border-black"
          />
          <button
            onClick={handleRedeem}
            disabled={redeeming || !code.trim()}
            className="flex w-full items-center justify-center gap-2 bg-black px-8 py-4 text-sm font-bold tracking-[0.2em] text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
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
      </div>
    </div>
  )
}
