import { useState } from 'react'
import { X, Ticket, Loader2, Lock } from 'lucide-react'
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
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
            <Lock className="w-5 h-5 text-amber-500" />
            升级解锁
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-tag-bg text-ink-muted/70">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-ink-muted mb-4">
          免费版最多管理 3 个职位，升级后可无限导入。
        </p>

        <div className="bg-tag-bg rounded-xl p-3 mb-4 text-xs text-ink-muted">
          在小红书搜索「校招助手」购买兑换码（¥9.9）
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setResult(null) }}
            onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
            placeholder="输入兑换码"
            maxLength={12}
            className="flex-1 px-3 py-2.5 rounded-xl border border-line text-sm bg-white tracking-widest text-center font-mono focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
          <button
            onClick={handleRedeem}
            disabled={redeeming || !code.trim()}
            className="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {redeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
            {redeeming ? '验证中...' : '兑换'}
          </button>
        </div>

        {result && (
          <p className={`mt-2 text-xs ${result.success ? 'text-emerald-600' : 'text-red-500'}`}>
            {result.message}
          </p>
        )}
      </div>
    </div>
  )
}
