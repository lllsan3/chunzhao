import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zuorqnyxteftxtjrriox.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1b3Jxbnl4dGVmdHh0anJyaW94Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU5ODk2MCwiZXhwIjoyMDg4MTc0OTYwfQ.placeholder',
)

// We'll use the anon key and rely on the RPC/direct approach
// Actually, anon key can only SELECT on jobs (RLS). We need service_role or MCP.
// Let's prepare the SQL instead and output it.

const raw = JSON.parse(readFileSync('../claude/gpt/output/recruitment/offerqingbaoju_recent_7d.json', 'utf-8'))
const records = raw.records

// Field mapping
function mapCompanyType(ct) {
  const map = {
    '国企': '央国企',
    '央企': '央国企',
    '民企': '民营企业',
    '外企': '外企',
    '合资': '中外合资/港澳台资',
    '事业单位': '事业单位',
    '其他': '其他',
  }
  return map[ct] || ct || null
}

function mapTargetGraduates(tg) {
  if (!tg) return null
  // "26" → "2026届", "25,26" → "2025届/2026届"
  return tg.split(',').map(y => {
    const year = y.trim()
    if (year.length === 2) return `20${year}届`
    if (year.length === 4) return `${year}届`
    return year
  }).join('/')
}

function mapRecruitmentType(batch) {
  if (!batch) return null
  if (batch.includes('实习')) return '实习'
  if (batch.includes('社招')) return '社招'
  return '校招'
}

function normalizeCity(loc) {
  if (!loc) return null
  // Take first city if multiple, clean up
  return loc.split(',')[0].split('、')[0].trim()
}

function esc(s) {
  if (s === null || s === undefined) return 'NULL'
  return "'" + s.replace(/'/g, "''") + "'"
}

// Build rows
const rows = records.map(r => ({
  title: r.title || r.positions?.slice(0, 100) || '未命名',
  company: r.company,
  city: r.work_location || null,
  deadline: r.deadline || null,
  tags: [],
  jd_url: r.apply_url || r.notice_url || null,
  status: 'open',
  company_type: mapCompanyType(r.company_type),
  target_graduates: mapTargetGraduates(r.target_candidates),
  recruitment_type: mapRecruitmentType(r.batch),
  industry: r.industry || null,
  source: 'offerqingbaoju',
  source_record_id: r.source_record_id,
  notice_url: r.notice_url || null,
  referral_code: r.referral_code || null,
  updated_at: r.update_time ? new Date(r.update_time).toISOString() : new Date().toISOString(),
}))

console.log(`Prepared ${rows.length} rows for import`)
console.log('Sample:', JSON.stringify(rows[0], null, 2))

// Output as JSON for batch insert
import { writeFileSync } from 'fs'
writeFileSync('./output/offerqingbaoju_mapped.json', JSON.stringify(rows, null, 2), 'utf-8')
console.log('Written to output/offerqingbaoju_mapped.json')
