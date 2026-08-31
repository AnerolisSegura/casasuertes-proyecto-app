"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// PINs rápidos predefinidos para los ingenieros / técnicos en campo
const TECNICOS_VALIDOS: { [pin: string]: string } = {
  "1234": "Ing. Carlos Mendoza",
  "5678": "Ing. Sofía Reyes",
  "9999": "Ing. Roberto Gómez"
};

const ESTADOS_DISPONIBLES = ["Pendiente", "En Revisión", "En Proceso", "Resuelto"];

export default function PanelIngenieroPage() {
  const [pin, setPin] = useState("");
  const [tecnicoLogueado, setTecnicoLogueado] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const nombreTecnico = TECNICOS_VALIDOS[pin.trim()];
    if (!nombreTecnico) {
      alert("PIN incorrecto. Intenta con 1234, 5678 o 9999.");
      return;
    }

    setTecnicoLogueado(nombreTecnico);
    setPin("");
    await cargarTareas(nombreTecnico);
  };

  const cargarTareas = async (nombre: string) => {
    setLoading(true);
    try {
      // Filtramos los tickets asignados a este ingeniero (puedes ajustar el campo según tu BD)
      const { data, error } = await supabase
        .from("tickets_mantenimiento")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (err) {
      console.error(err);
      alert("Error al cargar las tareas.");
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstadoYFoto = async (ticketId: number, nuevoEstado: string, archivo: File | null) => {
    setActualizandoId(ticketId);
    try {
      let urlFoto = null;

      // Si se seleccionó una foto o se tomó con la cámara del celular
      if (archivo) {
        const fileName = `evidencia_${ticketId}_${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from("evidencias")
          .upload(fileName, archivo);

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from("evidencias")
          .getPublicUrl(fileName);

        urlFoto = publicURLData.publicUrl;
      }

      const updateData: any = { estado: nuevoEstado };
      if (urlFoto) {
        updateData.url_foto_evidencia = urlFoto;
      }

      const { error: updateError } = await supabase
        .from("tickets_mantenimiento")
        .update(updateData)
        .eq("id", ticketId);

      if (updateError) throw updateError;

      alert("¡Tarea actualizada con éxito!");
      await cargarTareas(tecnicoLogueado);
    } catch (err) {
      console.error(err);
      alert("Error al actualizar la tarea.");
    } finally {
      setActualizandoId(null);
    }
  };

  if (!tecnicoLogueado) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-800 shadow-2xl rounded-3xl max-w-sm w-full p-8 space-y-6 text-center">
          <img src="/logo.png" alt="Casasuertes Logo" className="w-40 h-16 object-contain mx-auto mb-2" />
          <h1 className="text-xl font-bold text-slate-900">Portal Técnico Móvil</h1>
          <p className="text-xs text-slate-500">Ingresa tu PIN de acceso rápido para ver tus asignaciones en campo.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN (ej. 1234)"
              className="w-full text-center tracking-widest text-lg bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required 
            />
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-md"
            >
              Ingresar al Panel
            </button>
          </form>
          <div className="text-[10px] text-slate-400">
            PINs de prueba: 1234 (Carlos), 5678 (Sofía), 9999 (Roberto)
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 p-4 max-w-md mx-auto space-y-4">
      {/* Header móvil */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Técnico en Campo</span>
          <h2 className="text-sm font-bold text-slate-900">{tecnicoLogueado}</h2>
        </div>
        <button 
          onClick={() => setTecnicoLogueado("")}
          className="text-xs bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1.5 rounded-xl font-semibold"
        >
          Salir
        </button>
      </div>

      {/* Listado de Tareas */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase text-slate-500 px-1">Tareas Asignadas / Reportes</h3>

        {loading ? (
          <div className="text-center py-10 text-slate-400 text-sm">Cargando tareas...</div>
        ) : tickets.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-slate-400 text-sm border border-slate-200">
            No hay reportes registrados en el sistema.
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-100">
                    {ticket.tipo_incidencia}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">{ticket.proyecto} — Apto {ticket.apartamento}</h4>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {ticket.estado}
                </span>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <b>Descripción:</b> {ticket.descripcion}
              </p>

              {/* Controles para cambiar estado y subir foto desde el celular */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-slate-500 w-24">Cambiar Estado:</label>
                  <select 
                    defaultValue={ticket.estado}
                    id={`estado-${ticket.id}`}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    {ESTADOS_DISPONIBLES.map(est => (
                      <option key={est} value={est}>{est}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-semibold text-slate-500 w-24">Foto Evidencia:</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    id={`foto-${ticket.id}`}
                    className="flex-1 text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>

                <button 
                  disabled={actualizandoId === ticket.id}
                  onClick={() => {
                    const selectEl = document.getElementById(`estado-${ticket.id}`) as HTMLSelectElement;
                    const fileInput = document.getElementById(`foto-${ticket.id}`) as HTMLInputElement;
                    const nuevoEst = selectEl.value;
                    const archivo = fileInput.files?.[0] || null;
                    actualizarEstadoYFoto(ticket.id, nuevoEst, archivo);
                  }}
                  className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl text-xs transition-all shadow-sm disabled:opacity-50"
                >
                  {actualizandoId === ticket.id ? "Guardando cambios..." : "Guardar Actualización y Foto"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}