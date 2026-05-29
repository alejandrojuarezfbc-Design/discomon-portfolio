'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

type Categoria = {
  id: string
  nombre: string
  slug: string
  orden: number
}

type Producto = {
  id: string
  nombre: string
  estado: string
  categoria_id: string
}

export default function DashboardPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    const { data: cats } = await supabase
      .from('categorias')
      .select('*')
      .order('orden')

    const { data: prods } = await supabase
      .from('productos')
      .select('id, nombre, estado, categoria_id')

    if (cats) {
      setCategorias(cats)
      setCategoriaActiva(cats[0]?.id || null)
    }
    if (prods) setProductos(prods)
    setLoading(false)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  async function eliminarProducto(id: string, nombre: string) {
    if (!confirm(`¿Seguro que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return
    await supabase.from('productos').delete().eq('id', id)
    setProductos(productos.filter(p => p.id !== id))
  }

  const productosDeCategoría = productos.filter(p => p.categoria_id === categoriaActiva)
  const categoriaActivaNombre = categorias.find(c => c.id === categoriaActiva)?.nombre

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-400">Cargando panel...</p>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Barra superior */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-700 rounded-md flex items-center justify-center">
            <span className="text-white text-sm font-bold">D</span>
          </div>
          <span className="font-semibold text-gray-900">Discomon</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500 text-sm">Panel de administración</span>
        </div>
        <button
          onClick={cerrarSesion}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          Cerrar sesión →
        </button>
      </header>

      <div className="flex flex-1">

        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categorías</p>
          </div>
          <nav className="flex-1 p-2">
            {categorias.map(cat => {
              const total = productos.filter(p => p.categoria_id === cat.id).length
              const activa = categoriaActiva === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 flex items-center justify-between transition-colors ${
                    activa
                      ? 'bg-green-50 text-green-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm">{cat.nombre}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {total}
                  </span>
                </button>
              )
            })}
          </nav>
          <div className="p-3 border-t border-gray-100">
            <button className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 text-left">
              + Gestionar categorías
            </button>
          </div>
        </aside>

        {/* Área principal */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl">

            {/* Cabecera del área */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{categoriaActivaNombre}</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  {productosDeCategoría.length} {productosDeCategoría.length === 1 ? 'producto' : 'productos'}
                </p>
              </div>
              <button
                onClick={() => router.push(`/admin/productos/nuevo?categoria=${categoriaActiva}`)}
                className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors flex items-center gap-2"
              >
                + Añadir producto
              </button>
            </div>

            {/* Lista de productos */}
            {productosDeCategoría.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center">
                <p className="text-gray-400 text-sm">No hay productos en esta categoría todavía</p>
                <button
                  onClick={() => router.push(`/admin/productos/nuevo?categoria=${categoriaActiva}`)}
                  className="mt-3 text-green-700 text-sm font-medium hover:underline"
                >
                  Añadir el primero →
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {productosDeCategoría.map((producto, index) => (
                  <div
                    key={producto.id}
                    className={`flex items-center justify-between px-5 py-4 ${
                      index < productosDeCategoría.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        producto.estado === 'publicado' ? 'bg-green-400' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">{producto.nombre}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        producto.estado === 'publicado'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {producto.estado === 'publicado' ? 'Publicado' : 'Borrador'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/productos/${producto.id}`)}
                        className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarProducto(producto.id, producto.nombre)}
                        className="text-sm text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </main>

      </div>
    </div>
  )
}