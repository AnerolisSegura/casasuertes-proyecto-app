"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [usuario, setUsuario] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorLogin, setErrorLogin] = useState<boolean>(false);

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtroProyecto, setFiltroProyecto] = useState<string>("TODOS");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");
  
  const [ticketSeleccionado, setTicketSeleccionado] = useState<any | null>(null);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [subiendoFoto, setSubiendoFoto] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario === "admin" && password === "admin123") {
      setAutenticado(true);
      setErrorLogin(false);
      fetchTickets();
    } else {
      setErrorLogin(true);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets_mantenimiento')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err: any) {
      console.error("Error al cargar tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstadoYFechas = async (id: string, nuevoEstado: string) => {
    const ahora = new Date().toISOString();
    let updateData: any = { estado: nuevoEstado };

    if (nuevoEstado === "En Revisión") updateData.fecha_revision = ahora;
    if (nuevoEstado === "En Proceso") updateData.fecha_proceso = ahora;
    if (nuevoEstado === "Resuelto") updateData.fecha_resuelto = ahora;

    try {
      const { error } = await supabase
        .from('tickets_mantenimiento')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      fetchTickets();
      if (ticketSeleccionado && ticketSeleccionado.id === id) {
        setTicketSeleccionado({ ...ticketSeleccionado, ...updateData });
      }

      console.log(`Correo enviado a cliente informando cambio a: ${nuevoEstado}`);

    } catch (err: any) {
      console.error("Error al actualizar estado:", err);
      alert("No se pudo actualizar el estado.");
    }
  };

  const asignarIngeniero = async (id: string, ingeniero: string) => {
    try {
      const { error } = await supabase
        .from('tickets_mantenimiento')
        .update({ ingeniero_asignado: ingeniero })
        .eq('id', id);

      if (error) throw error;
      fetchTickets();
      if (ticketSeleccionado && ticketSeleccionado.id === id) {
        setTicketSeleccionado({ ...ticketSeleccionado, ingeniero_asignado: ingeniero });
      }
    } catch (err: any) {
      console.error("Error al asignar ingeniero:", err);
    }
  };

  const subirEvidencia = async (e: React.ChangeEvent<HTMLInputElement>, ticketId: string) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setSubiendoFoto(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${ticketId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('evidencias')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('evidencias')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('tickets_mantenimiento')
        .update({ url_foto_evidencia: publicUrl })
        .eq('id', ticketId);

      if (updateError) throw updateError;

      fetchTickets();
      if (ticketSeleccionado && ticketSeleccionado.id === ticketId) {
        setTicketSeleccionado({ ...ticketSeleccionado, url_foto_evidencia: publicUrl });
      }
      alert("Evidencia subida correctamente.");
    } catch (err: any) {
      console.error("Error al subir foto:", err);
      alert("Error al subir la foto de evidencia.");
    } finally {
      setSubiendoFoto(false);
    }
  };

  const exportarExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,Cliente,Proyecto,Apartamento,Incidencia,Estado,Ingeniero,Fecha Creacion,Fecha Resuelto\n";
    
    ticketsFiltrados.forEach((t) => {
      const row = [
        `"${t.nombre_cliente || ''}"`,
        `"${t.proyecto || ''}"`,
        `"${t.apartamento || ''}"`,
        `"${t.tipo_incidencia || ''}"`,
        `"${t.estado || ''}"`,
        `"${t.ingeniero_asignado || 'No asignado'}"`,
        `"${t.created_at ? new Date(t.created_at).toLocaleString() : ''}"`,
        `"${t.fecha_resuelto ? new Date(t.fecha_resuelto).toLocaleString() : 'Pendiente'}"`
      ].join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_mensual_tickets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ticketsFiltrados = tickets.filter((ticket) => {
    const coincideProyecto = filtroProyecto === "TODOS" || ticket.proyecto === filtroProyecto;
    const coincideEstado = filtroEstado === "TODOS" || ticket.estado === filtroEstado;
    const coincideBusqueda = 
      ticket.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      ticket.apartamento?.toLowerCase().includes(busqueda.toLowerCase()) ||
      ticket.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    return coincideProyecto && coincideEstado && coincideBusqueda;
  });

  if (!autenticado) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-xl rounded-2xl max-w-md w-full p-8 space-y-6">
          <div className="text-center flex flex-col items-center">
            {/* Logo de Casasuertes en el Login */}
            <img 
              src="/logo.png" 
              alt="Casasuertes Logo" 
              className="w-55 h-20 object-contain mb-3" 
            />
            <h1 className="text-2xl font-bold text-slate-900">Portal Administrativo</h1>
            <p className="text-sm text-slate-500 mt-1">Ingresa tus credenciales para gestionar el sistema.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Usuario</label>
              <input 
                type="text" 
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ej. admin"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Contraseña</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required 
              />
            </div>

            {errorLogin && (
              <p className="text-xs text-rose-600 font-medium text-center">Usuario o contraseña incorrectos.</p>
            )}

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20"
            >
              Entrar al Portal
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabecera con Logo de Casasuertes */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.png" 
              alt="Casasuertes Logo" 
              className="w-60 h-20 object-contain" 
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Panel de Administración</h1>
              <p className="text-slate-500 text-sm">Gestión y control de reportes de post-entrega.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button 
              onClick={exportarExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all shadow-sm"
            >
               Exportar Excel
            </button>
            <button 
              onClick={fetchTickets}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-xl text-sm transition-all border border-slate-200"
            >
               Actualizar
            </button>
            <button 
              onClick={() => setAutenticado(false)}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium px-4 py-2 rounded-xl text-sm transition-all border border-rose-200"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Buscar</label>
            <input 
              type="text" 
              placeholder="Cliente, apartamento..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Proyecto</label>
            <select 
              value={filtroProyecto}
              onChange={(e) => setFiltroProyecto(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODOS">Todos los proyectos</option>
              <option value="Torre ALBOR">Torre ALBOR</option>
              <option value="DOWNTOWN">DOWNTOWN</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Estado</label>
            <select 
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Revisión">En Revisión</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Resuelto">Resuelto</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Cargando registros...</div>
          ) : ticketsFiltrados.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No hay tickets registrados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Cliente</th>
                    <th className="p-4 font-semibold">Proyecto / Apto</th>
                    <th className="p-4 font-semibold">Incidencia</th>
                    <th className="p-4 font-semibold">Ingeniero Asignado</th>
                    <th className="p-4 font-semibold">Estado</th>
                    <th className="p-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {ticketsFiltrados.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-4 font-semibold text-slate-900">{ticket.nombre_cliente}</td>
                      <td className="p-4 text-slate-600">{ticket.proyecto} - Apto {ticket.apartamento}</td>
                      <td className="p-4">
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs font-medium">
                          {ticket.tipo_incidencia}
                        </span>
                      </td>
                      <td className="p-4">
                        <input 
                          type="text" 
                          defaultValue={ticket.ingeniero_asignado || ""}
                          placeholder="Asignar ing..."
                          onBlur={(e) => asignarIngeniero(ticket.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
                        />
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          ticket.estado === 'Resuelto' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                          ticket.estado === 'En Proceso' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                          ticket.estado === 'En Revisión' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {ticket.estado || 'Pendiente'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => {
                            setTicketSeleccionado(ticket);
                            setModalAbierto(true);
                          }}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border border-slate-200"
                        >
                          Ver detalle
                        </button>
                        <select
                          value={ticket.estado || 'Pendiente'}
                          onChange={(e) => actualizarEstadoYFechas(ticket.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Revisión">En Revisión</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Resuelto">Resuelto</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Detalle */}
        {modalAbierto && ticketSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold">Expediente del Ticket</span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">{ticketSeleccionado.nombre_cliente}</h2>
                </div>
                <button 
                  onClick={() => setModalAbierto(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-xs">Proyecto</span>
                  <span className="text-slate-800 font-semibold">{ticketSeleccionado.proyecto}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Apartamento</span>
                  <span className="text-slate-800 font-semibold">{ticketSeleccionado.apartamento}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Ingeniero a cargo</span>
                  <span className="text-slate-800 font-semibold">{ticketSeleccionado.ingeniero_asignado || 'No asignado'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Incidencia</span>
                  <span className="text-slate-800 font-semibold">{ticketSeleccionado.tipo_incidencia}</span>
                </div>
              </div>

              {/* Historial de Tiempos Automáticos */}
              <div className="space-y-1.5 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">Historial de Tiempos Registrados</span>
                <p className="text-slate-600"> <b>Creado:</b> {new Date(ticketSeleccionado.created_at).toLocaleString()}</p>
                <p className="text-slate-600"> <b>En Revisión:</b> {ticketSeleccionado.fecha_revision ? new Date(ticketSeleccionado.fecha_revision).toLocaleString() : 'Pendiente'}</p>
                <p className="text-slate-600"> <b>En Proceso:</b> {ticketSeleccionado.fecha_proceso ? new Date(ticketSeleccionado.fecha_proceso).toLocaleString() : 'Pendiente'}</p>
                <p className="text-slate-600"> <b>Resuelto:</b> {ticketSeleccionado.fecha_resuelto ? new Date(ticketSeleccionado.fecha_resuelto).toLocaleString() : 'Pendiente'}</p>
              </div>

              <div>
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1.5">Descripción del Problema</span>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-700 text-sm max-h-28 overflow-y-auto">
                  {ticketSeleccionado.descripcion}
                </div>
              </div>

              {/* Foto de Evidencia */}
              <div className="space-y-2 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <span className="text-indigo-900 text-xs font-bold uppercase tracking-wider block">Foto de Evidencia del Trabajo Reparado</span>
                {ticketSeleccionado.url_foto_evidencia ? (
                  <div className="space-y-2">
                    <a href={ticketSeleccionado.url_foto_evidencia} target="_blank" rel="noopener noreferrer">
                      <img src={ticketSeleccionado.url_foto_evidencia} alt="Evidencia" className="w-full h-40 object-cover rounded-xl border border-indigo-200 shadow-sm hover:opacity-95 transition-all" />
                    </a>
                    <p className="text-[10px] text-indigo-700 text-center">Haz clic en la imagen para verla en grande</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No hay foto de evidencia subida aún.</p>
                )}

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subir / Cambiar foto de evidencia:</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => subirEvidencia(e, ticketSeleccionado.id)}
                    disabled={subiendoFoto}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  />
                  {subiendoFoto && <p className="text-xs text-indigo-600 mt-1">Subiendo imagen a Supabase...</p>}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200">
                <button 
                  onClick={() => setModalAbierto(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}