import { readFileSync, writeFileSync } from 'fs'

const data = JSON.parse(readFileSync('./output/job_details_supplement.json', 'utf-8'))

function esc(s) {
  return s.replace(/'/g, "''")
}

const statements = data.map(d =>
  `UPDATE jobs SET description='${esc(d.description)}', resume_tips='${esc(d.resume_tips)}', evaluation='${esc(d.evaluation)}', risk_notes='${esc(d.risk_notes)}' WHERE id='${d.job_id}';`
)

// Write 2 batches
const mid = Math.ceil(statements.length / 2)
writeFileSync('./output/sql_batch1.txt', statements.slice(0, mid).join('\n'), 'utf-8')
writeFileSync('./output/sql_batch2.txt', statements.slice(mid).join('\n'), 'utf-8')
console.log(`Batch 1: ${mid} stmts, Batch 2: ${statements.length - mid} stmts`)
