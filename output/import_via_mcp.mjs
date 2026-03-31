import { readFileSync } from 'fs'

const data = JSON.parse(readFileSync('./output/job_details_supplement.json', 'utf-8'))

function esc(s) {
  return s.replace(/'/g, "''")
}

// Output each UPDATE statement individually for copy-paste into Supabase MCP
for (const d of data) {
  const sql = `UPDATE jobs SET description='${esc(d.description)}', resume_tips='${esc(d.resume_tips)}', evaluation='${esc(d.evaluation)}', risk_notes='${esc(d.risk_notes)}' WHERE id='${d.job_id}';`
  console.log(`--- ${d.company} (${sql.length} chars) ---`)
}
