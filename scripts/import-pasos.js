/* Paso 2 de 3: rellena las columnas pasoN_titulo/_texto/_icono de la tabla
   'productos' con los pasos de como-funciona.json (match por slug).
   Productos con menos de 5 pasos dejan las columnas sobrantes en NULL. */
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const root = path.join(__dirname, '..')
const env = fs.readFileSync(path.join(root, '.env.local'), 'utf8')
const get = k => {
  const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'))
  return m ? m[1].trim() : null
}

const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SECRET_KEY'))
const { pasos } = require(path.join(root, 'como-funciona.json'))

// Construye {pasoN_titulo, pasoN_texto, pasoN_icono} para N=1..5;
// los pasos que no existan quedan en null.
function filaPasos(comoFunciona) {
  const fila = {}
  for (let n = 1; n <= 5; n++) {
    const s = comoFunciona[n - 1] ?? null
    fila[`paso${n}_titulo`] = s ? s.titulo : null
    fila[`paso${n}_texto`] = s ? s.texto : null
    fila[`paso${n}_icono`] = s ? s.icono : null
  }
  return fila
}

async function main() {
  let actualizados = 0
  for (const p of pasos) {
    const { data, error } = await sb
      .from('productos')
      .update(filaPasos(p.como_funciona ?? []))
      .eq('slug', p.slug)
      .select('slug')
    if (error) throw new Error(`${p.slug}: ${error.message}`)
    if (!data || data.length === 0) throw new Error(`${p.slug}: no existe en BD`)
    actualizados += data.length
  }
  console.log(`Productos en JSON: ${pasos.length}`)
  console.log(`Productos actualizados: ${actualizados}`)
}

main().catch(e => { console.error('FALLO:', e.message); process.exit(1) })
