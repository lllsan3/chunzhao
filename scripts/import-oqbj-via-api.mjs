import { readFileSync } from 'fs'

const PROJECT_REF = 'zuorqnyxteftxtjrriox'

// Read batch files and execute via Supabase Management API
const files = Array.from({length: 8}, (_, i) => `./output/oqbj_final_${i}.sql`)

async function execSQL(sql) {
  // Use the Supabase Management API (same as MCP)
  const resp = await fetch(`https://${PROJECT_REF}.supabase.co/rest/v1/rpc/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  // This won't work without proper auth. Let's use pg directly.
}

// Actually, let's just use the anon client to call an RPC that does the insert
// Or, better: use the supabase-js with the service role key from SUPABASE_SERVICE_ROLE_KEY env var

import { createClient } from '@supabase/supabase-js'

const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!serviceKey) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var')
  console.log('You can find it in Supabase Dashboard > Settings > API > service_role key')
  process.exit(1)
}

const supabase = createClient(`https://${PROJECT_REF}.supabase.co`, serviceKey)

const raw = JSON.parse(readFileSync('../claude/gpt/output/recruitment/offerqingbaoju_recent_7d.json', 'utf-8'))
const records = raw.records

function mapCT(ct) {
  const m = { '国企':'央国企', '央企':'央国企', '民企':'民营企业', '外企':'外企', '合资':'中外合资/港澳台资', '事业单位':'事业单位' }
  return m[ct] || ct || null
}
function mapTG(tg) {
  if (!tg) return null
  return tg.split(',').map(y => { const yr = y.trim(); return yr.length === 2 ? `20${yr}届` : `${yr}届` }).join('/')
}
function mapRT(batch) {
  if (!batch) return null
  if (batch.includes('实习')) return '实习'
  if (batch.includes('社招')) return '社招'
  return '校招'
}

const rows = records.map(r => ({
  title: r.title || 'Untitled',
  company: r.company,
  city: r.work_location || null,
  deadline: r.deadline || null,
  tags: [],
  jd_url: r.apply_url || r.notice_url || null,
  status: 'open',
  company_type: mapCT(r.company_type),
  target_graduates: mapTG(r.target_candidates),
  recruitment_type: mapRT(r.batch),
  industry: r.industry || null,
  source: 'offerqingbaoju',
  source_record_id: r.source_record_id,
  notice_url: r.notice_url || null,
  referral_code: r.referral_code || null,
  updated_at: r.update_time ? r.update_time + 'T00:00:00+08:00' : new Date().toISOString(),
}))

console.log(`Inserting ${rows.length} rows in batches of 50...`)

let ok = 0, fail = 0
for (let i = 0; i < rows.length; i += 50) {
  const batch = rows.slice(i, i + 50)
  const { error } = await supabase.from('jobs').insert(batch)
  if (error) {
    console.log(`Batch ${Math.floor(i/50)}: FAILED -`, error.message)
    fail += batch.length
  } else {
    console.log(`Batch ${Math.floor(i/50)}: OK (${batch.length} rows)`)
    ok += batch.length
  }
}

console.log(`\nDone: ${ok} inserted, ${fail} failed`)
