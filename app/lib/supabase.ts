import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/* El cliente se crea de forma PEREZOSA (lazy): importar este módulo nunca
   instancia createClient, así que el build de Next no falla aunque las
   variables de entorno no estén presentes al recolectar las páginas.
   El cliente real solo se crea la primera vez que se usa (en runtime). */
let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (client) return client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
        'Configúralas en .env.local (local) y en Vercel → Settings → Environment Variables.',
    )
  }

  client = createClient(supabaseUrl, supabaseKey)
  return client
}

/* Proxy: reenvía cualquier acceso (supabase.from, supabase.auth, …) al
   cliente real, instanciándolo en el primer uso. Los sitios de llamada
   existentes no necesitan cambios. */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const real = getClient()
    const value = Reflect.get(real as object, prop, receiver)
    return typeof value === 'function' ? value.bind(real) : value
  },
})
