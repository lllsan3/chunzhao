import { forwardRef } from 'react'
import {
  type ExportAspect,
  type ExportCardData,
  EXPORT_CARD_DIMENSIONS,
} from '../../lib/exportCards'

interface ExportCardProps {
  aspect: ExportAspect
  data: ExportCardData
}

function MetaLine({
  status,
  dateText,
  city,
}: {
  status: string
  dateText: string | null
  city: string | null
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[18px] tracking-[0.08em] text-gray-500">
      <span>{status}</span>
      {dateText ? <span>{dateText}</span> : null}
      {city ? <span>{city}</span> : null}
    </div>
  )
}

export const ExportCard = forwardRef<HTMLDivElement, ExportCardProps>(function ExportCard(
  { aspect, data },
  ref
) {
  const { width, height } = EXPORT_CARD_DIMENSIONS[aspect]
  const isStory = aspect === '9:16'
  const displayItems = data.items.slice(0, isStory ? 8 : 10)
  const midpoint = Math.ceil(displayItems.length / 2)
  const leftColumn = displayItems.slice(0, midpoint)
  const rightColumn = displayItems.slice(midpoint)

  return (
    <div
      ref={ref}
      style={{ width, height }}
      className="overflow-hidden bg-[#F9F9F6] text-[#1C1C1C]"
    >
      <div className="flex h-full flex-col bg-[#F9F9F6] p-10">
        <div className="flex h-full flex-col border border-gray-200 bg-white">
          <div className={isStory ? 'px-16 pt-16' : 'px-14 pt-14'}>
            <div className="flex items-start justify-between gap-8">
              <div>
                <p className="text-[18px] tracking-[0.34em] text-gray-400">{data.eyebrow}</p>
                <h1
                  className={`font-serif font-semibold tracking-tight text-gray-900 ${
                    isStory ? 'mt-6 text-[76px] leading-[0.98]' : 'mt-5 text-[58px] leading-[1.02]'
                  }`}
                >
                  {data.title}
                </h1>
                <p
                  className={`max-w-[620px] text-gray-500 ${
                    isStory ? 'mt-6 text-[22px] leading-[1.7]' : 'mt-5 text-[20px] leading-[1.65]'
                  }`}
                >
                  {data.subtitle}
                </p>
              </div>

              <p className="shrink-0 pt-1 text-[18px] tracking-[0.2em] text-gray-400">
                {data.dateRange}
              </p>
            </div>

            <div
              className={`mt-10 overflow-hidden border border-gray-200 bg-gray-200 ${
                isStory ? 'grid grid-cols-1 gap-px' : 'grid grid-cols-3 gap-px'
              }`}
            >
              {data.stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`bg-white ${
                    isStory ? 'px-8 py-7' : 'flex min-h-[182px] flex-col justify-end px-8 py-8'
                  }`}
                >
                  <div className={isStory ? 'flex items-end justify-between gap-6' : ''}>
                    <div className="text-[72px] font-light leading-none tracking-tight text-gray-900">
                      {stat.value}
                    </div>
                    <p
                      className={`text-gray-500 ${
                        isStory
                          ? 'pb-2 text-[18px] tracking-[0.28em]'
                          : 'mt-4 text-[18px] tracking-[0.28em]'
                      }`}
                    >
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={isStory ? 'flex-1 px-16 pb-16 pt-12' : 'flex-1 px-14 pb-14 pt-12'}>
            {displayItems.length === 0 ? (
              <div className="flex h-full items-center justify-center border border-gray-200 px-10 text-center text-[22px] leading-[1.8] text-gray-500">
                {data.emptyLabel}
              </div>
            ) : isStory ? (
              <div className="space-y-0 border-y border-gray-200">
                {displayItems.map((item, index) => (
                  <div key={`${item.company}-${item.title}-${index}`} className="border-b border-gray-200 py-8 last:border-b-0">
                    <div className="flex items-start justify-between gap-8">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[30px] font-medium tracking-tight text-gray-900">
                          {item.company}
                        </p>
                        <p className="mt-3 line-clamp-2 text-[24px] leading-[1.45] text-gray-600">
                          {item.title}
                        </p>
                        <MetaLine status={item.status} dateText={item.dateText} city={item.city} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-0 border-y border-gray-200">
                {[leftColumn, rightColumn].map((column, columnIndex) => (
                  <div
                    key={`column-${columnIndex}`}
                    className={columnIndex === 1 ? 'border-l border-gray-200 pl-8' : 'pr-8'}
                  >
                    {column.map((item, index) => (
                      <div
                        key={`${item.company}-${item.title}-${index}`}
                        className="border-b border-gray-200 py-6 last:border-b-0"
                      >
                        <p className="truncate text-[26px] font-medium tracking-tight text-gray-900">
                          {item.company}
                        </p>
                        <p className="mt-2 line-clamp-2 text-[20px] leading-[1.5] text-gray-600">
                          {item.title}
                        </p>
                        <MetaLine status={item.status} dateText={item.dateText} city={item.city} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 px-14 py-5">
            <p className="text-[16px] tracking-[0.28em] text-gray-400">由校招助手生成</p>
          </div>
        </div>
      </div>
    </div>
  )
})

