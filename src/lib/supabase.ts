import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here'

if (!isSupabaseConfigured) {
  throw new Error('Supabase URL and Anon Key must be configured in environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const isSupabaseReady = isSupabaseConfigured

export type { Database }