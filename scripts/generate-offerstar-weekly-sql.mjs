import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const START_LOCAL = '2026-04-03T00:00:00+08:00'
const END_LOCAL = '2026-04-09T23:59:59+08:00'
const PAGE_SIZE = 20
const MAX_PAGES = 40
const CHUNK_SIZE = 25
const SOURCE_NAME = 'offerstar'
const SOURCE_ID_PREFIX = 'offerstar'
const OUTPUT_BASENAME = 'offerstar_week_20260403_20260409'

const START_MS = new Date(START_LOCAL).getTime()
const END_MS = new Date(END_LOCAL).getTime()
const OUTPUT_DIR = join(process.cwd(), 'output')

const BIG_COMPANIES = JSON.parse(
  readFileSync(join(process.cwd(), 'scripts', 'bigCompanies.json'), 'utf8')
).companies

const KNOWN_CITIES = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆',
  '天津', '苏州', '长沙', '郑州', '东莞', '青岛', '大连', '宁波', '厦门', '合肥',
  '佛山', '珠海', '福州', '济南', '无锡', '昆明', '贵阳', '太原', '南昌', '石家庄',
  '哈尔滨', '沈阳', '长春', '南宁', '海口', '兰州', '银川', '呼和浩特', '乌鲁木齐',
  '拉萨', '常州', '镇江', '温州', '绍兴', '嘉兴', '金华', '台州', '惠州', '中山',
  '烟台', '潍坊', '保定', '徐州', '扬州', '泉州', '漳州', '赣州', '宜昌', '芜湖',
  '洛阳', '襄阳', '绵阳', '遵义', '威海', '景德镇', '咸宁', '莆田', '孝感', '桂林',
  '柳州', '河池', '梧州', '百色', '来宾', '九江', '随州', '十堰', '宜春', '湖州',
  '高密', '廊坊', '靖江', '佛山顺德', '咸宁', '全国', '海外', '国外', '远程',
]

const FOREIGN_COMPANY_HINTS = [
  '汇丰', 'HSBC', '西门子', 'ABB', 'ALDI', '奥乐齐', 'Shopee', '微软', '德勤',
  '安永', '毕马威', '普华永道', '贝恩', '麦肯锡', '波士顿咨询', '花旗', '渣打',
  '摩根', '高盛', '亚马逊', '谷歌', '苹果', '欧莱雅', '联合利华',
]

const CENTRAL_SOE_HINTS = [
  '中国', '中交', '中建', '中铁', '中车', '中船', '中兴', '中煤', '中移',
  '中电', '中汽', '国家', '国网', '航天', '邮政', '华润', '自然资源部', '司法部',
  '中国烟草', '中国移动', '中国联通', '中国电信', '中国银行', '建设银行', '农业银行',
  '工商银行', '交通银行', '邮储银行', '人保', '供销集团', '葛洲坝',
]

function decodeHtml(input = '') {
  let output = input == null ? '' : String(input)
  const pairs = [
    ['&amp;', '&'],
    ['&quot;', '"'],
    ['&#39;', "'"],
    ['&#x27;', "'"],
    ['&lt;', '<'],
    ['&gt;', '>'],
    ['&nbsp;', ' '],
  ]

  let changed = true
  while (changed) {
    changed = false
    for (const [from, to] of pairs) {
      if (output.includes(from)) {
        output = output.split(from).join(to)
        changed = true
      }
    }
  }

  return output
}

