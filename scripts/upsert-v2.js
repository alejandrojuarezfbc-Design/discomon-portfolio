/* Migración v2 — Paso 1: upsert por slug de los 30 productos de productos-v2.json.
   - Match por slug -> UPDATE de campos v2 (conserva estado, orden, pasoN_*, cta_*, como_funciona).
   - Slug nuevo    -> INSERT con esos campos + estado='publicado', orden=0, CTA estándar.
   - NO elimina nada. Reporta actualizados, creados y slugs en BD ausentes en v2 (candidatos a eliminar). */
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
const { productos } = require(path.join(root, 'productos-v2.json'))

const CTA_STD = 'Solicitar información|Pedir una demo'

async function main() {
  // Mapa categoria_slug -> id
  const { data: cats, error: ce } = await sb.from('categorias').select('id, slug')
  if (ce) throw new Error('categorias: ' + ce.message)
  const idPorSlug = Object.fromEntries(cats.map(c => [c.slug, c.id]))

  const faltan = [...new Set(productos.map(p => p.categoria_slug))].filter(s => !idPorSlug[s])
  if (faltan.length) throw new Error('Slugs de categoría sin id en BD: ' + faltan.join(', '))

  // Slugs ya existentes en BD
  const { data: existentesRows, error: ee } = await sb.from('productos').select('slug')
  if (ee) throw new Error('select slugs: ' + ee.message)
  const dbSlugs = new Set(existentesRows.map(r => r.slug))

  // Campos comunes derivados de v2 (los que se escriben tanto en update como en insert)
  const camposV2 = p => ({
    nombre: p.nombre,
    marca: p.marca ?? null,
    categoria_id: idPorSlug[p.categoria_slug],
    gancho: p.gancho ?? null,
    // array de strings -> jsonb [{texto}] (formato que usa la web/admin)
    que_hace: Array.isArray(p.que_hace) ? p.que_hace.map(texto => ({ texto })) : null,
    // array -> texto plano (columna text); la web hace split('\n')
    para_quien: Array.isArray(p.para_quien) ? p.para_quien.join('\n') : (p.para_quien ?? null),
    // jsonb tal cual
    variantes: Array.isArray(p.variantes) ? p.variantes : [],
    ficha_tecnica: Array.isArray(p.ficha_tecnica) ? p.ficha_tecnica : [],
    // galería a nivel producto: vacía por ahora (pendiente fase de fotos)
    galeria: [],
    // foto principal: vacía por ahora
    foto_principal: null,
  })

  let actualizados = 0, creados = 0
  const creadosSlugs = [], actualizadosSlugs = []

  for (const p of productos) {
    if (dbSlugs.has(p.slug)) {
      // UPDATE: solo campos v2; conserva estado, orden, pasoN_*, cta_*, como_funciona
      const { data, error } = await sb
        .from('productos')
        .update(camposV2(p))
        .eq('slug', p.slug)
        .select('slug')
      if (error) throw new Error(`update ${p.slug}: ${error.message}`)
      if (!data || !data.length) throw new Error(`update ${p.slug}: 0 filas`)
      actualizados++; actualizadosSlugs.push(p.slug)
    } else {
      // INSERT: campos v2 + defaults
      const { data, error } = await sb
        .from('productos')
        .insert({
          slug: p.slug,
          ...camposV2(p),
          estado: 'publicado',
          orden: 0,
          cta_texto: CTA_STD,
          cta_email: null,
        })
        .select('slug')
      if (error) throw new Error(`insert ${p.slug}: ${error.message}`)
      creados++; creadosSlugs.push(p.slug)
    }
  }

  // Candidatos a eliminar: en BD pero no en v2
  const v2Slugs = new Set(productos.map(p => p.slug))
  const candidatos = [...dbSlugs].filter(s => !v2Slugs.has(s)).sort()

  console.log('=== UPSERT v2 — RESULTADO ===')
  console.log('Productos en v2:', productos.length)
  console.log('Actualizados:', actualizados)
  console.log('Creados:', creados, creados ? '-> ' + creadosSlugs.join(', ') : '')
  console.log('\n=== CANDIDATOS A ELIMINAR (en BD, no en v2):', candidatos.length, '===')
  candidatos.forEach(s => console.log('  - ' + s))
  console.log('\nTotal productos en BD ahora:', dbSlugs.size + creados)
}

main().catch(e => { console.error('FALLO:', e.message); process.exit(1) })
