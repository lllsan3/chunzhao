import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '请检查 .env.local 配置文件中的 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 是否正确设置'
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
