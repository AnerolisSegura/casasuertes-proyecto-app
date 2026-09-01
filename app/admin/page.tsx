"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import DashboardMetricas from "@/app/components/DashboardMetricas";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LISTA_SERVICIOS = [
  "Piscinas",
  "Sistemas de riego",
  "Electricidad",
  "Pintura",
  "Plomería",
  "Cerrajería",
  "Aires acondicionados",
  "Albañilería e Impermeabilización",
  "Otro"
];

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [usuario, setUsuario] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorLogin, setErrorLogin] = useState<boolean>(false);

  const [vistaActual, setVistaActual] = useState<"tickets" | "dashboard" | "encargados" | "auditoria">("tickets");
  const [tickets, setTickets] = useState<any[]>([]);
  const [encargados, setEncargados] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados para nuevo encargado
  const [nuevoNombre, setNuevoNombre] = useState<string>("");
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState<string>("Electricidad");
  const [nuevoTelefono, setNuevoTelefono] = useState<string>("");
  const [nuevoCorreo, setNuevoCorreo] = useState<string>("");

  const [filtroProyecto, setFiltroProyecto] = useState<string>("TODOS");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [filtroIncidencia, setFiltroIncidencia] = useState<string>("TODOS");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");
  
  const [ticketSeleccionado, setTicketSeleccionado] = useState<any | null>(null);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [subiendoFoto, setSubiendoFoto] = useState<boolean>(false);

  // Selección múltiple para acciones masivas
  const [ticketsSeleccionadosIds, setTicketsSeleccionadosIds] = useState<string[]>([]);
  const [encargadoMasivo, setEncargadoMasivo] = useState<string>("");
  const [estadoMasivo, setEstadoMasivo] = useState<string>("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuario === "admin" && password === "admin123") {
      setAutenticado(true);
      setErrorLogin(false);
      fetchData();
    } else {
      setErrorLogin(true);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTickets, resEncargados, resLogs] = await Promise.all([
        supabase.from('tickets_mantenimiento').select('*').order('created_at', { ascending: false }),
        supabase.from('encargados').select('*').order('nombre', { ascending: true }),
        supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (resTickets.error) throw resTickets.error;
      setTickets(resTickets.data || []);
      setEncargados(resEncargados.data || []);
      setLogs(resLogs.data || []);
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const registrarLog = async (accion: string, detalles: string) => {
    try {
      await supabase.from('admin_logs').insert([{ admin_usuario: usuario, accion, detalles }]);
    } catch (err) {
      console.error("Error al registrar auditoría:", err);
    }
  };

  const enviarNotificacionAutomatica = (cliente: string, estado: string, contactoCliente: string) => {
    console.log(`[NOTIFICACIÓN ENVIADA] A: ${cliente} (${contactoCliente || 'Sin contacto directo'}). Su ticket ha cambiado al estado: ${estado}.`);
  };

  const actualizarEstadoYFechas = async (id: string, nuevoEstado: string, clienteNombre: string, contacto: string) => {
    const ahora = new Date().toISOString();
    let updateData: any = { estado: nuevoEstado };

    if (nuevoEstado === "En Revisión") updateData.fecha_revision = ahora;
    if (nuevoEstado === "En Proceso") updateData.fecha_proceso = ahora;
    if (nuevoEstado === "Resuelto") updateData.fecha_resuelto = ahora;

    try {
      const { error } = await supabase.from('tickets_mantenimiento').update(updateData).eq('id', id);
      if (error) throw error;

      if (nuevoEstado === "En Proceso" || nuevoEstado === "Resuelto") {
        enviarNotificacionAutomatica(clienteNombre, nuevoEstado, contacto);
      }

      await registrarLog("Cambio de Estado", `Ticket #${id.slice(0, 6)} actualizado a "${nuevoEstado}"`);
      fetchData();
      
      if (ticketSeleccionado && ticketSeleccionado.id === id) {
        setTicketSeleccionado({ ...ticketSeleccionado, ...updateData });
      }
    } catch (err: any) {
      console.error("Error al actualizar estado:", err);
      alert("No se pudo actualizar el estado.");
    }
  };

  const asignarEncargado = async (id: string, nuevoEncargado: string) => {
    try {
      const { error } = await supabase.from('tickets_mantenimiento').update({ encargado_asignado: nuevoEncargado }).eq('id', id);
      if (error) {
      console.error("Detalle del error de Supabase:", error.message, error.details, error.hint);
      alert(`Error de Supabase: ${error.message}`);
      throw error;
    }

    alert("Encargado asignado correctamente.");
    fetchData(); // Recarga los datos de la tabla
  } catch (err: any) {
    console.error("Error al asignar encargado:", err);
  }
};

  // Acciones Masivas
  const aplicarAccionMasiva = async () => {
    if (ticketsSeleccionadosIds.length === 0) {
      alert("Selecciona al menos un ticket.");
      return;
    }

    try {
      let updateData: any = {};
      if (encargadoMasivo) updateData.encargado_asignado = encargadoMasivo;
      if (estadoMasivo) {
        updateData.estado = estadoMasivo;
        const ahora = new Date().toISOString();
        if (estadoMasivo === "En Revisión") updateData.fecha_revision = ahora;
        if (estadoMasivo === "En Proceso") updateData.fecha_proceso = ahora;
        if (estadoMasivo === "Resuelto") updateData.fecha_resuelto = ahora;
      }

      if (Object.keys(updateData).length === 0) {
        alert("Selecciona un encargado o estado para aplicar de forma masiva.");
        return;
      }

      for (const id of ticketsSeleccionadosIds) {
        await supabase.from('tickets_mantenimiento').update(updateData).eq('id', id);
      }

      await registrarLog("Acción Masiva", `Se actualizaron ${ticketsSeleccionadosIds.length} tickets en lote.`);
      setTicketsSeleccionadosIds([]);
      setEncargadoMasivo("");
      setEstadoMasivo("");
      fetchData();
      alert("Acción masiva aplicada con éxito.");
    } catch (err) {
      console.error("Error en acción masiva:", err);
      alert("Hubo un error al ejecutar la acción masiva.");
    }
  };

  const seleccionarTodosCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setTicketsSeleccionadosIds(ticketsFiltrados.map(t => t.id));
    } else {
      setTicketsSeleccionadosIds([]);
    }
  };

  const seleccionarUnCheckbox = (id: string) => {
    if (ticketsSeleccionadosIds.includes(id)) {
      setTicketsSeleccionadosIds(ticketsSeleccionadosIds.filter(item => item !== id));
    } else {
      setTicketsSeleccionadosIds([...ticketsSeleccionadosIds, id]);
    }
  };

  const agregarEncargadoSistema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    try {
      const { error } = await supabase.from('encargados').insert([{
        nombre: nuevoNombre,
        especialidad: nuevaEspecialidad,
        telefono: nuevoTelefono,
        correo: nuevoCorreo
      }]);
      if (error) throw error;

      await registrarLog("Nuevo Encargado", `Se registró al contratista/encargado: ${nuevoNombre}`);
      setNuevoNombre("");
      setNuevoTelefono("");
      setNuevoCorreo("");
      fetchData();
      alert("Encargado registrado exitosamente.");
    } catch (err: any) {
      console.error("Error al registrar encargado:", err);
      alert("Error al guardar el encargado.");
    }
  };

  const subirEvidencia = async (e: React.ChangeEvent<HTMLInputElement>, ticketId: string) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setSubiendoFoto(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${ticketId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('evidencias').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('evidencias').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('tickets_mantenimiento').update({ url_foto_evidencia: publicUrl }).eq('id', ticketId);
      if (updateError) throw updateError;

      await registrarLog("Subida de Evidencia", `Se adjuntó foto de reparación al ticket #${ticketId.slice(0, 6)}`);
      fetchData();
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

  // Generación Automática de Reportes en PDF usando impresión nativa del navegador optimizada
  const generarReportePDF = (ticket: any) => {
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) {
      alert("Por favor permite ventanas emergentes para generar el PDF.");
      return;
    }

    const htmlContenido = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Informe Ejecutivo - Ticket #${ticket.id.slice(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; padding: 40px; margin: 0; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-text { font-size: 22px; font-weight: bold; color: #4f46e5; }
            .sub { font-size: 12px; color: #666; }
            .badge { background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; background: #f9fafb; padding: 20px; border-radius: 10px; }
            .field-label { font-size: 11px; color: #777; text-transform: uppercase; margin-bottom: 3px; }
            .field-value { font-size: 14px; font-weight: bold; color: #111; }
            .section-title { font-size: 14px; font-weight: bold; color: #1e1b4b; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin: 20px 0 10px 0; text-transform: uppercase; }
            .evidencia-img { max-width: 100%; max-height: 300px; border-radius: 8px; border: 1px solid #ccc; margin-top: 10px; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; pt: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-text">CASASUERTES S.A.S.</div>
              <div class="sub">Comité Directivo - Informe Ejecutivo de Garantía y Mantenimiento</div>
            </div>
            <div>
              <span class="badge">Ticket #${ticket.id.slice(0, 8)}</span>
            </div>
          </div>

          <div class="section-title">Datos del Solicitante y Ubicación</div>
          <div class="grid">
            <div>
              <div class="field-label">Cliente</div>
              <div class="field-value">${ticket.nombre_cliente || 'N/A'}</div>
            </div>
            <div>
              <div class="field-label">Proyecto / Apartamento</div>
              <div class="field-value">${ticket.proyecto || ''} - Apto ${ticket.apartamento || ''}</div>
            </div>
            <div>
              <div class="field-label">Tipo de Incidencia</div>
              <div class="field-value">${ticket.tipo_incidencia || 'N/A'}</div>
            </div>
            <div>
              <div class="field-label">Estado Actual</div>
              <div class="field-value">${ticket.estado || 'Pendiente'}</div>
            </div>
            <div>
              <div class="field-label">Encargado Asignado</div>
              <div class="field-value">${ticket.encargado_asignado || 'No asignado'}</div>
            </div>
          </div>

          <div class="section-title">Descripción del Problema</div>
          <p style="font-size: 13px; line-height: 1.5; background: #fff; border: 1px solid #eee; padding: 15px; border-radius: 8px;">
            ${ticket.descripcion || 'Sin descripción detallada.'}
          </p>

          <div class="section-title">Cronología de Tiempos (SLA)</div>
          <ul style="font-size: 13px; line-height: 1.6;">
            <li><strong>Creación del Ticket:</strong> ${ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'N/A'}</li>
            <li><strong>Fecha de Revisión:</strong> ${ticket.fecha_revision ? new Date(ticket.fecha_revision).toLocaleString() : 'Pendiente'}</li>
            <li><strong>Fecha En Proceso:</strong> ${ticket.fecha_proceso ? new Date(ticket.fecha_proceso).toLocaleString() : 'Pendiente'}</li>
            <li><strong>Fecha de Resolución:</strong> ${ticket.fecha_resuelto ? new Date(ticket.fecha_resuelto).toLocaleString() : 'Pendiente'}</li>
          </ul>

          <div class="section-title">Evidencia Fotográfica / Garantía</div>
          ${ticket.url_foto_evidencia ? `<img src="${ticket.url_foto_evidencia}" class="evidencia-img" />` : '<p style="font-size: 12px; color: #777;">No se adjuntó registro fotográfico de evidencia.</p>'}

          <div class="footer">
            Documento generado de forma automática por el portal administrativo de Casasuertes S.A.S. — Válido para archivo legal y auditoría interna.
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    ventanaImpresion.document.write(htmlContenido);
    ventanaImpresion.document.close();
  };

  const ticketsFiltrados = tickets.filter((ticket) => {
    const coincideProyecto = filtroProyecto === "TODOS" || ticket.proyecto === filtroProyecto;
    const coincideEstado = filtroEstado === "TODOS" || ticket.estado === filtroEstado;
    const coincideIncidencia = filtroIncidencia === "TODOS" || ticket.tipo_incidencia === filtroIncidencia;
    
    // Filtro por rango de fechas (Desde / Hasta)
    let coincideFechas = true;
    const fechaCreacionTicket = ticket.created_at ? new Date(ticket.created_at).toISOString().split('T')[0] : "";
    if (fechaDesde && fechaCreacionTicket < fechaDesde) coincideFechas = false;
    if (fechaHasta && fechaCreacionTicket > fechaHasta) coincideFechas = false;

    const coincideBusqueda = 
      ticket.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      ticket.apartamento?.toLowerCase().includes(busqueda.toLowerCase()) ||
      ticket.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    return coincideProyecto && coincideEstado && coincideIncidencia && coincideFechas && coincideBusqueda;
  });

  if (!autenticado) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 shadow-xl rounded-2xl max-w-md w-full p-8 space-y-6">
          <div className="text-center flex flex-col items-center">
            <img src="/logo.png" alt="Casasuertes Logo" className="w-48 h-24 object-contain mb-3" />
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
            {errorLogin && <p className="text-xs text-rose-600 font-medium text-center">Usuario o contraseña incorrectos.</p>}
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md">
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
        
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Casasuertes Logo" className="w-48 h-20 object-contain" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Panel de Administración</h1>
              <p className="text-slate-500 text-sm">Gestión avanzada, SLAs y reportes ejecutivos en PDF.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => setVistaActual('tickets')}
              className={`font-medium px-3 py-2 rounded-xl text-xs transition-all ${vistaActual === 'tickets' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
               Tickets
            </button>
            <button 
              onClick={() => setVistaActual('dashboard')}
              className={`font-medium px-3 py-2 rounded-xl text-xs transition-all ${vistaActual === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
               Dashboard
            </button>
            <button 
              onClick={() => setVistaActual('encargados')}
              className={`font-medium px-3 py-2 rounded-xl text-xs transition-all ${vistaActual === 'encargados' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
               Gestión de Personal
            </button>
            <button 
              onClick={() => setVistaActual('auditoria')}
              className={`font-medium px-3 py-2 rounded-xl text-xs transition-all ${vistaActual === 'auditoria' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
               Auditoría (Logs)
            </button>
            <button onClick={() => setAutenticado(false)} className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium px-3 py-2 rounded-xl text-xs border border-rose-200">
              Salir
            </button>
          </div>
        </div>

        {/* VISTA: GESTIÓN DE ENCARGADOS */}
        {vistaActual === 'encargados' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-lg">Registrar Nuevo Encargado</h3>
              <form onSubmit={agregarEncargadoSistema} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo</label>
                  <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Ej. Carlos Pérez" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Especialidad / Servicio</label>
                  <select value={nuevaEspecialidad} onChange={(e) => setNuevaEspecialidad(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
                    {LISTA_SERVICIOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono / WhatsApp</label>
                  <input type="text" value={nuevoTelefono} onChange={(e) => setNuevoTelefono(e.target.value)} placeholder="+1..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Correo electrónico</label>
                  <input type="email" value={nuevoCorreo} onChange={(e) => setNuevoCorreo(e.target.value)} placeholder="correo@empresa.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md">
                  Guardar Encargado
                </button>
              </form>
            </div>

            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-lg">Personal Registrado en Base de Datos</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase">
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Especialidad</th>
                      <th className="p-3">Contacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {encargados.length === 0 ? (
                      <tr><td colSpan={3} className="p-6 text-center text-slate-400">No hay encargados registrados.</td></tr>
                    ) : (
                      encargados.map(enc => (
                        <tr key={enc.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">{enc.nombre}</td>
                          <td className="p-3"><span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs">{enc.especialidad}</span></td>
                          <td className="p-3 text-xs text-slate-600">{enc.telefono || 'Sin tel'} / {enc.correo || 'Sin correo'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VISTA: AUDITORÍA (LOGS DE ADMIN) */}
        {vistaActual === 'auditoria' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Historial de Actividad Interna (Logs)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase">
                    <th className="p-3">Fecha y Hora</th>
                    <th className="p-3">Administrador</th>
                    <th className="p-3">Acción</th>
                    <th className="p-3">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-slate-400">No hay registros de auditoría.</td></tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 text-xs">
                        <td className="p-3 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="p-3 font-semibold text-slate-900">{log.admin_usuario}</td>
                        <td className="p-3 text-indigo-600 font-bold">{log.accion}</td>
                        <td className="p-3 text-slate-600">{log.detalles}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA: DASHBOARD */}
        {vistaActual === 'dashboard' && (
          <DashboardMetricas tickets={tickets} />
        )}

        {/* VISTA: TICKETS (PRINCIPAL) */}
        {vistaActual === 'tickets' && (
          <>
            {/* Filtros Avanzados y Rango de Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Buscar</label>
                <input type="text" placeholder="Cliente, apartamento..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Proyecto</label>
                <select value={filtroProyecto} onChange={(e) => setFiltroProyecto(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
                  <option value="TODOS">Todos</option>
                  <option value="Torre ALBOR">Torre ALBOR</option>
                  <option value="DOWNTOWN">DOWNTOWN</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Servicio</label>
                <select value={filtroIncidencia} onChange={(e) => setFiltroIncidencia(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
                  <option value="TODOS">Todos</option>
                  {LISTA_SERVICIOS.map((servicio) => (<option key={servicio} value={servicio}>{servicio}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Desde</label>
                <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Hasta</label>
                <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs" />
              </div>
            </div>

            {/* Bandeja de Acciones Masivas */}
            {ticketsSeleccionadosIds.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <span className="text-xs font-bold text-indigo-900">
                  {ticketsSeleccionadosIds.length} ticket(s) seleccionado(s)
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <select 
                    value={encargadoMasivo} 
                    onChange={(e) => setEncargadoMasivo(e.target.value)}
                    className="bg-white border border-indigo-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
                  >
                    <option value="">Asignar encargado en lote...</option>
                    {encargados.map(enc => (
                      <option key={enc.id} value={enc.nombre}>{enc.nombre}</option>
                    ))}
                  </select>
                  <select 
                    value={estadoMasivo} 
                    onChange={(e) => setEstadoMasivo(e.target.value)}
                    className="bg-white border border-indigo-200 rounded-xl px-3 py-1.5 text-xs text-slate-700"
                  >
                    <option value="">Cambiar estado en lote...</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Revisión">En Revisión</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Resuelto">Resuelto</option>
                  </select>
                  <button 
                    onClick={aplicarAccionMasiva}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-1.5 rounded-xl text-xs transition-all shadow-sm"
                  >
                    Aplicar Cambios Lote
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {loading ? (
                <div className="p-12 text-center text-slate-400">Cargando registros...</div>
              ) : ticketsFiltrados.length === 0 ? (
                <div className="p-12 text-center text-slate-400">No hay tickets registrados con estos filtros.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="p-4 w-10">
                          <input 
                            type="checkbox" 
                            onChange={seleccionarTodosCheckbox}
                            checked={ticketsSeleccionadosIds.length === ticketsFiltrados.length && ticketsFiltrados.length > 0}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                          />
                        </th>
                        <th className="p-4 font-semibold">Cliente</th>
                        <th className="p-4 font-semibold">Proyecto / Apto</th>
                        <th className="p-4 font-semibold">Incidencia</th>
                        <th className="p-4 font-semibold">Encargado Asignado</th>
                        <th className="p-4 font-semibold">Estado / SLA</th>
                        <th className="p-4 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {ticketsFiltrados.map((ticket) => {
                        // Cálculo de Alertas Visuales por Vencimiento (SLA)
                        // Si está pendiente y lleva más de 48h o 72h
                        let alertaVencimiento = null;
                        if (ticket.estado !== 'Resuelto' && ticket.created_at) {
                          const horasTranscurridas = (new Date().getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60);
                          if (horasTranscurridas > 72) {
                            alertaVencimiento = <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-md text-[10px] font-bold block mt-1">⚠️ SLA Vencido (&gt;72h)</span>;
                          } else if (horasTranscurridas > 48) {
                            alertaVencimiento = <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md text-[10px] font-bold block mt-1">⚡ Alerta SLA (&gt;48h)</span>;
                          }
                        }

                        return (
                          <tr key={ticket.id} className="hover:bg-slate-50/80 transition-all">
                            <td className="p-4">
                              <input 
                                type="checkbox" 
                                checked={ticketsSeleccionadosIds.includes(ticket.id)}
                                onChange={() => seleccionarUnCheckbox(ticket.id)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                              />
                            </td>
                            <td className="p-4 font-semibold text-slate-900">{ticket.nombre_cliente}</td>
                            <td className="p-4 text-slate-600">{ticket.proyecto} - Apto {ticket.apartamento}</td>
                            <td className="p-4">
                              <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg text-xs font-medium">
                                {ticket.tipo_incidencia}
                              </span>
                            </td>
                            <td className="p-4">
                              <select 
                                value={ticket.encargado_asignado || ""}
                                onChange={(e) => asignarEncargado(ticket.id, e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-40"
                              >
                                <option value="">Seleccionar encargado...</option>
                                {encargados.map(enc => (
                                  <option key={enc.id} value={enc.nombre}>{enc.nombre} ({enc.especialidad})</option>
                                ))}
                              </select>
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
                              {alertaVencimiento}
                            </td>
                            <td className="p-4 text-right space-x-1">
                              <button 
                                onClick={() => { setTicketSeleccionado(ticket); setModalAbierto(true); }}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all border border-slate-200"
                              >
                                Detalle
                              </button>
                              <button 
                                onClick={() => generarReportePDF(ticket)}
                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border border-indigo-200"
                                title="Generar Informe Ejecutivo PDF"
                              >
                                 PDF
                              </button>
                              <select
                                value={ticket.estado || 'Pendiente'}
                                onChange={(e) => actualizarEstadoYFechas(ticket.id, e.target.value, ticket.nombre_cliente, ticket.telefono_cliente || ticket.correo_cliente)}
                                className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-2 py-1.5 text-slate-700 mt-1"
                              >
                                <option value="Pendiente">Pendiente</option>
                                <option value="En Revisión">En Revisión</option>
                                <option value="En Proceso">En Proceso</option>
                                <option value="Resuelto">Resuelto</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal de Detalle */}
        {modalAbierto && ticketSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold">Expediente del Ticket</span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-mono">
                      #{ticketSeleccionado.id.slice(0, 8)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">{ticketSeleccionado.nombre_cliente}</h2>
                </div>
                <button onClick={() => setModalAbierto(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div><span className="text-slate-400 block text-xs">ID / UUID</span><span className="font-mono text-xs text-slate-700">{ticketSeleccionado.id}</span></div>
                <div><span className="text-slate-400 block text-xs">Proyecto</span><span className="font-semibold">{ticketSeleccionado.proyecto}</span></div>
                <div><span className="text-slate-400 block text-xs">Apartamento</span><span className="font-semibold">{ticketSeleccionado.apartamento}</span></div>
                <div><span className="text-slate-400 block text-xs">Encargado</span><span className="font-semibold">{ticketSeleccionado.encargado_asignado || 'No asignado'}</span></div>
                <div><span className="text-slate-400 block text-xs">Incidencia</span><span className="font-semibold">{ticketSeleccionado.tipo_incidencia}</span></div>
              </div>

              <div className="space-y-2 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                <span className="text-indigo-900 text-xs font-bold uppercase tracking-wider block">Evidencia Fotográfica</span>
                {ticketSeleccionado.url_foto_evidencia ? (
                  <a href={ticketSeleccionado.url_foto_evidencia} target="_blank" rel="noopener noreferrer">
                    <img src={ticketSeleccionado.url_foto_evidencia} alt="Evidencia" className="w-full h-40 object-cover rounded-xl border border-indigo-200 shadow-sm" />
                  </a>
                ) : <p className="text-xs text-slate-500">Sin foto de evidencia.</p>}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subir / Cambiar foto:</label>
                  <input type="file" accept="image/*" onChange={(e) => subirEvidencia(e, ticketSeleccionado.id)} disabled={subiendoFoto} className="w-full text-xs text-slate-500 file:py-2 file:px-4 file:rounded-xl file:bg-indigo-600 file:text-white" />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <button 
                  onClick={() => generarReportePDF(ticketSeleccionado)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm"
                >
                   Descargar Informe PDF Ejecutivo
                </button>
                <button onClick={() => setModalAbierto(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium">Cerrar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}