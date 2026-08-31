"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PortalClientePage() {
  const [documentoBusqueda, setDocumentoBusqueda] = useState("");
  const [ticketsCliente, setTicketsCliente] = useState<any[]>([]);
  const [buscado, setBuscado] = useState(false);
  const [loading, setLoading] = useState(false);

  const consultarTickets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentoBusqueda.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tickets_mantenimiento")
        .select("*")
        .eq("documento_cliente", documentoBusqueda.trim())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTicketsCliente(data || []);
      setBuscado(true);
    } catch (err) {
      console.error(err);
      alert("Error al consultar los reportes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Cabecera */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="Casasuertes Logo" 
            className="w-48 h-20 object-contain mb-3" 
          />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Portal de Consulta Ciudadana / Propietarios</h1>
          <p className="text-slate-500 text-sm mt-1">Ingresa tu número de documento o cédula para consultar el estado de tus reportes.</p>
        </div>

        {/* Buscador por Documento */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <form onSubmit={consultarTickets} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Cédula / Documento de Identidad</label>
              <input 
                type="text" 
                value={documentoBusqueda}
                onChange={(e) => setDocumentoBusqueda(e.target.value)}
                placeholder="Ej. 001-0000000-1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
              >
                {loading ? "Buscando..." : "Consultar Mis Reportes"}
              </button>
            </div>
          </form>
        </div>

        {/* Resultados */}
        {buscado && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 px-1">
              Resultados para el documento: <span className="text-indigo-600">{documentoBusqueda}</span>
            </h2>

            {ticketsCliente.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 shadow-sm">
                No se encontraron reportes asociados a este documento de identidad.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {ticketsCliente.map((ticket) => (
                  <div key={ticket.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-100 pb-4">
                      <div>
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs font-medium">
                          {ticket.tipo_incidencia}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-2">{ticket.proyecto} — Apto {ticket.apartamento}</h3>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        ticket.estado === 'Resuelto' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                        ticket.estado === 'En Proceso' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                        ticket.estado === 'En Revisión' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {ticket.estado || 'Pendiente'}
                      </span>
                    </div>

                    <div className="text-sm text-slate-600 space-y-1">
                      <p><b>Reportado por:</b> {ticket.nombre_cliente}</p>
                      <p><b>Descripción:</b> {ticket.descripcion}</p>
                      <p className="text-xs text-slate-400 pt-1"><b>Fecha de creación:</b> {new Date(ticket.created_at).toLocaleString()}</p>
                    </div>

                    {/* Evidencia fotográfica si el administrador ya la subió */}
                    {ticket.url_foto_evidencia && (
                      <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-2">
                        <span className="text-emerald-900 text-xs font-bold uppercase tracking-wider block">Evidencia del Trabajo Realizado</span>
                        <a href={ticket.url_foto_evidencia} target="_blank" rel="noopener noreferrer">
                          <img src={ticket.url_foto_evidencia} alt="Evidencia de reparación" className="w-full h-36 object-cover rounded-xl border border-emerald-200 shadow-sm" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}