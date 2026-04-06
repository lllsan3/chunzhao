export function ConfirmDialog({
  title,
  subtitle,
  confirmLabel = '确认',
  confirmColor = 'bg-black hover:bg-gray-800',
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
      <div className="absolute inset-0 bg-black/35" />
      <div
        className="relative w-full max-w-sm border border-gray-200 bg-white p-5 shadow-none md:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">CONFIRM</p>
        <p className="mt-2 text-base font-medium tracking-tight text-gray-900">{title}</p>
        {subtitle ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">{subtitle}</p>
        ) : null}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 px-4 py-3 text-sm text-gray-600 transition-colors hover:border-black hover:text-black"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 text-sm font-bold tracking-[0.16em] text-white transition-colors ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
