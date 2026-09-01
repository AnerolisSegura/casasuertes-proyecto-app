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

const LISTA_PROPIEDADES = [
  "Downtown Sands",
  "Dominican Fiesta",
  "Marina Residences 73",
  "Casa Golf 234",
  "Vista Marina Residences",
  "Torre Albor"
];

const LISTA_ESTADOS = [
  "Pendiente",
  "En Proceso",
  "Completado",
  "Cancelado"
];

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState<boolean>(false);
  const [usuario, setUsuario] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorLogin, setErrorLogin] = useState<boolean>(false);

  const [vistaActual, setVistaActual] = useState<"tickets" | "dashboard" | "encargados" | "auditoria" | "clientes">("tickets");
  const [tickets, setTickets] = useState<any[]>([]);
  const [encargados, setEncargados] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [clientesDB, setClientesDB] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sub-vista para la sección de encargados/contratistas
  const [subVistaEncargados, setSubVistaEncargados] = useState<"buscar" | "registrar">("buscar");
  const [busquedaEncargadoInput, setBusquedaEncargadoInput] = useState<string>("");
  const [encargadoSeleccionadoId, setEncargadoSeleccionadoId] = useState<string>("");

  const [modoEdicionEncargado, setModoEdicionEncargado] = useState<boolean>(false);
  const [editNombreEnc, setEditNombreEnc] = useState<string>("");
  const [editEspecialidadEnc, setEditEspecialidadEnc] = useState<string>("Electricidad");
  const [editTelefonoEnc, setEditTelefonoEnc] = useState<string>("");
  const [editCorreoEnc, setEditCorreoEnc] = useState<string>("");
  const [editDocumentoEnc, setEditDocumentoEnc] = useState<string>("");
  const [editTarifaEnc, setEditTarifaEnc] = useState<string>("");
  const [editDisponibilidadEnc, setEditDisponibilidadEnc] = useState<string>("Disponible");

  // Sub-vista para clientes ("buscar" o "registrar")
  const [subVistaClientes, setSubVistaClientes] = useState<"buscar" | "registrar">("buscar");
  const [busquedaClienteInput, setBusquedaClienteInput] = useState<string>("");
  const [clienteSeleccionadoDocumento, setClienteSeleccionadoDocumento] = useState<string>("");
  
  const [modoEdicionCliente, setModoEdicionCliente] = useState<boolean>(false);
  const [editNombre, setEditNombre] = useState<string>("");
  const [editTelefono, setEditTelefono] = useState<string>("");
  const [editCorreo, setEditCorreo] = useState<string>("");
  const [editNotas, setEditNotas] = useState<string>("");

  // Estados para registrar nuevo encargado / contratista
  const [nuevoNombre, setNuevoNombre] = useState<string>("");
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState<string>("Electricidad");
  const [nuevoTelefono, setNuevoTelefono] = useState<string>("");
  const [nuevoCorreo, setNuevoCorreo] = useState<string>("");
  const [nuevoDocumento, setNuevoDocumento] = useState<string>("");
  const [nuevaTarifa, setNuevaTarifa] = useState<string>("");
  const [nuevaDisponibilidad, setNuevaDisponibilidad] = useState<string>("Disponible");

  // Estados para registrar nuevo cliente (Soporte multi-propiedad por Cédula/RNC)
  const [cliNombre, setCliNombre] = useState<string>("");
  const [cliDocumento, setCliDocumento] = useState<string>("");
  const [cliCorreo, setCliCorreo] = useState<string>("");
  const [cliTelefono, setCliTelefono] = useState<string>("");
  const [cliProyecto, setCliProyecto] = useState<string>("Torre Albor");
  const [cliApartamento, setCliApartamento] = useState<string>("");
  const [cliFechaEntrega, setCliFechaEntrega] = useState<string>("");
  const [cliNotas, setCliNotas] = useState<string>("");

  const [filtroProyecto, setFiltroProyecto] = useState<string>("TODOS");
  const [filtroIncidencia, setFiltroIncidencia] = useState<string>("TODOS");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");
  const [busqueda, setBusqueda] = useState<string>("");
  
  const [ticketSeleccionado, setTicketSeleccionado] = useState<any | null>(null);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [subiendoImagen, setSubiendoImagen] = useState<boolean>(false);

  const [ticketsSeleccionadosIds, setTicketsSeleccionadosIds] = useState<string[]>([]);

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

  const cambiarEstadoTicket = async (ticketId: string, nuevoEstado: string, historialActual: any[] = []) => {
    const nuevoCambio = {
      estado: nuevoEstado,
      usuario: usuario || "Admin",
      fechaHora: new Date().toLocaleString(),
      descripcion: `Cambio de estado a: ${nuevoEstado}`
    };

    const historialActualizado = [...(historialActual || []), nuevoCambio];

    try {
      const { error } = await supabase
        .from('tickets_mantenimiento')
        .update({ 
          estado: nuevoEstado, 
          historial_estados: historialActualizado 
        })
        .eq('id', ticketId);

      if (error) throw error;
      
      await registrarLog("Cambio de Estado", `Ticket #${ticketId.slice(0, 8)} actualizado a: ${nuevoEstado}`);
      
      if (ticketSeleccionado && ticketSeleccionado.id === ticketId) {
        setTicketSeleccionado({
          ...ticketSeleccionado,
          estado: nuevoEstado,
          historial_estados: historialActualizado
        });
      }

      fetchData();
    } catch (err: any) {
      console.error("Error al actualizar el estado:", err.message);
      alert(`No se pudo actualizar el estado: ${err.message}`);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTickets, resEncargados, resLogs, resClientes] = await Promise.all([
        supabase.from('tickets_mantenimiento').select('*').order('created_at', { ascending: false }),
        supabase.from('encargados').select('*').order('nombre', { ascending: true }),
        supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('clientes').select('*').order('nombre', { ascending: true })
      ]);

      if (resTickets.error) throw resTickets.error;
      setTickets(resTickets.data || []);
      setEncargados(resEncargados.data || []);
      setLogs(resLogs.data || []);
      setClientesDB(resClientes.data || []);
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

  const agregarEncargadoSistema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) {
      alert("El nombre del contratista es obligatorio.");
      return;
    }
    try {
      const { error } = await supabase.from('encargados').insert([{
        nombre: nuevoNombre,
        especialidad: nuevaEspecialidad,
        telefono: nuevoTelefono,
        correo: nuevoCorreo,
        documento: nuevoDocumento,
        tarifa: nuevaTarifa,
        disponibilidad: nuevaDisponibilidad
      }]);
      if (error) throw error;

      await registrarLog("Nuevo Encargado", `Se registró al contratista: ${nuevoNombre} (${nuevaEspecialidad})`);
      setNuevoNombre("");
      setNuevoTelefono("");
      setNuevoCorreo("");
      setNuevoDocumento("");
      setNuevaTarifa("");
      fetchData();
      alert("Contratista / Encargado registrado exitosamente.");
      setSubVistaEncargados("buscar");
    } catch (err: any) {
      console.error("Error al registrar encargado:", err);
      alert(`Error al registrar: ${err.message}`);
    }
  };

  const actualizarEncargadoSistema = async (idEncargado: string) => {
    try {
      const { error } = await supabase.from('encargados').update({
        nombre: editNombreEnc,
        especialidad: editEspecialidadEnc,
        telefono: editTelefonoEnc,
        correo: editCorreoEnc,
        documento: editDocumentoEnc,
        tarifa: editTarifaEnc,
        disponibilidad: editDisponibilidadEnc
      }).eq('id', idEncargado);

      if (error) throw error;

      await registrarLog("Actualización Contratista", `Se actualizaron los datos de: ${editNombreEnc}`);
      setModoEdicionEncargado(false);
      fetchData();
      alert("Información del contratista actualizada correctamente.");
    } catch (err: any) {
      console.error("Error al actualizar contratista:", err);
      alert(`Error al actualizar: ${err.message}`);
    }
  };

  const prepararEdicionEncargado = (enc: any) => {
    setEditNombreEnc(enc.nombre || "");
    setEditEspecialidadEnc(enc.especialidad || "Electricidad");
    setEditTelefonoEnc(enc.telefono || "");
    setEditCorreoEnc(enc.correo || "");
    setEditDocumentoEnc(enc.documento || "");
    setEditTarifaEnc(enc.tarifa || "");
    setEditDisponibilidadEnc(enc.disponibilidad || "Disponible");
    setModoEdicionEncargado(true);
  };

  const registrarClienteSistema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliNombre.trim() || !cliDocumento.trim()) {
      alert("El nombre y la cédula/RNC son obligatorios.");
      return;
    }
    try {
      const { error } = await supabase.from('clientes').insert([{
        nombre: cliNombre,
        documento: cliDocumento,
        correo: cliCorreo,
        telefono: cliTelefono,
        proyecto: cliProyecto,
        apartamento: cliApartamento,
        fecha_entrega: cliFechaEntrega ? cliFechaEntrega : null,
        notas_internas: cliNotas
      }]);

      if (error) throw error;

      await registrarLog("Nueva Propiedad / Cliente", `Se asoció propiedad (${cliProyecto} - Apto ${cliApartamento}) al cliente: ${cliNombre}`);
      setCliNombre("");
      setCliDocumento("");
      setCliCorreo("");
      setCliTelefono("");
      setCliApartamento("");
      setCliFechaEntrega("");
      setCliNotas("");
      fetchData();
      alert("Propiedad / Cliente registrado exitosamente.");
      setSubVistaClientes("buscar");
    } catch (err: any) {
      console.error("Error al registrar cliente:", err);
      alert(`Error al registrar: ${err.message || "Verifica los datos."}`);
    }
  };

  const actualizarClienteSistema = async (docOriginal: string) => {
    try {
      const { error } = await supabase.from('clientes').update({
        nombre: editNombre,
        telefono: editTelefono,
        correo: editCorreo,
        notas_internas: editNotas
      }).eq('documento', docOriginal);

      if (error) throw error;

      await registrarLog("Actualización Cliente", `Se actualizaron los datos generales de la cédula: ${docOriginal}`);
      setModoEdicionCliente(false);
      fetchData();
      alert("Información del cliente actualizada correctamente.");
    } catch (err: any) {
      console.error("Error al actualizar cliente:", err);
      alert(`Error al actualizar: ${err.message}`);
    }
  };

  const prepararEdicion = (cli: any) => {
    setEditNombre(cli.nombre || "");
    setEditTelefono(cli.telefono || "");
    setEditCorreo(cli.correo || "");
    setEditNotas(cli.notas_internas || "");
    setModoEdicionCliente(true);
  };

  const asignarEncargado = async (id: string, encargado: string) => {
    try {
      const { error } = await supabase.from('tickets_mantenimiento').update({ encargado_asignado: encargado }).eq('id', id);
      if (error) throw error;
      
      await registrarLog("Asignación de Encargado", `Ticket #${id.slice(0, 6)} asignado a ${encargado}`);
      fetchData();
    } catch (err: any) {
      console.error("Error al asignar encargado:", err);
    }
  };

  const manejarSubidaImagenEvidencia = async (e: React.ChangeEvent<HTMLInputElement>, ticketId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoImagen(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${ticketId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('evidencias').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('evidencias').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('tickets_mantenimiento')
        .update({ url_foto_evidencia: publicUrl })
        .eq('id', ticketId);

      if (updateError) throw updateError;

      const ticketActualizado = { ...ticketSeleccionado, url_foto_evidencia: publicUrl };
      setTicketSeleccionado(ticketActualizado);
      await registrarLog("Subida de Evidencia", `Se adjuntó imagen de evidencia al ticket #${ticketId.slice(0, 8)}`);
      fetchData();
      alert("Imagen de evidencia cargada y guardada correctamente.");
    } catch (err: any) {
      console.error("Error al subir la imagen:", err);
      alert(`No se pudo cargar la imagen: ${err.message || "Verifica el bucket de Storage en Supabase."}`);
    } finally {
      setSubiendoImagen(false);
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

  const generarReportePDF = async (ticket: any) => {
    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) return;

    // Consulta previa a la base de datos para extraer el registro completo de auditoría o historial asociado al ticket
    let historialCompleto = ticket.historial_estados || [];
    try {
      const { data, error } = await supabase
        .from('tickets_mantenimiento')
        .select('historial_estados')
        .eq('id', ticket.id)
        .single();
      
      if (!error && data && data.historial_estados) {
        historialCompleto = data.historial_estados;
      }
    } catch (err) {
      console.error("Error al consultar historial actualizado para el PDF:", err);
    }

    const imagenSrc = ticket.url_foto_evidencia || ticket.imagen_url || ticket.imagen || ticket.url_imagen || '';

    // Renderizado dinámico de filas para la tabla del historial de cambios
    let filasHistorialHTML = '';
    if (historialCompleto && historialCompleto.length > 0) {
      filasHistorialHTML = historialCompleto.map((h: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px;">${h.fechaHora || 'N/A'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px;">${h.usuario || 'Sistema / Admin'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px;">${h.descripcion || h.estado || 'Modificación registrada'}</td>
        </tr>
      `).join('');
    } else {
      filasHistorialHTML = `
        <tr>
          <td colspan="3" style="padding: 12px; text-align: center; color: #777; font-size: 12px; font-style: italic;">
            Sin modificaciones registradas (Estado inicial).
          </td>
        </tr>
      `;
    }

    const htmlContenido = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Informe Ejecutivo - Ticket #${ticket.id.slice(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; padding: 40px; margin: 0; display: flex; flex-direction: column; min-height: 90vh; }
            .content-wrapper { flex: 1; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-text { font-size: 22px; font-weight: bold; color: #4f46e5; }
            .badge { background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; background: #f9fafb; padding: 20px; border-radius: 10px; }
            .field-label { font-size: 11px; color: #777; text-transform: uppercase; margin-bottom: 3px; }
            .field-value { font-size: 14px; font-weight: bold; color: #111; }
            .section-title { font-size: 14px; font-weight: bold; color: #1e1b4b; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin: 20px 0 10px 0; text-transform: uppercase; }
            .descripcion-box { background: #fff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; font-size: 13px; line-height: 1.5; }
            .img-container { margin-top: 15px; }
            .img-container img { max-width: 300px; max-height: 300px; border-radius: 8px; border: 1px solid #ddd; }
            table.historial-table { width: 100%; border-collapse: collapse; margin-top: 10px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
            table.historial-table th { background: #f3f4f6; color: #374151; font-size: 11px; text-transform: uppercase; text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb; }
            /* Pie de página oficial requerido */
            .footer-institucional { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center; font-size: 11px; color: #6b7280; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="content-wrapper">
            <div class="header">
              <div>
                <div class="logo-text">CASASUERTES S.A.S.</div>
                <div style="font-size: 12px; color: #666;">Informe Ejecutivo de Garantía y Mantenimiento</div>
              </div>
              <div><span class="badge">Ticket #${ticket.id.slice(0, 8)}</span></div>
            </div>

            <div class="section-title">Información del Cliente e Inmueble</div>
            <div class="grid">
              <div><div class="field-label">Cliente</div><div class="field-value">${ticket.nombre_cliente || 'N/A'}</div></div>
              <div><div class="field-label">Proyecto / Apartamento</div><div class="field-value">${ticket.proyecto || ''} - Apto ${ticket.apartamento || ''}</div></div>
              <div><div class="field-label">Correo / Contacto</div><div class="field-value">${ticket.cliente_correo || ticket.telefono || 'N/A'}</div></div>
              <div><div class="field-label">Fecha de Reporte</div><div class="field-value">${ticket.created_at ? new Date(ticket.created_at).toLocaleString() : 'N/A'}</div></div>
            </div>

            <div class="section-title">Detalles de la Incidencia</div>
            <div class="grid">
              <div><div class="field-label">Tipo de Servicio</div><div class="field-value">${ticket.tipo_incidencia || 'N/A'}</div></div>
              <div><div class="field-label">Estado Actual</div><div class="field-value">${ticket.estado || 'Pendiente'}</div></div>
              <div><div class="field-label">Encargado Asignado</div><div class="field-value">${ticket.encargado_asignado || 'Sin asignar'}</div></div>
            </div>

            <div class="section-title">Descripción del Problema</div>
            <div class="descripcion-box">${ticket.descripcion || 'Sin descripción provista.'}</div>

            <!-- Historial de cambios dinámico (Estructura de tabla con fecha, usuario y descripción) -->
            <div class="section-title">Historial de Modificaciones y Auditoría</div>
            <table class="historial-table">
              <thead>
                <tr>
                  <th>Fecha y Hora</th>
                  <th>Usuario</th>
                  <th>Descripción del Cambio</th>
                </tr>
              </thead>
              <tbody>
                ${filasHistorialHTML}
              </tbody>
            </table>

            ${imagenSrc ? `
              <div class="section-title">Evidencia Fotográfica</div>
              <div class="img-container">
                <img src="${imagenSrc}" alt="Evidencia del ticket" />
              </div>
            ` : '<div class="section-title">Evidencia Fotográfica</div><p style="font-size: 12px; color: #777;">Aún no hay imágenes adjuntas.</p>'}
          </div>

          <!-- Pie de página institucional requerido -->
          <div class="footer-institucional">
            Documento generado por la administracion de CASASUERTES S.A.S
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    ventanaImpresion.document.write(htmlContenido);
    ventanaImpresion.document.close();
  };

  const ticketsFiltrados = tickets.filter((ticket) => {
    const coincideProyecto = filtroProyecto === "TODOS" || ticket.proyecto === filtroProyecto;
    const coincideIncidencia = filtroIncidencia === "TODOS" || ticket.tipo_incidencia === filtroIncidencia;
    let coincideFechas = true;
    const fechaCreacionTicket = ticket.created_at ? new Date(ticket.created_at).toISOString().split('T')[0] : "";
    if (fechaDesde && fechaCreacionTicket < fechaDesde) coincideFechas = false;
    if (fechaHasta && fechaCreacionTicket > fechaHasta) coincideFechas = false;

    const coincideBusqueda = 
      ticket.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
      ticket.apartamento?.toLowerCase().includes(busqueda.toLowerCase()) ||
      ticket.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    return coincideProyecto && coincideIncidencia && coincideFechas && coincideBusqueda;
  });

  const clientesAgrupadosMap = clientesDB.reduce((acc: any, cli: any) => {
    const docKey = cli.documento || cli.correo || cli.nombre;
    if (!acc[docKey]) {
      acc[docKey] = {
        nombre: cli.nombre,
        documento: cli.documento || 'No especificado',
        correo: cli.correo || 'Sin correo',
        telefono: cli.telefono || 'Sin tel',
        notas_internas: cli.notas_internas || '',
        propiedades: []
      };
    }
    acc[docKey].propiedades.push({
      id: cli.id,
      proyecto: cli.proyecto || 'Torre Albor',
      apartamento: cli.apartamento || 'N/A',
      fecha_entrega: cli.fecha_entrega
    });
    return acc;
  }, {});

  const listaClientesUnicos = Object.values(clientesAgrupadosMap);

  const clientesFiltradosBusqueda = listaClientesUnicos.filter((cli: any) => 
    cli.nombre?.toLowerCase().includes(busquedaClienteInput.toLowerCase()) ||
    cli.documento?.toLowerCase().includes(busquedaClienteInput.toLowerCase()) ||
    cli.correo?.toLowerCase().includes(busquedaClienteInput.toLowerCase()) ||
    cli.propiedades.some((p: any) => p.apartamento?.toLowerCase().includes(busquedaClienteInput.toLowerCase()) || p.proyecto?.toLowerCase().includes(busquedaClienteInput.toLowerCase()))
  );

  const encargadosFiltradosBusqueda = encargados.filter(enc =>
    enc.nombre?.toLowerCase().includes(busquedaEncargadoInput.toLowerCase()) ||
    enc.especialidad?.toLowerCase().includes(busquedaEncargadoInput.toLowerCase()) ||
    enc.correo?.toLowerCase().includes(busquedaEncargadoInput.toLowerCase())
  );

  if (!autenticado) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50 rounded-2xl max-w-md w-full p-8 md:p-10 space-y-8">
          
          <div className="text-center flex flex-col items-center">
            <div className="mb-5 flex justify-center">
              <img src="/logo.png" alt="Logo Casasuertes" className="h-20 w-auto object-contain" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Portal Administrativo</h1>
            <p className="text-xs text-slate-500 mt-1 font-normal">Ingrese sus credenciales corporativas para continuar.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-600">Usuario</label>
              <div>
                <input 
                  type="text" 
                  value={usuario} 
                  onChange={(e) => setUsuario(e.target.value)} 
                  placeholder="usuario_admin"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-600">Contraseña</label>
              <div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all" 
                  required 
                />
              </div>
            </div>

            {errorLogin && (
              <div className="bg-red-50/80 border border-red-200 rounded-xl p-3 text-center">
                <p className="text-xs text-red-600 font-medium">Credenciales incorrectas. Verifique sus datos.</p>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-medium py-2.5 rounded-xl text-sm shadow-sm transition-all duration-150 flex items-center justify-center gap-2"
            >
              <span>Acceder</span>
            </button>
          </form>

          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-normal">Casasuertes S.A.S. • Gestión y Garantías</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Logo Casasuertes" className="h-8 object-contain" />
            <div className="border-l-2 border-slate-200 pl-4">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">Panel de Administración</h1>
              <span className="text-xs text-slate-500">Casasuertes S.A.S.</span>
            </div>
          </div>

          <nav className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl overflow-x-auto max-w-full">
            <button onClick={() => setVistaActual('tickets')} className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${vistaActual === 'tickets' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}> Tickets</button>
            <button onClick={() => setVistaActual('dashboard')} className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${vistaActual === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}> Dashboard</button>
            <button onClick={() => setVistaActual('clientes')} className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${vistaActual === 'clientes' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}> Base de Clientes</button>
            <button onClick={() => setVistaActual('encargados')} className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${vistaActual === 'encargados' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}> Personal</button>
            <button onClick={() => setVistaActual('auditoria')} className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${vistaActual === 'auditoria' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}> Auditoría</button>
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Sesión: <strong>Admin</strong></span>
            <button onClick={() => setAutenticado(false)} className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-4 py-2 rounded-xl text-xs border border-rose-200 transition-all"> Salir</button>
          </div>
        </header>

        {vistaActual === 'encargados' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Directorio de Personal y Contratistas</h2>
                  <p className="text-xs text-slate-500">Busca, consulta expedientes detallados, actualiza tarifas y especialidades o registra nuevos técnicos.</p>
                </div>
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => { setSubVistaEncargados('buscar'); setModoEdicionEncargado(false); }} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${subVistaEncargados === 'buscar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>🔍 Buscar / Gestionar Contratista</button>
                  <button onClick={() => { setSubVistaEncargados('registrar'); setModoEdicionEncargado(false); }} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${subVistaEncargados === 'registrar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>➕ Registrar Nuevo Contratista</button>
                </div>
              </div>

              {subVistaEncargados === 'buscar' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Filtrar por nombre, especialidad o correo</label>
                      <input type="text" value={busquedaEncargadoInput} onChange={(e) => setBusquedaEncargadoInput(e.target.value)} placeholder="Ej. Carlos Pérez o Electricidad..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white transition-all"/>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Contratistas Encontrados ({encargadosFiltradosBusqueda.length})</span>
                      <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
                        {encargadosFiltradosBusqueda.length === 0 ? (
                          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4">
                            <p className="text-xs text-slate-500 mb-2">No se encontró ningún contratista.</p>
                            <button onClick={() => setSubVistaEncargados('registrar')} className="text-indigo-600 font-semibold text-xs hover:underline">+ Registrar nuevo contratista ahora</button>
                          </div>
                        ) : (
                          encargadosFiltradosBusqueda.map((enc) => (
                            <div key={enc.id} onClick={() => { setEncargadoSeleccionadoId(enc.id); setModoEdicionEncargado(false); }} className={`p-3.5 cursor-pointer rounded-2xl border transition-all ${encargadoSeleccionadoId === enc.id ? 'bg-indigo-50/70 border-indigo-300 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                              <div className="flex justify-between items-start">
                                <p className="font-bold text-xs text-slate-900">{enc.nombre}</p>
                                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-semibold">{enc.especialidad}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">{enc.telefono || 'Sin tel'} • {enc.correo || 'Sin correo'}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    {encargadoSeleccionadoId ? (() => {
                      const encInfo = encargados.find(e => e.id === encargadoSeleccionadoId);
                      const ticketsAsignadosEnc = tickets.filter(t => t.encargado_asignado === encInfo?.nombre);
                      return (
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-5">
                          {!modoEdicionEncargado ? (
                            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Expediente de Contratista</span>
                                  <h3 className="text-base font-bold text-slate-900 mt-1">{encInfo?.nombre}</h3>
                                </div>
                                <button onClick={() => prepararEdicionEncargado(encInfo)} className="bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-semibold px-3.5 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5"> Actualizar Información</button>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div><span className="text-slate-400 block uppercase text-[10px] font-semibold">Especialidad Principal</span><span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded inline-block mt-0.5">{encInfo?.especialidad}</span></div>
                                <div><span className="text-slate-400 block uppercase text-[10px] font-semibold">Disponibilidad</span><span className="font-medium text-emerald-700">{encInfo?.disponibilidad || 'Disponible'}</span></div>
                                <div><span className="text-slate-400 block uppercase text-[10px] font-semibold">Teléfono de Contacto</span><span className="font-medium text-slate-800">{encInfo?.telefono || 'No registrado'}</span></div>
                                <div><span className="text-slate-400 block uppercase text-[10px] font-semibold">Correo Electrónico</span><span className="font-medium text-slate-800">{encInfo?.correo || 'No registrado'}</span></div>
                                <div><span className="text-slate-400 block uppercase text-[10px] font-semibold">Cédula o RNC</span><span className="font-medium text-slate-800">{encInfo?.documento || 'No especificado'}</span></div>
                                <div><span className="text-slate-400 block uppercase text-[10px] font-semibold">Tarifa / Honorarios</span><span className="font-medium text-slate-800">{encInfo?.tarifa ? `$${encInfo.tarifa}` : 'No especificada'}</span></div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white p-5 rounded-xl border border-indigo-200 space-y-4 shadow-md">
                              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold text-indigo-900"> Editando Contratista: {encInfo?.nombre}</h3>
                                <button onClick={() => setModoEdicionEncargado(false)} className="text-xs text-slate-400 hover:text-slate-600 font-semibold">Cancelar</button>
                              </div>
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nombre Completo</label>
                                    <input type="text" value={editNombreEnc} onChange={(e) => setEditNombreEnc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Especialidad</label>
                                    <select value={editEspecialidadEnc} onChange={(e) => setEditEspecialidadEnc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                                      {LISTA_SERVICIOS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Teléfono</label>
                                    <input type="text" value={editTelefonoEnc} onChange={(e) => setEditTelefonoEnc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Correo Electrónico</label>
                                    <input type="email" value={editCorreoEnc} onChange={(e) => setEditCorreoEnc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cédula / RNC</label>
                                    <input type="text" value={editDocumentoEnc} onChange={(e) => setEditDocumentoEnc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tarifa</label>
                                    <input type="text" value={editTarifaEnc} onChange={(e) => setEditTarifaEnc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Disponibilidad</label>
                                    <select value={editDisponibilidadEnc} onChange={(e) => setEditDisponibilidadEnc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                                      <option value="Disponible">Disponible</option>
                                      <option value="En Ruta / Ocupado">En Ruta / Ocupado</option>
                                      <option value="Inactivo">Inactivo</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                  <button onClick={() => setModoEdicionEncargado(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold">Cancelar</button>
                                  <button onClick={() => actualizarEncargadoSistema(encInfo.id)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm">Guardar Cambios</button>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Historial de Tickets Asignados ({ticketsAsignadosEnc.length})</h4>
                            <div className="max-h-[200px] overflow-y-auto space-y-2">
                              {ticketsAsignadosEnc.length > 0 ? (
                                ticketsAsignadosEnc.map((tk: any) => (
                                  <div key={tk.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-sm">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-bold text-indigo-600">#{tk.id.slice(0, 8)} - {tk.tipo_incidencia}</span>
                                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">{tk.estado || 'Pendiente'}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 m-0">Cliente: {tk.nombre_cliente} ({tk.proyecto} - Apto {tk.apartamento})</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-slate-400 italic py-6 text-center bg-white rounded-xl border border-slate-200">Este contratista no tiene tickets asignados actualmente.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })() : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-16 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 space-y-2">
                        <span className="text-3xl"> </span>
                        <p className="text-sm font-semibold text-slate-600">Ningún contratista seleccionado</p>
                        <p className="text-xs max-w-xs">Selecciona un miembro del personal de la lista izquierda para consultar su información extendida.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {subVistaEncargados === 'registrar' && (
                <div className="max-w-xl mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">Formulario de Registro de Nuevo Contratista</h3>
                    <p className="text-xs text-slate-500">Agrega un nuevo técnico o especialista con sus datos fiscales y de contacto.</p>
                  </div>
                  <form onSubmit={agregarEncargadoSistema} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo *</label>
                      <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Ej. Carlos Pérez" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Especialidad</label>
                        <select value={nuevaEspecialidad} onChange={(e) => setNuevaEspecialidad(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs">
                          {LISTA_SERVICIOS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono</label>
                        <input type="text" value={nuevoTelefono} onChange={(e) => setNuevoTelefono(e.target.value)} placeholder="+1..." className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Correo Electrónico</label>
                        <input type="email" value={nuevoCorreo} onChange={(e) => setNuevoCorreo(e.target.value)} placeholder="carlosperez@gmail.com" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Cédula o RNC</label>
                        <input type="text" value={nuevoDocumento} onChange={(e) => setNuevoDocumento(e.target.value)} placeholder="Ej. 001-XXXXXXX-X" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Tarifa por Servicio / Hora</label>
                        <input type="text" value={nuevaTarifa} onChange={(e) => setNuevaTarifa(e.target.value)} placeholder="Ej. 1500" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Disponibilidad</label>
                        <select value={nuevaDisponibilidad} onChange={(e) => setNuevaDisponibilidad(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs">
                          <option value="Disponible">Disponible</option>
                          <option value="En Ruta / Ocupado">En Ruta / Ocupado</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setSubVistaEncargados('buscar')} className="w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-all">Cancelar</button>
                      <button type="submit" className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow-sm transition-all">Guardar Contratista</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {vistaActual === 'clientes' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Directorio de Propietarios y Múltiples Propiedades</h2>
                  <p className="text-xs text-slate-500">Gestiona propietarios agrupados por su Cédula/RNC con capacidad de registrar más de una unidad habitacional.</p>
                </div>
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => { setSubVistaClientes('buscar'); setModoEdicionCliente(false); }} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${subVistaClientes === 'buscar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>🔍 Buscar / Gestionar Propietario</button>
                  <button onClick={() => { setSubVistaClientes('registrar'); setModoEdicionCliente(false); }} className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${subVistaClientes === 'registrar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>➕ Registrar Propiedad / Cliente</button>
                </div>
              </div>

              {subVistaClientes === 'buscar' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-5 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Filtrar por nombre, cédula o apartamento</label>
                      <input type="text" value={busquedaClienteInput} onChange={(e) => setBusquedaClienteInput(e.target.value)} placeholder="Ej. Ana Mercedes, Cédula o Apto..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:bg-white transition-all"/>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Propietarios Encontrados ({clientesFiltradosBusqueda.length})</span>
                      <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
                        {clientesFiltradosBusqueda.length === 0 ? (
                          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4">
                            <p className="text-xs text-slate-500 mb-2">No se encontró ningún propietario.</p>
                            <button onClick={() => setSubVistaClientes('registrar')} className="text-indigo-600 font-semibold text-xs hover:underline">+ Registrar nueva propiedad ahora</button>
                          </div>
                        ) : (
                          clientesFiltradosBusqueda.map((cli: any) => (
                            <div key={cli.documento} onClick={() => { setClienteSeleccionadoDocumento(cli.documento); setModoEdicionCliente(false); }} className={`p-3.5 cursor-pointer rounded-2xl border transition-all ${clienteSeleccionadoDocumento === cli.documento ? 'bg-indigo-50/70 border-indigo-300 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                              <div className="flex justify-between items-start">
                                <p className="font-bold text-xs text-slate-900">{cli.nombre}</p>
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-semibold">{cli.propiedades.length} Inmueble(s)</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">Cédula: {cli.documento} • Tel: {cli.telefono}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    {clienteSeleccionadoDocumento ? (() => {
                      const clienteInfo: any = listaClientesUnicos.find((c: any) => c.documento === clienteSeleccionadoDocumento);
                      const ticketsCliente = tickets.filter(t => t.cliente_correo === clienteInfo?.correo || t.nombre_cliente === clienteInfo?.nombre);
                      return (
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-5">
                          {!modoEdicionCliente ? (
                            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
                              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Expediente Multi-Propiedad</span>
                                  <h3 className="text-base font-bold text-slate-900 mt-1">{clienteInfo?.nombre}</h3>
                                </div>
                                <button onClick={() => prepararEdicion(clienteInfo)} className="bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-semibold px-3.5 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5">  Actualizar Datos Personales</button>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div><span className="text-slate-400 block uppercase text-[10px] font-semibold">Cédula / RNC</span><span className="font-medium text-slate-800">{clienteInfo?.documento}</span></div>
                                <div><span className="text-slate-400 block uppercase text-[10px] font-semibold">Correo Electrónico</span><span className="font-medium text-slate-800">{clienteInfo?.correo}</span></div>
                                <div><span className="text-slate-400 block uppercase text-[10px] font-semibold">Teléfono de Contacto</span><span className="font-medium text-slate-800">{clienteInfo?.telefono}</span></div>
                                <div><span className="text-slate-400 block uppercase text-[10px] font-semibold">Notas Internas</span><span className="font-medium text-slate-800">{clienteInfo?.notas_internas || 'Sin notas'}</span></div>
                              </div>
                              <div className="border-t border-slate-100 pt-3">
                                <span className="text-[11px] font-bold uppercase text-slate-500 block mb-2">Inmuebles Vinculados ({clienteInfo?.propiedades.length})</span>
                                <div className="space-y-2">
                                  {clienteInfo?.propiedades.map((prop: any) => (
                                    <div key={prop.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs">
                                      <div><span className="font-bold text-indigo-700">{prop.proyecto}</span> - <span className="text-slate-700 font-semibold">Apto {prop.apartamento}</span></div>
                                      <span className="text-[10px] text-slate-400">Entrega: {prop.fecha_entrega ? new Date(prop.fecha_entrega).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-white p-5 rounded-xl border border-indigo-200 space-y-4 shadow-md">
                              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold text-indigo-900"> Editando Propietario: {clienteInfo?.nombre}</h3>
                                <button onClick={() => setModoEdicionCliente(false)} className="text-xs text-slate-400 hover:text-slate-600 font-semibold">Cancelar</button>
                              </div>
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nombre Completo</label>
                                    <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Teléfono</label>
                                    <input type="text" value={editTelefono} onChange={(e) => setEditTelefono(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Correo Electrónico</label>
                                    <input type="email" value={editCorreo} onChange={(e) => setEditCorreo(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Notas Internas</label>
                                    <input type="text" value={editNotas} onChange={(e) => setEditNotas(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs" />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                  <button onClick={() => setModoEdicionCliente(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold">Cancelar</button>
                                  <button onClick={() => actualizarClienteSistema(clienteInfo.documento)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm">Guardar Cambios</button>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Historial de Tickets Asociados ({ticketsCliente.length})</h4>
                            <div className="max-h-[200px] overflow-y-auto space-y-2">
                              {ticketsCliente.length > 0 ? (
                                ticketsCliente.map((tk: any) => (
                                  <div key={tk.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-sm">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-bold text-indigo-600">#{tk.id.slice(0, 8)} - {tk.tipo_incidencia}</span>
                                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">{tk.estado || 'Pendiente'}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 m-0">Inmueble: {tk.proyecto} - Apto {tk.apartamento}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-slate-400 italic py-6 text-center bg-white rounded-xl border border-slate-200">Este propietario no cuenta con reportes activos.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })() : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-16 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 space-y-2">
                        <span className="text-3xl"> </span>
                        <p className="text-sm font-semibold text-slate-600">Ningún propietario seleccionado</p>
                        <p className="text-xs max-w-xs">Selecciona un cliente de la lista izquierda para visualizar todas sus propiedades e historial de tickets.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {subVistaClientes === 'registrar' && (
                <div className="max-w-xl mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="border-b border-slate-200 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">Registrar Nueva Propiedad / Propietario</h3>
                    <p className="text-xs text-slate-500">Si el cliente ya existe, usa su misma Cédula/RNC para añadir una propiedad adicional.</p>
                  </div>
                  <form onSubmit={registrarClienteSistema} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo *</label>
                        <input type="text" value={cliNombre} onChange={(e) => setCliNombre(e.target.value)} placeholder="Ej. Ana Mercedes" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Cédula o RNC * (Llave Única)</label>
                        <input type="text" value={cliDocumento} onChange={(e) => setCliDocumento(e.target.value)} placeholder="Ej. 001-XXXXXXX-X" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Correo Electrónico</label>
                        <input type="email" value={cliCorreo} onChange={(e) => setCliCorreo(e.target.value)} placeholder="anamercedes@gmail.com" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Teléfono</label>
                        <input type="text" value={cliTelefono} onChange={(e) => setCliTelefono(e.target.value)} placeholder="+1..." className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Proyecto</label>
                        <select value={cliProyecto} onChange={(e) => setCliProyecto(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs">
                          {LISTA_PROPIEDADES.map((p) => (<option key={p} value={p}>{p}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Apartamento / Unidad</label>
                        <input type="text" value={cliApartamento} onChange={(e) => setCliApartamento(e.target.value)} placeholder="Ej. 402" className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha de Entrega</label>
                        <input type="date" value={cliFechaEntrega} onChange={(e) => setCliFechaEntrega(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Notas Internas</label>
                        <input type="text" value={cliNotas} onChange={(e) => setCliNotas(e.target.value)} placeholder="Observaciones..." className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs" />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setSubVistaClientes('buscar')} className="w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-all">Cancelar</button>
                      <button type="submit" className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs shadow-sm transition-all">Guardar Inmueble</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {vistaActual === 'auditoria' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Historial de Actividad (Logs)</h3>
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase">
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Admin</th>
                  <th className="p-3">Acción</th>
                  <th className="p-3">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 text-xs">
                    <td className="p-3 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-3 font-semibold text-slate-900">{log.admin_usuario}</td>
                    <td className="p-3 text-indigo-600 font-bold">{log.accion}</td>
                    <td className="p-3 text-slate-600">{log.detalles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {vistaActual === 'dashboard' && (
          <DashboardMetricas  />
        )}

        {vistaActual === 'tickets' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Buscar</label>
                <input type="text" placeholder="Cliente, apartamento..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Proyecto</label>
                <select value={filtroProyecto} onChange={(e) => setFiltroProyecto(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
                  <option value="TODOS">Todos</option>
                  {LISTA_PROPIEDADES.map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Servicio</label>
                <select value={filtroIncidencia} onChange={(e) => setFiltroIncidencia(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
                  <option value="TODOS">Todos</option>
                  {LISTA_SERVICIOS.map((s) => (<option key={s} value={s}>{s}</option>))}
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

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="p-4 w-10">
                        <input type="checkbox" onChange={seleccionarTodosCheckbox} checked={ticketsSeleccionadosIds.length === ticketsFiltrados.length && ticketsFiltrados.length > 0} className="rounded border-slate-300 text-indigo-600" />
                      </th>
                      <th className="p-4 font-semibold">Cliente</th>
                      <th className="p-4 font-semibold">Proyecto / Apto</th>
                      <th className="p-4 font-semibold">Incidencia</th>
                      <th className="p-4 font-semibold">Encargado Asignado</th>
                      <th className="p-4 font-semibold">Estado</th>
                      <th className="p-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {ticketsFiltrados.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <input type="checkbox" checked={ticketsSeleccionadosIds.includes(ticket.id)} onChange={() => seleccionarUnCheckbox(ticket.id)} className="rounded border-slate-300 text-indigo-600" />
                        </td>
                        <td className="p-4 font-semibold text-slate-900">{ticket.nombre_cliente}</td>
                        <td className="p-4 text-slate-600">{ticket.proyecto} - Apto {ticket.apartamento}</td>
                        <td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs">{ticket.tipo_incidencia}</span></td>
                        <td className="p-4">
                          <select value={ticket.encargado_asignado || ""} onChange={(e) => asignarEncargado(ticket.id, e.target.value)} className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2 py-1.5 w-40">
                            <option value="">Seleccionar...</option>
                            {encargados.map(enc => <option key={enc.id} value={enc.nombre}>{enc.nombre}</option>)}
                          </select>
                        </td>
                        <td className="p-4">
                          <select 
                            value={ticket.estado || "Pendiente"} 
                            onChange={(e) => cambiarEstadoTicket(ticket.id, e.target.value, ticket.historial_estados)}
                            className={`text-xs rounded-xl px-2.5 py-1.5 font-semibold border transition-all ${
                              ticket.estado === 'Completado' || ticket.estado === 'Resuelto' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              ticket.estado === 'En Proceso' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                              ticket.estado === 'Cancelado' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {LISTA_ESTADOS.map(est => (
                              <option key={est} value={est}>{est}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button onClick={() => { setTicketSeleccionado(ticket); setModalAbierto(true); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl text-xs">Detalle</button>
                          <button onClick={() => generarReportePDF(ticket)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-xl text-xs">PDF</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      </div>

      {modalAbierto && ticketSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Detalle del Ticket</span>
                <h3 className="text-base font-bold text-slate-900 mt-1">#{ticketSeleccionado.id.slice(0, 8)} - {ticketSeleccionado.tipo_incidencia}</h3>
              </div>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl items-center">
              <div><span className="text-slate-400 block uppercase font-semibold">Cliente</span><span className="font-bold text-slate-800">{ticketSeleccionado.nombre_cliente}</span></div>
              <div><span className="text-slate-400 block uppercase font-semibold">Inmueble</span><span className="font-bold text-slate-800">{ticketSeleccionado.proyecto} - Apto {ticketSeleccionado.apartamento}</span></div>
              
              <div>
                <span className="text-slate-400 block uppercase font-semibold mb-1">Estado Actual</span>
                <select 
                  value={ticketSeleccionado.estado || "Pendiente"} 
                  onChange={(e) => cambiarEstadoTicket(ticketSeleccionado.id, e.target.value, ticketSeleccionado.historial_estados)}
                  className="bg-white border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 font-bold text-indigo-600 shadow-sm w-full"
                >
                  {LISTA_ESTADOS.map(est => (
                    <option key={est} value={est}>{est}</option>
                  ))}
                </select>
              </div>

              <div><span className="text-slate-400 block uppercase font-semibold">Encargado</span><span className="font-bold text-slate-800">{ticketSeleccionado.encargado_asignado || 'Sin asignar'}</span></div>
              <div className="col-span-2"><span className="text-slate-400 block uppercase font-semibold">Fecha de Creación</span><span className="font-bold text-slate-800">{ticketSeleccionado.created_at ? new Date(ticketSeleccionado.created_at).toLocaleString() : 'N/A'}</span></div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50/50">
              <span className="text-xs font-bold uppercase text-slate-700 block">Historial de Cambios de Estado</span>
              {ticketSeleccionado.historial_estados && ticketSeleccionado.historial_estados.length > 0 ? (
                <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                  {ticketSeleccionado.historial_estados.map((hist: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                      <span className="font-semibold text-indigo-700"> {hist.estado}</span>
                      <span className="text-[11px] text-slate-400">{hist.fechaHora}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-white p-3 rounded-xl border border-dashed border-slate-200 text-center">Sin registros de cambios anteriores (Estado inicial).</p>
              )}
            </div>

            <div>
              <span className="text-xs font-bold uppercase text-slate-500 block mb-1">Descripción de la Incidencia</span>
              <p className="text-xs text-slate-700 bg-white border border-slate-200 p-3 rounded-xl">{ticketSeleccionado.descripcion || 'Sin descripción detallada.'}</p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-slate-700">Evidencia Fotográfica</span>
                <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all flex items-center gap-1">
                  {subiendoImagen ? 'Subiendo...' : ' Cargar Imagen'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => manejarSubidaImagenEvidencia(e, ticketSeleccionado.id)} 
                    disabled={subiendoImagen}
                  />
                </label>
              </div>

              {(ticketSeleccionado.url_foto_evidencia || ticketSeleccionado.imagen_url || ticketSeleccionado.imagen || ticketSeleccionado.url_imagen) ? (
                <div className="flex gap-2 overflow-x-auto py-2">
                  <a href={ticketSeleccionado.url_foto_evidencia || ticketSeleccionado.imagen_url || ticketSeleccionado.imagen || ticketSeleccionado.url_imagen} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={ticketSeleccionado.url_foto_evidencia || ticketSeleccionado.imagen_url || ticketSeleccionado.imagen || ticketSeleccionado.url_imagen} 
                      alt="Evidencia del ticket" 
                      className="h-32 object-cover rounded-xl border border-slate-200 hover:opacity-90 transition-all shadow-sm" 
                    />
                  </a>
                </div>
              ) : (
                <div className="text-center py-6 bg-white rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 italic">Aún no hay imágenes adjuntas para este ticket.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setModalAbierto(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}