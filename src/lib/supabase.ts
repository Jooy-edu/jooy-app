import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a mock client for development when Supabase is not configured
// Removed all authentication-related mock methods
const createMockClient = () => ({
  from: () => ({
    select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    eq: function() { return this },
    single: function() { return this },
    order: function() { return this }
  }),
  functions: {
    invoke: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
  },
  storage: {
    from: () => ({
      createSignedUrl: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
    })
  }
})

// Check if environment variables are properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here'

export const supabase = isSupabaseConfigured 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any

export const isSupabaseReady = isSupabaseConfigured

// Helper function to check if we should use Supabase or fallback to JSON
export const shouldUseSupabase = () => isSupabaseConfigured

export type { Database }