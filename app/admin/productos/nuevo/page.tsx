'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

type Categoria = {
  id: string
  nombre: string
}

export default function NuevoProductoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const categoriaInicial = searchParams.get('categoria') || ''

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const [nombre, setNombre] = useState('')
  const [slug, setSlug] = useState('')
  const [categoriaId, setCategoriaId] = useState(categoriaInicial)
  const [marca, setMarca] = useState('')
  const [gancho, setGancho] = useState('')
  const [queHace, setQueHace] = useState(['', '', '', ''])
  const [comoFunciona, setComoFunciona] = useState('')
  const [paraQuien, setParaQuien] = useState('')
  const [fotosUrls, setFotosUrls] = useState([''])
  const [videosUrls, setVideosUrls] = useState([''])
  const [fichaTecnica, setFichaTecnica] = useState('')
  const [fichaAbierta, setFichaAbierta] = useState(false)
  const [ctaOpciones, setCtaOpciones] = useState(['Solicitar información', 'Pedir una demo'])
  const [ctaSeleccionados, setCtaSeleccionados] = useState<string[]>(['Solicitar información'])
  const [ctaEmail, setCtaEmail] = useState('')

  useEffect(() => {
    supabase.from('categorias').select('id, nombre').order('orden')
      .then(({ data }) => { if (data) setCategorias(data) })
  }, [])

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

  async function guardar(estado: 'borrador' | 'publicado') {
    if (!nombre) { setMensaje('El nombre es obligatorio'); return }
    if (!categoriaId) { setMensaje('Selecciona una categoría'); return }

    setGuardando(true)
    setMensaje('')

    const { error } = await supabase.from('productos').insert({
      nombre,
      slug: slug || generarSlug(nombre),
      categoria_id: categoriaId,
      marca,
      orden: 0,
      estado,
      gancho,
      que_hace: queHace.filter(p => p.trim() !== '').map(texto => ({ texto })),
      como_funciona: comoFunciona,
      para_quien: paraQuien,
      fotos_urls: fotosUrls.filter(u => u.trim() !== ''),
      videos_urls: videosUrls.filter(u => u.trim() !== ''),
      ficha_tecnica: fichaTecnica,
      cta_texto: ctaSeleccionados.join('|'),
      cta_email: ctaEmail,
    })

    if (error) {
      setMensaje('Error al guardar: ' + error.message)
      setGuardando(false)
      return
    }

    router.push('/admin/dashboard')
  }

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
          <span className="font-medium text-gray-900">
            {nombre || 'Nuevo producto'}
          </span>
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
                placeholder="ej: Smart Parking"
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
            placeholder="ej: Los ciudadanos pierden tiempo buscando aparcamiento. Tu municipio puede solucionar eso."
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
                  placeholder="ej: Detecta plazas libres en tiempo real"
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
              >
                + Añadir punto
              </button>
            )}
          </div>
        </section>

        {/* Sección 4 — Cómo funciona */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Cómo funciona</h2>
          <p className="text-xs text-gray-400 mb-5">Explica el funcionamiento paso a paso, de forma simple. El visitante debe entenderlo sin conocimientos técnicos.</p>
          <textarea
            value={comoFunciona}
            onChange={e => setComoFunciona(e.target.value)}
            placeholder="ej: 1. El sensor detecta si hay un coche. 2. La app muestra las plazas libres en el mapa. 3. El conductor va directo a la plaza disponible."
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </section>

        {/* Sección 5 — Para quién es */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Para quién es</h2>
          <p className="text-xs text-gray-400 mb-5">Casos de uso concretos. Empieza cada línea con "Municipios que..." o "Ayuntamientos que..."</p>
          <textarea
            value={paraQuien}
            onChange={e => setParaQuien(e.target.value)}
            placeholder="ej: Municipios con zonas de aparcamiento saturadas. Ayuntamientos que quieren reducir el tráfico en el centro."
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

              {/* Botón subir foto — pendiente de conexión con servidor Discomon */}
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
                      <button
                        onClick={() => setFotosUrls(fotosUrls.filter((_, j) => j !== i))}
                        className="text-gray-300 hover:text-red-400 text-lg leading-none"
                      >×</button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setFotosUrls([...fotosUrls, ''])}
                  className="text-sm text-green-700 hover:underline"
                >+ Añadir URL de foto</button>
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
                      <button
                        onClick={() => setVideosUrls(videosUrls.filter((_, j) => j !== i))}
                        className="text-gray-300 hover:text-red-400 text-lg leading-none"
                      >×</button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setVideosUrls([...videosUrls, ''])}
                  className="text-sm text-green-700 hover:underline"
                >+ Añadir vídeo</button>
              </div>
            </div>
          </div>
        </section>

        {/* Sección 7 — Ficha técnica */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setFichaAbierta(!fichaAbierta)}
            className="w-full px-6 py-4 flex items-center justify-between text-left"
          >
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Ficha técnica</h2>
              <p className="text-xs text-gray-400 mt-0.5">Opcional — solo para el perfil técnico. Aparece colapsada en el portfolio.</p>
            </div>
            <span className="text-gray-400">{fichaAbierta ? '▲' : '▼'}</span>
          </button>
          {fichaAbierta && (
            <div className="px-6 pb-6">
              <textarea
                value={fichaTecnica}
                onChange={e => setFichaTecnica(e.target.value)}
                placeholder="Especificaciones técnicas, materiales, certificaciones, dimensiones..."
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
          )}
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