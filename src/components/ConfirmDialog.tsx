export function ConfirmDialog({
  title,
  subtitle,
  confirmLabel = '确认',
  confirmColor = 'bg-red-500 hover:bg-red-600',
  onConfirm,
  onCancel,
}: {
  title: string
  subtitle?: string
  confirmLabel?: string
  confirmColor?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xs p-5" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm text-ink mb-2">{title}</p>
        {subtitle && <p className="text-xs text-ink-muted mb-4 line-clamp-1">{subtitle}</p>}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm border border-line text-ink-muted hover:bg-tag-bg transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 rounded-xl text-sm text-white transition-colors ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
