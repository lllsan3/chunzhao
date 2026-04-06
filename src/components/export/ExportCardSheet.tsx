import { Download, X } from 'lucide-react'
import {
  type ExportAspect,
  type ExportCardType,
  EXPORT_ASPECT_OPTIONS,
  EXPORT_CARD_TYPE_OPTIONS,
} from '../../lib/exportCards'

interface ExportCardSheetProps {
  open: boolean
  type: ExportCardType
  aspect: ExportAspect
  exporting: boolean
  onClose: () => void
  onTypeChange: (value: ExportCardType) => void
  onAspectChange: (value: ExportAspect) => void
  onSubmit: () => void
}

export function ExportCardSheet({
  open,
  type,
  aspect,
  exporting,
  onClose,
  onTypeChange,
  onAspectChange,
  onSubmit,
}: ExportCardSheetProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center p-3 md:items-center md:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative w-full max-w-md border border-gray-200 bg-white px-4 py-4 shadow-none md:px-6 md:py-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-3 md:pb-4">
          <div>
            <p className="text-[10px] tracking-[0.28em] text-gray-400 md:text-xs">EXPORT</p>
            <h2 className="mt-1.5 font-serif text-xl font-semibold tracking-tight text-gray-900 md:mt-2 md:text-2xl">
              导出申请记录卡
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              图片只保留公司、岗位、状态和时间，不会导出笔记或内推码。
            </p>
          </div>
          <button
            onClick={onClose}
            className="border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-black hover:text-black"
            aria-label="关闭导出面板"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 md:mt-5">
          <div>
            <p className="text-[11px] tracking-[0.18em] text-gray-500">导出内容</p>
            <div className="mt-2 space-y-2">
              {EXPORT_CARD_TYPE_OPTIONS.map((option) => {
                const active = option.value === type
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onTypeChange(option.value)}
                    className={`w-full border px-3 py-3 text-left transition-colors ${
                      active
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-black'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium tracking-tight">{option.label}</span>
                      <span className="text-[10px] tracking-[0.2em] opacity-70">
                        {active ? '当前' : '切换'}
                      </span>
                    </div>
                    <p className={`mt-1 text-xs leading-5 ${active ? 'text-white/75' : 'text-gray-500'}`}>
                      {option.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-[11px] tracking-[0.18em] text-gray-500">图片比例</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {EXPORT_ASPECT_OPTIONS.map((option) => {
                const active = option.value === aspect
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onAspectChange(option.value)}
                    className={`border px-3 py-3 text-left transition-colors ${
                      active
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-black'
                    }`}
                  >
                    <div className="text-sm font-medium tracking-tight">{option.label}</div>
                    <p className={`mt-1 text-xs leading-5 ${active ? 'text-white/75' : 'text-gray-500'}`}>
                      {option.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={exporting}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-black px-6 py-3.5 text-sm font-bold tracking-[0.18em] text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <Download className="h-4 w-4" />
          {exporting ? '正在生成图片' : '生成并下载 PNG'}
        </button>
      </div>
    </div>
  )
}

