import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jkcnvuyklczouglhcoih.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_jXJzuW2H0wn5UiXbxhuxNQ_H0eoGLIW'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
