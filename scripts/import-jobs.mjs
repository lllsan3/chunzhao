/**
 * 数据导入脚本：从 V5学长 Excel 导入职位到 Supabase jobs 表
 *
 * 用法: node scripts/import-jobs.mjs
 *
 * 需要在环境中设置 SUPABASE_URL 和 SUPABASE_SERVICE_KEY
 * (用 service_role key 绕过 RLS)
 */
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

// ── Config ──────────────────────────────────────────
const SUPABASE_URL = 'https://zuorqnyxteftxtjrriox.supabase.co'
// Use service_role key for admin writes (bypasses RLS)
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ 请设置环境变量 SUPABASE_SERVICE_KEY')
  console.error('   export SUPABASE_SERVICE_KEY="你的service_role_key"')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const EXCEL_PATH = 'C:/Users/Lenovo/Desktop/历史人物资料/002/新建文件夹/2026届校招信息汇总表（微信公众号：V5学长  欢迎关注.xlsx'
const SHEET_NAME = '2026春招表'
const BATCH_SIZE = 100

// ── Industry tag cleaning ───────────────────────────
function cleanIndustryTags(industry) {
  if (!industry) return []
  // Split by / and take meaningful parts
  return industry
    .split(/[/／]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length < 10)
    .slice(0, 3)
}

// ── Parse deadline text into Date or null ───────────
function parseDeadlineDate(text) {
  if (!text) return null
  const match = text.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/)
  if (!match) return null
  const [, y, m, d] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  if (isNaN(date.getTime())) return null
  return date.toISOString().split('T')[0] // YYYY-MM-DD
}

// ── Extract city (first city from multi-city string) ─
function extractCity(location) {
  if (!location) return null
  // Take first segment split by space, comma, or 、
  const first = location.split(/[\s,，、]+/)[0].trim()
  // Remove province prefix like "江苏苏州" → keep as is (it's fine)
  return first || null
}

// ── Clean referral code ─────────────────────────────
function cleanReferralCode(raw) {
  if (!raw || raw === '\\' || raw.trim() === '\\' || raw.trim() === '') return null
  // Extract referral code if present
  const match = raw.match(/内推码[：:]?\s*(\S+)/)
  if (match) return match[1]
  // If it's short enough, it might be the code itself
  if (raw.trim().length < 30 && raw.trim() !== '\\') return raw.trim()
  return null
}

// ── Main ────────────────────────────────────────────
async function main() {
  console.log('📖 读取 Excel...')
  const buf = readFileSync(EXCEL_PATH)
  const wb = XLSX.read(buf, { type: 'buffer' })

  const ws = wb.Sheets[SHEET_NAME]
  if (!ws) {
    console.error(`❌ 找不到工作表 "${SHEET_NAME}"`)
    console.log('可用工作表:', wb.SheetNames)
    process.exit(1)
  }

  // Parse as JSON, skip first 2 rows (title + instructions)
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

  // Row 0-1 are title/instructions, row 2 is header
  const headers = raw[2]
  console.log('📋 表头:', headers)

  // Find column indices
  const colIdx = {}
  const colNames = ['序号', '公司名称', '批次', '企业性质', '行业大类', '招聘对象',
    '招聘岗位', '网申状态', '工作地点', '更新时间', '截止时间', '官方公告', '投递方式', '内推码/备注']

  colNames.forEach((name) => {
    const idx = headers.indexOf(name)
    if (idx !== -1) colIdx[name] = idx
  })

  console.log('📊 列映射:', colIdx)

  // Also try to extract hyperlinks from 投递方式 column
  const hyperlinkMap = new Map()
  if (colIdx['投递方式'] !== undefined) {
    // XLSX stores hyperlinks in ws['!hyperlinks'] or cell.l
    for (const cellAddr in ws) {
      if (cellAddr[0] === '!') continue
      const cell = ws[cellAddr]
      if (cell && cell.l && cell.l.Target) {
        // Check if this cell is in the 投递方式 column
        const decoded = XLSX.utils.decode_cell(cellAddr)
        if (decoded.c === colIdx['投递方式']) {
          hyperlinkMap.set(decoded.r, cell.l.Target)
        }
      }
    }
    console.log(`🔗 提取到 ${hyperlinkMap.size} 个超链接`)
  }

  // Process data rows (starting from row 3)
  const jobs = []
  const seen = new Set() // dedup by company+title

  for (let i = 3; i < raw.length; i++) {
    const row = raw[i]
    const company = String(row[colIdx['公司名称']] || '').trim()
    const title = String(row[colIdx['招聘岗位']] || '').trim()

    // Skip empty rows
    if (!company || !title) continue

    // Dedup
    const key = `${company}||${title}`
    if (seen.has(key)) continue
    seen.add(key)

    const industry = String(row[colIdx['行业大类']] || '').trim()
    const companyType = String(row[colIdx['企业性质']] || '').trim()
    const deadline = String(row[colIdx['截止时间']] || '').trim()
    const city = extractCity(String(row[colIdx['工作地点']] || ''))
    const targetGrad = String(row[colIdx['招聘对象']] || '').trim()
    const referral = cleanReferralCode(String(row[colIdx['内推码/备注']] || ''))

    // Build tags from industry + company type
    const tags = []
    if (companyType) tags.push(companyType)
    tags.push(...cleanIndustryTags(industry))
    if (referral) tags.push('有内推')

    // Get hyperlink URL
    const jdUrl = hyperlinkMap.get(i) || null

    jobs.push({
      title,
      company,
      city,
      deadline: deadline || null,
      deadline_date: parseDeadlineDate(deadline),
      tags: [...new Set(tags)], // deduplicate tags
      jd_url: jdUrl,
      description: null,
      resume_tips: null,
      evaluation: null,
      risk_notes: null,
      status: 'active',
      company_type: companyType || null,
      target_graduates: targetGrad || null,
      referral_code: referral,
      source: 'V5学长2026春招表',
    })
  }

  console.log(`\n📦 解析完成: ${jobs.length} 条去重后的职位`)
  console.log(`   - 有链接: ${jobs.filter((j) => j.jd_url).length}`)
  console.log(`   - 有日期: ${jobs.filter((j) => j.deadline_date).length}`)
  console.log(`   - 有内推: ${jobs.filter((j) => j.referral_code).length}`)

  // Insert in batches
  console.log(`\n🚀 开始写入 Supabase (每批 ${BATCH_SIZE} 条)...`)
  let inserted = 0
  let errors = 0

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('jobs').insert(batch)

    if (error) {
      console.error(`❌ 批次 ${i}-${i + batch.length} 失败:`, error.message)
      errors += batch.length
    } else {
      inserted += batch.length
      process.stdout.write(`   ✅ ${inserted}/${jobs.length}\r`)
    }
  }

  console.log(`\n\n✅ 导入完成!`)
  console.log(`   成功: ${inserted}`)
  console.log(`   失败: ${errors}`)
}

main().catch(console.error)
