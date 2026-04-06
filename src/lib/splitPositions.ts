const DIRECT_SPLIT_RE = /[,\uFF0C\u3001\uFF1B;|\uFF5C/\\·•&\n\r\t]+/
const WRAPPER_PUNCTUATION_RE = /[()（）【】[\]「」]/g

const ROLE_SUFFIXES = [
  '工程师',
  '设计师',
  '分析师',
  '研究员',
  '顾问',
  '经理',
  '专员',
  '技术员',
  '业务员',
  '柜员',
  '教师',
  '老师',
  '实习生',
  '管培生',
  '培训生',
  '开发类',
  '开发岗',
  '测试类',
  '测试岗',
  '算法类',
  '算法岗',
  '设计类',
  '设计岗',
  '产品类',
  '产品岗',
  '运营类',
  '运营岗',
  '市场类',
  '市场岗',
  '销售类',
  '销售岗',
  '财务类',
  '财务岗',
  '人力类',
  '人力岗',
  '行政类',
  '行政岗',
  '法务类',
  '法务岗',
  '客服类',
  '客服岗',
  '技术类',
  '研发类',
  '金融类',
  '管理类',
  '支持类',
  '岗位',
  '序列',
  '方向',
  '类',
  '岗',
]

function normalizeTitle(title: string) {
  return title
    .replace(/\u3000/g, ' ')
    .replace(WRAPPER_PUNCTUATION_RE, ' ')
    .replace(/[：:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function shortenSegment(segment: string) {
  return segment.length > 12 ? `${segment.slice(0, 12)}…` : segment
}

function uniqueSegments(parts: string[]) {
  return Array.from(
    new Set(
      parts
        .map((segment) => segment.trim())
        .filter((segment) => segment.length >= 2)
        .map(shortenSegment)
    )
  )
}

function splitBySuffixes(title: string) {
  const segments: string[] = []
  let remaining = title

  while (remaining.length > 0) {
    let bestEnd = -1

    for (const suffix of ROLE_SUFFIXES) {
      const index = remaining.indexOf(suffix)
      if (index === -1) continue

      const end = index + suffix.length
      if (bestEnd === -1 || end < bestEnd) bestEnd = end
    }

    if (bestEnd === -1) break

    segments.push(remaining.slice(0, bestEnd))
    remaining = remaining.slice(bestEnd)
  }

  if (remaining.length >= 2) segments.push(remaining)

  return uniqueSegments(segments)
}

export function splitPositions(title: string): string[] {
  if (!title) return []

  const normalized = normalizeTitle(title)
  if (!normalized) return []

  const directParts = uniqueSegments(
    normalized
      .split(DIRECT_SPLIT_RE)
      .flatMap((segment) => segment.split(/\s+/))
  )

  if (directParts.length > 1) return directParts

  const compact = normalized.replace(/\s+/g, '')
  const suffixParts = splitBySuffixes(compact)

  if (suffixParts.length > 1) return suffixParts

  if (compact.length > 12) {
    return [compact.slice(0, 8), shortenSegment(compact.slice(8))]
  }

  return [compact]
}
