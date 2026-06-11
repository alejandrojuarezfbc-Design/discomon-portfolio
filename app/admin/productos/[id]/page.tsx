'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'

type Categoria = {
  id: string
  nombre: string
}

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [guardando, setGuardando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [marca, setMarca] = useState('')
  const [gancho, setGancho] = useState('')
  const [queHace, setQueHace] = useState(['', '', '', ''])
  const [pasos, setPasos] = useState(
    Array.from({ length: 5 }, () => ({ titulo: '', texto: '', icono: '' })),
  )
  const [variantes, setVariantes] = useState<{ nombre: string; descripcion: string }[]>([])
  /* galería original de cada variante, indexada por nombre (no se edita aquí) */
  const [galeriasPorNombre, setGaleriasPorNombre] = useState<Record<string, string[]>>({})
  const [paraQuien, setParaQuien] = useState('')
  const [fotosUrls, setFotosUrls] = useState([''])
  const [videosUrls, setVideosUrls] = useState([''])
  const [fichaTecnica, setFichaTecnica] = useState<{ bloque: string; detalle: string }[]>([])
  const [ctaOpciones, setCtaOpciones] = useState(['Solicitar información', 'Pedir una demo'])
  const [ctaSeleccionados, setCtaSeleccionados] = useState<string[]>(['Solicitar información'])
  const [ctaEmail, setCtaEmail] = useState('')

  useEffect(() => {
    async function cargar() {
      const { data: cats } = await supabase
        .from('categorias').select('id, nombre').order('orden')
      if (cats) setCategorias(cats)

      const { data: producto } = await supabase
        .from('productos').select('*').eq('id', id).single()

      if (producto) {
        setNombre(producto.nombre || '')
        setSlug(producto.slug || '')
        setCategoriaId(producto.categoria_id || '')
        setMarca(producto.marca || '')
        setGancho(producto.gancho || '')
        setQueHace(
          producto.que_hace?.map((p: { texto: string }) => p.texto) || ['', '', '', '']
        )
        setPasos(
          Array.from({ length: 5 }, (_, i) => {
            const n = i + 1
            return {
              titulo: producto[`paso${n}_titulo`] || '',
              texto: producto[`paso${n}_texto`] || '',
              icono: producto[`paso${n}_icono`] || '',
            }
          }),
        )
        const vars = Array.isArray(producto.variantes) ? producto.variantes : []
        setVariantes(
          vars.map((v: { nombre?: string; descripcion?: string }) => ({
            nombre: v.nombre || '',
            descripcion: v.descripcion || '',
          })),
        )
        setGaleriasPorNombre(
          Object.fromEntries(
            vars
              .filter((v: { nombre?: string }) => v.nombre)
              .map((v: { nombre: string; galeria?: string[] }) => [
                v.nombre,
                Array.isArray(v.galeria) ? v.galeria : [],
              ]),
          ),
        )
        setParaQuien(producto.para_quien || '')
        setFotosUrls(producto.fotos_urls?.length ? producto.fotos_urls : [''])
        setVideosUrls(producto.videos_urls?.length ? producto.videos_urls : [''])
        setFichaTecnica(
          Array.isArray(producto.ficha_tecnica)
            ? producto.ficha_tecnica.map((f: { bloque?: string; detalle?: string }) => ({
                bloque: f.bloque || '',
                detalle: f.detalle || '',
              }))
            : [],
        )
        setCtaEmail(producto.cta_email || '')
        if (producto.cta_texto) {
          const opciones = producto.cta_texto.split('|')
          setCtaSeleccionados(opciones)
          setCtaOpciones(prev => {
            const merged = [...prev]
            opciones.forEach((op: string) => {
              if (!merged.includes(op)) merged.push(op)
            })
            return merged
          })
        }
      }
      setCargando(false)
    }
    cargar()
  }, [id])

  function generarSlug(texto: string) {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  function handleNombreChange(valor: string) {
    setNombre(valor)
    setSlug(generarSlug(valor))
  }

  function toggleCta(opcion: string) {
    if (ctaSeleccionados.includes(opcion)) {
      setCtaSeleccionados(ctaSeleccionados.filter(c => c !== opcion))
    } else {
      setCtaSeleccionados([...ctaSeleccionados, opcion])
    }
  }

  function editarCta(index: number, valor: string) {
    const nuevas = [...ctaOpciones]
    const anterior = nuevas[index]
    nuevas[index] = valor
    setCtaOpciones(nuevas)
    setCtaSeleccionados(ctaSeleccionados.map(c => c === anterior ? valor : c))
  }

  function editarPaso(i: number, campo: 'titulo' | 'texto' | 'icono', valor: string) {
    setPasos(prev => prev.map((p, j) => (j === i ? { ...p, [campo]: valor } : p)))
  }

  /* Mapea los 5 pasos a las columnas pasoN_*; campos vacíos -> null */
  function columnasPasos() {
    const cols: Record<string, string | null> = {}
    pasos.forEach((p, i) => {
      const n = i + 1
      const limpio = (v: string) => (v.trim() === '' ? null : v.trim())
      cols[`paso${n}_titulo`] = limpio(p.titulo)
      cols[`paso${n}_texto`] = limpio(p.texto)
      cols[`paso${n}_icono`] = limpio(p.icono)
    })
    return cols
  }

  /* ── Variantes (nombre + descripción; la galería se gestiona aparte) ── */
  function editarVariante(i: number, campo: 'nombre' | 'descripcion', valor: string) {
    setVariantes(prev => prev.map((v, j) => (j === i ? { ...v, [campo]: valor } : v)))
  }
  /* Variantes listas para guardar: jsonb {nombre, descripcion, galeria}.
     La galería no se edita aquí; se conserva la existente buscándola por nombre
     (más robusto que por índice ante reordenamientos). Si es nueva -> []. */
  function variantesPayload() {
    return variantes
      .filter(v => v.nombre.trim() !== '')
      .map(v => ({
        nombre: v.nombre.trim(),
        descripcion: v.descripcion.trim(),
        galeria: galeriasPorNombre[v.nombre.trim()] ?? [],
      }))
  }

  /* ── Ficha técnica (filas bloque + detalle) ── */
  function editarFicha(i: number, campo: 'bloque' | 'detalle', valor: string) {
    setFichaTecnica(prev => prev.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)))
  }
  function fichaPayload() {
    return fichaTecnica
      .filter(f => f.bloque.trim() !== '' || f.detalle.trim() !== '')
      .map(f => ({ bloque: f.bloque.trim(), detalle: f.detalle.trim() }))
  }

  async function guardar(estado: 'borrador' | 'publicado') {
    if (!nombre) { setMensaje('El nombre es obligatorio'); return }
    if (!categoriaId) { setMensaje('Selecciona una categoría'); return }

    setGuardando(true)
    setMensaje('')

    const { error } = await supabase.from('productos').update({
      nombre,
      slug: slug || generarSlug(nombre),
      categoria_id: categoriaId,
      marca,
      estado,
      gancho,
      que_hace: queHace.filter(p => p.trim() !== '').map(texto => ({ texto })),
      ...columnasPasos(),
      variantes: variantesPayload(),
      para_quien: paraQuien,
      fotos_urls: fotosUrls.filter(u => u.trim() !== ''),
      videos_urls: videosUrls.filter(u => u.trim() !== ''),
      ficha_tecnica: fichaPayload(),
      cta_texto: ctaSeleccionados.join('|'),
      cta_email: ctaEmail,
    }).eq('id', id)

    if (error) {
      setMensaje('Error al guardar: ' + error.message)
      setGuardando(false)
      return
    }

    router.push('/admin/dashboard')
  }

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Cargando producto...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Barra superior fija */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ← Volver
          </button>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-gray-900">{nombre || 'Editar producto'}</span>
        </div>
        <div className="flex items-center gap-3">
          {mensaje && <span className="text-sm text-red-500">{mensaje}</span>}
          <button
            onClick={() => guardar('borrador')}
            disabled={guardando}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Guardar borrador
          </button>
          <button
            onClick={() => guardar('publicado')}
            disabled={guardando}
            className="px-4 py-2 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Publicar'}
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Sección 1 — Información básica */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">Información básica</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del producto <span className="text-red-400">*</span>
              </label>
              <input
                value={nombre}
                onChange={e => handleNombreChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL del producto</label>
              <p className="text-xs text-gray-400 mb-1">Se genera automáticamente a partir del nombre.</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-400">/portfolio-online/</span>
                <span className="text-sm text-gray-600">{slug || '—'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría <span className="text-red-400">*</span>
                </label>
                <select
                  value={categoriaId}
                  onChange={e => setCategoriaId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                <select
                  value={marca}
                  onChange={e => setMarca(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar marca</option>
                  <option value="Discomon IoT">Discomon IoT</option>
                  <option value="DOYS">DOYS</option>
                  <option value="City Hall App">City Hall App</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 2 — Texto principal */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Texto principal</h2>
          <p className="text-xs text-gray-400 mb-5">Lo primero que lee el visitante. Describe el problema que resuelve este producto, en lenguaje del cliente. Sin tecnicismos.</p>
          <textarea
            value={gancho}
            onChange={e => setGancho(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </section>

        {/* Sección 3 — Qué hace */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Qué hace</h2>
          <p className="text-xs text-gray-400 mb-5">4-5 puntos clave. Cada punto es una frase corta que explica una función del producto. Sin tecnicismos.</p>
          <div className="space-y-2">
            {queHace.map((punto, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-gray-300 text-sm w-4">{i + 1}.</span>
                <input
                  value={punto}
                  onChange={e => {
                    const nuevos = [...queHace]
                    nuevos[i] = e.target.value
                    setQueHace(nuevos)
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {queHace.length > 1 && (
                  <button
                    onClick={() => setQueHace(queHace.filter((_, j) => j !== i))}
                    className="text-gray-300 hover:text-red-400 text-lg leading-none"
                  >×</button>
                )}
              </div>
            ))}
            {queHace.length < 6 && (
              <button
                onClick={() => setQueHace([...queHace, ''])}
                className="text-sm text-green-700 hover:underline mt-1"
              >+ Añadir punto</button>
            )}
          </div>
        </section>

        {/* Sección 4 — Cómo funciona */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Cómo funciona</h2>
          <p className="text-xs text-gray-400 mb-5">Hasta 5 pasos. Cada paso tiene un título corto, una explicación y un icono. En la ficha solo se muestran los pasos que tengan título.</p>
          <div className="space-y-5">
            {pasos.map((paso, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Paso {i + 1}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      value={paso.titulo}
                      onChange={e => editarPaso(i, 'titulo', e.target.value)}
                      placeholder="ej: Detecta"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto</label>
                    <textarea
                      value={paso.texto}
                      onChange={e => editarPaso(i, 'texto', e.target.value)}
                      placeholder="ej: El sensor detecta si hay un coche en la plaza."
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                    <p className="text-xs text-gray-400 mb-1">Nombre de un icono Tabler (ej: ti-gauge). Catálogo en tabler.io/icons.</p>
                    <input
                      value={paso.icono}
                      onChange={e => editarPaso(i, 'icono', e.target.value)}
                      placeholder="ti-gauge"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección 4b — Variantes / Formatos */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Variantes / Formatos</h2>
          <p className="text-xs text-gray-400 mb-5">Formatos o modelos del producto (ej: tamaños, modelos). Cada uno con nombre y descripción. 📷 La galería de fotos de cada variante se gestionará más adelante.</p>
          <div className="space-y-3">
            {variantes.map((v, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Variante {i + 1}</h3>
                  <button
                    onClick={() => setVariantes(variantes.filter((_, j) => j !== i))}
                    className="text-gray-300 hover:text-red-400 text-sm"
                  >Quitar</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      value={v.nombre}
                      onChange={e => editarVariante(i, 'nombre', e.target.value)}
                      placeholder="ej: City Box Onroll"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      value={v.descripcion}
                      onChange={e => editarVariante(i, 'descripcion', e.target.value)}
                      placeholder="ej: Módulo cerrado individual para una bici o patinete."
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                  </div>
                  <p className="text-xs text-gray-300">
                    📷 Galería de esta variante: {(galeriasPorNombre[v.nombre.trim()]?.length ?? 0)} foto(s) — se gestionará en la fase de fotos.
                  </p>
                </div>
              </div>
            ))}
            <button
              onClick={() => setVariantes([...variantes, { nombre: '', descripcion: '' }])}
              className="text-sm text-green-700 hover:underline"
            >+ Añadir variante</button>
          </div>
        </section>

        {/* Sección 5 — Para quién es */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Para quién es</h2>
          <p className="text-xs text-gray-400 mb-5">Casos de uso concretos. Empieza cada línea con &quot;Municipios que...&quot; o &quot;Ayuntamientos que...&quot;</p>
          <textarea
            value={paraQuien}
            onChange={e => setParaQuien(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </section>

        {/* Sección 6 — Galería */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">Galería</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fotos <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <p className="text-xs text-gray-400 mb-3">Pega la URL de cada foto. Una por línea.</p>
              <div className="mb-3 flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-400">📁 Subir foto desde el ordenador</span>
                <span className="text-xs text-gray-300">— Pendiente de conexión con el servidor de Discomon</span>
              </div>
              <div className="space-y-2">
                {fotosUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={url}
                      onChange={e => {
                        const nuevas = [...fotosUrls]
                        nuevas[i] = e.target.value
                        setFotosUrls(nuevas)
                      }}
                      placeholder="https://..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {fotosUrls.length > 1 && (
                      <button onClick={() => setFotosUrls(fotosUrls.filter((_, j) => j !== i))}
                        className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setFotosUrls([...fotosUrls, ''])}
                  className="text-sm text-green-700 hover:underline">+ Añadir URL de foto</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vídeos <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">Pega la URL de YouTube o Vimeo. Una por línea.</p>
              <div className="space-y-2">
                {videosUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={url}
                      onChange={e => {
                        const nuevas = [...videosUrls]
                        nuevas[i] = e.target.value
                        setVideosUrls(nuevas)
                      }}
                      placeholder="https://youtube.com/..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {videosUrls.length > 1 && (
                      <button onClick={() => setVideosUrls(videosUrls.filter((_, j) => j !== i))}
                        className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setVideosUrls([...videosUrls, ''])}
                  className="text-sm text-green-700 hover:underline">+ Añadir vídeo</button>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 7 — Ficha técnica */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Ficha técnica</h2>
          <p className="text-xs text-gray-400 mb-5">Opcional — para el perfil técnico. Cada fila es un par bloque + detalle (ej: Material → Plástico reciclado). Aparece colapsada en el portfolio.</p>
          <div className="space-y-2">
            {fichaTecnica.map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <input
                  value={f.bloque}
                  onChange={e => editarFicha(i, 'bloque', e.target.value)}
                  placeholder="Bloque (ej: Material)"
                  className="w-2/5 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  value={f.detalle}
                  onChange={e => editarFicha(i, 'detalle', e.target.value)}
                  placeholder="Detalle (ej: Plástico reciclado)"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={() => setFichaTecnica(fichaTecnica.filter((_, j) => j !== i))}
                  className="text-gray-300 hover:text-red-400 text-lg leading-none pt-1.5"
                >×</button>
              </div>
            ))}
            <button
              onClick={() => setFichaTecnica([...fichaTecnica, { bloque: '', detalle: '' }])}
              className="text-sm text-green-700 hover:underline mt-1"
            >+ Añadir fila</button>
          </div>
        </section>

        {/* Sección 8 — CTA */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Llamada a la acción</h2>
          <p className="text-xs text-gray-400 mb-5">Selecciona uno o los dos botones que aparecerán al final de la ficha. Puedes editar el texto de cada botón.</p>
          <div className="space-y-4">
            <div className="space-y-2">
              {ctaOpciones.map((opcion, i) => (
                <div key={i} className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCta(opcion)}
                    className={`w-5 h-5 rounded border-2 flex-shrink-0 transition-colors flex items-center justify-center ${
                      ctaSeleccionados.includes(opcion)
                        ? 'bg-green-700 border-green-700'
                        : 'border-gray-300'
                    }`}
                  >
                    {ctaSeleccionados.includes(opcion) && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </button>
                  <input
                    value={opcion}
                    onChange={e => editarCta(i, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email de contacto</label>
              <p className="text-xs text-gray-400 mb-1">Las solicitudes de este producto irán a este correo.</p>
              <input
                type="email"
                value={ctaEmail}
                onChange={e => setCtaEmail(e.target.value)}
                placeholder="comercial@discomon.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </section>

        <div className="h-8" />
      </div>
    </div>
  )
}