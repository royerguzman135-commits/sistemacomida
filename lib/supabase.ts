import { createBrowserClient } from '@supabase/ssr'

// El '!' al final le dice a TypeScript: "Tranquilo, yo sé que estas variables existen"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)