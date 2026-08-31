'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// Asegúrate de importar correctamente tu cliente de Supabase
import { supabase } from '@/lib/supabase';

export default function MantenimientoPage() {
  const [nombre, setNombre] = useState('');
  const [proyecto, setProyecto] = useState('Torre ALBOR');
  const [apartamento, setApartamento] = useState('');
  const [tipoIncidencia, setTipoIncidencia] = useState('Cerrajería / Puertas');
  const [descripcion, setDescripcion] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setMensajeExito(false);

    try {
      const { error } = await supabase.from('mantenimiento').insert([
        {
          nombre_cliente: nombre,
          proyecto: proyecto,
          apartamento: apartamento,
          tipo_incidencia: tipoIncidencia,
          descripcion: descripcion,
          estado: 'Pendiente',
        },
      ]);

      if (error) throw error;

      setMensajeExito(true);
      setNombre('');
      setApartamento('');
      setDescripcion('');
    } catch (err) {
      console.error('Error al enviar el reporte:', err);
      alert('Hubo un error al enviar la solicitud. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-between p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center my-auto">
        <div className="mb-4">
          <Image 
            src="/logo.png" 
            alt="Logo Casasuertes" 
            width={160} 
            height={45} 
            className="object-contain h-12 w-auto mx-auto mb-2"
            priority
          />
        </div>

        <h1 className="text-xl font-extrabold text-slate-900 mb-1 text-center">Módulo de Mantenimiento</h1>
        <p className="text-slate-500 text-xs mb-6 text-center">Reporta cualquier incidencia de tu unidad inmobiliaria.</p>
        
        {mensajeExito && (
          <div className="w-full p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium text-center">
            ¡Reporte enviado con éxito! Los ingenieros lo revisarán pronto.
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              placeholder="Ej. Carlos Pérez" 
              required 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Proyecto</label>
            <select 
              value={proyecto} 
              onChange={(e) => setProyecto(e.target.value)} 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="Torre ALBOR">Torre ALBOR</option>
              <option value="DOWNTOWN">DOWNTOWN</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Número de Apartamento / Unidad</label>
            <input 
              type="text" 
              value={apartamento} 
              onChange={(e) => setApartamento(e.target.value)} 
              placeholder="Ej. 102" 
              required 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Incidencia</label>
            <select 
              value={tipoIncidencia} 
              onChange={(e) => setTipoIncidencia(e.target.value)} 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="Cerrajería / Puertas">Cerrajería / Puertas</option>
              <option value="Plomería / Filtración">Plomería / Filtración</option>
              <option value="Electricidad">Electricidad</option>
              <option value="Acabados">Acabados</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción del Problema</label>
            <textarea 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
              placeholder="Detalla los detalles del daño..." 
              rows={3}
              required 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={enviando}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-sm hover:bg-blue-700 transition text-sm mt-2 disabled:opacity-50"
          >
            {enviando ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 w-full text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-blue-600 transition font-medium">
            ← Volver al Portal Principal
          </Link>
        </div>
      </div>
    </main>
  );
}