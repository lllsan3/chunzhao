import { readFileSync, readdirSync } from 'fs'

const PROJECT_REF = 'zuorqnyxteftxtjrriox'

// Get the access token from Supabase CLI or use management API
// We'll use the database connection string directly via pg
// Actually, let's use the Supabase REST API with service role key

// Read all batch files
const files = readdirSync('./output')
  .filter(f => f.startsWith('oqbj_final_') && f.endsWith('.sql'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0])
    const numB = parseInt(b.match(/\d+/)[0])
    return numA - numB
  })

console.log(`Found ${files.length} batch files`)

for (const file of files) {
  const sql = readFileSync(`./output/${file}`, 'utf-8')
  const rowCount = (sql.match(/\),/g) || []).length + 1
  console.log(`${file}: ${rowCount} rows, ${(sql.length/1024).toFixed(1)}KB - ready for MCP execution`)
}

console.log('\nTo execute, run each file through mcp__supabase__execute_sql')
