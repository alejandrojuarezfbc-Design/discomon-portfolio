'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

type Categoria = {
  id: string
  nombre: string
  descripcion: string
  orden: number
}

export default function CategoriasPage() {
  const router = useRouter()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [cargando, setCargando] = useState(true)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaDescripcion, setNuevaDescripcion] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editandoNombre, setEditandoNombre] = useState('')
  const [editandoDescripcion, setEditandoDescripcion] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => { cargar() }, [])

  async function cargar() {
    const { data } = await supabase.from('categorias').select('*').order('orden')
    if (data) setCategorias(data)
    setCargando(false)
  }

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

  async function crearCategoria() {
    if (!nuevoNombre.trim()) { setMensaje('El nombre es obligatorio'); return }
    setGuardando(true)
    const { error } = await supabase.from('categorias').insert({
      nombre: nuevoNombre.trim(),
      slug: generarSlug(nuevoNombre),
      descripcion: nuevaDescripcion.trim(),
      orden: categorias.length + 1,
    })
    if (error) { setMensaje('Error: ' + error.message); setGuardando(false); return }
    setNuevoNombre('')
    setNuevaDescripcion('')
    setMensaje('Categoría creada correctamente')
    setGuardando(false)
    cargar()
  }

  async function guardarEdicion(id: string) {
    if (!editandoNombre.trim()) return
    const { error } = await supabase.from('categorias').update({
      nombre: editandoNombre.trim(),
      slug: generarSlug(editandoNombre),
      descripcion: editandoDescripcion.trim(),
    }).eq('id', id)
    if (error) { setMensaje('Error: ' + error.message); return }
    setEditandoId(null)
    setMensaje('Categoría actualizada correctamente')
    cargar()
  }

  async function eliminarCategoria(id: string, nombre: string) {
    if (!confirm(`¿Seguro que quieres eliminar "${nombre}"? Los productos de esta categoría quedarán sin categoría asignada.`)) return
    await supabase.from('categorias').delete().eq('id', id)
    setMensaje('Categoría eliminada')
    cargar()
  }

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Cargando categorías...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Barra superior */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ← Volver al dashboard
          </button>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-gray-900">Gestionar categorías</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {mensaje && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
            {mensaje}
          </div>
        )}

        {/* Crear nueva categoría */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">Nueva categoría</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-400">*</span></label>
              <input
                value={nuevoNombre}
                onChange={e => setNuevoNombre(e.target.value)}
                placeholder="ej: Seguridad municipal"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input
                value={nuevaDescripcion}
                onChange={e => setNuevaDescripcion(e.target.value)}
                placeholder="ej: Soluciones para mejorar la seguridad del municipio"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={crearCategoria}
              disabled={guardando}
              className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-50"
            >
              {guardando ? 'Creando...' : '+ Crear categoría'}
            </button>
          </div>
        </section>

        {/* Lista de categorías */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Categorías actuales — {categorias.length}
            </h2>
          </div>
          {categorias.map((cat, index) => (
            <div
              key={cat.id}
              className={`px-6 py-4 ${index < categorias.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              {editandoId === cat.id ? (
                <div className="space-y-2">
                  <input
                    value={editandoNombre}
                    onChange={e => setEditandoNombre(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    value={editandoDescripcion}
                    onChange={e => setEditandoDescripcion(e.target.value)}
                    placeholder="Descripción (opcional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => guardarEdicion(cat.id)}
                      className="px-3 py-1.5 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cat.nombre}</p>
                    {cat.descripcion && (
                      <p className="text-xs text-gray-400 mt-0.5">{cat.descripcion}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditandoId(cat.id)
                        setEditandoNombre(cat.nombre)
                        setEditandoDescripcion(cat.descripcion || '')
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarCategoria(cat.id, cat.nombre)}
                      className="text-sm text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

      </div>
    </div>
  )
}