/**
 * Unified data import script
 * Reads offerstar / givemeoc / qiuzhifangzhou JSON files
 * Cleans → maps → dedupes → upserts into Supabase jobs table
 *
 * Usage: node scripts/importNewData.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// ── Config ──────────────────────────────────────────────
const SUPABASE_URL = 'https://zuorqnyxteftxtjrriox.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1b3Jxbnl4dGVmdHh0anJyaW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTg5NjAsImV4cCI6MjA4ODE3NDk2MH0.nngEQiXKwKgTm0A4nDkLXsose2yCLxAVuvBUtNAcisY'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const DATA_DIR = 'C:/Users/Lenovo/Desktop/claude/gpt/output/recruitment'

const __dirname = dirname(fileURLToPath(import.meta.url))
const bigCompanies = JSON.parse(
  readFileSync(join(__dirname, 'bigCompanies.json'), 'utf-8')
).companies

// ── Company type normalization ──────────────────────────
const COMPANY_TYPE_MAP = {
  '央国企': '央国企',
  '国企': '央国企',
  '央企': '央国企',
  '民企': '民营企业',
  '民营': '民营企业',
  '民营企业': '民营企业',
  '外企': '外企',
  '外资': '外企',
  '事业单位': '事业单位',
  '银行': '央国企',       // banks in China are mostly state-owned
  '中外合资/港澳台资': '中外合资/港澳台资',
  '股份/集体/混合/其他性质': '民营企业',
}

function normalizeCompanyType(raw) {
  if (!raw || raw.trim() === '') return null
  const trimmed = raw.trim()
  // Try direct match
  if (COMPANY_TYPE_MAP[trimmed]) return COMPANY_TYPE_MAP[trimmed]
  // Try partial match
  for (const [key, val] of Object.entries(COMPANY_TYPE_MAP)) {
    if (trimmed.includes(key)) return val
  }
  return trimmed
}

// ── City normalization ──────────────────────────────────
const KNOWN_CITIES = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉',
  '西安', '重庆', '苏州', '天津', '长沙', '郑州', '东莞', '青岛',
  '大连', '宁波', '厦门', '合肥', '佛山', '珠海', '福州', '济南',
  '无锡', '昆明', '贵阳', '太原', '南昌', '石家庄', '哈尔滨', '沈阳',
  '长春', '南宁', '海口', '兰州', '银川', '呼和浩特', '乌鲁木齐', '拉萨',
  '常州', '镇江', '温州', '绍兴', '嘉兴', '金华', '台州', '惠州',
  '中山', '烟台', '潍坊', '保定', '徐州', '扬州', '泉州', '漳州',
  '赣州', '宜昌', '芜湖', '洛阳', '襄阳', '绵阳', '遵义', '威海',
  '甘肃', '山东', '广东', '浙江', '江苏', '河南', '湖北', '湖南',
  '四川', '辽宁', '吉林', '黑龙江', '安徽', '江西', '福建', '山西',
  '河北', '云南', '贵州', '广西', '海南', '内蒙古', '宁夏', '新疆', '西藏', '青海',
  '全国', '远程',
]

function normalizeCity(raw) {
  if (!raw || raw.trim() === '') return null
  let text = raw.trim()

  // Remove parenthetical info: 上海(总部) → 上海
  text = text.replace(/[（(][^）)]*[）)]/g, '')

  // Split by various delimiters
  const parts = text.split(/[,，、/\s]+/).filter(Boolean)

  // Try to match known cities from each part
  const matched = new Set()
  for (const part of parts) {
    // Direct match
    const found = KNOWN_CITIES.find((c) => part.includes(c))
    if (found) {
      matched.add(found)
    } else if (part.length >= 2) {
      // Try sliding window for concatenated cities like "郑州杭州厦门"
      let remaining = part
      while (remaining.length >= 2) {
        let foundCity = false
        for (let len = 5; len >= 2; len--) {
          const candidate = remaining.slice(0, len)
          const city = KNOWN_CITIES.find((c) => candidate === c || candidate.startsWith(c))
          if (city) {
            matched.add(city)
            remaining = remaining.slice(city.length)
            foundCity = true
            break
          }
        }
        if (!foundCity) {
          remaining = remaining.slice(1)
        }
      }
      if (matched.size === 0) {
        matched.add(part)
      }
    }
  }

  if (matched.size === 0) return text
  return [...matched].join('、')
}

// ── Tags generation ─────────────────────────────────────
function generateTags(record, companyType) {
  const tags = []

  // Company type tag
  if (companyType) tags.push(companyType)

  // Industry tags
  if (record.industry) {
    const industries = record.industry.split(/[,，/、]+/).filter(Boolean)
    for (const ind of industries.slice(0, 3)) {
      const trimmed = ind.trim()
      if (trimmed && trimmed !== companyType && !tags.includes(trimmed)) {
        tags.push(trimmed)
      }
    }
  }

  // Big company tag
  if (isBigCompany(record.company)) {
    tags.push('大厂')
  }

  return tags.slice(0, 5) // max 5 tags
}

function isBigCompany(company) {
  if (!company) return false
  return bigCompanies.some((name) => company.includes(name))
}

// ── Target graduates normalization ──────────────────────
function normalizeTargetGraduates(raw) {
  if (!raw || raw.trim() === '') return null
  let text = raw.trim()
  // Normalize separators
  text = text.replace(/,/g, '/')
  // Ensure consistent format
  if (!text.includes('届') && /20\d{2}/.test(text)) {
    text = text.replace(/(20\d{2})/g, '$1届')
  }
  return text
}

// ── Deadline date extraction ────────────────────────────
function extractDeadlineDate(deadline) {
  if (!deadline) return null
  const match = deadline.match(/(\d{4}-\d{2}-\d{2})/)
  if (match) return match[1]
  return null
}

// ── Recruitment type normalization ──────────────────────
function normalizeRecruitmentType(raw, batch, channel) {
  if (raw) {
    const lower = raw.toLowerCase()
    if (lower.includes('实习')) return '实习'
    if (lower.includes('春招')) return '春招'
    if (lower.includes('秋招')) return '秋招'
    if (lower.includes('校招')) return '校招'
    if (lower.includes('社招')) return '社招'
  }
  if (batch) {
    if (batch.includes('实习')) return '实习'
    if (batch.includes('春招')) return '春招'
    if (batch.includes('秋招')) return '秋招'
  }
  if (channel) {
    if (channel.includes('春招')) return '春招'
    if (channel.includes('校招')) return '校招'
  }
  return raw || null
}

// ── Main transform ──────────────────────────────────────
function transformRecord(record) {
  const companyType = normalizeCompanyType(record.company_type || record.type_tags)
  const recruitmentType = normalizeRecruitmentType(
    record.recruitment_type, record.batch, record.channel
  )

  return {
    title: (record.positions || record.title || '').trim().slice(0, 500),
    company: (record.company || '').trim(),
    city: normalizeCity(record.work_location),
    deadline: (record.deadline || record.raw_deadline_text || '').trim() || null,
    deadline_date: extractDeadlineDate(record.deadline || record.raw_deadline_text),
    tags: generateTags(record, companyType),
    jd_url: (record.apply_url || record.external_source_url || '').trim() || null,
    notice_url: (record.notice_url || '').trim() || null,
    status: 'active',
    company_type: companyType,
    industry: (record.industry || '').trim() || null,
    recruitment_type: recruitmentType,
    target_graduates: normalizeTargetGraduates(record.target_candidates),
    referral_code: (record.referral_code || '').trim() || null,
    source: record.source || null,
    source_record_id: record.source_record_id || null,
  }
}

// ── Load & process ──────────────────────────────────────
async function main() {
  console.log('=== 春招助手 数据导入脚本 ===\n')

  // Load source files
  const sources = ['offerstar', 'givemeoc', 'qiuzhifangzhou']
  let allRecords = []

  for (const src of sources) {
    const path = join(DATA_DIR, `${src}.json`)
    try {
      const raw = JSON.parse(readFileSync(path, 'utf-8'))
      const records = raw.records || []
      console.log(`✓ ${src}: ${records.length} 条`)
      allRecords.push(...records)
    } catch (e) {
      console.log(`✗ ${src}: 读取失败 - ${e.message}`)
    }
  }

  console.log(`\n总原始记录: ${allRecords.length}`)

  // Transform all records
  const transformed = allRecords
    .map(transformRecord)
    .filter((r) => r.company && r.title) // must have company and title

  console.log(`有效记录 (有公司+岗位): ${transformed.length}`)

  // Dedup by company + title (keep first occurrence)
  const seen = new Set()
  const deduped = []
  for (const record of transformed) {
    const key = `${record.company}||${record.title}`.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      deduped.push(record)
    }
  }
  console.log(`去重后: ${deduped.length}`)

  // Also check against existing DB records
  console.log('\n检查数据库现有记录...')
  const { data: existing } = await supabase
    .from('jobs')
    .select('company, title')

  const existingKeys = new Set(
    (existing || []).map((r) => `${r.company}||${r.title}`.toLowerCase())
  )
  console.log(`数据库现有: ${existingKeys.size} 条`)

  const toInsert = deduped.filter((r) => {
    const key = `${r.company}||${r.title}`.toLowerCase()
    return !existingKeys.has(key)
  })

  console.log(`需新增: ${toInsert.length} 条`)

  // Stats
  const stats = {
    hasCompanyType: toInsert.filter((r) => r.company_type).length,
    hasIndustry: toInsert.filter((r) => r.industry).length,
    hasTargetGrad: toInsert.filter((r) => r.target_graduates).length,
    hasRecruitType: toInsert.filter((r) => r.recruitment_type).length,
    hasBigCompany: toInsert.filter((r) => r.tags.includes('大厂')).length,
    hasDeadlineDate: toInsert.filter((r) => r.deadline_date).length,
  }
  console.log('\n字段覆盖率:')
  for (const [k, v] of Object.entries(stats)) {
    const pct = toInsert.length ? Math.round((v / toInsert.length) * 100) : 0
    console.log(`  ${k}: ${v}/${toInsert.length} (${pct}%)`)
  }

  // Batch insert (500 at a time)
  if (toInsert.length === 0) {
    console.log('\n没有新数据需要导入。')
    return
  }

  console.log(`\n开始批量导入 ${toInsert.length} 条...`)
  const BATCH = 500
  let inserted = 0
  let errors = 0

  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH)
    const { error } = await supabase.from('jobs').insert(batch)
    if (error) {
      console.error(`  批次 ${i}-${i + batch.length}: 失败 - ${error.message}`)
      // Try one by one for this batch
      for (const record of batch) {
        const { error: singleErr } = await supabase.from('jobs').insert(record)
        if (singleErr) {
          errors++
        } else {
          inserted++
        }
      }
    } else {
      inserted += batch.length
      console.log(`  批次 ${i}-${i + batch.length}: ✓ (${inserted} 已导入)`)
    }
  }

  console.log(`\n=== 导入完成 ===`)
  console.log(`成功: ${inserted}`)
  console.log(`失败: ${errors}`)

  // Final count
  const { count } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
  console.log(`数据库总职位数: ${count}`)
}

main().catch(console.error)
