import { createBrowserClient } from '@supabase/ssr'

// Evitamos usar '!' para que no rompa la construcción si las variables faltan momentáneamente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)