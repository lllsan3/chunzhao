import { useState } from 'react'

export function CollapsibleTextBlock({
  text,
  threshold = 220,
}: {
  text: string
  threshold?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const shouldCollapse = text.length > threshold

  return (
    <div>
      <div
        className={`relative overflow-hidden md:max-h-none ${
          shouldCollapse && !expanded ? 'max-h-[13.5rem]' : ''
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-7 text-gray-600">{text}</div>
        {shouldCollapse && !expanded ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent md:hidden" />
        ) : null}
      </div>

      {shouldCollapse ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 inline-flex items-center gap-1 text-xs text-gray-500 underline underline-offset-4 decoration-gray-200 transition-all hover:text-black hover:decoration-black md:hidden"
        >
          {expanded ? '收起内容' : '展开阅读'}
        </button>
      ) : null}
    </div>
  )
}
