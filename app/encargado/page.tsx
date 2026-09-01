"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function IngenieroPortalPage() {
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [nombreIngeniero, setNombreIngeniero] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorLogin, setErrorLogin] = useState<boolean>(false);

  const [ticketsAsignados, setTicketsAsignados] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [subiendoFotoId, setSubiendoFotoId] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombreIngeniero.trim() !== "" && password === "ing123") {
      setAutenticado(true);
      setErrorLogin(false);
      fetchTicketsIngeniero(nombreIngeniero.trim());
    } else {
      setErrorLogin(true);
    }
  };

  const fetchTicketsIngeniero = async (nombre: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets_mantenimiento')
        .select('*')
        .ilike('encargado_asignado', `%${nombre}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTicketsAsignados(data || []);
    } catch (err) {
      console.error("Error al cargar tickets asignados:", err);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstadoTicket = async (id: string, nuevoEstado: string) => {
    const ahora = new Date().toISOString();
    let updateData: any = { estado: nuevoEstado };

    if (nuevoEstado === "En Proceso") updateData.fecha_proceso = ahora;
    if (nuevoEstado === "Completado") updateData.fecha_completado = ahora;

    try {
      const { error } = await supabase.from('tickets_mantenimiento').update(updateData).eq('id', id);
      if (error) throw error;

      alert("Estado actualizado correctamente.");
      fetchTicketsIngeniero(nombreIngeniero);
    } catch (err) {
      console.error("Error al actualizar estado:", err);
      alert("No se pudo actualizar el estado.");
    }
  };

  const subirEvidenciaIngeniero = async (e: React.ChangeEvent<HTMLInputElement>, ticketId: string) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setSubiendoFotoId(ticketId);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${ticketId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('evidencias').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('evidencias').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('tickets_mantenimiento').update({ url_foto_evidencia: publicUrl }).eq('id', ticketId);
      if (updateError) throw updateError;

      alert("Evidencia fotográfica subida con éxito.");
      fetchTicketsIngeniero(nombreIngeniero);
    } catch (err) {
      console.error("Error al subir evidencia:", err);
      alert("Error al cargar la foto.");
    } finally {
      setSubiendoFotoId(null);
    }
  };

  if (!autenticado) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-xl rounded-2xl max-w-md w-full p-8 space-y-6">
          <div className="text-center flex flex-col items-center">
            <h1 className="text-2xl font-bold text-slate-900">Portal de Ingenieros y Contratistas</h1>
            <p className="text-sm text-slate-500 mt-1">Casasuertes S.A.S. - Acceso Restringido de Campo</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Tu Nombre Registrado como Encargado</label>
              <input 
                type="text" 
                value={nombreIngeniero}
                onChange={(e) => setNombreIngeniero(e.target.value)}
                placeholder="Ej. Ing. Carlos Pérez"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Contraseña de Acceso</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required 
              />
            </div>
            {errorLogin && <p className="text-xs text-rose-600 font-medium text-center">Nombre o contraseña inválidos.</p>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md">
              Ingresar a Mis Asignaciones
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Portal Técnico de Campo</span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bienvenido, {nombreIngeniero}</h1>
            <p className="text-slate-500 text-sm">Gestiona tus reportes asignados, actualiza estados y sube evidencias fotográficas.</p>
          </div>
          <button 
            onClick={() => setAutenticado(false)} 
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium px-4 py-2 rounded-xl text-xs border border-rose-200"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">Tickets Asignados a tu Cargo</h3>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Cargando tus asignaciones...</div>
          ) : ticketsAsignados.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No tienes tickets asignados en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {ticketsAsignados.map((ticket) => (
                <div key={ticket.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-md">
                        #{ticket.id.slice(0, 8)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {ticket.proyecto} {ticket.torre_bloque ? `- Torre/Bloque ${ticket.torre_bloque}` : ''} - {ticket.ubicacion === 'Apartamento' ? `Apto ${ticket.apartamento}` : `Área Común: ${ticket.area_comun}`}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base">{ticket.nombre_cliente}</h4>
                    <p className="text-xs text-indigo-700 font-medium">Incidencia: {ticket.tipo_incidencia}</p>
                    <p className="text-xs text-slate-600 max-w-lg mt-1 bg-white p-2.5 rounded-xl border border-slate-200">
                      {ticket.descripcion}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Estado:</span>
                      <select
                        value={ticket.estado || 'Abierto'}
                        onChange={(e) => actualizarEstadoTicket(ticket.id, e.target.value)}
                        className="bg-white border border-slate-300 text-xs rounded-xl px-3 py-1.5 font-semibold text-slate-800 shadow-sm focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Abierto">Abierto</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Completado">Completado</option>
                      </select>
                    </div>

                    <div className="w-full md:w-auto">
                      {ticket.url_foto_evidencia ? (
                        <div className="flex items-center gap-2">
                          <a href={ticket.url_foto_evidencia} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 underline font-medium">
                            Ver foto actual
                          </a>
                          <span className="text-slate-300">|</span>
                          <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1 rounded-xl text-xs font-medium">
                            {subiendoFotoId === ticket.id ? 'Subiendo...' : 'Cambiar Foto'}
                            <input type="file" accept="image/*" onChange={(e) => subirEvidenciaIngeniero(e, ticket.id)} className="hidden" />
                          </label>
                        </div>
                      ) : (
                        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm block text-center">
                          {subiendoFotoId === ticket.id ? 'Subiendo evidencia...' : '📸 Subir Foto de Evidencia'}
                          <input type="file" accept="image/*" onChange={(e) => subirEvidenciaIngeniero(e, ticket.id)} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}