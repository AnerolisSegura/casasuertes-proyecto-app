'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    proyecto: 'Torre ALBOR',
    apartamento: '',
    tipo_incidencia: 'Plomería / Filtración',
    descripcion: '',
  })

  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMensaje(null)

    try {
      const { data, error } = await supabase
        .from('tickets_mantenimiento')
        .insert([formData])

      if (error) throw error

      setMensaje({ tipo: 'exito', texto: '¡Ticket enviado con éxito! Su solicitud está en estado de revisión.' })
      
      setFormData({
        nombre_cliente: '',
        proyecto: 'Torre ALBOR',
        apartamento: '',
        tipo_incidencia: 'Plomería / Filtración',
        descripcion: '',
      })
    } catch (err: any) {
      setMensaje({ tipo: 'error', texto: `Error al enviar el ticket: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        {/* Encabezado */}
        <div className="border-b border-gray-200 pb-5 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            CASASUERTES - Portal de Mantenimiento
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Reporte de incidencias y asistencia técnica post-entrega.
          </p>
        </div>

        {/* Notificación Alerta */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-md text-sm font-medium ${
            mensaje.tipo === 'exito' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input
              type="text"
              name="nombre_cliente"
              value={formData.nombre_cliente}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Proyecto Inmobiliario</label>
            <select
              name="proyecto"
              value={formData.proyecto}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Torre ALBOR">Torre ALBOR</option>
              <option value="Casa Golf 324">Casa Golf 324</option>
              <option value="MARINA 73">MARINA 73</option>
              <option value="VIP AILA">VIP AILA</option>
              <option value="DOWNTOWN">DOWNTOWN</option>
              <option value="Vista Marina">Vista Marina</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Apartamento/Villa</label>
              <input
                type="text"
                name="apartamento"
                value={formData.apartamento}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ej. 402"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Incidencia</label>
              <select
                name="tipo_incidencia"
                value={formData.tipo_incidencia}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Plomería / Filtración">Plomería / Filtración</option>
                <option value="Eléctrico">Eléctrico</option>
                <option value="Pintura / Acabados">Pintura / Acabados</option>
                <option value="Cerrajería / Puertas">Cerrajería / Puertas</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción detallada del problema</label>
            <textarea
              rows={4}
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 bg-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Describa brevemente la falla encontrada..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Reporte de Ticket'}
          </button>
        </form>
      </div>
    </main>
  )
}