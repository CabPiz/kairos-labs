import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para uso no browser (componentes client-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para uso em Server Actions e Server Components
// Utiliza a service role key para operações privilegiadas (somente no servidor)
export const createServerClient = () =>
  createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey
  )