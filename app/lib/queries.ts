import { supabase } from './supabase'

/* ── Tipos que reflejan el esquema real de Supabase ──────── */

/* Variante/formato de un producto. Su galería se rellenará en la fase de fotos. */
export type Variante = {
  nombre: string
  descripcion: string
  galeria: string[]
}

/* Fila de la ficha técnica (par bloque/detalle). */
export type FichaTecnicaItem = {
  bloque: string
  detalle: string
}

export type Categoria = {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  orden: number
}

export type Producto = {
  id: string
  nombre: string
  slug: string
  categoria_id: string
  marca: string
  orden: number
  estado: 'borrador' | 'publicado'
  gancho: string
  que_hace: { texto: string }[] | null
  como_funciona: string | null
  paso1_titulo: string | null
  paso1_texto: string | null
  paso1_icono: string | null
  paso2_titulo: string | null
  paso2_texto: string | null
  paso2_icono: string | null
  paso3_titulo: string | null
  paso3_texto: string | null
  paso3_icono: string | null
  paso4_titulo: string | null
  paso4_texto: string | null
  paso4_icono: string | null
  paso5_titulo: string | null
  paso5_texto: string | null
  paso5_icono: string | null
  para_quien: string | null
  variantes: Variante[] | null
  fotos_urls: string[] | null
  videos_urls: string[] | null
  galeria: string[] | null
  foto_principal: string | null
  ficha_tecnica: FichaTecnicaItem[] | null
  cta_texto: string | null
  cta_email: string | null
}

/* Producto con su categoría resuelta (dos consultas, sin depender de FK) */
export type ProductoConCategoria = Producto & {
  categoria: Pick<Categoria, 'nombre' | 'slug'> | null
}

/* ── Consultas ───────────────────────────────────────────── */

/* Todas las categorías, ordenadas. Para la home y el footer. */
export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await supabase
    .from('categorias')
    .select('*')
    .order('orden')

  return data ?? []
}

/* Una categoría por su slug. Null si no existe. */
export async function getCategoriaPorSlug(
  slug: string,
): Promise<Categoria | null> {
  const { data } = await supabase
    .from('categorias')
    .select('*')
    .eq('slug', slug)
    .single()

  return data ?? null
}

/* Productos publicados de una categoría, ordenados. */
export async function getProductosPorCategoria(
  categoriaId: string,
): Promise<Producto[]> {
  const { data } = await supabase
    .from('productos')
    .select('*')
    .eq('categoria_id', categoriaId)
    .eq('estado', 'publicado')
    .order('orden')

  return data ?? []
}

/* Un producto publicado por su slug, con su categoría resuelta.
   Dos consultas separadas (no depende de que la FK esté declarada).
   Null si el producto no existe o está en borrador. */
export async function getProductoPorSlug(
  slug: string,
): Promise<ProductoConCategoria | null> {
  const { data: producto } = await supabase
    .from('productos')
    .select('*')
    .eq('slug', slug)
    .eq('estado', 'publicado')
    .single()

  if (!producto) return null

  const { data: categoria } = await supabase
    .from('categorias')
    .select('nombre, slug')
    .eq('id', producto.categoria_id)
    .single()

  return { ...producto, categoria: categoria ?? null }
}