function cleanText(input = '') {
  return decodeHtml(input)
    .replace(/\u3000/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripHtml(input = '') {
  return cleanText(input.replace(/<[^>]+>/g, ' '))
}

function normalizeKey(input = '') {
  return cleanText(input)
    .toLowerCase()
    .replace(/[\s,，、/\\|;；:："“”"'‘’()（）【】\[\]{}<>《》·•&—\-]/g, '')
}

function formatChinaIso(ms) {
  const shifted = new Date(ms + 8 * 60 * 60 * 1000)
  const year = shifted.getUTCFullYear()
  const month = String(shifted.getUTCMonth() + 1).padStart(2, '0')
  const day = String(shifted.getUTCDate()).padStart(2, '0')
  const hour = String(shifted.getUTCHours()).padStart(2, '0')
  const minute = String(shifted.getUTCMinutes()).padStart(2, '0')
  const second = String(shifted.getUTCSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`
}

function parseDisplayDeadline(deadline, updateTimeMs) {
  const text = cleanText(deadline)
  if (!text || text === '尽快投递' || text === '招满即止') return null

  let match = text.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/)
  if (match) {
    const [, year, month, day] = match
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  match = text.match(/^(\d{2})-(\d{2})$/)
  if (match) {
    const shifted = new Date(updateTimeMs + 8 * 60 * 60 * 1000)
    const year = shifted.getUTCFullYear()
    const [, month, day] = match
    return `${year}-${month}-${day}`
  }

  return null
}

function normalizeCityList(raw) {
  const text = cleanText(raw)
  if (!text) return null

  const tokens = text.split(/[,，、/;；|\s]+/).filter(Boolean)
  const found = []
  const seen = new Set()
  const orderedCities = [...KNOWN_CITIES].sort((a, b) => b.length - a.length)

  for (const token of tokens) {
    let matched = false
    for (const city of orderedCities) {
      if (token.includes(city)) {
        if (!seen.has(city)) {
          found.push(city)
          seen.add(city)
        }
        matched = true
      }
    }

    if (matched || token.length < 2) continue

    let remaining = token
    while (remaining.length >= 2) {
      let foundCity = null
      for (const city of orderedCities) {
        if (remaining.startsWith(city)) {
          foundCity = city
          break
        }
      }

      if (foundCity) {
        if (!seen.has(foundCity)) {
          found.push(foundCity)
          seen.add(foundCity)
        }
        remaining = remaining.slice(foundCity.length)
      } else {
        remaining = remaining.slice(1)
      }
    }
  }

  return found.length ? found.join('、') : text
}

function inferTargetGraduates(...inputs) {
  const text = inputs.map(cleanText).filter(Boolean).join(' ')
  if (!text) return null

  const years = new Set()
  for (const match of text.matchAll(/(20\d{2})\s*届/g)) {
    years.add(`${match[1]}届`)
  }
  for (const match of text.matchAll(/(^|[^0-9])(2[6-9])\s*届/g)) {
    years.add(`20${match[2]}届`)
  }

  if (!years.size) return null
  return [...years].sort().join('/')
}

function inferRecruitmentType(record) {
  const text = [
    record.title,
    record.positions,
    record.channel,
    record.company,
  ].map(cleanText).join(' ')

  if (/实习/.test(text)) return '实习'
  if (/春招/.test(text)) return '春招'
  if (/秋招|提前批/.test(text)) return '秋招'
  if (/校招/.test(text)) return '校招'
  return cleanText(record.channel) || null
}

function pickTitle(record) {
  const positions = cleanText(record.positions)
  const title = cleanText(record.title)

  if (positions && positions !== '岗位较多' && positions !== '立即投递') {
    return positions.slice(0, 500)
  }

  return (title || positions).slice(0, 500)
}

function inferCompanyType(record, companyTypeMap) {
  const companyKey = normalizeKey(record.company)
  const existingType = companyTypeMap.get(companyKey)
  if (existingType) return existingType

  const company = cleanText(record.company)
  const industry = cleanText(record.industry)
  const text = `${company} ${industry} ${cleanText(record.title)} ${cleanText(record.positions)}`

  if (FOREIGN_COMPANY_HINTS.some((hint) => company.includes(hint) || text.includes(hint))) {
    return '外企'
  }
  if (/事业单位/.test(industry)) {
    return '事业单位'
  }
  if (/(大学|学院|学校|研究院|研究所|实验室|出版社|中心|医院)/.test(company) && !/有限公司|集团/.test(company)) {
    return '事业单位'
  }
  if (/银行|农商银行|信用社/.test(company) && !FOREIGN_COMPANY_HINTS.some((hint) => company.includes(hint))) {
    return '央国企'
  }
  if (CENTRAL_SOE_HINTS.some((hint) => company.includes(hint))) {
    return '央国企'
  }

  return null
}

function generateTags(record, companyType) {
  const tags = []
  if (companyType) tags.push(companyType)

  const industries = cleanText(record.industry)
    .split(/[,，/、]+/)
    .map((item) => item.trim())
    .filter((item) => item && item.length <= 12 && item !== companyType && item !== '其他')

  for (const industry of industries) {
    if (!tags.includes(industry)) tags.push(industry)
  }

  if (BIG_COMPANIES.some((name) => cleanText(record.company).includes(name)) && !tags.includes('大厂')) {
    tags.push('大厂')
  }

  return tags.slice(0, 5)
}

function escapeSql(input) {
  return String(input).replace(/'/g, "''")
}

function sqlValue(value) {
  if (value === null || value === undefined || value === '') return 'NULL'
  return `'${escapeSql(value)}'`
}

function sqlArray(values) {
  if (!values || !values.length) return "'{}'"
  const inner = values
    .map((value) => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`)
    .join(',')
  return sqlValue(`{${inner}}`)
}

function buildInsertSql(records) {
  const columns = 'title, company, city, deadline, tags, jd_url, status, company_type, target_graduates, recruitment_type, industry, source, source_record_id, notice_url, referral_code, updated_at'

  const statements = records.map((record) => `INSERT INTO jobs (${columns})
SELECT ${[
    sqlValue(record.title),
    sqlValue(record.company),
    sqlValue(record.city),
    sqlValue(record.deadline),
    sqlArray(record.tags),
    sqlValue(record.jd_url),
    sqlValue(record.status),
    sqlValue(record.company_type),
    sqlValue(record.target_graduates),
    sqlValue(record.recruitment_type),
    sqlValue(record.industry),
    sqlValue(record.source),
    sqlValue(record.source_record_id),
    sqlValue(record.notice_url),
    sqlValue(record.referral_code),
    sqlValue(record.updated_at),
  ].join(', ')}
WHERE NOT EXISTS (
  SELECT 1
  FROM jobs
  WHERE source_record_id = ${sqlValue(record.source_record_id)}
);\n`)

  return `${statements.join('\n')}`
}

async function fetchPageHtml(page) {
  const url = `https://www.offerstar.cn/recruitment?current=${page}&pageSize=${PAGE_SIZE}`
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    },
  })

  if (!response.ok) {
    throw new Error(`fetch page ${page} failed: ${response.status}`)
  }

  return response.text()
}

function parseStructuredRecords(html) {
  const matches = [...html.matchAll(/\{\\\"_id\\\":\\\"[\s\S]*?\\\"status\\\":null\}/g)]
  return matches.map((match) => {
    const placeholder = '__ESCAPED_QUOTE__'
    const jsonText = match[0]
      .replace(/\\\\\\\"/g, placeholder)
      .replace(/\\"/g, '"')
      .replace(new RegExp(placeholder, 'g'), '\\"')

    return JSON.parse(jsonText)
  })
}

function parseRowMap(html) {
  const rows = [...html.matchAll(/<tr class="ant-table-row ant-table-row-level-0" data-row-key="([^"]+)">([\s\S]*?)<\/tr>/g)]
  const map = new Map()

  for (const row of rows) {
    const id = row[1]
    const cells = [...row[2].matchAll(/<td class="ant-table-cell">([\s\S]*?)<\/td>/g)]
      .map((cell) => stripHtml(cell[1]))
    const href = decodeHtml(row[2].match(/href="([^"]+)"/)?.[1] || '')

    map.set(id, {
      company: cells[0] || null,
      updated_label: cells[1] || null,
      positions: cells[2] || null,
      work_location_label: cells[3] || null,
      industry_label: cells[4] || null,
      channel: cells[5] || null,
      deadline: cells[6] || null,
      apply_url: href || null,
    })
  }

  return map
}

async function loadExistingJobs() {
  const env = readFileSync(join(process.cwd(), '.env.local'), 'utf8')
  const anonKey = env.match(/^VITE_SUPABASE_ANON_KEY=(.+)$/m)?.[1]
  if (!anonKey) {
    throw new Error('VITE_SUPABASE_ANON_KEY missing in .env.local')
  }

  const all = []
  const limit = 1000

  for (let offset = 0; ; offset += limit) {
    const url = `https://zuorqnyxteftxtjrriox.supabase.co/rest/v1/jobs?select=company,title,company_type&limit=${limit}&offset=${offset}`
    const response = await fetch(url, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`load existing jobs failed at offset ${offset}: ${response.status}`)
    }

    const batch = await response.json()
    all.push(...batch)
    if (batch.length < limit) break
  }

  return all
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true })

  console.log(`抓取时间范围: ${START_LOCAL} -> ${END_LOCAL}`)

  const existingJobs = await loadExistingJobs()
  console.log(`现有 jobs 记录: ${existingJobs.length}`)

  const existingKeySet = new Set()
  const companyTypeCounter = new Map()

  for (const job of existingJobs) {
    const key = `${normalizeKey(job.company)}||${normalizeKey(job.title)}`
    existingKeySet.add(key)

    if (!job.company_type) continue
    const companyKey = normalizeKey(job.company)
    if (!companyTypeCounter.has(companyKey)) {
      companyTypeCounter.set(companyKey, new Map())
    }
    const counter = companyTypeCounter.get(companyKey)
    counter.set(job.company_type, (counter.get(job.company_type) || 0) + 1)
  }

  const companyTypeMap = new Map(
    [...companyTypeCounter.entries()].map(([companyKey, counter]) => {
      const [topType] = [...counter.entries()].sort((left, right) => right[1] - left[1])[0]
      return [companyKey, topType]
    })
  )

  const collected = []

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const html = await fetchPageHtml(page)
    const rowMap = parseRowMap(html)
    const structured = parseStructuredRecords(html)
    if (!structured.length) break

    const pageRecords = structured.map((record) => ({ ...record, row: rowMap.get(record._id) || null }))
    const pageTimes = pageRecords.map((record) => record.updateTime).filter(Boolean)
    const pageMax = Math.max(...pageTimes)
    const pageMin = Math.min(...pageTimes)

    console.log(
      `page ${String(page).padStart(2, '0')}: ${pageRecords.length} 条 | ${formatChinaIso(pageMax)} -> ${formatChinaIso(pageMin)}`
    )

    collected.push(...pageRecords)

    if (pageRecords.every((record) => record.updateTime < START_MS)) {
      break
    }
  }

  const withinRange = collected.filter((record) => record.updateTime >= START_MS && record.updateTime <= END_MS)
  console.log(`命中近一周原始记录: ${withinRange.length}`)

  const localDedup = new Map()
  for (const record of withinRange) {
    const title = pickTitle(record)
    const key = `${normalizeKey(record.company)}||${normalizeKey(title)}`
    if (!localDedup.has(key)) {
      localDedup.set(key, record)
    }
  }

  const cleaned = []
  const skippedExisting = []

  for (const record of localDedup.values()) {
    const title = pickTitle(record)
    const company = cleanText(record.company)
    const dedupeKey = `${normalizeKey(company)}||${normalizeKey(title)}`

    if (!company || !title) continue
    if (existingKeySet.has(dedupeKey)) {
      skippedExisting.push({ company, title })
      continue
    }

    const companyType = inferCompanyType(record, companyTypeMap)
    const deadline = cleanText(record.deadline || record.row?.deadline) || '尽快投递'
    const jdUrl = cleanText(record.row?.apply_url || record.referralMethod) || null
    const targetGraduates = inferTargetGraduates(record.title, record.positions)
    const recruitmentType = inferRecruitmentType(record)
    const city = normalizeCityList(record.workLocation || record.row?.work_location_label)
    const industry = cleanText(record.industry || record.row?.industry_label) || null

    cleaned.push({
      title,
      company,
      city,
      deadline,
      deadline_date: parseDisplayDeadline(deadline, record.updateTime),
      tags: generateTags(record, companyType),
      jd_url: jdUrl,
      status: 'open',
      company_type: companyType,
      target_graduates: targetGraduates,
      recruitment_type: recruitmentType,
      industry,
      source: SOURCE_NAME,
      source_record_id: `${SOURCE_ID_PREFIX}-${record._id}`,
      notice_url: jdUrl,
      referral_code: null,
      updated_at: formatChinaIso(record.updateTime),
      raw_title: cleanText(record.title),
      raw_positions: cleanText(record.positions),
      raw_work_location: cleanText(record.workLocation),
      raw_deadline: cleanText(record.deadline),
      updated_label: cleanText(record.row?.updated_label),
    })
  }

  cleaned.sort((left, right) => left.updated_at.localeCompare(right.updated_at) || left.company.localeCompare(right.company))

  const jsonPath = join(OUTPUT_DIR, `${OUTPUT_BASENAME}.json`)
  writeFileSync(jsonPath, `${JSON.stringify(cleaned, null, 2)}\n`, 'utf8')

  const chunkPaths = []
  for (let index = 0; index < cleaned.length; index += CHUNK_SIZE) {
    const chunk = cleaned.slice(index, index + CHUNK_SIZE)
    const chunkId = Math.floor(index / CHUNK_SIZE)
    const filePath = join(OUTPUT_DIR, `${OUTPUT_BASENAME}_chunk_${chunkId}.sql`)
    writeFileSync(filePath, buildInsertSql(chunk), 'utf8')
    chunkPaths.push(filePath)
  }

  const report = {
    range: {
      start: START_LOCAL,
      end: END_LOCAL,
    },
    fetched_records: collected.length,
    within_range_records: withinRange.length,
    after_local_dedupe: localDedup.size,
    skipped_existing_exact_matches: skippedExisting.length,
    final_records: cleaned.length,
    generated_sql_files: chunkPaths.map((filePath) => filePath.replace(`${process.cwd()}\\`, '')),
    stats: {
      with_company_type: cleaned.filter((record) => record.company_type).length,
      with_target_graduates: cleaned.filter((record) => record.target_graduates).length,
      with_deadline_date: cleaned.filter((record) => record.deadline_date).length,
      internships: cleaned.filter((record) => record.recruitment_type === '实习').length,
      big_company_tag: cleaned.filter((record) => record.tags.includes('大厂')).length,
    },
    skipped_existing_samples: skippedExisting.slice(0, 20),
    sample_records: cleaned.slice(0, 10),
  }

  const reportPath = join(OUTPUT_DIR, `${OUTPUT_BASENAME}_report.json`)
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(`生成 JSON: ${jsonPath}`)
  console.log(`生成 SQL: ${chunkPaths.length} 个文件`)
  console.log(`最终待导入记录: ${cleaned.length}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
