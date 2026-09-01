'use client';

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LISTA_PROYECTOS = [
  "Downtown Sands",
  "Dominican Fiesta",
  "Marina Residences 73",
  "Casa Golf 234",
  "Vista Marina Residences",
  "Torre Albor"
];

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

export default function MantenimientoPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [documento, setDocumento] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [apartamento, setApartamento] = useState("");
  const [tipoIncidencia, setTipoIncidencia] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proyecto) {
      alert("Por favor selecciona un proyecto.");
      return;
    }
    if (!tipoIncidencia) {
      alert("Por favor selecciona un tipo de incidencia o servicio.");
      return;
    }

    setEnviando(true);
    try {
      const { error } = await supabase.from("tickets_mantenimiento").insert([
        {
          nombre_cliente: nombre,
          email_cliente: email,
          documento_cliente: documento,
          proyecto,
          apartamento,
          tipo_incidencia: tipoIncidencia,
          descripcion,
          estado: "Pendiente"
        }
      ]);

      if (error) throw error;
      setExito(true);
      setNombre("");
      setEmail("");
      setDocumento("");
      setProyecto("");
      setApartamento("");
      setTipoIncidencia("");
      setDescripcion("");
    } catch (err) {
      console.error(err);
      alert("Error al enviar el reporte.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-4">
        {/* Botón de retorno grande y visible */}
        <div>
          <Link 
            href="/" 
            className="w-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold py-3 px-4 rounded-2xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <span className="text-base">&larr;</span> Volver al Portal General
          </Link>
        </div>

        <div className="bg-white border border-slate-200 shadow-xl rounded-3xl w-full p-8 space-y-6">
          <div className="text-center flex flex-col items-center">
            <img 
              src="/logo.png" 
              alt="Casasuertes Logo" 
              className="w-48 h-20 object-contain mb-3" 
            />
            <h1 className="text-2xl font-bold text-slate-900">Módulo de Mantenimiento</h1>
            <p className="text-sm text-slate-500 mt-1">Reporta cualquier incidencia de tu unidad inmobiliaria.</p>
          </div>

          {exito ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-3">
              <h3 className="text-lg font-bold text-emerald-800">¡Reporte Enviado con Éxito!</h3>
              <p className="text-sm text-emerald-600">Nuestro equipo de post-entrega y mantenimiento de Casasuertes ha recibido tu solicitud y la atenderá a la brevedad.</p>
              <button 
                onClick={() => setExito(false)}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md"
              >
                Enviar otro reporte
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Carlos Pérez"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Correo Electrónico (Para Notificaciones)</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Cédula / Documento de Identidad</label>
                <input 
                  type="text" 
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="Ej. 001-0000000-1"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Proyecto</label>
                <select 
                  value={proyecto}
                  onChange={(e) => setProyecto(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="" disabled>Selecciona un proyecto...</option>
                  {LISTA_PROYECTOS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Número de Apartamento / Unidad</label>
                <input 
                  type="text" 
                  value={apartamento}
                  onChange={(e) => setApartamento(e.target.value)}
                  placeholder="Ej. 102"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Tipo de Incidencia / Servicio</label>
                <select 
                  value={tipoIncidencia}
                  onChange={(e) => setTipoIncidencia(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="" disabled>Selecciona un servicio...</option>
                  {LISTA_SERVICIOS.map((servicio) => (
                    <option key={servicio} value={servicio}>{servicio}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Descripción del Problema</label>
                <textarea 
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Detalla los detalles de la avería..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required 
                />
              </div>

              <button 
                type="submit"
                disabled={enviando}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
              >
                {enviando ? "Enviando..." : "Enviar Reporte"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}