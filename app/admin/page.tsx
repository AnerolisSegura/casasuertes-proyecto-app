'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Ticket {
  id: string
  nombre_cliente: string
  proyecto: string
  apartamento: string
  tipo_incidencia: string
  descripcion: string
  estado: string
  created_at: string
}

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  // Cargar los tickets desde la base de datos de Supabase
  const fetchTickets = async () => {
    setLoading(true)
    setErrorMensaje(null)
    try {
      const { data, error } = await supabase
        .from('tickets_mantenimiento')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTickets(data || [])
    } catch (err: any) {
      setErrorMensaje(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Actualizar el estado de un ticket (PATCH/PUT)
  const handleEstadoChange = async (id: string, nuevoEstado: string) => {
    try {
      const { error } = await supabase
        .from('tickets_mantenimiento')
        .update({ estado: nuevoEstado })
        .eq('id', id)

      if (error) throw error

      // Actualizar el estado en la interfaz localmente
      setTickets(prev =>
        prev.map(t => (t.id === id ? { ...t, estado: nuevoEstado } : t))
      )
    } catch (err: any) {
      alert(`Error al actualizar estado: ${err.message}`)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  return (
    <main className="min-h-screen bg-gray-100 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Control - Mantenimiento
            </h1>
            <p className="text-gray-600 mt-1">
              Vista exclusiva para Administración e Ingenieros de Obra (CASASUERTES)
            </p>
          </div>
          <button
            onClick={fetchTickets}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            🔄 Actualizar Datos
          </button>
        </div>

        {/* Notificación de Error */}
        {errorMensaje && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-md">
            Error al cargar tickets: {errorMensaje}
          </div>
        )}

        {/* Contenido / Tabla */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-medium">
            Cargando tickets de mantenimiento...
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white p-8 rounded-lg text-center shadow text-gray-500">
            No hay reportes registrados en la base de datos.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Proyecto / Apto</th>
                  <th className="px-6 py-4">Tipo Incidencia</th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4">Estado / Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString('es-DO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {ticket.nombre_cliente}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className="font-semibold">{ticket.proyecto}</span>
                      <br />
                      <span className="text-xs text-gray-500">Unidad: {ticket.apartamento}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {ticket.tipo_incidencia}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {ticket.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={ticket.estado}
                        onChange={(e) => handleEstadoChange(ticket.id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border outline-none cursor-pointer ${
                          ticket.estado === 'Pendiente'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : ticket.estado === 'En Proceso'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-green-100 text-green-800 border-green-300'
                        }`}
                      >
                        <option value="Pendiente" className="bg-white text-gray-900">🟡 Pendiente</option>
                        <option value="En Proceso" className="bg-white text-gray-900">🔵 En Proceso</option>
                        <option value="Completado" className="bg-white text-gray-900">🟢 Completado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}