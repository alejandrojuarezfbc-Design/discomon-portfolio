/* Importa los 34 productos de products.json a Supabase (estado=publicado).
   Mapea cada campo a su columna real; campos sin columna se omiten. */
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
const { productos } = require(path.join(root, 'products.json'))

async function main() {
  // Mapa categoria_slug -> id
  const { data: cats, error: ce } = await sb.from('categorias').select('id, slug')
  if (ce) throw new Error('categorias: ' + ce.message)
  const idPorSlug = Object.fromEntries(cats.map(c => [c.slug, c.id]))

  // Comprobar que todos los slugs de categoría existen
  const faltan = [...new Set(productos.map(p => p.categoria_slug))].filter(s => !idPorSlug[s])
  if (faltan.length) throw new Error('Slugs de categoría sin id en BD: ' + faltan.join(', '))

  // orden incremental por categoría (preserva el orden del JSON dentro de cada una)
  const contador = {}

  const filas = productos.map(p => {
    const orden = (contador[p.categoria_slug] = (contador[p.categoria_slug] ?? -1) + 1)
    return {
      slug: p.slug,
      nombre: p.nombre,
      marca: p.marca ?? null,
      categoria_id: idPorSlug[p.categoria_slug],
      subcategoria: p.subcategoria ?? null,
      orden,
      estado: 'publicado',
      gancho: p.gancho ?? null,
      // array de strings -> jsonb [{texto}] (formato que usa el admin y la web)
      que_hace: Array.isArray(p.que_hace) ? p.que_hace.map(texto => ({ texto })) : null,
      // vacío en origen -> null
      como_funciona: p.como_funciona ?? null,
      // array -> texto plano (columna text); la web hace split('\n')
      para_quien: Array.isArray(p.para_quien) ? p.para_quien.join('\n') : (p.para_quien ?? null),
      // galería sin URLs todavía (pendiente FTP)
      fotos_urls: p.galeria?.imagenes ?? [],
      videos_urls: p.galeria?.videos ?? [],
      // contenido de ficha técnica en fase posterior
      ficha_tecnica: null,
      // CTA estándar; sin email -> los botones van a /#contacto
      cta_texto: 'Solicitar información|Pedir una demo',
      cta_email: null,
    }
  })

  // Evitar duplicados si ya existieran algunos slugs
  const slugs = filas.map(f => f.slug)
  const { data: existentes } = await sb.from('productos').select('slug').in('slug', slugs)
  const yaExisten = new Set((existentes ?? []).map(r => r.slug))
  const aInsertar = filas.filter(f => !yaExisten.has(f.slug))

  console.log(`Productos en JSON: ${filas.length}`)
  console.log(`Ya existían (se omiten): ${yaExisten.size}${yaExisten.size ? ' -> ' + [...yaExisten].join(', ') : ''}`)
  console.log(`A insertar: ${aInsertar.length}`)

  if (aInsertar.length) {
    const { data, error } = await sb.from('productos').insert(aInsertar).select('slug')
    if (error) throw new Error('insert: ' + error.message)
    console.log(`Insertados: ${data.length}`)
  }

  // Eliminar el producto de prueba
  const { error: de, count } = await sb
    .from('productos')
    .delete({ count: 'exact' })
    .eq('slug', 'esto-es-una-prueba')
  if (de) throw new Error('delete prueba: ' + de.message)
  console.log(`Producto de prueba eliminado: ${count ?? 0}`)

  // Recuento final por categoría
  const { data: pub } = await sb.from('productos').select('categoria_id').eq('estado', 'publicado')
  const porCat = {}
  for (const r of pub ?? []) porCat[r.categoria_id] = (porCat[r.categoria_id] ?? 0) + 1
  const slugPorId = Object.fromEntries(cats.map(c => [c.id, c.slug]))
  console.log('=== Publicados por categoría ===')
  for (const [id, n] of Object.entries(porCat)) console.log(`  ${slugPorId[id] ?? id}: ${n}`)
  console.log(`Total publicados: ${pub?.length ?? 0}`)
}

main().catch(e => { console.error('FALLO:', e.message); process.exit(1) })
