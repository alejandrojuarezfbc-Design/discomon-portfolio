export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Discomon — Panel de administración</h1>
        <button className="text-sm text-gray-500 hover:text-gray-700">
          Cerrar sesión
        </button>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <p className="text-gray-500">Dashboard cargando...</p>
      </div>
    </div>
  )
}